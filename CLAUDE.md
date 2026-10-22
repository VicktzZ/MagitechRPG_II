# MagitechRPG II — notas para o Claude

## Magias: tipo e subtipo

O campo `type` de uma magia é texto livre no formato `Categoria (subtipo)`, por exemplo
`Ataque (imediato)`. A categoria alimenta o filtro "Tipo" do modal de magias e o subtipo
alimenta o filtro "Subtipo" (`utils/spellCategory.ts`).

Definições dadas pelo dono do projeto:

- **contínuo** — o efeito dura uma **quantidade fixa de turnos**.
- **sustentado** — para manter a magia ativa o conjurador paga **metade do custo de MP** dela
  a cada turno, como **ação livre**, até parar de pagar ou perder a concentração.
  Não usar "sustentado" só porque a magia dura vários turnos: isso é "contínuo".
- **conjurado** — a magia só é executada no **próximo turno** do conjurador (rodada seguinte).
  Não usar para magia que resolve na hora nem para magia que só dura vários turnos.
- **imediato** — definição ainda não fornecida (presumivelmente o oposto de conjurado: resolve
  na hora, sem duração em turnos). Perguntar antes de reclassificar magias para/de "imediato".

**Reação é uma execução, não um subtipo.** Magias de reação têm `execution: 'Reação'` e, no catálogo,
quase todas são `(imediato)` no `type`. Duas (Rajada Refletora, Retribuição Cinética) têm `(Reação)` no
`type`; o filtro de subtipo ignora esse texto. Para listar reações, usa-se o filtro "Execução"
(Padrão, Completa, Movimento, Livre, Reação) do modal de magias.

## Convenções do catálogo de magias (conferidas no Firestore real, coleção `spells`)

- `element` em MAIÚSCULAS (`FOGO`, `ÁGUA`, `NÃO-ELEMENTAL`, `PSÍQUICO`...). A API filtra assim.
- `execution`: `Padrão`, `Completa`, `Livre`, `Reação` ou `Movimento` (não existe "Bônus").
- `range`: `Pessoal`, `Toque`, `Curto`, `Médio`, `Longo`... (forma abreviada, sem metros).
- Sempre 3 estágios; no nível 4 o 3º é a Maestria. Custo exibido = `mpCost` + extra do estágio
  (`calculateExtraManaCost`). Custo base médio no catálogo: N1 1,7 · N2 4,2 · N3 7 · N4 12.
- `level` e `mpCost` como número nos documentos novos.
- Texto no vocabulário do catálogo: "turnos" e "combate" (não "rodadas"/"cena"), metros como `4,5m`.
- No máximo UMA expressão de dados (`XdY`) por estágio: `castSpell` rola todas as que achar no texto.
- Antes de criar magias, ler o catálogo para não repetir conceito e seguir o vocabulário real.

Lotes já criados: `scripts/data/manaRecoverySpells.ts` (ids `seed-mp-*`) e
`scripts/data/reactionSpells.ts` (ids `seed-rx-*`). Usar `scripts/seedSpellBatch.ts` para gravar
(upsert idempotente por id fixo). Gravação direta no Firestore de produção só com liberação
explícita do dono: criar apenas ids novos, abortar se houver colisão de id ou nome, e reler para conferir.
Para alterar um lote já gravado, conferir antes que os documentos ainda estão na versão anterior do
lote (senão alguém editou à mão), sobrescrever só os ids do lote e reler para conferir.

## Campanha: testes pedidos pelo mestre e tempo real

- **Teste ("Solicitar teste")** não usa Pusher. O mestre grava o pedido em `campaign.session.testRequest`
  (`POST /api/campaign/[id]/session/test-request`) e os jogadores o recebem pelo listener da campanha; cada
  resposta vai para `testRequest.responses.<userId>` (`.../test-response`, em transação). O servidor refaz a conta
  (maior d20 + bônus contra a DT) e confere pedido, prazo (10 min) e se o jogador foi chamado. O nº de d20 do teste é
  `mods.attributes` do atributo padrão (mínimo 1), vale o maior. **Não é a mesma regra do botão da perícia na ficha** (`subcomponents/Expertise.tsx`:
  `mod + 1` d20, e mod negativo rola 2), nem da criatura (`⌊valor/5⌋`): a regra única é decisão pendente do dono.
  Lógica pura em `utils/campaignTest.ts`; validação em `utils/api/campaignTests.ts`; fluxo do navegador em
  `hooks/useCampaignTest.ts`.
