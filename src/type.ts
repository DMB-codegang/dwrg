export const sourceType = ['updateNotice', 'testUpdateNotice'] as const
export type sourceType = typeof sourceType[number]

export interface newMessage {
    type: sourceType
    isNew: boolean
    message: any
    time: number
  }