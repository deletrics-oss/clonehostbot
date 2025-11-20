import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Session } from '../types';

interface Props {
  sessions: Session[];
  onSessionChange: () => void;
  selectedSessionId: string | null;
  onSelectSession: (id: string) => void;
}

const DeviceManager: React.FC<Props> = ({ sessions, onSessionChange, selectedSessionId, onSelectSession }) => {
  const [newSessionId, setNewSessionId] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pollErrorCount, setPollErrorCount] = useState(0);

  useEffect(() => {
    let interval: any = null; // Using any to avoid NodeJS namespace issues in browser environment
    
    if (selectedSessionId && pollErrorCount < 3) { // Stop polling if too many errors
      const checkQr = async () => {
        try {
          const currentSession = sessions.find(s => s.id === selectedSessionId);
          
          // Only poll for QR if pending or initializing
          if (currentSession?.status === 'QR_PENDING' || currentSession?.status === 'INITIALIZING') {
             const res = await api.getQrCode(selectedSessionId);
             if (res.qrCodeUrl) {
               setQrCode(res.qrCodeUrl);
               setPollErrorCount(0); // Reset on success
             }
          } else {
             // Clear QR if connected or offline
             setQrCode(null);
          }
        } catch (error) {
          // Silent error for polling, but increment counter
          setPollErrorCount(prev => prev + 1);
        }
      };

      checkQr();
      interval = setInterval(checkQr, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedSessionId, sessions, pollErrorCount]);

  // Reset poll count when selecting a different session
  useEffect(() => {
    setPollErrorCount(0);
  }, [selectedSessionId]);

  const handleAddSession = async () => {
    if (!newSessionId.trim()) return;
    setLoading(true);
    try {
      await api.createSession(newSessionId);
      setNewSessionId('');
      onSessionChange();
    } catch (error) {
      alert('Erro ao criar sessão: verifique se o backend está online.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Tem certeza que deseja remover este dispositivo?')) return;
    try {
      await api.deleteSession(id);
      onSessionChange();
      if (selectedSessionId === id) onSelectSession('');
    } catch (error) {
      alert('Erro ao remover dispositivo.');
    }
  };

  const handleRestart = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.restartSession(id);
      onSessionChange();
    } catch (error) {
      alert('Erro ao reiniciar dispositivo.');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-white">Gerenciar Dispositivos</h2>
      
      {/* Add Device */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newSessionId}
          onChange={(e) => setNewSessionId(e.target.value)}
          placeholder="Nome do dispositivo (ex: vendas)"
          className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleAddSession}
          disabled={loading}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? '...' : '+ Adicionar'}
        </button>
      </div>

      {/* Device List */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-6 pr-2">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`p-3 rounded-lg cursor-pointer border transition-all flex justify-between items-center ${
              selectedSessionId === session.id
                ? 'bg-blue-600/20 border-blue-500'
                : 'bg-white/5 border-transparent hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full shadow-lg ${
                session.status === 'READY' ? 'bg-green-500 shadow-green-500/50' :
                session.status === 'QR_PENDING' ? 'bg-yellow-500 shadow-yellow-500/50' :
                'bg-red-500'
              }`} />
              <span className="font-medium">{session.id}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={(e) => handleRestart(session.id, e)} className="p-1.5 hover:bg-white/10 rounded text-yellow-400" title="Reiniciar">🔄</button>
              <button onClick={(e) => handleDelete(session.id, e)} className="p-1.5 hover:bg-white/10 rounded text-red-400" title="Remover">❌</button>
            </div>
          </div>
        ))}
        
        {sessions.length === 0 && (
          <div className="text-center text-gray-500 py-4">Nenhum dispositivo conectado</div>
        )}
      </div>

      {/* QR Code Area */}
      <div className="glass-panel p-4 flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden">
        <h3 className="text-lg font-semibold mb-4">Conexão WhatsApp</h3>
        {pollErrorCount >= 3 ? (
           <div className="text-red-400 text-center">
             <p>⚠️ Backend inacessível</p>
             <button onClick={() => setPollErrorCount(0)} className="text-xs underline mt-2">Tentar novamente</button>
           </div>
        ) : selectedSessionId ? (
          sessions.find(s => s.id === selectedSessionId)?.status === 'READY' ? (
            <div className="text-green-400 flex flex-col items-center animate-in fade-in duration-300">
              <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <p className="font-bold">Dispositivo Conectado</p>
              <p className="text-sm opacity-75 mt-1">Pronto para uso</p>
            </div>
          ) : qrCode ? (
            <div className="bg-white p-2 rounded-lg animate-in zoom-in duration-300">
              <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              <p className="text-black text-center text-xs mt-2 font-medium">Escaneie com seu WhatsApp</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <p>Aguardando conexão...</p>
              <p className="text-xs mt-1">O QR Code aparecerá aqui</p>
            </div>
          )
        ) : (
          <p className="text-gray-500">Selecione um dispositivo para conectar</p>
        )}
      </div>
    </div>
  );
};

export default DeviceManager;