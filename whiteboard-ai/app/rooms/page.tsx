'use client'
import useSyncController from "@/sync/SyncController";
import { Editor,Tldraw } from "tldraw";
import 'tldraw/tldraw.css'
import useWebsocketTransport from "@/sync/WebsocketTransport";
import useBoardStore  from "@/sync/BoardStore"
import useOperationQueue from "@/sync/OperationQueue"
import { useState } from "react";
export default function App() {
    const [editor, setEditor] = useState<Editor | null>(null)
    const boardStore = useBoardStore()
    const queue = useOperationQueue(boardStore.ydoc)
    const transport = useWebsocketTransport("Board-1", boardStore.ydoc)
    useSyncController(
        { boardStore, queue, transport, editor }    )
    return (
        <div className="h-screen w-screen">
            <Tldraw
                onMount={setEditor}
            />
        </div>
    )
}