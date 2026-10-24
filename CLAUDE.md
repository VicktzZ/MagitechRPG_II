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
  **Primeira entrada de jogador**: quem ainda não está em `campaign.players` escolhe a ficha no modal do `CampaignProvider` (ou cria,
  no Roguelite), e é o `POST /api/session/connect` que o registra em `players`. O provedor expõe a escolha em
  `selectedCharsheetId` e `resolveViewerCharsheetId` (`utils/campaignViewer.ts`) decide a ficha de quem vê (registrada, depois escolhida,
  depois uma do usuário entre as da campanha). Sem a escolhida o navegador mandava `charsheetId: ""` e o servidor recusava (400): o jogador
  via "Não foi possível registrar sua entrada na sessão" e ficava sem painel (regressão do PR #86). **Teste a entrada com um usuário que
  ainda não está na campanha**, não só com quem já joga ou com o mestre.
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
  perícia ≤ 10, e no sistema padrão classe, raça e linhagem/profissão preenchidas; sistema customizado pode desligar esses campos). `edit` não bloqueia pontos sobrando (o level-up concede na hora) e os tetos só barram quem AUMENTA. O resolver
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
- **Abrir uma ficha salva não pode gravar nada**: efeito de montagem que recalcula valor derivado (`overall`, `mods.attributes`, `stats`) só escreve
  na criação; em ficha salva só depois de o usuário mexer no atributo (`useOverallSync` em `Attributes.tsx`, `isSavedSheet` em `Attribute.tsx`).
  Como o salvar compara com a ficha carregada, escrita automática no mount apareceria como alteração do jogador.
- `useCharsheetSystem` guarda em cache só o sistema carregado com sucesso; falha (rede, 404) não vale até recarregar a página.
- O rascunho da criação (`create-charsheet-autosave`) só entra na página de criação; na edição ele preenchia campos ausentes com dados de outro personagem.
- **Decisões de balanceamento ainda abertas com o dono** (regra única de nº de d20 por atributo, papel do AP, tetos de bônus, roguelite sem teto,
  raças/classes): não implemente sem resposta.

## Magias: estágios desbloqueados

Regra dada pelo dono: toda magia começa no estágio 1; o jogador **evolui** a magia (botão "Evoluir" no cartão, gastando pontos de evolução) e libera o próximo
estágio, em ordem; o mestre também ajusta (aba de magias do detalhe da ficha, em edição). Estágio acima do liberado fica com cadeado, sem o texto
do efeito, e não pode ser conjurado. O MP extra por estágio ao conjurar (`calculateExtraManaCost`) continua valendo.
**Não existe "estágio ativo"** (decisão do dono): quem evoluiu a magia conjura o estágio liberado **ou qualquer um dos anteriores**, escolhendo na hora de conjurar
(cada estágio liberado tem o próprio botão "Conjurar", com o custo de MP dele); nada a trocar nem a gravar.

- Um campo da ficha, por id da magia (nome, se não tiver id): `spellUnlocked[chave]`, o estágio **liberado** até agora. Lógica pura em `utils/spellStages.ts` (`getStageProgress`).
  `spellStages[chave]` é **legado** (era o "estágio ativo"): a tela não grava mais esse campo (só o remove junto da magia) e ele só vale como estágio liberado em **ficha antiga
  sem `spellUnlocked`**, para ninguém perder o estágio 3 que já conjurava. Não há mais `materializeUnlocked`: como o legado nunca muda, não precisa ser copiado.
