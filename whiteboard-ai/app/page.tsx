'use client'
import { useState } from "react";
import Login from "./components/login";
export default function App(){
    const [start,setStart]=useState(false);
    return (
        <main className="flex min-h-screen items-center justify-center px-6 py-10">
            {start&&<Login/>}
            {!start&&<div className="app-card w-full max-w-5xl rounded-[2rem] px-6 py-8 md:px-10 md:py-12">
                <div className="md:items-center">
                    <section className="space-y-6">
                        <span className="app-badge inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]">
                            Collaborative whiteboard
                        </span>
                        <div className="space-y-3">
                            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
                                Omnis
                            </h1>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <a href="/account" className="app-button-primary px-5 py-3 text-sm">
                                Create account
                            </a>
                            <a href="/dashboard" className="app-button-secondary px-5 py-3 text-sm">
                                Open dashboard
                            </a>
                            <a className="app-button-secondary px-5 py-3 text-sm" onClick={()=>{setStart(true)}}>
                                Login
                            </a>
                        </div>
                    </section>
                </div>
            </div>}
        </main>
    );

}