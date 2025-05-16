export const sourceType = ['updateNotice', 'testUpdateNotice'] as const
export type sourceType = typeof sourceType[number]

export interface newMessage {
  type: sourceType
  isNew: boolean
  message: any
  oldMessage: any
  time: number
}

export type DiffItem = 
  | { type: 'equal', value: string }
  | { type: 'insert', value: string }
  | { type: 'delete', value: string }
  | { type: 'modify', oldValue: string, newValue: string };