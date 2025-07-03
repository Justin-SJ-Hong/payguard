import { Box, Button, TextField, Typography, Link, Stack, Checkbox, FormControlLabel } from '@mui/material';

export default function ForgotPasswordPage() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Box bgcolor="white" p={4} borderRadius={2} boxShadow={3} width={350}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={2}>
          비밀번호 찾기
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={2} textAlign="center">
          가입하신 이메일을 입력해 주세요. 비밀번호 재설정 링크를 보내드립니다.
        </Typography>

        <Stack spacing={2}>
          <TextField label="이메일" fullWidth />

          <Button variant="contained" fullWidth>
            이메일 발송
          </Button>

          <Button variant="outlined" fullWidth>
            로그인
          </Button>

          <Button variant="text" fullWidth>
            회원가입
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
