import React, {useState} from 'react';
import { AppBar, Toolbar, Avatar, IconButton, Menu, MenuItem, Typography, Box, Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import '../styles/Header.css';

import { supabase } from '../lib/supabase';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/userSlice';
import { useNavigate } from 'react-router-dom';

function Header() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // 로그인 여부와 사용자 이름 (실제로는 props 또는 전역 상태로 처리)
    // const isLoggedIn = true; // 로그인 상태라면 true
    // const userName = '홍길동'; // 로그인된 사용자 이름

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { isLoggedIn, userName } = useSelector((state: RootState) => state.user);

    const handleLogoClick = () => {
        if (isLoggedIn) {
            navigate('/dashboard');
        } else {
            navigate('/');
        }
    };
    const handleLogout = async () => {
        await supabase.auth.signOut();
        dispatch(logout());
        handleClose();
        navigate('/');
    };

    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    return (
        <>
            <AppBar className='flex' color="transparent" elevation={0}>
                <Toolbar className="flex justify-center items-center">
                    {/* 로고 + 회사명 */}
                    <Box
                    onClick={handleLogoClick}
                    className="flex items-center gap-2 w-3/10"
                    >
                        <img src="/payguard.png" alt="Payguard" className='h-40 w-40' />
                        <Typography variant="h6" sx={{ fontFamily: 'Oswald', color: '#19764D', fontWeight: 'bold', fontSize: 24 }}>
                            Freelance Payguard
                        </Typography>
                    </Box>

                    {/* 메뉴 */}
                    <Box className="hidden md:flex gap-16 w-5/10 justify-center">
                        <Button variant="text" sx={{ color: '#19764D', fontWeight: 'bold', fontSize: 24 }} onClick={() => navigate('/contracts')}>계약현황</Button>
                        <Button variant="text" sx={{ color: '#19764D', fontWeight: 'bold', fontSize: 24 }} onClick={() => navigate('/clients')}>거래처</Button>
                        <Button variant="text" sx={{ color: '#19764D', fontWeight: 'bold', fontSize: 24 }} onClick={() => navigate('/payments')}>입금내역</Button>
                        <Button variant="text" sx={{ color: '#19764D', fontWeight: 'bold', fontSize: 24 }}>계약서</Button>
                    </Box>

                    {/* 로그인 아바타 */}
                    <IconButton onClick={handleAvatarClick} size="small" className='justify-start'>
                        {/* <Avatar sx={{ bgcolor: '#E0D7FF' }}>
                            <PersonIcon sx={{ color: '#5E3FFF' }} />
                        </Avatar> */}
                        <Avatar src="/member-avatar.png" alt="avatar" />
                    </IconButton>

                    {/* 말풍선 메뉴 */}
                    <Menu
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    slotProps={{
                        paper: {
                        sx: {
                            overflow: 'visible',
                            px: 2,
                            borderRadius: 2,
                            minWidth: 160,
                            bgcolor: '#D9D9D9',
                            '&::before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 20,
                            width: 10,
                            height: 10,
                            bgcolor: '#D9D9D9',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                            },
                        },
                        },
                    }}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                    {isLoggedIn
                        ? [
                            <Typography
                            key="username"
                            variant="subtitle2"
                            className="text-center font-bold text-gray-800"
                            >
                            {userName}
                            </Typography>,
                            <Box key="user-actions" className="flex flex-col gap-2 mt-2">
                                <Button
                                    size="small"
                                    className="font-semibold"
                                    onClick={() => {
                                        handleClose();
                                        navigate('/profile');
                                    }}
                                    sx={{ backgroundColor: "#F4F4F4" }}
                                >
                                    <Typography
                                    className="text-center"
                                    sx={{ color: "#19764D", fontWeight: "bold" }}
                                    >
                                    내정보
                                    </Typography>
                                </Button>
                                <Button
                                    size="small"
                                    className="font-semibold"
                                    onClick={handleClose}
                                    sx={{ backgroundColor: "#F4F4F4" }}
                                >
                                    <Typography
                                    className="text-center"
                                    sx={{ color: "#19764D", fontWeight: "bold" }}
                                    onClick={handleLogout}
                                    >
                                    로그아웃
                                    </Typography>
                                </Button>
                            </Box>,
                        ]
                        : [
                            <Typography
                            key="guest"
                            variant="subtitle2"
                            className="text-center font-bold text-gray-800"
                            >
                            Guest
                            </Typography>,
                            <Box key="guest-actions" className="flex flex-col gap-2 mt-2">
                                <Button
                                    size="small"
                                    className="font-semibold"
                                    onClick={() => {
                                        handleClose();
                                        navigate('/login');
                                    }}
                                    sx={{ backgroundColor: "#F4F4F4" }}
                                >
                                    <Typography
                                    className="text-center"
                                    sx={{ color: "#19764D", fontWeight: "bold" }}
                                    >
                                    로그인
                                    </Typography>
                                </Button>
                                <Button
                                    size="small"
                                    className="font-semibold"
                                    onClick={() => {
                                        handleClose();
                                        navigate('/register');
                                    }}
                                    sx={{ backgroundColor: "#F4F4F4" }}
                                >
                                    <Typography
                                    className="text-center"
                                    sx={{ color: "#19764D", fontWeight: "bold" }}
                                    >
                                    회원가입
                                    </Typography>
                                </Button>
                            </Box>,
                        ]}
                    </Menu>
                </Toolbar>
            </AppBar>
        </>
    );
}

export default Header;