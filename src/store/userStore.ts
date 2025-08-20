// src/store/userStore.ts (고급 버전)
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { uploadAvatar } from '../lib/uploadAvatar';
import { useEffect } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
}

interface UserState {
    user: User | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (userData: {
        email: string;
        password: string;
        name: string;
        phone: string;
        user_type: 'freelancer' | 'client';
        avatar?: File;
        address?: string;
        postal_code?: string;
    }) => Promise<void>;
    updateAvatar: (avatarFile: File) => Promise<void>;
    clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
    user: null,
    isLoading: false,
    error: null,

    login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
        
            if (error) throw error;
        
            if (data.user) {
                // 프로필 정보 가져오기 (소프트 삭제 계정 차단)
                const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

                if (!profile) {
                    set({ error: '프로필을 찾을 수 없습니다.', isLoading: false });
                    return;
                }

                if ((profile as any).is_deleted) {
                    await supabase.auth.signOut();
                    set({ user: null, isLoading: false, error: '비활성화된 계정입니다. 관리자에게 문의하세요.' });
                    return;
                }

                set({ 
                    user: profile as any, 
                    isLoading: false 
                });
            }
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Login failed', 
                isLoading: false 
            });
        }
    },

    logout: async () => {
        set({ isLoading: true });
        
        try {
            await supabase.auth.signOut();
            set({ user: null, isLoading: false });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Logout failed', 
                isLoading: false 
            });
        }
    },

    register: async (userData) => {
        set({ isLoading: true, error: null });
      
        try {
          // 1. 회원가입
            const { data, error } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
            });
      
            if (error) throw error;
      
            const user = data.user;
            if (!user) throw new Error('사용자 정보를 가져올 수 없습니다.');
      
            // 2. 프로필 이미지 업로드
            let avatarUrl = '';
            if (userData.avatar) {
                avatarUrl = await uploadAvatar(user.id, userData.avatar);
            }
      
          // 3. 프로필 정보 저장
            const { error: profileError } = await supabase.from('profiles').insert({
                id: user.id,
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                avatar_url: avatarUrl,
                auth_type: 'email',
                user_type: userData.user_type,  // ← 이제 하드코딩 X
                address: userData.address || '',  // ← optional 처리
                postal_code: userData.postal_code || '',
            });
        
            if (profileError) throw profileError;
      
          // 4. Zustand 상태 업데이트
            set({
                user: {
                    id: user.id,
                    name: userData.name,
                    email: userData.email,
                    avatar_url: avatarUrl,
                },
                isLoading: false,
            });

        } catch (error) {
            console.error('Register Error:', error);
            set({
                error: error instanceof Error ? error.message : 'Registration failed',
                isLoading: false,
            });
        }
    },

    updateAvatar: async (avatarFile: File) => {
        const { user } = get();
        if (!user) return;

        const avatarUrl = await uploadAvatar(user.id, avatarFile);

        // 프로필 업데이트
        const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

        if (updateError) throw updateError;

        set({
            user: { ...user, avatar_url: avatarUrl },
            isLoading: false,
        });

    },

    clearError: () => set({ error: null }),
}));

// useEffect(() => {
//   const getUser = async () => {
//     const { data: { session } } = await supabase.auth.getSession();
//     if (session?.user) {
//       // 프로필 정보 fetch 후 useUserStore.setState로 저장
//       const { data: profile } = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('id', session.user.id)
//         .single();

//       useUserStore.setState({ user: profile });
//     }
//   };
//   getUser();
// }, []);