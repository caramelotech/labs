import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { existsSync, readFileSync } from "node:fs";

// Sidebar gerada por scripts/fetch-content.mjs a partir de labs.config.json
// e dos sidebar.json dos repositórios de conteúdo. Sem o arquivo (fetch não
// executado), o Starlight gera a sidebar automaticamente.
const sidebarFile = new URL("./labs-sidebar.generated.json", import.meta.url);
const sidebar = existsSync(sidebarFile)
  ? JSON.parse(readFileSync(sidebarFile, "utf8"))
  : undefined;

export default defineConfig({
  site: "https://caramelotech.com.br",
  base: "/labs",
  integrations: [
    starlight({
      title: "Caramelo Tech",
      customCss: ["./src/styles/custom.css"],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/caramelotech",
        },
        {
          icon: "linkedin",
          label: "LinkedIn",
          href: "https://www.linkedin.com/company/caramelotech/",
        },
        {
          icon: "instagram",
          label: "Instagram",
          href: "https://www.instagram.com/caramelo_tech/",
        },
      ],
      defaultLocale: "root",
      locales: {
        root: { label: "Português", lang: "pt-BR" },
      },
      sidebar,
    }),
  ],
});
