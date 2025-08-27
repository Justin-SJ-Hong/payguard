// src/components/validation/DateConsistencyValidator.tsx
import { useDateValidation } from '../../hooks/useDateValidation';

interface Props {
  setError: (name: string, error: any) => void;
  clearErrors: (name: string) => void;
}

const DateConsistencyValidator = ({ setError, clearErrors }: Props) => {
  useDateValidation({ setError, clearErrors });

  return null;
};

export default DateConsistencyValidator;
