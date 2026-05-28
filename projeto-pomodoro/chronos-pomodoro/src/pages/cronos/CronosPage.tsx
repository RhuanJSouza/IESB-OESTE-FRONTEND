import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  clearTasks,
  completeTask,
  createTask,
  getSettings,
  getTasks,
  interruptTask,
  saveSettings,
  type Settings,
  type Task,
} from '../../lib/api';
import TopMenu from '../../components/TopMenu';
import styles from './CronosPage.module.css';

type CronosPageProps = {
  username: string;
  onLogout: () => void;
};

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function getTaskStatus(task: Task) {
  if (task.finishedDate) {
    return 'Concluída';
  }
  if (task.interruptedDate) {
    return 'Interrompida';
  }
  return 'Ativa';
}

export default function CronosPage({ username, onLogout }: CronosPageProps) {
  const [settings, setSettings] = useState<Settings>({
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState('Estudo');
  const [secondsLeft, setSecondsLeft] = useState(settings.workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isHistoryClearing, setIsHistoryClearing] = useState(false);
  const [feedback, setFeedback] = useState('');

  const activeTask = useMemo(
    () => tasks.find((task) => !task.finishedDate && !task.interruptedDate) ?? null,
    [tasks],
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const [remoteSettings, remoteTasks] = await Promise.all([getSettings(), getTasks()]);
        setSettings(remoteSettings);
        setTasks(remoteTasks);
        const active = remoteTasks.find((task) => !task.finishedDate && !task.interruptedDate) ?? null;
        const duration = remoteSettings.workMinutes * 60;
        if (active) {
          const elapsed = Math.floor((Date.now() - new Date(active.startDate).getTime()) / 1000);
          const remaining = Math.max(duration - elapsed, 0);
          setSecondsLeft(remaining);
          setIsRunning(remaining > 0);
          if (remaining === 0) {
            await completeTask(active.id);
            setTasks(await getTasks());
            setIsRunning(false);
            setFeedback('Ciclo concluído automaticamente.');
          }
        } else {
          setSecondsLeft(duration);
        }
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : 'Erro ao carregar dados.');
      } finally {
        setIsHistoryLoading(false);
      }
    };

    void loadData();
  }, []);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSecondsLeft((currentSeconds) => {
        if (currentSeconds <= 1) {
          window.clearInterval(intervalId);
          void handleCompleteActiveTask();
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => setFeedback(''), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  const updateTasks = async () => {
    setIsHistoryLoading(true);
    try {
      setTasks(await getTasks());
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Erro ao atualizar histórico.');
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleSaveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (settings.workMinutes <= 0 || settings.shortBreakMinutes <= 0 || settings.longBreakMinutes <= 0) {
      setFeedback('Defina valores válidos.');
      return;
    }

    setIsSavingSettings(true);
    try {
      const saved = await saveSettings(settings);
      setSettings(saved);
      setSecondsLeft(saved.workMinutes * 60);
      setFeedback('Configurações salvas.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Erro ao salvar configurações.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleStart = async () => {
    if (activeTask) {
      setFeedback('Já existe um ciclo em andamento.');
      return;
    }
    if (!taskTitle.trim()) {
      setFeedback('Informe um título de tarefa.');
      return;
    }

    setIsRunning(true);
    try {
      const task = await createTask(taskTitle.trim(), settings.workMinutes);
      setTasks((current) => [task, ...current]);
      setSecondsLeft(settings.workMinutes * 60);
      setFeedback('Ciclo iniciado.');
    } catch (error) {
      setIsRunning(false);
      setFeedback(error instanceof Error ? error.message : 'Erro ao iniciar tarefa.');
    }
  };

  const handleCompleteActiveTask = async () => {
    if (!activeTask) {
      return;
    }

    setIsRunning(false);
    try {
      await completeTask(activeTask.id);
      await updateTasks();
      setSecondsLeft(settings.workMinutes * 60);
      setFeedback('Ciclo concluído.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Erro ao concluir tarefa.');
    }
  };

  const handleInterrupt = async () => {
    if (!activeTask) {
      setFeedback('Nenhum ciclo em andamento.');
      return;
    }

    setIsRunning(false);
    try {
      await interruptTask(activeTask.id);
      await updateTasks();
      setSecondsLeft(settings.workMinutes * 60);
      setFeedback('Ciclo interrompido.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Erro ao interromper tarefa.');
    }
  };

  const handleClearHistory = async () => {
    setIsHistoryClearing(true);
    try {
      await clearTasks();
      setTasks([]);
      setFeedback('Histórico limpo.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Erro ao limpar histórico.');
    } finally {
      setIsHistoryClearing(false);
    }
  };

  const displayTime = formatTime(secondsLeft);
  const activeStatus = activeTask ? getTaskStatus(activeTask) : 'Nenhum ciclo ativo';

  return (
    <main className={styles.page}>
      <TopMenu />
      <section className={styles.panel}>
        {feedback && <div className={styles.toast}>{feedback}</div>}
        <div className={styles.topbar}>
          <div>
            <p className={styles.eyebrow}>Painel do foco</p>
            <h1 className={styles.title}>Cronos</h1>
          </div>
          <button type="button" className={styles.logoutButton} onClick={onLogout}>
            Sair
          </button>
        </div>

        <p className={styles.welcome}>Olá, {username}. Configure seu ciclo e acompanhe o histórico.</p>

        <div className={styles.grid}>
          <div className={styles.settingsPanel} id="settings">
            <div className={styles.sectionHeader}>
              <div>
                <h2>Configurações</h2>
                <p>Salve no banco e recarregue sem perder.</p>
              </div>
            </div>
            <form className={styles.settingsForm} onSubmit={handleSaveSettings}>
              <label className={styles.labelField}>
                <span>Minutos de foco</span>
                <input
                  type="number"
                  min="1"
                  value={settings.workMinutes}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      workMinutes: Number(event.target.value),
                    }))
                  }
                />
              </label>
              <label className={styles.labelField}>
                <span>Pausa curta</span>
                <input
                  type="number"
                  min="1"
                  value={settings.shortBreakMinutes}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      shortBreakMinutes: Number(event.target.value),
                    }))
                  }
                />
              </label>
              <label className={styles.labelField}>
                <span>Pausa longa</span>
                <input
                  type="number"
                  min="1"
                  value={settings.longBreakMinutes}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      longBreakMinutes: Number(event.target.value),
                    }))
                  }
                />
              </label>
              <button className={styles.primaryButton} type="submit" disabled={isSavingSettings}>
                {isSavingSettings ? 'Salvando...' : 'Salvar configurações'}
              </button>
            </form>
          </div>

          <div className={styles.timerCard} id="focus">
            <div className={styles.timerHeader}>
              <div>
                <p className={styles.timerLabel}>Ciclo atual</p>
                <strong>{activeTask ? activeTask.title : 'Nenhuma tarefa selecionada'}</strong>
              </div>
              <span className={styles.statusBadge}>{activeStatus}</span>
            </div>

            <div className={styles.timerValue}>{displayTime}</div>

            <div className={styles.controlRow}>
              <input
                className={styles.textInput}
                value={taskTitle}
                onChange={(event) => setTaskTitle(event.target.value)}
                placeholder="Título da tarefa"
              />
            </div>

            <p className={styles.timerText}>
              {activeTask
                ? 'Ciclo em progresso. Finalize ou interrompa quando precisar.'
                : 'Inicie um novo ciclo para salvar a tarefa no histórico.'}
            </p>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleStart}
                disabled={isRunning || !taskTitle.trim()}
              >
                {isRunning ? 'Em andamento' : 'Começar'}
              </button>
              <button type="button" className={styles.secondaryButton} onClick={handleInterrupt} disabled={!activeTask}>
                Interromper
              </button>
              <button type="button" className={styles.secondaryButton} onClick={handleCompleteActiveTask} disabled={!activeTask}>
                Concluir
              </button>
            </div>
          </div>
        </div>

        <section className={styles.historyPanel} id="history">
          <div className={styles.sectionHeader}>
            <div>
              <h2>Histórico</h2>
              <p>Registros de ciclos salvos no banco.</p>
            </div>
            <button className={styles.clearButton} type="button" onClick={handleClearHistory} disabled={isHistoryClearing}>
              {isHistoryClearing ? 'Limpando...' : 'Limpar histórico'}
            </button>
          </div>

          {isHistoryLoading ? (
            <div className={styles.loadingText}>Carregando histórico...</div>
          ) : tasks.length === 0 ? (
            <div className={styles.emptyText}>Nenhuma tarefa registrada ainda.</div>
          ) : (
            <table className={styles.historyTable}>
              <thead>
                <tr>
                  <th>Tarefa</th>
                  <th>Duração</th>
                  <th>Início</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{task.minutesAmount} min</td>
                    <td>{formatDate(task.startDate)}</td>
                    <td>
                      <span className={styles.taskStatus}>{getTaskStatus(task)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </section>
    </main>
  );
}
