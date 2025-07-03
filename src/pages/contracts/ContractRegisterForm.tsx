import { useMemo } from "react";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import {
  Box, Button, Paper, Typography, TextField,
  FormControlLabel, Checkbox, InputAdornment
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { format, differenceInCalendarDays } from 'date-fns';

export type ContractFormData = {
  clientId: string;
  title: string;
  description?: string;
  totalAmount: number;
  startDate: Date | null;
  endDate: Date | null;
  prepayRatio?: number;
  postpayRatio?: number;
  useMidpay: boolean;
  midpayCount?: number;
  midpayAmounts?: number[];
  attachments?: File[];
};

export default function ContractRegisterForm() {
    const { register, handleSubmit, control, formState: { errors }, watch } = useForm<ContractFormData>();

    const onSubmit = (data: any) => {
        const formattedData = {
            ...data,
            startDate: format(data.startDate, "yyyy-MM-dd"),
            endDate: format(data.endDate, "yyyy-MM-dd"),
        };

        console.log(formattedData); // 혹은 axios.post(...)
    };

    const startDate = watch("startDate");
    const endDate = watch("endDate");
    const contractDays = useMemo(() => {
        if (startDate && endDate) {
            const diff = differenceInCalendarDays(endDate, startDate);
            return diff > 0 ? diff : 0;
        }
        return 0;
    }, [startDate, endDate]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
        <form onSubmit={handleSubmit(onSubmit)}>
            

            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>🧾 기본정보 입력</Typography>

                <Box className="flex flex-col sm:flex-row gap-4 mb-3">
                <TextField
                    fullWidth
                    label="계약 제목"
                    {...register("title", { required: "계약 제목은 필수입니다" })}
                    error={!!errors.title}
                    helperText={errors.title?.message}
                />
                <TextField
                    fullWidth
                    label="계약 설명"
                    {...register("description")}
                />
                </Box>

                <TextField
                fullWidth
                label="계약 총 금액 (USD)"
                type="number"
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                {...register("totalAmount", { required: "금액은 필수입니다" })}
                error={!!errors.totalAmount}
                helperText={errors.totalAmount?.message}
                />

                <Controller
                    name="startDate"
                    control={control}
                    defaultValue={null}
                    render={({ field }) => (
                        <DatePicker
                            label="계약 시작일"
                            format="yyyy-MM-dd"
                            {...field}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    error: !!errors.startDate,
                                    helperText: errors.startDate?.message,
                                },
                            }}
                        />
                    )}
                />

                <Controller
                    name="endDate"
                    control={control}
                    defaultValue={null}
                    rules={{
                        required: "종료일은 필수입니다",
                        validate: (value) => {
                            const start = watch("startDate");

                            if (!start || !value) return true; // 둘 중 하나라도 비어 있으면 통과

                            const startDate = new Date(start);
                            const endDate = new Date(value);

                            return endDate > startDate || "종료일은 시작일 이후여야 합니다";
                        },
                    }}
                    render={({ field, fieldState }) => (
                        <DatePicker
                            label="계약 마감일"
                            format="yyyy-MM-dd"
                            {...field}
                            onChange={(date) => field.onChange(date)}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    sx: { mt: 2 },
                                    error: !!fieldState.error,
                                    helperText: fieldState.error?.message,
                                },
                            }}
                        />
                    )}
                />
            </Paper>

            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>💰 지급 방식 결정</Typography>

                <Box className="flex flex-col sm:flex-row gap-4 mb-3">
                <TextField
                    fullWidth
                    label="선불 비율 (%)"
                    type="number"
                    {...register("prepayRatio")}
                />
                <TextField
                    fullWidth
                    label="후불 비율 (%)"
                    type="number"
                    {...register("postpayRatio")}
                />
                </Box>

                <FormControlLabel
                control={
                    <Controller
                    name="useMidpay"
                    control={control}
                    defaultValue={false}
                    render={({ field }) => <Checkbox {...field} checked={field.value} />}
                    />
                }
                label="중간 지급 사용"
                />

                <Box className="flex flex-col sm:flex-row gap-4 mt-2">
                <TextField
                    fullWidth
                    label="중간 지급 횟수"
                    type="number"
                    {...register("midpayCount")}
                />
                <TextField
                    fullWidth
                    label="중간 지급 금액"
                    type="number"
                    {...register("midpayAmounts.0")}
                />
                </Box>
            </Paper>

            <Box display="flex" justifyContent="center" gap={2}>
                <Button type="submit" variant="contained" color="primary">계약 등록</Button>
                <Button variant="outlined">대시보드로 돌아가기</Button>
            </Box>
        </form>
    </LocalizationProvider>
    
  );
}
