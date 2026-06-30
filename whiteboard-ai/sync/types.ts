import { Editor } from 'tldraw'
export type BoardRecord = Parameters<Editor['store']['put']>[0][number];
export type SyncOperation =
  | {
      id: string
      type: "create"
      record: BoardRecord
      version: number
    }
  | {
      id: string
      type: "update"
      record: BoardRecord
      version: number
    }
  | {
      id: string
      type: "delete"
      recordId: BoardRecord['id']
      version: number
    }