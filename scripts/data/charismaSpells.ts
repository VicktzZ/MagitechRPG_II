/* eslint-disable max-len */
/**
 * Lote de magias que USAM ou DEPENDEM do atributo CARISMA (CAR): presença, persuasão e liderança.
 *
 * Como o Carisma entra nas magias (vocabulário do catálogo):
 *  - testes das perícias de CAR (Comunicação, Diplomacia, Enganação, Intimidação, Interrogação,
 *    Liderança, Persuasão), geralmente contra a Resistência Mental do alvo;
 *  - o "modificador de CAR" como número (dano, cura, bônus), como em "bônus de Liderança";
 *  - vantagem em testes de CAR e o desconto em compras que o Carisma já dá.
 *
 * Convenções (iguais às dos outros lotes, conferidas contra o catálogo real): `element` em MAIÚSCULAS,
 * `execution` ∈ {Padrão, Completa, Livre, Reação, Movimento}, `range` ∈ {Pessoal, Toque, Curto, Médio, Longo},
 * 3 estágios (no nível 4 o 3º é a Maestria), no máximo UMA expressão de dados (XdY) por estágio e
 * vocabulário de "turnos". Subtipos: contínuo = dura uma quantidade fixa de turnos; sustentado = paga
 * metade do custo de MP a cada turno como ação livre; conjurado = só é executada no próximo turno;
 * imediato = resolve na hora.
 */
import type { SeedSpell } from './manaRecoverySpells'

