import { useState, useEffect } from 'react';

interface PasswordValidation {
  isValid: boolean;
  minLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumbers: boolean;
  hasSpecialChar: boolean;
}

export const usePasswordValidation = (password: string, passwordCheck: string) => {
  const [validation, setValidation] = useState<PasswordValidation>({
    isValid: false,
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false,
    hasSpecialChar: false,
  });

  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [showPasswordMatch, setShowPasswordMatch] = useState(false);

  useEffect(() => {
    const newValidation: PasswordValidation = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      isValid: false,
    };

    newValidation.isValid = 
      newValidation.minLength &&
      newValidation.hasUpperCase &&
      newValidation.hasLowerCase &&
      newValidation.hasNumbers &&
      newValidation.hasSpecialChar;

    setValidation(newValidation);
  }, [password]);

  useEffect(() => {
    const match = password === passwordCheck && password.length > 0;
    const show = password.length > 0 || passwordCheck.length > 0;
    
    setPasswordsMatch(match);
    setShowPasswordMatch(show);
  }, [password, passwordCheck]);

  return {
    validation,
    passwordsMatch,
    showPasswordMatch,
    isAllValid: validation.isValid && passwordsMatch,
  };
};
