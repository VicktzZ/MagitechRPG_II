/* eslint-disable max-len */
import type { SeedSpell } from './manaRecoverySpells'

/**
 * Lote de magias de REAÇÃO.
 *
 * Todas têm `execution: 'Reação'` e um gatilho claro. Foram desenhadas a partir das 13
 * reações que já existiam no catálogo (redução de dano, contra-ataque, voltar no tempo,
 * ilusão, troca de posição, interferência em magia), explorando gatilhos que ninguém usava:
 * inimigo ERRAR o ataque, ser agarrado/derrubado, aliado cair a 0 LP, um teste falhar,
 * receber crítico, copiar a magia do inimigo, dano diferido.
 *
 * Mesmas convenções do lote de recuperação de mana: elemento em MAIÚSCULAS, tipo
 * "Categoria (detalhe)", 3 estágios (no nível 4 o 3º é a Maestria), texto em "turnos"/
 * "combate", no máximo UMA expressão de dados por estágio (castSpell rola todas as achadas).
 */
export const REACTION_SPELLS: SeedSpell[] = [
    // ═══════════════════════════════════════════════════════════════════════
    // NÍVEL 1
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'seed-rx-casca-escorregadia',
        element: 'ÁGUA',
        name: 'Casca Escorregadia',
        level: 1,
        mpCost: 1,
        type: 'Defesa (imediato)',
        execution: 'Reação',
        range: 'Pessoal',
        stages: [
            'Quando uma criatura tentar agarrar, prender ou derrubar você, uma película de água cobre seu corpo: a tentativa falha automaticamente e você pode se deslocar até 1,5m.',
            'A tentativa falha automaticamente, você se desloca até 3m sem provocar reações e a criatura sofre -2 no próximo teste de ataque dela.',
            'Funciona também contra empurrões e efeitos mágicos de contenção (você passa automaticamente no teste de resistência). Você se desloca até 6m sem provocar reações e a criatura sofre -2 no próximo teste de ataque dela.'
        ]
    },
    {
        id: 'seed-rx-colchao-de-ar',
        element: 'AR',
        name: 'Colchão de Ar',
        level: 1,
        mpCost: 1,
        type: 'Utilidade (imediato)',
        execution: 'Reação',
        range: 'Pessoal',
        stages: [
            'Quando você cair, for arremessado ou empurrado contra uma superfície, um colchão de ar amortece o impacto: você sofre apenas metade do dano e permanece de pé.',
            'Você não sofre dano algum do impacto e pode se deslocar até 3m em qualquer direção ao pousar.',
            'Você não sofre dano algum e pode estender o colchão a um aliado a até 9m que esteja caindo ou sendo arremessado, que também não sofre dano. Você pode se deslocar até 3m ao pousar.'
        ]
    },
    {
        id: 'seed-rx-sombra-vingativa',
        element: 'TREVAS',
        name: 'Sombra Vingativa',
        level: 1,
        mpCost: 2,
        type: 'Ataque (imediato)',
        execution: 'Reação',
        range: 'Curto',
        stages: [
            'Quando um inimigo errar um ataque contra você, sua sombra se desprende e o golpeia de volta, causando 1d6 de dano de trevas. O alvo sofre -1 nos ataques até o início do próximo turno dele.',
            'A sombra causa 2d6 de dano de trevas e o alvo sofre -2 nos ataques até o início do próximo turno dele.',
            'A sombra causa 3d6 de dano de trevas, o alvo sofre -2 nos ataques e tem o deslocamento reduzido à metade até o início do próximo turno dele.'
        ]
    },
    {
        id: 'seed-rx-estaca-subita',
        element: 'TERRA',
        name: 'Estaca Súbita',
        level: 1,
        mpCost: 1,
        type: 'Controle (imediato)',
        execution: 'Reação',
        range: 'Curto',
        stages: [
            'Quando um inimigo entrar no alcance corpo a corpo de você ou de um aliado, uma estaca de pedra brota sob ele. O alvo faz um teste de Reflexos; se falhar, sofre 1d6 de dano perfurante e tem o deslocamento reduzido à metade até o fim do turno.',
            'A estaca causa 2d6 de dano perfurante. Se o alvo falhar no teste de Reflexos, tem o deslocamento reduzido a 0 até o fim do turno.',
            'A estaca causa 3d6 de dano perfurante. Se o alvo falhar no teste de Reflexos, fica com deslocamento 0 e é derrubado.'
        ]
    },
    {
        id: 'seed-rx-condutor-magnetico',
        element: 'ELETRICIDADE',
        name: 'Condutor Magnético',
        level: 1,
        mpCost: 1,
        type: 'Defesa (imediato)',
        execution: 'Reação',
        range: 'Pessoal',
        stages: [
            'Quando um ataque à distância feito com arma de fogo ou projétil metálico tiver você como alvo, um campo magnético desvia a trajetória: o ataque sofre -3 no teste de acerto.',
            'O ataque sofre -5 no teste de acerto e, se errar, o projétil fica preso ao campo e cai aos seus pés.',
            'O projétil é capturado no ar: o ataque erra automaticamente e o projétil é devolvido ao atacante, que sofre metade do dano que ele causaria.'
        ]
    },
    {
        id: 'seed-rx-fio-da-sorte',
        element: 'NÃO-ELEMENTAL',
        name: 'Fio da Sorte',
        level: 1,
        mpCost: 1,
        type: 'Mentalização (imediato)',
        execution: 'Reação',
        range: 'Curto',
        stages: [
            'Quando você ou um aliado em alcance falhar em um teste, você tece um fio de probabilidade a favor do alvo: some 1d4 ao resultado do teste. Só pode ser usada uma vez por turno.',
            'Some 1d6 ao resultado do teste. Só pode ser usada uma vez por turno.',
            'Some 1d8 ao resultado do teste e o beneficiário recebe +1 no próximo teste que fizer. Só pode ser usada uma vez por turno.'
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // NÍVEL 2
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'seed-rx-passo-guardiao',
        element: 'LUZ',
        name: 'Passo Guardião',
        level: 2,
        mpCost: 4,
        type: 'Movimento (imediato)',
        execution: 'Reação',
        range: 'Médio',
        stages: [
            'Quando um aliado em alcance for alvo de um ataque, você se desloca instantaneamente em um passo de luz até ele e se torna o alvo do ataque no lugar dele, recebendo +2 de AP temporário contra esse ataque.',
            'Você recebe +4 de AP temporário contra o ataque e o atacante fica ofuscado, sofrendo -2 no próximo ataque dele.',
            'Você recebe +6 de AP temporário contra o ataque, o atacante fica ofuscado (-2 nos ataques por 2 turnos) e o aliado resgatado pode se deslocar até 3m.'
        ]
    },
    {
        id: 'seed-rx-orvalho-purificador',
        element: 'ÁGUA',
        name: 'Orvalho Purificador',
        level: 2,
        mpCost: 4,
        type: 'Utilidade (imediato)',
        execution: 'Reação',
        range: 'Curto',
        stages: [
            'Quando você ou um aliado em alcance receber um Estado negativo, o orvalho o dissolve antes de fazer efeito: o Estado é removido se tiver duração de até 2 turnos.',
            'O Estado é removido independentemente da duração e o alvo recupera 1d6 de LP.',
            'O Estado é removido de todos os aliados em alcance que o tenham recebido e cada um ganha +2 em testes de resistência até o fim do próximo turno.'
        ]
    },
    {
        id: 'seed-rx-eco-do-golpe',
        element: 'ELETRICIDADE',
        name: 'Eco do Golpe',
        level: 2,
        mpCost: 4,
        type: 'Suporte (imediato)',
        execution: 'Reação',
        range: 'Médio',
        stages: [
            'Quando um aliado em alcance acertar um ataque, um arco elétrico ecoa o golpe e causa 1d6 de dano elétrico adicional ao alvo.',
            'O arco causa 2d6 de dano elétrico adicional ao alvo.',
            'O arco causa 3d6 de dano elétrico adicional ao alvo e salta para outro inimigo a até 3m dele, causando metade desse dano.'
        ]
    },
    {
        id: 'seed-rx-tremor-disruptivo',
        element: 'TERRA',
        name: 'Tremor Disruptivo',
        level: 2,
        mpCost: 4,
        type: 'Debuff (imediato)',
        execution: 'Reação',
        range: 'Médio',
        stages: [
            'Quando um inimigo em alcance declarar um ataque à distância ou conjurar uma magia, o chão treme sob ele: ele faz um teste de Reflexos e, se falhar, sofre -3 no teste de acerto ou na DT da magia.',
            'Se falhar no teste de Reflexos, o inimigo sofre -5 e perde o equilíbrio: seu deslocamento é reduzido à metade até o fim do turno.',
            'Se falhar no teste de Reflexos, o inimigo sofre -5 e é derrubado. Se passar no teste, ainda sofre -2.'
        ]
    },
    {
        id: 'seed-rx-cauterizacao-instantanea',
        element: 'FOGO',
        name: 'Cauterização Instantânea',
        level: 2,
        mpCost: 4,
        type: 'Cura (imediato)',
        execution: 'Reação',
        range: 'Curto',
        stages: [
            'Quando um aliado em alcance sofrer dano de um ataque, você cauteriza as feridas dele com uma chama precisa: o aliado recupera 2d6 de LP e sofre 2 de dano de fogo (ignora AP).',
            'O aliado recupera 3d6 de LP e sofre 2 de dano de fogo (ignora AP). Qualquer sangramento ou queimadura que ele tenha é removido.',
            'O aliado recupera 4d6 de LP e não sofre dano de fogo. Qualquer sangramento ou queimadura que ele tenha é removido.'
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // NÍVEL 3
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'seed-rx-couraca-adaptativa',
        element: 'TERRA',
        name: 'Couraça Adaptativa',
        level: 3,
        mpCost: 6,
        type: 'Defesa (imediato)',
        execution: 'Reação',
        range: 'Pessoal',
        stages: [
            'Quando você sofrer um acerto crítico, sua armadura de pedra se rearranja: o ataque é tratado como um acerto normal e você recebe +2 de AP temporário até o fim do combate (acumula até +4 no total).',
            'O ataque é tratado como um acerto normal e você recebe +3 de AP temporário até o fim do combate (acumula até +6 no total).',
            'O ataque é tratado como um acerto normal e você recebe +4 de AP temporário até o fim do combate (acumula até +8 no total). Estilhaços da couraça causam 1d6 de dano perfurante ao atacante.'
        ]
    },
    {
        id: 'seed-rx-decodificacao-reativa',
        element: 'PSÍQUICO',
        name: 'Decodificação Reativa',
        level: 3,
        mpCost: 6,
        type: 'Mentalização (imediato)',
        execution: 'Reação',
        range: 'Médio',
        stages: [
            'Quando um inimigo em alcance conjurar uma magia de nível 1 ou 2, você lê a sequência mágica dele em tempo real. Até o fim do seu próximo turno, você pode conjurar essa magia no estágio 1 pagando metade do custo (arredondado para cima).',
            'Funciona com magias de nível até 3 e você pode conjurar a magia copiada até o estágio 2, pagando metade do custo (arredondado para cima).',
            'Funciona com magias de nível até o seu nível de ORM e você pode conjurar a magia copiada em qualquer estágio, pagando metade do custo (arredondado para cima). O inimigo não pode ser alvo desta magia de novo por 3 turnos.'
        ]
    },
    {
        id: 'seed-rx-ultimo-suspiro',
        element: 'SANGUE',
        name: 'Último Suspiro',
        level: 3,
        mpCost: 6,
        type: 'Suporte (imediato)',
        execution: 'Reação',
        range: 'Curto',
        stages: [
            'Quando um aliado em alcance for reduzido a 0 LP, você sacrifica 15% do seu LP máximo (ignora AP) e o aliado permanece com 1 LP.',
            'Você sacrifica 10% do seu LP máximo (ignora AP). O aliado permanece com 1 LP e recebe +3 de AP temporário até o início do próximo turno dele.',
            'Você sacrifica 10% do seu LP máximo (ignora AP). O aliado permanece com 25% do LP máximo dele e sofre 50% menos dano até o início do próximo turno dele.'
        ]
    },
    {
        id: 'seed-rx-frequencia-dissonante',
        element: 'AR',
        name: 'Frequência Dissonante',
        level: 3,
        mpCost: 6,
        type: 'Controle (imediato)',
        execution: 'Reação',
        range: 'Médio',
        stages: [
            'Quando um inimigo em alcance declarar um ataque, uma onda sonora dissonante o confunde: ele faz um teste de Resistência Mental e, se falhar, redireciona o ataque contra a criatura mais próxima dele. Se não houver outra criatura, o ataque é perdido.',
            'Se falhar no teste, o ataque é redirecionado contra a criatura mais próxima do inimigo e ele sofre -2 em todos os testes até o fim do turno.',
            'Se falhar no teste, você escolhe a criatura que será o novo alvo do ataque (dentro do alcance da arma ou magia) e o inimigo sofre -2 em todos os testes até o fim do turno. Se passar no teste, ainda sofre -2 no ataque.'
        ]
    },
    {
        id: 'seed-rx-inversao-necrotica',
        element: 'TREVAS',
        name: 'Inversão Necrótica',
        level: 3,
        mpCost: 6,
        type: 'Debuff (imediato)',
        execution: 'Reação',
        range: 'Médio',
        stages: [
            'Quando um inimigo em alcance recuperar LP, a escuridão inverte parte da cura: ele recupera apenas metade do valor e sofre a outra metade como dano de trevas.',
            'A cura é totalmente anulada e metade do valor que ele recuperaria é aplicada como dano de trevas.',
            'A cura é totalmente anulada e o valor inteiro que ele recuperaria é aplicado como dano de trevas. O inimigo não pode recuperar LP até o início do próximo turno dele.'
        ]
    },
    {
        id: 'seed-rx-onda-de-interrupcao',
        element: 'EXPLOSÃO',
        name: 'Onda de Interrupção',
        level: 3,
        mpCost: 6,
        type: 'Ataque (imediato)',
        execution: 'Reação',
        range: 'Médio',
        stages: [
            'Quando um inimigo em alcance iniciar a conjuração de uma magia de execução Completa, você detona uma onda de choque que o desconcentra: ele sofre 2d6 de dano de explosão e faz um teste de Resistência Mental; se falhar, a magia é interrompida e o MP dela é perdido.',
            'A onda causa 3d6 de dano de explosão. Funciona também contra magias de execução Padrão. Se o inimigo falhar no teste, a magia é interrompida e o MP dela é perdido.',
            'A onda causa 4d6 de dano de explosão e atinge todos os inimigos a até 3m do conjurador. Quem falhar no teste interrompe a magia ou ação que estiver realizando.'
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // NÍVEL 4 (o 3º estágio é a Maestria)
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'seed-rx-recusa-derradeira',
        element: 'LUZ',
        name: 'Recusa Derradeira',
        level: 4,
        mpCost: 10,
        type: 'Defesa (imediato)',
        execution: 'Reação',
        range: 'Médio',
        stages: [
            'Quando um ataque reduzir você ou um aliado em alcance a 0 LP, uma luz recusa o fim: o alvo permanece com 1 LP. Só pode ser usada uma vez por combate.',
            'O alvo permanece com 10% do LP máximo e não sofre mais dano até o início do próximo turno dele. Só pode ser usada uma vez por combate.',
            'O alvo permanece com 25% do LP máximo, não sofre mais dano até o fim do próximo turno dele e todos os inimigos a até 3m dele ficam ofuscados (-3 nos ataques por 1 turno). Só pode ser usada uma vez por combate.'
        ]
    },
    {
        id: 'seed-rx-meia-vida',
        element: 'RADIAÇÃO',
        name: 'Meia-Vida',
        level: 4,
        mpCost: 10,
        type: 'Defesa (contínuo)',
        execution: 'Reação',
        range: 'Pessoal',
        stages: [
            'Quando você sofrer dano, a radiação decai o impacto: apenas metade do dano é aplicada agora e a outra metade é aplicada em duas parcelas iguais no início dos seus próximos 2 turnos.',
            'Apenas metade do dano é aplicada agora e a outra metade é aplicada em três parcelas iguais no início dos seus próximos 3 turnos. Você pode cancelar as parcelas restantes gastando 1 MP por parcela cancelada.',
            'Apenas 25% do dano é aplicado agora e o restante é aplicado em quatro parcelas iguais no início dos seus próximos 4 turnos. Você pode cancelar as parcelas restantes gastando 1 MP por parcela cancelada, sem gastar ação.'
        ]
    },
    {
        id: 'seed-rx-laco-gravitacional',
        element: 'VÁCUO',
        name: 'Laço Gravitacional',
        level: 4,
        mpCost: 10,
        type: 'Controle (imediato)',
        execution: 'Reação',
        range: 'Longo',
        stages: [
            'Quando um inimigo em alcance sair do alcance corpo a corpo de você ou de um aliado, você o prende em um laço de gravidade e o puxa de volta: o deslocamento dele termina no ponto de onde ele saiu.',
            'O inimigo é puxado de volta ao ponto de onde saiu e fica com deslocamento 0 até o fim do turno.',
            'O inimigo é puxado de volta, fica com deslocamento 0 até o fim do próximo turno dele e todos os outros inimigos a até 3m dele são puxados junto.'
        ]
    },
    {
        id: 'seed-rx-mare-retornante',
        element: 'ÁGUA',
        name: 'Maré Retornante',
        level: 4,
        mpCost: 11,
        type: 'Cura (imediato)',
        execution: 'Reação',
        range: 'Longo',
        stages: [
            'Quando um aliado em alcance sofrer dano, uma maré devolve parte do golpe: ele recupera LP igual a 50% do dano sofrido (máximo de 15 LP).',
            'Ele recupera LP igual a 75% do dano sofrido (máximo de 25 LP) e um Estado negativo à sua escolha é removido.',
            'Ele recupera LP igual a 100% do dano sofrido (máximo de 40 LP). Até dois outros aliados em alcance recuperam metade desse valor e todos têm um Estado negativo à sua escolha removido.'
        ]
    }
]
