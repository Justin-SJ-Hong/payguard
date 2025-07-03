import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip
} from "@mui/material";
import { useEffect, useState } from "react";

type Payment = {
  id: string;
  contractTitle: string;
  payer: string;
  amount: number;
  type: "선불" | "중간" | "후불";
  status: "확인됨" | "미확인";
  date: string; // ISO string
};

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payments")
      .then(res => res.json())
      .then(data => setPayments(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box className="p-6">
      <Typography variant="h5" fontWeight="bold" className="mb-6">
        💰 입금 내역
      </Typography>

      {loading ? (
        <Box className="flex justify-center items-center h-40">
          <CircularProgress />
        </Box>
      ) : payments.length === 0 ? (
        <Typography>입금 내역이 없습니다.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>입금일</TableCell>
                <TableCell>입금자</TableCell>
                <TableCell>금액 (USD)</TableCell>
                <TableCell>유형</TableCell>
                <TableCell>계약명</TableCell>
                <TableCell>상태</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((pay) => (
                <TableRow key={pay.id}>
                  <TableCell>{new Date(pay.date).toLocaleDateString()}</TableCell>
                  <TableCell>{pay.payer}</TableCell>
                  <TableCell>${pay.amount.toFixed(2)}</TableCell>
                  <TableCell>{pay.type}</TableCell>
                  <TableCell>{pay.contractTitle}</TableCell>
                  <TableCell>
                    <Chip
                      label={pay.status}
                      color={pay.status === "확인됨" ? "success" : "warning"}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
