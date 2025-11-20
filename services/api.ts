import { API_BASE_URL } from '../constants';
import { Session } from '../types';

// Simple fetch wrapper
const request = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Erro desconhecido do servidor' }));
      throw new Error(errorData.message || `Error ${res.status}`);
    }

    // Handle empty responses or invalid JSON safely
    const text = await res.text();
    return text ? JSON.parse(text) : {};

  } catch (error: any) {
    console.error(`API Request Failed [${endpoint}]:`, error);

    // Handle specific browser network errors
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      const isSecure = window.location.protocol === 'https:';
      const targetIsInsecure = API_BASE_URL.startsWith('http:');
      
      if (isSecure && targetIsInsecure) {
        throw new Error('Bloqueio de Conteúdo Misto: O navegador bloqueou a conexão HTTP insegura a partir desta página HTTPS. Tente carregar o backend com SSL ou acesse este painel via HTTP.');
      }
      
      throw new Error('Não foi possível conectar ao servidor (72.60.246.250:3033). Verifique se o backend está online e acessível.');
    }
    throw error;
  }
};

export const api = {
  login: (credentials: { username: string; password: string }) => 
    request('/login', { method: 'POST', body: JSON.stringify(credentials) }),

  register: (userData: any) => {
    // Mock registration since backend doesn't support it explicitly in provided code
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000));
  },

  getSessions: (): Promise<Session[]> => request('/sessions'),

  createSession: (sessionId: string) => 
    request('/sessions', { method: 'POST', body: JSON.stringify({ sessionId }) }),

  deleteSession: (sessionId: string) => 
    request(`/sessions/${sessionId}`, { method: 'DELETE' }),

  restartSession: (sessionId: string) => 
    request(`/sessions/${sessionId}/restart`, { method: 'POST' }),

  getQrCode: (sessionId: string) => request(`/sessions/${sessionId}/qr`),

  sendMessage: (sessionId: string, number: string, text: string) => 
    request(`/sessions/${sessionId}/send`, { method: 'POST', body: JSON.stringify({ number, text }) }),

  saveLogicFile: (sessionId: string, fileName: string, content: string) => 
    request(`/sessions/${sessionId}/logics/text`, { method: 'POST', body: JSON.stringify({ fileName, content }) }),

  getLogicFiles: (sessionId: string) => request(`/sessions/${sessionId}/logics`),
  
  deleteLogicFile: (sessionId: string, fileName: string) => 
    request(`/sessions/${sessionId}/logics/${fileName}`, { method: 'DELETE' }),
    
  checkGeminiHealth: () => request('/health/gemini'),
};