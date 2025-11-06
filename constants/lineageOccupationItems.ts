import type { Lineage, Occupation } from '@models'
import type { MergedItems } from '@models/types/misc'

/* eslint-disable max-len */
export const lineageItems: 
Record<
    Lineage['name'],
    Array<
        Partial<
            MergedItems<any>
        >
    >
> = {
    'Órfão': [
        {
            name: 'Pelúcia mágica',
            description: 'Te dá +5 MP (Pode ser qualquer animal ou objeto e você pode dar um nome a ele).\nObtido pela linhagem: Órfão',
            kind: 'Especial',
            type: 'item',
            weight: 0,
            effects: [ '+5 MP adicionados.' ],
            rarity: 'Comum'
        }
    ],
    'Infiltrado': [
        {
            name: 'Luneta',
            description: 'Permite enxergar qualquer coisa em até 90m de distância.\nObtido pela linhagem: Infiltrado',
            kind: 'Utilidade',
            type: 'item',
            weight: 0.2,
            effects: [ 'Pode enxergar alvos em até 90m.' ],
            rarity: 'Comum'
        },
        {
            name: 'Bomba de fumaça',
            description: 'Uma granada que quando entra em contato com o chão cria uma cortina de fumaça de 6m por 1 turnos (ou 1min caso esteja fora de combate).\nObtido pela linhagem: Infiltrado',
            kind: 'Utilidade',
            type: 'item',
            weight: 0.5,
            effects: [ 'Levanta uma cortina de fumaça em uma área de 6m.' ],
            rarity: 'Comum'
        }
    ],
    'Estrangeiro': [
        {
            name: 'Livro de Conhecimento',
            description: 'Com ele, como ação livre, você pode entender e falar todas as línguas, identificar magias, identificar criaturas e elementos e consegue passar por todas as provas da UFEM instantaneamente.\nObtido pela linhagem: Estrangeiro.',
            kind: 'Especial',
            type: 'item',
            effects: [ 'Você pode passar por todas as provas da UFEM como Ação Livre.' ],
            weight: 0.3,
            rarity: 'Comum'
        }
    ],
    'Camponês': [
        {
            name: 'Ticket de Desconto',
            description: 'Onde você apresentar este item, sua compra sempre sai com 25% de desconto.\nObtido pela linhagem: Camponês',
            kind: 'Especial',
            type: 'item',
            weight: 0,
            effects:  [ '+25% de Desconto em qualquer compra.' ],
            rarity: 'Comum'
        }
    ],
    'Burguês': [
        {
            name: 'Ticket de Emergência',
            description: 'Ao utilizar este item você obeterá +¥200 000.\nObtido pela linhagem: Burguês',
            kind: 'Consumível',
            type: 'item',
            weight: 0,
            effects: [ '+¥200 000 ao utilizar.' ],
            rarity: 'Comum'
        }
    ],
    'Artista': [
        {
            name: 'Instrumento',
            description: 'Um instrumento a sua escolha: Você pode tocá-lo como ação livre para tirar um alvo (1 vez por combate ou cena) de um dos seguintes estados: medo, controle mental, estresse ou descontrole, inconsciente ou coma, confuso e insano.\nObtido pela linhagem: Artista',
            categ: 'Arma Branca (Leve)',
            type: 'weapon',
            range: 'Corpo-a-corpo',
            hit: 'vig',
            ammo: 'Não consome',
            bonus: 'Luta',
            weight: 1,
            kind: 'Padrão',
            effect: {
                value: '3d6+1',
                critValue: '6d6+2',
                critChance: 20,
                kind: 'damage',
                effectType: 'Impactante'
            },
            rarity: 'Comum'
        }
    ],
    'Ginasta': [
        {
            name: 'Pulseira Mágica',
            description: 'Você ganha +3 LP e ataques corpo-a-corpo aumentam seu dano em +2.\nObtido pela linhagem: Ginasta',
            kind: 'Especial',
            type: 'item',
            effects: [ '+3 LP adicionados', '+2 dano em ataques corpo-a-corpo.' ],
            weight: 0,
            rarity: 'Comum'
        }
    ],
    'Herdeiro': [
        {
            name: ': Uma Limosine e um Jatinho Particular',
            description: 'Você pode solicitá-los pelo seu celular a qualquer momento. Eles virão buscá-lo dependendo do local ao critério do Mestre.\nObtido pela linhagem: Herdeiro',
            kind: 'Especial',
            type: 'item',
            effects: [ 'Receba uma limosine e um jatinho particular.' ],
            weight: 0,
            rarity: 'Comum'
        }
    ],
    'Cobaia': [
        {
            name: 'Anel Mágico',
            description: 'Você aprende +2 magias no início do jogo.\nObtido pela linhagem: Cobaia',
            kind: 'Especial',
            type: 'item',
            effects: [ '+2 magias.' ],
            weight: 0,
            rarity: 'Comum'
        }
    ],
    'Gangster': [
        {
            name: 'Porrete com espinhos',
            description: 'Um porrete com espinhos.\nObtido pela linhagem: Gangster',
            kind: 'Padrão',
            categ: 'Arma Branca (Leve)',
            range: 'Corpo-a-corpo',
            ammo: 'Não consome',
            bonus: 'Luta',
            hit: 'vig',
            type: 'weapon',
            weight: 1.4,
            effect: {
                value: '3d4',
                critValue: '6d4',
                critChance: 20,
                kind: 'damage',
                effectType: 'Perfurante'
            },
            rarity: 'Comum'
        }
    ],
    'Hacker': [
        {
            name: 'Escuta',
            description: 'Um pequeno dispositivo que se encaixa em sua orelha que enquanto estiver no mesmo provedor de sinal, consegue providenciar comunicação com qualquer um que esteja na mesma rede que você.\nObtido pela linhagem: Hacker',
            kind: 'Utilidade',
            type: 'item',
            weight: 0.1,
            effects: [ 'Permite a comunicação à distância.' ],
            rarity: 'Comum'
        },
        
        {
            name: 'Controlador Wireless',
            description: 'Um dispositivo touchscreen com uma espessura de um papel que pode ser instalado em seu pulso ou antebraço para controlar e manipular todo e qualquer equipamento que esteja em alguma rede ou que transmita algum sinal. Dependendo do que se quiser tirar proveito com este equipamento, é necessário ter a habilidade “Hacking” e/ou um teste de Tecnologia de DT proporcional a atividade desejada.\nObtido pela linhagem: Hacker',
            kind: 'Utilidade',
            type: 'item',
            weight: 0.7,
            effects: [ 'Permite o controle de dispositivos wireless remotamente.' ],
            rarity: 'Comum'
        }
    ],
    'Atirador': [
        {
            name: 'Revolver (energia)',
            description: 'Um revolver de energia que pode ser recarregado com baterias de lítio.\nObtido pela linhagem: Atirador',
            kind: 'Padrão',
            categ: 'Arma de Energia (Leve)',
            range: 'Médio (18m)',
            ammo: 'Bateria de lítio',
            bonus: 'Pontaria',
            hit: 'des',
            type: 'weapon',
            weight: 1.2,
            effect: {
                value: '3d4',
                critValue: '3d4',
                critChance: 19,
                kind: 'damage',
                effectType: 'Perfurante'
            },
            rarity: 'Comum'
        },
        {
            name: 'Bateria de lítio',
            description: 'Utilizado para recarregar a maioria das armas leves de energia.\nObtido pela linhagem: Atirador',
            kind: 'Munição',
            type: 'item',
            weight: 0.3,
            effects: [ 'Recarrega armas leves de energia.' ],
            rarity: 'Comum'
        }
    ],
    'Clínico': [
        {
            name: 'Kit médico',
            description: 'Kit de primeiro socorros.\nObtido pela linhagem: Clínico',
            kind: 'Utilidade',
            type: 'item',
            weight: 0.5,
            quantity: 2,
            effects: [ 'Cura o alvo em 3d6+2.' ],
            rarity: 'Comum'
        }
    ],
    'Aventureiro': [
        {
            name: 'Gancho',
            description: 'Gancho utilizado para escaladas. Com ele, você pode escalar qualquer lugar de até 20m de altura caso passe em um teste de Destreza de DT proporcional ao tamanho do obstáculo.\nObtido pela linhagem: Aventureiro',
            kind: 'Utilidade',
            type: 'item',
            weight: 2,
            effects: [ 'O gancho pode ser utilizado em distâncias de até 20m.' ],
            rarity: 'Comum'
        },
        {
            name: 'Mochila pequena',
            description: 'Mochila pequena.\nObtido pela linhagem: Aventureiro',
            kind: 'Capacidade',
            type: 'item',
            weight: 2.5,
            effects: [ '+2.5kg de capacidade de carga.' ],
            rarity: 'Comum'
        }
    ],
    'Trambiqueiro': [
        {
            name: 'Gazua eletrônica',
            description: 'Você pode arrombar qualquer fechadura ou sistema eletrônico de tranca desde que passe em um teste de Competência de DT proporcional ao alvo. Peso: 0.0Kg (item permanente)\nObtido pela linhagem: Trambiqueiro',
            kind: 'Utilidade',
            type: 'item',
            effects: [ 'Pode arrombar trancas eletrônicas ou não-eletrônicas.' ],
            weight: 0,
            rarity: 'Comum'
        }
    ],
    'Prodígio': [
        {
            name: 'Amuleto do talento',
            description: 'Quando você for receber qualquer coisa (experiência, dinheiro, espólios etc.) você sempre receberá 1.1x a mais que o original.\nObtido pela linhagem: Prodígio',
            kind: 'Especial',
            type: 'item',
            weight: 0,
            effects: [ '+1.1x de EXP e dinheiro.' ],
            rarity: 'Comum'
        }
    ],
    'Novato': [
        {
            name: 'Dinheiro (¥30 000)',
            description: 'Ao utilizar este item você obeterá +¥30 000.\nObtido pela linhagem: Novato',
            kind: 'Consumível',
            type: 'item',
            weight: 0,
            effects: [ '+¥30 000 ao utilizar.' ],
            rarity: 'Comum'
        },
        {
            name: 'Mochila pequena',
            description: 'Mochila pequena.\nObtido pela linhagem: Aventureiro',
            kind: 'Capacidade',
            type: 'item',
            weight: 2.5,
            effects: [ '+2.5kg de capacidade de carga.' ],
            rarity: 'Comum'
        }
    ],
    'Inventor': [
        {
            name: 'Chave inglesa',
            description: 'Uma chave inglesa.\nObtido pela linhagem: Inventor',
            kind: 'Padrão',
            categ: 'Arma Branca (Leve)',
            range: 'Corpo-a-corpo',
            ammo: 'Não consome',
            bonus: 'Luta',
            hit: 'des',
            type: 'weapon',
            weight: 0.8,
            effect: {
                value: '4d4',
                critValue: '8d8',
                critChance: 20,
                kind: 'damage',
                effectType: 'Impactante'
            },
            rarity: 'Comum'
        }
    ],
    'Idólatra': [
        {
            name: 'ORM Aprimorado',
            description: 'Você ganha +2 MP além de causar +1 de dano ou de cura com magias.\nObtido pela linhagem: Idólatra',
            kind: 'Especial',
            type: 'item',
            weight: 0,
            effects: [ '+2 MP', '+1 de ponto no efeito da magia.' ],
            level: 1,
            rarity: 'Comum'
        }
    ],
    'Cismático': [
        {
            name: 'Agulha de tungstênio',
            description: 'Uma agula de tungestênio personalizada com um chip mágico.\nObtido pela linhagem: Idólatra',
            kind: 'Arremessável (9m)',
            categ: 'Arma Branca (Leve)',
            range: 'Corpo-a-corpo',
            ammo: 'Não consome',
            bonus: 'Furtividade',
            accessories: [ 'Chip mágico' ],
            hit: 'des',
            type: 'weapon',
            weight: 0,
            effect: {
                value: '1d4',
                critValue: '6d4',
                critChance: 17,
                kind: 'damage',
                effectType: 'Perfurante'
            },
            rarity: 'Comum'
        }
    ],
    'Pesquisador': [
        {
            name: 'Decodificador Mágico',
            description: 'Você pode decodificar e usar magias com este decodificador.\nObtido pela linhagem: Pesquisador',
            kind: 'Especial',
            type: 'item',
            weight: 0.2,
            effects: [ 'O decodificador tem uma memória que armazena até 5 magias decodificadas.' ],
            rarity: 'Comum'
        }
    ],
    'Investigador': [
        {
            name: 'Lupa mágica',
            description: 'Você recebe +2 em testes de Percepção para encontrar pistas ou evidências.\nObtido pela linhagem: Investigador',
            kind: 'Especial',
            type: 'item',
            weight: 0,
            effects: [ '+2 em testes de Percepção para encontrar pistas ou evidências.' ],
            level: 0,
            rarity: 'Comum'
        }
    ]
}

