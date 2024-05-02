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
    subclass: {
        // Marcial
        'Armipotente'?: Skill[],
        'Polimorfo'?: Skill[],
        'Comandante'?: Skill[],

        // Explorador
        'Harmonizador'?: Skill[],
        'Numeromante'?: Skill[],
        'Transcendentalista'?: Skill[],

        // Feiticeiro
        'Conjurador'?: Skill[],
        'Elementalista'?: Skill[],
        'Alquimista'?: Skill[],

        // Bruxo
        'Necromante'?: Skill[],
        'Pocionista'?: Skill[],
        'Espiritista'?: Skill[],

        // Monge
        'Guardião das Energias'?: Skill[],
        'Protetor da Alma'?: Skill[],
        'Andarilho'?: Skill[],

        // Druida
        'Shapeshifter'?: Skill[],
        'Animante'?: Skill[],
        'Naturomante'?: Skill[],

        // Arcano
        'Arquimago'?: Skill[],
        'Dimensionalista'?: Skill[],
        'Metamágico'?: Skill[],

        // Ladino
        'Espectro'?: Skill[],
        'Supernaturalista'?: Skill[],
        'Metafísico'?: Skill[]
    },
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
            },
            {
                name: 'Muralha',
                description: 'Quando você fica com 10% ou menos de LP, seu ataque aumenta em 50% até você atingir 50% da sua vida novamente. Para calcular os 50% de dano, primeiro role o(s) dado(s) de dano e faça o cálculo normalmente, depois, multiplique o resultado por 1.5x. Em caso de número decimal, sempre arredonde para menor.',
                origin: 'Marcial',
                type: 'Classe',
                level: 20
            },
            {
                name: 'Amplitude Física',
                description: 'Em testes de Luta, Atletismo ou vigor puro, se o resultado do dado for menor que a sua quantidade de Luta ou Atletismo, você pode usar sua força + seu respectivo bônus para substituir o dado, além de ganhar +1 dado em testes que usam vigor. Além disso, você pode adicionar o seu bônus de Luta em ataques corpo-a-corpo.',
                origin: 'Marcial',
                type: 'Classe',
                level: 25
            },
            {
                name: 'Armado',
                description: 'Armas corpo-a-corpo dão +2 dados do mesmo tipo de dano.',
                origin: 'Marcial',
                type: 'Classe',
                level: 30
            },
            {
                name: 'Não-Elementalista',
                description: 'Magias não-elementais tem +1 dado respectivo para cálculo de dano, cálculo de cura, chance de acerto etc.',
                origin: 'Marcial',
                type: 'Classe',
                level: 35
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
            },
            {
                name: 'Providência',
                description: 'Quando utilizar a habilidade Esforço, você pode gastar 5 MP adicionais para aumentar o teste em +3 pontos bônus. Além disso, você pode rolar quantos dados você quiser com um custo adicional de 2 MP por dado para a habilidade Treinado.',
                origin: 'Explorador',
                type: 'Classe',
                level: 20
            },
            {
                name: 'Preferência',
                description: 'Você pode escolher magias de um tipo elemental específico e armas de uma categoria específica para serem adicionadas +3 pontos em testes que você as utilize (dano, cura, chance de acerto, fortalecimento, etc.). Após utilizar essa habilidade, não será possível utilizá-la novamente até completar 2 dias.',
                origin: 'Explorador',
                type: 'Classe',
                level: 25
            },
            {
                name: 'Afluência',
                description: `Você pode escolher uma das seguintes opções (que sejam compatíveis com seu nível):
                +1 Habilidade de qualquer classe ou subclasse (incluindo o poder de classe);
                +3 Poderes mágicos;
                +1 Magia Nível 5.
                `,
                origin: 'Explorador',
                type: 'Classe',
                level: 30
            },
            {
                name: 'Polivalência',
                description: `Você pode pagar 25 MP para rolar 2d20 e utilizar a média aritmética do resultado (2d20/2) para algum dos efeitos:
                Caso o valor do resultado seja igual ou maior que 10, este resultado é adicionado em seus AP até a próxima tentativa de acerto, e diminui o dano recebido nos pontos do resultado do próximo ataque em que você for atingido. Caso o dano for menor do que o resultado da habilidade, você usa a diferença do cálculo e cura LP ou MP, caso você estiver com a saúde em 100%. 
                Caso o valor do resultado seja igual ou menor que 10, você pode adicionar estes pontos em seus PRÓXIMOS DOIS testes, incluindo cálculo de dano e chance de acerto. Não funciona para esquiva ou bloqueio de ataques.
                Em suma, em caso de combate, resultados maiores significam oportunidades de defesa, e resultados menores significam oportunidades de ataque.
                Caso o resultado seja 10, o jogador poderá escolher entre um dos efeitos citados acima.
                `,
                origin: 'Explorador',
                type: 'Classe',
                level: 35
            }
        ],

        'Feiticeiro': [
            {
                name: 'Feitiçaria',
                description: 'Você ganha +1 de dano para todas as magias de ataque que você utilizar. Além disso, ao adquirir essa habilidade, escolha uma magia nível 1 e aprenda-a.',
                origin: 'Feiticeiro',
                type: 'Classe',
                level: 0
            },
            {
                name: 'Prevenção Mágica',
                description: 'Magias que dão dano em área agora afetam somente a inimigos. Além disso, não é possível você se ferir com uma magia conjurada por você mesmo.',
                origin: 'Feiticeiro',
                type: 'Classe',
                level: 5
            },
            {
                name: 'Magia Guiada',
                description: 'Caso você acerte um mesmo inimigo com uma mesma magia duas vezes ou mais, você ganha +1d4 para cada acerto, sucessivamente. A partir do terceiro acerto você recomeça a contagem, desta vez com +1d6. Não cumulativo.',
                origin: 'Feiticeiro',
                type: 'Classe',
                level: 10
            },
            {
                name: 'Mimetismo',
                description: 'Você pode gastar 15 MP para copiar uma magia que foi desferida em você na cena atual.',
                origin: 'Feiticeiro',
                type: 'Classe',
                level: 15
            },
            {
                name: 'Fixação Mágica',
                description: 'Você pode escolher uma magia específica que você sabe e colocar um fixador mágico nela: A magia pula um estágio à frente e adiciona +1d10 em testes desta magia. Caso a magia esteja em seu último estágio, o dano é dobrado. Além disso, você é invulnerável a está magia, caso alguém o ataque com ela. Só é possível colocar um marcador por vez e quando colocado você não pode remover até o final do dia.',
                origin: 'Feiticeiro',
                type: 'Classe',
                level: 20
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
            },
            {
                name: 'Aura Efêmera',
                description: 'Você pode pagar 15 para gerar uma aura de dentro de você que cobre um raio de 5 metros. Ela cura você e aliados a cada 2 turnos em 3d4 além de aumentar a chance de acerto em +3. Se você estiver no estado de fúria enquanto está habilidade estiver ativa, quem estiver na área ganha +5 em chance de acerto e +3d4 para qualquer ataque. Você pode prolongar esta habilidade, mas terá que pagar +15 MP para cada 2 turnos.',
                origin: 'Monge',
                type: 'Classe',
                level: 20
            },
            {
                name: 'Força Vital',
                description: 'Você pode pagar 20 MP e executar como uma ação livre esta habilidade: Para o seu próximo ataque corpo-a-corpo, caso você acerte o alvo, o dano será aumentado em 1d8 + seus LP atuais. Ou seja, quanto mais vida você estiver no momento, maior será a força do ataque.',
                origin: 'Monge',
                type: 'Classe',
                level: 25
            },
            {
                name: 'Projeção',
                description: 'Você pode gastar 20 MP para projetar sua consciência em outro lugar ou outro ser, deixando seu corpo em um estado de transe. Você pode usar isto para explorar lugares distantes, se comunicar com outras pessoas, invadir sistemas de segurança, se disfarçar e/ou se passar por outras pessoas entre outros. Você pode usá-la por no máximo 20 minutos (5m na realidade).',
                origin: 'Monge',
                type: 'Classe',
                level: 30
            },
            {
                name: 'Transferência de Emoções',
                description: 'Você pode pagar 20 MP para transferir seu estado atual para um alvo próximo (Toque). Quando você o fizer, você recebe metade do dano no próximo ataque. Você precisa estar no estado de Calma, Fúria ou Divino para usar esta habilidade. Você volta para o estado normal automaticamente após a transferência.',
                origin: 'Monge',
                type: 'Classe',
                level: 35
            }
        ],

        'Druida': [
            {
                name: 'Retaguarda',
                description: 'Toda vez que você fortalecer ou curar um aliado você invoca 3 tipos de orbes elementais diferentes aleatórios que causam 1d4 de dano cada. Você pode direcioná-los e atacá-los com uma ação livre a qualquer criatura. Entre os orbes que podem ser invocados estão: Fogo, Água, Ar e Terra (1d4 de possibilidades). Em caso de estar fora de combate você adiciona +2 na cura ou no fortalecimento feito ao alvo. Os orbes não são cumulativos.',
                origin: 'Druida',
                type: 'Classe',
                level: 0
            },
            {
                name: 'Cura Reveladora',
                description: 'Toda vez que você realizar uma cura em um aliado, você pode gastar 10 MP para adicionar +4d6 pontos de cura juntamente de um bônus de chance de acerto de +3.',
                origin: 'Druida',
                type: 'Classe',
                level: 5
            },
            {
                name: 'Encantamento Druídico',
                description: 'Gastando 15 MP, como ação de movimento, você pode adicionar +3d6 de dano elemental extra de qualquer elemento que você tenha afinidade elemento em qualquer arma (incluindo a sua) por 3 turnos.',
                origin: 'Druida',
                type: 'Classe',
                level: 10
            },
            {
                name: 'Plano de Recuperação',
                description: 'Em uma pequena área de um quadrado de 6m, você conjura um plano que quem estiver nele, é curado por 2d6 por rodada, além de não poder ser afetado por nenhum estado negativo como queimadura ou hemorragia. Inimigos que entrarem no campo recebem 2d4 de dano enquanto permaneceram por lá. O plano dura 3 turnos.',
                origin: 'Druida',
                type: 'Classe',
                level: 15
            },
            {
                name: 'Vínculo Druídico',
                description: 'Você pode inserir uma marca de luz em qualquer ser por toque gastando 15 MP: Toda vez que você ou o ser sofrer algum tipo de dano, o dano é dividido igualmente entre vocês. Toda vez que isto acontecer, você recupera +3 MP.',
                origin: 'Druida',
                type: 'Classe',
                level: 20
            },
            {
                name: 'Peripécia',
                description: 'Você pode gastar 25 MP para criar uma área de um raio de 9m por 2 rodadas onde você e seus aliados ganham +10 MP para cada teste passado com sucesso para cada um que estiver presente na área.',
                origin: 'Druida',
                type: 'Classe',
                level: 25
            },
            {
                name: 'Vanguarda',
                description: 'Os orbes agora dão 1d6+1 de dano além de você invocar 5 entre as seguintes possibilidades: Fogo, Água, Ar, Terra, Eletricidade, Gelo. Você pode escolher os tipos elementais dos orbes gerados.',
                origin: 'Druida',
                type: 'Classe',
                level: 30
            },
            {
                name: 'Domo Protetor',
                description: 'Você pode gastar 20 MP para criar uma barreira mágica de 6m por 3 turnos que inibe qualquer ataque vindo de fora. Você e seus aliados conseguem atacar de dentro para fora, mas não de fora para dentro. Além disso, quem estiver dentro da barreira ganha +5 em chance de acerto.',
                origin: 'Druida',
                type: 'Classe',
                level: 35
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
            },
            {
                name: 'Defesa Arcana',
                description: 'No início de cada combate você recebe 2d10+LOG/2 de vida adicional.',
                origin: 'Arcano',
                type: 'Classe',
                level: 20
            },
            {
                name: 'Adiar Magia',
                description: 'Você pode gastar 10 MP extras para utilizar uma magia do tipo “conjurada” (magias que ativam depois de 1 ou X turnos) no mesmo turno.',
                origin: 'Arcano',
                type: 'Classe',
                level: 25
            },
            {
                name: 'Teletransporte Arcano',
                description: 'Uma vez por cena, por 20 MP, você pode teletransportar quaisquer objetos ou pessoas que estejam se segurando em você para um lugar que você já passou ou já vivenciou. Caso você tente teletransportar o algo ou alguém contra sua vontade, ele faz um teste de Resistência Mágica. Se ele passar, o teletransporta falha e não será possível teletransportar o alvo novamente até o dia seguinte. Além disso, uma vez por combate quando te acertarem um ataque, você pode pagar 10 MP para se esquivar e se afastar 9m do alvo, automaticamente.',
                origin: 'Arcano',
                type: 'Classe',
                level: 30
            },
            {
                name: 'Intelecto Superior',
                description: 'Você adiciona sua LOG ao dano e cura de suas magias.',
                origin: 'Arcano',
                type: 'Classe',
                level: 35
            }
        ],

        'Ladino': [
            {
                name: 'Disfarce',
                description: 'Caso você entre em furtividade com sucesso em seu turno, você ganha uma ação padrão extra.',
                origin: 'Ladino',
                type: 'Classe',
                level: 0
            },
            {
                name: 'Cautela',
                description: 'Caso você ataque um alvo desprevenido, seu dano é dobrado.',
                origin: 'Ladino',
                type: 'Classe',
                level: 5
            },
            {
                name: 'Fobia',
                description: 'Você pode pagar 15 MP para aplicar 2d8 de dano, deixar o alvo no estado de medo e inibir seus ataques até seu turno seguinte. Se você estiver em furtividade o dano é aumentado para 6d8.',
                origin: 'Ladino',
                type: 'Classe',
                level: 10
            },
            {
                name: 'Expurgo',
                description: 'Caso o inimigo esteja com 10% ou menos de vida, seu próximo ataque o mata instantaneamente.',
                origin: 'Ladino',
                type: 'Classe',
                level: 15
            },
            {
                name: 'Sempre Distante',
                description: 'Armas de fogo ou de longa distância dão +1 dados do mesmo tipo de dano.',
                origin: 'Ladino',
                type: 'Classe',
                level: 20
            },
            {
                name: 'Ataque Duplo',
                description: 'Você pode atacar duas vezes no mesmo turno caso erre um ataque. Você não possuirá duas ações padrões por turno, somente duas oportunidades de ataque.',
                origin: 'Ladino',
                type: 'Classe',
                level: 25
            },
            {
                name: 'Dano Transmissível',
                description: 'Caso você ataque com sucesso um alvo, você pode pagar 15 MP para aplicar um destes estados ao alvo e 3 oponentes próximos por 2 turnos: Queimadura (5d6 de dano de fogo), Envenenamento (5d6 de dano de toxina), Eletrizado (Qualquer dano aplicado ao alvo também se aplica a seres próximos em um raio de 6m e dobra dano de água), Congelado (O alvo não consegue se mexer ou fazer ataques físicos e dobra dano de fogo). Você só pode utilizar esta habilidade uma vez por combate.',
                origin: 'Ladino',
                type: 'Classe',
                level: 30
            },
            {
                name: 'Abscondido',
                description: 'Quando você está furtivo você consegue enxergar no escuro, ouvir sons mais altos, ver mais longe e consegue identificar algo ou alguém que está furtivo. Além disso, você ganha +10 LP, +10 MP, +2 AP e +5 de dano extra em qualquer ataque enquanto estiver furtivo.',
                origin: 'Ladino',
                type: 'Classe',
                level: 35
            }
        ]
    },
    subclass: {
        Transcendentalista: [
            {
                name: 'Esquiva Dimensional',
                description: 'Com seus poderes transcendentais, você consegue acessar outra dimensão por tempo limitado, o vazio. Uilizando a energia do cosmos e a magia artifical como intermédio, como ação de reação (quando te atacarem) você pode usar a esquiva dimensional. A esquiva dimensional te garante a esquiva do ataque e você fica em outra dimensão por 1 rodada (no seu turno seguite, você volta). Quando o mago voltar da outra dimensão, ele pode escoolher em qual lugar ele irá reaparecer em um raio de 3m de onde ele usou a habilidade. A habilidade tem 1 rodada de tempo de recarga e não pode usar consecutivamente.',
                origin: 'Transcendentalista',
                type: 'Subclasse'
            },
            {
                name: 'Metacriação Sublime',
                description: 'Um Mago Explorador Transcendentalista que se preze, gosta de criar coisas novas a partir dos poderes dos cosmos. Com estas habilidades, você possui a habilidade de criar coisas novas como nunca visto antes. (Você adquire os poderes mágicos "Fazer Poções" e "Alquimia" em seu estágio final, isto é, na maestria, mesmo não possuindo maestria elemental com o elemento. Além disso, armas criadas com o poder mágico "Alquimia" serão adciionadas em seu dano +3 dados do mesmo grau e +10 de pontos bônus em poções).',
                origin: 'Transcendentalista',
                type: 'Subclasse'
            },
            {
                name: 'Sabedoria Transcendental',
                description: 'Sua sabedoria transcende todos os limites humanos. Você adquire conhecimento de todo o cosmos e sabe de quase todo fenômeno que nele ocorre (Você ganha +5 pontos de teste e +3 de sabedoria).',
                origin: 'Transcendentalista',
                type: 'Subclasse'
            }
        ],

        Andarilho: [
            {
                name: 'Passo Divino',
                description: 'Você ganha +4 em todos os testes que envolvem destreza, +2 em reflexos e aumenta seu deslocamento base para 27m.',
                origin: 'Andarilho',
                type: 'Subclasse'
            },
            {
                name: 'Pressa Fádica',
                description: 'A sua velocidade ultrapassa os limites humanos, fazendo com que tudo ao seu redor fique mais lento. Você pode gastar sua ação de movimento completa (isto é, gastar todo seu deslocamento) para diminuir o tempo do jogo pela metade em suas ações. Caso esteja em combate, automaticamente você sai como primeiro na iniciativa e ganha 2 ações padrões extras que podem ser gastas enquanto você permanecer naquele combate. Além disso, você ganha +2 de Agilidade.',
                origin: 'Andarilho',
                type: 'Subclasse'
            },
            {
                name: 'Movimentação Astral',
                description: 'Seus pés não se locomovem mais neste plano. Seu corpo atinge um incrível patamar de suavidade, fazendo com que seus pés se locomovam em outro plano astral (Você não faz barulhos ao andar ou correr, fica invisível ao correr, pode entrar e sair de furitividade a hora que quiser e aumenta o deslocamento em +12).',
                origin: 'Andarilho',
                type: 'Subclasse'
            },
            {
                name: 'Embsocada Planar',
                description: 'Você consegue atravessar paredes e objetos físicos não tão espessos se movendo em outro plano astral. Além disso, com esta habilidade, você pode atacar inimigos de forma despercebida (desde que eles não tenham de visto antes ou caso você esteja furtivo), sempre sendo um ataque desprevinido, causando o dobro de dano com um bônus de dano adicional igual ao seu deslocamento (Somente em ataques corpo-a-corpo).',
                origin: 'Andarilho',
                type: 'Subclasse'
            }
        ],

        Arquimago: [
            {
                name: 'Arquimagia',
                description: 'Como arquimago, você estuda a magia profundamente, sabendo todas suas raizes e ramificações. (Você ganha +4 todos testes que envolvem foco e +2 de lógica).',
                origin: 'Arquimago',
                type: 'Subclasse'
            },
            {
                name: 'Aprimoramento Mágico',
                description: 'Você atinge um patamar requintado da magia, liberando prorpriedades nunca vistas antes. Todas suas magias causam dano em área equivalente a +3m de raio (ou aumenta o alcance em mais +3m) e não causam danos a aliados. Além disso, elas recebem +2 dados do mesmo grau para complemento do ataque. Ademais, magias de nível 1 até o estágio 2 não custam mana.',
                origin: 'Arquimago',
                type: 'Subclasse'
            },
            {
                name: 'Subsequência Arcana',
                description: 'Suas magias ficam mais forte do que nunca, e com isso, você aprende-as usar em uma sequência perfeita. Caso você utilize uma mesma magia mais de uma vez no combate, seu dano é incrementado em +5 e seu custo é diminuído em -1 MP para cada vez que você utilizá-la, tendo um limite de 5 vezes. Se você usar outra magia diferente da mesma, você perde a bonificação, tendo que repetir o processo novamente. Além disso você adquirie visão verdadeira e prolonga suas magias contínuas em +2 turnos.',
                origin: 'Arquimago',
                type: 'Subclasse'
            }
        ],

        Espectro: [
            {
                name: 'Ocultismo',
                description: 'O Espectro pode se mover através das sombras como se fossem água. Como ação livre, você pode se teletransportar para qualquer ponto dentro de 15 metros de uma sombra que você possa ver.',
                origin: 'Espectro',
                type: 'Subclasse'
            },
            {
                name: 'Abstruso',
                description: 'Suas habilidades em camuflagem beiram o obscuro completo. Enquanto estiver furtivo, você ganha +8 em todos testes que envolvem destreza. Além disso, você ganha +2 de destreza.',
                origin: 'Espectro',
                type: 'Subclasse'
            },
            {
                name: 'Escureza Lúgubre',
                description: 'Enquanto estiver em furitivdade, todos seus ataques causam necrose fatal (5d12 de dano das trevas por 5 turnos).',
                origin: 'Espectro',
                type: 'Subclasse'
            }
        ],

        Polimorfo: [
            {
                name: 'Morfo Superior',
                description: 'Seu corpo adquire uma forma de defesa insuperável. você ganha +5 em testes que usam vigor e ganha +30 LP Permanentes.',
                origin: 'Polimorfo',
                type: 'Subclasse'
            },
            {
                name: 'Polimorfismo',
                description: 'Seu corpo é moldável ao seu favor. Seu corpo se adapta ao combate, fazendo com que ganhe +2 de Vigor e adquira a habilidade de moldar qualquer parte do seu corpo como ação livre ao critério do mestre.',
                origin: 'Polimorfo',
                type: 'Subclasse'
            },
            {
                name: 'Corpo de Ferro',
                description: 'Os membros do seu corpo podem se moldar em objetos de metal. Além disso, você pode gastar 50 LP para ficar imortal durante 2 rodadas como ação padrão, você pode usar esta habildiade 1 vez por combate.', 
                origin: 'Polimorfo',
                type: 'Subclasse'
            }
        ]
    },
    bonus: [],
    powers: []
}