- **Pusher está praticamente sem uso**: só o mestre assina (`hooks/usePusher.tsx`), e no canal `CODIGO` enquanto o
  servidor publica em `presence-CODIGO`, então os eventos do servidor não chegam a nenhum cliente. O estado em tempo
  real da campanha é todo Firestore. Antes de usar Pusher para algo novo, corrija o nome do canal e a assinatura dos jogadores.
- Eventos de cliente do Pusher (`channel.trigger`) exigem nome com prefixo `client-`; sem ele a lib lança `BadEventName`.
- Rotas que reescrevem a campanha inteira (`campaignRepository.update({ ...campaign, ... })`) perdem alterações
  simultâneas. Para campos soltos use `adminUpdateDoc` (caminhos de campo) e, quando precisar conferir antes de
  gravar, `adminUpdateDocInTransaction`. `session/connect` e `session/disconnect` já fazem assim: só `session.users` e
  `players` (e o campo `session` da ficha) são gravados, com a lógica pura em `utils/campaignPresence.ts`. Ainda
  reescrevem a campanha inteira, entre outras, as rotas de notas, `offer-perks` e `pending-perk-user`.
- Avise o Pusher sempre com `triggerPusher` (`utils/pusher.ts`): o aviso é um extra e uma falha dele não pode virar 500
  depois de a gravação já ter sido feita. A presença (quem está online) é `campaign.session.users`; o navegador
  conecta ao abrir a campanha e desconecta ao sair da tela e no `pagehide` (fetch com `keepalive`).
- **Erros em `catch`**: use `errorMessage(error, 'texto padrão')` e `asRequestError` de `utils/errors.ts`; nada de
  `catch (error: any)`. Listas que o Firestore devolve como objeto de chaves numéricas: `utils/normalizeToArray.ts`.

- **Chat**: as mensagens ficam em `campaigns/{id}/messages` (um documento por mensagem, ID = ID da mensagem), não mais
  na lista `session.messages` da campanha. O servidor só cria o documento (`utils/firestore/campaignMessages.ts`:
  `appendCampaignMessage`, `listCampaignMessages`, `deleteCampaignMessages`); o navegador acompanha as últimas 100 em
  tempo real e busca as anteriores por `GET /api/campaign/[id]/messages?beforeId=` (`hooks/useCampaignChatFeed.ts`).
  O horário da mensagem é o do servidor. As mensagens antigas que ainda estão na lista da campanha aparecem junto, sem
  repetir; `scripts/migrateCampaignMessages.ts` as move (simulação por padrão; `--apply` copia, `--clear` esvazia a lista
  antiga — **grava no banco: só com liberação do dono**). Ao excluir a campanha o servidor apaga a subcoleção.
  **Publique `firestore.rules` antes do código**: a regra nova de `campaigns/{id}/messages` é aditiva, mas sem ela o
  navegador não lê o chat.
- **Verificar contra o Firestore de verdade (emulador)**: `(cd tests/firestore-rules && npm install)` uma vez; depois
  `npm test` nessa pasta (regras) e `npm run test:emulator` na raiz (helpers do servidor com o Admin SDK).
- **Ver a campanha rodando, sem banco real**: emuladores (`firebase emulators:start --only firestore,auth --project
  demo-magitech --config firebase.firestore.json`) + `next dev` com `NEXT_PUBLIC_FIREBASE_EMULATORS=true`,
  `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`, `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099` e credenciais descartáveis. O login
  de desenvolvimento é o provedor de administração (`ADMIN_EMAIL`/`ADMIN_PASSWORD`, só com `NODE_ENV=development`); o
  `signIn` do NextAuth grava `image: undefined` para esse usuário e o Firestore recusa, então o usuário de teste não pode
  ter `image` na hora do login.

