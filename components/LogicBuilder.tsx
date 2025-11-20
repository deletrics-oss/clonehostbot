import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { generateBotLogic } from '../services/geminiService';

interface Props {
  selectedSessionId: string | null;
}

const LogicBuilder: React.FC<Props> = ({ selectedSessionId }) => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedJson, setGeneratedJson] = useState('');
  const [generatedTxt, setGeneratedTxt] = useState('');
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    if (selectedSessionId) loadFiles();
  }, [selectedSessionId]);

  const loadFiles = async () => {
    if (!selectedSessionId) return;
    try {
      const list = await api.getLogicFiles(selectedSessionId);
      setFiles(list);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerate = async () => {
    if (!description) {
      alert("Por favor, insira a descrição.");
      return;
    }
    setIsGenerating(true);
    try {
      const { json, txt } = await generateBotLogic(description);
      setGeneratedJson(json);
      setGeneratedTxt(txt);
    } catch (error) {
      alert("Erro ao gerar lógica: " + error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!selectedSessionId) return alert("Selecione um dispositivo no Dashboard primeiro.");
    
    try {
      if (generatedJson) {
        await api.saveLogicFile(selectedSessionId, 'logica.json', generatedJson);
      }
      if (generatedTxt) {
        await api.saveLogicFile(selectedSessionId, 'conhecimento.txt', generatedTxt);
      }
      alert("Arquivos salvos com sucesso!");
      loadFiles();
    } catch (error) {
      alert("Erro ao salvar arquivos");
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!selectedSessionId) return;
    if (!confirm(`Deletar ${fileName}?`)) return;
    await api.deleteLogicFile(selectedSessionId, fileName);
    loadFiles();
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="glass-panel p-6">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Gerador de Inteligência (Gemini)
        </h2>
        
        <div className="bg-blue-900/30 border border-blue-500/30 p-4 rounded-lg mb-6 text-sm text-blue-200">
          <p className="font-bold mb-1">ℹ️ Como Testar:</p>
          <p>1. Insira a descrição do seu negócio abaixo e clique em "Gerar Lógica".</p>
          <p>2. Clique em "Salvar" para enviar os arquivos para o dispositivo conectado.</p>
          <p>3. No WhatsApp, envie uma mensagem para o bot (ex: "Oi" ou "Menu") para testar as regras do JSON.</p>
          <p>4. Pergunte algo específico sobre o negócio para testar a IA (usando o conhecimento.txt).</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Descreva o Negócio do Bot</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-32 bg-black/20 border border-white/10 rounded p-2 resize-none focus:border-purple-500 focus:outline-none transition-colors text-white"
                placeholder="Ex: Uma pizzaria chamada PizzaFlash, aberta das 18h às 23h. Cardápio: Calabresa (R$40), Mussarela (R$35). Fazemos entrega..."
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-lg font-bold transition-all disabled:opacity-50 shadow-lg shadow-purple-900/20"
            >
              {isGenerating ? '✨ Gerando Inteligência...' : '🚀 Gerar Lógica'}
            </button>
          </div>

          <div className="space-y-4">
             <div>
                <label className="block text-sm text-gray-400 mb-1">JSON Gerado (logica.json)</label>
                <textarea 
                  value={generatedJson}
                  onChange={e => setGeneratedJson(e.target.value)}
                  className="w-full h-32 bg-black/40 border border-white/10 rounded p-2 font-mono text-xs text-green-400 focus:outline-none"
                />
             </div>
             <div>
                <label className="block text-sm text-gray-400 mb-1">Base de Conhecimento (conhecimento.txt)</label>
                <textarea 
                  value={generatedTxt}
                  onChange={e => setGeneratedTxt(e.target.value)}
                  className="w-full h-32 bg-black/40 border border-white/10 rounded p-2 font-mono text-xs text-blue-300 focus:outline-none"
                />
             </div>
             <button
               onClick={handleSave}
               disabled={!generatedJson}
               className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
             >
               💾 Salvar no Dispositivo Selecionado
             </button>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 flex-1">
        <h3 className="text-xl font-bold mb-4">Arquivos Ativos no Dispositivo</h3>
        {!selectedSessionId ? (
          <p className="text-gray-500">Selecione um dispositivo no Dashboard para ver os arquivos.</p>
        ) : (
          <ul className="space-y-2">
            {files.length > 0 ? files.map(f => (
              <li key={f} className="flex justify-between items-center bg-white/5 p-3 rounded hover:bg-white/10 transition-colors">
                <span className="font-mono text-sm text-white">{f}</span>
                <button onClick={() => handleDelete(f)} className="text-red-400 hover:text-red-300 transition-colors">Excluir</button>
              </li>
            )) : <p className="text-gray-500">Nenhum arquivo encontrado.</p>}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LogicBuilder;