import { useEffect } from 'react';
import { useProposalStore } from '../store/proposalStore';
/**
 * 선불, 후불 비율 검증
 * @returns null
 */
const SplitRatioValidator = () => {
  const { prepay_ratio, postpay_ratio, setError, clearError } = useProposalStore();
  const prepay = Number(prepay_ratio ?? 0);
  const postpay = Number(postpay_ratio ?? 0);

  useEffect(() => {
    if (prepay + postpay > 100) {
      setError('prepay_ratio', '선불 + 후불 비율의 합이 100을 초과할 수 없습니다.');
      setError('postpay_ratio', '선불 + 후불 비율의 합이 100을 초과할 수 없습니다.');
    } else {
      clearError('prepay_ratio');
      clearError('postpay_ratio');
    }
  }, [prepay, postpay, setError, clearError]);

  return null;
};

export default SplitRatioValidator; 