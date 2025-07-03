import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
} from "@mui/material";

type ContractType = {
  id: string;
  title: string;
  description: string;
  name: string;
  email: string;
  totalAmount: number;
  prepayRatio: number;
  midpayCount: number;
  midpayAmount: number;
  postpayRatio: number;
  startDate: string;
  endDate: string;
  message?: string;
};

export default function View() {
  const { id } = useParams();
  const [contract, setContract] = useState<ContractType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const res = await fetch(`/api/contracts/${id}`);
        const data = await res.json();
        setContract(data);
      } catch (err) {
        console.error("계약 정보를 불러오는 데 실패했습니다", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [id]);

  if (loading) return <CircularProgress sx={{ m: 4 }} />;

  if (!contract)
    return <Typography sx={{ m: 4 }}>계약 정보를 찾을 수 없습니다.</Typography>;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        📄 계약서 열람
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          📝 기본 정보
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Typography>제목: {contract.title}</Typography>
        <Typography>설명: {contract.description}</Typography>
        <Typography>
          기간: {contract.startDate} ~ {contract.endDate}
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          👤 상대방 정보
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Typography>이름: {contract.name}</Typography>
        <Typography>이메일: {contract.email}</Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          💵 금액 및 지급 조건
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Typography>총 계약 금액: ${contract.totalAmount.toLocaleString()}</Typography>
        <Typography>선불 비율: {contract.prepayRatio}%</Typography>
        <Typography>중간 지급 횟수: {contract.midpayCount}</Typography>
        <Typography>중간 지급 금액: ${contract.midpayAmount}</Typography>
        <Typography>후불 비율: {contract.postpayRatio}%</Typography>
      </Paper>

      {contract.message && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            ✉️ 제안 메시지
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography>{contract.message}</Typography>
        </Paper>
      )}
    </Box>
  );
}