## Campanha: layout da página

- **Uma coluna só** (`CampaignComponent`): cabeçalho, avisos, ações do mestre, notas e o painel de quem está vendo.
  O chat (`SessionChat`/`ChatWrapper`) é uma coluna **encaixada** à direita a partir de `lg` (`CampaignShell` reserva o
  espaço com padding; `campaignLayout.ts` tem `CHAT_PANEL_WIDTH` e `useChatDocked`), abre fechado em telas menores e
  vira sobreposição de tela cheia no celular, com o selo de mensagens não lidas (`useUnreadMessages`).
- **Dock flutuante** (`FloatingDock`, canto inferior direito, ao lado do chat): card de combate (`CombatStatus`, começa
  recolhido e abre sozinho no turno do jogador) e widgets (`CampaignWidgetPanel`). Painel `position: fixed` com
  `transform` cria um bloco de contenção para filhos fixos: por isso nada novo deve morar dentro do painel do chat.
- **Seções** usam o `Section` compartilhado (`components/campaign/Section.tsx`, título com ícone neutro, filete e
  `scroll-margin-top: var(--campaign-sticky-offset)`); os componentes de seção (perícias, magias, inventário...) não
  têm moldura nem título próprios, só o conteúdo. O painel do jogador tem barra fixa com navegação por âncoras e os
  pontos vitais compactos (`PlayerStickyBar`); colunas lado a lado usam container query (`@container (min-width: 820px)`),
  porque a largura útil depende do chat encaixado.
- Sem emoji na interface (só dados que o usuário escolhe: ícone de widget/efeito, e o 🎲 do texto de rolagem do chat,
  que o `DiceMessage` reconhece), texto ≥ 12px, ícones decorativos em `text.secondary`.
- **Arquivos grandes**: componentes acima de ~400 linhas devem ser divididos em subpastas por seção
  (`gmDashboard/dashboard/`, `playerDashboard/inventory/`, `widget/panel/`...), mantendo o arquivo original como
  composição com o mesmo export e props.

## Ficha: salvar e validar

Dados reais (61 fichas) mostraram que 42 não passavam no schema antigo e que salvar apagava `session[].perks`. Regras que valem agora:

- **Salvar ficha existente envia só o que mudou.** `useCharsheetSubmit` (`components/charsheet/page/`) compara o formulário com a
  ficha como foi carregada (`CharsheetBaseline`, em `contexts/CharsheetFormProvider.tsx`) por `collectChanges`
  (`utils/charsheetDiff.ts`) e grava por `PATCH /api/charsheet/[id]/fields` (caminhos de campo). Objetos são comparados campo a
  campo, listas valem como um todo. **Nunca** grava `id`, `userId`, `createdAt`, `playerName` nem `session` (é da campanha: vantagens,
  stats da sessão). Escrita do mestre enquanto a ficha está aberta não é desfeita. Depois de salvar, `markSaved` + `form.reset`.
- **`PATCH /api/charsheet/[id]`** (abas antigas, clientes externos) também é parcial: grava só as chaves de topo do corpo, ignora as
  protegidas acima, `spells` vira ids e `traits: []` persiste. Não use `plainToInstance` + `update` da ficha inteira (vazava defaults e
  apagava `session`).
- **Normalização na carga** (`utils/charsheetNormalize.ts`, chamada por `useCompleteCharsheet`): lista gravada como objeto de chaves
  numéricas vira array, `elementalMastery`/`anotacoes`/`financialCondition` nulos viram `''`, perícia solta vira `{value, defaultAttribute}`,
  arma sem `ammo`/`bonus`/`hit`... ganha os campos. É pura e idempotente e só mexe no formato. A carga também devolve `dropped`
  (magias/poderes que a tela não mostra); `collectChanges` os devolve junto quando a lista é regravada.
