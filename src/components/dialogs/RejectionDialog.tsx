// src/components/RejectionDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Checkbox,
  Typography,
  Box,
} from '@mui/material';

import { RejectionData } from '../../type/rejection';

interface RejectionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (rejectionData: RejectionData) => void;
}

// interface RejectionData {
//   reason: string;
//   customReason?: string;
//   allowResubmit: boolean;
//   resubmitDeadline?: string;
// }

const rejectionReasons = [
  { value: 'budget', label: '예산 부족' },
  { value: 'timeline', label: '일정 불일치' },
  { value: 'scope', label: '작업 범위 불일치' },
  { value: 'quality', label: '품질 기준 불일치' },
  { value: 'experience', label: '경험 부족' },
  { value: 'other', label: '기타' },
];

export default function RejectionDialog({ open, onClose, onConfirm }: RejectionDialogProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [allowResubmit, setAllowResubmit] = useState(false);
  const [resubmitDeadline, setResubmitDeadline] = useState('');

  const handleConfirm = () => {
    if (!selectedReason) return;
    
    const rejectionData: RejectionData = {
      reason: selectedReason,
      customReason: selectedReason === 'other' ? customReason : undefined,
      allowResubmit,
      resubmitDeadline: allowResubmit ? resubmitDeadline : undefined,
    };
    
    onConfirm(rejectionData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>제안서 거절 사유</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            거절 사유를 선택해주세요:
          </Typography>
          <RadioGroup
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
          >
            {rejectionReasons.map((reason) => (
              <FormControlLabel
                key={reason.value}
                value={reason.value}
                control={<Radio />}
                label={reason.label}
              />
            ))}
          </RadioGroup>
        </Box>

        {selectedReason === 'other' && (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="세부 사유를 입력해주세요"
              multiline
              rows={3}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="거절 사유를 상세히 설명해주세요..."
            />
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={allowResubmit}
                onChange={(e) => setAllowResubmit(e.target.checked)}
              />
            }
            label="재제안 허용"
          />
          {allowResubmit && (
            <TextField
              fullWidth
              label="재제안 마감일"
              type="date"
              value={resubmitDeadline}
              onChange={(e) => setResubmitDeadline(e.target.value)}
              sx={{ mt: 1 }}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="error"
          disabled={!selectedReason || (selectedReason === 'other' && !customReason)}
        >
          거절 확인
        </Button>
      </DialogActions>
    </Dialog>
  );
}