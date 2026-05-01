const STORAGE_KEY = 'rehab_sessions';

export const saveSession = (session) => {
  try {
    const existingSessions = getSessions();
    const newSession = {
      ...session,
      id: Date.now(),
      date: new Date().toISOString(),
    };
    const updatedSessions = [newSession, ...existingSessions];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
    return newSession;
  } catch (error) {
    console.error('Failed to save session:', error);
    return null;
  }
};

export const getSessions = () => {
  try {
    const sessions = localStorage.getItem(STORAGE_KEY);
    return sessions ? JSON.parse(sessions) : [];
  } catch (error) {
    console.error('Failed to get sessions:', error);
    return [];
  }
};

export const clearSessions = () => {
  localStorage.removeItem(STORAGE_KEY);
};
