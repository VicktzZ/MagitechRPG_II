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