- **Schema** (`schemas/charsheetSchema.ts`): `buildCharsheetSchema({ mode })`. `create` é rígido (pontos de atributo e perícia = 0, atributo ≤ 30,
  perícia ≤ 10). `edit` não bloqueia pontos sobrando (o level-up concede na hora) e os tetos só barram quem AUMENTA. O resolver
  (`schemas/charsheetResolver.ts`) ainda ignora, na edição, erro de campo que vale o mesmo que o salvo (não é o jogador que o causou) e entrega
  os valores CRUS ao envio. O Zod descarta chaves que não conhece: **use `.passthrough()`** em objeto novo do schema, senão o submit apaga
  a chave. Evite `z.union` de itens: o resolver lista os erros de todas as ramificações ("Required" de campos que o item nem tem).
- **Erros legíveis**: `utils/charsheetErrors.ts` (`listFormErrors`) devolve "Inventário > Armas > Pistola > Munição: campo obrigatório" com a
  âncora da seção (`CHARSHEET_SECTION_IDS`); pontos para gastar aparecem como aviso (`PendingPoints`), não como erro, em ficha criada.
- **Poderes** ficam como objeto na ficha, não como id: habilidades de sistema customizado não existem no catálogo `powers`. Só poder mágico do
  catálogo (`type: 'Poder Mágico'`) vira id na criação (`POST /api/charsheet`). `spells` ficam como ids (`id || name`).
- **Migração do formato das fichas antigas**: `scripts/normalizeCharsheets.ts` (mesma função da carga). Simulação por padrão, `--apply`
  regrava cada ficha numa transação, só os caminhos alterados, guarda o valor antigo em arquivo e não apaga nada.
  **Grava no banco: só com liberação do dono.** Teste com o emulador: `utils/firestore/__tests__/normalizeCharsheets.emulator.test.ts`.
- O rascunho da criação (`create-charsheet-autosave`) só entra na página de criação; na edição ele preenchia campos ausentes com dados de outro personagem.
- **Decisões de balanceamento ainda abertas com o dono** (regra única de nº de d20 por atributo, papel do AP, tetos de bônus, roguelite sem teto,
  raças/classes): não implemente sem resposta.

## Limite de MP por turno

`⌈(Nível + Foco) ÷ 2⌉ + Nível de ORM` (+ bônus em `mpLimit` da ficha), em `utils/mpLimit.ts`.
Janela: do início do turno do personagem ao início do próximo (reações contam); recuperar MP não
devolve limite; ao exceder, a conjuração é bloqueada e o mestre pode liberar. Não vale no Roguelite
nem em sistemas customizados.

## Design system

Fonte única de cor, tipografia, espaço, raio, sombra e movimento: `themes/tokens.ts`. O tema do MUI
(`themes/theme.ts`) e os mapas de domínio em `@constants` (`elementColor`, `spellElementColor`, `rarityColor`)
são gerados dele. O arquivo `themes/mui.d.ts` só declara as camadas extras de `palette.background`
(`raised`, `overlay`); não o chame de `theme.d.ts` (o TypeScript ignora um `.d.ts` com o mesmo nome de um `.ts`).

Decisões dadas pelo dono do projeto:

- **Só tema escuro** (sem alternância). **Âmbar** é a única cor de ação; ciano só para mana e informação;
  `secondary` é neutro. Elementos e raridades são marcas (ponto, glifo, filete), não fundo cheio de cartão.
- **Fontes "tech-arcano"**: Chakra Petch nos títulos (`font.display`, h1 a h4 do tema), IBM Plex Sans no texto
  (`font.text`) e IBM Plex Mono nos números (`font.mono`), carregadas de `public/fonts/fonts.css`. As **fontes dos
  dados** (`font.dice`, `diceFont(lados)`, `public/fonts/rpg`) são para resultados de rolagem; cada uma é de
  símbolos (um caractere vira um glifo), então só mostram um dado que cabe em um glifo (d4 a d10 e d12 até 10);
  total, somas e d20 ficam na mono.
