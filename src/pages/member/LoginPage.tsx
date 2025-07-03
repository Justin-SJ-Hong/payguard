import { supabase } from '../../lib/supabase';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { login } from '../../store/userSlice';
import { PayPalButtons } from '@paypal/react-paypal-js';

import { Box, Button, TextField, Typography, Link, Stack, Checkbox, FormControlLabel } from '@mui/material';

import {useState} from 'react';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const from = new URLSearchParams(location.search).get('from') || '/dashboard';

  const handleLogin = async () => {
    // 실제 API가 있다면 여기서 처리 → 지금은 목데이터
    // if (email && password) {
    //   dispatch(login({ userName: '홍길동' })); // 추후 userName은 API 결과에서
    //   navigate('/dashboard'); // 로그인 성공 후 대시보드로 이동
    // }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('로그인 실패: ' + error.message);
      return;
    }

    const user = data.user;
    dispatch(login({ userName: user?.email || '사용자' }));
    navigate(from, { replace: true });
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor="#f5f5f5"
    >
      <Box
        bgcolor="white"
        p={4}
        borderRadius={2}
        boxShadow={3}
        width={350}
      >
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={3}>
          로그인
        </Typography>

        <Stack spacing={2}>
          <TextField label="이메일" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="비밀번호" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} />

          <FormControlLabel
            control={<Checkbox />}
            label="로그인 유지하기"
          />

          <Button variant="contained" fullWidth onClick={handleLogin}>
            로그인
          </Button>

          <Button variant="outlined" fullWidth onClick={() => navigate('/register')}>
            회원가입
          </Button>

          <Link href="/forgot-password" underline="hover" textAlign="center" mt={2}>
            비밀번호를 잊으셨나요?
          </Link>

          <PayPalButtons></PayPalButtons>
        </Stack>
      </Box>
    </Box>
  );
}
