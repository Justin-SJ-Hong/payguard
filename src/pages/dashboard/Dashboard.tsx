import React from 'react'
import { Box, Typography, Paper, Button, Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';


export default function Dashboard() {
  const userName = useSelector((state: RootState) => state.user.userName);

  const summaryItems = [
    { title: '총 계약 수', value: '12', color: 'text-green-600' },
    { title: '미입금 계약 수', value: '3', color: 'text-red-600' },
    { title: '총 입금 완료액', value: '$8,200.55', color: 'text-amber-600' },
    { title: '미확인 입금건', value: '1', color: 'text-red-600' },
  ];

  return (
    <Box className="p-8">
      {/* 👋 인사말 */}
      <Typography variant="h5" className="font-bold mb-6">
        👋 “안녕하세요 {userName}님”
      </Typography>

      {/* 요약 카드 */}
      <Typography variant="h6" className="font-bold mb-2">요약 카드</Typography>
      {/* <Grid container spacing={2} className="mb-8">
        <Grid item={true} xs={6} md={3}>
          <Paper className="p-4 text-center" elevation={3}>
            <Typography variant="subtitle2">총 계약 수</Typography>
            <Typography variant="h6" className="text-green-600 font-bold">12</Typography>
          </Paper>
        </Grid>
        <Grid item={true} xs={6} md={3}>
          <Paper className="p-4 text-center" elevation={3}>
            <Typography variant="subtitle2">미입금 계약 수</Typography>
            <Typography variant="h6" className="text-red-600 font-bold">3</Typography>
          </Paper>
        </Grid>
        <Grid item={true} xs={6} md={3}>
          <Paper className="p-4 text-center" elevation={3}>
            <Typography variant="subtitle2">총 입금 완료액</Typography>
            <Typography variant="h6" className="text-amber-600 font-bold">$8,200.55</Typography>
          </Paper>
        </Grid>
        <Grid item={true} xs={6} md={3}>
          <Paper className="p-4 text-center" elevation={3}>
            <Typography variant="subtitle2">미확인 입금건</Typography>
            <Typography variant="h6" className="text-red-600 font-bold">1</Typography>
          </Paper>
        </Grid>
      </Grid> */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
        {summaryItems.map((item, idx) => (
          <Paper
            key={idx}
            elevation={3}
            className={`p-4 text-center flex-1 min-w-[150px]`}
            sx={{ flexBasis: { xs: '100%', sm: '48%', md: '23%' } }}
          >
            <Typography variant="subtitle2">{item.title}</Typography>
            <Typography variant="h6" className={`${item.color} font-bold`}>
              {item.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* 최근 계약 리스트 */}
      <Typography variant="h6" className="font-bold mb-2">최근 계약 리스트</Typography>
      <table className="w-full table-auto border mb-4 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">계약명</th>
            <th className="border px-2 py-1">클라이언트명</th>
            <th className="border px-2 py-1">상태</th>
            <th className="border px-2 py-1">금액</th>
            <th className="border px-2 py-1">마지막 정산일</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-2 py-1">디자인작업</td>
            <td className="border px-2 py-1">John</td>
            <td className="border px-2 py-1">진행중</td>
            <td className="border px-2 py-1">$500.00</td>
            <td className="border px-2 py-1">2025-06-04</td>
          </tr>
          <tr>
            <td className="border px-2 py-1">개발 의뢰</td>
            <td className="border px-2 py-1">Alice</td>
            <td className="border px-2 py-1">미입금</td>
            <td className="border px-2 py-1">$800.00</td>
            <td className="border px-2 py-1">2025-06-03</td>
          </tr>
        </tbody>
      </table>
      <Button variant="outlined" color="success">+ 새 계약 만들기</Button>

      {/* 이메일/알림 */}
      <Box className="mt-10">
        <Typography variant="h6" className="font-bold mb-2">이메일 발송 현황</Typography>
        <Typography>오늘 발송한 메일 : 2건 / 실패 : 0건</Typography>
      </Box>

      <Box className="mt-6">
        <Typography variant="h6" className="font-bold mb-2">오늘의 알림</Typography>
        <Typography className="text-green-700">✅ 입금 완료 : 디자인 작업 ($150)</Typography>
        <Typography className="text-yellow-800">⚠️ 미확인 입금 발생 : Alice ($300)</Typography>
      </Box>
    </Box>
  );
}

// export default Dashboard
