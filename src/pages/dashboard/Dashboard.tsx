import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

import React, { useState, useEffect } from 'react'
import { Box, Typography, Paper, Button, Grid } from '@mui/material';
import { useUserStore } from '../../store/userStore';
import { supabase } from '../../lib/supabase';


export default function Dashboard() {
  const userName = useUserStore((state) => state.user?.name || '');
  const [emailStats, setEmailStats] = useState({ sent: 0, failed: 0 });
  const [recentProposals, setRecentProposals] = useState<any[]>([]);
  const [rowData, setRowData] = useState<any[]>([]);
  const columnDefs = [ 
    { headerName: '계약명', field: 'title', flex: 1 },
    { headerName: '클라이언트명', field: 'client', flex: 1 },
    { headerName: '상태', field: 'status', flex: 1 },
    { headerName: '금액', field: 'amount', flex: 1, valueFormatter: (p: { value: number }) => `$${p.value}` },
    { headerName: '마지막 정산일', field: 'lastDate', flex: 1 },
  ];

  ModuleRegistry.registerModules([ AllCommunityModule ]);

  useEffect(() => {
    // 오늘 발송된 이메일 통계 가져오기
    const fetchEmailStats = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // 실제 구현에서는 이메일 로그 테이블에서 가져와야 함
      // 현재는 임시 데이터 사용
      setEmailStats({ sent: 2, failed: 0 });
    };

    // 최근 제안서 가져오기
    const fetchRecentProposals = async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setRecentProposals(data);
      }
    };

    fetchEmailStats();
    fetchRecentProposals();

    setRowData([
      { title: '디자인작업', client: 'John', status: '진행중', amount: 500, lastDate: '2025-06-04' },
      { title: '개발 의뢰', client: 'Alice', status: '미입금', amount: 800, lastDate: '2025-06-03' },
    ]);
  }, []);

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
      <div className="ag-theme-alpine" style={{ height: 250, width: '100%', marginBottom: 16 }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          domLayout="autoHeight"
          pagination={false}
          suppressCellFocus={true}
        />
      </div>
      <Button variant="outlined" color="success">+ 새 계약 만들기</Button>

      {/* 최근 제안서 */}
      {recentProposals.length > 0 && (
        <Box className="mt-8">
          <Typography variant="h6" className="font-bold mb-2">최근 제안서</Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            {recentProposals.map((proposal, index) => (
              <Box key={proposal.id || index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">{proposal.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {proposal.client_name} • ${proposal.total_amount} • {proposal.status}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Box>
      )}

      {/* 이메일/알림 */}
      <Box className="mt-10">
        <Typography variant="h6" className="font-bold mb-2">이메일 발송 현황</Typography>
        <Typography>
          오늘 발송한 메일 : {emailStats.sent}건 / 실패 : {emailStats.failed}건
        </Typography>
      </Box>

      <Box className="mt-6">
        <Typography variant="h6" className="font-bold mb-2">오늘의 알림</Typography>
        <Typography className="text-green-700">✅ 입금 완료 : 디자인 작업 ($150)</Typography>
        <Typography className="text-yellow-800">⚠️ 미확인 입금 발생 : Alice ($300)</Typography>
        {recentProposals.length > 0 && (
          <Typography className="text-blue-700">📧 최근 제안서 {recentProposals.length}건이 발송되었습니다</Typography>
        )}
      </Box>
    </Box>
  );
}

// export default Dashboard
