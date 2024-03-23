/* eslint-disable max-len */
import type { Item, Lineage, Weapon } from '@types';

export const lineageItems: Record<Lineage['name'], Array<(Item | Weapon<'Leve' | 'Pesada'>) & { type: 'weapon' | 'armor' | 'item' }>> = {
    'Órfão': [
        {
            name: 'Pelúcia mágica',
            description: 'Te dá +5 MP (Pode ser qualquer animal ou objeto e você pode dar um nome a ele).\nObtido pela linhagem: Órfão',
            kind: 'Especial',
            type: 'item',
            weight: 0,
            effects: [ '+5 MP adicionados.' ]
        }
    ],
    'Infiltrado': [
        {
            name: 'Luneta',
            description: 'Permite enxergar qualquer coisa em até 90m de distância.\nObtido pela linhagem: Infiltrado',
            kind: 'Utilidade',
            type: 'item',
            weight: 0.2,
            effects: [ 'Pode enxergar alvos em até 90m.' ]
        },
        {
            name: 'Bomba de fumaça',
            description: 'Uma granada que quando entra em contato com o chão cria uma cortina de fumaça de 6m por 1 turnos (ou 1min caso esteja fora de combate).\nObtido pela linhagem: Infiltrado',
            kind: 'Utilidade',
            type: 'item',
            weight: 0.5,
            effects: [ 'Levanta uma cortina de fumaça em uma área de 6m.' ]
        }
    ],
    'Estrangeiro': [
        {
            name: 'Livro de Conhecimento',
            description: 'Com ele, como ação livre, você pode entender e falar todas as línguas, identificar magias, identificar criaturas e elementos e consegue passar por todas as provas da UFEM instantaneamente.\nObtido pela linhagem: Estrangeiro.',
            kind: 'Especial',
            type: 'item',
            effects: [ 'Você pode passar por todas as provas da UFEM como Ação Livre.' ],
            weight: 0.3
        }
    ],
    'Camponês': [
        {
            name: 'Ticket de Desconto',
            description: 'Onde você apresentar este item, sua compra sempre sai com 25% de desconto.\nObtido pela linhagem: Camponês',
            kind: 'Especial',
            type: 'item',
            weight: 0,
            effects:  [ '+25% de Desconto em qualquer compra.' ]
        }
    ],
    'Burguês': [
        {
            name: 'Ticket de Emergência',
            description: 'Ao utilizar este item você obeterá +¥200 000.\nObtido pela linhagem: Burguês',
            kind: 'Consumível',
            type: 'item',
            weight: 0,
            effects: [ '+¥200 000 ao utilizar.' ]
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
                value: '3d6',
                critValue: '6d6',
                critChance: 20,
                kind: 'damage',
                effectType: 'Impactante'
            }
        }
    ],
    'Ginasta': [
        {
            name: 'Pulseira Mágica',
            description: 'Você ganha +3 LP e ataques corpo-a-corpo aumentam seu dano em +2.\nObtido pela linhagem: Ginasta',
            kind: 'Especial',
            type: 'item',
            effects: [ '+3 LP adicionados', '+2 dano em ataques corpo-a-corpo.' ],
            weight: 0
        }
    ],
    'Herdeiro': [
        {
            name: ': Uma Limosine e um Jatinho Particular',
            description: 'Você pode solicitá-los pelo seu celular a qualquer momento. Eles virão buscá-lo dependendo do local ao critério do Mestre.\nObtido pela linhagem: Herdeiro',
            kind: 'Especial',
            type: 'item',
            effects: [ 'Receba uma limosine e um jatinho particular.' ],
            weight: 0
        }
    ],
    'Cobaia': [
        {
            name: 'Anel Mágico',
            description: 'Você aprende +2 magias no início do jogo.\nObtido pela linhagem: Cobaia',
            kind: 'Especial',
            type: 'item',
            effects: [ '+2 magias.' ],
            weight: 0
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
                value: '3d6',
                critValue: '6d6',
                critChance: 20,
                kind: 'damage',
                effectType: 'Impactante'
            }
        }
    ],
    'Hacker': [
        {
            name: 'Escuta',
            description: 'Um pequeno dispositivo que se encaixa em sua orelha que enquanto estiver no mesmo provedor de sinal, consegue providenciar comunicação com qualquer um que esteja na mesma rede que você.\nObtido pela linhagem: Hacker',
            kind: 'Utilidade',
            type: 'item',
            weight: 0.1,
            effects: [ 'Permite a comunicação à distância.' ]
        },
        {
            name: 'Controlador Wireless',
            description: 'Um dispositivo touchscreen com uma espessura de um papel que pode ser instalado em seu pulso ou antebraço para controlar e manipular todo e qualquer equipamento que esteja em alguma rede ou que transmita algum sinal. Dependendo do que se quiser tirar proveito com este equipamento, é necessário ter a habilidade “Hacking” e/ou um teste de Tecnologia de DT proporcional a atividade desejada.\nObtido pela linhagem: Hacker',
            kind: 'Utilidade',
            type: 'item',
            weight: 0.7,
            effects: [ 'Permite o controle de dispositivos wireless remotamente.' ]
        }
    ],
    'Combatente': [
        {
            name: 'Revolver (energia)',
            description: 'Um porrete com espinhos.\nObtido pela linhagem: Combatente',
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
            }
        },
        {
            name: 'Bateria de lítio',
            description: 'Utilizado para recarregar a maioria das armas leves de energia.\nObtido pela linhagem: Combatente',
            kind: 'Munição',
            type: 'item',
            weight: 0.3,
            effects: [ 'Recarrega armas leves de energia.' ]
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
            effects: [ 'Cura o alvo em 3d6+2.' ]
        }
    ],
    'Aventureiro': [
        {
            name: 'Gancho',
            description: 'Gancho utilizado para escaladas. Com ele, você pode escalar qualquer lugar de até 20m de altura caso passe em um teste de Destreza de DT proporcional ao tamanho do obstáculo.\nObtido pela linhagem: Aventureiro',
            kind: 'Utilidade',
            type: 'item',
            weight: 2,
            effects: [ 'O gancho pode ser utilizado em distâncias de até 20m.' ]
        },
        {
            name: 'Mochila pequena',
            description: 'Mochila pequena.\nObtido pela linhagem: Aventureiro',
            kind: 'Capacidade',
            type: 'item',
            weight: 2.5,
            effects: [ '+2.5kg de capacidade de carga.' ]
        }
    ],
    'Trambiqueiro': [
        {
            name: 'Gazua eletrônica',
            description: 'Você pode arrombar qualquer fechadura ou sistema eletrônico de tranca desde que passe em um teste de Competência de DT proporcional ao alvo. Peso: 0.0Kg (item permanente)\nObtido pela linhagem: Trambiqueiro',
            kind: 'Utilidade',
            type: 'item',
            effects: [ 'Pode arrombar trancas eletrônicas ou não-eletrônicas.' ],
            weight: 0
        }
    ],
    'Prodígio': [
        {
            name: 'Amuleto do talento',
            description: 'Quando você for receber qualquer coisa (experiência, dinheiro, espólios etc.) você sempre receberá 1.1x a mais que o original.\nObtido pela linhagem: Prodígio',
            kind: 'Especial',
            type: 'item',
            weight: 0,
            effects: [ '+1.1x de EXP e dinheiro.' ]
        }
    ],
    'Novato': [
        {
            name: 'Dinheiro (¥30 000)',
            description: 'Ao utilizar este item você obeterá +¥30 000.\nObtido pela linhagem: Novato',
            kind: 'Consumível',
            type: 'item',
            weight: 0,
            effects: [ '+¥30 000 ao utilizar.' ]
        },
        {
            name: 'Mochila pequena',
            description: 'Mochila pequena.\nObtido pela linhagem: Aventureiro',
            kind: 'Capacidade',
            type: 'item',
            weight: 2.5,
            effects: [ '+2.5kg de capacidade de carga.' ]
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
            }
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
            level: 1
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
            }
        }
    ],
    'Pesquisador': [
        {
            name: 'Decodificador Mágico',
            description: 'Você pode decodificar e usar magias com este decodificador.\nObtido pela linhagem: Pesquisador',
            kind: 'Especial',
            type: 'item',
            weight: 0.2,
            effects: [ 'O decodificador tem uma memória que armazena até 5 magias decodificadas.' ]
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
            level: 0
        }
    ]
}