// Servidor local para testar o ReVest antes de publicar. Regenera o índice ao iniciar.
// Uso: node scripts/servir.mjs [porta]
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gerarIndice } from './gerar-indice.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORTA = Number(process.argv[2] || process.env.PORT) || 4173;
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

const { revisoes, erros } = await gerarIndice();
console.log(`Índice gerado: ${revisoes.length} revisão(ões)`);
if (erros.length) console.error(`Arquivos ignorados por erro:\n  ${erros.join('\n  ')}`);

createServer(async (req, res) => {
  try {
    let caminho = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (caminho.endsWith('/')) caminho += 'index.html';
    const arquivo = normalize(join(RAIZ, caminho));
    if (arquivo !== RAIZ && !arquivo.startsWith(RAIZ + sep)) throw new Error('fora da raiz');
    const corpo = await readFile(arquivo);
    res.writeHead(200, { 'Content-Type': TIPOS[extname(arquivo).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(corpo);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Não encontrado');
  }
}).listen(PORTA, () => console.log(`ReVest em http://localhost:${PORTA}`));
