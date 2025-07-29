import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase';
import { Outlet } from 'react-router'
import './App.css'
import Header from '../src/components/Header';
import Footer from './components/Footer';
import { createTheme } from '@mui/material/styles';
import { useUserStore } from './store/userStore';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import emailjs from '@emailjs/browser';


function App() {
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // 프로필 정보 fetch 후 Zustand에 저장
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          useUserStore.setState({ user: profile });
        }
      } else {
        useUserStore.setState({ user: null });
      }

      setIsAuthChecked(true); // 세션 확인 완료
    };

    restoreSession();
  }, []);

  // EmailJS 초기화
  useEffect(() => {
    emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
  }, []);

  const initialOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID
  }

  if (!isAuthChecked) {
    return null; // 또는 로딩 스피너
  }

  return (
    <>
      <PayPalScriptProvider options={initialOptions}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Header />
          <main className='main overflow-y-auto relative'>
            <img src="/payguard.png" alt="페이가드" className='background-logo fixed z-0 pointer-events-none max-w-96 max-h-96' />
            <Outlet />
          </main>
          <Footer />
        </LocalizationProvider>
      </PayPalScriptProvider>
    </>
  )
}

export default App