export const occupationItems: 
Record<
    Occupation['name'],
    Array<
        Partial<
            MergedItems<any>
        >
    >
> = {
    'Artista': [
        {
            name: 'Instrumento Musical',
            description: 'Um instrumento a sua escolha: Você pode tocá-lo como ação livre para tirar um alvo (1 vez por combate ou cena) de um dos seguintes estados: medo, controle mental, estresse ou descontrole, inconsciente ou coma, confuso e insano.\nObtido pela profissão: Artista',
            kind: 'Utilidade',
            type: 'item',
            weight: 0.5,
            effects: [ 'Um instrumento musical a sua escolha.' ],
            rarity: 'Especial'
        }
    ],

    'Médico': [
        {
            name: 'Kit médico',
            description: 'Kit Médico: Um conjunto de ferramentas básicas de primeiros socorros. Permite realizar um teste de Medicina para remover veneno, doença, ou efeitos debilitantes como cegueira ou paralisia.\nObtido pela profissão: Médico',
            kind: 'Utilidade',
            type: 'item',
            weight: 1.5,
            quantity: 1,
            effects: [ 'Cura o alvo em 3d6+2.' ],
            rarity: 'Especial'
        }
    ],

    'Militar': [
        {
            name: 'Arma de Serviço',
            description: 'Arma de Serviço: Escolha uma arma leve entre pistola, revólver, pistola tática e faca para adicionar em seu inventário. Esta arma tem +2 no dano em suas mãos.\nObtido pela profissão: Militar',
            kind: 'Utilidade',
            type: 'item',
            weight: 0,
            quantity: 1,
            effects: [ 'Uma arma leve entre pistola, revólver, pistola tática.' ],
            rarity: 'Especial'
        }
    ],

    'Mafioso': [
        {
            name: 'Canivete Disfarçado',
            description: 'Canivete Disfarçado: Uma arma pequena e discreta que ignora 2 pontos de armadura.\nObtido pela profissão: Mafioso',
            categ: 'Arma Branca (Leve)',
            type: 'weapon',
            range: 'Corpo-a-corpo',
            hit: 'des',
            ammo: 'Não consome',
            bonus: 'Agilidade',
            weight: 0.3,
            kind: 'Padrão',
            effect: {
                value: '1d6',
                critValue: '2d6',
                critChance: 20,
                kind: 'damage',
                effectType: 'Perfurante'
            },
            rarity: 'Especial'
        }
    ],

    'Cozinheiro': [
        {
            name: 'Faca de Cozinha',
            description: 'Faca de Cozinha: Uma arma improvisada que pode ser usada em combate.\nObtido pela profissão: Cozinheiro',
            categ: 'Arma Branca (Leve)',
            type: 'weapon',
            range: 'Corpo-a-corpo',
            hit: 'des',
            ammo: 'Não consome',
            bonus: 'Luta',
            weight: 0.5,
            kind: 'Padrão',
            effect: {
                value: '1d12',
                critValue: '2d12',
                critChance: 20,
                kind: 'damage',
                effectType: 'Cortante'
            },
            rarity: 'Especial'
        }
    ],

    'Inventor': [
        {
            name: 'Kit de Ferramentas',
            description: 'Kit de Ferramentas: Necessário para criar ou consertar dispositivos. Reduz a DT de Tecnologia em -1.\nObtido pela profissão: Inventor',
            kind: 'Utilidade',
            type: 'item',
            weight: 2,
            quantity: 1,
            effects: [ 'Necessário para criar ou consertar dispositivos. Reduz a DT de Tecnologia em -1.' ],
            rarity: 'Especial'
        }
    ],

    'Jardineiro': [
        {
            name: 'Ferramenta de Jardinagem',
            description: 'Ferramenta de Jardinagem: Uma pá ou enxada que também pode ser usada como arma improvisada (+1 de dano).\nObtido pela profissão: Jardineiro',
            type: 'item',
            weight: 2,
            kind: 'Utilidade',
            effects: [ 'Uma pá ou enxada que também pode ser usada como arma improvisada.' ],
            rarity: 'Especial'
        }
    ],

    'Programador': [
        {
            name: 'Notebook',
            description: 'Notebook: Permite realizar testes de Tecnologia com vantagem em sistemas eletrônicos.\nObtido pela profissão: Programador',
            type: 'item',
            weight: 1.5,
            kind: 'Utilidade',
            effects: [ 'Permite realizar testes de Tecnologia com vantagem em sistemas eletrônicos.' ],
            rarity: 'Especial'
        }
    ],

    'Cientista': [
        {
            name: 'Kit de Análise',
            description: 'Kit de Análise: Permite realizar testes de Investigação para identificar substâncias ou objetos desconhecidos.\nObtido pela profissão: Cientista',
            type: 'item',
            weight: 0.8,
            kind: 'Utilidade',
            effects: [ 'Permite realizar testes de Investigação para identificar substâncias ou objetos desconhecidos.' ],
            rarity: 'Especial'
        }
    ],

    'Pesquisador': [
        {
            name: 'Caderno de Anotações',
            description: 'Caderno de Anotações: Permite lembrar ou registrar informações importantes, concedendo +3 em testes de Investigação ou Conhecimento.',
            type: 'item',
            weight: 0.3,
            kind: 'Utilidade',
            effects: [ 'Permite lembrar ou registrar informações importantes, concedendo +3 em testes de Investigação ou Conhecimento.' ],
            rarity: 'Especial'
        }
    ],

    'Empresário': [
        {
            name: 'Relógio de Luxo',
            description: 'Relógio de Luxo: Um item que impressiona, concedendo +1d8 em testes de Persuasão quando exibido.\nObtido pela profissão: Empresário',
            type: 'item',
            weight: 0.2,
            kind: 'Utilidade',
            effects: [ 'Um item que impressiona, concedendo +1d8 em testes de Persuasão quando exibido.' ],
            rarity: 'Especial'
        }
    ],

    'Professor': [
        {
            name: 'Manual Didático',
            description: 'Manual Didático: Um livro ou guia prático que concede +2 em testes de Conhecimento relacionados a um tema específico.\nObtido pela profissão: Professor',
            type: 'item',
            weight: 0.8,
            kind: 'Utilidade',
            effects: [ 'Um livro ou guia prático que concede +2 em testes de Conhecimento relacionados a um tema específico.' ],
            rarity: 'Especial'
        }
    ],
    
    'Político': [
        {
            name: 'Broche de Autoridade',
            description: 'Broche de Autoridade: Um acessório que reforça sua credibilidade, concedendo +1d10 em testes de Liderança ou Persuasão.\nObtido pela profissão: Político',
            type: 'item',
            weight: 0.1,
            kind: 'Utilidade',
            effects: [ 'Um acessório que reforça sua credibilidade, concedendo +1d10 em testes de Liderança ou Persuasão.' ],
            rarity: 'Especial'
        }
    ],

    'Criminoso': [
        {
            name: 'Kit de Arrombamento',
            description: 'Kit de Arrombamento: Ferramentas simples que facilitam testes de Ladinagem para abrir fechaduras (Diminui a DT em -1).\nObtido pela profissão: Criminoso',
            type: 'item',
            weight: 0.6,
            kind: 'Utilidade',
            effects: [ 'Ferramentas simples que facilitam testes de Ladinagem para abrir fechaduras (Diminui a DT em -1).' ],
            rarity: 'Especial'
        }
    ],

    'Engenheiro': [
        {
            name: 'Chave Inglesa',
            description: 'Chave Inglesa: Ferramenta robusta que também pode ser usada como arma improvisada (+1 de dano).\nObtido pela profissão: Engenheiro',
            categ: 'Arma Branca (Leve)',
            type: 'weapon',
            range: 'Corpo-a-corpo',
            hit: 'vig',
            ammo: 'Não consome',
            bonus: 'Luta',
            weight: 2,
            kind: 'Padrão',
            effect: {
                value: '2d6+1',
                critValue: '4d6+2',
                critChance: 20,
                kind: 'damage',
                effectType: 'Impactante'
            },
            rarity: 'Especial'
        }
    ],

    'Mecânico': [
        {
            name: 'Caixa de Ferramentas',
            description: 'Caixa de Ferramentas: Reduz a dificuldade de testes de Tecnologia relacionados a reparos (-1 na DT).\nObtido pela profissão: Mecânico',
            type: 'item',
            weight: 2,
            kind: 'Utilidade',
            effects: [ 'Reduz a dificuldade de testes de Tecnologia relacionados a reparos (-1 na DT).' ],
            rarity: 'Especial'
        }
    ],

    'Autônomo': [
        {
            name: 'Ferramenta Multifuncional',
            description: 'Ferramenta Multifuncional: Uma ferramenta versátil que pode ser usada para reparos simples ou improvisações.\nObtido pela profissão: Autônomo',
            type: 'item',
            weight: 1,
            kind: 'Utilidade',
            effects: [ 'Uma ferramenta versátil que pode ser usada para reparos simples ou improvisações.' ],
            rarity: 'Especial'
        }
    ],

    'Atleta': [
        {
            name: 'Tênis de Alta Performance',
            description: 'Tênis de Alta Performance: Reduz o gasto de movimento em terrenos difíceis. (Você não sofre penalidades ao estar em terrenos acidentados)\nObtido pela profissão: Atleta',
            type: 'item',
            weight: 0.4,
            kind: 'Utilidade',
            effects: [ 'Reduz o gasto de movimento em terrenos difíceis. ( Vocé não sofre penalidades ao estar em terrenos acidentados).' ],
            rarity: 'Especial'
        }
    ],

    'Detetive': [
        {
            name: 'Caderno de Investigação',
            description: 'Caderno de Investigação: Auxilia na organização de pistas, concedendo +1d8 em testes de Investigação.\nObtido pela profissão: Detetive',
            type: 'item',
            weight: 0.2,
            kind: 'Utilidade',
            effects: [ 'Auxilia na organização de pistas, concedendo +1d8 em testes de Investigação.' ],
            rarity: 'Especial'
        }
    ],

    'Sucateiro': [
        {
            name: 'Binóculos',
            description: 'Binóculos: Permite enxergar detalhes em longa distância, concedendo vantagem em testes de Percepção para localizar algo.\nObtido pela profissão: Sucateiro',
            type: 'item',
            weight: 0.2,
            kind: 'Utilidade',
            effects: [ 'Permite enxergar detalhes em longa distância, concedendo vantagem em testes de Percepção para localizar algo.' ],
            rarity: 'Especial'
        }
    ],

    'Caçador': [
        {
            name: 'Arco curto',
            description: 'Arco curto: Uma arma simples a longa distância.\nObtido pela profissão: Caçador',
            categ: 'Arma Branca (Leve)',
            type: 'weapon',
            range: 'Médio (18m)',
            hit: 'des',
            ammo: 'Flecha',
            bonus: 'Pontaria',
            weight: 1,
            kind: 'Padrão',
            effect: {
                value: '1d10',
                critValue: '2d10',
                critChance: 20,
                kind: 'damage',
                effectType: 'Perfurante'
            },
            rarity: 'Especial'
        }
    ],

    'Clérigo': [
        {
            name: 'Relíquia Sagrada',
            description: 'Relíquia Sagrada: Um artefato que causa dano extra (1d6) contra criaturas de Trevas.\nObtido pela profissão: Clérigo',
            type: 'item',
            weight: 1,
            kind: 'Utilidade',
            effects: [ 'Um artefato que causa dano extra (1d6) contra criaturas de Trevas.' ],
            rarity: 'Especial'
        }
    ],

    'Desempregado': [
        {
            name: 'Amuleto da Sorte',
            description: 'Amuleto da Sorte: Permite rolar novamente um teste falhado uma vez por dia.\nObtido pela profissão: Desempregado',
            type: 'item',
            weight: 0.2,
            kind: 'Utilidade',
            effects: [ 'Permite rolar novamente um teste falhado uma vez por dia.' ],
            rarity: 'Especial'
        }
    ]
}