- O cartão da ficha (`Magic.tsx`) abre no estágio liberado mais novo; os botões de estágio dele só **mostram** o texto e o custo daquele estágio (estado de tela, não grava).
- **Evoluir custa pontos de evolução, e o custo depende do nível da magia** (`stageRule`, `utils/spellStages.ts`): nível 1 e 2 = **1 ponto** por estágio; nível 3 = **2 pontos** por estágio;
  nível 4 = **3 pontos** para o estágio 2, e o 3º estágio é a **Maestria**: abre **sozinha, sem gastar ponto,** para quem tem maestria no elemento da magia (`elementalMastery`, comparação sem
  caixa nem acento: `sameElement`) **depois de liberar o estágio 2**; sem a maestria ela não se compra. Nível 4 de elemento **secundário** não tem esse atalho: o estágio 3 também custa
  **3 pontos**. O custo vem **explícito** ao jogador (texto "Custa 2 pontos de evolução" no estágio bloqueado e no botão "Evoluir (2 pontos)", mais "Faltam N pontos" quando não dá).
  `getSpellProgress(spell, sheet, { enabled, legacy })` é o que as telas chamam (envolve `getStageProgress` e devolve `nextCost`, `needsMastery`, `purchased` e `stages[]`); a maestria é **derivada**
  (se a maestria da ficha mudar, a Maestria volta a bloquear) e **não é gravada**: `spellUnlocked` guarda só o liberado por pontos (`purchased`; é o que `materializeUnlocked` grava).
  O ajuste da regra (se o dono mudar o custo) fica todo em `stageRule`. Novo atributo `points.evolution` (inteiro ≥ 0; ficha antiga não tem o campo e vale 0). O **mestre concede**: no cartão do
  jogador na campanha (menu "Conceder ponto de evolução", +1) ou no detalhe da ficha, em edição ("Evolução (magias)"). Sem pontos suficientes, o botão Evoluir fica
  desabilitado. O ajuste direto do estágio liberado pelo mestre (aba de magias do detalhe) não gasta ponto. Na página da ficha o formulário é uma foto:
  a concessão de fora entra somada ao que o jogador já gastou ali (`mergeRemoteCounter`, `utils/counterSync.ts`, no `CharsheetFormProvider`), senão salvar
  o valor velho desfaria o ponto concedido.
- **Estágios aninhados** (`components/spells/StageLadder.tsx`, usado na seção de Magias do jogador e na aba de magias do mestre): todos os estágios da magia em escada vertical; os **liberados ficam
  abertos por padrão** (cada um recolhe; "Recolher/Expandir estágios") com o que mudou em relação ao anterior **destacado** (`utils/textDiff.ts`, diferença por palavra; texto reescrito
  não é destacado), custo total de MP e a diferença (`9 MP (+2)`); **cada estágio liberado tem o próprio "Conjurar"** (MP e limite de MP por turno são conferidos por estágio, com o custo dele); os bloqueados mostram o custo e, só o próximo, o botão Evoluir. O custo do
  estágio 3 do nível 4 usa o extra da Maestria (`calculateTotalManaCost`; o `SpellStage` antigo da campanha dava NaN aí).
- **Aba de magias do mestre** (`SpellsTab` + `spells/SpellsOverview`, `spells/SpellCard`): resumo (magias, por nível, custo médio de MP base, maestria, estágios liberados, pontos de evolução, elementos
  com o selo secundário), busca/filtros de elemento e nível (a partir de 4 magias, `utils/spellsOverview.ts`, `utils/searchText.ts`: sem acento nem caixa) e um cartão por magia (até 3 magias abrem já
  expandidas). Em edição o mestre ajusta o estágio liberado por botões (não gasta ponto) e exclui a magia **pela chave** (a tabela antiga excluía pelo índice, que não batia quando a ficha mistura ids e
  objetos).
- **O modal de magias também bloqueia**: magia que a ficha ainda não tem aparece com o estágio 1 liberado e os outros com cadeado; magia que a ficha tem
  mostra o liberado dela (`MagicsModal.tsx`, cartão enxuto de `Magic.tsx`).
- **Pontos de evolução por nível**: ao subir de nível a ficha ganha **3 pontos de evolução a cada nível múltiplo de 5** atingido (5, 10, 15, 20; saltos de vários
  níveis contam cada múltiplo do caminho: `evolutionPointsForLevelUp`, `utils/evolutionPoints.ts`), na rota `POST /api/charsheet/[id]/update/level` (caminho do Magitech padrão, só
  para quem usa a regra de estágios: `usesStageUnlock`). A notificação de nível lista os pontos.
- **Elementos secundários**: Sangue, Vácuo, Psíquico, Radiação e Explosão (`SECONDARY_ELEMENTS`, `constants/secondaryElements.ts`; `specialElements` é a mesma lista com o nome antigo
  dos filtros). `isSecondaryElement` (`utils/elements.ts`, ignora caixa e acento) alimenta o selo "Secundário" nos cartões de magia, a observação "secundário" nos filtros de elemento
  (`filterOptionHint` do `ResourceListModal`), o aviso do modal de maestria elemental e o título da seção do grimório em PDF.
