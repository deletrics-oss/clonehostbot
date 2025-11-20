// Backend URL configuration
// Dynamically determine protocol based on how the page is loaded to avoid Mixed Content errors
const SERVER_HOST = '72.60.246.250:3033';
const isSecure = window.location.protocol === 'https:';

export const API_BASE_URL = `${isSecure ? 'https' : 'http'}://${SERVER_HOST}/api`;
export const WS_URL = `${isSecure ? 'wss' : 'ws'}://${SERVER_HOST}`;

// Stripe Configuration
export const STRIPE_PUBLIC_KEY = (import.meta as any).env?.VITE_STRIPE_PUBLIC_KEY || 'prod_TSBFZleC61Rm5y';

export const STRIPE_PRODUCTS = [
  {
    id: 'prod_TSBEUvesZnyFJO',
    name: 'Plano Inicial',
    price: 'R$ 0,00/mês',
    features: ['1 Dispositivo', 'Respostas Automáticas', 'Suporte Básico'],
    key: 'free_tier'
  },
  {
    id: 'prod_TSBFAZOMsCNIAT',
    name: 'Bot Fixo',
    price: 'R$ 97,00/mês',
    features: ['3 Dispositivos', 'Gerador de Lógica IA', 'Prioridade no Suporte', 'Dashboard Avançado'],
    key: 'fixed_bot'
  },
  {
    id: 'prod_TSBFZleC61Rm5y',
    name: 'Enterprise',
    price: 'R$ 197,00/mês',
    features: ['Dispositivos Ilimitados', 'IA Avançada', 'API Dedicada', 'Gestor de Contas'],
    key: 'enterprise'
  }
];