- **Fontes só com licença comprovada** para uso comercial: ao adicionar uma, registre-a em
  `public/fonts/LICENSES.md` (o teste `themes/__tests__/fonts.test.ts` confere). Já removidas por falta de
  licença: Sakana, WBZ, Apocalypse, Robus, Dark Future, Future Millennium, Ysgarth, A Goblin Appears e os
  símbolos WoD (`magics*.ttf`). As fontes dos dados (dPoly) ainda precisam de confirmação da licença.
- **Sem arte gerada por IA nem imagem hospedada fora do projeto.** A landing (`app/page.tsx`, componentes em
  `components/landing`) mostra o produto: ficha de exemplo com um cartão de magia real (Brasa Voraz), barras de LP/MP/AP
  e uma rolagem com as fontes dos dados; as capas do Livro de Regras e do Grimório são SVG (`BookCover`). O logo é
  `components/misc/LogoMark.tsx` (a marca vetorizada do PNG original, traço em `currentColor` e pontas em `cyan`;
  `public/icons/magitech_logo.svg` é a versão estática).
- Componente novo usa tokens ou o tema, nunca hex/rgba solto, gradiente, brilho colorido ou animação infinita.
  `sx={{ borderRadius: 1 | 2 | 3 }}` = 4 | 8 | 12px (`shape.borderRadius` do tema vale 4). Cartão é superfície plana
  (`background.raised`, borda `divider` de 1px) e no hover só a borda muda (`color.borderStrong`); sombra só em menu,
  drawer e modal (o tema já faz: elevação ≥ 7). A regra `no-restricted-syntax` do ESLint avisa de cor solta,
  gradiente, brilho, hover que levita, animação infinita, vidro e ícones de faíscas.
- **Elemento é marca, não preenchimento**: use `<ElementIcon element={...} colored />` (`components/misc/ElementIcon.tsx`,
  13 glifos SVG) em vez de ícones do Material por elemento. O ícone de faíscas (`AutoAwesome`, `AutoFixHigh`, `Stars`,
  `Flare`) e emoji não entram: magias em geral usam `AutoStories`, vantagens `Star`; planos usam `PlanIcon`
  (`components/subscription`) e as cores de plano vêm dos tokens.
- Contraste: texto ≥ 4,5:1 e marcas ≥ 3:1 sobre as superfícies que citam (`themes/__tests__/tokens.test.ts`
  falha se um token novo ou alterado não passar).

Plano em fases: 1 tokens e tema (feita) · 3 tipografia (fontes carregadas, fontes sem licença removidas e
`fontFamily` migrado; faltam as rolagens com a fonte dos dados e o `html font-size: 12px`) · 4 efeitos (feita) ·
5 landing (feita: arte de IA e assets de 20 MB removidos, logo em SVG) · 6 cores soltas (feita) · 7 cores do Material
(feita: nenhum arquivo importa `@mui/material/colors` e a regra do ESLint avisa de `white` e `black` fixos; cores
de classe vêm de `classMark` em `themes/tokens.ts`, e categorias sem mapa próprio usam as cores de papel do tema) ·
depois: rolagens com a fonte dos dados, `html font-size`, licença das fontes dPoly.

Pares de "modo claro" (`blue[100]` com `blue[800]`) não existem mais: tinta translúcida do papel (`alpha(papel, 0.14)`)
com o texto no papel. Texto em `error.main` ou `warning.main` sobre `background.overlay` ou sobre fundo tingido passa a
usar `.light` (o `.main` fica em cerca de 4,2:1 ali); ícones e barras usam `.main`.

## Ambiente de desenvolvimento

Não rode `next dev` com as credenciais reais do Firebase: o layout chama `startJobs()` e isso grava o registro do job
no Firestore de produção. Para ver telas localmente, suba com credenciais descartáveis (`NEXT_PUBLIC_FIREBASE_PROJECT_ID`,
`FIREBASE_CLIENT_EMAIL` e `FIREBASE_PRIVATE_KEY` falsos, com uma chave RSA gerada na hora).

Testes: o jest resolve os aliases do tsconfig (`@components`, `@themes`, `@constants`...) pelo `moduleNameMapper` de
`jest.config.js`, e componentes de teste em `.tsx` renderizam no servidor com `react-dom/server`.
