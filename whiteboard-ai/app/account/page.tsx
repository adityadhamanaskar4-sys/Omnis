'use client'
import axios from "axios";
import { useState } from 'react'
import Link from "next/link";
import Popup from "@/app/components/Popup";

const AUTH_BASE_URL = "http://localhost:5000/auth";

type PopupState = {
    type: 'success' | 'error';
    message: string;
} | null;

export default function App() {
    const [loading, setLoading] = useState(false);
    const [popup, setPopup] = useState<PopupState>(null);
    const [form,setForm]=useState({
        username:"",
        email:"",
        password:""
    })

    const closePopup = () => setPopup(null);

    return (
        <main className="flex min-h-screen items-center justify-center px-6 py-10">
            <div className="app-card w-full max-w-xl rounded-4xl px-6 py-8 md:px-10 md:py-12">
                <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-(--muted)">Account</p>
                    <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Create account</h1>
                    <p className="text-sm text-(--muted)">Use the same red and white palette across the signup flow.</p>
                </div>
                <form className="mt-8 space-y-5" onSubmit={async (e)=>{
                    e.preventDefault();
                    if (loading) {
                        return;
                    }

                    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
                        setPopup({
                            type: 'error',
                            message: 'Username, email and password are required.'
                        });
                        return;
                    }

                    try {
                        setLoading(true);
                        const res = await axios.post(`${AUTH_BASE_URL}/signup`, {
                            username: form.username.trim(),
                            email: form.email.trim(),
                            password: form.password
                        }, { withCredentials: true });
                        setForm({
                            username:"",
                            email:"",
                            password:""
                        });
                        setPopup({
                            type: 'success',
                            message: res.data?.message || 'Signup successful'
                        });
                    } catch (err) {
                        if (axios.isAxiosError(err)) {
                            setPopup({
                                type: 'error',
                                message: err.response?.data?.message || err.response?.data || 'Unable to signup. Please try again.'
                            });
                        } else {
                            setPopup({
                                type: 'error',
                                message: 'Unexpected error while signing up.'
                            });
                        }
                    } finally {
                        setLoading(false);
                    }
                }}>
                <div className="space-y-2">
                    <label htmlFor="floating_user_name" className="app-label block text-sm font-medium">Username</label>
                    <input type="text" name="floating_user_name" id="floating_user_name" className="app-input" placeholder="Your display name" required  value={form.username} onChange={(e)=>{setForm({...form,username:e.target.value})}}/>
                </div>
                <div className="space-y-2">
                    <label htmlFor="floating_email" className="app-label block text-sm font-medium">Email address</label>
                    <input type="email" name="floating_email" id="floating_email" className="app-input" placeholder="name@company.com" required value={form.email} onChange={(e)=>{setForm({...form,email:e.target.value})}}/>
                </div>
                <div className="space-y-2">
                    <label htmlFor="floating_password" className="app-label block text-sm font-medium">Password</label>
                    <input type="password" name="floating_password" id="floating_password" className="app-input" placeholder="Enter a secure password" required value={form.password} onChange={(e)=>{setForm({...form,password:e.target.value})}}/>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button type="submit" disabled={loading} className="app-button-primary px-5 py-3 text-sm">
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                    <Link href="/" className="app-button-secondary px-5 py-3 text-sm">
                        Back home
                    </Link>
                </div>
                </form>
            </div>
            {popup && <Popup type={popup.type} message={popup.message} onClose={closePopup} />}
        </main>
    );
}