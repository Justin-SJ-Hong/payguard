import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Link, Stack, Radio, RadioGroup, FormControlLabel, FormLabel } from '@mui/material';
import { AvatarUpload } from '../../components/AvatarUpload';
import { useUserStore } from '../../store/userStore';
import AddressAutocomplete from '../../components/AddressAutocomplete';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useUserStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordCheck: '',
    name: '',
    phone: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [userType, setUserType] = useState('freelancer'); // 기본값 freelancer
  
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async () => {
    if (formData.password !== formData.passwordCheck) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    await register({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone: formData.phone,
      avatar: avatarFile ?? undefined,
      user_type: userType as 'freelancer' | 'client',
      address: address || '',
      postal_code: postalCode || '',
    });

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
          <Box>
            <FormLabel component="legend">회원 유형</FormLabel>
            <RadioGroup
              row
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <FormControlLabel value="freelancer" control={<Radio />} label="프리랜서" />
              <FormControlLabel value="client" control={<Radio />} label="클라이언트" />
            </RadioGroup>
          </Box>
          
          {/* 아바타 업로드 섹션 */}
          <Box display="flex" justifyContent="center">
            <AvatarUpload 
              onAvatarChange={setAvatarFile}
            />
          </Box>

          <TextField name="name" label="이름" fullWidth value={formData.name} onChange={handleChange} />
          <TextField name="phone" label="휴대폰 번호" fullWidth value={formData.phone} onChange={handleChange} />
          <TextField name="email" label="이메일" fullWidth value={formData.email} onChange={handleChange} />
          <TextField name="password" label="비밀번호" type="password" fullWidth value={formData.password} onChange={handleChange}  />
          <TextField name="passwordCheck" label="비밀번호 확인" type="password" fullWidth value={formData.passwordCheck} onChange={handleChange} />

          <AddressAutocomplete
            onSelect={(addr:any) => {
              setAddress(addr);
            }}
          />

          <TextField
            label="우편번호"
            fullWidth
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />

          
          <Button variant="contained" fullWidth onClick={handleRegister} disabled={isLoading}>
            {isLoading ? '가입 중...' : '회원가입'}
          </Button>

          <Button variant="outlined" fullWidth onClick={() => navigate('/login')}>
            로그인
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