- **Não vale** em sistema customizado (`systemId`), no Roguelite (`campaign.mode`) nem na ficha de classe "Sem Classe": lá todos os estágios ficam
  abertos como sempre (`usesStageUnlock`). Excluir a magia remove as duas chaves (`withoutSpell`).
- Onde aparece: cartão da ficha (`subcomponents/Magic.tsx`, `Magics.tsx`), tela do jogador na campanha (`SpellsSection.tsx`, que também recusa
  conjurar estágio bloqueado) e detalhe da ficha do mestre (`SpellsTab.tsx`, `charsheetEdit.ts`).

## Campanha do mestre: janelas e barra do grupo

O mestre gerencia fichas e criaturas em **janelas flutuantes** (estilo BG3), em `components/campaign/gmDashboard/windows/`. Escopo combinado com o dono:
uma janela **por seção** da ficha de um jogador; entrada pela **barra do grupo** (um retrato por jogador) e pelos cartões; conteúdo = as abas atuais
do mestre (fase 1), a visão do jogador fica para a fase 2. **Criaturas também entram no escopo** (decisão do dono): a criatura ganha janelas pelo mesmo
gerenciador. Fases/PRs: 1 gerenciador + barra + resumo (feita) · 2 (feita) seções em janelas (atributos, perícias, inventário, habilidades, magias) + ações do jogador
(item, ponto de evolução, notificação, remover), tirando o `CharsheetDetailsModal` · 3 (feita) dano/cura rápidos de LP/MP/AP por rota com transação (soma/subtrai,
0 a máx., sem contar no limite de MP por turno) · 4 (feita, só perícias) rolagem do mestre pelo jogador (**regra do botão da perícia na ficha**: `mod + 1` d20, mod negativo rola 2;
não unifica as regras) · 5 (feita) anotações privadas por ficha em `campaigns/{id}/gmNotes/{fichaId}` com regra do Firestore só para `campaign.admin` (regra publicada
antes do código) · 6 (feita) criaturas em janelas: a criatura personalizada (`creature`) e a criatura em combate (`combatant`), com o alvo da janela generalizado (`targetId`) ·
7 (feita) dano/cura rápidos de LP/MP da criatura em combate, por rota com transação.
**Ainda em aberto nas criaturas** (perguntar ao dono antes): levar o **editor de criatura** (`CreatureCreator`, ainda um diálogo) para dentro de uma janela, e registrar o ajuste rápido no
log do combate (hoje só o diálogo de combate narra dano e cura). A ordem das fases pode mudar a pedido do dono.

- **Peças**: `windowState.ts` (reducer puro: abrir/focar/fechar/recolher/gravar posição, `sanitizeWindows` para o que vem do navegador), `windowGeometry.ts`
  (puro: área, clamp, cascata, mover, redimensionar), `windowKinds.ts` (tipos de janela, tamanhos, limite de 10), `GMWindowProvider` (estado, área útil,
  persistência), `FloatingWindow` (casca: arrastar, redimensionar, recolher, teclado), `GMWindowLayer` (portal no `body`; escolhe o conteúdo por tipo),
  `PartyBar`/`PartyPortrait` (retratos, com o menu de seções em `SectionMenu`), `SummaryWindow`/`SummaryView` (resumo, atalhos de seção e ações do jogador),
  `SectionWindows` + `EditableSection` (as seções editáveis), `creature/` (janelas de criatura) e `windowTargets.ts` (alvos que existem agora e nome do alvo para o título).
  Provider montado em `CampaignComponent` só para o mestre.
- **Tipos de janela** (`WINDOW_KINDS` = `SHEET_WINDOW_KINDS` + `CREATURE_WINDOW_KINDS`): das fichas, `summary` (só leitura) e as ex-abas do modal de detalhes, que não existe mais: `info`, `attributes`, `expertises`,
  `inventory`, `skills`, `spells`, mais `notes` (anotações privadas do mestre, não é aba antiga); das criaturas, `creature` e `combatant`. O menu de seções e os atalhos do resumo
  usam só `SHEET_WINDOW_KINDS`. Os componentes das abas continuam em `modals/charsheetDetails/` e são reaproveitados; `ChangePlayerStatusModal` segue
  como diálogo aberto pela janela de informações. Para um tipo novo: `windowKinds.ts` (nome, rótulo, tamanho) + `GMWindowLayer` (conteúdo).
