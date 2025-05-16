import { Context, h } from 'koishi'
import { source } from '../source'

export function registerCommand_dw(ctx: Context) {
    ctx.command('dw').action(async ({ session }) => {
        const message = await source.getNotice(ctx)
        const imageBuffer = await ctx.markdownToImage.convertToImage(message);
        session.send(h.image(imageBuffer, 'image/png'))
    })
}
