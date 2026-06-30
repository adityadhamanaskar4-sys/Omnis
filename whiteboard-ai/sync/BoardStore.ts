import { useCallback, useMemo } from "react";
import { Editor } from "tldraw";
import { BoardRecord } from "./types";
import * as Y from 'yjs'
export default function useBoardStore(){
    const ydoc = useMemo(() => new Y.Doc(), []);
    const board = useMemo(() => ydoc.getMap<BoardRecord>('records'),[ydoc])
    const setRecord = useCallback((record:BoardRecord) => {
        board.set(record.id,record);
    }, [board])
    const deleteRecord = useCallback((recordId:string) => {
        board.delete(recordId)
    }, [board])
    const getRecord = useCallback((id:string) => {
        return board.get(id);
    }, [board])
    const getAllRecords = useCallback(() => {
        return Array.from(board.values())
    }, [board])
    const hydrateEditor = useCallback((editor: Editor) => {
        editor.store.put(getAllRecords())
    }, [getAllRecords])
    return {
        ydoc,
        setRecord,
        deleteRecord,
        getRecord,
        getAllRecords,
        hydrateEditor
    }
}
