# Excursão Kairós — Landing Page

Landing page de conversão (leads via WhatsApp) construída com Next.js 16, React 19, Tailwind CSS v4 e Framer Motion.

## Rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Painel admin (`/admin`)

Viagens, passageiros e o mapa do ônibus de 46 lugares.

- **Login:** defina `ADMIN_LOGIN` e `ADMIN_PASSWORD`. Localmente, copie `.env.example` para `.env.local`. Em produção são secrets do repositório (Settings → Secrets and variables → Actions). O build grava só um hash derivado; a senha não vai para o site.
- **Passageiros:** cada pessoa é cadastrada uma vez (nome, documento CPF/RG/CIN, telefone) e pode ser colocada em qualquer viagem. Ao preencher uma poltrona, digitar o nome sugere quem já está cadastrado.
- **Planilhas:** exporta e importa `.xlsx` por viagem (com a coluna Poltrona) e do cadastro de passageiros. As colunas são reconhecidas pelo cabeçalho, em qualquer ordem.
- **Dados:** o site é estático, então tudo fica no navegador de quem usa o painel, criptografado com a senha (AES-GCM). Não sincroniza entre aparelhos; use Exportar/Importar backup.
- **Troca de senha:** exporte o backup antes de trocar os secrets e importe depois de entrar com a senha nova.
- **Limite:** a conferência do login acontece no navegador. Use uma senha longa.

### Atualizar o site sem perder os dados salvos

Publicar uma versão nova não apaga nada: os dados ficam no `localStorage` do navegador, que o deploy não toca. O que pode quebrar é o **formato** mudar. Para isso:

1. O formato tem um número de versão (`CURRENT_SCHEMA` em `lib/admin/schema.ts`), gravado junto com os dados.
2. Ao entrar, o painel converte dados de versões anteriores para a atual (`migrate`). Antes de regravar, guarda uma cópia intacta do que havia (`kairos-admin-snapshot-schema-N`).
3. Se algo não puder ser lido, ou vier de uma versão mais nova, o painel não escreve por cima.
4. `npm test` roda as migrações com dados reais de cada formato antigo. O deploy só acontece se passarem.

Para mudar o formato: suba `CURRENT_SCHEMA`, escreva a função `vN -> vN+1`, adicione um teste com dados no formato anterior. Nunca edite uma migração já publicada, nem mude o nome da chave `kairos-admin-data-v1`.

O que ainda apaga os dados, e nenhum código evita: limpar os dados do navegador, trocar de aparelho, ou mudar o endereço do site (um domínio próprio é outro `localStorage`). Nesses casos, use o backup.

### Componentes

A interface do painel usa componentes da [Easy UI](https://easyui.site) (MIT), copiados em `components/easyui/` e adaptados aos tokens da Kairós. `components/admin/ui.tsx` aplica os tamanhos e o amarelo da marca.

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
