// src/components/AvatarUpload.tsx
import React, { useState } from 'react';
import { Box, Button, Avatar, Typography, IconButton } from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';

interface AvatarUploadProps {
  onAvatarChange: (file: File | null) => void;
  currentAvatarUrl?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  onAvatarChange, 
  currentAvatarUrl 
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 미리보기 URL 생성
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onAvatarChange(file);
  };

  const handleRemoveAvatar = () => {
    setPreviewUrl(null);
    onAvatarChange(null);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <Avatar
        src={previewUrl || undefined}
        sx={{ width: 100, height: 100, border: '2px solid #ddd' }}
      />
      
      <Box display="flex" gap={1}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<PhotoCamera />}
        >
          아바타 선택
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileChange}
          />
        </Button>
        
        {previewUrl && (
          <IconButton 
            color="error" 
            onClick={handleRemoveAvatar}
            title="아바타 제거"
          >
            <Delete />
          </IconButton>
        )}
      </Box>
      
      <Typography variant="caption" color="text.secondary">
        JPG, PNG 파일만 가능 (최대 5MB)
      </Typography>
    </Box>
  );
};