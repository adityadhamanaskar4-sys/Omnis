'use client'
import axios from "axios";
import { useEffect, useState } from 'react'
import { useRouter } from "next/navigation";
import Popup from "@/app/components/Popup";

const AUTH_BASE_URL = "http://localhost:5000/auth";

type PopupState = {
    type: 'success' | 'error';
    message: string;
} | null;

export default function Login(){
    const router=useRouter();
    const [loading,setLoading]=useState(false);
    const [popup, setPopup] = useState<PopupState>(null);
    const [form,setForm]=useState({
        email:"",
        password:""
    })

    useEffect(() => {
        let mounted = true;

        const checkToken = async () => {
            try {
                const res = await axios.get(`${AUTH_BASE_URL}/session`, { withCredentials: true });
                if (mounted && res.status === 200) {
                    router.replace('/dashboard');
                }
            } catch (err){
                // No active session, user stays on login page.
            }
        };

        checkToken();

        return () => {
            mounted = false;
        };
    }, [router]);

    const closePopup = () => setPopup(null);

    return (
        <>
            <section className="bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                    <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                Sign in to your account
                            </h1>
                            <form className="space-y-4 md:space-y-6" onSubmit={async (e)=>{
                                    e.preventDefault();
                                    if (loading) {
                                        return;
                                    }

                                    if (!form.email.trim() || !form.password.trim()) {
                                        setPopup({
                                            type: 'error',
                                            message: 'Email and password are required.'
                                        });
                                        return;
                                    }

                                    try{
                                        setLoading(true);
                                        const res=await axios.post(`${AUTH_BASE_URL}/login`, {
                                            email: form.email.trim(),
                                            password: form.password
                                        },{withCredentials:true})
                                        setForm({
                                            email:"",
                                            password:""
                                        })
                                        setPopup({
                                            type: 'success',
                                            message: res.data?.message || 'Login successful'
                                        });
                                        setTimeout(() => {
                                            router.replace('/dashboard');
                                        }, 900);
                                    }catch(err){
                                        if (axios.isAxiosError(err)) {
                                            setPopup({
                                                type: 'error',
                                                message: err.response?.data?.message || err.response?.data || 'Unable to login. Please try again.'
                                            });
                                        } else {
                                            setPopup({
                                                type: 'error',
                                                message: 'Unexpected error while logging in.'
                                            });
                                        }
                                    } finally {
                                        setLoading(false);
                                    }
                                }
                            }>
                                <div>
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                                    <input type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com" required value={form.email} onChange={(e)=>{setForm({...form,email:e.target.value})}}/>
                                </div>
                                <div>
                                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                                    <input type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required value={form.password} onChange={(e)=>{setForm({...form,password:e.target.value})}}/>
                                </div>
                                {/* <div className="flex items-center justify-between">
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input id="remember" aria-describedby="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"/>
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="remember" className="text-gray-500 dark:text-gray-300">Remember me</label>
                                        </div>
                                    </div>
                                    <a href="#" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</a>
                                </div> */}
                                <button type="submit" disabled={loading} className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-60 disabled:cursor-not-allowed dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                                    {loading ? 'Signing in...' : 'Sign in'}
                                </button>
                                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                    Don’t have an account yet? <a href="/account" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign up</a>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
            {popup && <Popup type={popup.type} message={popup.message} onClose={closePopup} />}
        </>
    )
}