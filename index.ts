const a = [
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
        kind: 'Utilidade',
        description: 'Amuleto gravado com runas de proteção que concede +2 em testes de RES Mágica para resistir magias inimigas. Reduz dano mágico recebido em 3 pontos. Funciona enquanto estiver equipado.',
        weight: 0.2,
        quantity: 1,
        rogueliteRarity: 'Raro'
    },
    {
        name: 'Anel de Intensidade Mágica',
        rarity: 'Raro',
        kind: 'Utilidade',
        description: 'Anel de prata com gema mágica que aumenta o poder das magias. Concede +2 de bônus em testes de Magia para conjurar e aumenta dano/cura de magias em +4. Requer ORM de nível 2 ou superior para funcionar.',
        weight: 0.1,
        quantity: 1,
        rogueliteRarity: 'Épico'
    },
    {
        name: 'Bastão de Poder Arcano',
        rarity: 'Épico',
        kind: 'Utilidade',
        description: 'Bastão de madeira mágica que armazena até 10 pontos de mana. Pode usar mana do bastão para conjurar magias. Concede +3 em testes de Magia enquanto segurado. Recarrega mana naturalmente 1 ponto por hora.',
        weight: 1.5,
        quantity: 1,
        rogueliteRarity: 'Épico'
    },
    {
        name: 'Varinha de Detectar Magia',
        rarity: 'Comum',
        kind: 'Utilidade',
        description: 'Varinha simples que permite detectar magia em 9m de raio. Vibra quando próximo de itens mágicos, áreas encantadas ou auras mágicas. Funciona indefinidamente, mas requer concentração.',
        weight: 0.3,
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
        kind: 'Utilidade',
        description: 'Capa mágica que permite flutuar até 3m do chão enquanto usada. Usuário pode mover-se lentamente no ar (metade da velocidade normal). Não permite voar, apenas flutuar. Funciona enquanto vestida.',
        weight: 2.0,
        quantity: 1,
        rogueliteRarity: 'Raro'
    },
    {
        name: 'Botas de Velocidade Etérea',
        rarity: 'Raro',
        kind: 'Utilidade',
        description: 'Botas encantadas que concedem +3 em Agilidade e permitem mover-se através de objetos sólidos não-mágicos por até 5 segundos. Requer 1 mana por uso. Funciona enquanto calçadas.',
        weight: 1.5,
        quantity: 1,
        rogueliteRarity: 'Épico'
    },
    {
        name: 'Luvas de Destreza Arcana',
        rarity: 'Épico',
        kind: 'Utilidade',
        description: 'Luvas de couro encantado que concedem +2 em testes de Magia para magias que exigem gestos complexos (nível 3 ou superior). Reduz chance de falha em magias de componente somático. Funciona enquanto usadas.',
        weight: 0.5,
        quantity: 1,
        rogueliteRarity: 'Épico'
    },
    {
        name: 'Colar de Falar com Animais',
        rarity: 'Incomum',
        kind: 'Utilidade',
        description: 'Colar de madeira com símbolos animais que permite comunicar-se com animais enquanto usado. Animais tratam usuário como amigo natural. Não funciona com monstros mágicos ou constructos.',
        weight: 0.3,
        quantity: 1,
        rogueliteRarity: 'Raro'
    },
    {
        name: 'Bracelete de Resistência Elemental',
        rarity: 'Raro',
        kind: 'Utilidade',
        description: 'Bracelete de metal com pedras elementais que concede resistência a fogo, água, ar e terra (metade do dano). Funciona enquanto equipado. Requer 1 mana por 10 pontos de dano reduzidos.',
        weight: 1.0,
        quantity: 1,
        rogueliteRarity: 'Épico'
    },
    {
        name: 'Elmo de Clarividência',
        rarity: 'Épico',
        kind: 'Utilidade',
        description: 'Elmo mágico que permite ver o futuro próximo. Concede vantagem em um teste por turno. Pode usar 3 vezes por dia, cada uso dura 1 minuto. Requer descanso para recarregar.',
        weight: 2.5,
        quantity: 1,
        rogueliteRarity: 'Lendário'
    },
    {
        name: 'Cajado do Elementalista',
        rarity: 'Lendário',
        kind: 'Utilidade',
        description: 'Cajado antigo que canaliza poder elemental. Concede +4 em Magia na magia em que o usuário possui maestria elemental e permite conjurar uma magia desse mesmo elemento por dia sem custo de mana. Aumenta dano elemental em +8. Usuário deve ter maestria elemental.',
        weight: 3.0,
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
        description: 'Poção que duplica o tamanho do usuário por 10 minutos. Concede +4 em Força e +20 PV temporários, mas -2 em Agilidade. Objetos carregados crescem junto. Dura 10 minutos.',
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
        kind: 'Utilidade',
        description: 'Tomo antigo contendo magias arcanas proibidas. Permite aprender uma magia de nível 4 sem pré-requisitos. Ao ser utilizado o livro se desintegra. Livro não pode ser copiado.',
        weight: 5.0,
        quantity: 1,
        rogueliteRarity: 'Único'
    },
    {
        name: 'Cajado do Necromante',
        rarity: 'Lendário',
        kind: 'Utilidade',
        description: 'Cajado de madeira escura que canaliza poder necromântico. Concede +4 em Magia com magias de morte e permite controlar 1 morto-vivo fraco por dia.',
        weight: 2.8,
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
        kind: 'Utilidade',
        description: 'Manto mágico que concede invisibilidade contínua enquanto vestido. Usuário fica invisível mesmo atacando ou conjurando magias. Pode ser ativado/desativado à vontade. Requer 1 mana por hora.',
        weight: 3.0,
        quantity: 1,
        rogueliteRarity: 'Lendário'
    },
    {
        name: 'Bota de Teleporte',
        rarity: 'Épico',
        kind: 'Utilidade',
        description: 'Bota encantada que permite teleportar 15m instantaneamente 3 vezes por dia. Teleporte é silencioso e não provoca ataques de oportunidade. Recarrega ao amanhecer.',
        weight: 1.8,
        quantity: 1,
        rogueliteRarity: 'Lendário'
    },
    {
        name: 'Anel de Regeneração Mágica',
        rarity: 'Lendário',
        kind: 'Utilidade',
        description: 'Anel dourado que regenera 1 ponto de vida por turno automaticamente. Dobra velocidade de cura natural. Funciona enquanto equipado. Não funciona se usuário tiver menos de 1 MP.',
        weight: 0.2,
        quantity: 1,
        rogueliteRarity: 'Lendário'
    },
    {
        name: 'Amuleto Contra Maldições',
        rarity: 'Raro',
        kind: 'Utilidade',
        description: 'Amuleto sagrado que protege contra maldições. Concede vantagem em testes para resistir maldições e pode remover uma maldição existente por semana. Funciona enquanto equipado.',
        weight: 0.3,
        quantity: 1,
        rogueliteRarity: 'Épico'
    },
    {
        name: 'Bastão das Quatro Estações',
        rarity: 'Lendário',
        kind: 'Utilidade',
        description: 'Bastão que permite controlar clima em 100m de raio. Pode criar chuva, neve, vento forte ou sol intenso. Cada mudança climática dura 1 hora. Requer 5 mana por uso. Recarrega diariamente.',
        weight: 2.5,
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
        kind: 'Utilidade',
        description: 'Cajado lendário que pode manipular o tempo. Permite reroll um teste por dia ou voltar 6 segundos no tempo uma vez por semana. Efeitos de tempo afetam apenas usuário e área próxima.',
        weight: 1.8,
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
        kind: 'Utilidade',
        description: 'Manto que permite fundir-se com sombras. Concede invisibilidade em áreas escuras e +4 em Furtividade. Usuário pode se teletransportar entre sombras a até 20m de distância. Funciona enquanto vestido.',
        weight: 2.8,
        quantity: 1,
        rogueliteRarity: 'Lendário'
    },
    {
        name: 'Bastão da Vida',
        rarity: 'Único',
        kind: 'Utilidade',
        description: 'Bastão sagrado que canaliza energia vital. Dobra cura de magias de cura e permite reviver um morto recentemente (até 1 hora) uma vez por mês. Requer 15 mana para reviver. Funciona enquanto segurado.',
        weight: 2.2,
        quantity: 1,
        rogueliteRarity: 'Único'
    },
    {
        name: 'Elmo da Sabedoria Antiga',
        rarity: 'Épico',
        kind: 'Utilidade',
        description: 'Elmo que concede conhecimento ancestral. Concede +3 em todos os testes mentais e permite acessar informações esquecidas uma vez por dia. Requer 5 mana por uso. Funciona enquanto equipado.',
        weight: 3.0,
        quantity: 1,
        rogueliteRarity: 'Épico'
    },
    {
        name: 'Anel dos Desejos Menores',
        rarity: 'Único',
        kind: 'Consumível',
        description: 'Anel poderoso que concede 1 desejo menor por mês. Desejo não pode matar, destruir itens mágicos ou alterar realidade permanentemente. Anel se quebra após 3 desejos.',
        weight: 0.1,
        quantity: 1,
        rogueliteRarity: 'Único'
    }
]

console.log(a.length)