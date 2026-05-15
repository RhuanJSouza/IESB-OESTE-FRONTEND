import React, { useEffect, useState } from 'react';
import LoginForm from './LoginForm';
import styles from './Login.module.css';

type ViewMode = 'login' | 'register' | 'recover';

interface LoginPageProps {
  onLoginSuccess: (username: string) => void;
}

const contentByMode: Record<
  ViewMode,
  { eyebrow: string; title: string; description: string }
> = {
  login: {
    eyebrow: 'Acesso ao foco',
    title: 'Entre no Chronos',
    description:
      'Organize seu tempo com uma experiência limpa, rápida e pensada para manter seu ritmo de estudo.',
  },
  register: {
    eyebrow: 'Cadastro em breve',
    title: 'Crie sua conta',
    description:
      'O fluxo de cadastro ainda será implementado. Por enquanto, explore a experiência principal do projeto.',
  },
  recover: {
    eyebrow: 'Recuperação em breve',
    title: 'Recupere seu acesso',
    description:
      'A redefinição de senha ainda está em construção. O layout já reage para simular esse fluxo.',
  },
};

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [viewMode, setViewMode] = useState<'login' | 'register' | 'recover'>(
    'login',
  );
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!feedbackMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setFeedbackMessage(null), 3200);

    return () => window.clearTimeout(timeoutId);
  }, [feedbackMessage]);

  const handleFeedback = (message: string) => {
    setFeedbackMessage(message);
  };

  const currentContent = contentByMode[viewMode];

  return (
    <div className={styles.container}>
      <section className={styles.heroPanel}>
        <span className={styles.badge}>Pomodoro inteligente</span>
        <p className={styles.eyebrow}>{currentContent.eyebrow}</p>
        <h1 className={styles.title}>{currentContent.title}</h1>
        <p className={styles.description}>{currentContent.description}</p>
        <div className={styles.featureGrid}>
          <article className={styles.featureCard}>
            <strong>25 min</strong>
            <span>Ciclos de foco com presença visual forte.</span>
          </article>
          <article className={styles.featureCard}>
            <strong>Fluxo simples</strong>
            <span>Entrar, iniciar, acompanhar e manter consistência.</span>
          </article>
        </div>
      </section>

      <section className={styles.card} aria-label='Área de autenticação'>
        <div className={styles.cardHeader}>
          <p className={styles.cardEyebrow}>Bem-vindo</p>
          <h2 className={styles.cardTitle}>Seu tempo começa aqui</h2>
          <p className={styles.cardText}>
            Use qualquer usuário e senha. O acesso é simulado para a atividade.
          </p>
        </div>

        <LoginForm
          currentMode={viewMode}
          onFeedback={handleFeedback}
          onChangeView={setViewMode}
          onLoginSuccess={onLoginSuccess}
        />

        {feedbackMessage && (
          <div className={styles.feedback} role='status' aria-live='polite'>
            {feedbackMessage}
          </div>
        )}
      </section>
    </div>
  );
};

export default LoginPage;