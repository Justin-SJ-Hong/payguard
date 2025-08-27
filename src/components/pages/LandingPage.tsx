import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
      <Typography variant="h4" fontWeight="bold" mb={2}>
        자세한 내용을 보고 싶으시면 로그인해주세요.
      </Typography>
      {/* <Button variant="contained" onClick={() => navigate('/login')}>
        로그인 하러 가기
      </Button> */}
    </Box>
  );
}
