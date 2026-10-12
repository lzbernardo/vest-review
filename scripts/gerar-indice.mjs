// Gera revisoes/index.json a partir dos arquivos .json dentro de revisoes/ (em qualquer subpasta).
// Uso: node scripts/gerar-indice.mjs
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', 'revisoes');
const INDICE = join(RAIZ, 'index.json');

export async function gerarIndice() {
  const arquivos = (await readdir(RAIZ, { recursive: true, withFileTypes: true }))
    .filter((d) => d.isFile() && d.name.toLowerCase().endsWith('.json'))
    .map((d) => join(d.parentPath ?? d.path, d.name))
    .filter((caminho) => caminho !== INDICE);

  const revisoes = [];
  const erros = [];
  for (const caminho of arquivos) {
    const arquivo = relative(RAIZ, caminho).split(sep).join('/');
    try {
      const dados = JSON.parse((await readFile(caminho, 'utf8')).replace(/^\uFEFF/, ''));
      if (typeof dados?.tema?.titulo !== 'string' || !dados.tema.titulo.trim()) throw new Error('falta "tema.titulo"');
      const questoes = Array.isArray(dados.questoes_reforco) ? dados.questoes_reforco : [];
      revisoes.push({
        arquivo,
        titulo: dados.tema.titulo,
        disciplina: dados.tema.disciplina || 'Outras',
        gerado_em: dados.gerado_em || null,
        questoes: questoes.length,
        // O mínimo de cada questão para a página inicial calcular o desempenho sem abrir o arquivo
        itens: questoes.map((q) => ({
          id: q.id,
          dificuldade: q.dificuldade || null,
          gabarito: q.tipo === 'multipla_escolha' && Array.isArray(q.alternativas) && q.alternativas.length ? q.gabarito : null,
        })),
      });
    } catch (erro) {
      erros.push(`${arquivo}: ${erro.message}`);
    }
  }

  revisoes.sort((a, b) => a.arquivo.localeCompare(b.arquivo, 'pt-BR'));
  await writeFile(INDICE, `${JSON.stringify({ revisoes }, null, 2)}\n`);
  return { revisoes, erros };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { revisoes, erros } = await gerarIndice();
  console.log(`revisoes/index.json: ${revisoes.length} revisão(ões)`);
  for (const r of revisoes) console.log(`  ${r.disciplina} · ${r.titulo}  (${r.arquivo})`);
  if (erros.length) {
    console.error(`\nArquivos ignorados por erro:\n  ${erros.join('\n  ')}`);
    process.exit(1);
  }
}
