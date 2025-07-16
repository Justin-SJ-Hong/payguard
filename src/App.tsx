import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase';
import { Outlet } from 'react-router'
import { useDispatch } from 'react-redux';
import { login, logout } from './store/userSlice';
import './App.css'
import Header from '../src/components/Header';
import Footer from './components/Footer';
import { createTheme } from '@mui/material/styles';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';


function App() {
  const [count, setCount] = useState(100)

  const dispatch = useDispatch();

  useEffect(() => {
    const restoreSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      const session = data?.session;

      if (session?.user) {
        dispatch(login({ userName: session.user.email }));
      } else {
        dispatch(logout());
      }
    };

    restoreSession();
  }, []);

  const initialOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID
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
