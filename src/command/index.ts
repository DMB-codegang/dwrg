import { Bot, Context } from 'koishi'
import { registerCommand_dw } from './dw'
import { registerCommand_dwts } from './dwts'

export function registerCommand(ctx: Context, bot: Bot) {
  registerCommand_dw(ctx, bot)
  registerCommand_dwts(ctx, bot)
}