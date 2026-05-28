export type Settings = {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
};

export type Task = {
  id: string;
  title: string;
  minutesAmount: number;
  startDate: string;
  interruptedDate: string | null;
  finishedDate: string | null;
};

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3333';

async function request<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? 'Erro na requisição');
  }
  if (response.status === 204) {
    return undefined as unknown as T;
  }
  return response.json();
}

export const getSettings = () => request<Settings>('/settings');
export const saveSettings = (settings: Settings) =>
  request<Settings>('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
export const getTasks = () => request<Task[]>('/tasks');
export const createTask = (title: string, minutesAmount: number) =>
  request<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, minutesAmount }),
  });
export const completeTask = (id: string) =>
  request<Task>(`/tasks/${id}/complete`, {
    method: 'PATCH',
  });
export const interruptTask = (id: string) =>
  request<Task>(`/tasks/${id}/interrupt`, {
    method: 'PATCH',
  });
export const clearTasks = () =>
  request<void>('/tasks', {
    method: 'DELETE',
  });
