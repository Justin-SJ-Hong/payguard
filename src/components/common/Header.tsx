import React, {useState, useRef} from 'react';
import { AppBar, Toolbar, Avatar, IconButton, Menu, MenuItem, Typography, Box, Button } from '@mui/material';
import '../../styles/Header.css';

import { supabase } from '../../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';

function Header() {
    const navigate = useNavigate();

    // Zustand에서 유저 정보 읽기
    const user = useUserStore((state) => state.user);
    const clearUser = () => useUserStore.setState({ user: null });

    const isLoggedIn = !!user;
    const userName = user?.name || '';
    const avatarUrl = user?.avatar_url || '/member-avatar.png';

    // 계약서 메뉴 상태 (hover)
    const [contractAnchorEl, setContractAnchorEl] = useState<null | HTMLElement>(null);
    const isContractOpen = Boolean(contractAnchorEl);

    // 아바타 메뉴 상태 (click)
    const [avatarAnchorEl, setAvatarAnchorEl] = useState<null | HTMLElement>(null);
    const isAvatarOpen = Boolean(avatarAnchorEl);

    // hover용
    const handleContractEnter = (event: React.MouseEvent<HTMLElement>) => {
        setContractAnchorEl(event.currentTarget);
    };
    // const handleContractLeave = () => {
    //     setTimeout(() => setContractAnchorEl(null), 0);
    // };
    // 마우스 나가면 일정 시간 후 닫기 (살짝 delay 줌)

    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleContractLeave = () => {
        closeTimeoutRef.current = setTimeout(() => {
            setContractAnchorEl(null);
        }, 100); // 살짝 delay
    };

    const cancelClose = () => {
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };

    // 클릭용
    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAvatarAnchorEl(event.currentTarget);
    };
    const handleAvatarClose = () => {
        setAvatarAnchorEl(null);
    };

    const handleLogoClick = () => {
        if (isLoggedIn) {
            navigate('/dashboard');
        } else {
            navigate('/');
        }
    };
    const handleLogout = async () => {
        await supabase.auth.signOut();
        clearUser();
        handleClose();
        navigate('/');
    };

    const handleClose = () => {
        setAvatarAnchorEl(null);
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

                    {/* 메뉴 영역 */}
                    <Box className="hidden md:flex gap-16 w-5/10 justify-center">
                        <Button
                            variant="text"
                            sx={{ color: '#19764D', fontWeight: 'bold', fontSize: 24 }}
                            onClick={() => navigate('/clients')}
                        >
                            거래처
                        </Button>
                        <Button
                            variant="text"
                            sx={{ color: '#19764D', fontWeight: 'bold', fontSize: 24 }}
                            onClick={() => navigate('/payments')}
                        >
                            입금내역
                        </Button>

                        {/* 계약서 드롭다운 */}
                        <Box
                            onMouseEnter={(e) => {
                                cancelClose();         // 마우스 다시 들어오면 닫힘 취소
                                handleContractEnter(e);
                            }}
                            onMouseLeave={handleContractLeave}
                        >
                            <Button
                                variant="text"
                                sx={{ color: '#19764D', fontWeight: 'bold', fontSize: 24 }}
                                aria-controls={isContractOpen ? 'contract-menu' : undefined}
                                aria-haspopup="true"
                            >
                                계약
                            </Button>

                            <Menu
                                id="contract-menu"
                                anchorEl={contractAnchorEl}
                                open={isContractOpen}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                slotProps={{
                                    // 메뉴 안에서는 자동 닫힘 방지
                                    list: {
                                        onMouseEnter: cancelClose,
                                        onMouseLeave: handleContractLeave,
                                    }
                                }}
                            >
                                <MenuItem onClick={() => navigate('/proposals/new')}>제안하기</MenuItem>
                                <MenuItem onClick={() => navigate('/contracts')}>계약현황</MenuItem>
                            </Menu>
                        </Box>
                    </Box>

                    {/* 로그인 아바타 */}
                    <IconButton onClick={handleAvatarClick} size="small" className='justify-start'>
                        {/* <Avatar sx={{ bgcolor: '#E0D7FF' }}>
                            <PersonIcon sx={{ color: '#5E3FFF' }} />
                        </Avatar> */}
                        <Avatar src={avatarUrl} alt="avatar" />
                    </IconButton>

                    {/* 말풍선 메뉴 */}
                    <Menu
                    open={isAvatarOpen}
                    anchorEl={avatarAnchorEl}
                    onClose={handleAvatarClose}
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