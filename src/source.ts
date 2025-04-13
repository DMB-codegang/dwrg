import { Context } from 'koishi'


export class source {

    /**
     * 
     * @param ctx 
     * @returns 将返回markdown格式的字符串
     */
    async getNotice(ctx: Context): Promise<string> {
        let res = await ctx.http.get('https://h55.update.netease.com/h55_notice_version2.txt')
        // 替换标题标签
        res = res
            .replace(/<t>(.*?)<\/t>/g, '# $1\n\n')
            .replace(/<t1>(.*?)<\/t1>/g, '## $1\n\n')
            .replace(/<t2>(.*?)<\/t2>/g, '### $1\n\n')
            .replace(/<t3>(.*?)<\/t3>/g, '#### $1\n\n')
            .replace(/<te>(.*?)<\/te>/g, '> **$1**\n\n');

        // 替换内容标签和列表项
        res = res
            .replace(/<c1>(.*?)<\/c1>/g, '$1\n')
            .replace(/<c2>(.*?)<\/c2>/g, '> $1\n\n')
            .replace(/<l2>(.*?)<\/l2>/g, '- $1\n')
            .replace(/<l3>(.*?)<\/l3>/g, '  - $1\n');

        // 替换表格标签
        res = res
            .replace(/<tt1>(.*?)<\/tt1>/g, '\n**$1**\n\n')
            .replace(/<tt2>(.*?)<\/tt2>/g, '| $1 |\n| --- |')
            .replace(/<tc>(.*?)<\/tc>/g, '| $1 |');

        // 处理颜色标记
        res = res.replace(/#c([0-9a-f]{6})(.*?)#n/g, '<span style="color:#$1">$2</span>');

        return res
    }

}