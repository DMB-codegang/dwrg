import { Context } from 'koishi'
import { } from 'koishi-plugin-markdown-to-image-service';

import { registerCommand } from './command';
import { ScheduleManager } from './ScheduleManager';
import { file } from './file'
import { Config } from './config'
import path from 'path'

export const name = 'dwrg'
let fileInstance: file
export const inject = ['http', 'markdownToImage']
export {Config}

export function apply(ctx: Context, cfg: Config) {
  fileInstance = new file(path.join(ctx.baseDir, 'data', 'dwrg'))

  if (cfg.schedule_enable && cfg.schedule_channels.length) {
    ScheduleManager.start(ctx, cfg, fileInstance)
    // 插件卸载时停止定时任务
    ctx.on('dispose', () => ScheduleManager.stop())
  }

  registerCommand(ctx)
}