export const CHARISMA_SPELLS: SeedSpell[] = [
    // ═══════════════════════════════════════════════════════════════════════
    // NÍVEL 1
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'seed-car-voz-de-comando',
        element: 'PSÍQUICO',
        name: 'Voz de Comando',
        level: 1,
        mpCost: 1,
        type: 'Controle (imediato)',
        execution: 'Padrão',
        range: 'Curto',
        stages: [
            'Você dá uma ordem de uma palavra a um inimigo em alcance (Pare, Largue, Recue). Faça um teste de Intimidação contra a Resistência Mental do alvo: se vencer, ele obedece e perde a ação de Movimento no próximo turno dele.',
            'A ordem afeta até dois inimigos. Se você vencer por 5 ou mais, o alvo também larga o que estiver segurando.',
            'A ordem afeta até três inimigos e você joga o teste com vantagem. Se você vencer por 5 ou mais, o alvo perde a ação Padrão em vez da ação de Movimento.'
        ]
    },
    {
        id: 'seed-car-sorriso-cativante',
        element: 'LUZ',
        name: 'Sorriso Cativante',
        level: 1,
        mpCost: 1,
        type: 'Encantamento (contínuo)',
        execution: 'Movimento',
        range: 'Pessoal',
        stages: [
            'Seu sorriso brilha por 3 turnos. Você joga com vantagem em testes de Persuasão e Diplomacia, e criaturas neutras ou amigáveis em alcance curto tratam você com simpatia.',
            'O sorriso dura 4 turnos. A vantagem também vale para testes de Comunicação e Enganação.',
            'O sorriso dura 5 turnos. A vantagem vale para todos os testes de CAR e você recebe +2 nas jogadas de resistência contra efeitos de medo.'
        ]
    },
    {
        id: 'seed-car-palavras-de-conforto',
        element: 'ÁGUA',
        name: 'Palavras de Conforto',
        level: 1,
        mpCost: 2,
        type: 'Cura (imediato)',
        execution: 'Padrão',
        range: 'Toque',
        stages: [
            'Você conforta um aliado com palavras calmas: ele recupera LP igual a 2 vezes o seu modificador de CAR (mínimo 2) e perde a condição Medo, se estiver com ela.',
            'O aliado recupera LP igual a 3 vezes o seu modificador de CAR (mínimo 3) e perde também a condição Atordoamento, se estiver com ela.',
            'O aliado recupera LP igual a 4 vezes o seu modificador de CAR (mínimo 4), perde uma condição prejudicial de sua escolha e recebe +2 nas jogadas de Resistência Mental por 3 turnos.'
        ]
    },
    {
        id: 'seed-car-vaia-estridente',
        element: 'AR',
        name: 'Vaia Estridente',
        level: 1,
        mpCost: 2,
        type: 'Ataque (imediato)',
        execution: 'Padrão',
        range: 'Curto',
        stages: [
            'Você solta uma vaia que corta o ar como uma rajada: o alvo sofre 1d6 de dano de ar mais o seu modificador de CAR e tem -1 nas jogadas de ataque até o fim do próximo turno dele.',
            'O alvo sofre 2d6 de dano de ar mais o seu modificador de CAR e tem -2 nas jogadas de ataque. A vaia também atinge um segundo inimigo a até 3m do alvo, causando metade do dano.',
            'O alvo sofre 3d6 de dano de ar mais o seu modificador de CAR e tem -3 nas jogadas de ataque. Se o dano deixar o alvo com menos da metade do LP máximo, ele fica com Medo por 1 turno.'
        ]
    },
    {
        id: 'seed-car-barganha-arcana',
        element: 'NÃO-ELEMENTAL',
        name: 'Barganha Arcana',
        level: 1,
        mpCost: 1,
        type: 'Utilidade (imediato)',
        execution: 'Completa',
        range: 'Pessoal',
        stages: [
            'Você fecha um negócio com lábia de mercador: a próxima compra que fizer agora recebe 10% de desconto, somado ao desconto do seu Carisma.',
            'O desconto é de 20% em até 2 itens da mesma compra e você joga com vantagem no teste de Persuasão para negociar o preço.',
            'O desconto é de 30% em até 3 itens da mesma compra e o comerciante também aceita pagar 10% a mais pelo que você vender na mesma negociação.'
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // NÍVEL 2
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'seed-car-provocacao-ardente',
        element: 'FOGO',
        name: 'Provocação Ardente',
        level: 2,
        mpCost: 4,
        type: 'Controle (contínuo)',
        execution: 'Padrão',
        range: 'Médio',
        stages: [
            'Você provoca um inimigo com palavras que queimam. Faça um teste de Intimidação contra a Resistência Mental do alvo: se vencer, por 3 turnos ele tem desvantagem em ataques contra qualquer criatura que não seja você.',
            'A provocação dura 4 turnos e, no início de cada turno do alvo, ele sofre 1d6 de dano de fogo enquanto estiver a mais de 3m de você.',
            'A provocação dura 5 turnos, afeta até dois inimigos e o dano passa a 2d6 por turno.'
        ]
    },
    {
        id: 'seed-car-elogio-venenoso',
        element: 'TREVAS',
        name: 'Elogio Venenoso',
        level: 2,
        mpCost: 4,
        type: 'Debuff (contínuo)',
        execution: 'Padrão',
        range: 'Curto',
        stages: [
            'Você adula o alvo até ele baixar a guarda. Faça um teste de Enganação contra a Resistência Mental do alvo: se vencer, ele fica Vulnerável por 2 turnos.',
            'O alvo fica Vulnerável por 3 turnos e, enquanto estiver assim, tem -2 nas jogadas de resistência.',
            'O alvo fica Vulnerável por 4 turnos. Além disso, o primeiro ataque de um aliado seu contra o alvo por turno causa dano extra igual a 2 vezes o seu modificador de CAR.'
        ]
    },
    {
        id: 'seed-car-brado-de-guerra',
        element: 'TERRA',
        name: 'Brado de Guerra',
        level: 2,
        mpCost: 5,
        type: 'Suporte (contínuo)',
        execution: 'Padrão',
        range: 'Curto',
        stages: [
            'Você solta um brado que ecoa pelas rochas. Por 3 turnos, aliados em alcance ganham bônus nas jogadas de ataque igual à metade do seu modificador de CAR (mínimo +1).',
            'O brado dura 4 turnos e os aliados também recebem +1 nas jogadas de resistência contra Medo e efeitos mentais.',
            'O brado dura 5 turnos. O bônus de ataque passa a ser igual ao seu modificador de CAR e os aliados ganham AP temporário igual à metade do seu modificador de CAR (mínimo 1).'
        ]
    },
    {
        id: 'seed-car-aplauso-estrondoso',
        element: 'EXPLOSÃO',
        name: 'Aplauso Estrondoso',
        level: 2,
        mpCost: 5,
        type: 'Ataque (imediato)',
        execution: 'Padrão',
        range: 'Pessoal',
        stages: [
            'Você bate palmas e libera uma onda de choque em 3m de raio ao seu redor, causando 2d6 de dano de explosão a todos os inimigos. Quem falhar na Resistência Mental contra o seu teste de Intimidação fica com Medo por 1 turno.',
            'O raio passa a 4,5m e a onda causa 3d6 de dano de explosão. O Medo dura 2 turnos.',
            'O raio passa a 6m e a onda causa 4d6 de dano de explosão. O Medo dura 2 turnos e os inimigos com Medo também são empurrados 3m para longe de você.'
        ]
    },
    {
        id: 'seed-car-hiato-diplomatico',
        element: 'VÁCUO',
        name: 'Hiato Diplomático',
        level: 2,
        mpCost: 4,
        type: 'Defesa (imediato)',
        execution: 'Reação',
        range: 'Curto',
        stages: [
            'Quando um inimigo em alcance atacar você ou um aliado, você abre um silêncio no vazio que pede uma conversa antes do golpe. Faça um teste de Diplomacia contra a Resistência Mental do atacante: se vencer, o ataque é cancelado. Só pode ser usada uma vez por turno.',
            'Se você vencer por 5 ou mais, o atacante também perde a Reação até o início do próximo turno dele. Só pode ser usada uma vez por turno.',
            'Também funciona contra magias de nível 2 ou inferior que tenham você ou um aliado como alvo. Se você vencer por 5 ou mais, o atacante perde a ação Padrão no próximo turno dele. Só pode ser usada uma vez por turno.'
        ]
    },
    {
        id: 'seed-car-poligrafo-arcano',
        element: 'ELETRICIDADE',
        name: 'Polígrafo Arcano',
        level: 2,
        mpCost: 3,
        type: 'Mentalização (contínuo)',
        execution: 'Livre',
        range: 'Pessoal',
        stages: [
            'Por 3 turnos, pequenas faíscas denunciam mentiras: você sabe quando uma criatura em alcance curto mente para você e joga com vantagem em testes de Interrogação contra ela.',
            'O efeito dura 4 turnos e o alcance passa a ser médio. Você também percebe quando a criatura diz uma meia-verdade.',
            'O efeito dura 5 turnos. Uma criatura que mentir para você sofre 1d6 de dano elétrico (ignora AP) e você sabe qual parte da frase era mentira.'
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // NÍVEL 3
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'seed-car-contrato-de-sangue',
        element: 'SANGUE',
        name: 'Contrato de Sangue',
        level: 3,
        mpCost: 6,
        type: 'Controle (contínuo)',
        execution: 'Padrão',
        range: 'Curto',
        stages: [
            'Você oferece um contrato selado em sangue a um inimigo. Faça um teste de Persuasão contra a Resistência Mental do alvo: se vencer, por 3 turnos, se ele atacar você ou um aliado seu, sofre 3d6 de dano de sangue (ignora AP) e o contrato se rompe.',
            'O contrato dura 4 turnos e o dano passa a 4d6.',
            'O contrato dura 5 turnos, afeta até dois inimigos e o dano passa a 5d6. Quando um contrato se rompe, você recupera LP igual ao seu modificador de CAR.'
        ]
    },
    {
        id: 'seed-car-plateia-espectral',
        element: 'ELETRICIDADE',
        name: 'Plateia Espectral',
        level: 3,
        mpCost: 6,
        type: 'Ilusão (contínuo)',
        execution: 'Padrão',
        range: 'Médio',
        stages: [
            'Você invoca uma plateia espectral de luzes e faíscas em uma área de 6m de raio, que dura 3 turnos. Inimigos na área têm -2 nas jogadas de ataque e em testes de Percepção, distraídos pelos aplausos; aliados na área recebem +1 nas jogadas de resistência.',
            'A plateia dura 4 turnos. A penalidade dos inimigos passa a -3 e os aliados recebem bônus nas jogadas de resistência igual à metade do seu modificador de CAR (mínimo +1).',
            'A plateia dura 5 turnos e a área passa a 9m. A penalidade dos inimigos passa a -4, o bônus dos aliados passa a ser igual ao seu modificador de CAR e, quando um aliado acerta um ataque, a plateia ovaciona e ele recupera 1 MP (uma vez por turno cada).'
        ]
    },
    {
        id: 'seed-car-confissao-forcada',
        element: 'PSÍQUICO',
        name: 'Confissão Forçada',
        level: 3,
        mpCost: 6,
        type: 'Mentalização (imediato)',
        execution: 'Padrão',
        range: 'Curto',
        stages: [
            'Você interroga um alvo com uma pressão que atravessa a mente. Faça um teste de Interrogação contra a Resistência Mental do alvo: se vencer, ele responde com sinceridade a uma pergunta sua.',
            'O alvo responde a duas perguntas e, se tentar mentir, sofre 3d6 de dano psíquico.',
            'O alvo responde a três perguntas e, se tentar mentir, sofre 5d6 de dano psíquico. Se você vencer por 5 ou mais, também pode dar uma ordem simples (Pare, Largue, Recue) que ele cumpre no próximo turno dele.'
        ]
    },
    {
        id: 'seed-car-discurso-inflamado',
        element: 'FOGO',
        name: 'Discurso Inflamado',
        level: 3,
        mpCost: 7,
        type: 'Ataque (sustentado)',
        execution: 'Padrão',
        range: 'Médio',
        stages: [
            'Você inicia um discurso que incendeia a plateia: inimigos em uma área de 3m de raio, escolhida dentro do alcance, sofrem 3d6 de dano de fogo. Enquanto você pagar metade do custo de MP a cada turno, como ação livre, o discurso continua e causa o mesmo dano aos inimigos na área no início de cada turno seu.',
            'A área passa a 4,5m e o discurso causa 4d6 de dano de fogo. Aliados na área recebem +2 nas jogadas de ataque.',
            'A área passa a 6m e o discurso causa 5d6 de dano de fogo. Aliados na área recebem bônus nas jogadas de ataque igual ao seu modificador de CAR e o dano dos ataques deles aumenta em +2.'
        ]
    },
    {
        id: 'seed-car-voz-emprestada',
        element: 'NÃO-ELEMENTAL',
        name: 'Voz Emprestada',
        level: 3,
        mpCost: 6,
        type: 'Suporte (imediato)',
        execution: 'Reação',
        range: 'Médio',
        stages: [
            'Quando um aliado em alcance fizer um teste de perícia baseada em CAR, você empresta a sua presença a ele: o aliado soma o seu modificador de CAR ao resultado. Só pode ser usada uma vez por turno.',
            'Funciona em qualquer teste de perícia de um aliado em alcance, e ele soma o seu modificador de CAR ao resultado. Só pode ser usada uma vez por turno.',
            'Funciona em qualquer teste de perícia ou jogada de ataque de um aliado em alcance, e ele soma o seu modificador de CAR mais 2 ao resultado. Só pode ser usada uma vez por turno.'
        ]
    },
    {
        id: 'seed-car-canto-de-sereia',
        element: 'ÁGUA',
        name: 'Canto de Sereia',
        level: 3,
        mpCost: 6,
        type: 'Controle (conjurado)',
        execution: 'Completa',
        range: 'Médio',
        stages: [
            'Você entoa uma canção sedutora, mas a magia só é executada no seu próximo turno: nesse momento, inimigos em 6m de raio do ponto escolhido fazem um teste de Resistência Mental contra o seu teste de Persuasão e, quem falhar, caminha até você e perde a ação Padrão naquele turno.',
            'O raio passa a 9m. Quem falhar também fica sem Reação até o início do turno seguinte.',
            'O raio passa a 12m e quem falhar perde a ação Padrão e a ação de Movimento naquele turno. Se você vencer por 5 ou mais contra um alvo, ele também sofre 4d6 de dano psíquico.'
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // NÍVEL 4 (o 3º estágio é a Maestria)
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'seed-car-tregua-forcada',
        element: 'LUZ',
        name: 'Trégua Forçada',
        level: 4,
        mpCost: 11,
        type: 'Controle (contínuo)',
        execution: 'Completa',
        range: 'Longo',
        stages: [
            'Você impõe uma trégua sobre o campo: criaturas em 9m de raio do ponto escolhido fazem um teste de Resistência Mental contra o seu teste de Diplomacia. Quem falhar não pode atacar por 2 turnos, a menos que seja atacado primeiro, e então a trégua termina para essa criatura. Aliados podem abrir mão do teste.',
            'O raio passa a 12m e a trégua dura 3 turnos. Quem falhar também não pode conjurar magias ofensivas.',
            'O raio passa a 15m e a trégua dura 4 turnos. Quem falhar também tem o deslocamento reduzido à metade e você pode encerrar a trégua quando quiser, como ação livre.'
        ]
    },
    {
        id: 'seed-car-majestade-radiante',
        element: 'RADIAÇÃO',
        name: 'Majestade Radiante',
        level: 4,
        mpCost: 12,
        type: 'Encantamento (contínuo)',
        execution: 'Padrão',
        range: 'Pessoal',
        stages: [
            'Uma coroa de brilho radioativo surge sobre você por 3 turnos. Inimigos que quiserem atacar você fazem um teste de Resistência Mental contra o seu teste de Intimidação; quem falhar sofre 2d6 de dano de radiação e escolhe outro alvo ou perde a ação. Aliados a até 9m recebem +3 nas jogadas de ataque e de resistência.',
            'A coroa dura 4 turnos e o bônus dos aliados passa a ser igual ao dobro do seu modificador de CAR (mínimo +5).',
            'A coroa dura 5 turnos e o bônus dos aliados passa a ser igual ao triplo do seu modificador de CAR (mínimo +8). Uma vez por turno, você pode dar uma ordem a um aliado em alcance, como ação livre: ele realiza imediatamente uma ação de Movimento.'
        ]
    },
    {
        id: 'seed-car-ultima-palavra',
        element: 'VÁCUO',
        name: 'Última Palavra',
        level: 4,
        mpCost: 10,
        type: 'Anulação (imediato)',
        execution: 'Reação',
        range: 'Longo',
        stages: [
            'Quando um inimigo em alcance conjurar uma magia de nível 2 ou inferior, você o interrompe com um argumento sem resposta. Faça um teste de Persuasão contra a Resistência Mental do conjurador: se vencer, a magia é anulada e ele fica com Silenciamento por 1 turno.',
            'Funciona contra magias de nível 3 ou inferior e o Silenciamento dura 2 turnos.',
            'Funciona contra qualquer magia. Se você vencer, a magia é anulada, o conjurador fica com Silenciamento por 3 turnos e você recupera MP igual ao seu modificador de CAR.'
        ]
    },
    {
        id: 'seed-car-dominio-carismatico',
        element: 'TREVAS',
        name: 'Domínio Carismático',
        level: 4,
        mpCost: 12,
        type: 'Controle (sustentado)',
        execution: 'Completa',
        range: 'Médio',
        stages: [
            'Você domina a vontade de uma criatura com uma presença esmagadora. Faça um teste de Persuasão ou Intimidação contra a Resistência Mental do alvo: se vencer, você controla as ações dele no turno dele. Para manter o domínio, pague metade do custo de MP a cada turno, como ação livre; ele termina se você parar de pagar ou perder a concentração, ou se o alvo passar em uma nova Resistência Mental, feita sempre que ele sofrer dano.',
            'Você pode dominar até dois alvos e eles não percebem que estão sendo controlados.',
            'Você pode dominar até três alvos. Eles só repetem a Resistência Mental se sofrerem de uma vez dano igual ou maior que 20% do LP máximo e recebem +2 nas jogadas de ataque enquanto dominados.'
        ]
    }
]
