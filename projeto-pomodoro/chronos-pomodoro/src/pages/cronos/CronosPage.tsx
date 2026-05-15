import { useEffect, useMemo, useState } from 'react';
import styles from './CronosPage.module.css';

interface CronosPageProps {
  username: string;
  onLogout: () => void;
}

const INITIAL_TIME_IN_SECONDS = 25 * 60;

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');

  return `${minutes}:${seconds}`;
}

export default function CronosPage({ username, onLogout }: CronosPageProps) {
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_TIME_IN_SECONDS);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setSecondsLeft(currentSeconds => {
        if (currentSeconds <= 1) {
          window.clearInterval(intervalId);
          setIsRunning(false);
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  const progress = useMemo(
    () =>
      ((INITIAL_TIME_IN_SECONDS - secondsLeft) / INITIAL_TIME_IN_SECONDS) * 100,
    [secondsLeft],
  );

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.topbar}>
          <div>
            <p className={styles.eyebrow}>Painel do foco</p>
            <h1 className={styles.title}>Cronos</h1>
          </div>
          <button
            type='button'
            className={styles.logoutButton}
            onClick={onLogout}
          >
            Sair
          </button>
        </div>

        <p className={styles.welcome}>
          Olá, {username}. Seu próximo ciclo começa agora.
        </p>

        <div className={styles.timerCard}>
          <div className={styles.progressTrack} aria-hidden='true'>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className={styles.timerValue} aria-live='polite'>
            {formatTime(secondsLeft)}
          </div>

          <p className={styles.timerText}>
            {isRunning
              ? 'Respire fundo e mantenha a atenção no que importa.'
              : secondsLeft === 0
                ? 'Ciclo concluído. Hora de uma pausa curta.'
                : 'Pronto para iniciar mais um bloco de concentração?'}
          </p>

          <div className={styles.actions}>
            <button
              type='button'
              className={styles.primaryButton}
              onClick={() => setIsRunning(currentState => !currentState)}
            >
              {isRunning
                ? 'Pausar'
                : secondsLeft === 0
                  ? 'Iniciar novo ciclo'
                  : 'Começar'}
            </button>
            <button
              type='button'
              className={styles.secondaryButton}
              onClick={() => {
                setIsRunning(false);
                setSecondsLeft(INITIAL_TIME_IN_SECONDS);
              }}
            >
              Reiniciar
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}