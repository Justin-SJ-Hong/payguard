import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Link, Stack, Checkbox, FormControlLabel } from '@mui/material';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (password !== passwordCheck) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert('회원가입 실패: ' + error.message);
      return;
    }

    if (data.user?.identities?.length === 0) {
      alert('이미 가입된 이메일입니다.');
      return;
    }

    alert('회원가입 성공! 이메일을 확인해 주세요.');
    navigate('/login', { replace: true });
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" bgcolor="#f5f5f5">
      <Box bgcolor="white" p={4} borderRadius={2} boxShadow={3} width={350}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={3}>
          회원가입
        </Typography>

        <Stack spacing={2}>
          <TextField label="이메일" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="비밀번호" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)}  />
          <TextField label="비밀번호 확인" type="password" fullWidth value={passwordCheck} onChange={(e) => setPasswordCheck(e.target.value)} />

          <Button variant="contained" fullWidth onClick={handleRegister}>
            회원가입
          </Button>

          <Button variant="outlined" fullWidth onClick={() => navigate('/login')}>
            로그인
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
