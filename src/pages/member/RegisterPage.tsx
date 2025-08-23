import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Link, Stack, Radio, RadioGroup, FormControlLabel, FormLabel, Alert } from '@mui/material';
import { AvatarUpload } from '../../components/AvatarUpload';
import { useUserStore } from '../../store/userStore';
import AddressAutocomplete from '../../components/AddressAutocomplete';
import PasswordValidationDisplay from '../../components/PasswordValidationDisplay';

// 비밀번호 강도 검증 함수
const validatePassword = (password: string) => {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar
  };
};

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
  const [passwordValidation, setPasswordValidation] = useState(validatePassword(''));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // 비밀번호 입력 시 실시간 검증
    if (name === 'password') {
      setPasswordValidation(validatePassword(value));
    }
  };

  const handleRegister = async () => {
    if (formData.password !== formData.passwordCheck) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 강도 검증
    if (!passwordValidation.isValid) {
      alert('비밀번호는 8자리 이상이며, 대문자, 소문자, 숫자, 특수문자를 모두 포함해야 합니다.');
      return;
    }

    try {
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
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error?.message?.includes('Weak password')) {
        alert('비밀번호가 너무 약합니다. 더 강한 비밀번호를 사용해주세요.');
      } else if (error?.message?.includes('Invalid email')) {
        alert('유효하지 않은 이메일 형식입니다.');
      } else if (error?.message?.includes('User already registered')) {
        alert('이미 등록된 이메일입니다.');
      } else {
        alert(`회원가입 중 오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}`);
      }
    }
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
          <PasswordValidationDisplay 
            passwordValidation={passwordValidation} 
            password={formData.password}
            passwordCheck={formData.passwordCheck}
          />
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
