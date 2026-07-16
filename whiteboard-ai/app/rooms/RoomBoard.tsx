'use client';

import useSyncController from '@/sync/SyncController';
import { Editor, Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';
import useWebsocketTransport from '@/sync/WebsocketTransport';
import useBoardStore from '@/sync/BoardStore';
import useOperationQueue from '@/sync/OperationQueue';
import { useState } from 'react';

type RoomBoardProps = {
    roomId: string;
};

export default function RoomBoard({ roomId }: RoomBoardProps) {
    const [editor, setEditor] = useState<Editor | null>(null);
    const boardStore = useBoardStore();
    const queue = useOperationQueue(boardStore.ydoc);
    const transport = useWebsocketTransport(roomId, boardStore.ydoc);

    useSyncController({ boardStore, queue, transport, editor });

    return (
        <main className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
            <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-full border border-(--border) bg-(--surface) px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-foreground shadow-lg backdrop-blur-sm">
                Room {roomId}
            </div>
            <div className="absolute inset-0">
                <Tldraw onMount={setEditor} />
            </div>
        </main>
    );
}
