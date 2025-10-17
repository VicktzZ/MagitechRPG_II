/* eslint-disable max-len */
import type { Item } from '@types';

export const defaultItems: Record<'cientificos' | 'magicos', Item[]> = {
    cientificos: [
        {
            name: 'Gancho',
            rarity: 'Comum',
            kind: 'Utilidade',
            description: 'Um gancho que pode ser usado para enrolar, enroscar, prender, asfixiar, pendurar etc.',
            weight: 1,
            quantity: 1
        },
        {
            name: 'Corrente',
            rarity: 'Comum',
            kind: 'Utilidade',
            description: 'Uma corrente de 10m muito mais resistente que a corda. Pode ser usada para enrolar, enroscar, prender, asfixiar, pendurar etc.',
            weight: 1.2,
            quantity: 1
        },
        {
            name: 'Corda',
            rarity: 'Comum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Com uma corda você pode descer em segurança de qualquer edifício que tenha até 25m de altura.',
            weight: 0.5
        },
        {
            name: 'Barbante',
            rarity: 'Comum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Mais fraco que a corda, porém mais longo.',
            weight: 0.2
        },
        {
            name: 'Ferramenta ou Bugiganga',
            rarity: 'Comum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Uma ferramenta qualquer que dependendo de seu propósito, lhe dá +5 pontos bônus para passar no teste. Levantar um carro com um macaco hidráulico é um exemplo disto.',
            weight: 1
        },
        {
            name: 'Granada de Fragmentação',
            rarity: 'Comum',
            kind: 'Padrão',
            quantity: 1,
            description: 'Uma granada de fragmentação que explode em um raio de 6m, causando 4d10 de dano. Explode parede e pequenas estruturas.',
            weight: 0.6
        },
        {
            name: 'Bomba de Fumaça',
            rarity: 'Comum',
            kind: 'Padrão',
            quantity: 1,
            description: 'Uma granada que quando entra em contato com o chão cria uma cortina de fumaça de 6m por 1 turno (ou 1min caso esteja fora de combate)',
            weight: 0.5
        },
        {
            name: 'Granada de Gravidade Zero',
            rarity: 'Comum',
            kind: 'Padrão',
            quantity: 1,
            description: 'Granada de gravidade zero que ao entrar em contato em uma superfície cria uma pequena área de 4,5m onde todos que estiverem nela levitam, ganhando desvantagens.',
            weight: 0.5
        },
        {
            name: 'Granada de Luz',
            rarity: 'Comum',
            kind: 'Padrão',
            quantity: 1,
            description: 'Uma granada que cega alvos presentes em um raio de 4,5m por 1 turno (ou 1min caso esteja fora de combate)',
            weight: 0.5
        },
        {
            name: 'Granada de Detecção',
            rarity: 'Comum',
            kind: 'Padrão',
            quantity: 1,
            description: 'Uma granada que revela inimigos através de superfícies em um raio de 6m por 1 turno (ou 30s caso esteja fora de combate). Caso você ainda não esteja em combate, com esta granada você será o primeiro a sair na iniciativa, independentemente da sua agilidade e você tem um dado extra (jogada com vantagem) em sua primeira ação contra qualquer inimigo que foi revelado pela granada. Em combate, caso o inimigo esteja atrás de uma cobertura ou furtivo, você o encontra e tem +5 pontos em sua próxima ação contra ele.',
            weight: 0.5
        },
        {
            name: 'Inibidor',
            rarity: 'Comum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Um dispositivo plástico em formato de placa que pode ser colocado em qualquer superfície para mutar completamente o som do cômodo enquanto funcionar. Pode ser útil para muitas coisas, mas principalmente furtividade. O efeito se perdura até alguém o remover da superfície ou até ele ser quebrado. Em combate dura 3 turnos.',
            weight: 1
        },  
        {
            name: 'Raio-X Wireless',
            rarity: 'Comum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Um dispositivo plástico parecido com um roteador que ao ser colocado em uma superfície, através dela, revela todo o cômodo do outro lado enquanto estiver funcionando. Caso você o tire da superfície, seu efeito se anulará.',
            weight: 0.8
        },
        {
            name: 'Coquetel Molotov',
            rarity: 'Comum',
            kind: 'Padrão',
            quantity: 1,
            description: 'Um simples e improvisado coquetel molotov que ao explodir, causa 2d10 de dano de fogo em um raio de 3m além de causar queimaduras simples (2d6 de dano por 2 turnos) a qualquer um que esteja na área.',
            weight: 0.5
        },
        {
            name: 'Anulador de Suporte de Vida',
            rarity: 'Comum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Um dispositivo similar a uma broca que ao ser colocado em uma superfície, caso o cômodo do lado oposto à superfície esteja lacrado e fechado, tira o oxigênio e a gravidade, selando-o a vácuo e matando toda e qualquer forma de vida presente neste cômodo. O oxigênio e a gravidade voltam caso você tire o dispositivo da superfície.',
            weight: 2
        },
        {
            name: 'NFTS Portátil',
            rarity: 'Comum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Um minissistema NFTS portátil que te possibilita a manipulação de magia mesmo se o alcance ou o sistema NTFS estiver offline.',
            weight: 1
        },
        {
            name: 'C4',
            rarity: 'Comum',
            kind: 'Padrão',
            quantity: 1,
            description: 'Um explosivo plástico que pode ser colocado em qualquer superfície para causar 6d8 de dano. Explode pequenas e médias estruturas como paredes reforçadas ou de metal, veículos, entre outros.',
            weight: 0.6
        },
        {
            name: 'Escuta',
            rarity: 'Comum',
            kind: 'Padrão',
            quantity: 1,
            description: 'Um pequeno dispositivo que se encaixa em sua orelha que enquanto estiver no mesmo provedor de sinal, consegue providenciar comunicação com qualquer um que esteja na mesma rede que você.',
            weight: 0.1
        },
        {
            name: 'Controlador Wireless',
            rarity: 'Comum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Um dispositivo touchscreen com uma espessura de um papel que pode ser instalado em seu pulso ou antebraço para controlar e manipular todo e qualquer equipamento que esteja em alguma rede ou que transmita algum sinal. Dependendo do que se quiser tirar proveito com este equipamento, é necessário ter a habilidade "Hacking" e/ou um teste de Tecnologia de DT proporcional a atividade desejada.',
            weight: 0.7
        },
        {
            name: 'Rastreador',
            rarity: 'Comum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Um pequeno dispositivo plástico que pode ser colocado em qualquer superfície para mostrar a localização em tempo real a onde ele foi colocado.',
            weight: 0.1
        },
        {
            name: 'Bolsa',
            rarity: 'Comum',
            kind: 'Capacidade',
            quantity: 1,
            description: 'Aumenta sua capacidade total em +1Kg e você pode colocar um item de médio porte que deseja na bolsa para sacá-lo como ação livre quando em combate.',
            weight: 1
        },
        {
            name: 'Kit Médico',
            rarity: 'Comum',
            kind: 'Consumível',
            quantity: 1,
            description: 'Quando utilizado, cura o alvo em 3d6+2 pontos de vida (LP).',
            weight: 0.5
        },
        {
            name: 'Mochila Pequena',
            rarity: 'Comum',
            kind: 'Capacidade',
            quantity: 1,
            description: 'Aumenta sua capacidade total em +2.5Kg.',
            weight: 2.5
        },
        {
            name: 'Mochila Média',
            rarity: 'Comum',
            kind: 'Capacidade',
            quantity: 1,
            description: 'Aumenta sua capacidade total em +5Kg',
            weight: 5
        },
        {
            name: 'Mochila Grande',
            rarity: 'Comum',
            kind: 'Capacidade',
            quantity: 1,
            description: 'Aumenta sua capacidade total em +7.5Kg.',
            weight: 7.5
        },
        {
            name: 'Mochila Extra Grande',
            rarity: 'Comum',
            kind: 'Capacidade',
            quantity: 1,
            description: 'Aumenta sua capacidade total em +12.5Kg e oferece.',
            weight: 12.5
        }
    ],
    magicos: [
        {
            name: 'Pedra de Mana',
            rarity: 'Comum',
            kind: 'Utilidade',
            description: 'Utensílio mágico que, quando portado, aumenta a mana máxima (MP) em +5 (limite de 20 pedras por inventário (+100MP extras)).',
            weight: 0.2,
            quantity: 1
        },
        {
            name: 'ORMA',
            rarity: 'Raro',
            kind: 'Especial',
            description: 'Objeto de Ressonância Mágica Avançada, é uma variante de ORM que pode ser adquirida para aumentar danos ou curas de magias em: \n\n+2 no Nível 1 de ORM;\n+4 no Nível 2 de ORM;\n+6 no Nível 3 de ORM;\n+8 no Nível 4 de ORM;',
            weight: 1.5,
            quantity: 1
        },
        {
            name: 'ORMC',
            rarity: 'Raro',
            kind: 'Especial',
            description: 'Objeto Receptor de Magia Conjurada, é uma variante de ORM que pode ser adquirida para conjurar magias de ação completa com uma ação padrão. (Não pode ser acumulado com outros tipos de ORM\'s)',
            weight: 1.5,
            quantity: 1
        },
        {
            name: 'AVORM',
            rarity: 'Raro',
            kind: 'Especial',
            description: 'Ajuste de Velocidade para Objeto Receptor de Magia, é uma variante de ORM que pode ser adquirida para utilizar duas magias de ação livre no mesmo turno. Além disso, você também pode executar duas magias de ação de movimento no mesmo turno, mas caso faça isso, você irá perder sua ação de movimento do próximo turno e não poderá se esquivar de ataques até o seu turno seguinte.',
            weight: 1.5,
            quantity: 1
        },
        {
            name: 'MEORM',
            rarity: 'Raro',
            kind: 'Especial',
            description: 'Modificação Elemental para Objeto Receptor de Magia, é uma variante de ORM que pode ser adquirida para adicionar dano ou cura a magias que utilizem da sua Maestria Elemental:\n\n+5 no nível 2 de ORM;\n+8 no nível 3 de ORM;\n+12 no nível 4 de ORM\n\nEntretanto, caso você conjure uma magia que NÃO seja de sua Maestria Elemental, você sofre -5 de chance de acerto, e gasta +2 MP adicionais.',
            weight: 1.2,
            quantity: 1
        },
        {
            name: 'Visor Arcano',
            rarity: 'Comum',
            kind: 'Utilidade',
            description: 'Uma microlente mágica que ao ser equipada nos olhos aumenta o bônus de Magia em +2.',
            weight: 0.1,
            quantity: 1
        },
        {
            name: 'Memória RAM DDR9 para ORM',
            rarity: 'Raro',
            kind: 'Utilidade',
            description: 'Aprimora o tipo da memória RAM do seu ORM, fazendo o conseguir guardar mais códigos mágicos por vez (Você ganha +2 pontos de magia e +4 espaços para magias adicionais).',
            weight: 0.8,
            quantity: 1
        },
        {
            name: 'Inibidor Mágico',
            rarity: 'Raro',
            kind: 'Utilidade',
            description: 'Dispositivo que, quando colocado em uma superfície, inibe qualquer magia em um raio de 9m até que alguém o tire de lá, ou o quebre, ou durante 3 turnos.',
            weight: 1.0,
            quantity: 1
        },
        {
            name: 'Dispositivo de Drenagem de Mana (DDM)',
            rarity: 'Raro',
            kind: 'Utilidade',
            description: 'Um dispositivo que quando colocado em alguém, drena 3 MP a cada turno do oponente e repassa para quem colocou o dispositivo no adversário.',
            weight: 0.5,
            quantity: 1
        },
        {
            name: 'Kit Mágico',
            rarity: 'Comum',
            kind: 'Consumível',
            description: 'Quando utilizado, cura o alvo em 3d8 pontos de mana (MP).',
            weight: 0.5,
            quantity: 1
        }
    ] 
}

export const defaultItem: Item = {
    name: '',
    description: '',
    rarity: 'Comum',
    weight: 0,
    quantity: 1,
    kind: 'Padrão'
}