import { Box, Typography, Stack, Alert } from '@mui/material';
import { usePasswordValidation } from '../../hooks/usePasswordValidation';

interface PasswordValidationDisplayProps {
  password: string;
  passwordCheck: string;
}

const PasswordValidationDisplay = ({ password, passwordCheck }: PasswordValidationDisplayProps) => {
  const { validation, passwordsMatch, showPasswordMatch, isAllValid } = usePasswordValidation(password, passwordCheck);

  return (
    <Box mt={1}>
      <Typography variant="caption" color="textSecondary">
        비밀번호는 다음 조건을 모두 만족해야 합니다:
      </Typography>
      <Stack spacing={0.5} mt={1}>
        <Typography 
          variant="caption" 
          color={validation.minLength ? 'success.main' : 'error.main'}
        >
          ✓ 8자리 이상 {validation.minLength ? '(완료)' : ''}
        </Typography>
        <Typography 
          variant="caption" 
          color={validation.hasUpperCase ? 'success.main' : 'error.main'}
        >
          ✓ 대문자 포함 {validation.hasUpperCase ? '(완료)' : ''}
        </Typography>
        <Typography 
          variant="caption" 
          color={validation.hasLowerCase ? 'success.main' : 'error.main'}
        >
          ✓ 소문자 포함 {validation.hasLowerCase ? '(완료)' : ''}
        </Typography>
        <Typography 
          variant="caption" 
          color={validation.hasNumbers ? 'success.main' : 'error.main'}
        >
          ✓ 숫자 포함 {validation.hasNumbers ? '(완료)' : ''}
        </Typography>
        <Typography 
          variant="caption" 
          color={validation.hasSpecialChar ? 'success.main' : 'error.main'}
        >
          ✓ 특수문자 포함 {validation.hasSpecialChar ? '(완료)' : ''}
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
      
      {isAllValid && (
        <Alert severity="success" sx={{ mt: 1 }}>
          비밀번호가 모든 조건을 만족하고 일치합니다!
        </Alert>
      )}
    </Box>
  );
};

export default PasswordValidationDisplay;