- **Alvo da janela**: `WindowEntry.targetId` (era `charsheetId`) é o id do que a janela mostra, e `windowTargetOf(kind)` diz o que ele identifica: `sheet` (id da ficha), `creature` (id da criatura
  personalizada, `campaign.custom.creatures[].id`) ou `combatant` (id do combatente em `session.combat.combatants`). A chave da janela é `tipo:alvo`, então o mesmo id em tipos diferentes não colide.
  O que o navegador guardou antes (`charsheetId`) ainda é lido por `sanitizeWindows`. `keepTargets` fecha as janelas cujo alvo saiu, **por tipo de alvo e só para os tipos que vieram na lista**: ficha
  vazia significa "ainda carregando" (não poda), mas criatura e combatente vêm da própria campanha, então lista vazia vale (criatura excluída fecha a janela; combate encerrado fecha as de combatente).
- **Criaturas em janelas** (`windows/creature/`): `creature` é a ficha da criatura personalizada, só leitura (`CreatureView` sobre `toCreatureCard`, que lê o formato real: o editor grava magia como
  `{ description, cost }` e não como o catálogo `{ stages, mpCost }`), com Editar (abre o `CreatureCreator`, que continua um diálogo; a criatura em edição é uma **cópia fixada no clique**, porque o editor
  reinicia o formulário quando recebe outro objeto e a campanha chega de novo a cada mudança) e Excluir (`useCreatureDelete`, com confirmação; a rota já grava, **não regrave `custom` pelo cliente**).
  `combatant` é a criatura no combate agora (`CombatantView`): turno, LP/MP do **combatente** (é onde o combate guarda o que mudou, não a criatura base), dano e cura rápidos e as perícias, rolando pela **regra da criatura**
  (`⌊atributo/5⌋` d20, `useCreatureExpertiseRoll`; não unifica as regras de d20). O combatente é ligado à criatura por `findBaseCreature` (`dashboard/combatCreatureLookup.ts`: o id do combatente é o da criatura,
  com sufixo `-n` quando há cópias). Entradas: grupo "Em combate" na `PartyBar` (só criaturas com criatura de origem, como a seção do dashboard), botão "Abrir em janela" no cartão de combate e "Ver detalhes" no cartão da
  criatura personalizada (que não abre mais o diálogo somente leitura).
- **Dano e cura rápidos da criatura em combate** (`VitalsPanel` na janela `combatant`, o mesmo painel do resumo): o cliente manda só a variação
  (`campaignService.adjustCombatantVitals(campaignId, combatantId, { lp: -7 })` → `POST /api/campaign/[id]/combat/vitals`, só o mestre; só `lp` e `mp`, a criatura em combate não tem armadura) e o servidor
  soma numa transação (`adjustCombatantVitals`, `utils/firestore/combatantStats.ts`), com a regra pura de `applyCombatantDeltas` (`utils/combatantVitals.ts`, a mesma de `applyVitalDelta`). **Nunca mande o valor final.** O
  Firestore não altera um item de lista por caminho, então grava `session.combat.combatants` inteiro, mas só o combatente alvo muda (rodada, turno, log e o resto da campanha saem como estavam).
  `combatantVitals(combatant, criatura)` é a conta única de "vida e mana do combatente" (tela e servidor): o que o combatente guarda, e o que ele ainda não guarda (criatura que entrou no meio do combate não leva mana)
  vem da criatura de origem (`findBaseCreature`, agora em `utils/combatCreatureLookup.ts`); ao ajustar, grava atual e máximo no combatente. Jogador em combate é recusado (400): a vida dele é da ficha
  (`adjustCharsheetStats`). **Não registra no log do combate** (é bookkeeping do mestre, como o ajuste dos jogadores); a rota `combat` (`apply_damage`/`apply_heal`), que narra, reescreve a campanha inteira e
  continua sendo o caminho do diálogo de combate. Teste do servidor: `utils/firestore/__tests__/combatantStats.emulator.test.ts`.
