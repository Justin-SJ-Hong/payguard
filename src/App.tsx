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

/* 
  고민하고 있는 것
  1. 계약 제안서 보기 페이지에서 수락 버튼을 누를 경우 서명 진행 후 자동으로 계약을 생성
  2. 자동으로 계약을 생성하면 생성한 계약을 데이터베이스 및 PDF 파일로 저장한 다음 제안자와 수락자 모두가 받을 수 있게 하기
  3. 계약 제안서 보기 페이지에서 거절 버튼을 누를 경우 거절 사유를 입력해서 상대방에게 이메일로 보내고, 해당 계약 제안서 상태를 거절로 변경
*/

function App() {
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // 프로필 정보 fetch 후 Zustand에 저장 (소프트 삭제 계정 차단)
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile && !(profile as any).is_deleted) {
          useUserStore.setState({ user: profile });
        } else {
          await supabase.auth.signOut();
          useUserStore.setState({ user: null });
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
