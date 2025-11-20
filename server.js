import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3035;

// Serve os arquivos estáticos da pasta 'dist' (gerada pelo npm run build)
app.use(express.static(path.join(__dirname, 'dist')));

// Rota 'catch-all' para suportar React Router (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Frontend ChatBot Host Pro rodando na porta ${PORT}`);
  console.log(`📂 Servindo arquivos de: ${path.join(__dirname, 'dist')}`);
});