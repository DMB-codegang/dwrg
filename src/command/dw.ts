import { Bot, Context, h } from 'koishi'
import { source } from '../source'

export function registerCommand_dw(ctx: Context, bot: Bot) {
    ctx.command('dw').action(async ({ session }) => {
        try {
            const message = await source.getNotice(ctx)
            const imageBuffer = await ctx.markdownToImage.convertToImage(message);
            session.send(h.image(imageBuffer, 'image/png'))
        } catch (error) {
            ctx.logger('dwrg').error('被动发送正式服消息失败：', error)
        }
    })
}
