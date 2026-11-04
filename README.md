# Excursão Kairós — Landing Page

Landing page de conversão (leads via WhatsApp) construída com Next.js 16, React 19, Tailwind CSS v4 e Framer Motion.

## Rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

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
