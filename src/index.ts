import { Context, h } from 'koishi'
import { } from 'koishi-plugin-markdown-to-image-service';

import { source } from './source'
import { ScheduleManager } from './ScheduleManager';
import { file } from './file'
import { Config } from './config'
import path from 'path'

export const name = 'dwrg'
let fileInstance: file
export const inject = {
  require: ['http', 'markdownToImage']
}
export {Config}

const sourceInstance = new source()

export function apply(ctx: Context, cfg: Config) {
  fileInstance = new file(path.join(ctx.baseDir, 'data', 'dwrg'))

  if (cfg.schedule_enable && cfg.schedule_channels.length) {
    const manager = new ScheduleManager(ctx, cfg, fileInstance)
    manager.start()
    // 插件卸载时停止定时任务
    ctx.on('dispose', () => manager.stop())
  }

  ctx.command('dw').action(async ({ session }) => {
    const message = await sourceInstance.getNotice(ctx)
    const imageBuffer = await ctx.markdownToImage.convertToImage(message);
    session.send(h.image(imageBuffer, 'image/png'))
  })

  ctx.command('dwts').action(async ({ session }) => {
    const message = await sourceInstance.getTestNotice(ctx)
    const imageBuffer = await ctx.markdownToImage.convertToImage(message);
    session.send(h.image(imageBuffer, 'image/png'))
  })
}