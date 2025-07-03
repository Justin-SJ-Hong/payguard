import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

type ContractType = {
  id: string;
  title: string;
  name: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
};

export default function ContractList() {
  const [contracts, setContracts] = useState<ContractType[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await fetch("/api/contracts"); // ✅ 여긴 실제 API 주소에 맞게 변경
        const data = await res.json();
        setContracts(data);
      } catch (error) {
        console.error("계약 목록 로딩 실패", error);
      }
    };

    fetchContracts();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h5" fontWeight="bold">
          📂 계약 목록
        </Typography>
        <Button
          variant="contained"
          color="success"
          onClick={() => navigate("/contracts/new")}
        >
          + 새 계약 만들기
        </Button>
      </Box>

      {contracts.map((contract) => (
        <Paper key={contract.id} variant="outlined" sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6">{contract.title}</Typography>
          <Typography>
            {contract.name} | {contract.startDate} ~ {contract.endDate}
          </Typography>
          <Typography>
            총 금액: ${contract.totalAmount.toLocaleString()}
          </Typography>

          <Box className="mt-2">
            <Button
              variant="outlined"
              onClick={() => navigate(`/contracts/${contract.id}/view`)}
            >
              자세히 보기
            </Button>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
