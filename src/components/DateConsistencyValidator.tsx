// src/components/DateConsistencyValidator.tsx
import { useProposalStore } from '../store/proposalStore';
import { useEffect } from 'react';
import dayjs from 'dayjs';

interface Props {
  setError: (name: string, error: any) => void;
  clearErrors: (name: string) => void;
}

const DateConsistencyValidator = ({ setError, clearErrors }: Props) => {
  const workPeriodStart = useProposalStore((state) => state.workPeriodStart);
  const workPeriodEnd = useProposalStore((state) => state.workPeriodEnd);
  const firstPayDate = useProposalStore((state) => state.firstPayDate);
  const lastPayDate = useProposalStore((state) => state.lastPayDate);
  const midpayAmounts = useProposalStore((state) => state.midpayAmounts);

  // 오늘 날짜(YYYY-MM-DD)
  const today = dayjs().format('YYYY-MM-DD');

  useEffect(() => {
    // 시작일이 오늘 이전이면 에러
    if (workPeriodStart && workPeriodStart < today) {
      setError('workPeriod.start', {
        type: 'validate',
        message: '작업 시작일은 오늘 이후여야 합니다.',
      });
    } else {
      clearErrors('workPeriod.start');
    }
    // 선불일 검증
    if (firstPayDate && workPeriodStart && firstPayDate < workPeriodStart) {
      setError('firstPayDate', {
        type: 'validate',
        message: '선불일은 작업 시작일 이후여야 합니다.',
      });
    } else {
      clearErrors('firstPayDate');
    }

    // 후불일 검증 (우선순위 에러만)
    let lastPayDateError = null;
    if (lastPayDate && workPeriodEnd && lastPayDate > workPeriodEnd) {
      lastPayDateError = '후불일은 작업 종료일 이전이어야 합니다.';
    } else if (firstPayDate && lastPayDate && firstPayDate >= lastPayDate) {
      lastPayDateError = '후불일은 선불일보다 늦어야 합니다.';
    }
    if (lastPayDateError) {
      setError('lastPayDate', {
        type: 'validate',
        message: lastPayDateError,
      });
    } else {
      clearErrors('lastPayDate');
    }

    // 작업 기간 순서
    if (workPeriodStart && workPeriodEnd && workPeriodStart >= workPeriodEnd) {
      setError('workPeriod.end', {
        type: 'validate',
        message: '작업 종료일은 시작일보다 늦어야 합니다.',
      });
    } else {
      clearErrors('workPeriod.end');
    }

    // 중간 지급일 검증
    for (let i = 0; i < midpayAmounts.length; i++) {
      const midpayDate = midpayAmounts[i]?.date || '';
      // 선불/후불 사이 검증
      if (
        midpayDate &&
        firstPayDate &&
        lastPayDate &&
        (midpayDate <= firstPayDate || midpayDate >= lastPayDate)
      ) {
        setError(`midpayAmounts.${i}.date`, {
          type: 'validate',
          message: '중간 지급일자는 선불/후불 예정일 사이여야 합니다.',
        });
        continue; // 아래 검증은 skip
      }

      // 이전 회차보다 빠른지(오름차순)
      if (
        midpayDate &&
        i > 0 &&
        midpayAmounts[i - 1]?.date &&
        midpayDate <= midpayAmounts[i - 1].date
      ) {
        setError(`midpayAmounts.${i}.date`, {
          type: 'validate',
          message: `이전 회차(${i}회차) 지급일보다 늦어야 합니다.`,
        });
        continue;
      }

      // 다음 회차보다 느린지(오름차순)
      if (
        midpayDate &&
        i < midpayAmounts.length - 1 &&
        midpayAmounts[i + 1]?.date &&
        midpayDate >= midpayAmounts[i + 1].date
      ) {
        setError(`midpayAmounts.${i}.date`, {
          type: 'validate',
          message: `다음 회차(${i + 2}회차) 지급일보다 빨라야 합니다.`,
        });
        continue;
      }

      // 통과 시 에러 해제
      clearErrors(`midpayAmounts.${i}.date`);
    }
  }, [firstPayDate, lastPayDate, workPeriodStart, workPeriodEnd, midpayAmounts, setError, clearErrors]);

  return null;
};

export default DateConsistencyValidator;
