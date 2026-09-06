import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
      // Fora do Next não existe a condição "react-server", e o entrypoint padrão do
      // `server-only` lança ao ser importado. Apontar direto para o módulo vazio (o mesmo
      // que o Next usa no servidor) mantém a guarda em produção e deixa o teste rodar.
      "server-only": fileURLToPath(new URL("./node_modules/server-only/empty.js", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
  },
});
