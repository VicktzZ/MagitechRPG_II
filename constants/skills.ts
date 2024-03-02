/* eslint-disable max-len */
import type { Skill } from '@types'

export const skills: {
    lineage: Skill[]
    class: {
        'Marcial': Skill[]
        'Explorador': Skill[]
        'Feiticeiro': Skill[]
        'Bruxo': Skill[]
        'Monge': Skill[]
        'Druida': Skill[]
        'Arcano': Skill[]
        'Ladino': Skill[]
    }
    subclass: Skill[]
    bonus: Skill[]
    powers: Skill[]
} = {
    lineage: [
        {
            name: 'Parcimônia',
            description: 'Para você, menos é mais. Se o valor do seu dado for igual a 2, o resultado será um Acerto Crítico (performará a ação da melhor maneira possível). Se o valor for igual a 1 ainda é considerado falha crítica. 20 no dado ainda significa acerto crítico.',
            type: 'Linhagem',
            origin: 'Órfão'
        },
        {
            name: 'Contramedida',
            description: 'Graças ao seu treinamento, sua habilidade em espionagem supera qualquer outra. Esta habilidade te permite gastar 20 MP em um teste: O mestre é obrigado a te revelar a DT do teste e reduzi-la em 10 pontos ou em 15 pontos se a DT for maior que 35. Também pode ser usada em testes em conjunto. Não é possível utilizar em combate.',
            origin: 'Infiltrado',
            type: 'Linhagem'
        },
        {
            name: 'Intercambiador',
            description: 'Você tem maior facilidade para aprender as coisas. Sempre que você atinge um novo nível do ORM (1, 5, 10, 15 e 20. Nível 1 incluído), você pode escolher uma magia adicional do mesmo nível e afinidade do seu personagem. No caso de 2 ou mais afinidades, você pode escolher uma magia do estágio atingido para cada uma.',
            origin: 'Estrangeiro',
            type: 'Linhagem'
        },
        {
            name: 'Sortudo',
            description: 'Com sua sorte, você pode passar por qualquer coisa. Se você tirar um valor menor que 10 no dado de qualquer teste você pode pagar 25 MP para passar instantaneamente com um resultado mediano. No caso de teste prolongado, irá contar como 3 sucessos. Limitado a 3 vezes por dia. Não pode ser usada em testes em conjunto.',
            origin: 'Camponês',
            type: 'Linhagem'
        },
        {
            name: 'Soberba',
            description: 'Seu patrimônio lhe permite sair na frente dos outros. Você pode gastar 10 MP para adicionar a sua SAB na soma de qualquer teste.',
            origin: 'Burguês',
            type: 'Linhagem'
        },
        {
            name: 'Memorável',
            description: 'Seu carisma convence o público. Testes que usam CAR podem ser somados a +1d20 além de jogar com vantagem (adiciona +1d20 para o teste) se forem pagos 10 MP.',
            origin: 'Artista',
            type: 'Linhagem'
        },
        {
            name: 'Sarado',
            description: 'Um corpo superior à média. Você recebe +2 LP a cada nível atingido.',
            origin: 'Ginasta',
            type: 'Linhagem'
        },
        {
            name: 'Ambição',
            description: 'Sua herança reflete em sua ambição. Em qualquer teste você pode pagar 25 MP: A DT do teste aumenta em 10 ou em 15 pontos (Você escolhe). Se você passar no teste, o mestre é obrigado a te dar o dobro ou o triplo (respectivamente) do efeito normal. Exemplo: Dobro de dano, triplo de deslocamento, dobro de cura de vida, triplo de chance de acerto etc. Se você falhar conta como falha crítica.',
            origin: 'Herdeiro',
            type: 'Linhagem'
        },
        {
            name: 'Ultrapassar',
            description: 'O seu poder sobre-humano ultrapassa os limites. No caso de ataque mágico der um acerto crítico em batalha: Você pode pagar 25 MP e magias ofensivas podem dar até 1d4 vezes de dano crítico. Se o resultado do d4 for 1, você pode pagar mais 10 MP para rodar o d4 de novo ou considere o dano crítico normal. Se na segunda rolagem o resultado permanecer 1, não haverá dano crítico.',
            origin: 'Cobaia',
            type: 'Linhagem'
        },
        {
            name: 'Opressor',
            description: 'A sua silhueta aflige os demais. Você pode pagar 15 MP para adicionar seu bônus de força em rolagens de dano ou chances de acerto se estiver a uma distância de corpo a corpo.',
            origin: 'Gangster',
            type: 'Linhagem'
        },
        {
            name: 'Hacking',
            description: 'A tecnologia lhe dá possibilidades infinitas. Você pode abrir portas, controlar dispositivos eletrônicos, descobrir informações essenciais, inerentes ou pessoais, desativar alarmes e armadilhas, descobrir e identificar magias e descobrir informações sobre inimigos (LP, MP, atributos, habilidades etc.) ao pagar 10 MP para fazer um teste de tecnologia (A DT é proporcional ao alvo do hacking). Você também pode substituir qualquer teste de magia por tecnologia ao pagar 10 MP. Esta habilidade só é válida se o usuário estiver conectado à internet.',
            origin: 'Hacker',
            type: 'Linhagem'
        },
        {
            name: 'Alopatia',
            description: 'Seus estudos em anatomia humana superam a média. Você consegue realizar um teste de Medicina de DT 15 para curar a si mesmo e companheiros em 3d6 uma vez por dia, uma vez por pessoa, sem utilizar consumíveis para cura.',
            origin: 'Clínico',
            type: 'Linhagem'
        },
        {
            name: 'Poder Bélico',
            description: 'Um armamento pesado é a resposta para todos os problemas. Você possui proficiência com todas as armas e você pode colocar até 4 acessórios científicos e 3 mágicos em suas armas',
            origin: 'Combatente',
            type: 'Linhagem'
        },
        {
            name: 'Adaptar-se',
            description: 'O ser humano foi feito para se adaptar, e você faz isso com maestria. Você pode gastar 5 MP para transformar qualquer teste (inclusive testes com desvantagem) em um teste com vantagem. ',
            origin: 'Aventureiro',
            type: 'Linhagem'
        },
        {
            name: 'Cleptomania',
            description: 'Você consegue furtar qualquer coisa. Objetos furtados por você tem +2 pontos bônus no(s) principal(is) papel(is) que ela desempenha. Exemplo: Armas ganham +2 de dano e/ou chance de acerto (critério do mestre), Kits medicinais ganham +2 de cura ou bônus no teste de medicina (critério do mestre), veículos ganham +2 de agilidade etc.',
            origin: 'Trambiqueiro',
            type: 'Linhagem'
        },
        {
            name: 'Talento',
            description: 'Você tem talento em ter talento. Em qualquer teste você pode gastar 5 MP para adicionar sua LOG a soma final.',
            origin: 'Prodígio',
            type: 'Linhagem'
        },
        {
            name: 'Oportunista',
            description: 'Um iniciante sempre tem várias oportunidades. Você pode escolher duas vantagens. (Visto mais a frente no capítulo Características.)',
            origin: 'Novato',
            type: 'Linhagem'
        },
        {
            name: 'Engenhoca',
            description: 'Engenhocas facilitam o seu cotidiano. Você pode gastar 10 MP para rodar um teste de criatividade de DT 15 e inventar uma engenhoca para algum teste especificado (você escolhe) e acoplar a qualquer ser vivo. O alvo recebe +2 no teste determinado. Se o teste falhar, a engenhoca dá um bônus de +1 a um teste aleatório. A engenhoca tem uma bateria que dura 2 horas e não pode ser recarregada. Só é possível ter uma engenhoca ativa em um ser vivo por vez. A engenhoca pode ser retirada e realocada em outro ser vivo após colocação. A critério do mestre, você também pode rodar um teste de competência e inventar outras pequenas bugigangas como câmeras, rastreadores, drones, alarmes etc. Essa habilidade só pode ser utilizada se o usuário tiver uma ferramenta mecânica.',
            origin: 'Inventor',
            type: 'Linhagem'
        },
        {
            name: 'Encantado',
            description: 'O vício em magia fortalece seu espírito. Você recebe +3 MP a cada nível atingido.',
            origin: 'Idólatra',
            type: 'Linhagem'
        },
        {
            name: 'Desilusão',
            description: 'É melhor prevenir do que remediar. Você pode anular qualquer magia se pagar 25 MP. Limitado a 3 vezes por dia.',
            origin: 'Cismático',
            type: 'Linhagem'
        },
        {
            name: 'Decodificação Mágica',
            description: 'Decodificadores são dispositivos que permitem que você leia e altere os códigos mágicos transmitidos pelos satélites. Você pode gastar 10 MP para rodar um teste de competência de DT 15 e decodificar uma magia que você tenha visto ou sentido, e assim, aprender a usá-la. Se o teste falhar, você recebe uma magia aleatória que pode ser útil ou não. O decodificador tem uma memória que armazena até 5 magias decodificadas, e você pode apagar ou substituir as magias armazenadas. Você pode usar as magias decodificadas como se fossem suas, mas elas consomem o dobro de MP. A critério do mestre, você também pode rodar um teste de competência e decodificar outras informações mágicas, como a localização, a intensidade, o tipo etc. Essa habilidade só pode ser utilizada se o usuário tiver um decodificador.',
            origin: 'Pesquisador',
            type: 'Linhagem'
        },
        {   
            name: 'Rastreamento',
            description: 'Graças à sua experiência, sua habilidade em seguir pistas e rastrear alvos é incomparável. Esta habilidade te permite gastar 20 MP em um teste: Você pode escolher um alvo que você tenha visto ou sentido, e saber a sua localização exata, a distância, a direção e o tempo que ele levou para chegar até lá. Você também pode saber se o alvo está sob efeito de alguma magia ou se ele tem algum ORM. Esta habilidade pode ser usada em combate ou fora dele.',
            origin: 'Investigador',
            type: 'Linhagem'
        }
    ],
    class: {
        'Marcial': [
            {
                name: 'Duro na Queda',
                description: 'Sempre que o cálculo de dano for maior que sua vida, ao invés de ficar inconsciente, você fica com 1 LP. Se outro dano for aplicado enquanto você estiver com 1 LP, você entra no estado inconsciente.',
                origin: 'Marcial',
                type: 'Classe',
                level: 0
            },
            {
                name: 'Reflexos Aumentados',
                description: 'Você ganha +1 dado em testes de agilidade (incluindo iniciativa).',
                origin: 'Marcial',
                type: 'Classe',
                level: 5
            },
            {
                name: 'Bom de Briga',
                description: 'Aumenta o dano do ataque em 1d8+Bônus de Luta se você estiver atacando em um alcance de corpo a corpo (1 quadrado ou 1,5 metro).',
                origin: 'Marcial',
                type: 'Classe',
                level: 10
            },
            {
                name: 'Regeneração Furiosa',
                description: 'Quando seus LP ficarem abaixo de 50%, você regenera 1d6 por turno até atingir 50% de seus LP novamente.',
                origin: 'Marcial',
                type: 'Classe',
                level: 15
            }
        ],

        'Explorador': [
            {
                name: 'Treinado',
                description: 'Você pode gastar 5 MP uma vez por teste para rolar novamente um dos dados (ou o dado, no caso de um) e substituí-lo (ou não) pelo novo resultado.',
                origin: 'Explorador',
                type: 'Classe',
                level: 0
            },
            {
                name: 'Esforço',
                description: 'Você pode pagar 2 MP para adicionar +2 Pontos bônus em qualquer teste, exceto esquiva, cálculo de dano ou bloqueio de ataque.',
                origin: 'Explorador',
                type: 'Classe',
                level: 5
            },
            {
                name: 'Desequilibrar',
                description: 'Você pode pagar 12 MP e escolher um alvo para sofrer -2 em todos os testes contra você por 3 turnos.',
                origin: 'Explorador',
                type: 'Classe',
                level: 10
            },
            {
                name: 'Perspectiva',
                description: 'Em combate, você pode gastar 15 MP para diminuir a margem de crítico em 1 pontos (ao invés de 20, serão necessários 19 pontos no dado para contabilizar um ataque crítico.) por 3 turnos para qualquer ataque físico ou mágico.',
                origin: 'Explorador',
                type: 'Classe',
                level: 15
            }
        ],

        'Feiticeiro': [
            {
                name: 'Feitiçaria',
                description: 'Você ganha +1 de dano para todas as magias de ataque que você utilizar. Além disso, ao adquirir essa habilidade, escolha uma magia nível 1 e aprenda-a.',
                origin: 'Feiticeiro',
                type: 'Classe',
                level: 0
            }
        ],

        'Bruxo': [
            {
                name: 'Fazer Poções',
                description: `Você possui a habilidade de criar poções. Qualquer tipo de matéria orgânica + algum recipiente vazio pode ser combinado para usar poções. Em primeira instância, elas são imprevisíveis, mas à medida que sua experiência for avançando, além de melhores resultados com melhores efeitos, você poderá saber como utilizá-las com maestria.
                Os testes utilizados para criar poções podem variar entre Magia, Sobrevivência, Medicina, Competência, Destreza, Controle e Criatividade, dependendo do propósito e dos métodos utilizados para a criação da poção. Quando você quiser criar uma poção com uma finalidade específica, existe 50% de chance (resultado par em um d4) da poção resultar em algo diferente do que você planejava, o que pode ser bom, ou ruim. É necessário gastar 10 MP para cada poção feita. Para criar uma poção com sucesso é necessário no mínimo passar de uma DT 10. O tempo de fabricação da poção pode variar com o tipo e quantidade de materiais utilizados. Você pode escolher criar entre os seguintes tipos de poções:
                Força: Aumenta a força em ataques com armas corpo-a-corpo e/ou aumenta a chance de acerto por 2 turnos ou somente para a cena, em caso de estar fora de batalha. A qualidade da poção varia com os pontos tirados no teste.
                Cura: Recupera os LP de um alvo em dados proporcionais a quantidade de pontos tirados no teste.
                Mana: Recupera os MP de um alvo em dados proporcionais a quantidade de pontos tirados no teste.
                Antídoto: Livra o alvo de algum(ns) ou todos efeitos e estados ruins que possam estar lhe afligindo. EX: Envenenamento, queimadura, hemorragia, insanidade, medo etc.
                Dano: Aplica uma quantidade x de dano ao alvo que foi atingido ou ingerir a poção. O dano é proporcional a quantidade de pontos tirados no teste.
                Fortalecimento: Aumenta os AP de um alvo no número tirado em 1d10 por 2 turnos ou somente para a cena, em caso de estar fora de batalha.
                Enfraquecimento: Diminui a força em ataques com armas corpo-a-corpo e/ou diminui a chance de acerto em 2 turnos ou somente para a cena, em caso de estar fora de batalha. A qualidade da poção varia com os pontos tirados no teste.
                Inteligência: Dá pontos bônus de +2 em até 5 testes aleatórios (ou testes escolhidos por você, em caso de possuir a habilidade aprimorada), que variados pelos pontos tirados no teste. A vantagem dura por 2 turnos ou somente para a cena, em caso de estar fora de batalha.
                `,
                origin: 'Bruxo',
                type: 'Classe',
                level: 0
            }
        ],

        'Monge': [
            {
                name: 'Autoconsciência',
                description: `Você possui a habilidade de entrar em diferentes estados quando estiver em combate: Calma, Fúria e Divino.
                No estado de Calma, quando qualquer ataque corpo-a-corpo for feito em você, você pode contra-atacar no mesmo momento com 100% de chance de acerto com uma arma leve de uma mão ou uma magia que possa ser executada com a mente ou com uma mão e que não seja do tipo conjurada, sustentada ou contínua. Apesar disso, no estado de calma, você não consegue andar. Para entrar no estado de calma, você deve conseguir se esquivar com sucesso de um ataque inimigo. Você entra no estado de calma no turno seguinte.
                No estado de Fúria, qualquer ataque aplicado por você dá o dobro de dano e você adiciona o seu bônus de destreza em qualquer ataque. Mas tome cuidado! Ao utilizar este estado, você fica sujeito a receber 50% a mais de dano. Para entrar no estado de fúria, você deve rodar um dado crítico (20 pontos em um d20) ou eliminar uma criatura. Você entra no estado de fúria no turno seguinte.
                No estado Divino, você dá o triplo de dano de qualquer ataque. Para entrar no estado divino, você precisa entrar em algum dos estados disponíveis três vezes. Você entra no estado divino no turno seguinte.
                Todos os estados duram até o seu próximo turno.
                `,
                origin: 'Monge',
                type: 'Classe',
                level: 0
            },
            {
                name: 'Reflexos',
                description: 'Você pode gastar 10 MP para, como ação livre, ganhar +2 em Agilidade. Caso você esteja no estado de "calma", você ganha +5 pontos em Agilidade além de prolongar seu estado até o turno seguinte.',
                origin: 'Monge',
                type: 'Classe',
                level: 5
            
            },
            {
                name: 'Cura Interior',
                description: 'Você pode pagar 20 MP para se curar em 3d8 como ação livre. Só pode ser utilizada uma vez por combate.',
                origin: 'Monge',
                type: 'Classe',
                level: 10
            },
            {
                name: 'Meditação',
                description: 'Sem gastar nada, você pode, três vezes por combate, entrar no estado de meditação. Neste estado, você recupera 2d4 de LP e 3d4 de MP a cada turno. Entretanto, enquanto estiver neste estado, você não consegue se mover ou atacar. Exige uma ação completa.',
                origin: 'Monge',
                type: 'Classe',
                level: 15
            }
        ],

        'Druida': [
            {
                name: 'Retaguarda',
                description: 'Toda vez que você fortalecer ou curar um aliado você invoca 3 tipos de orbes elementais diferentes aleatórios que causam 1d4 de dano cada. Você pode direcioná-los e atacá-los com uma ação livre a qualquer criatura. Entre os orbes que podem ser invocados estão: Fogo, Água, Ar e Terra (1d4 de possibilidades). Em caso de estar fora de combate você adiciona +2 na cura ou no fortalecimento feito ao alvo. Os orbes não são cumulativos.',
                origin: 'Druida',
                type: 'Classe',
                level: 0
            }
        ],

        'Arcano': [
            {
                name: 'Magia simbólica',
                description: 'Você pode gastar 10 MP + O custo de mana de uma magia que você for utilizar para, como uma ação livre, para implantar símbolos mágicos que representam e ativam suas magias. Você pode usar essa habilidade para gravar suas magias em objetos ou superfícies, criando armadilhas, selos ou runas. Você também pode usar essa habilidade para desenhar seus símbolos no ar ou no chão, lançando suas magias de forma rápida e discreta. A Magia é ativada quando o inimigo encostar em seu símbolo ou quando ele entrar no alcance da magia (Se por exemplo sua magia alcançar 6m, enquanto a criatura estiver a 6m do seu símbolo, a magia ativará). A magia só se ativará no seu próximo turno.',
                origin: 'Arcano',
                type: 'Classe',
                level: 0
            },
            {
                name: 'Concentração',
                description: 'Uma vez por cena, você pode entrar em um estado de concentração, onde você recupera 1d20+LOG de LP. Caso você esteja em combate esta habilidade gastará uma Ação Completa.',
                origin: 'Arcano',
                type: 'Classe',
                level: 5
            },
            {
                name: 'Magia Furtiva',
                description: 'Conjurar magias por meio do Poder de Classe “Magia Simbólica” dá um adicional de 3d6 de dano ou cura extra.',
                origin: 'Arcano',
                type: 'Classe',
                level: 10
            },
            {
                name: 'Aprendizado Crucial',
                description: 'Você pode conjurar magias de nível 1 como uma Ação Livre. Só é possível conjurar uma magia por turno desse jeito, exceto se você for conjurar outra magia que já tenha como execução Ação Livre. Neste caso, poderá ser executas duas magias, uma de Ação Livre, e outra de uma outra ação qualquer (mas também executada como Ação Livre).',
                origin: 'Arcano',
                type: 'Classe',
                level: 15
            }
        ],

        'Ladino': [
            {
                name: 'Disfarce',
                description: 'Caso você entre em furtividade com sucesso em seu turno, você ganha uma ação padrão extra.',
                origin: 'Ladino',
                type: 'Classe',
                level: 0
            }
        ]
    },
    subclass: [],
    bonus: [],
    powers: []
}