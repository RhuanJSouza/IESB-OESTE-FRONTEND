import React from 'react';
import styles from './Login.module.css';

interface LoginInputProps {
  id: string;
  label: string;
  type: string;
  value: string;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const LoginInput: React.FC<LoginInputProps> = ({
  id,
  label,
  type,
  value,
  placeholder,
  inputRef,
  onChange,
}) => {
  return (
    <div className={styles.inputGroup}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        ref={inputRef}
        className={styles.input}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />
    </div>
  );
};

export default LoginInput;