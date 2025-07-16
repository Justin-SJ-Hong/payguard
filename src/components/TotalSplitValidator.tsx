import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import formatNumber from '../utils/formatNumber';

const TotalSplitValidator = () => {
    const { setError, clearErrors } = useFormContext();

    const totalAmount = useWatch({ name: 'totalAmount' });
    const prepayRatio = useWatch({ name: 'prepayRatio' }) || 0;
    const postpayRatio = useWatch({ name: 'postpayRatio' }) || 0;
    const midpayAmounts = useWatch({ name: 'midpayAmounts' }) || [];
    const currency = useWatch({ name: 'currency' });

    useEffect(() => {
        if (!totalAmount || totalAmount <= 0) return;

        const prepayAmount = Math.floor((totalAmount * prepayRatio) / 100);
        const postpayAmount = Math.floor((totalAmount * postpayRatio) / 100);
        const midpayTotal = midpayAmounts.reduce((sum:any, item:any) => {
        const amount = Number(item.amount);
        return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        const splitSum = prepayAmount + midpayTotal + postpayAmount;

        if (splitSum !== totalAmount) {
        setError('totalAmount', {
            type: 'validate',
            message: `총 분할 금액 (${formatNumber(splitSum)} ${currency})가 총 계약 금액과 일치하지 않습니다.`,
        });
        } else {
        clearErrors('totalAmount');
        }
    }, [totalAmount, prepayRatio, postpayRatio, midpayAmounts, setError, clearErrors]);

    return null;
};

export default TotalSplitValidator;
