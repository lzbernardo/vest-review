# ReVest

Revisões de vestibular em uma página estática: resumo prático, conceitos, questões de referência e questões de reforço com gabarito e resolução. Feita para ser publicada no GitHub Pages, sem backend.

## Estrutura

```
index.html
css/styles.css
js/app.js
favicon.svg
revisoes/
  index.json            índice gerado automaticamente (não edite à mão)
  biologia/
    biologia-citologia-bioenergetica.json
  geografia/
    geografia-atividade-economica-brasileira.json
  matematica/
    matematica-pa-pg.json
scripts/
  gerar-indice.mjs      recria revisoes/index.json
  servir.mjs            servidor local para testes
.github/workflows/pages.yml
```

## Adicionar uma revisão

1. Coloque o arquivo `.json` em `revisoes/`, dentro de uma pasta (por exemplo `revisoes/fisica/`). As pastas servem só para organizar: a matéria exibida vem do campo `tema.disciplina` do próprio JSON.
2. Faça commit e push para `main`.

O workflow do GitHub Actions recria `revisoes/index.json` e publica o site. Se algum JSON estiver inválido ou sem `tema.titulo`, a publicação falha e o log aponta o arquivo.

Cada revisão ganha um link próprio, formado pelo caminho do arquivo: `…/#/fisica/nome-do-arquivo`. O progresso do aluno fica salvo no navegador dele, associado a esse caminho, então renomear ou mover um arquivo zera o progresso daquele tema.

## Publicar no GitHub Pages

1. Crie o repositório no GitHub e envie o projeto para a branch `main`.
2. No repositório, abra **Settings → Pages** e, em **Build and deployment → Source**, escolha **GitHub Actions**.
3. A cada push em `main` o workflow `Publicar no GitHub Pages` roda e atualiza o site.

## Rodar localmente

Precisa apenas do Node.js 20 ou mais recente, sem instalar dependências:

```bash
node scripts/servir.mjs
```

O comando recria o índice e serve o site em `http://localhost:4173`. Abrir o `index.html` direto do disco não funciona, porque o navegador bloqueia a leitura da pasta `revisoes/`.

Para só recriar o índice:

```bash
node scripts/gerar-indice.mjs
```

## Matérias

Ícone e cor são escolhidos pelo campo `tema.disciplina`. Matérias reconhecidas: Matemática, Física, Química, Biologia, História, Geografia, Português (ou Gramática, Linguagens), Literatura, Redação, Inglês, Filosofia e Sociologia. Qualquer outra recebe o ícone e a cor de "Outras". A lista fica em `SUBJECTS`, no começo de `js/app.js`.

## Formato do JSON

Só `tema.titulo` é obrigatório; as seções ausentes simplesmente não aparecem. A página lê as versões 1.0 e 1.1 do formato: na 1.0, as questões de vestibular vêm em `questoes_vestibular_referencia[]`, com um único campo `link`.

| Campo | Conteúdo |
| --- | --- |
| `gerado_em` | Data no formato `AAAA-MM-DD` |
| `tema` | `titulo`, `disciplina`, `subtopicos[]` |
| `resumo_pratico` | `em_uma_frase`, `pontos_chave[]`, `formulas[]` (`nome`, `expressao`, `quando_usar`), `erros_comuns[]`, `como_a_unicamp_cobra` |
| `conceitos[]` | `id`, `nome`, `explicacao`, `exemplo`, `dica_de_prova`, `imagens[]` (ids) |
| `questoes_indexadas[]` | Questões reais de vestibular: `id`, `instituicao`, `ano`, `fase`, `numero`, `tipo`, `assunto`, `o_que_cobra`, `gabarito_oficial`, `link_questao`, `link_gabarito`, `conceitos[]` (ids) |
| `questoes_reforco[]` | `id`, `tipo` (`multipla_escolha` ou `dissertativa`), `dificuldade` (`facil`, `media`, `dificil`), `inspirada_em` (id de questão indexada), `conceitos[]`, `imagens[]`, `enunciado`, `alternativas[]` (`letra`, `texto`), `gabarito`, `resolucao` |
| `imagens[]` | `id`, `tipo`, `url`, `alt`, `legenda`, `credito`, `licenca`, `fonte_url` |
| `fontes[]` | `titulo`, `url` |

Nos textos, fórmulas vão entre cifrões (`$a_n = a_1 + (n-1)r$`, renderizadas com KaTeX) e valem `**negrito**`, `*itálico*` e listas com `- `. Um cifrão seguido de espaço, como em `R$ 150`, é tratado como moeda.

As imagens são carregadas direto da `url` informada (não são copiadas para o repositório). Se uma delas sair do ar, a página mostra um aviso no lugar e mantém o link da fonte. Os ids ligam as partes entre si: cada conceito mostra em quais provas já caiu e quais questões de reforço o treinam, e cada questão de vestibular aponta para as questões de reforço inspiradas nela.
