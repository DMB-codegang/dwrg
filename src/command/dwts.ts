import { Context, h } from 'koishi'
import { source } from '../source'

export function registerCommand_dwts(ctx: Context) {
    ctx.command('dwts').action(async ({ session }) => {
        const message = await source.getTestNotice(ctx)
        const imageBuffer = await ctx.markdownToImage.convertToImage(message);
        session.send(h.image(imageBuffer, 'image/png'))
    })
}
