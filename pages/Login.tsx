import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

const Login: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('suporte@1');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Lógica de Bypass para Admin
    if (username === 'admin' && password === 'suporte@1') {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', 'admin');
        localStorage.setItem('hasSubscription', 'true'); // Admin tem plano liberado
        localStorage.setItem('plan', 'enterprise');
        
        // Tenta conectar ao backend, mas não bloqueia se falhar
        api.login({ username, password }).catch(e => console.warn("Backend offline, entrando modo admin local"));
        
        navigate('/dashboard');
        return;
    }

    try {
      const res = await api.login({ username, password });
      if (res.success) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', username);
        
        // Usuário comum precisa de assinatura
        if (!localStorage.getItem('hasSubscription')) {
             navigate('/subscription');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('Credenciais inválidas.');
      }
    } catch (err: any) {
      setError('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1614728853975-69c960f7274f?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="glass-panel p-8 w-full max-w-md relative z-10">
        <h2 className="text-3xl font-bold text-center mb-6">ChatBot Host Pro</h2>
        
        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded mb-4 text-center text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg p-3 focus:outline-none focus:border-blue-500 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg p-3 focus:outline-none focus:border-blue-500 text-white"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
          >
            Entrar
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">Não tem uma conta? <Link to="/register" className="text-blue-400 hover:underline">Criar Conta</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;