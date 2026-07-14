#!/usr/bin/env node
/**
 * Busca as notas dos repositórios de conteúdo listados em labs.config.json,
 * copia para src/content/docs/<slug>/ e injeta o frontmatter mínimo exigido
 * pelo Starlight (title) nas notas que não o possuem.
 *
 * Uso:
 *   node scripts/fetch-content.mjs             # clona os repos do GitHub
 *   node scripts/fetch-content.mjs --local ..  # usa clones locais irmãos deste repo
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS_DIR = path.join(ROOT, "src", "content", "docs");
const CACHE_DIR = path.join(ROOT, ".labs-cache");
const SIDEBAR_OUT = path.join(ROOT, "labs-sidebar.generated.json");

const args = process.argv.slice(2);
const localFlag = args.indexOf("--local");
const localRoot =
  localFlag === -1 ? null : path.resolve(ROOT, args[localFlag + 1] ?? "..");

const { labs } = JSON.parse(
  fs.readFileSync(path.join(ROOT, "labs.config.json"), "utf8"),
);

const sidebar = [];

for (const lab of labs) {
  // No modo --local, a pasta irmã tem o nome do repositório (ex: ai-labs),
  // que pode diferir do slug usado na URL (ex: ai).
  const repoName = lab.repo.split("/").pop();
  const source = localRoot ? path.join(localRoot, repoName) : cloneLab(lab);
  if (!fs.existsSync(source)) {
    console.warn(`[${lab.slug}] fonte não encontrada em ${source} - lab ignorado`);
    continue;
  }

  const notesDirName = lab.notesDir ?? "notes";
  const notesDir = path.join(source, notesDirName);
  if (!fs.existsSync(notesDir)) {
    console.warn(`[${lab.slug}] pasta "${notesDirName}/" não existe no repositório - lab ignorado`);
    continue;
  }

  const dest = path.join(DOCS_DIR, lab.slug);
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(notesDir, dest, { recursive: true });

  const total = injectFrontmatter(dest);
  console.log(`[${lab.slug}] ${total} nota(s) copiada(s) para src/content/docs/${lab.slug}/`);

  sidebar.push(sidebarEntry(lab, path.join(source, "sidebar.json")));
}

fs.writeFileSync(SIDEBAR_OUT, JSON.stringify(sidebar, null, 2) + "\n");
console.log(`Sidebar gerada em ${path.relative(ROOT, SIDEBAR_OUT)}`);

function cloneLab(lab) {
  const dest = path.join(CACHE_DIR, lab.slug);
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  execFileSync(
    "git",
    [
      "clone",
      "--depth",
      "1",
      "--branch",
      lab.branch ?? "main",
      `https://github.com/${lab.repo}.git`,
      dest,
    ],
    { stdio: "inherit" },
  );
  return dest;
}

/** Garante que todo .md/.mdx copiado tenha `title` no frontmatter. */
function injectFrontmatter(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile() || !/\.mdx?$/.test(entry.name)) continue;
    processNote(path.join(entry.parentPath ?? entry.path, entry.name));
    total++;
  }
  return total;
}

function processNote(file) {
  const raw = fs.readFileSync(file, "utf8");
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  // Nota já tem frontmatter com title: não mexe.
  if (fmMatch && /^\s*title\s*:/m.test(fmMatch[1])) return;

  const body = fmMatch ? raw.slice(fmMatch[0].length) : raw;
  const { title, rest } = extractTitle(body, fallbackTitle(file));
  const extraFields = fmMatch ? fmMatch[1].replace(/\s+$/, "") + "\n" : "";
  const frontmatter = `---\ntitle: ${JSON.stringify(title)}\n${extraFields}---\n\n`;
  fs.writeFileSync(file, frontmatter + rest);
}

/** Usa o primeiro `# H1` como título e o remove do corpo (o Starlight renderiza o title). */
function extractTitle(body, fallback) {
  const lines = body.split(/\r?\n/);
  const first = lines.findIndex((line) => line.trim() !== "");
  if (first !== -1) {
    const h1 = lines[first].match(/^#\s+(.+?)\s*#*\s*$/);
    if (h1) {
      const rest = lines
        .slice(first + 1)
        .join("\n")
        .replace(/^\s*\n/, "");
      return { title: h1[1].trim(), rest };
    }
  }
  return { title: fallback, rest: body };
}

/** Título derivado do nome do arquivo: "02-conceitos-basicos.md" vira "Conceitos basicos". */
function fallbackTitle(file) {
  let base = path.basename(file).replace(/\.mdx?$/, "");
  if (base === "index") base = path.basename(path.dirname(file));
  const words = base.replace(/^\d+[-_]/, "").replace(/[-_]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Monta a entrada do lab na sidebar. Se o repositório de conteúdo tiver um
 * sidebar.json na raiz, usa as seções declaradas nele; caso contrário, gera
 * tudo automaticamente a partir da estrutura de pastas.
 */
function sidebarEntry(lab, sidebarFile) {
  const group = { label: lab.label, collapsed: lab.collapsed ?? false };
  if (!fs.existsSync(sidebarFile)) {
    return { ...group, autogenerate: { directory: lab.slug } };
  }

  const { sections } = JSON.parse(fs.readFileSync(sidebarFile, "utf8"));
  const items = sections.map((section) => {
    if (section.directory) {
      return {
        label: section.label,
        autogenerate: { directory: `${lab.slug}/${section.directory}` },
      };
    }
    const slug =
      !section.slug || section.slug === "." ? lab.slug : `${lab.slug}/${section.slug}`;
    return section.label ? { label: section.label, slug } : slug;
  });
  return { ...group, items };
}
