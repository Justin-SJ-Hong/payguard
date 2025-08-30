import { useEffect } from 'react';
import { useProposalStore } from '../store/proposalStore';
import formatNumber from '../utils/formatNumber';

export const useTotalSplitValidation = () => {
  const { total_amount, prepay_ratio, postpay_ratio, midpayAmounts, currency, setError, clearError } = useProposalStore();

  const totalAmount = total_amount;
  const prepayRatio = prepay_ratio || 0;
  const postpayRatio = postpay_ratio || 0;
  const midpayAmountsArray = midpayAmounts || [];

  useEffect(() => {
    if (!totalAmount || totalAmount <= 0) return;

    const prepayAmount = Math.floor((totalAmount * prepayRatio) / 100);
    const postpayAmount = Math.floor((totalAmount * postpayRatio) / 100);
    const midpayTotal = midpayAmountsArray.reduce((sum: number, item: any) => {
      const amount = Number(item.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const splitSum = prepayAmount + midpayTotal + postpayAmount;

    if (splitSum !== totalAmount) {
      setError('total_amount', `총 분할 금액 (${formatNumber(splitSum)} ${currency})가 총 계약 금액과 일치하지 않습니다.`);
    } else {
      clearError('total_amount');
    }
  }, [totalAmount, prepayRatio, postpayRatio, midpayAmountsArray, setError, clearError, currency]);

  return {
    totalAmount,
    prepayRatio,
    postpayRatio,
    midpayAmounts: midpayAmountsArray,
    currency,
  };
};
