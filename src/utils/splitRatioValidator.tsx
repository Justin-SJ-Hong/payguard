import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

const SplitRatioValidator = () => {
  const { setError, clearErrors } = useFormContext();
  const prepay = Number(useWatch({ name: 'prepayRatio' }) ?? 0);
  const postpay = Number(useWatch({ name: 'postpayRatio' }) ?? 0);

  useEffect(() => {
    if (prepay + postpay > 100) {
      setError('prepayRatio', {
        type: 'validate',
        message: '선불 + 후불 비율의 합이 100을 초과할 수 없습니다.',
      });
      setError('postpayRatio', {
        type: 'validate',
        message: '선불 + 후불 비율의 합이 100을 초과할 수 없습니다.',
      });
    } else {
      clearErrors('prepayRatio');
      clearErrors('postpayRatio');
    }
  }, [prepay, postpay, setError, clearErrors]);

  return null;
};

export default SplitRatioValidator; 