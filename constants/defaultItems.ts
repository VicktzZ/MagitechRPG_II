/* eslint-disable max-len */
import type { Item } from '@models';

export const defaultItems: Record<'scientific' | 'magical', Array<Partial<Item>>> = {
    scientific: [
        {
            name: 'Gancho',
            rarity: 'Comum',
            kind: 'Utilidade',
            description: 'Um gancho que pode ser usado para enrolar, enroscar, prender, asfixiar, pendurar etc.',
            weight: 1,
            quantity: 1,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Corrente',
            rarity: 'Comum',
            kind: 'Utilidade',
            description: 'Uma corrente de 10m muito mais resistente que a corda. Pode ser usada para enrolar, enroscar, prender, asfixiar, pendurar etc.',
            weight: 1.2,
            quantity: 1,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Corda',
            rarity: 'Comum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Com uma corda você pode descer em segurança de qualquer edifício que tenha até 25m de altura.',
            weight: 0.5,
            rogueliteRarity: 'Comum'
        },
        {
            name: 'Barbante',
            rarity: 'Comum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Mais fraco que a corda, porém mais longo.',
            weight: 0.2,
            rogueliteRarity: 'Comum'
        },
        {
            name: 'Ferramenta ou Bugiganga',
            rarity: 'Comum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Uma ferramenta qualquer que dependendo de seu propósito, lhe dá +5 pontos bônus para passar no teste. Levantar um carro com um macaco hidráulico é um exemplo disto.',
            weight: 1,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Granada de Fragmentação',
            rarity: 'Comum',
            kind: 'Arremessável',
            quantity: 1,
            description: 'Uma granada de fragmentação que explode em um raio de 6m, causando 4d10 de dano. Explode parede e pequenas estruturas.',
            weight: 0.6,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Bomba de Fumaça',
            rarity: 'Comum',
            kind: 'Arremessável',
            quantity: 1,
            description: 'Uma granada que quando entra em contato com o chão cria uma cortina de fumaça de 6m por 1 turno (ou 1min caso esteja fora de combate)',
            weight: 0.5,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Granada de Gravidade Zero',
            rarity: 'Comum',
            kind: 'Arremessável',
            quantity: 1,
            description: 'Granada de gravidade zero que ao entrar em contato em uma superfície cria uma pequena área de 4,5m onde todos que estiverem nela levitam, ganhando desvantagens.',
            weight: 0.5,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Granada de Luz',
            rarity: 'Comum',
            kind: 'Arremessável',
            quantity: 1,
            description: 'Uma granada que cega alvos presentes em um raio de 4,5m por 1 turno (ou 1min caso esteja fora de combate)',
            weight: 0.5,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Granada de Detecção',
            rarity: 'Comum',
            kind: 'Arremessável',
            quantity: 1,
            description: 'Uma granada que revela inimigos através de superfícies em um raio de 6m por 1 turno (ou 30s caso esteja fora de combate). Caso você ainda não esteja em combate, com esta granada você será o primeiro a sair na iniciativa, independentemente da sua agilidade e você tem um dado extra (jogada com vantagem) em sua primeira ação contra qualquer inimigo que foi revelado pela granada. Em combate, caso o inimigo esteja atrás de uma cobertura ou furtivo, você o encontra e tem +5 pontos em sua próxima ação contra ele.',
            weight: 0.5,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Inibidor',
            rarity: 'Comum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Um dispositivo plástico em formato de placa que pode ser colocado em qualquer superfície para mutar completamente o som do cômodo enquanto funcionar. Pode ser útil para muitas coisas, mas principalmente furtividade. O efeito se perdura até alguém o remover da superfície ou até ele ser quebrado. Em combate dura 3 turnos.',
            weight: 1,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Raio-X Wireless',
            rarity: 'Comum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Um dispositivo plástico parecido com um roteador que ao ser colocado em uma superfície, através dela, revela todo o cômodo do outro lado enquanto estiver funcionando. Caso você o tire da superfície, seu efeito se anulará.',
            weight: 0.8,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Coquetel Molotov',
            rarity: 'Comum',
            kind: 'Arremessável',
            quantity: 1,
            description: 'Um simples e improvisado coquetel molotov que ao explodir, causa 2d10 de dano de fogo em um raio de 3m além de causar queimaduras simples (2d6 de dano por 2 turnos) a qualquer um que esteja na área.',
            weight: 0.5,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Anulador de Suporte de Vida',
            rarity: 'Comum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Um dispositivo similar a uma broca que ao ser colocado em uma superfície, caso o cômodo do lado oposto à superfície esteja lacrado e fechado, tira o oxigênio e a gravidade, selando-o a vácuo e matando toda e qualquer forma de vida presente neste cômodo. O oxigênio e a gravidade voltam caso você tire o dispositivo da superfície.',
            weight: 2,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'NFTS Portátil',
            rarity: 'Comum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Um minissistema NFTS portátil que te possibilita a manipulação de magia mesmo se o alcance ou o sistema NTFS estiver offline.',
            weight: 1,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'C4',
            rarity: 'Comum',
            kind: 'Arremessável',
            quantity: 1,
            description: 'Um explosivo plástico que pode ser colocado em qualquer superfície para causar 6d8 de dano. Explode pequenas e médias estruturas como paredes reforçadas ou de metal, veículos, entre outros.',
            weight: 0.6,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Escuta',
            rarity: 'Comum',
            kind: 'Padrão',
            quantity: 1,
            description: 'Um pequeno dispositivo que se encaixa em sua orelha que enquanto estiver no mesmo provedor de sinal, consegue providenciar comunicação com qualquer um que esteja na mesma rede que você.',
            weight: 0.1,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Controlador Wireless',
            rarity: 'Comum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Um dispositivo touchscreen com uma espessura de um papel que pode ser instalado em seu pulso ou antebraço para controlar e manipular todo e qualquer equipamento que esteja em alguma rede ou que transmita algum sinal. Dependendo do que se quiser tirar proveito com este equipamento, é necessário ter a habilidade "Hacking" e/ou um teste de Tecnologia de DT proporcional a atividade desejada.',
            weight: 0.7,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Rastreador',
            rarity: 'Comum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Um pequeno dispositivo plástico que pode ser colocado em qualquer superfície para mostrar a localização em tempo real a onde ele foi colocado.',
            weight: 0.1,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Bolsa',
            rarity: 'Comum',
            kind: 'Capacidade',
            quantity: 1,
            description: 'Aumenta sua capacidade total em +1Kg e você pode colocar um item de médio porte que deseja na bolsa para sacá-lo como ação livre quando em combate.',
            weight: 1,
            rogueliteRarity: 'Comum'
        },
        {
            name: 'Kit Médico',
            rarity: 'Comum',
            kind: 'Consumível',
            quantity: 1,
            description: 'Quando utilizado, cura o alvo em 3d6+2 pontos de vida (LP).',
            weight: 0.5,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Mochila Pequena',
            rarity: 'Comum',
            kind: 'Capacidade',
            quantity: 1,
            description: 'Aumenta sua capacidade total em +2.5Kg.',
            weight: 2.5,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Mochila Média',
            rarity: 'Comum',
            kind: 'Capacidade',
            quantity: 1,
            description: 'Aumenta sua capacidade total em +5Kg',
            weight: 5,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Mochila Grande',
            rarity: 'Comum',
            kind: 'Capacidade',
            quantity: 1,
            description: 'Aumenta sua capacidade total em +7.5Kg.',
            weight: 7.5,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Mochila Extra Grande',
            rarity: 'Comum',
            kind: 'Capacidade',
            quantity: 1,
            description: 'Aumenta sua capacidade total em +12.5Kg e oferece +1 de AP.',
            weight: 12.5,
            rogueliteRarity: 'Lendário'
        },

        // New items
        {
            name: 'Ácido Nanítico',
            rarity: 'Incomum',
            kind: 'Arremessável',
            quantity: 1,
            description: 'Frasco de ácido com nanobots que ao ser arremessado causa 3d8 de dano corrosivo em um raio de 2m. Alvos atingidos sofrem -2 na defesa da armadura por 3 turnos. Destrói armaduras não-mágicas após 5 acertos cumulativos.',
            weight: 0.4,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Bomba de Plasma',
            rarity: 'Raro',
            kind: 'Arremessável',
            quantity: 1,
            description: 'Dispositivo que libera uma explosão de plasma causando 4d12 de dano energético em 5m de raio. Alvos atingidos ficam "eletrificados" por 2 turnos, sofrendo 1d6 de dano adicional no início de cada turno e tendo desvantagem em testes de agilidade.',
            weight: 0.8,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Rede Elétrica',
            rarity: 'Comum',
            kind: 'Padrão',
            quantity: 1,
            description: 'Rede condutora que ao ser ativada prende alvos em um raio de 3m. Causa 2d6 de dano elétrico inicial e 1d4 de dano por turno enquanto presos. Alvos podem tentar escapar com teste de Força ou Acrobacia a cada turno (DT 15).',
            weight: 1.2,
            rogueliteRarity: 'Comum'
        },
        {
            name: 'Gás Neurotóxico',
            rarity: 'Raro',
            kind: 'Arremessável',
            quantity: 1,
            description: 'Cartucho de gás que cria uma nuvem tóxica de 4m de raio por 3 turnos. Alvos na área sofrem 2d8 de dano mental e devem fazer teste de Fortitude (DT 14) ou ficam confusos por 1 turno. O gás não afeta robôs ou seres sem sistema nervoso.',
            weight: 0.3,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Mina de Proximidade Sônica',
            rarity: 'Incomum',
            kind: 'Arremessável',
            quantity: 1,
            description: 'Mina que detecta movimento em 2m de raio e explode com ondas sônicas. Causa 3d10 de dano concussivo e ensurdece alvos em 5m por 2 turnos. Pode ser desarmada com teste de Tecnologia (DT 16) ou explodida remotamente.',
            weight: 0.6,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Drone Vespa Suicida',
            rarity: 'Raro',
            kind: 'Padrão',
            quantity: 1,
            description: 'Pequeno drone que persegue o alvo designado por até 3 turnos. Ao alcançar ou ser destruído, explode causando 3d8 de dano perfurante em 2m de raio. Pode ser interceptado com teste de Pontaria ou Tecnologia (DT 13).',
            weight: 0.5,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Lâmina Vibratória Descartável',
            rarity: 'Comum',
            kind: 'Padrão',
            quantity: 3,
            description: 'Lâmina monomolecular que vibra em alta frequência. Ignora 3 de AP e causa 2d8+4 de dano cortante. Após 3 usos, a lâmina perde o efeito vibratório. Pode ser arremessada (alcance 10m) para dano perfurante.',
            weight: 0.2,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Esporos Corrosivos',
            rarity: 'Incomum',
            kind: 'Arremessável',
            quantity: 1,
            description: 'Saco de esporos que ao ser quebrado libera nuvem de 3m de raio. Causa 1d6 de dano corrosivo por turno por 4 turnos. Alvos atingidos podem espalhar os esporos para outros que estejam a 1m de distância. Fogo limpa os esporos instantaneamente.',
            weight: 0.3,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Feromônios de Fúria',
            rarity: 'Raro',
            kind: 'Arremessável',
            quantity: 1,
            description: 'Spray químico que afeta inimigos orgânicos em 6m de raio. Alvos devem fazer teste de Vigor (DT 15) ou ficam enfurecidos, atacando a criatura mais próxima (amiga ou inimiga) por 2 turnos. Não afeta robôs, mortos-vivos ou plantas.',
            weight: 0.4,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Canhão de Partículas Portátil',
            rarity: 'Lendário',
            kind: 'Padrão',
            quantity: 1,
            description: 'Dispositivo de uso único que dispara feixe de partículas concentradas. Causa 5d10 de dano energético perfurante que ignora toda a defesa de armadura. Cria trilha de radiação de 1m de largura por 10m que causa 1d4 de dano por turno a quem passar por 3 turnos.',
            weight: 2.5,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'Granada Criogênica',
            rarity: 'Incomum',
            kind: 'Arremessável',
            quantity: 1,
            description: 'Dispositivo que libera gás congelante em 4m de raio. Causa 2d6 de dano de frio e alvos devem fazer teste de Vigor (DT 13) ou ficam lentos (metade do movimento) por 2 turnos. Água no raio congela instantaneamente, criando terreno difícil.',
            weight: 0.5,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Bomba Magnética',
            rarity: 'Raro',
            kind: 'Arremessável',
            quantity: 1,
            description: 'Explosivo que atrai objetos metálicos antes de detonar. Puxa todos em um raio de 8m para o centro (teste de Força DT 14 para resistir), então causa 3d10 de dano concussivo mais 1d8 adicional para alvos usando armadura pesada ou carregando itens metálicos.',
            weight: 1.0,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Seringa de Adrenalina Sintética',
            rarity: 'Comum',
            kind: 'Consumível',
            quantity: 2,
            description: 'Injetor que concede +10 pontos de vida temporários e vantagem em testes de Força e Atletismo por 3 turnos. Após o efeito, o usuário sofre 1d6 de dano e tem desvantagem em testes mentais por 1 turno (crash).',
            weight: 0.1,
            rogueliteRarity: 'Comum'
        },
        {
            name: 'Minas Termais Geotérmicas',
            rarity: 'Épico',
            kind: 'Arremessável',
            quantity: 1,
            description: 'Kit de 3 minas que criam gêiser de lava quando ativadas. Cada mina causa 4d8 de dano de fogo em 3m de raio e cria terreno de lava (1d6 de dano por passo) por 5 minutos. Minas podem ser detonadas em sequência ou simultaneamente.',
            weight: 3.0,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Nanites Devoradores de Matéria',
            rarity: 'Lendário',
            kind: 'Padrão',
            quantity: 1,
            description: 'Recipiente de nanobots que desintegram matéria. Causa 2d8 de dano por turno por 5 turnos em um único alvo. Ignora armadura e destrói equipamentos não-mágicos do alvo. Pode ser removido com teste de Medicina ou Tecnologia (DT 18).',
            weight: 0.6,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'Estimulante de Reflexos',
            rarity: 'Comum',
            kind: 'Consumível',
            quantity: 2,
            description: 'Injetor que concede +5 de bônus em Agilidade por 2 turnos. Após o efeito, usuário sofre -2 em Agilidade por 1 turno. Efeito cumulativo até 3 doses (risco de overdose).',
            weight: 0.1,
            rogueliteRarity: 'Comum'
        },
        {
            name: 'Pílula de Regeneração Rápida',
            rarity: 'Incomum',
            kind: 'Consumível',
            quantity: 1,
            description: 'Comprimido que ativa metabolismo acelerado. Cura 1d4 pontos de vida por turno por 4 turnos automaticamente, mesmo inconsciente. Durante o efeito, usuário tem desvantagem em testes de Furtividade.',
            weight: 0.1,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Soro de Adaptação Ambiental',
            rarity: 'Raro',
            kind: 'Consumível',
            quantity: 1,
            description: 'Soro genético que concede imunidade a um tipo de dano (fogo, frio, elétrico ou corrosivo) por 3 turnos. Usuário ganha resistência ao elemento oposto. Efeito aleatório baseado no ambiente atual.',
            weight: 0.2,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Cápsula de Camuflagem Térmica',
            rarity: 'Incomum',
            kind: 'Consumível',
            quantity: 1,
            description: 'Cápsula que mascara assinatura térmica por 2 turnos. Concede vantagem em testes de Furtividade contra sensores térmicos e robôs. Ineficaz contra visão normal ou mágica.',
            weight: 0.1,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Gel de Velocidade Quântica',
            rarity: 'Épico',
            kind: 'Consumível',
            quantity: 1,
            description: 'Gel subcutâneo que permite mover-se entre o tempo. Concede uma ação de movimento adicional por turno por 2 turnos. Após o efeito, usuário fica exausto (metade do movimento) por 1 turno.',
            weight: 0.3,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Antídoto Polivalente Avançado',
            rarity: 'Comum',
            kind: 'Consumível',
            quantity: 2,
            description: 'Soro universal que neutraliza qualquer veneno ou toxina no corpo. Remove instantaneamente todos os efeitos de veneno e concede imunidade a novos venenos por 1 hora. Funciona em venenos mágicos e tecnológicos.',
            weight: 0.1,
            rogueliteRarity: 'Comum'
        },
        {
            name: 'Comprimido de Foco Mental',
            rarity: 'Incomum',
            kind: 'Consumível',
            quantity: 2,
            description: 'Estimulante cognitivo que concede +3 de bônus em Magia e testes mentais por 3 turnos. Remove uma condição mental (confusão, medo, etc.). Após o efeito, usuário sofre -1 em Magia por 1 turno.',
            weight: 0.1,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Soro de Força Bruta',
            rarity: 'Raro',
            kind: 'Consumível',
            quantity: 1,
            description: 'Injeção experimental que aumenta massa muscular. Concede +4 de bônus em Força e dano desarmado por 2 turnos. Usuário não pode usar armas ou ferramentas complexas durante o efeito.',
            weight: 0.4,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Spray Repelente de Magia',
            rarity: 'Incomum',
            kind: 'Consumível',
            quantity: 1,
            description: 'Aerosol que cria campo anti-mágico ao redor do usuário por 2 turnos. Magias de alvo têm 50% de chance de falhar. Não afeta magias já ativas ou magias de área.',
            weight: 0.2,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Cápsula de Memória Muscular',
            rarity: 'Épico',
            kind: 'Consumível',
            quantity: 1,
            description: 'Cápsula neural que permite copiar temporariamente uma habilidade de aliado próximo. Usuário pode usar uma perícia ou habilidade do aliado por 3 turnos com proficiência básica. Efeito termina se aliado morrer.',
            weight: 0.1,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Gel Reparador de Nanomáquinas',
            rarity: 'Raro',
            kind: 'Consumível',
            quantity: 1,
            description: 'Gel contendo nanomáquinas reparadoras. Cura 4d6 pontos de vida em robôs, cibernéticos e usuários de implantes. Concede +2 de bônus em testes de Tecnologia por 1 turno. Inútil em seres puramente orgânicos.',
            weight: 0.5,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Comprimido de Sorte Temporária',
            rarity: 'Lendário',
            kind: 'Consumível',
            quantity: 1,
            description: 'Pílula quântica que manipula probabilidades. Concede vantagem em todos os testes por 1 turno. Permite reroll um teste crítico (sucesso ou falha). Após o efeito, usuário sofre desvantagem no próximo teste.',
            weight: 0.1,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'Soro de Adaptação Genética',
            rarity: 'Lendário',
            kind: 'Consumível',
            quantity: 1,
            description: 'Soro experimental que reescreve DNA temporariamente. Usuário ganha uma mutação aleatória benéfica por 5 minutos (visão no escuro, respiração aquática, pele blindada, etc.). Mutação pode ter efeitos colaterais imprevisíveis.',
            weight: 0.8,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'Energizador de Mana Puro',
            rarity: 'Incomum',
            kind: 'Consumível',
            quantity: 1,
            description: 'Cristal líquido que restaura 4d4+2 pontos de mana instantaneamente. Concede +1 de bônus em Magia no próximo teste. Se usuário não tiver habilidade mágica, causa 1d6 de dano energético.',
            weight: 0.2,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Pílula de Sobrevivência Extrema',
            rarity: 'Épico',
            kind: 'Consumível',
            quantity: 1,
            description: 'Comprimido de emergência que coloca corpo em modo hibernação. Usuário fica imune a dano e não precisa respirar por 10 minutos, mas fica completamente inconsciente e imóvel. Útil para sobreviver a ambientes hostis.',
            weight: 0.1,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Spray de Adesivo Quântico',
            rarity: 'Comum',
            kind: 'Consumível',
            quantity: 1,
            description: 'Spray que cria superfície aderente em 3m². Qualquer um que pisar na área fica preso (teste de Força DT 16 para se mover). Dura 3 turnos ou até ser limpo com solvente. Funciona em qualquer superfície.',
            weight: 0.3,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Cápsula de Invisibilidade Parcial',
            rarity: 'Raro',
            kind: 'Consumível',
            quantity: 1,
            description: 'Cápsula que refraita luz ao redor do corpo. Usuário fica invisível para visão normal por 2 turnos, mas ainda detectável por outros sentidos. Atacar quebra o efeito imediatamente.',
            weight: 0.15,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Soro Anti-Tecnologia',
            rarity: 'Raro',
            kind: 'Consumível',
            quantity: 1,
            description: 'Soro EMP biológico que interfere com dispositivos eletrônicos. Causa 2d8 de dano em robôs e cibernéticos em 3m de raio. Desativa dispositivos não-protegidos por 1 turno. Inofensivo para seres orgânicos.',
            weight: 0.4,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Comprimido de Percepção Aguçada',
            rarity: 'Incomum',
            kind: 'Consumível',
            quantity: 1,
            description: 'Comprimido que aumenta aguçamento sensorial. Concede +2 de bônus em Percepção, Investigação e Intuição por 2 turnos. Permite identificar objetos ocultos e detectar movimentos em 10m.',
            weight: 0.1,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Gel de Regeneração Tecidual',
            rarity: 'Épico',
            kind: 'Consumível',
            quantity: 1,
            description: 'Gel biomédico acelera regeneração celular. Cura 3d6 pontos de vida instantaneamente e remove condições de sangramento, envenenamento e doenças. Efeito demora 1 turno para ativar completamente.',
            weight: 0.6,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Mochila Modular Tática',
            rarity: 'Incomum',
            kind: 'Capacidade',
            quantity: 1,
            description: 'Mochila com compartimentos ajustáveis que aumenta capacidade em +4Kg. Possui compartimentos térmicos (mantém 2 porções de comida frescas) e à prova d\'água. Permite organizar itens por categoria como ação livre.',
            weight: 4,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Cinto de Utilidades Multi-função',
            rarity: 'Comum',
            kind: 'Capacidade',
            quantity: 1,
            description: 'Cinto com 5 bolsos de acesso rápido. Aumenta capacidade em +1.5Kg e permite sacar pequenos itens (ferramentas, munição, consumíveis pequenos) como ação livre em combate. Um dos bolsos é à prova d\'água.',
            weight: 1.5,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Cartucheira de Capacidade Expandida',
            rarity: 'Incomum',
            kind: 'Capacidade',
            quantity: 1,
            description: 'Cartucheira tática que comporta até 20 cargas de munição ou 10 granadas. Aumenta capacidade em +2Kg e organiza munição por calibre. Reduz tempo de recarga em 1 ação quando usando munição organizada.',
            weight: 2,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Mochila de Campo Avançada',
            rarity: 'Raro',
            kind: 'Capacidade',
            quantity: 1,
            description: 'Mochila com sistema de sobrevivência integrado. Aumenta capacidade em +6Kg, possui filtro de água (purifica 10L por dia), painel solar (recarrega 2 dispositivos pequenos) e compartimento médico (mantém 3 medicamentos estáveis).',
            weight: 6,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Bolsa de Dimensões Comprimidas',
            rarity: 'Épico',
            kind: 'Capacidade',
            quantity: 1,
            description: 'Bolsa tecnológica com espaço dimensional interno. Aumenta capacidade em +8Kg. Não pode conter itens vivos ou líquidos. Itens maiores que 1m não cabem. Pode extrair itens específicos como ação livre.',
            weight: 8,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'Pacote de Munição Traçante',
            rarity: 'Incomum',
            kind: 'Munição',
            quantity: 1,
            description: 'Cartuchos traçantes que iluminam trajetória. Causam 1d8+1 de dano perfurante e iluminam área por 1 turno após impacto. Concede +2 em testes de Pontaria contra alvos em movimento. Não funciona bem em silenciadores.',
            weight: 1.8,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Pacote de Munição Perfurante Especial',
            rarity: 'Raro',
            kind: 'Munição',
            quantity: 1,
            description: 'Cartuchos com núcleo de tungstênio. Causam 1d10+3 de dano perfurante e ignoram 2 de AP. Eficaz contra veículos leves e robôs. Dobra o desgaste de armas.',
            weight: 2.2,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Pacote de Munição Incendiária',
            rarity: 'Incomum',
            kind: 'Munição',
            quantity: 1,
            description: 'Cartuchos com carga incendiária. Causam 1d6+2 de dano perfurante mais 1d4 de dano de fogo por 2 turnos. Acende objetos inflamáveis. Menos eficaz contra alvos molhados ou em ambientes úmidos.',
            weight: 1.4,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Pacote de Munição Elétrica',
            rarity: 'Raro',
            kind: 'Munição',
            quantity: 1,
            description: 'Cartuchos com carga elétrica. Causam 1d6+1 de dano perfurante mais 2d4 de dano elétrico. Alvos robóticos ou cibernéticos devem fazer teste de Fortitude (DT 13) ou ficam desorientados por 1 turno. Ineficaz contra alvos isolados.',
            weight: 1.6,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Pacote de Munição de Precisão Avançada',
            rarity: 'Raro',
            kind: 'Munição',
            quantity: 1,
            description: 'Cartuchos com mira laser integrada. Causam 2d6+4 de dano perfurante e concedem vantagem em testes de Pontaria até 300m. Trajetória corrigida por vento.',
            weight: 1.2,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Pacote de Flechas de Caça Broadhead',
            rarity: 'Incomum',
            kind: 'Munição',
            quantity: 6,
            description: 'Flechas com ponta expansiva para caça. Causam 1d8+2 de dano perfurante e alvos atingidos sangram (1d4 de dano por turno) até fazer teste de Medicina (DT 12). Difíceis de recuperar intactas.',
            weight: 0.5,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Pacote de Flechas Incendiárias',
            rarity: 'Raro',
            kind: 'Munição',
            quantity: 6,
            description: 'Flechas com ponta inflamável. Causam 1d6+1 de dano perfurante mais 1d6 de dano de fogo. Acendem objetos inflamáveis em 2m de raio. Apagam se alvo estiver na água. Dificultam recuperação da flecha.',
            weight: 0.6,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Pacote de Javelots de Treino',
            rarity: 'Comum',
            kind: 'Munição',
            quantity: 5,
            description: 'Javelots com ponta de borracha para arremesso. Causam 1d4 de dano concussivo (não letal). Ótimos para treinamento e captura sem morte. Podem ser recuperados facilmente após o uso.',
            weight: 0.8,
            rogueliteRarity: 'Comum'
        },
        {
            name: 'Multiferramenta de Sobrevivência',
            rarity: 'Comum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Ferramenta compacta com 12 funções: faca, alicate, tesoura, abridor, serrinha, chave de fenda, chave Phillips, lima, cortador de arame, lupa, bússola e isqueiro. Concede +2 em testes de Sobrevivência e Tecnologia.',
            weight: 0.3,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Kit de Primeiros Socorros Tático',
            rarity: 'Incomum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Kit médico compacto com ataduras, antissépticos, analgésicos e splint. Permite estabilizar feridos críticos (testes de Medicina com vantagem) e tratar 2d5+3 pontos de dano. Contém suprimentos para 5 usos.',
            weight: 1.0,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Gerador Portátil de Energia',
            rarity: 'Raro',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Gerador de bateria que recarrega até 3 dispositivos simultaneamente. Recarrega completamente dispositivos pequenos em 1 hora, médios em 3 horas. Funciona por 8 horas antes de precisar recarregar. Silencioso e discreto.',
            weight: 2.5,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Terminal de Hacking Portátil',
            rarity: 'Épico',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Computador ultraportátil com ferramentas de hacking avançadas. Concede +4 em testes de Hacking e permite quebrar sistemas de segurança em metade do tempo. Possui banco de dados de vulnerabilidades conhecidas. Autonomia de 6 horas.',
            weight: 0.7,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Kit de Ferramentas de Robótica',
            rarity: 'Raro',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Conjunto especializado de ferramentas para reparo e modificação de robôs. Concede +3 em testes de Tecnologia com robôs e permite realizar reparos básicos em campo. Inclui soldadora, multímetro e peças de reposição básicas.',
            weight: 3.0,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Saco de Dormir de Sobrevivência',
            rarity: 'Comum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Saco de dormir térmico e à prova d\'água. Protege contra temperaturas de -20°C a 50°C. Concede vantagem em testes de Fortitude e Sobrevivência para resistir clima extremo. Compacto e leve (cabe em qualquer mochila).',
            weight: 1.5,
            rogueliteRarity: 'Comum'
        },
        {
            name: 'Kit de Purificação de Água',
            rarity: 'Comum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Filtro portátil e comprimidos purificadores. Remove 99.9% de contaminantes biológicos e químicos. Purifica até 100L de água. Cada comprimido trata 1L em 30 minutos. Essencial para sobrevivência em áreas selvagens.',
            weight: 0.4,
            rogueliteRarity: 'Comum'
        },
        {
            name: 'Bússola Magnética Avançada',
            rarity: 'Comum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Bússola de alta precisão com marcação de elevação. Concede +3 em testes de Condução e Intuição. Funciona mesmo próximo a interferências magnéticas moderadas. Indica norte verdadeiro e magnético.',
            weight: 0.2,
            rogueliteRarity: 'Comum'
        },
        {
            name: 'Binóculos de Visão Noturna',
            rarity: 'Raro',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Binóculos com tecnologia de visão noturna digital. Permite ver até 500m em escuridão total. Concede +4 em testes de Vigilância e Percepção à noite. Bateria dura 12 horas. Resistente à água.',
            weight: 1.2,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Gravador de Áudio Discreto',
            rarity: 'Incomum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Mini gravador com microfone direcional. Grava até 48 horas de áudio em alta qualidade. Capta conversas a até 50m de distância. Concede +2 em testes de Investigação e Diplomacia (para coletar evidências).',
            weight: 0.1,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Lanterna de LED',
            rarity: 'Comum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Lanterna potente com 5 modos de iluminação. Alcance de 90m. Pode desorientar alvos (teste de Fortitude DT 12 ou desvantagem por 1 turno). Bateria dura 20 horas. Resistente a impactos.',
            weight: 0.3,
            rogueliteRarity: 'Comum'
        },
        {
            name: 'Corda de Escalada Dinâmica',
            rarity: 'Incomum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Corda especial de 30m com elasticidade controlada. Suporta até 300kg. Absorve impacto de quedas de até 5m. Concede +2 em testes de Força e Atletismo para escalada. Inclui 2 mosquetões de segurança.',
            weight: 2.0,
            rogueliteRarity: 'Comum'
        },
        {
            name: 'Kit de Lockpick Eletrônico',
            rarity: 'Incomum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Conjunto de ferramentas eletrônicas para abrir fechaduras modernas. Concede +4 em testes de Ladinagem e Competência contra fechaduras. Analisa padrões e sugere combinações. Inútil contra fechaduras mecânicas simples.',
            weight: 0.6,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Máscara de Gás Militar',
            rarity: 'Incomum',
            kind: 'Equipamento',
            quantity: 1,
            description: 'Máscara de proteção com filtros avançados. Protege contra gases tóxicos, biológicos e radiológicos por 4 horas. Concede imunidade a inalação de venenos e toxinas. Inclui sistema de comunicação integrado.',
            weight: 0.8,
            space: 'Capacete',
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Gerador de Campo de Força Pessoal',
            rarity: 'Épico',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Dispositivo que projeta campo de força protetor. Absorve até 20 pontos de dano antes de sobrecarregar. Dura 10 minutos ou até esgotar carga. Recarrega em 2 horas. Não protege contra dano de queda ou ambiental.',
            weight: 1.5,
            rogueliteRarity: 'Épico'
        }
    ],
    magical: [
        {
            name: 'Poção de Cura Menor',
            rarity: 'Comum',
            kind: 'Consumível',
            quantity: 3,
            description: 'Restaura 2d4+2 pontos de vida instantaneamente.',
            weight: 0.2,
            rogueliteRarity: 'Comum'
        },
        {
            name: 'Bomba de Cura em Área',
            rarity: 'Incomum',
            kind: 'Arremessável',
            quantity: 2,
            description: 'Ao ser arremessada, explode em raio de 3m curando 1d6+3 LP para todos aliados na área. Causa 1d4 de dano de luz a inimigos não-mortos.',
            weight: 0.5,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Elixir Vital Condicionado',
            rarity: 'Raro',
            kind: 'Consumível',
            quantity: 1,
            description: 'Cura 4d6+8 LP, mas só funciona se você estiver abaixo de 25% da vida máxima. Concede +2 em todos os testes por 1 minuto após uso.',
            weight: 0.3,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Semente de Regeneração',
            rarity: 'Incomum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Plante no chão para criar campo de regeneração (2m). Aliados na área curam 1d4 LP por turno por 5 minutos. Campo pode ser destruído com 10 de dano.',
            weight: 0.1,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Sangue do Fênix',
            rarity: 'Épico',
            kind: 'Consumível',
            quantity: 1,
            description: 'Revive com 50% da vida máxima se morrer nos próximos 10 minutos. Se usado com vida plena, concede +10 LP temporários por 5 minutos.',
            weight: 0.4,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Orbe de Transferência Vital',
            rarity: 'Raro',
            kind: 'Arremessável',
            quantity: 1,
            description: 'Arremesse em aliado para transferir 2d6 LP seus para ele instantaneamente. Você sofre metade do dano transferido. Funciona através de paredes.',
            weight: 0.6,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Cristal de Cura por Adrenalina',
            rarity: 'Incomum',
            kind: 'Consumível',
            quantity: 2,
            description: 'Cura 2d8 LP, mas só funciona em combate (dentro de 30s de receber ou causar dano). Dobra a cura se você estiver sangrando.',
            weight: 0.2,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Pomada Mística de Ligação',
            rarity: 'Raro',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Aplique em dois aliados para criar laço vital: quando um cura, o outro recebe 25% dessa cura. Dura 10 minutos ou até que um morra.',
            weight: 0.5,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Néctar da Floresta Antiga',
            rarity: 'Épico',
            kind: 'Consumível',
            quantity: 1,
            description: 'Cura 3d8 LP e remove todos os venenos, doenças e maldições. Concede resistência a venenos por 1 hora. Aumenta cura recebida em 50% por 5 minutos.',
            weight: 0.3,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Cápsula de Estabilização Emergencial',
            rarity: 'Raro',
            kind: 'Arremessável',
            quantity: 1,
            description: 'Ao atingir aliado caído (0 LP), estabiliza instantaneamente com 1 LP e impede morte por 1 minuto. Cura adicional 1d4 LP por turno durante este período.',
            weight: 0.4,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Essência de Vida Compartilhada',
            rarity: 'Lendário',
            kind: 'Consumível',
            quantity: 1,
            description: 'Todos aliados em 15m compartilham piscina de vida: 50 LP totais distribuídos igualmente. Dura 3 minutos ou até que a piscina acabe. Excesso de cura se espalha igualmente.',
            weight: 0.8,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'Fractal de Cura Temporal',
            rarity: 'Épico',
            kind: 'Consumível',
            quantity: 1,
            description: 'Reverte seu estado para 1 turno atrás: restaura LP, MP, AP e remove todos os estados negativos adquiridos neste período. Não funciona contra morte.',
            weight: 0.5,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Gel de Regeneração Celular',
            rarity: 'Incomum',
            kind: 'Utilidade',
            quantity: 1,
            description: 'Aplica na pele para regenerar 1 LP por minuto automaticamente por 1 hora. Funciona mesmo inconsciente. Não acumula com outras fontes de regeneração.',
            weight: 0.7,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Orbe Sacrificial de Sangue',
            rarity: 'Raro',
            kind: 'Consumível',
            quantity: 1,
            description: 'Sacrifica 10 LP para curar aliado alvo em 4d6 LP instantaneamente. Se o sacrifício o deixar abaixo de 25% LP, cura adicional 2d6 LP no alvo.',
            weight: 0.3,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Semente de Vida Explosiva',
            rarity: 'Raro',
            kind: 'Arremessável',
            quantity: 1,
            description: 'Cresce rapidamente em árvore curandeira por 30 segundos. Cura 1d4 LP por turno para todos aliados em 5m. Ao final, explode curando 2d6 LP em área mas destruindo a árvore.',
            weight: 0.2,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Pedra de Mana',
            rarity: 'Comum',
            kind: 'Utilidade',
            description: 'Utensílio mágico que, quando portado, aumenta a mana máxima (MP) em +5 (limite de 20 pedras por inventário (+100MP extras)).',
            weight: 0.2,
            quantity: 1,
            rogueliteRarity: 'Épico'
        },
        // new item
        {
            name: 'ORMAN',
            rarity: 'Raro',
            kind: 'Especial',
            description: 'Objeto de Ressonância Mágica Avançada Negativo, é uma variante de ORM e mais especificamente, de ORMA que pode ser adquirida para aumentar danos ou curas de magias em níveis de maneira inversamente proporcional: \n\n+10 em magias de nível 1;\n+5 em magias de nível 2;\n+3 em magias de nível 3;\n+1 em magias de nível 4;',
            weight: 1.5,
            quantity: 1,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'ORMA',
            rarity: 'Raro',
            kind: 'Especial',
            description: 'Objeto de Ressonância Mágica Avançada, é uma variante de ORM que pode ser adquirida para aumentar danos ou curas de magias em: \n\n+2 no Nível 1 de ORM;\n+4 no Nível 2 de ORM;\n+6 no Nível 3 de ORM;\n+8 no Nível 4 de ORM;',
            weight: 1.5,
            quantity: 1,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'ORMC',
            rarity: 'Raro',
            kind: 'Especial',
            description: 'Objeto Receptor de Magia Conjurada, é uma variante de ORM que pode ser adquirida para conjurar magias de ação completa com uma ação padrão. (Não pode ser acumulado com outros tipos de ORM\'s)',
            weight: 1.5,
            quantity: 1,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'AVORM',
            rarity: 'Raro',
            kind: 'Especial',
            description: 'Ajuste de Velocidade para Objeto Receptor de Magia, é uma variante de ORM que pode ser adquirida para utilizar duas magias de ação livre no mesmo turno. Além disso, você também pode executar duas magias de ação de movimento no mesmo turno, mas caso faça isso, você irá perder sua ação de movimento do próximo turno e não poderá se esquivar de ataques até o seu turno seguinte.',
            weight: 1.5,
            quantity: 1,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'MEORM',
            rarity: 'Raro',
            kind: 'Especial',
            description: 'Modificação Elemental para Objeto Receptor de Magia, é uma variante de ORM que pode ser adquirida para adicionar dano ou cura a magias que utilizem da sua Maestria Elemental:\n\n+5 no nível 2 de ORM;\n+8 no nível 3 de ORM;\n+12 no nível 4 de ORM\n\nEntretanto, caso você conjure uma magia que NÃO seja de sua Maestria Elemental, você sofre -5 de chance de acerto, e gasta +2 MP adicionais.',
            weight: 1.2,
            quantity: 1,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'Visor Arcano',
            rarity: 'Comum',
            kind: 'Equipamento',
            description: 'Uma microlente mágica que ao ser equipada nos olhos aumenta o bônus de Magia em +2.',
            weight: 0.1,
            space: 'Amuleto',
            quantity: 1,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Memória RAM DDR9 para ORM',
            rarity: 'Raro',
            kind: 'Utilidade',
            description: 'Aprimora o tipo da memória RAM do seu ORM, fazendo o conseguir guardar mais códigos mágicos por vez (Você ganha +2 pontos de magia e +4 espaços para magias adicionais).',
            weight: 0.8,
            quantity: 1,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Inibidor Mágico',
            rarity: 'Raro',
            kind: 'Utilidade',
            description: 'Dispositivo que, quando colocado em uma superfície, inibe qualquer magia em um raio de 9m até que alguém o tire de lá, ou o quebre, ou durante 3 turnos.',
            weight: 1.0,
            quantity: 1,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'Dispositivo de Drenagem de Mana (DDM)',
            rarity: 'Raro',
            kind: 'Utilidade',
            description: 'Um dispositivo que quando colocado em alguém, drena 3 MP a cada turno do oponente e repassa para quem colocou o dispositivo no adversário.',
            weight: 0.5,
            quantity: 1,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Kit Mágico',
            rarity: 'Comum',
            kind: 'Consumível',
            description: 'Quando utilizado, cura o alvo em 3d8 pontos de mana (MP).',
            weight: 0.5,
            quantity: 1,
            rogueliteRarity: 'Épico'
        },
        // new items
        {
            name: 'Pergaminho Mágico de Fogo',
            rarity: 'Incomum',
            kind: 'Consumível',
            description: 'Pergaminho que permite conjurar Bola de Fogo sem gastar mana. Causa 6d6 de dano de fogo em 6m de raio. Alvos devem fazer teste de Agilidade (DT 14) para metade do dano. O pergaminho se desintegra após o uso.',
            weight: 0.1,
            quantity: 1,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Código Mágico',
            rarity: 'Lendário',
            kind: 'Consumível',
            description: 'Código que permite conjurar uma próxima magia sem gastar mana.',
            weight: 0.1,
            quantity: 1,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'Pergaminho de Cura Completa',
            rarity: 'Raro',
            kind: 'Consumível',
            description: 'Pergaminho sagrado que restaura todos os pontos de vida do alvo e remove todas as condições negativas (exceto maldições). Funciona mesmo em alvos inconscientes. O pergaminho se desintegra após o uso.',
            weight: 0.1,
            quantity: 1,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Pergaminho de Invisibilidade Superior',
            rarity: 'Raro',
            kind: 'Consumível',
            description: 'Pergaminho que concede invisibilidade verdadeira por 1 hora. Usuário fica invisível para todos os sentidos normais e mágicos. Atacar ou conjurar magias quebra o efeito. O pergaminho se desintegra após o uso.',
            weight: 0.1,
            quantity: 1,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Pergaminho de Teleporte',
            rarity: 'Épico',
            kind: 'Consumível',
            description: 'Pergaminho que permite teleportar até 4 alvos para local conhecido a até 10km de distância. Requer concentração e conhecimento visual do destino. O pergaminho se desintegra após o uso.',
            weight: 0.1,
            quantity: 1,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'Amuleto de Proteção Arcana',
            rarity: 'Incomum',
            kind: 'Equipamento',
            description: 'Amuleto gravado com runas de proteção que concede +2 em testes de RES Mágica para resistir magias inimigas. Reduz dano mágico recebido em 3 pontos. Funciona enquanto estiver equipado.',
            weight: 0.2,
            space: 'Amuleto',
            quantity: 1,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Anel de Intensidade Mágica',
            rarity: 'Raro',
            kind: 'Equipamento',
            description: 'Anel de prata com gema mágica que aumenta o poder das magias. Concede +2 de bônus em testes de Magia para conjurar e aumenta dano/cura de magias em +4. Requer ORM de nível 2 ou superior para funcionar.',
            weight: 0.1,
            space: 'Anel',
            quantity: 1,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Bastão de Poder Arcano',
            rarity: 'Épico',
            kind: 'Equipamento',
            description: 'Bastão de madeira mágica que armazena até 10 pontos de mana. Pode usar mana do bastão para conjurar magias. Concede +3 em testes de Magia enquanto segurado. Recarrega mana naturalmente 1 ponto por hora.',
            space: 'Não Ocupa',
            weight: 1.5,
            quantity: 1,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Varinha de Detectar Magia',
            rarity: 'Comum',
            kind: 'Equipamento',
            description: 'Varinha simples que permite detectar magia em 9m de raio. Vibra quando próximo de itens mágicos, áreas encantadas ou auras mágicas. Funciona indefinidamente, mas requer concentração.',
            weight: 0.3,
            space: 'Não Ocupa',
            quantity: 1,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Orbe de Visão Mágica',
            rarity: 'Incomum',
            kind: 'Utilidade',
            description: 'Esfera de cristal que permite ver através de paredes e obstáculos não-mágicos por até 10 minutos. Pode ver 30m através de materiais opacos. Requer concentração e gasta 1 MP por minuto.',
            weight: 1.0,
            quantity: 1,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Capa de Levitação',
            rarity: 'Raro',
            kind: 'Equipamento',
            description: 'Capa mágica que permite flutuar até 3m do chão enquanto usada. Usuário pode mover-se lentamente no ar (metade da velocidade normal). Não permite voar, apenas flutuar. Funciona enquanto vestida.',
            weight: 2.0,
            space: 'Costas',
            quantity: 1,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Botas de Velocidade Etérea',
            rarity: 'Raro',
            kind: 'Equipamento',
            description: 'Botas encantadas que concedem +3 em Agilidade e permitem mover-se através de objetos sólidos não-mágicos por até 5 segundos. Requer 1 mana por uso. Funciona enquanto calçadas.',
            weight: 1.5,
            space: 'Botas',
            quantity: 1,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Luvas de Destreza Arcana',
            rarity: 'Épico',
            kind: 'Equipamento',
            description: 'Luvas de couro encantado que concedem +2 em testes de Magia para magias que exigem gestos complexos (nível 3 ou superior). Reduz chance de falha em magias de componente somático. Funciona enquanto usadas.',
            weight: 0.5,
            space: 'Luvas',
            quantity: 1,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Colar de Falar com Animais',
            rarity: 'Incomum',
            kind: 'Equipamento',
            description: 'Colar de madeira com símbolos animais que permite comunicar-se com animais enquanto usado. Animais tratam usuário como amigo natural. Não funciona com monstros mágicos ou constructos.',
            weight: 0.3,
            space: 'Colar',
            quantity: 1,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Bracelete de Resistência Elemental',
            rarity: 'Raro',
            kind: 'Equipamento',
            description: 'Bracelete de metal com pedras elementais que concede resistência a fogo, água, ar e terra (metade do dano). Funciona enquanto equipado. Requer 1 mana por 10 pontos de dano reduzidos.',
            weight: 1.0,
            space: 'Luvas',
            quantity: 1,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Elmo de Clarividência',
            rarity: 'Épico',
            kind: 'Equipamento',
            description: 'Elmo mágico que permite ver o futuro próximo. Concede vantagem em um teste por turno. Pode usar 3 vezes por dia, cada uso dura 1 minuto. Requer descanso para recarregar.',
            weight: 2.5,
            space: 'Capacete',
            quantity: 1,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'Cajado do Elementalista',
            rarity: 'Lendário',
            kind: 'Equipamento',
            description: 'Cajado antigo que canaliza poder elemental. Concede +4 em Magia na magia em que o usuário possui maestria elemental e permite conjurar uma magia desse mesmo elemento por dia sem custo de mana. Aumenta dano elemental em +8. Usuário deve ter maestria elemental.',
            weight: 3.0,
            space: 'Não Ocupa',
            quantity: 1,
            rogueliteRarity: 'Único'
        },
        {
            name: 'Poção de Visão Verdadeira',
            rarity: 'Raro',
            kind: 'Consumível',
            description: 'Poção que permite ver através de ilusões e invisibilidade por 1 hora. Concede +5 em testes de Percepção para detectar enganação. Remove efeitos de ilusão ativos no usuário. Dura 1 hora.',
            weight: 0.3,
            quantity: 1,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Poção de Crescimento Gigante',
            rarity: 'Incomum',
            kind: 'Consumível',
            description: 'Poção que duplica o tamanho do usuário por 10 minutos. Concede +4 em Força e +20 LP temporários, mas -2 em Agilidade. Objetos carregados crescem junto. Dura 10 minutos.',
            weight: 0.4,
            quantity: 1,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Poção de Encolhimento',
            rarity: 'Incomum',
            kind: 'Consumível',
            description: 'Poção que reduz o usuário para metade do tamanho por 10 minutos. Concede +4 em Agilidade e Furtividade, mas -2 em Força. Dificulta ser atingido em combate. Dura 10 minutos.',
            weight: 0.4,
            quantity: 1,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Poção de Respiração Aquática',
            rarity: 'Comum',
            kind: 'Consumível',
            description: 'Poção que permite respirar debaixo d\'água por 2 horas. Usuário pode nadar normalmente e não sofre penalidades em ambiente aquático. Funciona em qualquer tipo de água.',
            weight: 0.2,
            quantity: 1,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Poção de Resistência à Magia',
            rarity: 'Incomum',
            kind: 'Consumível',
            description: 'Poção que concede +5 em testes de RES Mágica para resistir magias por 1 hora. Reduz dano mágico recebido em 5 pontos.',
            weight: 0.3,
            quantity: 1,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Poção de Sorte do Aventureiro',
            rarity: 'Épico',
            kind: 'Consumível',
            description: 'Poção rara que concede vantagem em todos os testes por 1 hora. Permite reroll um ataque ou teste crítico. Efeito termina após usar reroll ou 1 hora. Pequena chance de efeito colateral aleatório.',
            weight: 0.3,
            quantity: 1,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'Runa de Proteção Temporária',
            rarity: 'Comum',
            kind: 'Consumível',
            description: 'Runa gravada que pode ser ativada para criar barreira de força por 1 minuto. Barreira tem 15 pontos de vida e bloqueia ataques físicos e mágicos. Destrói runa após uso. Pode ser colocada em superfície.',
            weight: 0.5,
            quantity: 1,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Runa de Teleporte Rápido',
            rarity: 'Raro',
            kind: 'Consumível',
            description: 'Runa que permite teleportar instantaneamente para local marcado previamente. Pode marcar até 3 locais diferentes. Funciona até 100m de distância. Runa se desintegra após 3 usos.',
            weight: 0.2,
            quantity: 1,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Runa de Cura em Área',
            rarity: 'Incomum',
            kind: 'Consumível',
            description: 'Runa que quando ativada cura 2d6+2 pontos de vida em todos os aliados em 6m de raio. Remove condições de sangramento e envenenamento. Runa se desintegra após uso.',
            weight: 0.3,
            quantity: 1,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Cristal de Armazenamento de Mana',
            rarity: 'Incomum',
            kind: 'Utilidade',
            description: 'Cristal que pode armazenar até 5 pontos de mana. Usuário pode transferir mana para o cristal ou usar mana armazenada. Recarrega naturalmente 1 ponto por dia. Pode ser compartilhado entre usuários.',
            weight: 0.8,
            quantity: 1,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Cristal de Focalização Mágica',
            rarity: 'Raro',
            kind: 'Utilidade',
            description: 'Cristal que aumenta precisão de magias de alvo. Concede +3 em testes de Magia para acertar alvos distantes e reduz DT de resistência do alvo em 2. Funciona enquanto segurado.',
            weight: 0.5,
            quantity: 1,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Cristal de Ampliação Arcana',
            rarity: 'Épico',
            kind: 'Utilidade',
            description: 'Cristal poderoso que duplica área de magias de efeito. Magias que afetam 6m passam a afetar 12m. Requer 2 MP adicionais por magia ampliada. Funciona enquanto equipado.',
            weight: 1.2,
            quantity: 1,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'Livro de Magias Proibidas',
            rarity: 'Lendário',
            kind: 'Consumível',
            description: 'Tomo antigo contendo magias arcanas proibidas. Permite aprender uma magia de nível 4 sem pré-requisitos. Ao ser utilizado o livro se desintegra. Livro não pode ser copiado.',
            weight: 5.0,
            quantity: 1,
            rogueliteRarity: 'Único'
        },
        {
            name: 'Cajado do Necromante',
            rarity: 'Lendário',
            kind: 'Equipamento',
            description: 'Cajado de madeira escura que canaliza poder necromântico. Concede +4 em Magia com magias de morte e permite controlar 1 morto-vivo fraco por dia.',
            weight: 2.8,
            space: 'Não Ocupa',
            quantity: 1,
            rogueliteRarity: 'Único'
        },
        {
            name: 'Orbe de Adivinhação',
            rarity: 'Épico',
            kind: 'Utilidade',
            description: 'Esfera mágica que permite fazer uma pergunta ao Mestre e receber resposta verdadeira (sim/não/incompleto). Pode usar 1 vez por semana. Funciona contra magias de ilusão de até nível 3.',
            weight: 2.0,
            quantity: 1,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Manto de Invisibilidade Superior',
            rarity: 'Lendário',
            kind: 'Equipamento',
            description: 'Manto mágico que concede invisibilidade contínua enquanto vestido. Usuário fica invisível mesmo atacando ou conjurando magias. Pode ser ativado/desativado à vontade. Requer 1 mana por hora.',
            weight: 3.0,
            space: 'Costas',
            quantity: 1,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'Bota de Teleporte',
            rarity: 'Épico',
            kind: 'Equipamento',
            description: 'Bota encantada que permite teleportar 15m instantaneamente 3 vezes por dia. Teleporte é silencioso e não provoca ataques de oportunidade. Recarrega ao amanhecer.',
            weight: 1.8,
            space: 'Botas',
            quantity: 1,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'Anel de Regeneração Mágica',
            rarity: 'Lendário',
            kind: 'Equipamento',
            description: 'Anel dourado que regenera 1 ponto de vida por turno automaticamente. Dobra velocidade de cura natural. Funciona enquanto equipado. Não funciona se usuário tiver menos de 1 MP.',
            weight: 0.2,
            space: 'Anel',
            quantity: 1,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'Amuleto Contra Maldições',
            rarity: 'Raro',
            kind: 'Equipamento',
            description: 'Amuleto sagrado que protege contra maldições. Concede vantagem em testes para resistir maldições e pode remover uma maldição existente por semana. Funciona enquanto equipado.',
            weight: 0.3,
            space: 'Amuleto',
            quantity: 1,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Bastão das Quatro Estações',
            rarity: 'Lendário',
            kind: 'Equipamento',
            description: 'Bastão que permite controlar clima em 100m de raio. Pode criar chuva, neve, vento forte ou sol intenso. Cada mudança climática dura 1 hora. Requer 5 mana por uso. Recarrega diariamente.',
            weight: 2.5,
            space: 'Não Ocupa',
            quantity: 1,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'Espelho da Verdade',
            rarity: 'Épico',
            kind: 'Utilidade',
            description: 'Espelho mágico que revela a verdadeira forma de seres disfarçados e mostra ilusões. Pode ser usado 3 vezes por dia. Funciona contra magias de ilusão de até nível 3.',
            weight: 3.5,
            quantity: 1,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'Cajado do Tempo',
            rarity: 'Lendário',
            kind: 'Equipamento',
            description: 'Cajado lendário que pode manipular o tempo. Permite reroll um teste por dia ou voltar 6 segundos no tempo uma vez por semana. Efeitos de tempo afetam apenas usuário e área próxima.',
            weight: 1.8,
            space: 'Não Ocupa',
            quantity: 1,
            rogueliteRarity: 'Único'
        },
        {
            name: 'Orbe de Controle Mental',
            rarity: 'Lendário',
            kind: 'Utilidade',
            description: 'Orbe poderoso que permite dominar 1 criatura por dia. Alvo deve fazer teste de Magia (DT 16) ou fica controlado por 10 minutos. Funciona apenas em seres vivos. Requer 10 MP por uso.',
            weight: 1.5,
            quantity: 1,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'Manto das Sombras',
            rarity: 'Épico',
            kind: 'Equipamento',
            description: 'Manto que permite fundir-se com sombras. Concede invisibilidade em áreas escuras e +4 em Furtividade. Usuário pode se teletransportar entre sombras a até 20m de distância. Funciona enquanto vestido.',
            weight: 2.8,
            space: 'Costas',
            quantity: 1,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'Bastão da Vida',
            rarity: 'Único',
            kind: 'Equipamento',
            description: 'Bastão sagrado que canaliza energia vital. Dobra cura de magias de cura e permite reviver um morto recentemente (até 1 hora) uma vez por mês. Requer 20MP para reviver. Funciona enquanto segurado.',
            weight: 2.2,
            space: 'Não Ocupa',
            quantity: 1,
            rogueliteRarity: 'Único'
        },
        {
            name: 'Anel dos Desejos Menores',
            rarity: 'Único',
            kind: 'Consumível',
            description: 'Anel poderoso que concede 1 desejo menor por mês. Desejo não pode matar, destruir itens mágicos ou alterar realidade permanentemente. Anel se quebra após 3 desejos.',
            weight: 0.1,
            quantity: 1,
            rogueliteRarity: 'Único'
        },
        {
            name: 'Injetor de Adrenalina Sintética',
            rarity: 'Incomum',
            kind: 'Consumível',
            description: 'Injeção de estimulante que concede 20 LP temporários acima do máximo por 3 turnos. LP temporários diminuem em 5 por turno e não podem ser regenerados.',
            weight: 0.2,
            quantity: 1,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Bateria Externa de Capacidade',
            rarity: 'Raro',
            kind: 'Utilidade',
            description: 'Dispositivo portátil que armazena 5 AP extras acima do máximo. AP extras diminuem em 2 por turno durante combate e 1 por turno fora dele. Quando AP extras esgotam, causa 5 dano elétrico ao usuário.',
            weight: 1.5,
            quantity: 1,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Amuleto do Reservatório Arcano',
            rarity: 'Raro',
            kind: 'Equipamento',
            description: 'Amuleto que permite manter até 25 MP acima do máximo. MP extras não diminuem sozinhos, mas bloqueiam regeneração natural de mana enquanto estiverem presentes. Remove 3 MP extras por magia conjurada.',
            weight: 0.3,
            space: 'Amuleto',
            quantity: 1,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Seringa de Sobrecarga Vital',
            rarity: 'Épico',
            kind: 'Consumível',
            description: 'Seringa experimental que converte 50% da cura recebida nos próximos 2 turnos em LP temporários (máximo 30 LP extras). LP temporários diminuem em 3 por turno após o efeito terminar. Efeito acumulável com outras fontes de sobrecura.',
            weight: 0.1,
            quantity: 1,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Núcleo de Energia Instável',
            rarity: 'Épico',
            kind: 'Utilidade',
            description: 'Fonte de energia que concede 10 AP e 10 MP acima do máximo simultaneamente. Ambos diminuem em 2 por turno, mas quando um dos dois esgota, o outro também é perdido completamente. Causa 2 dano de energia por turno enquanto ativo.',
            weight: 2.0,
            quantity: 1,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Coração de Fênix',
            rarity: 'Lendário',
            kind: 'Consumível',
            description: 'Implante torácico que mantém 40% da vida máxima como LP temporário permanente. LP temporários não diminuem sozinhos, mas toda cura é reduzida em 50% enquanto LP temporários existirem. Quando LP atinge 0, o coração entra em cooldown de 5 minutos.',
            weight: 3.0,
            quantity: 1,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'Orbe da Convergência Vital',
            rarity: 'Lendário',
            kind: 'Consumível',
            description: 'Orbe raro que permite converter 20 LP extras em 15 MP extras ou vice-versa, uma vez por uso. Pode ser usado 3 vezes antes de se esgotar. A conversão preserva os temporários existentes e aplica as mesmas regras de decaimento.',
            weight: 0.5,
            quantity: 1,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'Sangue de Dragão Condensado',
            rarity: 'Único',
            kind: 'Consumível',
            description: 'Líquido místico que concede 60 LP temporários acima do máximo por 1 minuto. LP temporários diminuem em 10 por turno, mas cada ponto de dano causado restaura 1 LP temporário. Usar este item concede imunidade a medo por 1 hora.',
            weight: 0.8,
            quantity: 1,
            rogueliteRarity: 'Único'
        },
        {
            name: 'Botas de Moloch',
            rarity: 'Amaldiçoado',
            kind: 'Equipamento',
            description: 'Botas que concedem movimento ilimitado e teleporte de curta distância, mas impedem o usuário de parar completamente. Cada turno em que não se move, causa 2d6 de dano psíquico. Causa insônia permanente e exaustão mental cumulativa.',
            weight: 1.2,
            space: 'Botas',
            quantity: 1,
            rogueliteRarity: 'Amaldiçoado'
        },
        {
            name: 'Morthek',
            rarity: 'Amaldiçoado',
            kind: 'Utilidade',
            description: 'Orbe que permite converter permanentemente LP em MP ou AP na proporção 2:1, mas cada conversão causa dor intensa e penalidade de -3 em todos os testes por 1 hora. Acima de 100 pontos convertidos, o usuário desenvolve aversão à cura e regeneração.',
            weight: 1.5,
            quantity: 1,
            rogueliteRarity: 'Amaldiçoado'
        },
        {
            name: 'Manto de Kryzak',
            rarity: 'Amaldiçoado',
            kind: 'Equipamento',
            description: 'Manto que concede invisibilidade perfeita e camuflagem em sombras, mas consome lentamente a essência vital do usuário. Causa perda de 1 LP por hora no escuro e 3 LP por turno em combate. Sombras ao redor do usuário parecem se mover e sussurrar.',
            weight: 2.5,
            space: 'Costas',
            quantity: 1,
            rogueliteRarity: 'Amaldiçoado'
        },
        {
            name: 'Sanguine',
            rarity: 'Amaldiçoado',
            kind: 'Utilidade',
            description: 'Cajado que aumenta poder mágico em +10 e permite metade do custo de mana, mas exige sacrifício de sangue. Cada magia consome 5 LP do usuário. Se LP insuficiente, consome LP máximo permanentemente. O cajado pulsa com fome constante.',
            weight: 3.0,
            space: 'Não Ocupa',
            quantity: 1,
            rogueliteRarity: 'Amaldiçoado'
        },
        {
            name: 'Máscara de Volkov',
            rarity: 'Amaldiçoado',
            kind: 'Equipamento',
            description: 'Máscara que permite absorver a alma de inimigos derrotados, ganhando 10 pontos de LP ou MP máximos (escolha do usuário) permanente por alma absorvida. No entanto, cada alma absorvida manifesta-se como uma voz distinta na mente do usuário, causando pesadelos e gradual perda de identidade. Acima de 5 almas, o usuário não pode mais distinguir seus próprios pensamentos.',
            weight: 1.5,
            space: 'Capacete',
            quantity: 1,
            rogueliteRarity: 'Amaldiçoado'
        },
        {
            name: 'Vorlag',
            rarity: 'Amaldiçoado',
            kind: 'Equipamento',
            description: 'Anel que permite congelar o tempo por 6 segundos uma vez por dia, mas cada uso envelhece o usuário em 1 ano e causa perda permanente de 5 pontos de MP máximo. O usuário se torna visível para entidades extra-dimensionais que caçam manipuladores de tempo.',
            weight: 0.2,
            space: 'Anel',
            quantity: 1,
            rogueliteRarity: 'Amaldiçoado'
        },
        {
            name: 'Chasm',
            rarity: 'Amaldiçoado',
            kind: 'Arremessável',
            description: 'Armadilha ritual que captura um inimigo indefinidamente, mas o usuário sente toda a dor que a vítima sofreria. A vítima não pode morrer na armadilha, vivendo em agonia constante. Usuário desenvolve fobia de dor e não pode mais receber benefícios de curas.',
            weight: 2.0,
            quantity: 1,
            rogueliteRarity: 'Amaldiçoado'
        },
        {
            name: 'Tomo de Noctis',
            rarity: 'Amaldiçoado',
            kind: 'Utilidade',
            description: 'Tomo que ensina 4 magias de nível 4 instantaneamente, mas o usuário desenvolve aversão ao conhecimento e não pode mais aprender novas habilidades.',
            weight: 3.0,
            quantity: 1,
            rogueliteRarity: 'Amaldiçoado'
        },
        {
            name: 'Covenant',
            rarity: 'Amaldiçoado',
            kind: 'Equipamento',
            description: 'Corrente que permite controlar uma criatura humanóide permanentemente, mas o usuário sente todas as emoções e dores da criatura controlada. Se a criatura morrer, o usuário sofre dano psíquico igual aos LP máximos dela. A corrente não pode ser removida.',
            weight: 3.5,
            space: 'Anel',
            quantity: 1,
            rogueliteRarity: 'Amaldiçoado'
        },
        {
            name: 'Veto',
            rarity: 'Amaldiçoado',
            kind: 'Consumível',
            description: 'Cálice que drena 10 anos de vida de uma criatura tocada, restaurando todos os LP e MP do usuário e removendo todas as condições negativas. No entanto, o usuário envelhece 1 ano por dia seguinte e desenvolve sede pela vida dos outros. Cada uso torna mais difícil resistir ao impulso de usar novamente.',
            weight: 0.8,
            quantity: 1,
            rogueliteRarity: 'Amaldiçoado'
        },
        {
            name: 'Espelho de Nadir',
            rarity: 'Amaldiçoado',
            kind: 'Utilidade',
            description: 'Espelho que permite criar um clone perfeito do usuário com todos os itens e habilidades, mas o clone tem personalidade própria e busca destruir o original. O usuário compartilha dano com o clone e sente suas emoções. Se o clone morrer, o usuário perde metade de seus atributos permanentemente.',
            weight: 3.0,
            quantity: 1,
            rogueliteRarity: 'Amaldiçoado'
        },
        {
            name: 'Semente do Parasita Cósmico',
            rarity: 'Amaldiçoado',
            kind: 'Consumível',
            description: 'Semente alienígena que concede regeneração completa de 3 LP por turno e imunidade a venenos, mas gradualmente transforma o usuário em hospedeiro. Após 1 mês, o usuário perde controle sobre suas ações e serve ao parasita. Transformação física irreversível começa após 1 semana.',
            weight: 0.1,
            quantity: 1,
            rogueliteRarity: 'Amaldiçoado'
        },
        {
            name: 'Singularidade',
            rarity: 'Amaldiçoado',
            kind: 'Equipamento',
            description: 'Foice que causa morte instantânea em criaturas com menos de 50% da vida, mas cada abate remove 1 ano de vida do usuário e o marca para entidades da morte. Usuário pode ver e comunicar-se com espíritos, mas torna-se visível para mortos-vivos que o caçam incessantemente.',
            weight: 4.0,
            space: 'Não Ocupa',
            quantity: 1,
            rogueliteRarity: 'Amaldiçoado'
        },
        {
            name: 'Olho Ouroboros',
            rarity: 'Amaldiçoado',
            kind: 'Equipamento',
            description: 'Olho encantado que permite ver através de qualquer ilusão, mentira e disfarce, mas revela verdades que destroem a sanidade. Usuário vê o pior de cada pessoa e não pode mais confiar em ninguém. Cada verdade revelada causa 1d6 de dano mental permanente. Desenvolve paranoia severa.',
            weight: 0.3,
            space: 'Amuleto',
            quantity: 1,
            rogueliteRarity: 'Amaldiçoado'
        },
        {
            name: 'Astra',
            rarity: 'Amaldiçoado',
            kind: 'Utilidade',
            description: 'Espelho que divide o usuário entre 3 linhas do tempo simultâneas. Cada ação é executada em todas as realidades, mas apenas uma linha pode "vencer". As outras duas versões do usuário morrem espiritualmente, causando perda permanente de memórias e habilidades. O espelho sussurra as possibilidades das outras realidades.',
            weight: 2.0,
            quantity: 1,
            rogueliteRarity: 'Amaldiçoado'
        },
        {
            name: 'Contrato Umbra',
            rarity: 'Amaldiçoado',
            kind: 'Consumível',
            description: 'Pacto que permite "emprestar" 20 pontos de LP ou MP do seu eu futuro por 1 hora. Após o efeito, seu eu futuro cobra a dívida: você perde permanentemente 40 pontos do atributo oposto ao qual pegou (MP -> LP e vice-versa). Cada uso aumenta a chance de colapso temporal que apaga sua existência.',
            weight: 0.1,
            quantity: 1,
            rogueliteRarity: 'Amaldiçoado'
        },
        {
            name: 'Coração Vermillion',
            rarity: 'Amaldiçoado',
            kind: 'Equipamento',
            description: 'Implante que transforma seu coração em magma vivo. Concede imunidade a fogo e +10 em todos os testes, mas seu corpo lentamente se transforma em rocha vulcânica. Após 30 dias, você se torna uma estátua consciente de obsidiana. A cada semana, perde 1 ponto de agilidade permanente.',
            weight: 2.5,
            space: 'Não Ocupa',
            quantity: 1,
            rogueliteRarity: 'Amaldiçoado'
        },
        {
            name: 'Pacto Nihilis',
            rarity: 'Amaldiçoado',
            kind: 'Utilidade',
            description: 'Runa gravada na pele que permite invocar poder do vazio sem limite (aprende todas magias do elemento "Vácuo"), mas a entidade reclama partes do seu corpo como pagamento. Cada magia poderosa causa perda permanente de 1 órgão interno (olho, mão, perna). A entidade sussurra através das partes ausentes do seu corpo.',
            weight: 0.5,
            quantity: 1,
            rogueliteRarity: 'Amaldiçoado'
        },
        {
            name: 'Dado do Destino',
            rarity: 'Amaldiçoado',
            kind: 'Utilidade',
            description: 'Dado de 20 faces que força sucesso crítico em qualquer teste uma vez por dia, mas garante 3 falhas críticas automáticas no futuro. O universo "cobra" o equilibrio forçado através de acidentes, traições e desgraças. Cada uso aumenta a severidade das falhas futuras.',
            weight: 0.2,
            quantity: 1,
            rogueliteRarity: 'Amaldiçoado'
        },
        {
            name: 'Máscara das Mil Faces',
            rarity: 'Amaldiçoado',
            kind: 'Equipamento',
            description: 'Máscara que permite assumir perfeitamente a aparência e habilidades de qualquer pessoa morta, mas cada transformação deixa parte de sua essência presa no corpo original. Após 10 transformações, sua identidade original está espalhada por 10 corpos diferentes, e você não pode mais determinar quem é realmente.',
            weight: 1.0,
            space: 'Não Ocupa',
            quantity: 1,
            rogueliteRarity: 'Amaldiçoado'
        },
        {
            name: 'Símbolo de Svarog',
            rarity: 'Amaldiçoado',
            kind: 'Consumível',
            description: 'Símbolo que pode apagar uma pessoa ou evento da existência, como se nunca tivesse existido. No entanto, o universo exige equilíbrio: uma pessoa aleatória próxima é apagada também, e todos se esquecem de ambas as vítimas. Usuário desenvolve culpa existencial por atos que ninguém lembra.',
            weight: 0.4,
            quantity: 1,
            rogueliteRarity: 'Amaldiçoado'
        },
        {
            name: 'Marduk',
            rarity: 'Amaldiçoado',
            kind: 'Equipamento',
            description: 'Anel que permite redefinir conceitos fundamentais da realidade em pequena escala (fogo não queima, gravidade reverte), mas cada redefinição corrompe sua compreensão da realidade. Gradualmente, você perde a capacidade de distinguir fantasia de realidade, e suas ações podem alterar o mundo sem sua intenção.',
            weight: 0.3,
            space: 'Anel',
            quantity: 1,
            rogueliteRarity: 'Amaldiçoado'
        },
        {
            name: 'Mandala da Quietude Eterna',
            rarity: 'Lendário',
            kind: 'Equipamento',
            description: 'Uma tatuagem mágica que torna o mantra interno.\\n1x por dia, pode ativar por 5 rodadas. Ganhe 1 Nível de Mantra automaticamente no início de cada turno, sem gastar Ação. Fica livre para se mover, atacar e usar outras habilidades enquanto acumula poder.',
            weight: 0,
            space: 'Não Ocupa',
            quantity: 1,
            rogueliteRarity: 'Lendário'
        },
        {
            name: 'Sino de Lafundes',
            rarity: 'Épico',
            kind: 'Equipamento',
            description: 'Um sino de bronze antigo que libera conhecimento através do som.\\nQuando libera um Mantra tocando este sino, todos os inimigos afetados sofrem -4 em testes de resistência mágica por 1 rodada. Prepara o campo de batalha para outros conjuradores do grupo.',
            weight: 1.2,
            space: 'Amuleto',
            quantity: 1,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Vela da Meditação Profunda',
            rarity: 'Raro',
            kind: 'Consumível',
            description: 'Uma vela que queima com chama azulada e acalma a mente.\\nAo acender, ganha +2 em testes de Concentração e pode canalizar Mantra como Ação Bônus em vez de Ação principal. Dura 10 minutos ou até ser apagada. Vem com 3 velas.',
            weight: 0.1,
            space: 'Não Ocupa',
            quantity: 3,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Incenso dos Sábios',
            rarity: 'Incomum',
            kind: 'Consumível',
            description: 'Um incenso especial que aumenta a conexão espiritual.\\nEnquanto queima, aliados a até 10m ganham +1 em todos os testes mentais e você ganha 1 Nível de Mantra extra sempre que canaliza. Dura 1 hora. Vem com 5 bastões.',
            weight: 0.2,
            space: 'Não Ocupa',
            quantity: 5,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Cristal de Reserva Mantrica',
            rarity: 'Comum',
            kind: 'Consumível',
            description: 'Um cristal que armazena energia canalizada.\\nPode gastar 10 MP para armazenar 1 Nível de Mantra no cristal. Como Ação Livre, pode liberar todos os níveis armazenados instantaneamente. Máximo de 3 níveis por cristal. Vem com 5 cristais.',
            weight: 0.1,
            space: 'Não Ocupa',
            quantity: 5,
            rogueliteRarity: 'Comum'
        },
        {
            name: 'Amuleto do Canalizador Móvel',
            rarity: 'Incomum',
            kind: 'Equipamento',
            description: 'Um amuleto que permite movimento enquanto canaliza.\\nPode se mover até 3m por rodada enquanto canaliza Mantra sem perder o foco. No entanto, cada movimento aumenta a dificuldade do teste de Concentração em +2.',
            weight: 0.5,
            space: 'Amuleto',
            quantity: 1,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Pergaminho do Mantra Emergencial',
            rarity: 'Raro',
            kind: 'Consumível',
            description: 'Um pergaminho com mantra pré-canalizado.\\n1x por combate, pode quebrar este pergaminho para ganhar instantaneamente 3 Níveis de Mantra. Os níveis desaparecem se não usados em 2 rodadas. Vem com 2 pergaminhos.',
            weight: 0.1,
            space: 'Não Ocupa',
            quantity: 2,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Anel de Duplicação Mantrica',
            rarity: 'Épico',
            kind: 'Equipamento',
            description: 'Um anel que permite canalizar dois mantras simultaneamente.\\nPode manter dois Mantras diferentes canalizando ao mesmo tempo, mas cada teste de Concentração é feito com desvantagem. Libera ambos os efeitos quando desejar.',
            weight: 0.3,
            space: 'Anel',
            quantity: 1,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Cálice da Transmutação Vital',
            rarity: 'Raro',
            kind: 'Equipamento',
            description: 'Um cálice que converte vida em poder mantrico.\\nPode gastar 10 LP para ganhar 1 Nível de Mantra instantaneamente, sem precisar canalizar. Não pode usar se estiver com menos de 25% da vida máxima.',
            weight: 1.0,
            space: 'Amuleto',
            quantity: 1,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Orbe do Eco Mantrico',
            rarity: 'Épico',
            kind: 'Equipamento',
            description: 'Um orbe que captura ecos de poder liberado.\\nQuando você libera um Mantra, o orbe armazena 50% dos níveis gastos. Como Ação Bônus, pode liberar os níveis armazenados como um efeito aleatório de Mantra (determinado pelo Mestre).',
            weight: 2.0,
            space: 'Não Ocupa',
            quantity: 1,
            rogueliteRarity: 'Épico'
        },
        {
            name: 'Vela da Sobrecarga Controlada',
            rarity: 'Incomum',
            kind: 'Consumível',
            description: 'Uma vela vermelha que permite arriscar canalização rápida.\\nPode tentar canalizar 2 Níveis de Mantra em 1 Ação, mas deve fazer teste de Vontade (DT 15). Se falhar, perde todos os níveis acumulados e sofre 2d6 de dano psíquico. Vem com 3 velas.',
            weight: 0.1,
            space: 'Não Ocupa',
            quantity: 3,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Tatuagem do Prisioneiro Mantrico',
            rarity: 'Amaldiçoado',
            kind: 'Equipamento',
            description: 'Uma tatuagem que aprisiona poder dentro do corpo.\\nPode acumular Níveis de Mantra infinitamente, mas cada nível acima de 5 causa 1d4 de dano interno por turno. Quando liberar, o dano é duplicado mas causa efeito em área gigante (15m). A tatuagem se espalha pelo corpo quanto mais poder acumula.',
            weight: 0,
            space: 'Não Ocupa',
            quantity: 1,
            rogueliteRarity: 'Amaldiçoado'
        },
        {
            name: 'Semente do Mantra Auto-sustentável',
            rarity: 'Único',
            kind: 'Consumível',
            description: 'Uma semente mágica que cria um ciclo infinito.\\nPlante esta semente para criar um Mantra automático que se recarrega sozinho. Ganhe 1 Nível de Mantra a cada 2 rodadas automaticamente, sem custo. No entanto, você perde permanentemente 10 MP máximo na primeira vez que utilizar. Efeito permanente.',
            weight: 0.2,
            space: 'Não Ocupa',
            quantity: 1,
            rogueliteRarity: 'Único'
        },
        {
            name: 'Luvas do Toque Conduzido',
            rarity: 'Incomum',
            kind: 'Equipamento',
            description: 'Luvas que permitem transferir Mantra por toque.\\nPode tocar um aliado para transferir até 2 Níveis de Mantra por rodada. Ou tocar um inimigo para drenar 1 Nível (se eles tiverem o sistema Mantra).',
            weight: 0.8,
            space: 'Luvas',
            quantity: 1,
            rogueliteRarity: 'Incomum'
        },
        {
            name: 'Capa do Dissipador Mantrico',
            rarity: 'Raro',
            kind: 'Equipamento',
            description: 'Uma capa que protege contra interferência mantrica.\\nImune a efeitos que interrompem canalização. Aliados sob a capa ganham +3 em testes de Concentração.',
            weight: 3.0,
            space: 'Costas',
            quantity: 1,
            rogueliteRarity: 'Raro'
        },
        {
            name: 'Cinto de Portais Arcanos',
            rarity: 'Lendário',
            kind: 'Equipamento',
            description: 'Um cinto mágico com portais dimensionais que expandem os espaços para equipamentos. Aumenta os espaços de Amuleto e Anel para 4 cada, permitindo equipar mais itens mágicos simultaneamente.',
            weight: 1.5,
            space: 'Cinto',
            quantity: 1,
            rogueliteRarity: 'Lendário'
        }
    ]
}

export const defaultItem = {
    name: '',
    description: '',
    rarity: 'Comum',
    weight: 0,
    quantity: 1,
    kind: 'Padrão'
}