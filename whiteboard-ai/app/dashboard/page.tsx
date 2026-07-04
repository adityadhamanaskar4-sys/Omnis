'use client'
import { useEffect, useState } from "react"
import Popup from "../components/Popup"
import { useRouter } from "next/navigation";
import axios from "axios";
type PopupState = {
    type: 'success' | 'error';
    message: string;
} | null;
export default function App(){
    const router=useRouter();
    const [popup,setPopup]=useState<PopupState>(null);
    useEffect(()=>{
            const verify= async()=>{
            try{
                await axios.get("http://localhost:5000/auth/verify",{withCredentials:true})
            }catch(err){
                setPopup({
                    type:'error',
                    message:'Login to continue'
                })
            }
        }
        verify();
    },[])
    return(
        <>
            <h1>DashBoard</h1>
            <button onClick={async()=>{
                try{
                    await axios.post("http://localhost:5000/auth/logout",{},{withCredentials:true});
                    router.replace('/')
                }catch(err:String){
                    setPopup({
                        type:'error',
                        message:err
                    })
                }
            }}>Logout</button>
            {popup && <Popup type={popup.type} message={popup.message} onClose={() => {
                router.replace('/');
                setPopup(null);
                }} />}
        </>
    )
}