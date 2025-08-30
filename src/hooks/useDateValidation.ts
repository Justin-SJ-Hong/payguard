import { useEffect } from 'react';
import { useProposalStore } from '../store/proposalStore';
import dayjs from 'dayjs';

interface UseDateValidationProps {
  setError: (name: string, error: any) => void;
  clearErrors: (name: string) => void;
}

export const useDateValidation = ({ setError, clearErrors }: UseDateValidationProps) => {
  const start_date = useProposalStore((state) => state.start_date);
  const end_date = useProposalStore((state) => state.end_date);
  const first_pay_date = useProposalStore((state) => state.first_pay_date);
  const last_pay_date = useProposalStore((state) => state.last_pay_date);
  const midpayAmounts = useProposalStore((state) => state.midpayAmounts);

  // 오늘 날짜(YYYY-MM-DD)
  const today = dayjs().format('YYYY-MM-DD');

  useEffect(() => {
    // 시작일이 오늘 이전이면 에러
    if (start_date && start_date < today) {
      setError('start_date', '작업 시작일은 오늘 이후여야 합니다.');
    } else {
      clearErrors('start_date');
    }

    // 선불일 검증
    if (first_pay_date && start_date && first_pay_date < start_date) {
      setError('first_pay_date', '선불일은 작업 시작일 이후여야 합니다.');
    } else {
      clearErrors('first_pay_date');
    }

    // 후불일 검증 (우선순위 에러만)
    let lastPayDateError = null;
    if (last_pay_date && end_date && last_pay_date > end_date) {
      lastPayDateError = '후불일은 작업 종료일 이전이어야 합니다.';
    } else if (first_pay_date && last_pay_date && first_pay_date >= last_pay_date) {
      lastPayDateError = '후불일은 선불일보다 늦어야 합니다.';
    }
    if (lastPayDateError) {
      setError('last_pay_date', lastPayDateError);
    } else {
      clearErrors('last_pay_date');
    }

    // 작업 기간 순서
    if (start_date && end_date && start_date >= end_date) {
      setError('end_date', '작업 종료일은 시작일보다 늦어야 합니다.');
    } else {
      clearErrors('end_date');
    }

    // 중간 지급일 검증
    for (let i = 0; i < midpayAmounts.length; i++) {
      const midpayDate = midpayAmounts[i]?.date || '';
      
      // 1. 선불/후불 사이 검증 (가장 중요한 검증)
      if (
        midpayDate &&
        first_pay_date &&
        last_pay_date &&
        (midpayDate <= first_pay_date || midpayDate >= last_pay_date)
      ) {
        setError(`midpayAmounts.${i}.date`, '중간 지급일자는 선불 예정일과 후불 예정일 사이여야 합니다.');
        continue; // 이 검증에 실패하면 다른 검증은 skip
      }

      // 2. 작업 기간 내 검증
      if (
        midpayDate &&
        start_date &&
        end_date &&
        (midpayDate < start_date || midpayDate > end_date)
      ) {
        setError(`midpayAmounts.${i}.date`, '중간 지급일자는 작업 기간 내에 있어야 합니다.');
        continue;
      }

      // 3. 이전 회차보다 빠른지(오름차순)
      if (
        midpayDate &&
        i > 0 &&
        midpayAmounts[i - 1]?.date &&
        midpayDate <= midpayAmounts[i - 1].date
      ) {
        setError(`midpayAmounts.${i}.date`, `이전 회차(${i}회차) 지급일보다 늦어야 합니다.`);
        continue;
      }

      // 4. 다음 회차보다 느린지(오름차순)
      if (
        midpayDate &&
        i < midpayAmounts.length - 1 &&
        midpayAmounts[i + 1]?.date &&
        midpayDate >= midpayAmounts[i + 1].date
      ) {
        setError(`midpayAmounts.${i}.date`, `다음 회차(${i + 2}회차) 지급일보다 빨라야 합니다.`);
        continue;
      }

      // 모든 검증 통과 시 에러 제거
      clearErrors(`midpayAmounts.${i}.date`);
    }
  }, [
    start_date,
    end_date,
    first_pay_date,
    last_pay_date,
    midpayAmounts,
    setError,
    clearErrors,
    today,
  ]);
};
