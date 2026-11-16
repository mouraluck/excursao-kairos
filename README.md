# Excursão Kairós — Landing Page

Landing page de conversão (leads via WhatsApp) construída com Next.js 16, React 19, Tailwind CSS v4 e Framer Motion.

## Rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Painel admin (`/admin`)

Controle de viagens e passageiros, com mapa do ônibus de 46 lugares e lista para impressão.

- **Login:** defina `ADMIN_LOGIN` e `ADMIN_PASSWORD`. Localmente, copie `.env.example` para `.env.local`. Em produção, crie os dois como secrets do repositório (Settings → Secrets and variables → Actions) e rode o deploy de novo. O build grava só um hash derivado; a senha não vai para o site.
- **Dados:** o site é estático, então viagens e passageiros ficam no navegador de quem usa o painel, criptografados com a senha (AES-GCM). Não sincronizam entre aparelhos. Use Exportar/Importar backup para levar a outro aparelho.
- **Troca de senha:** exporte o backup antes de trocar os secrets e importe depois de entrar com a senha nova. Os dados antigos só abrem com a senha antiga.
- **Limite:** a conferência do login acontece no navegador. Use uma senha longa, porque o hash publicado pode ser testado offline.

## Tema

O modo claro é o padrão. O botão de lua/sol no header alterna para o escuro e a escolha fica salva no navegador (`localStorage`, chave `kairos-theme`). Os tokens dos dois temas estão em `app/globals.css` (`:root` e `html[data-theme="dark"]`).

## Onde editar

- `lib/site.ts`: URL do WhatsApp, Instagram, nome da responsável e itens do menu.
- `app/globals.css`: paleta (extraída da logo), fontes e animações.
- `components/hero.tsx`: título, subtítulo e CTA principal.
- `components/bento.tsx`: cards de diferenciais e lista de roteiros.
- `components/footer.tsx`: rodapé.
- `public/logo.svg`: logo oficial.

## Paleta

| Token | Hex | Origem |
|---|---|---|
| `kairos-yellow` | `#FFF101` | fundo da logo |
| `kairos-ink` | `#333439` | tipografia da logo |
| `kairos-gold` | `#C4B65F` | ampulheta |
| `kairos-sand` | `#DDD0A8` | areia da ampulheta |
| `kairos-bronze` | `#977551` | base da ampulheta |
