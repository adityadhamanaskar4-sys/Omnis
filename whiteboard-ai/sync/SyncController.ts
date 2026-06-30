import { HocuspocusProvider } from "@hocuspocus/provider";
import { BoardRecord, SyncOperation } from "./types";
import { Editor, TLRecord } from "tldraw";
import * as Y from 'yjs'
import { useEffect, useRef } from "react";

type SyncControllerArgs = {
    boardStore: {
        ydoc: Y.Doc
        setRecord: (record: BoardRecord) => void
        deleteRecord: (recordId: string) => void
        getRecord: (id: string) => TLRecord | undefined
        getAllRecords: () => TLRecord[]
        hydrateEditor: (editor: Editor) => void
    }
    queue: {
        enqueue: (op: SyncOperation) => void
        flush: () => void
        observe: (listener: (ops: SyncOperation[]) => void) => () => void
    }
    transport: {
        provider: HocuspocusProvider
        connect: (callback: () => void) => () => void
        disconnect: (callback: () => void) => () => void
        destroy: () => void
    }
    editor: Editor | null
}

export default function useSyncController({ boardStore, queue, transport, editor }: SyncControllerArgs) {
    const applyingRemoteUpdates = useRef(false)
    const localOperationIds = useRef(new Set<string>())
    const hydratedEditor = useRef(false)

    useEffect(() => {
        if (!editor) {
            return
        }

        if (!hydratedEditor.current) {
            boardStore.hydrateEditor(editor)
            hydratedEditor.current = true
        }

        const stopListeningToEditor = editor.store.listen(
            ({ changes }) => {
                if (applyingRemoteUpdates.current) {
                    return
                }

                const version = Date.now()

                boardStore.ydoc.transact(() => {
                    for (const record of Object.values(changes.added) as TLRecord[]) {
                        const id = crypto.randomUUID()
                        localOperationIds.current.add(id)
                        boardStore.setRecord(record)
                        queue.enqueue({
                            id,
                            type: 'create',
                            record,
                            version,
                        })
                    }

                    for (const change of Object.values(changes.updated) as Array<[TLRecord, TLRecord]>) {
                        const updatedRecord = change[1]
                        const id = crypto.randomUUID()
                        localOperationIds.current.add(id)
                        boardStore.setRecord(updatedRecord)
                        queue.enqueue({
                            id,
                            type: 'update',
                            record: updatedRecord,
                            version,
                        })
                    }

                    for (const record of Object.values(changes.removed) as TLRecord[]) {
                        const id = crypto.randomUUID()
                        localOperationIds.current.add(id)
                        boardStore.deleteRecord(record.id)
                        queue.enqueue({
                            id,
                            type: 'delete',
                            recordId: record.id,
                            version,
                        })
                    }
                })

                queue.flush()
            },
            { source: 'user', scope: 'document' }
        )

        const stopListeningToQueue = queue.observe((operations) => {
            const remoteOperations = operations.filter((operation) => {
                if (localOperationIds.current.has(operation.id)) {
                    localOperationIds.current.delete(operation.id)
                    return false
                }

                return true
            })

            if (!remoteOperations.length) {
                return
            }

            applyingRemoteUpdates.current = true
            try {
                for (const operation of remoteOperations) {
                    if (operation.type === 'delete') {
                        editor.store.remove([operation.recordId])
                        continue
                    }

                    editor.store.put([operation.record])
                }
            } finally {
                applyingRemoteUpdates.current = false
            }
        })

        const handleSynced = () => {
            boardStore.hydrateEditor(editor)
            queue.flush()
        }

        transport.provider.on('synced', handleSynced)

        return () => {
            stopListeningToEditor()
            stopListeningToQueue()
            transport.provider.off('synced', handleSynced)
        }
    }, [boardStore, editor, queue, transport.provider])

    useEffect(() => {
        const handleDisconnect = () => {
            queue.flush()
        }

        const unsubscribe = transport.connect(handleDisconnect)

        return () => {
            unsubscribe()
            transport.disconnect(handleDisconnect)
        }
    }, [queue, transport])

    return null
}