import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return alert("Senhas não conferem");
    
    // Simulate registration API call
    await api.register(formData);
    
    // Store auth state locally for demo purposes (since backend is single-tenant for now)
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('username', formData.username);
    
    // New flow: Register -> Subscription
    alert("Conta criada! Escolha seu plano.");
    navigate('/subscription');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      
      <div className="glass-panel p-8 w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Criar Conta
        </h2>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Nome de Usuário"
            value={formData.username}
            onChange={e => setFormData({...formData, username: e.target.value})}
            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-white/15 transition-all outline-none"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-white/15 transition-all outline-none"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-white/15 transition-all outline-none"
            required
          />
           <input
            type="password"
            placeholder="Confirmar Senha"
            value={formData.confirmPassword}
            onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-white/15 transition-all outline-none"
            required
          />
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-green-500/20 transition-all transform hover:-translate-y-0.5"
          >
            Criar Conta
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">Já tem conta? <Link to="/login" className="text-blue-400 hover:underline">Entrar</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;