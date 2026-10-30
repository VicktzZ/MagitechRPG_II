/* eslint-disable max-len */
/**
 * Lote de magias de RECUPERAÇÃO DE MANA (MP).
 *
 * Convenções (conferidas contra o catálogo real de 361 magias):
 *  - `element` em MAIÚSCULAS (é assim que o banco guarda e que a API filtra);
 *  - `type` no formato "Categoria (subtipo)" — a categoria alimenta o filtro "Tipo" do modal e
 *    o subtipo, o filtro "Subtipo". Magias que duram uma QUANTIDADE FIXA DE TURNOS são
 *    "(contínuo)"; "(sustentado)" é só para a magia que exige pagar metade do custo a cada
 *    turno, como ação livre, até o conjurador parar de pagar ou perder a concentração;
 *  - `execution`: Padrão, Completa, Bônus (o antigo "Livre"), Reação ou Movimento;
 *  - `range`: Pessoal, Toque, Curto, Médio ou Longo;
 *  - `stages` sempre com 3 entradas (Estágio 1/2/3; no nível 4 o 3º é a Maestria);
 *  - o custo exibido de cada estágio é `mpCost` + custo extra do estágio
 *    (ver `calculateExtraManaCost`): N1 +1/+2, N2 +2/+4, N3 +2/+5, N4 +4/+9;
 *  - texto no mesmo vocabulário das magias existentes: "turnos", "combate", metros ("4,5m").
 *
 * Balanceamento: toda recuperação é condicionada (gatilho, limite por turno/combate
 * ou custo em LP), para que nenhuma magia vire uma fonte infinita de MP. Os valores e as
 * durações receberam um reforço (buff) que cresce com o nível: ~+35% e +1 turno nos níveis 1
 * e 2, ~+50-65% e +2 turnos no nível 3 e ~+100% e +3 turnos no nível 4.
 * Cada estágio tem no máximo UMA expressão de dados (XdY), porque `rollSpellEffect` rola
 * todas as encontradas no texto e soma o resultado.
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
        type: 'Recuperação (imediato/Área)',
        execution: 'Reação',
        range: 'Curto',
        stages: [
            'Quando um inimigo realizar um ataque contra você e você desviar dele com sucesso, você recupera 4 MP. Só pode ser usada uma vez por turno.',
            'Quando um inimigo realizar um ataque contra você e você desviar dele com sucesso, você recupera 5 MP e pode se deslocar até 3m sem provocar reações. Só pode ser usada uma vez por turno.',
            'Quando você ou um aliado em alcance desviar com sucesso de um ataque, você recupera 8 MP e cada aliado em alcance recupera 4 MP. Só pode ser usada uma vez por turno.'
        ]
    },
    {
        id: 'seed-mp-brasa-voraz',
        element: 'FOGO',
        name: 'Brasa Voraz',
        level: 1,
        mpCost: 1,
        type: 'Ataque/Recuperação (imediato)',
        execution: 'Padrão',
        range: 'Médio',
        stages: [
            'Você lança uma brasa faminta em um alvo, causando 1d6 de dano de fogo. Se o alvo for derrotado por este ataque, você recupera 3 MP.',
            'A brasa causa 2d6 de dano de fogo. Se o ataque acertar, você recupera 2 MP; se o alvo for derrotado, você recupera 4 MP no total.',
            'A brasa causa 3d6 de dano de fogo. Se o ataque acertar, você recupera 3 MP; se o alvo for derrotado, você recupera 6 MP no total e a brasa salta para outro inimigo a até 3m dele, causando metade do dano.'
        ]
    },
    {
        id: 'seed-mp-cisterna-arcana',
        element: 'ÁGUA',
        name: 'Cisterna Arcana',
        level: 1,
        mpCost: 1,
        type: 'Recuperação (contínuo)',
        execution: 'Movimento',
        range: 'Pessoal',
        stages: [
            'Você cria uma pequena cisterna de água arcana ao seu lado, que dura 4 turnos. Sempre que você conjurar uma magia durante esse tempo, 1 MP do custo dela flui para a cisterna (máximo de 4 MP acumulados). Ao fim da duração, você bebe a água e recupera os MP acumulados.',
            'A cisterna dura 5 turnos e 2 MP do custo de cada magia que você conjurar fluem para ela (máximo de 8 MP acumulados). Ao fim da duração, você bebe a água e recupera os MP acumulados.',
            'A cisterna dura 6 turnos e 2 MP do custo de cada magia que você conjurar fluem para ela (máximo de 12 MP acumulados). Ao fim da duração, você ou um aliado adjacente bebe a água e recupera os MP acumulados. Se for um aliado, você também recupera 3 MP.'
        ]
    },
    {
        id: 'seed-mp-capacitor-vivo',
        element: 'ELETRICIDADE',
        name: 'Capacitor Vivo',
        level: 1,
        mpCost: 1,
        type: 'Recuperação (contínuo)',
        execution: 'Movimento',
        range: 'Pessoal',
        stages: [
            'Seu corpo se torna um capacitor por 4 turnos. Uma vez por turno, quando você sofrer dano, você recupera 2 MP.',
            'O efeito dura 5 turnos. Uma vez por turno, quando você sofrer dano, você recupera 3 MP.',
            'O efeito dura 6 turnos. Uma vez por turno, quando você sofrer dano, você recupera 3 MP e o atacante sofre 1 de dano elétrico.'
        ]
    },
    {
        id: 'seed-mp-pedra-de-foco',
        element: 'TERRA',
        name: 'Pedra de Foco',
        level: 1,
        mpCost: 1,
        type: 'Recuperação (contínuo)',
        execution: 'Completa',
        range: 'Pessoal',
        stages: [
            'Você transmuta uma pedra comum em um cristal de foco e o absorve, recuperando 4 MP. Só pode ser usada uma vez por combate.',
            'O cristal é maior e você recupera 7 MP. Só pode ser usada uma vez por combate e você não pode usar Reações até o início do seu próximo turno.',
            'O cristal se parte em dois: você recupera 9 MP e um aliado adjacente recupera 3 MP. Só pode ser usada uma vez por combate e você não pode usar Reações até o início do seu próximo turno.'
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
        mpCost: 4,
        type: 'Defesa/Recuperação (imediato)',
        execution: 'Reação',
        range: 'Médio',
        stages: [
            'Quando você ou um aliado em alcance for alvo de uma magia inimiga, você ergue um prisma que refrata parte da energia: o dano sofrido é reduzido em 3 e você recupera 4 MP. Só pode ser usada uma vez por turno.',
            'Quando você ou um aliado em alcance for alvo de uma magia inimiga, o dano sofrido é reduzido em 5 e você recupera 7 MP. Só pode ser usada uma vez por turno.',
            'Quando você ou um aliado em alcance for alvo de uma magia inimiga, o dano sofrido é reduzido em 8, você recupera 10 MP e o alvo da magia recupera 3 MP. Só pode ser usada uma vez por turno.'
        ]
    },
    {
        id: 'seed-mp-mare-cheia',
        element: 'ÁGUA',
        name: 'Maré Cheia',
        level: 2,
        mpCost: 4,
        type: 'Recuperação (contínuo/Área)',
        execution: 'Padrão',
        range: 'Médio',
        stages: [
            'Você faz uma maré arcana subir em uma área de 3m de raio, que dura 3 turnos. No início de cada um dos seus turnos, o aliado dentro da área com menos MP recupera 3 MP.',
            'A área tem 6m de raio e dura 4 turnos. No início de cada um dos seus turnos, o aliado dentro da área com menos MP recupera 4 MP.',
            'A área tem 6m de raio e dura 5 turnos. No início de cada um dos seus turnos, os dois aliados dentro da área com menos MP recuperam 4 MP cada.'
        ]
    },
    {
        id: 'seed-mp-chama-piloto',
        element: 'FOGO',
        name: 'Chama Piloto',
        level: 2,
        mpCost: 4,
        type: 'Recuperação (contínuo)',
        execution: 'Movimento',
        range: 'Pessoal',
        stages: [
            'Você acende uma chama-piloto sobre o ombro, que dura 4 turnos. Uma vez por turno, ao conjurar uma magia de Fogo, você recupera 3 MP.',
            'A chama dura 5 turnos. Uma vez por turno, ao conjurar uma magia de Fogo, você recupera 4 MP.',
            'A chama dura 6 turnos. Uma vez por turno, ao conjurar uma magia de Fogo, você recupera 4 MP. Aliados a até 4,5m de você que conjurarem uma magia de Fogo também recuperam 2 MP (uma vez por turno cada).'
        ]
    },
    {
        id: 'seed-mp-transvase-arcano',
        element: 'NÃO-ELEMENTAL',
        name: 'Transvase Arcano',
        level: 2,
        mpCost: 4,
        type: 'Recuperação (imediato)',
        execution: 'Padrão',
        range: 'Curto',
        stages: [
            'Você abre um canal entre o seu ORM e o de um aliado e transfere até 5 MP seus para ele. O aliado recebe o dobro do valor transferido.',
            'Você transfere até 8 MP seus para um aliado, que recebe o dobro do valor transferido. Ao final da transferência, você recupera 2 MP.',
            'Você transfere até 11 MP seus para um aliado, que recebe o dobro do valor transferido. Ao final da transferência, você recupera 4 MP.'
        ]
    },
    {
        id: 'seed-mp-sobrecarga-controlada',
        element: 'ELETRICIDADE',
        name: 'Sobrecarga Controlada',
        level: 2,
        mpCost: 4,
        type: 'Recuperação (imediato)',
        execution: 'Bônus',
        range: 'Pessoal',
        stages: [
            'Você libera uma descarga controlada contra o próprio corpo: sofre 1d4 de dano elétrico (ignora AP) e recupera 7 MP. Só pode ser usada uma vez por combate.',
            'Você sofre 1d6 de dano elétrico (ignora AP) e recupera 11 MP. Só pode ser usada uma vez por combate.',
            'Você sofre 1d8 de dano elétrico (ignora AP) e recupera 15 MP. Só pode ser usada uma vez por combate e pode ser aplicada a um aliado voluntário adjacente a você em vez de a você.'
        ]
    },
    {
        id: 'seed-mp-sombra-glutona',
        element: 'TREVAS',
        name: 'Sombra Glutona',
        level: 2,
        mpCost: 4,
        type: 'Controle/Recuperação (contínuo/Área)',
        execution: 'Padrão',
        range: 'Médio',
        stages: [
            'Você estende uma sombra faminta em uma área de 3m de raio, que dura 4 turnos. Sempre que um inimigo conjurar uma magia dentro da sombra, você recupera MP igual ao nível dessa magia + 1 (máximo de 4 MP por turno).',
            'A sombra tem 4,5m de raio e dura 5 turnos. Sempre que um inimigo conjurar uma magia dentro dela, você recupera MP igual ao nível dessa magia + 2 (máximo de 7 MP por turno).',
            'A sombra tem 6m de raio e dura 6 turnos. Sempre que um inimigo conjurar uma magia dentro dela, você recupera MP igual ao dobro do nível dessa magia + 1 (máximo de 11 MP por turno) e o conjurador perde 2 MP.'
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
        type: 'Recuperação (contínuo/Área)',
        execution: 'Padrão',
        range: 'Médio',
        stages: [
            'Você ancora um núcleo de calor e pressão no solo, criando uma zona de 3m de raio que dura 5 turnos. No fim do turno de cada aliado dentro da zona que não tenha se movido durante aquele turno, ele recupera 3 MP.',
            'A zona tem 6m de raio e dura 6 turnos. Aliados que não se moveram durante o turno recuperam 5 MP no fim dele e recebem +2 de AP temporário até o início do turno seguinte.',
            'A zona tem 6m de raio e dura 7 turnos. Aliados que não se moveram durante o turno recuperam 6 MP no fim dele e recebem +3 de AP temporário até o início do turno seguinte. Se você estiver dentro da zona, recupera 3 MP adicionais por turno.'
        ]
    },
    {
        id: 'seed-mp-reserva-subconsciente',
        element: 'PSÍQUICO',
        name: 'Reserva Subconsciente',
        level: 3,
        mpCost: 6,
        type: 'Recuperação (contínuo)',
        execution: 'Bônus',
        range: 'Pessoal',
        stages: [
            'Você isola uma reserva de energia no seu subconsciente por 5 turnos. Na primeira vez em que seu MP chegar a 0 durante esse tempo, a reserva se libera e você recupera 12 MP imediatamente, sem gastar ação.',
            'A reserva dura 6 turnos e libera 18 MP na primeira vez em que o seu MP chegar a 0.',
            'A reserva dura 7 turnos e libera 24 MP na primeira vez em que o seu MP chegar a 0. Além disso, um aliado adjacente a você, à sua escolha, recupera 6 MP.'
        ]
    },
    {
        id: 'seed-mp-pacto-carmesim',
        element: 'SANGUE',
        name: 'Sangria de Mana',
        level: 3,
        mpCost: 6,
        type: 'Recuperação (contínuo)',
        execution: 'Movimento',
        range: 'Pessoal',
        stages: [
            'Você sela um pacto de sangue por 5 turnos. Uma vez por turno, você pode sacrificar 10% do seu LP máximo (ignora AP) para recuperar 8 MP.',
            'O pacto dura 6 turnos. Uma vez por turno, você pode sacrificar 10% do seu LP máximo (ignora AP) para recuperar 12 MP.',
            'O pacto dura 7 turnos. Uma vez por turno, você pode sacrificar 15% do seu LP máximo (ignora AP) para recuperar 18 MP. Se estiver com menos da metade do seu LP máximo, você recupera 5 MP adicionais.'
        ]
    },
    {
        id: 'seed-mp-aurora-restauradora',
        element: 'LUZ',
        name: 'Aurora Restauradora',
        level: 3,
        mpCost: 7,
        type: 'Recuperação (imediato/Área)',
        execution: 'Padrão',
        range: 'Médio',
        stages: [
            'Um raio de aurora toca todos os aliados em alcance: cada um recupera 5 MP.',
            'Cada aliado em alcance recupera 8 MP e você recupera 3 MP.',
            'Cada aliado em alcance recupera 10 MP e você recupera 6 MP. Aliados com menos da metade do MP máximo recuperam 3 MP adicionais.'
        ]
    },
    {
        id: 'seed-mp-fluxo-perpetuo',
        element: 'AR',
        name: 'Fluxo Perpétuo',
        level: 3,
        mpCost: 6,
        type: 'Recuperação (contínuo)',
        execution: 'Movimento',
        range: 'Pessoal',
        stages: [
            'Você se funde ao fluxo do vento por 5 turnos. Ao final de cada deslocamento seu de pelo menos 6m durante o seu turno, você recupera 3 MP (uma vez por turno).',
            'O efeito dura 6 turnos. Ao final de cada deslocamento seu de pelo menos 6m durante o seu turno, você recupera 5 MP (uma vez por turno) e seu deslocamento aumenta em 3m.',
            'O efeito dura 7 turnos. Ao final de cada deslocamento seu de pelo menos 6m durante o seu turno, você recupera 5 MP (uma vez por turno) e seu deslocamento aumenta em 3m. Aliados que terminarem o deslocamento a até 3m de você recuperam 3 MP (uma vez por turno cada).'
        ]
    },
    {
        id: 'seed-mp-arco-voltaico',
        element: 'ELETRICIDADE',
        name: 'Arco Voltaico',
        level: 3,
        mpCost: 6,
        type: 'Ataque/Recuperação (imediato)',
        execution: 'Padrão',
        range: 'Médio',
        stages: [
            'Um arco elétrico atinge um alvo, causando 3d6 de dano elétrico, e salta para até dois outros inimigos a até 4,5m do alvo anterior, causando metade do dano a cada um. Você recupera 3 MP por inimigo atingido além do primeiro.',
            'O arco causa 4d6 de dano elétrico e salta para até três outros inimigos. Você recupera 5 MP por inimigo atingido além do primeiro.',
            'O arco causa 5d6 de dano elétrico e salta para até quatro outros inimigos. Você recupera 6 MP por inimigo atingido além do primeiro.'
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
        type: 'Controle/Recuperação (contínuo)',
        execution: 'Reação',
        range: 'Médio',
        stages: [
            'Quando uma magia inimiga de nível 2 ou inferior tiver você ou um aliado em alcance como alvo, você abre uma fenda no vazio que a engole: a magia é anulada e você recupera MP igual ao custo base dela.',
            'Funciona contra magias de nível 3 ou inferior. A magia é anulada e você recupera MP igual ao dobro do custo base dela.',
            'Funciona contra qualquer magia. A magia é anulada e você recupera MP igual ao triplo do custo base dela (máximo de 35 MP). A fenda permanece até o fim do turno e anula também a próxima magia inimiga, recuperando metade do custo base dela.'
        ]
    },
    {
        id: 'seed-mp-decaimento-benigno',
        element: 'RADIAÇÃO',
        name: 'Decaimento Benigno',
        level: 4,
        mpCost: 10,
        type: 'Encantamento/Recuperação (contínuo/Área)',
        execution: 'Padrão',
        range: 'Longo',
        stages: [
            'Você irradia uma zona de decaimento de 6m de raio por 6 turnos. No início de cada um dos seus turnos, inimigos dentro da zona sofrem 1d4 de dano de radiação e cada aliado dentro dela recupera 4 MP.',
            'A zona dura 7 turnos. No início de cada um dos seus turnos, inimigos dentro da zona sofrem 2d4 de dano de radiação e cada aliado dentro dela recupera 6 MP.',
            'A zona tem 9m de raio e dura 8 turnos. No início de cada um dos seus turnos, inimigos dentro da zona sofrem 3d4 de dano de radiação, cada aliado dentro dela recupera 8 MP e você recupera 2 MP por inimigo na zona (máximo de 10).'
        ]
    },
    {
        id: 'seed-mp-detonacao-capacitora',
        element: 'EXPLOSÃO',
        name: 'Detonação Capacitora',
        level: 4,
        mpCost: 11,
        type: 'Ataque/Recuperação (imediato/Área)',
        execution: 'Completa',
        range: 'Longo',
        stages: [
            'Você comprime energia em um ponto e a detona em uma área de 3m de raio, causando 5d6 de dano de explosão. Aliados não sofrem o dano. Você recupera 2 MP por inimigo atingido (máximo de 8).',
            'A área tem 6m de raio e a detonação causa 6d6 de dano de explosão. Aliados não sofrem o dano. Você recupera 4 MP por inimigo atingido (máximo de 16).',
            'A área tem 6m de raio e a detonação causa 8d6 de dano de explosão. Aliados não sofrem o dano. Você recupera 6 MP por inimigo atingido (máximo de 24) e cada aliado a até 3m de você recupera metade desse valor.'
        ]
    },
    {
        id: 'seed-mp-convergencia-zepta',
        element: 'NÃO-ELEMENTAL',
        name: 'Convergência Zepta',
        level: 4,
        mpCost: 12,
        type: 'Recuperação (contínuo/Área)',
        execution: 'Padrão',
        range: 'Longo',
        stages: [
            'Você sincroniza os Zeptachips de todos os aliados em alcance por 6 turnos. Uma vez por turno, cada aliado sincronizado que conjurar uma magia recupera 2 MP (máximo de 8 MP por turno no total).',
            'A sincronia dura 7 turnos. Uma vez por turno, cada aliado sincronizado que conjurar uma magia recupera 4 MP (máximo de 12 MP por turno no total).',
            'A sincronia dura 8 turnos. Uma vez por turno, cada aliado sincronizado que conjurar uma magia recupera 6 MP (máximo de 16 MP por turno no total) e você recupera 2 MP sempre que um aliado se beneficiar.'
        ]
    }
]
