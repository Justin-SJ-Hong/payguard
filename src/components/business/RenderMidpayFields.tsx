import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { useProposalStore } from '../../store/proposalStore';

interface MidpayAmount {
  amount: number;
  date: string;
}

interface RenderMidpayFieldsProps {
  currency?: string;
  midpayCount: number;
  formatNumber: (value: number | string) => string;
  midpayTotal: number;
  midpayRemain: number;
  midpayAmounts: MidpayAmount[];
  totalContractAmount: number;
  onMidpayChange?: (totalMidpayRatio: number) => void;
}

const RenderMidpayFields: React.FC<RenderMidpayFieldsProps> = ({
  currency,
  midpayCount,
  formatNumber,
  midpayTotal,
  midpayRemain,
  midpayAmounts,
  totalContractAmount,
  onMidpayChange,
}) => {
  const count = Number(midpayCount) || 0;
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [localMidpayTotal, setLocalMidpayTotal] = useState(midpayTotal);
  const [localMidpayRemain, setLocalMidpayRemain] = useState(midpayRemain);
  const { setMidpayAmount, errors } = useProposalStore();

  // props 변경을 감시하여 로컬 상태 업데이트
  useEffect(() => {
    setLocalMidpayTotal(midpayTotal);
    setLocalMidpayRemain(midpayRemain);
  }, [midpayTotal, midpayRemain]);

  return (
    <>
      <Box className="flex flex-wrap gap-1">
        {Array.from({ length: count }).map((_, index) => {
          // index까지의 합계
          const sumSoFar = midpayAmounts
            .slice(0, index + 1)
            .reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
          const remain = localMidpayTotal - sumSoFar;

          return (
            <Paper key={index} variant="outlined">
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ minWidth: 200, display: 'flex' }}>
                중간 지급 {index + 1}회 금액
              </Typography>
              <Box className="flex flex-col sm:flex-row">
                <Box className="flex-2">
                  <TextField
                    size="small"
                    value={formatNumber(midpayAmounts[index]?.amount || 0)}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/,/g, '');
                      const newValue = Number(rawValue);
                      
                      // Zustand 스토어에 직접 업데이트
                      setMidpayAmount(index, { amount: newValue });
                      
                      // 중간 지급액 변경 시 부모 컴포넌트에 알림
                      if (onMidpayChange) {
                        const totalMidpayRatio = midpayAmounts.reduce((sum, item, idx) => {
                          if (idx === index) {
                            return sum + (newValue / totalContractAmount * 100);
                          }
                          return sum + (Number(item?.amount || 0) / totalContractAmount * 100);
                        }, 0);
                        onMidpayChange(totalMidpayRatio);
                      }
                    }}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(null)}
                    sx={{ width: 165 }}
                  />
                  {/* 포커스된 입력란에만 남은 금액 표시 */}
                  {focusedIndex === index && (
                    <Typography
                      variant="body2"
                      color={remain === 0 ? 'primary' : remain < 0 ? 'error' : 'text.secondary'}
                      sx={{ mt: 1 }}
                    >
                      남은 중간 지급 금액: {formatNumber(remain)} {currency}
                    </Typography>
                  )}
                </Box>
                <Box className="flex-1">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      label="지급 예정일"
                      value={midpayAmounts[index]?.date || ''}
                      placeholder="YYYY-MM-DD"
                      size="small"
                      sx={{ width: 165 }}
                      error={!!errors[`midpayAmounts.${index}.date`]}
                      helperText={errors[`midpayAmounts.${index}.date`] || ''}
                      inputProps={{
                        maxLength: 10
                      }}
                      onChange={(e) => {
                        let value = e.target.value;
                        // YYYY-MM-DD 형식으로 자동 포맷팅
                        if (value.length === 4 && !value.includes('-')) {
                          value = value + '-';
                        } else if (value.length === 7 && value.split('-').length === 2) {
                          value = value + '-';
                        }
                        setMidpayAmount(index, { date: value });
                      }}
                    />
                    <DatePicker
                      open={false}
                      value={midpayAmounts[index]?.date ? dayjs(midpayAmounts[index].date) : null}
                      format="YYYY-MM-DD"
                      onChange={(date) => {
                        const value = date && typeof date !== 'string' && 'format' in date
                          ? date.format('YYYY-MM-DD')
                          : '';
                        setMidpayAmount(index, { date: value });
                      }}
                      slotProps={{
                        textField: {
                          sx: { display: 'none' }
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </>
  );
};

export default RenderMidpayFields;