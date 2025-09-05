/* eslint-disable max-len */
import type { Classes, Subclasses } from '@types';

export const subclasses: Record<Classes, Partial<Record<Subclasses, { description: string }>>> = {
    'Combatente': {
        'Polimorfo': {
            description: 'Guerreiro que adapta seu corpo para diferentes situações de combate, transformando-se para maximizar eficiência em batalha.'
        },
        'Comandante': {
            description: 'Líder nato que inspira aliados em combate, fornecendo bônus táticos e coordenando ataques em grupo.'
        },
        'Aniquilador': {
            description: 'Combatente que abre mão de parte de sua capacidade defensiva para se tornar uma força imparável no campo de batalha, quebrando linhas inimigas e esmagando qualquer um que ouse ficar em seu caminho.'
        }
    },

    'Especialista': {
        'Forasteiro': {
            description: 'Sobrevivente habilidoso que domina ambientes naturais, rastreando presas e aproveitando recursos do ambiente.'
        },
        'Errante': {
            description: 'Viajante resiliente que se adapta a qualquer terreno, superando obstáculos e guiando aliados por caminhos perigosos.'
        },
        'Duelista': {
            description: 'Estrategista que reage e controla o ritmo de um duelo com precisão calculada, transformando qualquer confronto em uma demonstração de superioridade tática.'
        }
    },
    
    'Feiticeiro': {
        'Conjurador': {
            description: 'Mago que domina a arte de invocar poderosos feitiços, sacrificando velocidade por devastador poder mágico.'
        },
        'Elementalista': {
            description: 'Manipulador dos elementos primordiais, canalizando forças naturais para criar efeitos mágicos devastadores.'
        },
        'Caoticista': {
            description: 'Mago feiticeiro que desfaz e reconstrói a magia de formas imprevisíveis. Ele vê os códigos mágicos como fios soltos e se deleita em tecê-los em padrões caóticos'
        }
    },

    'Monge': {
        'Discípulo': {
            description: 'Combatente que canaliza sua raiva interior em poder físico, transformando emoção em força destrutiva.'
        },
        'Protetor': {
            description: 'Especialista da harmonia espiritual que protege aliados com auras curativas e barreiras defensivas.'
        },
        'Mestre': {
            description: 'Monge que transcendeu os limites do corpo físico para manipular diretamente sua energia interior, ou Ki, criando barreiras de força e canalizando seu poder em explosões avassaladoras, transformando-se em uma verdadeira arma de energia viva.'
        }
    },

    'Bruxo': {
        'Necromante': {
            description: 'Praticante das artes sombrias que manipula a morte, comandando mortos-vivos e drenando energia vital.'
        },
        'Espiritista': {
            description: 'Médium que comunica e controla espíritos, invocando entidades do além para auxiliar em combate e cura.'
        },
        'Arauto': {
            description: 'Bruxo que se especializa na arte de amaldiçoar, aplicando feitiços debilitantes que corroem a força vital, a sorte e a sanidade de seus inimigos.'
        }
    },

    'Druida': {
        'Animante': {
            description: 'Guardião que desperta a consciência em plantas e objetos, transformando o ambiente em aliados vivos.'
        },
        'Naturomante': {
            description: 'Canalizador das forças naturais que manipula flora, fauna e fenômenos naturais para proteger e atacar.'
        },
        'Guardião': {
            description: 'O Guardião abraça o lado mais primitivo e feroz da natureza. Em vez de apenas cultivar a vida, ele personifica sua força indomável, transformando seu próprio corpo para imitar as maiores feras.'
        }
    },

    'Arcano': {
        'Arquimago': {
            description: 'Mestre supremo da magia que dominou os segredos arcanos mais profundos, controlando poderosos feitiços.'
        },
        'Metamágico': {
            description: 'Estudioso que manipula a própria estrutura da magia, alterando e aprimorando feitiços de formas impossíveis.'
        },
        'Glifomante': {
            description: 'Arcano que trata o campo de batalha como sua tela. Ele se especializa em "Magia Simbólica", criando runas, selos e glifos que manipulam a realidade de formas complexas. '
        }
    },

    'Ladino': {
        'Espectro': {
            description: 'Assassino das sombras que se move entre dimensões, tornando-se quase invisível e atacando com precisão letal.'
        },
        'Estrategista': {
            description: 'Mestre da manipulação tática que prevê movimentos inimigos e explora fraquezas com precisão calculada.'
        },
        'Embusteiro': {
            description: 'Ladino que se especializa em enganar e enganar, usando sua mente para criar desinformações e enganar seus inimigos.'
        }
    }
}