- **Entrar no meio do combate** (`POST /api/campaign/[id]/combat`, ação `add_combatants`, só o mestre; `add_creature`, a entrada antiga, passa pelo mesmo caminho): o corpo é `join: { players: [{ charsheetId, avatar? }], creatures: [{ id, quantity? }] }`
  e **o servidor lê os dados da ficha e da criatura da campanha** (nome, vida, mana, DES, dono), não do cliente; a ficha tem de estar em `campaign.players` e não pode já estar no combate (vira aviso em `warnings`; se nada entra, 400 com o motivo).
  Cada cópia de criatura ganha id `<criatura>-<n>` (menor n livre; é o que `findBaseCreature` entende) e a primeira leva o nome puro, as seguintes "Nome (n)" (`nextCreatureInstance`, `utils/combat/addCombatants.ts`).
  **Na fase de iniciativa** entra pendente, no fim da lista, e rola como os outros (`set_initiative` espera todos). **Na fase de ação** a iniciativa é rolada na hora (mesma regra de `roll_initiative`, agora em
  `utils/combat/initiativeRoll.ts`: jogador = mod do atributo da Agilidade, criatura = ⌊atributo/5⌋ d20) e entra no lugar dela na ordem (`insertCombatant`: maior iniciativa, desempate por DES); se esse lugar já passou
  neste round, age **logo depois de quem está agindo**, que não muda (`currentTurnIndex` fica). Cada round re-rola a iniciativa, então a posição só vale para o round atual. Quantidade 1 a 99 inteira (número, não texto), até 20 jogadores
  e 20 criaturas por chamada. Tela: botão **"Adicionar ao combate"** no diálogo de combate em andamento (`CombatDialog` → `combat/AddCombatantsPanel`, `combat/ParticipantPicker` é a mesma lista do início do combate, que
  mostra quem já está nele desabilitado). **Remover combatente** (`remove_combatant`) existe na rota mas não tem tela, e ele não ajusta `currentTurnIndex` quando sai alguém antes do turno atual: ao ligar, corrija isso.
- **Perícias pesquisáveis e ordenáveis** (`utils/expertiseList.ts`, `components/campaign/ExpertiseListControls.tsx`): toda lista de perícias da campanha tem **busca por nome** (sem acento nem caixa:
  `utils/searchText.ts`) e **ordem**, com **A → Z de início** e as opções Z → A, maior valor e menor valor (empate pelo nome). `filterAndSortExpertises` é a regra única e `useExpertiseListState` guarda busca
  e ordem. Está na janela da criatura em combate (`CombatantView`), no cartão da criatura em combate do dashboard (`CombatCreatureCard`), na janela de perícias do mestre (`ExpertisesTab`; ordena pelo valor
  **salvo**, não pelo que se digita em edição, senão a linha pularia a cada tecla) e na seção de perícias do jogador (`ExpertiseSection`, que já tinha filtro por nível e ordem e ganhou a busca; só pelo nome).
- **Cada seção edita sozinha**: `EditableSection` tem o próprio `useCharsheetEditing` (Editar/Cancelar/Salvar). Salvar grava só os caminhos que o mestre
  mexeu naquela janela (`collectCharsheetChanges` contra o snapshot do início), então duas seções da mesma ficha em edição, ou o jogador mexendo ao mesmo tempo,
  não se desfazem. O corpo da janela é um container: as grades `md={6}` das abas viram uma coluna abaixo de 600px de largura útil (o Grid do MUI olha a tela, não a janela).
- **Ações do jogador** (`usePlayerActions`, compartilhado pelo cartão e pelo resumo): adicionar item, conceder ponto de evolução, notificar e remover; o hook
  devolve os diálogos em `dialogs`, que quem usa precisa renderizar. A notificação vai por `POST /api/notification/[userId]` (`notificationService.create(body,
  { param: userId })`); sem o `userId` na URL o servidor responde 405 (era assim no cartão e o envio não funcionava).
