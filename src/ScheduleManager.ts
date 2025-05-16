import { Context, h } from 'koishi'
import { } from 'koishi-plugin-markdown-to-image-service'

import { Config } from './config'
import { newMessage } from './type'
import { file } from './file'
import { source } from './source'
import { Diff } from './diff'

export class ScheduleManager {
    private static timer: NodeJS.Timeout
    private static lastCheckTime = 0
    private static ctx: Context
    private static cfg: Config
    private static fileInstance: file

    static start(ctx: Context, cfg: Config, fileInstance: file) {
        this.ctx = ctx
        this.cfg = cfg
        this.fileInstance = fileInstance
        // 添加日志记录
        ctx.logger('dwrg').info('定时推送服务已启动')
        ScheduleManager.timer = setInterval(() => ScheduleManager.checkUpdate(), cfg.schedule_intervals * 1000)
    }

    static stop() {
        if (this.timer) {
            clearInterval(this.timer)
            this.ctx.logger('dwrg').info('定时推送服务已停止')
        }
    }

    private static async checkUpdate() {
        const now = Date.now()
        if (now - this.lastCheckTime < this.cfg.schedule_intervals * 1000) return
        this.lastCheckTime = now

        try {
            const messages = await ScheduleManager.getUpdate()
            if (!messages.length) return
            for (const message of messages) {

                if (!message.isNew) {
                    this.ctx.logger('dwrg').debug('公告没有更新，跳过推送')
                    continue
                }

                for (const channelId of this.cfg.schedule_channels) {
                    let resMessage = ''
                    switch (channelId.resType) {
                        case 'all':
                            resMessage = message.message
                            break
                        case 'increment':
                            const diff = Diff.myersDiff(message.oldMessage, message.message)
                            for (const item of diff) {
                                if (item.type === 'insert' && item.value !== '') {
                                    resMessage += item.value + '\n'
                                }
                                if (item.type === 'delete' && item.value !== '') {
                                    resMessage += '~~' + item.value + '~~' + '\n'
                                }
                                if (item.type === 'modify') {
                                    resMessage += '~~' + item.oldValue + '~~' + '\n' + item.newValue + '\n'
                                }
                            }
                            console.log(resMessage)
                            break
                    }
                    const image = await this.ctx.markdownToImage.convertToImage(resMessage)
                    await this.ctx.bots[0].sendMessage(channelId.id, h.image(image, 'image/png'))
                    this.ctx.logger('dwrg').info(`已推送消息到频道 ${channelId}`)
                }
            }
        } catch (error) {
            this.ctx.logger('dwrg').error('定时推送失败:', error)
        }
    }

    static async getUpdate(): Promise<newMessage[]> {
        // 根据config的配置获取新公告
        let message: newMessage[] = []
        if (this.cfg.source.includes('updateNotice')) {
            const res = await source.getNotice(this.ctx)
            const oldNotice = await this.fileInstance.getFile('updateNotice')
            const isNew = res!== oldNotice
            message.push({
                type: 'updateNotice',
                isNew: isNew,
                message: res,
                oldMessage: oldNotice,
                time: Date.now()
            })
            await this.fileInstance.updateFile('updateNotice', res)
        }
        if (this.cfg.source.includes('testUpdateNotice')) {
            const res = await source.getTestNotice(this.ctx)
            const oldNotice = await this.fileInstance.getFile('testUpdateNotice')
            const isNew = res !== oldNotice
            message.push({
                type: 'testUpdateNotice',
                isNew: isNew,
                message: res,
                oldMessage: oldNotice,
                time: Date.now()
            })
            await this.fileInstance.updateFile('testUpdateNotice', res)
        }
        return message
    }

}