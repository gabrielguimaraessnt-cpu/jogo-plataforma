# As Aventuras da Bia — regras de trabalho

- Responder ao usuário em português. O usuário não é programador: explicar em linguagem simples e fazer
  as etapas técnicas por ele.
- Jogo-presente para a noiva do usuário (Bia / Beatriz Pinheiro). Tudo personalizado: fases ligadas à vida
  dela (família, igreja evangélica — banda/louvor, não coral —, hobbies, antigo emprego, Natal, casamento em 17/10/2027). Manter o tom carinhoso.
- O vilão "XôMaq" é sátira de uma loja real: nunca usar o nome real nem o logo real no jogo.
- Jogo estático em Three.js (sem build): `index.html` + `src/*.js` (módulos ES) + `vendor/three` (0.169.0).
- Publicação: Vercel ligada à branch `main` (site estático, sem comando de build).
- Supabase: projeto **`jogo-plataforma`** (ref `czaomtjzomclqnkkfgkz`). Usar SÓ este projeto. Não mexer no
  `sistema-gerencial-integrado` nem em outro projeto.
- Migrations em `supabase/migrations/`, idempotentes. Gravação de recordes só pela função `registrar_recorde`.
- Nunca commitar a chave `service_role`. A chave publishable em `src/config.js` é pública de propósito.
- Fases: `src/fases/*.js` usando o construtor (`construtor.js`). Temas visuais: `src/temas.js`.
  Pulo alcança ~2 m de altura e ~5 m de distância: buracos até 4,5 m, degraus até 1,5 m.
- Testar no navegador headless (Playwright, com `--use-angle=swiftshader`) servindo a pasta com
  `python3 -m http.server`. `?tudo=1` libera todas as fases; `window.__jogo` expõe `mundo`, `jogador`,
  `comecar(i)` e `estado`. No swiftshader o jogo roda lento (poucos quadros por segundo): esperar mais.