- **Dano e cura rápidos** (`VitalsPanel`, no resumo): o mestre digita um valor (inteiro de 1 a 9999, um por janela) e usa − ou + em LP, MP e AP. O cliente manda só a
  variação (`charsheetService.adjustStats(id, { lp: -7 })` → `POST /api/charsheet/[id]/stats`) e o servidor soma numa transação (`adjustCharsheetStats`,
  `utils/firestore/charsheetStats.ts`), então cliques seguidos e o jogador mexendo ao mesmo tempo não se perdem; **nunca mande o valor final** (sobrescreveria o
  que mudou de fora). Regra pura em `utils/vitals.ts` (`applyVitalDelta`): dano para em zero, cura para no máximo, e quem está acima do máximo (pontos dados pelo
  mestre) não perde nada ao ser curado. Grava só `stats.<lp|mp|ap>`; o MP gasto no turno (limite de MP por turno) não conta. A barra muda sozinha pelo listener
  da campanha. Teste do servidor: `utils/firestore/__tests__/charsheetStats.emulator.test.ts`.
- **Rolagem do mestre pelo jogador** (janela de Perícias, coluna "Rolar"): `utils/sheetRoll.ts` é a regra do **botão da perícia na ficha** (`planSheetRoll`: `mod + 1` d20 e vale
  o maior; mod negativo rola 2 e vale o menor, "desvantagem"; sistema customizado: `1 + dados extras` e bônus da influência do atributo, e sem o sistema carregado não rola) mais a
  perícia. Resultado no chat em nome do mestre, no formato do chat (`🎲 [Aria Valen] ATLETISMO - 2d20+3: [12, 7: 12] = 15`), por uma `Message` pronta (`useGMExpertiseRoll`): mandar o
  texto cru faria o chat tentar rolar a notação que está nele. **São três regras de d20 hoje** (ficha, teste do mestre e perícia na tela da campanha do jogador, que usa o mod com mínimo 1);
  a regra única é decisão pendente do dono, e **atributo não rola** (a ficha não rola atributo, então não há regra): não invente uma sem resposta.
- **Anotações privadas do mestre** (janela "Anotações", `NotesWindow`/`NotesView`): um documento por ficha em `campaigns/{id}/gmNotes/{fichaId}` com `{ text, updatedBy, updatedAt }`.
  Mora numa subcoleção porque qualquer usuário logado lê campanha e ficha pelo id: a regra do Firestore só deixa ler quem está em `campaign.admin` (ou o admin do site) e **ninguém
  escreve pelo cliente**. Escrita só por `PUT /api/campaign/[id]/gm-notes/[fichaId]` (`requireCampaignGM`, ficha tem de jogar na campanha, corpo `{ text }` com até 20 000
  caracteres; `saveGmNote` em `utils/firestore/gmNotes.ts`; **texto vazio apaga o documento**). O navegador lê em tempo real (`hooks/useGmNote.ts`). Salvamento automático
  1 s depois de parar de digitar, ao fechar a janela e no `pagehide` (fetch com `keepalive`); a lógica de rascunho contra salvo é pura em `utils/gmNoteDraft.ts` (rascunho `null` = a
  tela segue o salvo, então mudança feita em outra aba aparece). O campo fica **travado enquanto carrega e se a leitura falhar**, para não gravar por cima de algo que não chegou.
  O servidor apaga a subcoleção ao excluir a campanha (`deleteGmNotes`). Conferido no Firestore de verdade: `tests/firestore-rules` (10 casos das regras) e
  `utils/firestore/__tests__/gmNotes.emulator.test.ts`. Regra publicada em produção em 24/10/2026 (conjunto novo 0285d09e; o anterior era 4ba5468a, para reverter se preciso).
- **Chat**: `SessionChat` rola a própria lista (`chatBoxRef`, a `MessageList` é quem tem o scroll; o marcador `messagesEndRef` fica fora dela e não serve para isso). Mensagem do próprio usuário,
  inclusive rolagem feita fora do chat, sempre vem à vista, mesmo com o histórico rolado para cima.
- **Dois contextos de propósito**: ações (estáveis; cartões e barra só abrem janelas) e estado. Sem provider, as ações são no-ops (testes).
- **Arrastar não passa pelo estado**: enquanto arrasta, a posição fica local na `FloatingWindow` e vai ao reducer ao soltar. Posição guardada pode estar
  fora da área (janela menor, chat aberto): a tela mostra clampada e não altera o guardado.
- **Área das janelas**: começa depois da barra do grupo (`WINDOW_AREA_LEFT`, depende do preenchimento de `app/app/layout.tsx` + `CampaignShell`; mudou um,
  atualize `layout.ts`) e termina antes do chat encaixado e aberto. Camada `zIndex` 1100+, abaixo do dock (1200), do chat e dos modais (1300); no celular
  a janela da frente ocupa a tela toda (1250) e a barra do grupo some (abre-se pelo menu do cartão: "Abrir resumo em janela").
