import React, { useEffect, useRef, useState } from 'react';
import LoginInput from './LoginInput';
import LoginActions from './LoginActions';
import styles from './Login.module.css';

interface LoginFormProps {
  currentMode: 'login' | 'register' | 'recover';
  onFeedback: (message: string) => void;
  onChangeView: (view: 'login' | 'register' | 'recover') => void;
  onLoginSuccess: (username: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  currentMode,
  onFeedback,
  onChangeView,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const usernameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    usernameInputRef.current?.focus();
  }, [currentMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const sanitizedUsername = username.trim();

    if (!sanitizedUsername || !password.trim()) {
      onFeedback('Preencha usuário e senha para continuar.');
      return;
    }

    setIsSubmitting(true);
    onFeedback('Login enviado com sucesso. Redirecionando para o Chronos...');

    window.setTimeout(() => {
      onLoginSuccess(sanitizedUsername);
      setIsSubmitting(false);
    }, 900);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <LoginInput
        id='login-username'
        label='Usuário'
        type='text'
        value={username}
        placeholder='Digite seu e-mail ou nome'
        inputRef={usernameInputRef}
        onChange={e => setUsername(e.target.value)}
      />
      <LoginInput
        id='login-password'
        label='Senha'
        type='password'
        value={password}
        placeholder='Digite sua senha'
        onChange={e => setPassword(e.target.value)}
      />
      <LoginActions onChangeView={onChangeView} />
      <button
        type='submit'
        className={styles.submitButton}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Entrando...' : 'Entrar no Chronos'}
      </button>
    </form>
  );
};

export default LoginForm;