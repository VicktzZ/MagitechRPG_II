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
- **Fontes "tech-arcano"**: Chakra Petch nos títulos (`font.display`), IBM Plex Sans no texto (`font.text`)
  e IBM Plex Mono nos números (`font.mono`). As **fontes dos dados** (`font.dice`, `diceFont(lados)`,
  arquivos em `public/fonts/rpg`) são para resultados de rolagem.
- Substituir as artes geradas por IA (hero da landing em cdn.leonardo.ai, fundos em parallax).
- Componente novo usa tokens ou o tema, nunca hex/rgba solto, gradiente, brilho colorido ou animação infinita.
  `sx={{ borderRadius: 1 | 2 | 3 }}` = 4 | 8 | 12px (`shape.borderRadius` do tema vale 4).
- Contraste: texto ≥ 4,5:1 e marcas ≥ 3:1 sobre as superfícies que citam (`themes/__tests__/tokens.test.ts`
  falha se um token novo ou alterado não passar).

Plano em fases: 1 tokens e tema (feita) · 3 tipografia (carregar as fontes com pesos reais, tirar a ponte
"Inter", migrar `fontFamily="Sakana"`, rolagens com a fonte dos dados) · 4 efeitos (remover gradientes,
brilhos, pulsos e vidro; regra de ESLint contra hex solto; `prefers-reduced-motion`) · depois as seções,
começando pela landing.