- **Persistência**: `localStorage` `gm-windows:{campaignId}` (lista de janelas); lido depois da montagem, JSON inválido é ignorado, janelas cujo alvo saiu da campanha
  fecham (`keepTargets`, ver "Alvo da janela").
- **Teclado**: barra de título focável (setas movem 16px, Shift 64, Alt+setas redimensionam, Enter recolhe); Esc fecha, menos de dentro de campo/menu.
- Teste de componente que importa `useCharsheetPointsView` precisa de `jest.mock` dele: o hook de sistema customizado puxa `@contexts`, e o ts-jest
  barra um erro de tipo antigo em `contexts/charsheetContext.ts`.

## Campanha: inventário do jogador

`components/campaign/playerDashboard/InventorySection.tsx` (composição) + `inventory/`. Regras da tela:

- **Resumo** (`InventorySummary`): peso carregado contra `capacity.max` com o **estado por extenso** (Dentro da capacidade / Perto do limite, acima de 80% / Sobrecarga, acima de 100%; `capacityState`), medidor
  `role="meter"`, contagem por tipo e a soma dos AP das armaduras. Perto do limite ou em sobrecarga mostra "Para aliviar:" com os 3 itens mais pesados. Capacidade 0 (ficha sem limite) nunca avisa.
- **Item do tipo Capacidade** (mochila) **soma à capacidade máxima e não conta como peso carregado** (`entryWeight`): é o que a doação e a remoção já faziam (mexem em `capacity.max`, não na carga); a tela antiga somava o peso dele.
- **Lista** (`utils` puras em `inventoryList.ts`): `collectEntries` junta armas, armaduras e itens. **Só some o mesmo item gravado duas vezes (mesmo `id`)**; dois itens com o mesmo nome e ids diferentes aparecem os dois (a tela antiga
  escondia o segundo). Filtro por tipo (com contagem), busca sem acento nem caixa por nome, tipo do item e raridade, e ordem (por tipo, nome A → Z, mais pesados, mais raros; empate pelo nome). Estado vazio com "Limpar busca e filtros".
- **Cartão** (`InventoryItemCard`): superfície plana (`background.raised`, borda `divider`), **filete lateral de 3px na cor do tipo** (arma `danger`, armadura `ap`, item `success`; `getItemTypeConfig`, ícones `Gavel`/`Shield`/`Inventory2` como em
  `itemAttributes`), raridade como ponto + nome (não como bloco colorido), número principal em mono (dano, +AP, xN) e peso. Não usa mais o Accordion do MUI: o botão que abre é irmão das ações, para não aninhar botão em botão.
  **Arma mostra Acerto e Dano à vista na linha** (sem abrir); aberta, mostra também o Crítico. Detalhes e descrição só ao abrir.
- **Remover pede confirmação** (`ConfirmRemoveDialog`; antes apagava no clique). A gravação é `buildRemovalUpdate` (`inventoryRemoval.ts`, compartilhada com a doação): tira o item **pelo id** (sem id, só aquele item, não todos os sem id),
  armadura devolve os AP (atual e máximo, nunca abaixo da base 5), item de Capacidade diminui `capacity.max` e não mexe na carga, o resto diminui `capacity.cargo` pelo peso x quantidade (nunca negativo).

## Limite de MP por turno e Overall

`⌈(Nível + Foco) ÷ 2⌉ + Nível de ORM` (+ bônus em `mpLimit` da ficha), em `utils/mpLimit.ts`.
Janela: do início do turno do personagem ao início do próximo (reações contam); recuperar MP não
devolve limite; ao exceder, a conjuração é bloqueada e o mestre pode liberar. Não vale no Roguelite
nem em sistemas customizados.

O mestre vê o **Overall** (o `overall` guardado na ficha, o mesmo da tela do jogador) e o limite no resumo, no cartão do jogador e na aba Informações
(`SheetMetricsView`, `getSheetMetrics` em `utils/charsheetMetrics.ts`). Onde a regra não vale o limite some e o Overall fica; em combate ativo o limite
aparece como gasto/limite (`mpSpentThisTurn` do combatente).

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
