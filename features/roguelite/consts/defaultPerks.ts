import type { RarityType } from '@models/types/string';
import type { Perk } from '../models';
import { PerkTypeEnum } from '@/enums/rogueliteEnum';

export const defaultPerks: Record<RarityType, Array<Perk<any>>> = {
    Comum: [
        {
            name: 'Postura Defensiva',
            description: 'Reduz todo dano recebido em -1 ponto.',
            rarity: 'Comum',
            perkType: PerkTypeEnum.SKILL,
            weight: 20,
            effects: [
                {
                    type: 'add',
                    target: 'damageReduction',
                    value: 1,
                    description: 'Reduz todo dano recebido em -1 ponto'
                }
            ]
        },
        {
            name: 'Foco em Combate',
            description: '+2 em testes de Luta e Pontaria.',
            rarity: 'Comum',
            perkType: PerkTypeEnum.EXPERTISE,
            weight: 25,
            effects: [
                {
                    type: 'add',
                    target: 'expertises.Luta',
                    value: 2,
                    description: '+2 em testes de Luta'
                },
                {
                    type: 'add',
                    target: 'expertises.Pontaria',
                    value: 2,
                    description: '+2 em testes de Pontaria'
                }
            ]
        },
        {
            name: 'Pés Leves',
            description: '+2 em testes de Furtividade e Agilidade.',
            rarity: 'Comum',
            perkType: PerkTypeEnum.EXPERTISE,
            weight: 20,
            effects: [
                {
                    type: 'add',
                    target: 'expertises.Furtividade',
                    value: 3,
                    description: '+3 em testes de Furtividade'
                },
                {
                    type: 'add',
                    target: 'expertises.Agilidade',
                    value: 3,
                    description: '+3 em testes de Agilidade'
                }
            ]
        },
        {
            name: 'Voz Autoritária',
            description: '+2 em testes de Liderança e Intimidação.',
            rarity: 'Comum',
            perkType: PerkTypeEnum.EXPERTISE,
            weight: 20,
            effects: [
                {
                    type: 'add',
                    target: 'expertises.Liderança',
                    value: 2,
                    description: '+2 em testes de Liderança'
                },
                {
                    type: 'add',
                    target: 'expertises.Intimidação',
                    value: 2,
                    description: '+2 em testes de Intimidação'
                }
            ]
        }
    ],
    Incomum: [
        {
            name: 'Canalizar Mantra',
            description: 'Gaste sua Ação principal para iniciar um cântico, focando sua mente. Cada rodada mantendo a canalização, ganhe 1 Nível de Mantra. Como Ação Bônus, pode liberar os níveis acumulados.',
            rarity: 'Incomum',
            perkType: PerkTypeEnum.SKILL,
            weight: 15
        },
        {
            name: 'Recipiente Vital',
            description: 'Absorve 50% da diferença entre a cura recebida e a sua vida atual como LP temporário acima do máximo (máximo dobro dos LPs máximos). LP temporários diminuem em 2 por turno e não podem ser regenerados.',
            rarity: 'Incomum',
            perkType: PerkTypeEnum.SKILL,
            weight: 20
        },
        {
            name: 'Reservatório de Mana',
            description: 'Aumenta sua mana máxima em +5 pontos.',
            rarity: 'Incomum',
            perkType: PerkTypeEnum.STATS,
            weight: 25,
            effects: [
                {
                    type: 'add',
                    target: 'maxMp',
                    value: 5,
                    description: 'Aumenta sua mana máxima em +5 pontos'
                }
            ]
        },
        {
            name: 'Pele de Ferro',
            description: 'Aumenta sua vida máxima em +10 pontos.',
            rarity: 'Incomum',
            perkType: PerkTypeEnum.STATS,
            weight: 40,
            effects: [
                {
                    type: 'add',
                    target: 'maxLp',
                    value: 10,
                    description: 'Aumenta sua vida máxima em +10 pontos'
                }
            ]
        },
        {
            name: 'Espaço Arcano',
            description: 'Aumenta seus espaços de magia em +1.',
            rarity: 'Incomum',
            perkType: PerkTypeEnum.BONUS,
            weight: 50,
            effects: [
                {
                    type: 'add',
                    target: 'spellSpace',
                    value: 1,
                    description: 'Aumenta seus espaços de magia em +1'
                }
            ]
        },
        {
            name: 'Peso Pesado',
            description: 'Aumenta sua capacidade de carregar itens em +1Kg',
            rarity: 'Incomum',
            perkType: PerkTypeEnum.BONUS,
            weight: 50,
            effects: [
                {
                    type: 'add',
                    target: 'cargo.max',
                    value: 1,
                    description: 'Aumenta sua capacidade de carregar itens em +1Kg'
                }
            ]
        },
        {
            name: 'Sangue Fervilhante',
            description: 'Quando você está sangrando, causa 2d4 de dano de fogo adicional por ataque.',
            rarity: 'Incomum',
            perkType: PerkTypeEnum.SKILL,
            weight: 25,
        },
        {
            name: 'Resiliência Congelada',
            description: 'Você se move normalmente mesmo sob efeito de congelamento, mas perde -3 LP por mada movimento.',
            rarity: 'Incomum',
            perkType: PerkTypeEnum.SKILL,
            weight: 20,
        },
        {
            name: 'Fúria Concentrada',
            description: 'Quando está com medo, ganha +3 em ataques mas não pode fugir do combate.',
            rarity: 'Incomum',
            perkType: PerkTypeEnum.SKILL,
            weight: 15,
        },
        {
            name: 'Reciclagem Mágica',
            description: 'Magias de nível 1 ou inferiores que falham retornam 50% do custo de mana.',
            rarity: 'Incomum',
            perkType: PerkTypeEnum.SKILL,
            weight: 20,
        },
        {
            name: 'Precisão Cirúrgica',
            description: 'Críticos com armas de precisão (Rifle de Atirador e Arco) causam sangramento simples',
            rarity: 'Incomum',
            perkType: PerkTypeEnum.SKILL,
            weight: 20,
        },
        {
            name: 'Sinergia de Destreza',
            description: '+1 em todas as perícias baseadas em Destreza (Agilidade, Furtividade, Pontaria, Ladinagem, Condução).',
            rarity: 'Incomum',
            perkType: PerkTypeEnum.EXPERTISE,
            weight: 25,
            effects: [
                {
                    type: 'add',
                    target: 'expertises.Agilidade',
                    value: 1,
                    description: '+1 em Agilidade'
                },
                {
                    type: 'add',
                    target: 'expertises.Furtividade',
                    value: 1,
                    description: '+1 em Furtividade'
                },
                {
                    type: 'add',
                    target: 'expertises.Pontaria',
                    value: 1,
                    description: '+1 em Pontaria'
                },
                {
                    type: 'add',
                    target: 'expertises.Ladinagem',
                    value: 1,
                    description: '+1 em Ladinagem'
                },
                {
                    type: 'add',
                    target: 'expertises.Condução',
                    value: 1,
                    description: '+1 em Condução'
                }
            ]
        },
        {
            name: 'Mente Analítica',
            description: '+1 em todas as perícias baseadas em Lógica (Engenharia, Investigação, Tática, Tecnologia, Competência).',
            rarity: 'Incomum',
            perkType: PerkTypeEnum.EXPERTISE,
            weight: 25,
            effects: [
                {
                    type: 'add',
                    target: 'expertises.Engenharia',
                    value: 1,
                    description: '+1 em Engenharia'
                },
                {
                    type: 'add',
                    target: 'expertises.Investigação',
                    value: 1,
                    description: '+1 em Investigação'
                },
                {
                    type: 'add',
                    target: 'expertises.Tática',
                    value: 1,
                    description: '+1 em Tática'
                },
                {
                    type: 'add',
                    target: 'expertises.Tecnologia',
                    value: 1,
                    description: '+1 em Tecnologia'
                },
                {
                    type: 'add',
                    target: 'expertises.Competência',
                    value: 1,
                    description: '+1 em Competência'
                }
            ]
        },
        {
            name: 'Carisma Magnético',
            description: '+1 em todas as perícias baseadas em Carisma (Comunicação, Diplomacia, Enganação, Intimidação, Interrogação, Liderança, Persuasão).',
            rarity: 'Incomum',
            perkType: PerkTypeEnum.EXPERTISE,
            weight: 30,
            effects: [
                {
                    type: 'add',
                    target: 'expertises.Comunicação',
                    value: 1,
                    description: '+1 em Comunicação'
                },
                {
                    type: 'add',
                    target: 'expertises.Diplomacia',
                    value: 1,
                    description: '+1 em Diplomacia'
                },
                {
                    type: 'add',
                    target: 'expertises.Enganação',
                    value: 1,
                    description: '+1 em Enganação'
                },
                {
                    type: 'add',
                    target: 'expertises.Intimidação',
                    value: 1,
                    description: '+1 em Intimidação'
                },
                {
                    type: 'add',
                    target: 'expertises.Interrogação',
                    value: 1,
                    description: '+1 em Interrogação'
                },
                {
                    type: 'add',
                    target: 'expertises.Liderança',
                    value: 1,
                    description: '+1 em Liderança'
                },
                {
                    type: 'add',
                    target: 'expertises.Persuasão',
                    value: 1,
                    description: '+1 em Persuasão'
                }
            ]
        }
    ],
    Raro: [
        {
            name: 'Mantra de Vajra',
            description: 'Ao liberar, ganhe PV temporários e dano extra de Raio em ataques corpo-a-corpo. 5 PV e +1d6 de dano POR Nível de Mantra acumulado.',
            rarity: 'Raro',
            perkType: PerkTypeEnum.SKILL,
            weight: 12,
        },
        {
            name: 'Mantra de Agni',
            description: 'Ao liberar, cria explosão de fogo sagrado. 3d8 de dano multiplicado pelos Níveis de Mantra acumulados em área.',
            rarity: 'Raro',
            perkType: PerkTypeEnum.SKILL,
            weight: 12,
        },
        {
            name: 'Mantra de Shanti',
            description: 'Ao liberar, onda de energia calmingante. Inimigos fazem teste de Vontade. Se falharem, ficam Atordoados por rodadas igual aos Níveis de Mantra.',
            rarity: 'Raro',
            perkType: PerkTypeEnum.SKILL,
            weight: 12,
        },
        {
            name: 'Com Sorte',
            description: 'Você pode rerolar os perks que vieram uma vez toda vez que for obter uma recompensa',
            rarity: 'Raro',
            perkType: PerkTypeEnum.BONUS,
            weight: 40,
        },
        {
            name: 'Corpo em Chamas',
            description: 'Você se torna imune a queimadura e inimigos que o atacarem sofrem 2d6 de dano de fogo.',
            rarity: 'Raro',
            perkType: PerkTypeEnum.SKILL,
            weight: 25,
        },
        {
            name: 'Mente Fria',
            description: 'Quando congelado, ganha +5 em testes mentais mas não pode realizar ações físicas.',
            rarity: 'Raro',
            perkType: PerkTypeEnum.SKILL,
            weight: 20,
        },
        {
            name: 'Canalizador de Dor',
            description: 'Converta 50% do dano recebido em bônus de ataque no próximo turno (máximo +10).',
            rarity: 'Raro',
            perkType: PerkTypeEnum.SKILL,
            weight: 15,
        },
        {
            name: 'Adaptador Rápido',
            description: 'Reduz duração de estados negativos em 1 turno, mas estados positivos duram 1 turno a menos.',
            rarity: 'Raro',
            perkType: PerkTypeEnum.SKILL,
            weight: 20,
        },
        {
            name: "Evolução Elemental",
            description: "Desbloqueia o estágio 2 ou 3 de uma magia selecionada.",
            rarity: 'Raro',
            perkType: PerkTypeEnum.BONUS,
            weight: 75,
        },
        {
            name: 'Mestre de Perícias',
            description: 'Escolha uma perícia. Seu valor máximo nesta perícia aumenta em +3.',
            rarity: 'Raro',
            perkType: PerkTypeEnum.EXPERTISE,
            weight: 20,
            effects: [
                {
                    type: 'add',
                    target: 'expertiseMastery',
                    value: 3,
                    description: '+3 máximo na perícia escolhida'
                },
                {
                    type: 'add',
                    target: 'expertiseBonus',
                    value: 2,
                    description: '+2 permanente na perícia escolhida'
                }
            ]
        },
        {
            name: 'Acessório - {accessory}',
            description: 'Ao escolher, dá o acessório "{accessory.toUpperCase()}".',
            rarity: 'Raro',
            perkType: PerkTypeEnum.EXPERTISE,
            weight: 30,
        },
        {
            name: 'Substituição de Perícias',
            description: 'Pode usar Intimidação no lugar de Luta para ataques corpo-a-corpo, ou Enganação no lugar de Furtividade para se esconder.',
            rarity: 'Raro',
            perkType: PerkTypeEnum.EXPERTISE,
            weight: 18,
            effects: [
                {
                    type: 'expertise_substitution',
                    target: 'Luta',
                    value: 'Intimidação',
                    description: 'Usar Intimidação para ataques corpo-a-corpo'
                },
                {
                    type: 'expertise_substitution',
                    target: 'Furtividade',
                    value: 'Enganação',
                    description: 'Usar Enganação para se esconder'
                }
            ]
        },
        {
            name: 'Evolução Elemental II',
            description: 'Desbloqueia o estágio "MAESTRIA" de uma magia nível 4.',
            rarity: 'Épico',
            perkType: PerkTypeEnum.BONUS,
            weight: 25
        },
    ],
    Épico: [
        {
            name: 'Ressonância Harmônica',
            description: 'Enquanto canaliza Mantra, aliados a até 5m ganham +2 em testes de RES. Física e regeneram 1d4 PV por turno.',
            rarity: 'Épico',
            perkType: PerkTypeEnum.SKILL,
            weight: 8,
        },
        {
            name: 'Indecisão',
            description: 'Períodos de escolha agora contém 6 vantagens ao invés de 5.',
            rarity: 'Épico',
            perkType: PerkTypeEnum.BONUS,
            weight: 30,
        },
        {
            name: 'Foco Inabalável',
            description: 'Ganhe +5 em testes de Concentração para manter Mantra. Enquanto canaliza, ganhe +2 em Reflexos e RES. Mental.',
            rarity: 'Épico',
            perkType: PerkTypeEnum.SKILL,
            weight: 8,
        },
        {
            name: 'Conversor Vital',
            description: 'Uma vez por turno, pode converter 10 LP extras em 5 MP extras ou 2 AP extras. A conversão preserva as regras de decaimento originais.',
            rarity: 'Épico',
            perkType: PerkTypeEnum.SKILL,
            weight: 15,
        },
        {
            name: 'Metamorfose Elemental',
            description: 'Ao sofrer dano elemental, ganha resistência a esse elemento (Recebe metade do dano) por 3 turnos, mas vulnerabilidade ao oposto.',
            rarity: 'Épico',
            perkType: PerkTypeEnum.SKILL,
            weight: 25,
        },
        {
            name: 'Sintetizador de Estados',
            description: 'Quando ganha um estado negativo, tem 25% de chance de converter em estado positivo aleatório.',
            rarity: 'Épico',
            perkType: PerkTypeEnum.SKILL,
            weight: 20,
            effects: [
                {
                    type: 'state_conversion',
                    target: 'negative_to_positive',
                    value: 0.25,
                    description: '25% chance de converter estado negativo em positivo'
                }
            ]
        },
        {
            name: 'Resonância Mágica',
            description: 'Cada magia conjurada aumenta o dano da próxima em +10%, acumulando até +50%.',
            rarity: 'Épico',
            perkType: PerkTypeEnum.SKILL,
            weight: 20,
        },
        {
            name: 'Regeneração Celular',
            description: 'Cura 1 PV por turno automaticamente, mas sofre 5 dano extra sempre que é atingido por crítico.',
            rarity: 'Épico',
            perkType: PerkTypeEnum.SKILL,
            weight: 15,
            effects: [
                {
                    type: 'regeneration',
                    target: 'passive_heal',
                    value: 1,
                    description: '+1 cura por turno'
                }
            ]
        },
        {
            name: 'Campo de Força Reativo',
            description: 'Primeiro ataque de cada inimigo contra você tem 50% de chance de falhar. Caso falhar, você perde 2 MP.',
            rarity: 'Épico',
            perkType: PerkTypeEnum.SKILL,
            weight: 20
        },
         {
            name: 'Evolução Elemental II',
            description: 'Desbloqueia o estágio "MAESTRIA" de uma magia nível 4.',
            rarity: 'Épico',
            perkType: PerkTypeEnum.BONUS,
            weight: 25
        },
        {
            name: 'Evolução',
            description: 'Aumenta seu nível em +1.',
            rarity: 'Épico',
            perkType: PerkTypeEnum.BONUS,
            weight: 50,
            effects: [
                {
                    type: 'add',
                    target: 'level',
                    value: 1,
                    description: 'Aumenta seu nível em +1'
                }
            ]
        },
        {
            name: 'Perfeição em Perícia',
            description: 'Escolha duas perícias. Seus resultados mínimos sempre são 10.',
            rarity: 'Épico',
            perkType: PerkTypeEnum.SKILL,
            weight: 15,
            effects: [
                {
                    type: 'set',
                    target: 'expertise',
                    value: 2,
                    description: 'Duas perícias com resultados mínimos de 10'
                }
            ]
        },
    ],
    Lendário: [
        {
            name: 'Mestre dos Elementos',
            description: 'Você pode conjurar duas magias diferentes no mesmo turno, mas ambas custam o dobro de mana.',
            rarity: 'Lendário',
            perkType: PerkTypeEnum.SKILL,
            weight: 20
        },
        {
            name: 'Absorvedor de Alma',
            description: 'Ao derrotar um inimigo, absorve 10% de sua vida máxima e 1 habilidade aleatória por 1 minuto.',
            rarity: 'Lendário',
            perkType: PerkTypeEnum.SKILL,
            weight: 20
        },
        {
            name: 'Eco Arcano',
            description: 'A primeira magia de cada combate não custa mana.',
            rarity: 'Raro',
            perkType: PerkTypeEnum.SKILL,
            weight: 20
        },
        {
            name: 'Baluarte Inabalável',
            description: 'Reduz todo dano recebido em -4 pontos e ganha +30 de vida máxima. Inimigos têm 50% de chance de atacar você em vez de aliados.',
            rarity: 'Lendário',
            perkType: PerkTypeEnum.STATS,
            weight: 25,
        },
        {
            name: 'Muralha Viva',
            description: 'Você pode se tornar imóvel e impassável por 1 minuto. Durante este tempo, você recebe -15 dano mas não pode atacar ou se mover.',
            rarity: 'Lendário',
            perkType: PerkTypeEnum.SKILL,
            weight: 20,
        },
        {
            name: 'Guardião Supremo',
            description: 'Quando um aliado cair (ter seus LPs reduzidos a 0), morrer ou ficar inconsciente, você ganha permanentemente +10 vida máxima e +1 redução de dano. Máximo de 3 stacks.',
            rarity: 'Lendário',
            perkType: PerkTypeEnum.SKILL,
            weight: 15
        },
        {
            name: 'Eco de Sobrevivência',
            description: 'Quando LP temporários acabam, ganha 15 MP e +2 AP extra instantaneamente. Cada turno drena 1 de AP extra. Funciona uma vez por combate.',
            rarity: 'Lendário',
            perkType: PerkTypeEnum.SKILL,
            weight: 20
        },
    ],
    Único: [
        {
            name: 'Escolhido dos Deuses',
            description: 'Duas vezes por dia, pode invocar intervenção divina: sucesso automático em qualquer teste ou ataque.',
            rarity: 'Único',
            perkType: PerkTypeEnum.SKILL,
            weight: 30
        },
        {
            name: 'Forjador de Destinos',
            description: 'Pode escolher o resultado de qualquer rolagem de dado 3 vezes por dia, mas cada escolha envelhece você 2 anos.',
            rarity: 'Único',
            perkType: PerkTypeEnum.SKILL,
            weight: 15
        },
        {
            name: 'Titã da Montanha',
            description: 'Você se torna um com a terra. Imune a qualquer tipo de dano físico, mas não possui mais ações de movimento. Aliados podem usar seu corpo como cobertura.',
            rarity: 'Único',
            perkType: PerkTypeEnum.SKILL,
            weight: 25
        },
        {
            name: 'Coração Indestrutível',
            description: 'Seu coração bate em ritmo com a terra. Regenere 10% da vida máxima por turno, mas não pode usar magias ou habilidades especiais.',
            rarity: 'Único',
            perkType: PerkTypeEnum.SKILL,
            weight: 20
        },
        {
            name: 'Ancião das Batalhas',
            description: 'Cada vez que você é atingido, ganha +1 permanente em todos os atributos. Sem limite de stacks, mas cada stack envelhece você 1 ano.',
            rarity: 'Único',
            perkType: PerkTypeEnum.SKILL,
            weight: 15,
            effects: [
                {
                    type: 'permanent_stat_gain',
                    target: 'all_attributes',
                    value: 1,
                    trigger: 'hit_taken',
                    description: '+1 em todos os atributos por vez que é atingido'
                },
                {
                    type: 'aging_curse',
                    target: 'per_hit',
                    value: 1,
                    description: 'Envelhece 1 ano por vez que é atingido'
                }
            ]
        },
         {
            name: 'Nexus Vital',
            description: '50% do dano que você sofre é redistribuído igualmente entre todos os inimigos em 10m.',
            rarity: 'Lendário',
            perkType: PerkTypeEnum.SKILL,
            weight: 20
        },
        {
            name: 'Adaptabilidade Perfeita',
            description: 'Pode usar qualquer perícia no lugar de qualquer outra, mas com -4 na rolagem. Uma vez por combate, pode fazer isso sem penalidade.',
            rarity: 'Lendário',
            perkType: PerkTypeEnum.EXPERTISE,
            weight: 18,
            effects: [
                {
                    type: 'universal_substitution',
                    target: 'any_expertise',
                    value: -4,
                    description: 'Usar qualquer perícia no lugar de outra com -4'
                },
                {
                    type: 'perfect_substitution',
                    target: 'once_per_combat',
                    value: 0,
                    description: 'Sem penalidade uma vez por combate'
                }
            ]
        },
        {
            name: 'Polímata de Batalha',
            description: '+2 em TODAS as perícias (38 perícias no total). Você se torna mestre em todas as áreas do conhecimento.',
            rarity: 'Lendário',
            perkType: PerkTypeEnum.EXPERTISE,
            weight: 10,
            effects: [
                {
                    type: 'add',
                    target: 'expertises',
                    value: 2,
                    description: '+2 em todas as 38 perícias'
                }
            ]
        },
    ],
    Mágico: [
        {
            name: 'Sangue Arcano',
            description: 'Seu sangue é pura mana. Regenera +2 MP ao sofrer dano.',
            rarity: 'Mágico',
            perkType: PerkTypeEnum.SKILL,
            weight: 25
        },
        {
            name: 'Pacto Elemental',
            description: 'Escolha um elemento: +50% dano desse elemento, -50% dano de todos os outros elementos.',
            rarity: 'Mágico',
            perkType: PerkTypeEnum.SKILL,
            weight: 20,
            effects: [
                {
                    type: 'elemental_pact',
                    target: 'chosen_element',
                    value: 0.5,
                    description: '+50% dano do elemento escolhido'
                },
                {
                    type: 'elemental_penalty',
                    target: 'other_elements',
                    value: -0.25,
                    description: '-25% dano de outros elementos'
                }
            ]
        },
        {
            name: 'Canal Vivo',
            description: 'Magias passam através de você para atingir alvos atrás, mas você sofre 10% do dano das próprias magias.',
            rarity: 'Mágico',
            perkType: PerkTypeEnum.SKILL,
            weight: 20,
            effects: [
                {
                    type: 'spell_conduit',
                    target: 'through_caster',
                    value: 1,
                    description: 'Magias atingem alvos através de você'
                },
                {
                    type: 'spell_backlash',
                    target: 'self_damage',
                    description: 'Sofre 25% do dano das próprias magias'
                }
            ]
        },
    ],
    Amaldiçoado: [
        {
            name: 'Anjo da Vingança',
            description: 'Quando abaixo de 25% de vida, todos os seus ataques são críticos automaticamente, mas você morre se receber qualquer dano.',
            rarity: 'Lendário',
            perkType: PerkTypeEnum.SKILL,
            weight: 25,
        },
        {
            name: 'Toque Vampírico',
            description: 'Seu máximo de vida é reduzido em 50%, porém você se cura em 1d6+1 LP toda vez que atacar uma criatura. Esta habilidade pode causar sobrecura.',
            rarity: 'Amaldiçoado',
            perkType: PerkTypeEnum.SKILL,
            weight: 10,
            effects: [
                {
                    type: 'multiply',
                    target: 'stats.maxLp',
                    value: 0.5,
                    description: 'Reduz vida máxima em 50%'
                },
                {
                    type: 'add',
                    target: 'lifeStealOnAttack',
                    value: '1d6+1',
                    description: 'Cura 1d6+1 ao atacar'
                }
            ]
        },
        {
            name: 'Portador da Eternidade',
            description: 'Não pode morrer, mas quando atingir 0 PV, fica inconsciente por 1 minuto e perde todos os itens.',
            rarity: 'Amaldiçoado',
            perkType: PerkTypeEnum.SKILL,
            weight: 25,
            effects: [
                {
                    type: 'immortality',
                    target: 'death_prevention',
                    value: 1,
                    description: 'Imortalidade - não pode morrer'
                },
                {
                    type: 'penalty',
                    target: 'knockout_penalty',
                    value: 1,
                    description: 'Inconsciente 1 minuto + perde itens ao atingir 0 PV'
                }
            ]
        },
        {
            name: 'Forma Etérea',
            description: 'Pode se tornar intangível por 1 segundo, mas cada uso consome 10% de sua vida máxima.',
            rarity: 'Amaldiçoado',
            perkType: PerkTypeEnum.SKILL,
            weight: 20,
            effects: [
                {
                    type: 'phase_shift',
                    target: 'intangible',
                    value: 1,
                    duration: 1,
                    description: 'Intangibilidade por 1 segundo'
                },
                {
                    type: 'health_cost',
                    target: 'max_health_percent',
                    value: 0.1,
                    description: '-10% vida máxima por uso'
                }
            ]
        },
        {
            name: 'Vazio Encarnado',
            description: 'Você anula qualquer magia em 5m ao seu redor, mas também não pode conjurar magias nem usar itens mágicos.',
            rarity: 'Amaldiçoado',
            perkType: PerkTypeEnum.SKILL,
            weight: 10,
            effects: [
                {
                    type: 'antimagic_aura',
                    target: 'area',
                    value: 5,
                    description: 'Anula magias em 5m ao redor'
                },
                {
                    type: 'self_antimagic',
                    target: 'no_magic',
                    value: 1,
                    description: 'Não pode conjurar magias ou usar itens mágicos'
                }
            ]
        },
        {
            name: 'Fome Insaciável',
            description: 'Dobra o dano causado, mas precisa consumir um item de inventário a cada 5 minutos ou morre de fome.',
            rarity: 'Amaldiçoado',
            perkType: PerkTypeEnum.SKILL,
            weight: 30,
            effects: [
                {
                    type: 'damage_multiplier',
                    target: 'all_damage',
                    value: 2,
                    description: 'Dobra todo o dano causado'
                },
                {
                    type: 'consumption_curse',
                    target: 'inventory_item',
                    value: 1,
                    interval: 120,
                    description: 'Deve consumir item a cada 2 minutos ou morre'
                }
            ]
        },
        {
            name: 'Bateria Orgânica',
            description: 'AP acima do máximo adiciona +5 de dano por cada AP extra. AP extras diminuem em 1 por turno.',
            rarity: 'Raro',
            perkType: PerkTypeEnum.SKILL,
            weight: 15,
            effects: [
                {
                    type: 'resource_damage',
                    target: 'temp_ap',
                    value: 5,
                    threshold: 1,
                    description: '5 dano/turno por cada AP extra'
                },
                {
                    type: 'damage_bonus',
                    target: 'temp_ap_active',
                    value: 0.25,
                    description: '+25% dano com AP extras'
                }
            ]
        },
        {
            name: 'Recipiente Infinito',
            description: 'LP temporários não têm limite máximo, mas diminuem em 4 por turno. Cada 5 LP extras concedem +1 em RES. Física, Atletismo, Força e Luta.',
            rarity: 'Amaldiçoado',
            perkType: PerkTypeEnum.SKILL,
            weight: 25,
            effects: [
                {
                    type: 'unlimited_temp_hp',
                    target: 'temp_hp',
                    decay: 3,
                    description: 'LP temporários ilimitados, -3/turno'
                },
                {
                    type: 'scaling_bonus',
                    target: 'temp_hp_threshold',
                    threshold: 5,
                    bonus: 1,
                    description: '+1 testes físicos por cada 5 LP extras'
                }
            ]
        },
        {
            name: 'Sobrecarga Sacrificial',
            description: 'Pode gastar 20 LP extras para tornar a próxima magia gratuita e 50% mais poderosa.',
            rarity: 'Amaldiçoado',
            perkType: PerkTypeEnum.SKILL,
            weight: 30,
            effects: [
                {
                    type: 'resource_sacrifice',
                    target: 'temp_hp',
                    cost: 10,
                    spell_free: true,
                    power_bonus: 1.5,
                    description: 'Gaste 10 LP extras: magia gratuita +50% poder'
                }
            ]
        }
    ],
}

