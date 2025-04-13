import { Context, Schema, h } from 'koishi'
import { } from 'koishi-plugin-puppeteer'
import { } from 'koishi-plugin-markdown-to-image-service';
import fs from 'fs'
import { source } from './source'
import path from 'path'

export const name = 'dwrg'
let dataDir: string
export const inject = {
  require: ['http', 'markdownToImage']
}

const sourceInstance = new source()

interface newMessage {
  type: ('updateNotice' | 'bilibiliVedio' | 'bilibiliMessage')
  isNew: boolean
  message: any
  time: number
}

export interface Config {
  // 消息来源
  source: ('updateNotice' | 'bilibiliVedio' | 'bilibiliMessage')[]
  // Vedio_isfilterPigFactoryVideos: boolean // 是否过滤皮格厂视频 
  schedule_enable: boolean
  schedule_intervals: number // 检查间隔
  schedule_channels: string[] // 推送频道列表
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    source: Schema.array(
      Schema.union([
        Schema.const('updateNotice').description('第五人格官方公告'),
        Schema.const('bilibiliVedio').description('第五人格b站视频(需要puppeteer)').disabled(),
        Schema.const('bilibiliMessage').description('第五人格b站动态(需要puppeteer)').disabled(),
      ])
    ).description('消息来源').default([]).role('checkbox'),
    // Vedio_isfilterPigFactoryVideos: Schema.boolean().default(true).description('是否过滤皮格厂视频'),
  }).description('基本配置'),
  Schema.object({
    schedule_enable: Schema.boolean().default(false).description('启用定时推送'),
    schedule_intervals: Schema.number().default(30).description('检查间隔(秒)'),
    schedule_channels: Schema.array(String).description('推送频道ID列表').default([])
  }).description('定时推送配置')
])

async function getUpdate(ctx: Context, cfg: Config): Promise<newMessage[]> {
  // 根据config的配置获取新公告
  let message: newMessage[] = []
  if (cfg.source.includes('updateNotice')) {
    const res = await sourceInstance.getNotice(ctx)
    const isNew = res !== fs.readFileSync(path.join(dataDir, 'updateNotice.txt'), 'utf-8')
    message.push({
      type: 'updateNotice',
      isNew: isNew,
      message: res,
      time: Date.now()
    })
    fs.writeFileSync(path.join(dataDir, 'updateNotice.txt'), res, 'utf-8')
  }
  return message
}

export function apply(ctx: Context, cfg: Config) {
  dataDir = path.join(ctx.baseDir, 'data', 'dwrg')
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  if (!fs.existsSync(path.join(dataDir, 'updateNotice.txt'))) fs.writeFileSync(path.join(dataDir, 'updateNotice.txt'), '初始化成功', 'utf-8')

  if (cfg.schedule_enable && cfg.schedule_channels.length) {
    const manager = new ScheduleManager(ctx, cfg)
    manager.start()
    
    // 插件卸载时停止定时任务
    ctx.on('dispose', () => manager.stop())
  }

  ctx.command('dw').action(async ({ session }) => {
    const message = await getUpdate(ctx, cfg)
    const imageBuffer = await ctx.markdownToImage.convertToImage(message[0].message);
    session.send(h.image(imageBuffer, 'image/png'))
  })
}

class ScheduleManager {
  private timer: NodeJS.Timeout
  private lastCheckTime = 0

  constructor(private ctx: Context, private cfg: Config) {}

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
      const messages = await getUpdate(this.ctx, this.cfg)
      if (!messages.length) return
      if (!messages[0].isNew){
        this.ctx.logger('dwrg').debug('公告没有更新，跳过推送')
        return
      }
      
      for (const channelId of this.cfg.schedule_channels) {
          const image = await this.ctx.markdownToImage.convertToImage(messages[0].message)
          await this.ctx.bots[0].sendMessage(channelId, h.image(image, 'image/png'))
          this.ctx.logger('dwrg').info(`已推送消息到频道 ${channelId}`)
      }
    } catch (error) {
      this.ctx.logger('dwrg').error('定时推送失败:', error)
    }
  }
}