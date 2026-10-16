/* eslint-disable max-len */
/**
 * Lote de magias de RECUPERAÇÃO DE MANA (MP).
 *
 * Convenções (espelham as magias já cadastradas):
 *  - `element` em MAIÚSCULAS (é assim que o banco guarda e que a API filtra);
 *  - `type` no formato "Categoria (detalhe)" — a categoria alimenta o filtro "Tipo" do modal;
 *  - `stages` sempre com 3 entradas (Estágio 1/2/3; no nível 4 o 3º é a Maestria);
 *  - o custo exibido de cada estágio é `mpCost` + custo extra do estágio
 *    (ver `calculateExtraManaCost`): N1 +1/+2, N2 +2/+4, N3 +2/+5, N4 +4/+9.
 *
 * Balanceamento: toda recuperação é condicionada (gatilho, limite por rodada/cena
 * ou custo em LP), para que nenhuma magia vire uma fonte infinita de MP.
 * Cada estágio tem no máximo UMA expressão de dados (XdY), porque `castSpell`
 * rola todas as encontradas no texto e soma o resultado.
 */
export interface SeedSpell {
    id: string
    element: string
    name: string
    level: 1 | 2 | 3 | 4
    mpCost: number
    type: string
    execution: string
    range: string
    stages: [string, string, string]
}

