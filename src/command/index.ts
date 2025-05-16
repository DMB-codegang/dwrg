import { Context } from 'koishi'
import { registerCommand_dw } from './dw'
import { registerCommand_dwts } from './dwts'

export function registerCommand(ctx: Context) {
  registerCommand_dw(ctx)
  registerCommand_dwts(ctx)
}