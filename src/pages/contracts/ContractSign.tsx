import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router";
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { supabase } from "../../lib/supabase";
import { generateContractPDF } from "../../services/contractService";
import SignatureCanvas from "../../components/forms/SignatureCanvas";

interface ContractData {
  id: string;
  title: string;
  total_amount: number;
  currency: string;
  start_date: string;
  end_date: string;
  client_name: string;
  freelancer_name: string;
  client_signature_url: string;
  freelancer_signature_url: string;
  client_signature_date: string;
  freelancer_signature_date: string;
  status: string;
  proposal_id: string;
}

function ContractSign() {
  const params = useParams();
  const id = params.id;
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') as 'client' | 'freelancer';
  const navigate = useNavigate();
  const [contract, setContract] = useState<ContractData | null>(null);
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    console.log('useEffect 실행됨');
    console.log('params:', params); // 전체 params 객체 확인
    console.log('id:', id);

    const checkAuthAndPermission = async () => {
      try {
        // 1. 현재 로그인한 사용자 정보 가져오기
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          setError('로그인이 필요합니다.');
          setLoading(false);
          return;
        }

        setCurrentUser(user);

        // 2. 계약 정보 가져오기
        const { data: contractData, error: contractError } = await supabase
          .from("contracts")
          .select("*")
          .eq("id", id)
          .single();

        if (contractError) {
          throw contractError;
        }

        if (!contractData) {
          setError('계약 정보를 찾을 수 없습니다.');
          setLoading(false);
          return;
        }

        setContract(contractData);

        // 3. 권한 확인
        let hasAccess = false;
        
        if (role === 'client') {
          // 클라이언트 역할로 접근하려면 클라이언트 이메일과 일치해야 함
          hasAccess = user.email === contractData.client_email;
        } else if (role === 'freelancer') {
          // 프리랜서 역할로 접근하려면 프리랜서 이메일과 일치해야 함
          hasAccess = user.email === contractData.freelancer_email;
        }

        if (!hasAccess) {
          setError('이 계약에 서명할 권한이 없습니다.');
          setLoading(false);
          return;
        }

        setHasPermission(true);
      } catch (err) {
        console.error('계약 조회 오류:', err);
        setError(err instanceof Error ? err.message : '계약 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndPermission();
  }, [id, role]);

  const handleSignatureSave = (signatureDataUrl: string) => {
    setSignatureImage(signatureDataUrl);
    setSignature('서명 완료'); // 기존 텍스트 필드와 호환성 유지
  };

  const handleSignatureSubmit = async () => {
    if (!signatureImage) {
      alert('서명을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
        // 1. 서명 이미지를 Supabase Storage에 저장
        const signatureFileName = `signature_${role}_${id}_${Date.now()}.png`;
        
        // Data URL을 Blob으로 변환
        const response = await fetch(signatureImage);
        const signatureBlob = await response.blob();

        // signature 버킷에 업로드
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('사용자 인증이 필요합니다.');
        }

        const filePath = `${user.id}/${signatureFileName}`;
        
        const { error: uploadError } = await supabase.storage
            .from('signatures')
            .upload(filePath, signatureBlob, {
                contentType: 'image/png'
            });

        if (uploadError) {
            throw new Error('서명 이미지 저장 실패: ' + uploadError.message);
        }

        // 2. 서명 URL을 contracts 테이블에 저장
        const { data: publicUrlData } = supabase.storage
            .from('signatures')
            .getPublicUrl(filePath);

        const signatureUrl = publicUrlData.publicUrl;

        const updateData = role === 'client' 
        ? { 
            client_signature_url: signatureUrl,
            client_signature_date: new Date().toISOString()
            }
        : { 
            freelancer_signature_url: signatureUrl,
            freelancer_signature_date: new Date().toISOString()
            };
        
        const { error: updateError } = await supabase
            .from("contracts")
            .update(updateData)
            .eq('id', id)
            .select();

        if (updateError) {
            console.error('업데이트 에러:', updateError);
            throw updateError;
        }

        console.log('서명 정보 업데이트 성공');

      // 2. 양측 서명 완료 여부 확인
        const { data: contractData } = await supabase
            .from("contracts")
            .select("client_signature_url, freelancer_signature_url")
            .eq('id', id)
            .single();

        console.log('현재 서명 상태:', contractData);
        if (contractData?.client_signature_url && contractData?.freelancer_signature_url) {
        // 양측 서명 완료 시 - 계약서 생성 및 완료 처리
        setSuccess(true);
        console.log('양측 서명 완료! 계약서 생성 시작');
        
        // 여기서 계약서 생성 로직 호출 필요
        // await generateContractPDF(contractId);
        try {
            // proposal_id를 포함하여 계약 데이터 조회
            const { data: fullContractData } = await supabase
                .from("contracts")
                .select("proposal_id")
                .eq('id', id)
                .single();

            if (!fullContractData?.proposal_id) {
                throw new Error('제안서 ID를 찾을 수 없습니다.');
            }

            if (!id) {
                throw new Error('계약 ID가 없습니다.');
            }

            await generateContractPDF(id!, fullContractData.proposal_id!);

            // 제안서 상태를 'accepted'로 변경
            const { error: finalUpdateError } = await supabase
                .from('proposals')
                .update({ status: 'accepted' })
                .eq('id', fullContractData.proposal_id);

            if (finalUpdateError) {
                throw new Error('최종 상태 업데이트 실패: ' + finalUpdateError.message);
            }

            console.log('계약 완료!');

            // 3초 후 메인 페이지로 이동
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (error) {
            console.error('계약서 생성 오류:', error);
            setError(error instanceof Error ? error.message : '계약서 생성에 실패했습니다.');
        }
        
        
      } else {
        setSuccess(true);
        console.log(`${role} 서명 완료, 상대방 서명 대기 중`);
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : '서명 처리에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{ mr: 1 }}
          >
            메인으로 이동
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/member/login')}
          >
            로그인 페이지로
          </Button>
        </Box>
      </Box>
    );
  }

  if (!hasPermission) {
    return (
      <Box p={3}>
        <Alert severity="warning">
          이 계약에 서명할 권한이 없습니다. 올바른 계정으로 로그인해주세요.
        </Alert>
      </Box>
    );
  }

  if (success) {
    return (
      <Box p={4} maxWidth="600px" mx="auto">
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" color="success.main" gutterBottom>
            ✅ 서명이 완료되었습니다!
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {role === 'client' ? '클라이언트' : '프리랜서'} 서명이 성공적으로 처리되었습니다.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            상대방의 서명도 완료되면 계약이 성립됩니다.
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (!contract) {
    return (
      <Box p={3}>
        <Alert severity="warning">계약 정보를 찾을 수 없습니다.</Alert>
      </Box>
    );
  }

  return (
    <Box p={4} maxWidth="800px" mx="auto">
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom textAlign="center" color="primary">
          📄 계약서 서명
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        {/* 계약 정보 */}
        <Box sx={{ mb: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            �� 계약 정보
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Typography><strong>프로젝트:</strong> {contract.title}</Typography>
            <Typography><strong>계약 금액:</strong> {contract.total_amount} {contract.currency}</Typography>
            <Typography><strong>계약 기간:</strong> {contract.start_date} ~ {contract.end_date}</Typography>
            <Typography><strong>클라이언트:</strong> {contract.client_name}</Typography>
            <Typography><strong>프리랜서:</strong> {contract.freelancer_name}</Typography>
          </Box>
        </Box>

        {/* 서명 영역 */}
        <Box sx={{ mb: 4, p: 3, border: '2px solid #007bff', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                ✍️ 서명 영역
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {role === 'client' ? '클라이언트' : '프리랜서'}로서 계약 내용에 동의하고 서명합니다.
            </Typography>
            
            <SignatureCanvas
                onSave={handleSignatureSave}
                placeholder={`${role === 'client' ? contract.client_name : contract.freelancer_name}님의 서명을 그려주세요`}
            />
            
            {signatureImage && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="success.main">
                    ✅ 서명이 완료되었습니다
                </Typography>
                </Box>
            )}
            
            <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSignatureSubmit}
                disabled={submitting || !signatureImage}
                sx={{ py: 2, mt: 2 }}
            >
                {submitting ? <CircularProgress size={24} /> : '�� 서명 제출'}
            </Button>
        </Box>

        {/* 안내사항 */}
        <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
          <Typography variant="body2" color="info.main">
            �� 서명을 완료하면 계약이 성립됩니다. 신중하게 검토 후 서명해주세요.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default ContractSign;