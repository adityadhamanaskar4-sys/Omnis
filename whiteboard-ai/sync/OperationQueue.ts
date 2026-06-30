import { useCallback, useMemo, useRef } from 'react'
import { Doc } from 'yjs'
import { SyncOperation } from './types'
export default function useOperationQueue(ydoc:Doc){
    const operations = useMemo(()=> ydoc.getArray<SyncOperation>('operations'),[ydoc])
    const pending=useRef(new Map<string,SyncOperation>())
    const cursor = useRef(0)

    const enqueue = useCallback((op:SyncOperation) => {
        if (operations.length > 500) {
            const removeCount = Math.min(100, operations.length)
            operations.delete(0, removeCount)
            cursor.current = Math.max(0, cursor.current - removeCount)
        }
        pending.current.set(op.id,op)
    }, [operations])

    const flush = useCallback(() => {
        if(!pending.current.size)
            return
        const batch=Array.from(pending.current.values())
        ydoc.transact(()=>{
            operations.push([...batch])
        })
        pending.current.clear()
    }, [operations, ydoc])

    const readNew = useCallback(() => {
        const next = operations.toArray().slice(cursor.current)
        cursor.current = operations.length
        return next
    }, [operations])

    const observe = useCallback((listener: (ops: SyncOperation[]) => void) => {
        const handle = () => {
            const next = readNew()
            if (next.length) {
                listener(next)
            }
        }

        operations.observe(handle)
        handle()

        return () => operations.unobserve(handle)
    }, [operations, readNew])

    return {
        enqueue,
        flush,
        observe,
        readNew,
    }
}