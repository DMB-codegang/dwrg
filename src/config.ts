import { Schema } from 'koishi'
import { sourceType } from './type'

export interface Config {
    // 消息来源
    source: sourceType[]
    schedule_enable: boolean
    schedule_intervals: number // 检查间隔
    schedule_channels: string[] // 推送频道列表
  }
  
  export const Config: Schema<Config> = Schema.intersect([
    Schema.object({
      source: Schema.array(
        Schema.union([
          Schema.const('updateNotice').description('第五人格官方公告'),
          Schema.const('testUpdateNotice').description('第五人格共研服公告'),
        ])
      ).description('消息来源').default([]).role('checkbox'),
    }).description('基本配置'),
    Schema.object({
      schedule_enable: Schema.boolean().default(false).description('启用定时推送'),
      schedule_intervals: Schema.number().default(60).description('检查间隔(秒)'),
      schedule_channels: Schema.array(String).description('推送频道ID列表').default([])
    }).description('定时推送配置')
  ])