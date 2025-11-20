import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Subscription from './pages/Subscription';
import LogicBuilder from './components/LogicBuilder';
import { Session } from './types';
import { api } from './services/api';

// Layout wrapper for authenticated pages
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-dark text-white font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 h-screen overflow-hidden">
        {children}
      </main>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const hasSubscription = localStorage.getItem('hasSubscription') === 'true';
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Force subscription if not subscribed, unless already on the subscription page
  if (!hasSubscription && location.pathname !== '/subscription') {
     return <Navigate to="/subscription" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Logic Builder Wrapper page
const LogicPage = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    api.getSessions()
      .then(s => {
        setSessions(s);
        if(s.length > 0) setSelectedId(s[0].id);
        setError(null);
      })
      .catch(err => {
        console.error("Failed to fetch sessions in LogicPage:", err);
        setError("Erro ao conectar com o backend. Verifique se o servidor está rodando.");
      });
  }, []);

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="mb-4 flex items-center gap-4">
         <h1 className="text-2xl font-bold">Construtor de Lógica</h1>
         {error && (
            <span className="text-red-400 text-sm bg-red-900/20 px-2 py-1 rounded border border-red-500/20">
              ⚠️ {error}
            </span>
         )}
         {sessions.length > 0 && (
           <select 
              className="bg-black/20 border border-white/10 rounded px-3 py-1 text-white"
              onChange={(e) => setSelectedId(e.target.value)}
              value={selectedId || ''}
           >
              {sessions.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
           </select>
         )}
      </div>
      <div className="flex-1 overflow-y-auto">
        <LogicBuilder selectedSessionId={selectedId} />
      </div>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/subscription" element={
           localStorage.getItem('isAuthenticated') === 'true' ? <Subscription /> : <Navigate to="/login" />
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/chat" element={
          <ProtectedRoute>
             <Dashboard /> 
          </ProtectedRoute>
        } />

        <Route path="/logic" element={
          <ProtectedRoute>
            <LogicPage />
          </ProtectedRoute>
        } />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;