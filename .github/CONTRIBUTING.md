# Guia de Contribuição

Obrigado por querer contribuir com o Caramelo Labs!

## Antes de tudo: onde fica o quê

Este é o repositório **hub** - ele contém apenas a estrutura do site (Astro/Starlight, script de fetch, deploy). **As notas ficam nos repositórios de conteúdo de cada lab** (ex: [ai-labs](https://github.com/caramelotech/ai-labs)).

- Quer melhorar ou adicionar **notas**? Contribua no repositório do lab correspondente.
- Quer melhorar o **site** (estilos, sidebar, script de fetch, deploy)? Contribua aqui.

## O que pode ser contribuído aqui

- Melhorias no script de fetch (`scripts/fetch-content.mjs`)
- Registro de novos labs em `labs.config.json`
- Melhorias visuais (`src/styles/custom.css`) e na página inicial (`src/content/docs/index.mdx`)
- Melhorias no workflow de deploy (`.github/workflows/deploy.yml`)

## Processo

1. Crie uma branch a partir de `main` seguindo o padrão:

   ```
   feature/descricao-curta
   fix/descricao-curta
   docs/descricao-curta
   ```

2. Faça commits atômicos com mensagens no padrão de Conventional Commits:

   ```
   feat: adicionar java-labs ao registro de labs
   fix: corrigir injeção de frontmatter em arquivos .mdx
   docs: melhorar instruções de novo lab no README
   ```

   Tipos válidos: `feat`, `fix`, `docs`, `style`, `refactor`, `chore`

3. Abra um Pull Request usando o template disponível e aguarde revisão.

4. Após aprovação, o merge será feito por um mantenedor.

## Rodando o site localmente

```bash
npm install
npm run fetch   # clona os labs e monta o conteúdo
npm run dev     # localhost:4321
```

Antes de abrir o PR, confirme que o build passa:

```bash
npm run fetch && npm run build
```

## Dúvidas?

Abra uma issue com a tag `question`.
