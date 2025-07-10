import { Context } from 'koishi'

export class source {
    /**
     * @param ctx 
     * @returns 将返回markdown格式的字符串
     */
    static async getNotice(ctx: Context): Promise<string> {
        let res: string = await ctx.http.get('https://h55.update.netease.com/h55_notice_version2.txt')
        // 在文本中</t>前插入字符串（正式服）
        res = res.replace(/<\/t>/g, '（正式服）</t>')
        res = await this.NoticeToMarkdown_v2(res)
        return res
    }

    static async getTestNotice(ctx: Context): Promise<string> {
        let res: string = await ctx.http.get('https://h55.update.netease.com/h55_notice_gongyan_version2.txt')
        res = res.replace(/<\/t>/g, '（共研服）</t>')
        res = await this.NoticeToMarkdown_v2(res)
        return res
    }

    static async NoticeToMarkdown_v2(notice: string): Promise<string> {

        // 合并 <te> 和紧随其后的 <c2> 为同一个引用块
        let res = notice.replace(/<te>(.*?)<\/te>\s*<c2>(.*?)<\/c2>/gs, (match, p1, p2) => {
            return `> **${p1}**\n> ${p2.trim()}\n`;
        });

        // 替换标题标签
        res = res
            .replace(/<t>(.*?)<\/t>/g, '# $1\n\n')
            .replace(/<t1>(.*?)<\/t1>/g, '## $1\n\n')
            .replace(/<t2>(.*?)<\/t2>/g, '### $1\n\n')
            .replace(/<t3>(.*?)<\/t3>/g, '#### $1\n\n')
            .replace(/<te>(.*?)<\/te>/g, '> **$1**\n\n');

        // 替换内容标签和列表项
        res = res
            .replace(/<c1>(.*?)<\/c1>/gs, '$1\n')
            .replace(/<c1>([^<]*?)(\n|$)/g, '$1\n')
            .replace(/<c2>(.*?)<\/c2>/gs, '> $1\n')

        // 替换表格标签
        res = res
            .replace(/<tt1>(.*?)<\/tt1>/g, '\n**$1**\n\n')
            .replace(/<tt2>(.*?)<\/tt2>/g, '| $1 |\n| --- |')
            .replace(/<tc>(.*?)<\/tc>/g, '| $1 |');

        // 替换列表项
        res = res
            .replace(/<l2>(.*?)(\n|$)/g, '$1\n');

        // 处理颜色标记
        res = res.replace(/#c([0-9a-f]{6})(.*?)#n/g, '<span style="color:#$1">**$2**</span>');

        return res;
    }
}