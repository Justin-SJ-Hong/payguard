import { Box, Typography, Stack, Alert } from '@mui/material';

interface PasswordValidation {
  isValid: boolean;
  minLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumbers: boolean;
  hasSpecialChar: boolean;
}

interface PasswordValidationDisplayProps {
  passwordValidation: PasswordValidation;
  password: string;
  passwordCheck: string;
}

const PasswordValidationDisplay = ({ passwordValidation, password, passwordCheck }: PasswordValidationDisplayProps) => {
  const passwordsMatch = password === passwordCheck && password.length > 0;
  const showPasswordMatch = password.length > 0 || passwordCheck.length > 0;

  return (
    <Box mt={1}>
      <Typography variant="caption" color="textSecondary">
        비밀번호는 다음 조건을 모두 만족해야 합니다:
      </Typography>
      <Stack spacing={0.5} mt={1}>
        <Typography 
          variant="caption" 
          color={passwordValidation.minLength ? 'success.main' : 'error.main'}
        >
          ✓ 8자리 이상 {passwordValidation.minLength ? '(완료)' : ''}
        </Typography>
        <Typography 
          variant="caption" 
          color={passwordValidation.hasUpperCase ? 'success.main' : 'error.main'}
        >
          ✓ 대문자 포함 {passwordValidation.hasUpperCase ? '(완료)' : ''}
        </Typography>
        <Typography 
          variant="caption" 
          color={passwordValidation.hasLowerCase ? 'success.main' : 'error.main'}
        >
          ✓ 소문자 포함 {passwordValidation.hasLowerCase ? '(완료)' : ''}
        </Typography>
        <Typography 
          variant="caption" 
          color={passwordValidation.hasNumbers ? 'success.main' : 'error.main'}
        >
          ✓ 숫자 포함 {passwordValidation.hasNumbers ? '(완료)' : ''}
        </Typography>
        <Typography 
          variant="caption" 
          color={passwordValidation.hasSpecialChar ? 'success.main' : 'error.main'}
        >
          ✓ 특수문자 포함 {passwordValidation.hasSpecialChar ? '(완료)' : ''}
        </Typography>
      </Stack>
      
      {/* 비밀번호 일치 여부 표시 */}
      {showPasswordMatch && (
        <Box mt={1}>
          <Typography 
            variant="caption" 
            color={passwordsMatch ? 'success.main' : 'error.main'}
          >
            {passwordsMatch ? '✓ 비밀번호가 일치합니다' : '✗ 비밀번호가 일치하지 않습니다'}
          </Typography>
        </Box>
      )}
      
      {passwordValidation.isValid && passwordsMatch && (
        <Alert severity="success" sx={{ mt: 1 }}>
          비밀번호가 모든 조건을 만족하고 일치합니다!
        </Alert>
      )}
    </Box>
  );
};

export default PasswordValidationDisplay;