export const MANA_RECOVERY_SPELLS: SeedSpell[] = [
    // ═══════════════════════════════════════════════════════════════════════
    // NÍVEL 1
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'seed-mp-danca-do-vento',
        element: 'AR',
        name: 'Dança do Vento',
        level: 1,
        mpCost: 1,
        type: 'Defesa (imediato)',
        execution: 'Reação',
        range: 'Curto',
        stages: [
            'Quando um inimigo realizar um ataque contra você e você desviar dele com sucesso, você recupera 3 MP. Só pode ser usada uma vez por rodada.',
            'Quando um inimigo realizar um ataque contra você e você desviar dele com sucesso, você recupera 4 MP e pode se deslocar até 3m sem provocar reações. Só pode ser usada uma vez por rodada.',
            'Quando você ou um aliado em alcance desviar com sucesso de um ataque, você recupera 6 MP e cada aliado em alcance recupera 3 MP. Só pode ser usada uma vez por rodada.'
        ]
    },
    {
        id: 'seed-mp-brasa-voraz',
        element: 'FOGO',
        name: 'Brasa Voraz',
        level: 1,
        mpCost: 1,
        type: 'Ataque (imediato)',
        execution: 'Padrão',
        range: 'Médio',
        stages: [
            'Você lança uma brasa faminta em um alvo, causando 1d6 de dano de fogo. Se o alvo for derrotado por este ataque, você recupera 2 MP.',
            'A brasa causa 2d6 de dano de fogo. Se o ataque acertar, você recupera 1 MP; se o alvo for derrotado, você recupera 3 MP no total.',
            'A brasa causa 3d6 de dano de fogo. Se o ataque acertar, você recupera 2 MP; se o alvo for derrotado, você recupera 4 MP no total e a brasa salta para outro inimigo a até 3m dele, causando metade do dano.'
        ]
    },
    {
        id: 'seed-mp-gota-de-orvalho',
        element: 'ÁGUA',
        name: 'Gota de Orvalho',
        level: 1,
        mpCost: 1,
        type: 'Suporte (imediato)',
        execution: 'Bônus',
        range: 'Curto',
        stages: [
            'Você toca um aliado com uma gota de energia condensada e ele recupera 2 MP. Um mesmo aliado só pode ser afetado por esta magia uma vez por cena.',
            'Até dois aliados em alcance recuperam 2 MP cada. Um mesmo aliado só pode ser afetado por esta magia uma vez por cena.',
            'Até três aliados em alcance recuperam 3 MP cada. Um mesmo aliado só pode ser afetado por esta magia uma vez por cena.'
        ]
    },
    {
        id: 'seed-mp-capacitor-vivo',
        element: 'ELETRICIDADE',
        name: 'Capacitor Vivo',
        level: 1,
        mpCost: 1,
        type: 'Encantamento (conjurado)',
        execution: 'Bônus',
        range: 'Curto',
        stages: [
            'Seu corpo se torna um capacitor por 3 rodadas. Uma vez por rodada, quando você sofrer dano, você recupera 1 MP.',
            'O efeito dura 4 rodadas. Uma vez por rodada, quando você sofrer dano, você recupera 2 MP.',
            'O efeito dura 5 rodadas. Uma vez por rodada, quando você sofrer dano, você recupera 2 MP e o atacante sofre 1 de dano elétrico.'
        ]
    },
    {
        id: 'seed-mp-pedra-de-foco',
        element: 'TERRA',
        name: 'Pedra de Foco',
        level: 1,
        mpCost: 1,
        type: 'Utilidade (conjurado)',
        execution: 'Completa',
        range: 'Curto',
        stages: [
            'Você se concentra em uma pedra comum, canalizando a energia do solo para si, e recupera 3 MP. Só pode ser usada uma vez por cena.',
            'Você recupera 5 MP. Só pode ser usada uma vez por cena e você não pode usar Reações até o início do seu próximo turno.',
            'Você recupera 7 MP e cada aliado adjacente à pedra recupera 2 MP. Só pode ser usada uma vez por cena e você não pode usar Reações até o início do seu próximo turno.'
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // NÍVEL 2
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'seed-mp-prisma-refletor',
        element: 'LUZ',
        name: 'Prisma Refletor',
        level: 2,
        mpCost: 3,
        type: 'Defesa (imediato)',
        execution: 'Reação',
        range: 'Médio',
        stages: [
            'Quando você ou um aliado em alcance for alvo de uma magia inimiga, você ergue um prisma que refrata parte da energia: o dano sofrido é reduzido em 3 e você recupera 2 MP. Só pode ser usada uma vez por rodada.',
            'Quando você ou um aliado em alcance for alvo de uma magia inimiga, o dano sofrido é reduzido em 5 e você recupera 4 MP. Só pode ser usada uma vez por rodada.',
            'Quando você ou um aliado em alcance for alvo de uma magia inimiga, o dano sofrido é reduzido em 8, você recupera 6 MP e o alvo da magia recupera 2 MP. Só pode ser usada uma vez por rodada.'
        ]
    },
    {
        id: 'seed-mp-mare-cheia',
        element: 'ÁGUA',
        name: 'Maré Cheia',
        level: 2,
        mpCost: 3,
        type: 'Encantamento (conjurado)',
        execution: 'Padrão',
        range: 'Médio',
        stages: [
            'Você faz uma maré arcana subir em uma área de 3m de raio, que dura 2 rodadas. No início de cada rodada, o aliado dentro da área com menos MP recupera 1 MP.',
            'A área tem 6m de raio e dura 3 rodadas. No início de cada rodada, o aliado dentro da área com menos MP recupera 2 MP.',
            'A área tem 6m de raio e dura 3 rodadas. No início de cada rodada, os dois aliados dentro da área com menos MP recuperam 3 MP cada.'
        ]
    },
    {
        id: 'seed-mp-dreno-de-sombra',
        element: 'TREVAS',
        name: 'Dreno de Sombra',
        level: 2,
        mpCost: 3,
        type: 'Ataque (imediato)',
        execution: 'Padrão',
        range: 'Curto',
        stages: [
            'Tentáculos de sombra sugam a energia do alvo, causando 2d6 de dano de trevas. Você recupera MP igual à metade do dano causado (arredondado para baixo, máximo de 3).',
            'Os tentáculos causam 3d6 de dano de trevas. Você recupera MP igual à metade do dano causado (arredondado para baixo, máximo de 5).',
            'Os tentáculos causam 4d6 de dano de trevas. Você recupera MP igual à metade do dano causado (arredondado para baixo, máximo de 8). Se o alvo possuir MP, ele também perde 2 MP.'
        ]
    },
    {
        id: 'seed-mp-transvase-arcano',
        element: 'NÃO-ELEMENTAL',
        name: 'Transvase Arcano',
        level: 2,
        mpCost: 3,
        type: 'Suporte (imediato)',
        execution: 'Padrão',
        range: 'Curto',
        stages: [
            'Você abre um canal entre o seu ORM e o de um aliado e transfere até 4 MP seus para ele. O aliado recebe o dobro do valor transferido.',
            'Você transfere até 6 MP seus para um aliado, que recebe o dobro do valor transferido. Ao final da transferência, você recupera 1 MP.',
            'Você transfere até 8 MP seus para um aliado, que recebe o dobro do valor transferido. Ao final da transferência, você recupera 3 MP.'
        ]
    },
    {
        id: 'seed-mp-sobrecarga-controlada',
        element: 'ELETRICIDADE',
        name: 'Sobrecarga Controlada',
        level: 2,
        mpCost: 3,
        type: 'Utilidade (imediato)',
        execution: 'Bônus',
        range: 'Curto',
        stages: [
            'Você libera uma descarga controlada contra o próprio corpo: sofre 1d4 de dano elétrico (ignora AP) e recupera 5 MP. Só pode ser usada uma vez por cena.',
            'Você sofre 1d6 de dano elétrico (ignora AP) e recupera 8 MP. Só pode ser usada uma vez por cena.',
            'Você sofre 1d8 de dano elétrico (ignora AP) e recupera 11 MP. Só pode ser usada uma vez por cena e pode ser aplicada a um aliado voluntário em alcance em vez de a você.'
        ]
    },
    {
        id: 'seed-mp-pira-de-cinzas',
        element: 'FOGO',
        name: 'Pira de Cinzas',
        level: 2,
        mpCost: 3,
        type: 'Encantamento (conjurado)',
        execution: 'Padrão',
        range: 'Médio',
        stages: [
            'Você acende uma pira de cinzas em uma área de 3m de raio por 3 rodadas. Sempre que um inimigo dentro da pira sofrer dano de fogo, você recupera 1 MP (máximo de 2 MP por rodada).',
            'A pira dura 4 rodadas. Sempre que um inimigo dentro dela sofrer dano de fogo, você recupera 1 MP (máximo de 3 MP por rodada), e inimigos que entrarem na pira pela primeira vez sofrem 3 de dano de fogo.',
            'A pira tem 6m de raio e dura 4 rodadas. Sempre que um inimigo dentro dela sofrer dano de fogo, você recupera 2 MP (máximo de 4 MP por rodada), e inimigos que entrarem na pira pela primeira vez sofrem 3 de dano de fogo.'
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // NÍVEL 3
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'seed-mp-nucleo-geotermico',
        element: 'TERRA',
        name: 'Núcleo Geotérmico',
        level: 3,
        mpCost: 6,
        type: 'Encantamento (conjurado)',
        execution: 'Padrão',
        range: 'Médio',
        stages: [
            'Você ancora um núcleo de calor e pressão no solo, criando uma zona de 3m de raio que dura 3 rodadas. No fim do turno de cada aliado dentro da zona que não tenha se movido durante aquele turno, ele recupera 2 MP.',
            'A zona tem 6m de raio e dura 4 rodadas. Aliados que não se moveram durante o turno recuperam 3 MP no fim dele e recebem +2 de AP temporário até o início do turno seguinte.',
            'A zona tem 6m de raio e dura 5 rodadas. Aliados que não se moveram durante o turno recuperam 4 MP no fim dele e recebem +3 de AP temporário até o início do turno seguinte. Se você estiver dentro da zona, recupera 2 MP adicionais por rodada.'
        ]
    },
    {
        id: 'seed-mp-sifao-mental',
        element: 'PSÍQUICO',
        name: 'Sifão Mental',
        level: 3,
        mpCost: 6,
        type: 'Ataque (imediato)',
        execution: 'Padrão',
        range: 'Médio',
        stages: [
            'Você invade a mente do alvo e suga sua energia mágica: ele sofre 3d6 de dano psíquico e perde 3 MP, que você recupera. Se o alvo não possuir MP, você recupera apenas 1 MP.',
            'O alvo sofre 4d6 de dano psíquico e perde 5 MP, que você recupera. Se o alvo não possuir MP, você recupera 2 MP.',
            'O alvo sofre 5d6 de dano psíquico e perde 8 MP, que você recupera. Se o alvo não possuir MP, você recupera 4 MP. Se o MP do alvo chegar a 0, ele não pode conjurar magias até o fim do próximo turno dele.'
        ]
    },
    {
        id: 'seed-mp-pacto-carmesim',
        element: 'SANGUE',
        name: 'Pacto Carmesim',
        level: 3,
        mpCost: 6,
        type: 'Encantamento (conjurado)',
        execution: 'Bônus',
        range: 'Curto',
        stages: [
            'Você sela um pacto de sangue por 3 rodadas. Uma vez por rodada, você pode sacrificar 10% do seu LP máximo (ignora AP) para recuperar 5 MP.',
            'O pacto dura 4 rodadas. Uma vez por rodada, você pode sacrificar 10% do seu LP máximo (ignora AP) para recuperar 8 MP.',
            'O pacto dura 5 rodadas. Uma vez por rodada, você pode sacrificar 15% do seu LP máximo (ignora AP) para recuperar 12 MP. Se estiver com menos da metade do seu LP máximo, você recupera 3 MP adicionais.'
        ]
    },
    {
        id: 'seed-mp-aurora-restauradora',
        element: 'LUZ',
        name: 'Aurora Restauradora',
        level: 3,
        mpCost: 7,
        type: 'Suporte (imediato)',
        execution: 'Padrão',
        range: 'Médio',
        stages: [
            'Um raio de aurora toca todos os aliados em alcance: cada um recupera 3 MP.',
            'Cada aliado em alcance recupera 5 MP e você recupera 2 MP.',
            'Cada aliado em alcance recupera 6 MP e você recupera 4 MP. Aliados com menos da metade do MP máximo recuperam 2 MP adicionais.'
        ]
    },
    {
        id: 'seed-mp-fluxo-perpetuo',
        element: 'AR',
        name: 'Fluxo Perpétuo',
        level: 3,
        mpCost: 6,
        type: 'Utilidade (conjurado)',
        execution: 'Movimento',
        range: 'Curto',
        stages: [
            'Você se funde ao fluxo do vento por 3 rodadas. Ao final de cada deslocamento seu de pelo menos 6m durante o seu turno, você recupera 2 MP (uma vez por rodada).',
            'O efeito dura 4 rodadas. Ao final de cada deslocamento seu de pelo menos 6m durante o seu turno, você recupera 3 MP (uma vez por rodada) e seu deslocamento aumenta em 3m.',
            'O efeito dura 5 rodadas. Ao final de cada deslocamento seu de pelo menos 6m durante o seu turno, você recupera 3 MP (uma vez por rodada) e seu deslocamento aumenta em 3m. Aliados que terminarem o deslocamento deles a até 3m de você recuperam 2 MP (uma vez por rodada cada).'
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // NÍVEL 4 (o 3º estágio é a Maestria)
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'seed-mp-fenda-devoradora',
        element: 'VÁCUO',
        name: 'Fenda Devoradora',
        level: 4,
        mpCost: 10,
        type: 'Defesa (imediato)',
        execution: 'Reação',
        range: 'Médio',
        stages: [
            'Quando uma magia inimiga de nível 2 ou inferior tiver você ou um aliado em alcance como alvo, você abre uma fenda no vazio que a engole: a magia é anulada e você recupera MP igual à metade do custo base dela.',
            'Funciona contra magias de nível 3 ou inferior. A magia é anulada e você recupera MP igual ao custo base dela.',
            'Funciona contra qualquer magia. A magia é anulada e você recupera MP igual ao dobro do custo base dela (máximo de 20 MP). A fenda permanece até o fim da rodada e anula também a próxima magia inimiga, sem recuperar MP.'
        ]
    },
    {
        id: 'seed-mp-decaimento-benigno',
        element: 'RADIAÇÃO',
        name: 'Decaimento Benigno',
        level: 4,
        mpCost: 10,
        type: 'Encantamento (conjurado)',
        execution: 'Padrão',
        range: 'Longo',
        stages: [
            'Você irradia uma zona de decaimento de 6m de raio por 3 rodadas. No início de cada rodada, inimigos dentro da zona sofrem 1d4 de dano de radiação e cada aliado dentro dela recupera 2 MP.',
            'A zona dura 4 rodadas. No início de cada rodada, inimigos dentro da zona sofrem 2d4 de dano de radiação e cada aliado dentro dela recupera 3 MP.',
            'A zona tem 9m de raio e dura 5 rodadas. No início de cada rodada, inimigos dentro da zona sofrem 3d4 de dano de radiação, cada aliado dentro dela recupera 4 MP e você recupera 1 MP por inimigo na zona (máximo de 5).'
        ]
    },
    {
        id: 'seed-mp-detonacao-capacitora',
        element: 'EXPLOSÃO',
        name: 'Detonação Capacitora',
        level: 4,
        mpCost: 11,
        type: 'Ataque (imediato)',
        execution: 'Completa',
        range: 'Longo',
        stages: [
            'Você comprime energia em um ponto e a detona em uma área de 3m de raio, causando 5d6 de dano de explosão. Aliados não sofrem o dano. Você recupera 1 MP por inimigo atingido (máximo de 4).',
            'A área tem 6m de raio e a detonação causa 6d6 de dano de explosão. Aliados não sofrem o dano. Você recupera 2 MP por inimigo atingido (máximo de 8).',
            'A área tem 6m de raio e a detonação causa 8d6 de dano de explosão. Aliados não sofrem o dano. Você recupera 3 MP por inimigo atingido (máximo de 12) e cada aliado a até 3m de você recupera metade desse valor.'
        ]
    },
    {
        id: 'seed-mp-convergencia-zepta',
        element: 'NÃO-ELEMENTAL',
        name: 'Convergência Zepta',
        level: 4,
        mpCost: 12,
        type: 'Suporte (conjurado)',
        execution: 'Padrão',
        range: 'Longo',
        stages: [
            'Você sincroniza os Zeptachips de todos os aliados em alcance por 3 rodadas. Uma vez por rodada, cada aliado sincronizado que conjurar uma magia recupera 1 MP (máximo de 4 MP por rodada no total).',
            'A sincronia dura 4 rodadas. Uma vez por rodada, cada aliado sincronizado que conjurar uma magia recupera 2 MP (máximo de 6 MP por rodada no total).',
            'A sincronia dura 5 rodadas. Uma vez por rodada, cada aliado sincronizado que conjurar uma magia recupera 3 MP (máximo de 8 MP por rodada no total) e você recupera 1 MP sempre que um aliado se beneficiar.'
        ]
    }
]
