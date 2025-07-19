import type { Classes, Subclasses } from '@types';

export const subclasses: Record<Classes, Partial<Record<Subclasses, { description: string }>>> = {
    'Combatente': {
        'Polimorfo': {
            description: 'Guerreiro que adapta seu corpo para diferentes situações de combate, transformando-se para maximizar eficiência em batalha.'
        },
        'Comandante': {
            description: 'Líder nato que inspira aliados em combate, fornecendo bônus táticos e coordenando ataques em grupo.'
        }
    },

    'Especialista': {
        'Forasteiro': {
            description: 'Sobrevivente habilidoso que domina ambientes naturais, rastreando presas e aproveitando recursos do ambiente.'
        },
        'Errante': {
            description: 'Viajante resiliente que se adapta a qualquer terreno, superando obstáculos e guiando aliados por caminhos perigosos.'
        }
    },
    
    'Feiticeiro': {
        'Conjurador': {
            description: 'Mago que domina a arte de invocar poderosos feitiços, sacrificando velocidade por devastador poder mágico.'
        },
        'Elementalista': {
            description: 'Manipulador dos elementos primordiais, canalizando forças naturais para criar efeitos mágicos devastadores.'
        }
    },

    'Monge': {
        'Discípulo da Fúria': {
            description: 'Combatente que canaliza sua raiva interior em poder físico, transformando emoção em força destrutiva.'
        },
        'Protetor da Alma': {
            description: 'Mestre da harmonia espiritual que protege aliados com auras curativas e barreiras defensivas.'
        }
    },

    'Bruxo': {
        'Necromante': {
            description: 'Praticante das artes sombrias que manipula a morte, comandando mortos-vivos e drenando energia vital.'
        },
        'Espiritista': {
            description: 'Médium que comunica e controla espíritos, invocando entidades do além para auxiliar em combate e cura.'
        }
    },

    'Druida': {
        'Animante': {
            description: 'Guardião que desperta a consciência em plantas e objetos, transformando o ambiente em aliados vivos.'
        },
        'Naturomante': {
            description: 'Canalizador das forças naturais que manipula flora, fauna e fenômenos naturais para proteger e atacar.'
        }
    },

    'Arcano': {
        'Arquimago': {
            description: 'Mestre supremo da magia que dominou os segredos arcanos mais profundos, controlando poderosos feitiços.'
        },
        'Metamágico': {
            description: 'Estudioso que manipula a própria estrutura da magia, alterando e aprimorando feitiços de formas impossíveis.'
        }
    },

    'Ladino': {
        'Espectro': {
            description: 'Assassino das sombras que se move entre dimensões, tornando-se quase invisível e atacando com precisão letal.'
        },
        'Estrategista': {
            description: 'Mestre da manipulação tática que prevê movimentos inimigos e explora fraquezas com precisão calculada.'
        }
    }
}