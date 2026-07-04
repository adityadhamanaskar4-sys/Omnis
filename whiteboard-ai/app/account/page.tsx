'use client'
import axios from "axios";
import { useState } from 'react'
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
        <div className="flex flex-col h-screen justify-center items-center bg-gray-50 dark:bg-gray-900">
            <label className="text-5xl p-3">Signup</label>
            <form className="max-w-md mx-auto w-70" onSubmit={async (e)=>{
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
                <div className="relative z-0 w-full mb-5 group">
                    <input type="text" name="floating_user_name" id="floating_user_name" className="block py-2.5 px-0 w-full text-sm text-heading bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer" placeholder=" " required  value={form.username} onChange={(e)=>{setForm({...form,username:e.target.value})}}/>
                    <label htmlFor="floating_user_name" className="absolute text-sm text-body duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Username</label>
                </div>
                <div className="relative z-0 w-full mb-5 group">
                    <input type="email" name="floating_email" id="floating_email" className="block py-2.5 px-0 w-full text-sm text-heading bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer" placeholder=" " required value={form.email} onChange={(e)=>{setForm({...form,email:e.target.value})}}/>
                    <label htmlFor="floating_email" className="absolute text-sm text-body duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Email address</label>
                </div>
                <div className="relative z-0 w-full mb-5 group">
                    <input type="password" name="floating_password" id="floating_password" className="block py-2.5 px-0 w-full text-sm text-heading bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer" placeholder=" " required value={form.password} onChange={(e)=>{setForm({...form,password:e.target.value})}}/>
                    <label htmlFor="floating_password" className="absolute text-sm text-body duration-300 transhtmlForm -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Password</label>
                </div>
                <button type="submit" disabled={loading} className="text-white bg-brand box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? 'Submitting...' : 'Submit'}
                </button>
            </form>
            {popup && <Popup type={popup.type} message={popup.message} onClose={closePopup} />}
        </div>
    );
}