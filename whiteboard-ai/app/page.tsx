'use client'
import { Editor,Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
// import { createTLStore } from 'tldraw';
import { useEffect, useMemo, useRef } from 'react';
export default function App() {
    const editorRef=useRef<Editor|null>(null);
    const isRemoteUpdate = useRef(false)
    const ydoc=useMemo(()=>new Y.Doc(),[]);
    const provider=useMemo(()=>new HocuspocusProvider({
        url:"ws://localhost:8000",
        name:"Board-1",
        document:ydoc
    }),[])
    useEffect(()=>{
        provider.on('connect', () => {
            console.log('CONNECTED')
        })
        provider.on('disconnect', () => {
            console.log('DISCONNECTED')
        })
        provider.on('synced', () => {
            console.log('SYNCED')
        })
    },[provider])
    const records = ydoc.getMap('records');
    useEffect(()=>{
        const observer= () => {
            isRemoteUpdate.current = true;
            try{
                const allRecords:any = []
                records.forEach((record) => {
                    allRecords.push(record)
                })
                editorRef.current?.store.put(allRecords)
            }finally{
                isRemoteUpdate.current = false;
            }
        }
        records.observe(observer);
        return () => {
            records.unobserve(observer)
        }
    },[records])
    // const store=useMemo(()=>createTLStore(),[]);
    // const syncstore=createTLStore({
    //     store,
    //     ydoc
    // });
    
    return (
        <div className="h-screen w-screen">
            <Tldraw onMount={(editor)=>{
                editorRef.current = editor
                editor.store.listen((change) => {
                    if(isRemoteUpdate.current) return;
                    Object.values(change.changes.added).forEach((record) => {
                        if (record.typeName !== 'shape') return
                        records.set(record.id, record)
                    })
                    // console.log(change.changes.updated)
                    Object.values(change.changes.updated).forEach(([, record]) => {
                        if (record.typeName !== 'shape') return
                        records.set(record.id, record)
                    })
                    Object.values(change.changes.removed).forEach((record) => {
                        if (record.typeName !== 'shape') return
                        records.delete(record.id)
                    })
                })
            }}/>
        </div>
    );
}