import { useState } from 'react';
import { Box, Button, Divider, Stack, TextField, Typography, Alert, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AvatarUpload } from '../../components/forms/AvatarUpload';
import { useUserStore } from '../../store/userStore';
import { supabase } from '../../lib/supabase';
import PasswordValidationDisplay from '../../components/validation/PasswordValidationDisplay';

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

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateAvatar } = useUserStore();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordValidation, setPasswordValidation] = useState(validatePassword(''));
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleAvatarChange = async (file: File | null) => {
    setError(null);
    setMessage(null);
    if (!user) return;

    try {
      if (file) {
        setIsSubmitting(true);
        await updateAvatar(file);
        setMessage('아바타가 업데이트되었습니다.');
      } else {
        // 아바타 제거
        setIsSubmitting(true);
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: null })
          .eq('id', user.id);
        if (updateError) throw updateError;
        useUserStore.setState({ user: { ...user, avatar_url: undefined } });
        setMessage('아바타가 제거되었습니다.');
      }
    } catch (e: any) {
      setError(e?.message || '아바타 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    setError(null);
    setMessage(null);

    if (!newPassword || !confirmPassword) {
      const error = '새 비밀번호와 확인 비밀번호를 입력하세요.';
      console.log(error);
      alert(error);
      setError(error);
      return;
    }
    
    // 비밀번호 강도 검증
    if (!passwordValidation.isValid) {
      const error = '비밀번호는 8자리 이상이며, 대문자, 소문자, 숫자, 특수문자를 모두 포함해야 합니다.';
      alert(error);
      setError(error);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      const error = '비밀번호가 일치하지 않습니다.';
      console.log(error);
      alert(error);
      setError(error);
      return;
    }

    try {
      setIsSubmitting(true);
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setMessage('비밀번호가 변경되었습니다. 다시 로그인해야 할 수 있습니다.');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordValidation(validatePassword(''));
    } catch (e: any) {
      setError(e?.message || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setError(null);
    setMessage(null);
    if (!user) return;

    try {
      setIsSubmitting(true);
      // 소프트 삭제: is_deleted = true 로 업데이트
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_deleted: true })
        .eq('id', user.id);
      if (updateError) throw updateError;

      await supabase.auth.signOut();
      useUserStore.setState({ user: null });
      setMessage('계정이 비활성화되었습니다. 홈으로 이동합니다.');
      navigate('/', { replace: true });
    } catch (e: any) {
      setError(
        e?.message || '비활성화 처리 중 오류가 발생했습니다. 관리자에게 문의해주세요.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center">
        <Typography>로그인이 필요합니다.</Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="flex-start" bgcolor="#f5f5f5">
      <Box bgcolor="white" p={4} borderRadius={2} boxShadow={3} width={500}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={3}>
          내 프로필
        </Typography>

        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>기본 정보</Typography>
            <Stack spacing={1}>
              <TextField label="이름" value={user.name || ''} InputProps={{ readOnly: true }} />
              <TextField label="이메일" value={user.email || ''} InputProps={{ readOnly: true }} />
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>아바타</Typography>
            <AvatarUpload onAvatarChange={handleAvatarChange} currentAvatarUrl={user.avatar_url} />
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>비밀번호 변경</Typography>
            <PasswordValidationDisplay 
              password={newPassword}
              passwordCheck={confirmPassword}
            />
            <Stack spacing={1}>
              <TextField
                label="새 비밀번호"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordValidation(validatePassword(e.target.value));
                }}
              />
              <TextField
                label="비밀번호 확인"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button variant="contained" onClick={handleChangePassword} disabled={isSubmitting}>
                {isSubmitting ? '처리 중...' : '비밀번호 변경'}
              </Button>
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight="bold" color="error" mb={1}>계정 비활성화 (탈퇴)</Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>
              계정은 비활성화 처리되며(복구 가능), 인증 계정 완전 삭제는 관리자 권한이 필요합니다.
            </Typography>
            <Button variant="outlined" color="error" onClick={openDeleteDialog} disabled={isSubmitting}>
              {isSubmitting ? '처리 중...' : '계정 비활성화'}
            </Button>
          </Box>
        </Stack>
      </Box>

      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>계정 비활성화</DialogTitle>
        <DialogContent>
          <DialogContentText>
            계정을 비활성화하면 복구가 가능합니다. 계정을 완전히 삭제하려면 관리자에게 문의해주세요.
            비활성화 처리 시 모든 데이터는 보존되며, 다시 활성화할 수 있습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            취소
          </Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">
            비활성화
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


