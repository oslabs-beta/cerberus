import { useState, useCallback } from 'react';

interface ValidationRules {
  email?: boolean;
  password?: boolean;
  confirmPassword?: boolean;
}

export interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateEmail = (email: string): boolean => {
    if (
      !email ||
      email.length > 255 ||
      !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    ) {
      setErrors((prev) => ({
        ...prev,
        email: 'Please enter a valid email address',
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, email: undefined }));
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password || password.length < 8 || password.length > 72) {
      setErrors((prev) => ({
        ...prev,
        password: 'Password must be between 8 and 72 characters',
      }));
      return false;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_+=[\]{};:'"\\|,.<>/?])[A-Za-z\d!@#$%^&*()\-_+=[\]{};:'"\\|,.<>/?]{8,72}$/;
    if (!passwordRegex.test(password)) {
      setErrors((prev) => ({
        ...prev,
        password:
          'Password must contain at least one uppercase letter, one number, and one special character',
      }));
      return false;
    }

    setErrors((prev) => ({ ...prev, password: undefined }));
    return true;
  };

  const validateConfirmPassword = (
    password: string,
    confirmPassword: string
  ): boolean => {
    if (password !== confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: 'Passwords do not match',
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    return true;
  };

  const validateForm = useCallback(
    (values: Record<string, string>): boolean => {
      let isValid = true;

      if (rules.email && !validateEmail(values.email)) {
        isValid = false;
      }

      if (rules.password && !validatePassword(values.password)) {
        isValid = false;
      }

      if (
        rules.confirmPassword &&
        !validateConfirmPassword(values.password, values.confirmPassword)
      ) {
        isValid = false;
      }

      return isValid;
    },
    [rules]
  );

  return {
    errors,
    validateForm,
    validateEmail,
    validatePassword,
    validateConfirmPassword,
  };
};
