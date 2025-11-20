
import React, { useState, useEffect } from 'react';
import DeviceManager from '../components/DeviceManager';
import { api } from '../services/api';
import { WS_URL } from '../constants';
import { Session, Message } from '../types';

const Dashboard: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<'OK'|'ERROR'>('ERROR');
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Chat State
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<string[]>([]); // List of phone numbers
  const [replyText, setReplyText] = useState('');

  // Initial Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setApiError(null);
        const sess = await api.getSessions();
        setSessions(sess);
        if (sess.length > 0 && !selectedSessionId) setSelectedSessionId(sess[0].id);
        
        const health = await api.checkGeminiHealth();
        setGeminiStatus(health.status === 'OPERATIONAL' ? 'OK' : 'ERROR');
      } catch (e: any) {
        console.error("Dashboard initial fetch failed:", e);
        setApiError(e.message || "Erro ao conectar com o backend.");
      }
    };
    fetchData();
  }, []);

  // WebSocket
  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      // console.log(`Connecting to WebSocket: ${WS_URL}`);
      ws = new WebSocket(WS_URL);
      
      ws.onopen = () => {
        setSocketConnected(true);
        setApiError(null); // Clear error if WS connects (backend is likely up)
      };
      
      ws.onclose = () => setSocketConnected(false);
      
      ws.onerror = (error) => {
        // WebSocket onerror events give very little detail, but we catch the initial constructor error in the catch block
        console.error("WebSocket error observed:", error);
        setSocketConnected(false);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'status_update') {
            setSessions(prev => {
               const idx = prev.findIndex(s => s.id === data.sessionId);
               if (idx === -1) return [...prev, { id: data.sessionId, status: data.status }];
               const newSess = [...prev];
               newSess[idx].status = data.status;
               return newSess;
            });
          }
          
          if (data.type === 'new_message' && data.sessionId === selectedSessionId) {
            const contact = data.from === 'BOT' || data.from === 'ADMIN' || data.from === 'SYSTEM' ? data.to : data.from;
            const cleanContact = contact?.replace('@c.us', '');
            
            // Update chat list
            setChats(prev => prev.includes(cleanContact) ? prev : [cleanContact, ...prev]);
            
            // Update active messages
            if (activeChat === cleanContact) {
              setMessages(prev => [...prev, {
                from: data.from,
                body: data.body,
                timestamp: data.timestamp,
                isMine: data.from === 'ADMIN' || data.from === 'BOT'
              }]);
            }
          }
        } catch (err) {
          console.error("Error parsing WS message", err);
        }
      };
    } catch (e: any) {
      console.error("Failed to create WebSocket connection:", e);
      if (e.name === 'SecurityError' || e.message?.includes('insecure')) {
        setApiError("Erro de Segurança: O navegador bloqueou a conexão WebSocket insegura (ws://). Se o backend não tiver SSL, acesse este painel via HTTP.");
      } else {
        setApiError("Falha na conexão WebSocket.");
      }
    }

    return () => {
      if (ws) ws.close();
    };
  }, [selectedSessionId, activeChat]);

  const handleSendMessage = async () => {
    if (!selectedSessionId || !activeChat || !replyText) return;
    try {
      await api.sendMessage(selectedSessionId, activeChat, replyText);
      setReplyText('');
    } catch (e) {
      alert("Erro ao enviar mensagem.");
    }
  };

  return (
    <div className="h-full flex gap-6 flex-col">
      {apiError && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
          <span>⚠️</span>
          <span className="font-medium text-sm">{apiError}</span>
          {apiError.includes("SSL") && (
             <span className="text-xs bg-black/30 px-2 py-1 rounded ml-2 border border-white/10">Dica: Tente usar http://localhost... se possível</span>
          )}
          <button onClick={() => window.location.reload()} className="ml-auto text-sm underline hover:text-white">Tentar novamente</button>
        </div>
      )}
      
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Col: Devices & Status */}
        <div className="w-1/3 flex flex-col gap-6">
          {/* Status Cards */}
          <div className="grid grid-cols-2 gap-4">
             <div className="glass-panel p-4 flex items-center gap-3">
               <div className={`w-3 h-3 rounded-full ${socketConnected ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
               <span className="font-bold text-sm">WebSocket</span>
             </div>
             <div className="glass-panel p-4 flex items-center gap-3">
               <div className={`w-3 h-3 rounded-full ${geminiStatus === 'OK' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
               <span className="font-bold text-sm">Gemini AI</span>
             </div>
          </div>

          {/* Device Manager */}
          <div className="glass-panel flex-1 p-4 overflow-hidden">
            <DeviceManager 
              sessions={sessions} 
              selectedSessionId={selectedSessionId}
              onSelectSession={setSelectedSessionId}
              onSessionChange={() => api.getSessions().then(setSessions).catch(e => console.error("Session refresh failed", e))}
            />
          </div>
        </div>

        {/* Right Col: Chat */}
        <div className="w-2/3 glass-panel flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/5">
            <h2 className="font-bold text-lg">Monitoramento em Tempo Real</h2>
            <p className="text-xs text-gray-400">{selectedSessionId ? `Sessão: ${selectedSessionId}` : 'Selecione um dispositivo'}</p>
          </div>
          
          <div className="flex-1 flex overflow-hidden">
            {/* Chat List */}
            <div className="w-1/3 border-r border-white/10 overflow-y-auto">
               {chats.map(chat => (
                 <div 
                   key={chat} 
                   onClick={() => { setActiveChat(chat); setMessages([]); }}
                   className={`p-4 cursor-pointer hover:bg-white/5 ${activeChat === chat ? 'bg-blue-600/20' : ''}`}
                 >
                   {chat}
                 </div>
               ))}
               {chats.length === 0 && <div className="p-4 text-gray-500 text-sm">Nenhuma conversa ativa</div>}
            </div>

            {/* Message View */}
            <div className="flex-1 flex flex-col bg-black/20">
               <div className="flex-1 p-4 overflow-y-auto space-y-3">
                 {activeChat ? (
                   messages.map((m, i) => (
                     <div key={i} className={`flex ${m.isMine ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[70%] p-3 rounded-lg ${m.isMine ? 'bg-blue-600' : 'bg-gray-700'}`}>
                         <p className="text-sm">{m.body}</p>
                         <span className="text-[10px] opacity-50 block text-right mt-1">
                           {new Date(m.timestamp).toLocaleTimeString()}
                         </span>
                       </div>
                     </div>
                   ))
                 ) : (
                   <div className="h-full flex items-center justify-center text-gray-500">Selecione uma conversa</div>
                 )}
               </div>
               
               {/* Input Area */}
               <div className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
                 <input 
                   type="text" 
                   value={replyText}
                   onChange={e => setReplyText(e.target.value)}
                   placeholder="Digite sua resposta..."
                   className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 focus:outline-none"
                   disabled={!activeChat}
                 />
                 <button 
                   onClick={handleSendMessage}
                   disabled={!activeChat}
                   className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-bold"
                 >
                   Enviar
                 </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