/**
 * Gera uma nova instância de um perk aleatório de uma raridade específica
 * @param rarity - Raridade desejada
 * @param seed - Semente para geração aleatória (opcional)
 * @returns Nova instância de perk ou undefined se não houver perks disponíveis
 */
// export function getRandomPerk(rarity: RarityType, seed?: string): Perk<any> | undefined {
//     const perkFactories = defaultPerks[rarity] || []

//     if (perkFactories.length === 0) {
//         return undefined
//     }

//     // Se houver apenas um perk, retorna ele
//     if (perkFactories.length === 1) {
//         return perkFactories[0]()
//     }

//     // Seleciona aleatoriamente uma das fábricas de perks
//     const randomIndex = seed ?
//         Math.floor(create(seed)(perkFactories.length)) :
//         Math.floor(Math.random() * perkFactories.length)

//     return perkFactories[randomIndex]()
// }

/**
 * Gera múltiplas instâncias de perks aleatórios
 * @param count - Número de perks a gerar
 * @param rarity - Raridade desejada (opcional, será aleatória se não fornecida)
 * @param seed - Semente para geração aleatória (opcional)
 * @returns Array com novas instâncias de perks
 */
// export function getRandomPerks(count: number, rarity?: RarityType, seed?: string): Perk<any>[] {
//     const perks: Perk<any>[] = []
//     const rng = seed ? create(seed) : { random: () => Math.random() }

//     for (let i = 0; i < count; i++) {
//         const targetRarity = rarity ?? getRandomRarity(rng.random() * 100)
//         const perk = getRandomPerk(targetRarity, `${seed ?? 'random'}-${i}`)

//         if (perk) {
//             perks.push(perk)
//         }
//     }

//     return perks
// }

/**
 * Obtém uma raridade aleatória baseada nas probabilidades do sistema
 * @param roll - Número aleatório de 0-100
 * @returns Raridade selecionada
 */
// function getRandomRarity(roll: number): RarityType {
//     if (roll < 60) return 'Comum'
//     if (roll < 80) return 'Incomum'
//     if (roll < 90) return 'Raro'
//     if (roll < 96) return 'Épico'
//     if (roll < 99) return 'Lendário'
//     return 'Comum' // Fallback
// }