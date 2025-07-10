import { Context, h } from 'koishi'
import { source } from '../source'

export function registerCommand_dwts(ctx: Context) {
    try{
    ctx.command('dwts').action(async ({ session }) => {
        const message = await source.getTestNotice(ctx)
        const imageBuffer = await ctx.markdownToImage.convertToImage(message);
        session.send(h.image(imageBuffer, 'image/png'))
    })
    } catch(error) {
        ctx.logger('dwrg').error('被动发送共研服服消息失败：', error)
    }
}
