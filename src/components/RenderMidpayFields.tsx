import React, { useState } from 'react';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { Paper, Typography, Box, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { useProposalStore } from '../store/proposalStore';

interface MidpayAmount {
  amount: number;
  date: string;
}

interface RenderMidpayFieldsProps {
  currency?: string;
  midpayCount: number;
  control: Control<any>;
  errors: FieldErrors<any>;
  formatNumber: (value: number | string) => string;
  midpayTotal: number;
  midpayRemain: number;
  midpayAmounts: MidpayAmount[];
}

const RenderMidpayFields: React.FC<RenderMidpayFieldsProps> = ({
  currency,
  midpayCount,
  control,
  errors,
  formatNumber,
  midpayTotal,
  midpayRemain,
  midpayAmounts,
}) => {
  const count = Number(midpayCount) || 0;
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const setField = useProposalStore((state) => state.setField);

  return (
    <>
      {Array.from({ length: count }).map((_, index) => {
        // index까지의 합계
        const sumSoFar = midpayAmounts
          .slice(0, index + 1)
          .reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
        const remain = midpayTotal - sumSoFar;

        return (
          <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              중간 지급 {index + 1}회 금액
            </Typography>
            <Box className="flex flex-col sm:flex-row gap-4">
              <Box className="flex-2">
                <Controller
                  name={`midpayAmounts.${index}.amount`}
                  control={control}
                  defaultValue={0}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      label={`중간 지급 금액 ${index + 1}`}
                      value={formatNumber(field.value)}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/,/g, '');
                        field.onChange(Number(rawValue));
                      }}
                      error={!!(Array.isArray(errors.midpayAmounts) && errors.midpayAmounts[index]?.amount)}
                      helperText={Array.isArray(errors.midpayAmounts) ? errors.midpayAmounts[index]?.amount?.message : ''}
                      onFocus={() => setFocusedIndex(index)}
                      onBlur={() => setFocusedIndex(null)}
                    />
                  )}
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
                <Controller
                  control={control}
                  name={`midpayAmounts.${index}.date`}
                  defaultValue=""
                  render={({ field }) => (
                    <DatePicker
                      label="지급 예정일"
                      value={field.value ? dayjs(field.value) : null}
                      format="YYYY-MM-DD"
                      onChange={(date) => {
                        const value = date && typeof date !== 'string' && 'format' in date
                          ? date.format('YYYY-MM-DD')
                          : '';
                        field.onChange(value);
                        // zustand에도 반영
                        const updated = [...midpayAmounts];
                        updated[index] = { ...updated[index], date: value };
                        setField('midpayAmounts', updated);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!(Array.isArray(errors.midpayAmounts) && errors.midpayAmounts[index]?.date),
                          helperText: Array.isArray(errors.midpayAmounts) ? errors.midpayAmounts[index]?.date?.message : '',
                        },
                      }}
                    />
                  )}
                />
              </Box>
            </Box>
          </Paper>
        );
      })}
    </>
  );
};

export default RenderMidpayFields;