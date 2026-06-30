import { HocuspocusProvider } from "@hocuspocus/provider";
import { useCallback, useEffect, useMemo } from "react";
import * as Y from 'yjs';
export default function useWebsocketTransport(boardId:string,ydoc:Y.Doc){
    const provider = useMemo(() => new HocuspocusProvider({
        url: "ws://localhost:8000",
        name: boardId,
        document: ydoc
    }), [boardId,ydoc])

    useEffect(() => {
        return () => {
            provider.destroy()
        }
    }, [provider])

    const connect = useCallback((callback:()=>void) => {
        provider.on('connect',callback)
        return ()=>provider.off('connect',callback)
    }, [provider])

    const disconnect = useCallback((callback:()=>void) => {
        provider.on('disconnect',callback)
        return ()=>provider.off('disconnect',callback)
    }, [provider])

    const destroy = useCallback(() => {
        provider.destroy()
    }, [provider])

    return {
        provider,
        connect,
        disconnect,
        destroy,
    }
}