# Zuca e a Floresta do Caju — regras de trabalho

- Responder ao usuário em português. O usuário não é programador: explicar em linguagem simples e fazer
  as etapas técnicas por ele.
- Jogo estático em Three.js (sem build): `index.html` + `src/*.js` (módulos ES) + `vendor/three` (versão fixa 0.169.0).
- Publicação: Vercel ligada à branch `main` (site estático, sem comando de build).
- Supabase: projeto **`jogo-plataforma`** (ref `czaomtjzomclqnkkfgkz`). Usar SÓ este projeto. Não mexer no
  `sistema-gerencial-integrado` nem em nenhum outro projeto.
- Migrations em `supabase/migrations/`, idempotentes. Gravação de recordes só pela função `registrar_recorde`;
  a tabela fica sem permissão de INSERT/UPDATE/DELETE para `anon`/`authenticated`.
- Nunca commitar a chave `service_role`. A chave publishable em `src/config.js` é pública de propósito.
- Fases são dados em `src/fases/`; ajustes de jogabilidade em `src/config.js` (`AJUSTES`).
- Testar no navegador headless (Playwright, com `--use-angle=swiftshader`) servindo a pasta com
  `python3 -m http.server`. `window.__jogo` expõe `mundo` e `jogador` para testes.
- Personagem e mundo são originais. Não copiar personagens, nomes ou arte de jogos existentes.
