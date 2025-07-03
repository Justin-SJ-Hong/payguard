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
    clientId: "AeS8mtOAguro4R81KMYyr214qLUCH8z8J5-j2WtqgITyOhyGIW0Ww7wLuu69sdDCyHXm5GKV8Yh9t-tG"
  }

  return (
    <>
      <PayPalScriptProvider options={initialOptions}>
        <Header />
        <main className='main overflow-y-auto relative'>
          <img src="/payguard.png" alt="페이가드" className='background-logo fixed z-0 pointer-events-none max-w-96 max-h-96' />
          <Outlet />
        </main>
        <Footer />
      </PayPalScriptProvider>
    </>
  )
}

export default App
