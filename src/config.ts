import { Schema } from 'koishi'
import { sourceType } from './type'

type channelsType = {
  id: string
  resType: 'all' | 'increment'// 推送方法类型(全量更新与增量更新)
  remark: string // 备注
}

export interface Config {
  // 消息来源
  source: sourceType[]
  schedule_enable: boolean
  schedule_intervals?: number // 检查间隔
  schedule_channels?: channelsType[] // 推送频道列表
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
  }).description('定时推送配置'),
  Schema.union([
    Schema.object({
      schedule_enable: Schema.const(true).required(),
      schedule_intervals: Schema.number().default(60).description('检查间隔(秒)'),
      schedule_channels: Schema.array(
        Schema.object({
          id: Schema.string().description('频道ID'),
          resType: Schema.union([
            Schema.const('all').description('全量更新'),
            Schema.const('increment').description('增量更新').experimental()
          ]).description('推送方法类型'),
          remark: Schema.string().description('备注')
        })
      ).description('推送频道列表').role('table')
    }),
    Schema.object({
      schedule_enable: Schema.const(false),
    })
  ])
])

