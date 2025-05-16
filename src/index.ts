import { Context, h } from 'koishi'
import { } from 'koishi-plugin-markdown-to-image-service';

import { registerCommand } from './command';
import { ScheduleManager } from './ScheduleManager';
import { file } from './file'
import { Diff } from './diff'
import { Config } from './config'
import path from 'path'

export const name = 'dwrg'
let fileInstance: file
export const inject = {
  require: ['http', 'markdownToImage']
}
export {Config}

export function apply(ctx: Context, cfg: Config) {
  fileInstance = new file(path.join(ctx.baseDir, 'data', 'dwrg'))

  if (cfg.schedule_enable && cfg.schedule_channels.length) {
    ScheduleManager.start(ctx, cfg, fileInstance)
    // 插件卸载时停止定时任务
    ctx.on('dispose', () => ScheduleManager.stop())
  }

  registerCommand(ctx)

  ctx.command('ts').action(async ({ session }) => {
    const oldAnnouncement = await ctx.http.get('http://111.231.134.81/test.txt')
    const newAnnouncement = await ctx.http.get('http://111.231.134.81/test2.txt')
    const result = Diff.myersDiff(oldAnnouncement, newAnnouncement);
    // 筛选出type不为equal的元素
    const filteredResult = result.filter(item => item.type !== 'equal');
    console.log(filteredResult)

    // session.send(message)
  })
}