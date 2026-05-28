import React from 'react';
import styles from './Login.module.css';

interface LoginActionsProps {
  onChangeView: (view: 'login' | 'register' | 'recover') => void;
}

const LoginActions: React.FC<LoginActionsProps> = ({ onChangeView }) => {
  return (
    <div className={styles.actions}>
      <button
        type='button'
        className={styles.linkButton}
        onClick={() => onChangeView('register')}
      >
        Não tem conta? Cadastre-se
      </button>
      <button
        type='button'
        className={styles.linkButton}
        onClick={() => onChangeView('recover')}
      >
        Esqueci minha senha
      </button>
    </div>
  );
};

export default LoginActions;