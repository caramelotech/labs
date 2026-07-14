# Guia para Agentes de IA - Caramelo Labs

## Sobre o Projeto

**Caramelo Labs** é o repositório **hub** dos labs da Caramelo Tech. Ele contém a estrutura do site (Astro + Starlight) e busca, em tempo de build, as notas dos repositórios de conteúdo (ai-labs, java-labs, web-dev-labs, etc.). O site é publicado via GitHub Pages em `https://caramelotech.com.br/labs`.

Os repositórios de conteúdo têm apenas Markdown puro em `notes/` - sem frontmatter, sem dependências. Este repositório injeta o frontmatter exigido pelo Starlight durante o fetch.

Estrutura:

- `labs.config.json` - registro dos labs (slug, label, repo, branch, notesDir)
- `scripts/fetch-content.mjs` - busca notas, injeta frontmatter e gera a sidebar
- `labs-sidebar.generated.json` - sidebar gerada pelo fetch (ignorada pelo git)
- `src/content/docs/` - apenas `index.mdx` e `404.md` são versionados; o resto é buscado
- `src/styles/custom.css` - customizações visuais

## Comandos Essenciais

```bash
npm install          # instalar dependências
npm run fetch        # clonar labs do GitHub e montar o conteúdo
npm run fetch:local  # copiar de clones locais irmãos (../<slug>)
npm run dev          # servidor local em localhost:4321 (rode um fetch antes)
npm run build        # build para produção
npm run preview      # preview do build gerado
```

## Regras Importantes

- **Notas não são editadas aqui.** O conteúdo em `src/content/docs/<lab>/` é gerado pelo fetch e sobrescrito a cada execução. Para alterar notas, edite o repositório de conteúdo do lab correspondente.
- Somente `src/content/docs/index.mdx` e `src/content/docs/404.md` pertencem a este repositório.
- A sidebar não é editada em `astro.config.mjs` - ela vem de `labs.config.json` (ordem dos labs) e do `sidebar.json` de cada repositório de conteúdo (seções internas).
- O `base: "/labs"` em `astro.config.mjs` não pode mudar (corresponde ao sub-path do GitHub Pages).

## Tarefas Comuns

### Adicionar um novo lab

1. Adicionar entrada em `labs.config.json`:
   ```json
   {
     "slug": "novo-lab",
     "label": "Novo Lab",
     "repo": "caramelotech/novo-lab",
     "branch": "main",
     "notesDir": "notes"
   }
   ```
2. Opcional: adicionar `LinkCard` do lab em `src/content/docs/index.mdx`
3. O repositório de conteúdo precisa ter `notes/` e, opcionalmente, `sidebar.json` e o workflow `notify-hub.yml` (ver README)

### Testar o site com conteúdo real

```bash
npm run fetch        # ou fetch:local, se houver clones irmãos
npm run build
```

O build falha se alguma nota gerar frontmatter inválido - a mensagem de erro do Astro indica o arquivo.

## Convenções de conteúdo (valem para os repositórios de conteúdo)

- Notas em português (pt-BR), Markdown puro
- Primeira linha de cada nota: `# Título da Nota` (vira o `title` no site e é removida do corpo)
- Prefixo numérico controla ordem dentro da pasta: `01-`, `02-`, ...
- Imagens junto das notas, referenciadas com caminho relativo em sintaxe Markdown: `![alt](./assets/img.png)`
- Links entre notas usam o caminho completo do site: `/labs/<lab>/<secao>/<nota>/`
- Usar hífens (-) em vez de travessões (—)
- NÃO usar `---` para separar seções (apenas para notas/atribuições no final do arquivo)

## Git

- **NUNCA** fazer `git commit` ou `git push` automaticamente
- Apenas executar comandos git quando explicitamente solicitado pelo usuário
