import { Context, h } from 'koishi'
import { Config } from './config'
import { newMessage, sourceType } from './type'
import { file } from './file'
import { source } from './source'

export class ScheduleManager {
    private timer: NodeJS.Timeout
    private lastCheckTime = 0
    private sourceInstance = new source()

    constructor(private ctx: Context, private cfg: Config, private fileInstance: file) { }

    start() {
        // 添加日志记录
        this.ctx.logger('dwrg').info('定时推送服务已启动')
        this.timer = setInterval(() => this.checkUpdate(), this.cfg.schedule_intervals * 1000)
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer)
            this.ctx.logger('dwrg').info('定时推送服务已停止')
        }
    }

    private async checkUpdate() {
        const now = Date.now()
        if (now - this.lastCheckTime < this.cfg.schedule_intervals * 1000) return
        this.lastCheckTime = now

        try {
            const messages = await this.getUpdate(this.ctx, this.cfg)
            if (!messages.length) return
            for (const message of messages) {

                if (!message.isNew) {
                    this.ctx.logger('dwrg').debug('公告没有更新，跳过推送')
                    continue
                }

                for (const channelId of this.cfg.schedule_channels) {
                    const image = await this.ctx.markdownToImage.convertToImage(message.message)
                    await this.ctx.bots[0].sendMessage(channelId, h.image(image, 'image/png'))
                    this.ctx.logger('dwrg').info(`已推送消息到频道 ${channelId}`)
                }
            }
        } catch (error) {
            this.ctx.logger('dwrg').error('定时推送失败:', error)
        }
    }

    async getUpdate(ctx: Context, cfg: Config): Promise<newMessage[]> {
        // 根据config的配置获取新公告
        let message: newMessage[] = []
        if (cfg.source.includes('updateNotice')) {
            const res = await this.sourceInstance.getNotice(ctx)
            const isNew = res !== await this.fileInstance.getFile('updateNotice')
            message.push({
                type: 'updateNotice',
                isNew: isNew,
                message: res,
                time: Date.now()
            })
            await this.fileInstance.updateFile('updateNotice', res)
        }
        if (cfg.source.includes('testUpdateNotice')) {
            const res = await this.sourceInstance.getTestNotice(ctx)
            const isNew = res !== await this.fileInstance.getFile('testUpdateNotice')
            message.push({
                type: 'testUpdateNotice',
                isNew: isNew,
                message: res,
                time: Date.now()
            })
            await this.fileInstance.updateFile('testUpdateNotice', res)
        }
        return message
    }

}