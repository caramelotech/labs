# Caramelo Labs

Site central dos **labs da Caramelo Tech** - repositório hub que reúne e publica as notas de todos os labs (AI Labs, Java Labs, Web Dev Labs, etc.) em um único site com Astro + Starlight.

Acesse: https://caramelotech.com.br/labs

## Como funciona

Este repositório contém apenas a **estrutura do site** (Astro, Starlight, estilos, deploy). As notas ficam em repositórios de conteúdo separados, que contêm apenas Markdown puro - sem frontmatter, sem dependências, sem build.

```
labs (hub)                repositórios de conteúdo
├── astro.config.mjs               ai-labs/
├── labs.config.json  ←──────────  ├── notes/        ← só Markdown puro
├── scripts/                       │   ├── fundamentos/
│   └── fetch-content.mjs          │   └── ...
├── src/content/docs/              └── sidebar.json  ← seções da sidebar (opcional)
│   ├── index.mdx   (página inicial)
│   └── 404.md
└── .github/workflows/deploy.yml
```

No build, o script `scripts/fetch-content.mjs`:

1. Lê `labs.config.json` e clona cada repositório de conteúdo
2. Copia a pasta `notes/` de cada lab para `src/content/docs/<slug>/`
3. Injeta o frontmatter mínimo exigido pelo Starlight: o `title` vem do primeiro `# H1` de cada nota (que é removido do corpo, pois o Starlight renderiza o título)
4. Gera a sidebar a partir do `sidebar.json` de cada lab (ou automaticamente, se ausente)

O deploy roda a cada push neste repositório e também via `repository_dispatch` (evento `content-update`), disparado pelos repositórios de conteúdo quando as notas mudam.

## Adicionando um novo lab

1. No repositório de conteúdo, crie a pasta `notes/` com as notas em Markdown puro (primeira linha de cada nota deve ser um `# Título`)
2. Opcionalmente, crie um `sidebar.json` na raiz do repositório de conteúdo:

   ```json
   {
     "sections": [
       { "label": "Visão geral", "slug": "." },
       { "label": "Fundamentos", "directory": "fundamentos" },
       { "label": "Recursos", "slug": "recursos" }
     ]
   }
   ```

   - `directory` gera um grupo com todas as notas da subpasta
   - `slug` aponta para uma nota específica (`.` é o `notes/index.md` do lab)
   - Sem `sidebar.json`, a sidebar é gerada automaticamente pela estrutura de pastas

3. Registre o lab em `labs.config.json` neste repositório:

   ```json
   {
     "slug": "novo-lab",
     "label": "Novo Lab",
     "repo": "caramelotech/novo-lab",
     "branch": "main",
     "notesDir": "notes"
   }
   ```

4. No repositório de conteúdo, adicione o workflow `.github/workflows/notify-hub.yml` para rebuildar o site a cada push de notas (requer o secret `HUB_DISPATCH_TOKEN`, um fine-grained PAT com permissão `contents: read & write` neste repositório hub)

## Rodando localmente

```bash
npm install
npm run fetch          # clona os labs do GitHub e monta o conteúdo
npm run dev            # servidor em localhost:4321
```

Para desenvolver usando clones locais dos labs (irmãos desta pasta), use:

```bash
npm run fetch:local    # copia de ../<slug> em vez de clonar
```

O conteúdo buscado (`src/content/docs/<lab>/`, `labs-sidebar.generated.json`, `.labs-cache/`) é ignorado pelo git - apenas `index.mdx` e `404.md` são versionados.

## Escrevendo notas (nos repositórios de conteúdo)

- Markdown puro, sem frontmatter
- A primeira linha da nota deve ser o título: `# Título da Nota`
- Prefixo numérico no nome do arquivo controla a ordem: `01-introducao.md`, `02-conceitos.md`
- Imagens ficam junto das notas (ex: `notes/secao/assets/img.png`) e são referenciadas com caminho relativo: `![alt](./assets/img.png)`
- Frontmatter continua sendo aceito, se a nota precisar de campos extras (ex: `description`, `tags`)

## Sobre a Caramelo Tech

A Caramelo Tech é uma iniciativa focada em aprendizado prático de tecnologia.

Aqui você não apenas lê - você constrói.

## Licença

MIT
