/* eslint-disable max-len */
import type { Classes, Skill, Subclasses } from '@types'

export const skills: {
    lineage: Skill[],
    occupation: Skill[],
    class: Record<Classes, Skill[]>,
    subclass: Record<Subclasses, Skill[]>,
    bonus: Skill[],
    race: Skill[]
} = {
    lineage: [
        {
            name: 'Parcimônia',
            description: 'Para você, menos é mais. Caso você tire um (1) em 1d20 (falha crítica) você pode pagar 5 MP para re-rolar o dado. Limitado a 3 vezes por dia.',
            type: 'Linhagem',
            origin: 'Órfão'
        },
        {
            name: 'Contramedida',
            description: 'Graças ao seu treinamento, sua habilidade em espionagem supera qualquer outra. Esta habilidade te permite gastar 8 MP em um teste: O mestre é obrigado a te revelar a DT do teste e reduzi-la em 5 pontos ou em 10 pontos se a DT for igual ou maior que 25. Também pode ser usada em testes em conjunto. Não é possível utilizar em combate. Limitado a 3 usos por dia.',
            origin: 'Infiltrado',
            type: 'Linhagem'
        },
        {
            name: 'Intercambiador',
            description: 'Você tem maior facilidade para aprender as coisas. Sempre que você atinge um novo nível do ORM (1, 2, 3 e 4. Nível 1 incluído), você pode escolher uma magia adicional do mesmo nível.',
            origin: 'Estrangeiro',
            type: 'Linhagem'
        },
        {
            name: 'Sortudo',
            description: 'Com sua sorte, você pode passar por qualquer coisa. Se você tirar um valor menor que 5 (exceto 1 [falha crítica]) no dado de qualquer teste você pode pagar 10 MP para passar instantaneamente com um resultado mediano. No caso de teste prolongado, irá contar como 3 sucessos. Limitado a 3 vezes por dia. Não pode ser usada em testes em conjunto.',
            origin: 'Camponês',
            type: 'Linhagem'
        },
        {
            name: 'Soberba',
            description: 'Seu patrimônio lhe permite sair na frente dos outros. Você pode gastar 4 MP para adicionar o modificador de sua SAB * 2 na soma de qualquer teste. Limitado a uma vez por teste. Limitado a 5 vezes por dia.',
            origin: 'Burguês',
            type: 'Linhagem'
        },
        {
            name: 'Memorável',
            description: 'Seu carisma convence o público. Você ganha +1 no seu modificador de CAR.',
            origin: 'Artista',
            type: 'Linhagem'
        },
        {
            name: 'Sarado',
            description: 'Um corpo superior à média. Você recebe +1 LP a cada nível atingido.',
            origin: 'Ginasta',
            type: 'Linhagem'
        },
        {
            name: 'Ambição',
            description: 'Sua herança reflete em sua ambição. Em qualquer teste você pode pagar 5 MP: A DT do teste aumenta em 10 pontos. Se você passar no teste, o mestre é obrigado a te dar o dobro do efeito normal. Exemplo: Dobro de dano, dobro de cura de vida, dobro de chance de acerto etc. Se você falhar conta como falha crítica. Limitado a 5 vezes por dia.',
            origin: 'Herdeiro',
            type: 'Linhagem'
        },
        {
            name: 'Ultrapassar',
            description: 'O seu poder sobre-humano ultrapassa os limites. No caso de ataque mágico der um acerto crítico em batalha: Você pode pagar 10 MP e magias ofensivas podem dar até 1d4 vezes de dano crítico. Se o resultado do d4 for 1, você pode pagar mais 5 MP para rodar o d4 de novo ou considere o dano crítico normal. Se na segunda rolagem o resultado permanecer 1, não haverá dano crítico. Limitado a 2 vezes por dia, uma vez por combate.',
            origin: 'Cobaia',
            type: 'Linhagem'
        },
        {
            name: 'Opressor',
            description: 'A sua silhueta aflige os demais. Você pode pagar 5 MP para adicionar seu bônus de força em rolagens de dano ou chances de acerto se estiver a uma distância corpo a corpo com uma arma branca.',
            origin: 'Gangster',
            type: 'Linhagem'
        },
        {
            name: 'Hacking',
            description: 'A tecnologia lhe dá possibilidades infinitas. Você pode abrir portas, controlar dispositivos eletrônicos, descobrir informações essenciais, inerentes ou pessoais, desativar alarmes e armadilhas, descobrir e identificar magias e descobrir informações sobre inimigos (LP, MP, atributos, habilidades etc.) ao pagar 5 MP para fazer um teste de tecnologia (A DT é proporcional ao alvo do hacking). Você também pode substituir qualquer teste de magia por tecnologia ao pagar 3 MP. Esta habilidade só é válida se o usuário estiver conectado à internet.',
            origin: 'Hacker',
            type: 'Linhagem'
        },
        {
            name: 'Alopatia',
            description: 'Seus estudos em anatomia humana superam a média. Você consegue realizar um teste de Medicina de DT 15 para curar a si mesmo e companheiros em 3d6+2 duas vezes por dia, uma vez por pessoa, sem utilizar consumíveis para cura.',
            origin: 'Clínico',
            type: 'Linhagem'
        },
        {
            name: 'Poder Bélico',
            description: 'Um armamento pesado é a resposta para todos os problemas. Você possui proficiência com todas as armas e você pode colocar até 4 acessórios científicos e 3 mágicos em suas armas',
            origin: 'Atirador',
            type: 'Linhagem'
        },
        {
            name: 'Adaptar-se',
            description: 'Seu instinto aventureiro faz com que você seja capaz de se adaptar a qualquer situação. Você pode gastar 5 MP para transformar qualquer teste (inclusive testes com desvantagem) em um teste com vantagem, seja ele baseado em física, magia, resistência, tecnologia ou qualquer outro tipo de teste. Caso o teste já seja com vantagem, adiciona +1d20.',
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
            description: 'Você tem talento em ter talento. Em qualquer teste você pode gastar 4 MP para adicionar seu modificador de LOG * 2 a soma final. Limitado a 5 vezes por dia.',
            origin: 'Prodígio',
            type: 'Linhagem'
        },
        {
            name: 'Oportunista',
            description: 'Um iniciante sempre tem várias oportunidades. Você pode escolher dois traços positivos.',
            origin: 'Novato',
            type: 'Linhagem'
        },
        {
            name: 'Engenhoca',
            description: 'Engenhocas facilitam o seu cotidiano. Você pode gastar 5 MP para rodar um teste de criatividade de DT 15 e inventar uma engenhoca para algum teste especificado (você escolhe) e acoplar a qualquer ser vivo. O alvo recebe +2 no teste determinado. Se o teste falhar, a engenhoca dá um bônus de +1 a um teste aleatório. A engenhoca tem uma bateria que dura 2 horas e não pode ser recarregada. Só é possível ter uma engenhoca ativa em um ser vivo por vez. A engenhoca pode ser retirada e realocada em outro ser vivo após colocação. A critério do mestre, você também pode rodar um teste de competência e inventar outras pequenas bugigangas como câmeras, rastreadores, drones, alarmes etc. Essa habilidade só pode ser utilizada se o usuário tiver uma ferramenta mecânica.',
            origin: 'Inventor',
            type: 'Linhagem'
        },
        {
            name: 'Encantado',
            description: 'O vício em magia fortalece seu espírito. Você recebe +1 MP a cada nível atingido.',
            origin: 'Idólatra',
            type: 'Linhagem'
        },
        {
            name: 'Desilusão',
            description: 'É melhor prevenir do que remediar. Você pode anular qualquer magia se pagar 20 MP. Limitado a 2 vezes por dia.',
            origin: 'Cismático',
            type: 'Linhagem'
        },
        {
            name: 'Decodificação Mágica',
            description: 'Decodificadores são dispositivos que permitem que você leia e altere os códigos mágicos transmitidos pelos satélites. Você pode gastar 5 MP para rodar um teste de competência de DT 15 e decodificar uma magia que você tenha visto ou sentido, e assim, aprender a usá-la. Se o teste falhar, você recebe uma magia aleatória que pode ser útil ou não. O decodificador tem uma memória que armazena até 5 magias decodificadas, e você pode apagar ou substituir as magias armazenadas. Você pode usar as magias decodificadas como se fossem suas, mas elas consomem o dobro de MP. A critério do mestre, você também pode rodar um teste de competência e decodificar outras informações mágicas, como a localização, a intensidade, o tipo etc. Essa habilidade só pode ser utilizada se o usuário tiver um decodificador.',
            origin: 'Pesquisador',
            type: 'Linhagem'
        },
        {
            name: 'Rastreamento',
            description: 'Graças à sua experiência, sua habilidade em seguir pistas e rastrear alvos é incomparável. Esta habilidade te permite gastar 5 MP em um teste: Você pode escolher um alvo que você tenha visto ou sentido, e saber a sua localização exata, a distância, a direção e o tempo que ele levou para chegar até lá. Você também pode saber se o alvo está sob efeito de alguma magia ou se ele tem algum ORM. Esta habilidade pode ser usada em combate ou fora dele.',
            origin: 'Investigador',
            type: 'Linhagem'
        }
    ],
    class: {
        'Combatente': [
            {
                'name': 'Bom de Briga',
                'description': 'Você pode adicionar seu bônus de Luta para dano em ataques corpo-a-corpo.',
                'origin': 'Combatente',
                'type': 'Classe',
                'level': 0
            },
            {
                'name': 'Reflexos Aumentados',
                'description': 'Você ganha +1 dado em testes de agilidade (incluindo iniciativa).',
                'origin': 'Combatente',
                'type': 'Classe',
                'level': 1
            },
            {
                'name': 'Regeneração Furiosa',
                'description': 'Quando seus LP ficarem abaixo de 50%, você regenera 1d6 por turno até atingir 50% de seus LP novamente.',
                'origin': 'Combatente',
                'type': 'Classe',
                'level': 5
            },
            {
                'name': 'Armado',
                'description': 'Armas corpo-a-corpo dão +1 dados do mesmo tipo de dano.',
                'origin': 'Combatente',
                'type': 'Classe',
                'level': 10
            },
            {
                'name': 'Não-Elementalista',
                'description': 'Magias não-elementais têm +1 dado respectivo para cálculo de dano, cálculo de cura, chance de acerto, etc.',
                'origin': 'Combatente',
                'type': 'Classe',
                'level': 15
            },
            {
                'name': 'Muralha',
                'description': 'Quando você fica com 10% ou menos de LP, seu ataque aumenta em 50% até você atingir 50% da sua vida novamente.',
                'origin': 'Combatente',
                'type': 'Classe',
                'level': 20
            }
        ],

        'Especialista': [
            {
                'name': 'Treinado',
                'description': 'Uma vez por cena, você pode pagar 1 MP para rolar novamente um dos dados (ou o dado, no caso de um) e substituí-lo (ou não) pelo novo resultado. Limitado a 3 vezes ao dia.',
                'origin': 'Especialista',
                'type': 'Classe',
                'level': 0
            },
            {
                'name': 'Esforço',
                'description': 'Você pode pagar 2 MP para adicionar +2 Pontos bônus em qualquer teste, exceto esquiva, cálculo de dano ou bloqueio de ataque.',
                'origin': 'Especialista',
                'type': 'Classe',
                'level': 1
            },
            {
                'name': 'Perspectiva',
                'description': 'Uma vez por combate, você pode diminuir a margem de crítico em 1 ponto (ao invés de 20, serão necessários 19 pontos no dado para contabilizar um ataque crítico) para a próxima habilidade, magia ou ataque.',
                'origin': 'Especialista',
                'type': 'Classe',
                'level': 5
            },
            {
                'name': 'Afluência',
                'description': 'Você pode escolher uma das seguintes opções (que sejam compatíveis com seu nível): +1 Habilidade de qualquer classe ou subclasse (equivalente a seu nível), +3 Poderes mágicos, +1 Magia Nível 4.',
                'origin': 'Especialista',
                'type': 'Classe',
                'level': 10
            },
            {
                'name': 'Preferência',
                'description': 'Você pode escolher magias de um tipo elemental específico e armas de uma categoria específica para serem adicionadas +3 pontos em testes que você as utilize. Após utilizar essa habilidade, não será possível utilizá-la novamente até completar 2 dias. Melhora a habilidade \'Esforço\' de +2 pontos bônus para +3 pontos bônus.',
                'origin': 'Especialista',
                'type': 'Classe',
                'level': 15
            },
            {
                'name': 'Sucessão',
                'description': 'Em caso de passar com sucesso em 3 testes consecutivos, você tem sua vida e mana regeneradas em +5 pontos e o próximo ataque aumentado é em +10 pontos também, além de +2 pontos bônus no próximo teste.',
                'origin': 'Especialista',
                'type': 'Classe',
                'level': 20
            }
        ],

        'Feiticeiro': [
            {
                'name': 'Feitiçaria',
                'description': 'Você ganha +1 de dano para todas as magias de ataque que você utilizar. Além disso, ao adquirir essa habilidade, escolha uma magia nível 1 e aprenda-a.',
                'origin': 'Feiticeiro',
                'type': 'Classe',
                'level': 0
            },
            {
                'name': 'Prevenção Mágica',
                'description': 'Magias que dão dano em área agora afetam somente a inimigos. Além disso, não é possível você se ferir com uma magia conjurada por você mesmo.',
                'origin': 'Feiticeiro',
                'type': 'Classe',
                'level': 1
            },
            {
                'name': 'Magia Guiada',
                'description': 'Caso você acerte um mesmo inimigo com uma mesma magia duas vezes ou mais, você ganha +1d4 para cada acerto, sucessivamente. Não é cumulativo e o limite é de três acertos consecutivos. Esta habilidade reseta caso você tome dano ou ataque outra criatura com uma magia diferente ou arma.',
                'origin': 'Feiticeiro',
                'type': 'Classe',
                'level': 5
            },
            {
                'name': 'Fixação Mágica',
                'description': 'Você pode escolher uma magia específica que você sabe e colocar um fixador mágico nela: A magia pula um estágio à frente e adiciona +1d6 em testes desta magia. Caso a magia esteja no estágio máximo, adiciona +5 ao dano. Você é invulnerável a esta magia caso alguém o ataque com ela.',
                'origin': 'Feiticeiro',
                'type': 'Classe',
                'level': 10
            },
            {
                'name': 'Imunidade Mágica',
                'description': 'Você é invulnerável a qualquer magia da sua maestria elemental.',
                'origin': 'Feiticeiro',
                'type': 'Classe',
                'level': 15
            },
            {
                'name': 'Magismo Total',
                'description': 'Diminui o custo de conjuração de magia em -1 MP. Além disso, você não gasta MP extras ao utilizar magias de nível 4 no estágio \'MAESTRIA\'.',
                'origin': 'Feiticeiro',
                'type': 'Classe',
                'level': 20
            }
        ],

        'Bruxo': [
            {
                'name': 'Fazer Poção',
                'description': 'Você possui a habilidade de criar poções. Utilize matéria orgânica e recipientes vazios para criar poções com variados efeitos como força, cura, mana e outros. Requer testes com DT mínima de 15 e consome 1 MP por poção.',
                'origin': 'Bruxo',
                'type': 'Classe',
                'level': 0
            },
            {
                'name': 'Inverter Polaridades',
                'description': 'Uma vez por dia, inverta a energia vital de uma criatura. Cura se torna dano, e dano se torna cura. Dura 5 turnos, uma rodada ou uma hora.',
                'origin': 'Bruxo',
                'type': 'Classe',
                'level': 1
            },
            {
                'name': 'Maldição',
                'description': 'Por 3 MP, amaldiçoe um alvo para que todo dano aplicado a ele receba um adicional de até +3d4. Quando o feitiço termina, você e aliados recuperam LP e MP. Reaplicável em novo alvo ao cair do primeiro.',
                'origin': 'Bruxo',
                'type': 'Classe',
                'level': 5
            },
            {
                'name': 'Recobro Maldito',
                'description': 'Três vezes ao dia, marque até 3 criaturas. Quem causar dano a elas recupera 2d10+5 LP. Dura uma rodada.',
                'origin': 'Bruxo',
                'type': 'Classe',
                'level': 10
            },
            {
                'name': 'Anátema Elemental',
                'description': 'Cinco vezes ao dia, amaldiçoe um alvo com desvantagem a um elemento escolhido. O alvo sofre dano dobrado do elemento e cura o atacante ao usá-lo.',
                'origin': 'Bruxo',
                'type': 'Classe',
                'level': 15
            },
            {
                'name': 'Contato Astral',
                'description': 'Entre em contato com entidades místicas como bestas, demônios ou deuses. Exige teste de Resistência Mental. Sucesso forma pacto temporário; falha resulta em 8d8 de dano psíquico.',
                'origin': 'Bruxo',
                'type': 'Classe',
                'level': 20
            }
        ],

        'Monge': [
            {
                'name': 'Autoconsciência',
                'description': 'Você possui a habilidade de entrar em diferentes estados quando estiver em combate: Calma, Fúria e Divino. Cada estado confere benefícios únicos e dura até o próximo turno ou uma rodada (Veja o livro de regras).',
                'origin': 'Monge',
                'type': 'Classe',
                'level': 0
            },
            {
                'name': 'Cura Interior',
                'description': 'Você pode, três vezes ao dia, se curar em 2d6 como ação livre. Só pode ser utilizada uma vez por combate.',
                'origin': 'Monge',
                'type': 'Classe',
                'level': 1
            },
            {
                'name': 'Reflexos',
                'description': 'Você pode, como ação livre, ganhar +2 em Agilidade. Caso você esteja no estado de calma, você ganha +5 pontos em Agilidade além de prolongar seu estado até o turno seguinte.',
                'origin': 'Monge',
                'type': 'Classe',
                'level': 5
            },
            {
                'name': 'Meditação',
                'description': 'Você pode, uma vez por combate, entrar no estado de meditação. Recupera 2d4 de LP e 1d4 de MP por turno por 3 turnos, mas você não pode se mover ou atacar. Pode transferir seus estados (calma, fúria e divino) a uma criatura tocada.',
                'origin': 'Monge',
                'type': 'Classe',
                'level': 10
            },
            {
                'name': 'Força Vital',
                'description': 'Caso você possua 20 LP ou menos, adicione os LP restantes em seus ataques até se recuperar.',
                'origin': 'Monge',
                'type': 'Classe',
                'level': 15
            },
            {
                'name': 'Aura Efêmera',
                'description': 'Uma vez por dia, gera uma aura de 5 metros que cura você e aliados em 3d4 por rodada e aumenta chance de acerto em +3. No estado de fúria, aliados ganham +5 em chance de acerto e +3d4 para qualquer ataque. Mantém a aura ativa gastando 2 LP por turno.',
                'origin': 'Monge',
                'type': 'Classe',
                'level': 20
            }
        ],

        'Druida': [
            {
                'name': 'Retaguarda',
                'description': 'Uma vez por combate, para cada aliado que você fortalecer ou curar, invoca 3 orbes elementais diferentes que causam 1d4 de dano cada. Direcionáveis como ação livre.',
                'origin': 'Druida',
                'type': 'Classe',
                'level': 0
            },
            {
                'name': 'Cura Reveladora',
                'description': 'Curar diretamente um aliado confere +2 de chance de acerto no próximo ataque. Não cumulativo.',
                'origin': 'Druida',
                'type': 'Classe',
                'level': 1
            },
            {
                'name': 'Plano de Recuperação',
                'description': 'Cria uma área de 3m que cura aliados em 2d4 por turno e impede estados negativos. Inimigos sofrem 2d4 de dano ao entrar. Dura 3 turnos. Usável 3 vezes ao dia.',
                'origin': 'Druida',
                'type': 'Classe',
                'level': 5
            },
            {
                'name': 'Vínculo Druídico',
                'description': 'Marca até três criaturas tocadas. Você absorve até 10 pontos de dano sofrido por elas e recupera 1 MP por ocorrência.',
                'origin': 'Druida',
                'type': 'Classe',
                'level': 10
            },
            {
                'name': 'Peripécia',
                'description': 'Aumenta o raio do Plano de Recuperação para 9m e dura 5 turnos. Você e aliados ganham +2 MP para cada teste bem-sucedido dentro da área.',
                'origin': 'Druida',
                'type': 'Classe',
                'level': 15
            },
            {
                'name': 'Fraternidade',
                'description': 'Três vezes ao dia, vincula os corações dos aliados em batalha. Ao sofrerem ataque, ganham +2 LP, +1 MP e +1 de dano por duas rodadas.',
                'origin': 'Druida',
                'type': 'Classe',
                'level': 20
            }
        ],

        'Arcano': [
            {
                'name': 'Magia Simbólica',
                'description': 'Você pode gastar 2 MP mais o custo de uma magia para criar símbolos mágicos que representam e ativam suas magias como armadilhas ou runas.',
                'origin': 'Arcano',
                'type': 'Classe',
                'level': 0
            },
            {
                'name': 'Concentração',
                'description': 'Uma vez por cena, entra em estado de concentração e recupera 2d6 + FOC de LP. Em combate, consome uma ação completa.',
                'origin': 'Arcano',
                'type': 'Classe',
                'level': 1
            },
            {
                'name': 'Magia Furtiva',
                'description': 'Conjurar magias via Magia Simbólica adiciona +2d4+1 de dano ou cura extra.',
                'origin': 'Arcano',
                'type': 'Classe',
                'level': 5
            },
            {
                'name': 'Magia Resiliente',
                'description': 'Ao resistirem a sua magia, gaste 3 MP para forçar novo teste com desvantagem. Adiciona FOC ao dano e cura de magias.',
                'origin': 'Arcano',
                'type': 'Classe',
                'level': 10
            },
            {
                'name': 'Adiar Magia',
                'description': 'Por 5 MP extras, magias conjuradas ativam no mesmo turno.',
                'origin': 'Arcano',
                'type': 'Classe',
                'level': 15
            },
            {
                'name': 'Ascensão Arcana',
                'description': 'Margem de crítico de magias reduzida para 19. Sofre metade do dano de ataques mágicos.',
                'origin': 'Arcano',
                'type': 'Classe',
                'level': 20
            }
        ],

        'Ladino': [
            {
                'name': 'Disfarce',
                'description': 'Caso você entre em furtividade com sucesso em seu turno, você ganha uma ação padrão extra.',
                'origin': 'Ladino',
                'type': 'Classe',
                'level': 0
            },
            {
                'name': 'Ligeireza',
                'description': 'Caso esteja furtivo, você ganha duas ações de movimento no começo do turno. Andar ou correr não alerta criaturas próximas.',
                'origin': 'Ladino',
                'type': 'Classe',
                'level': 1
            },
            {
                'name': 'Ataque Duplo',
                'description': 'Você pode atacar duas vezes no mesmo turno caso erre um ataque. Todos os ataques são silenciosos.',
                'origin': 'Ladino',
                'type': 'Classe',
                'level': 5
            },
            {
                'name': 'Sempre Distante',
                'description': 'Armas de fogo ou longa distância ganham +1 dado de dano. Caso esteja furtivo, ganham +2 dados adicionais do mesmo tipo de dano.',
                'origin': 'Ladino',
                'type': 'Classe',
                'level': 10
            },
            {
                'name': 'Abscondido',
                'description': 'Quando furtivo, você enxerga no escuro, ouve sons mais altos, vê mais longe e identifica criaturas escondidas. Ganha +2 AP, regenera +1 MP/turno e adiciona +10 de dano a ataques.',
                'origin': 'Ladino',
                'type': 'Classe',
                'level': 15
            },
            {
                'name': 'Prejuízo',
                'description': 'Se o alvo estiver em estado negativo, seus ataques acima de 15 na rolagem são críticos. Furtivo, dano crítico é multiplicado por 3.',
                'origin': 'Ladino',
                'type': 'Classe',
                'level': 20
            }
        ]
    },
    subclass: {
        // Combatente
        'Polimorfo': [
            {
                'name': 'Metamorfose Adaptativa',
                'description': 'Sempre que você sofre dano, pode gastar 3 MP para reduzir esse dano em 50%. Esta habilidade pode ser ativada até 3 vezes por combate.',
                'origin': 'Polimorfo',
                'type': 'Subclasse',
                'level': 10
            },
            {
                'name': 'Pele Resistente',
                'description': 'Sua constituição se adapta automaticamente ao ambiente. Você ganha +2 AP permanente e é imune a condições climáticas extremas (calor, frio, radiação) e a efeitos negativos (queimadura, congelamento, necrose).',
                'origin': 'Polimorfo',
                'type': 'Subclasse',
                'level': 15
            },
            {
                'name': 'Forma Primordial',
                'description': 'Ao gastar todos seus MPs, você pode entrar no estado de \'Brutamonte\', onde ignora pontos de AP e diminui a margem de crítico em 2 pontos. Uma vez por dia. Dura até o fim do combate.',
                'origin': 'Polimorfo',
                'type': 'Subclasse',
                'level': 20
            }
        ],
        'Comandante': [
            {
                'name': 'Liderar',
                'description': 'Sempre que um aliado atacar um inimigo que você atacou no turno anterior, o aliado ganha +2 no teste de acerto e +2d8 de dano, liderando seu ataque.',
                'origin': 'Comandante',
                'type': 'Subclasse',
                'level': 10
            },
            {
                'name': 'Postura Defensiva',
                'description': 'Ao gastar 5 MP, você pode adotar uma postura defensiva por 2 turnos, concedendo +3 AP e +3 de Agilidade a si mesmo e todos os aliados próximos (raio de 6 metros). Durante esse período, seus ataques causam -1d8 de dano. Três vezes ao dia. Dura até o fim do combate ou até você cancelar.',
                'origin': 'Comandante',
                'type': 'Subclasse',
                'level': 15
            },
            {
                'name': 'Chamado à Glória',
                'description': 'Três vezes ao dia, uma vez por combate, você pode gastar 12 MP para inspirar todos os aliados dentro de 15 metros. Eles ganham vantagem +2 (jogam +1d20+2) em todos os testes de ataque e resistência até o final do combate. Além disso, no final do turno de cada um, se curam em +1d6 LP e regeneram +1d4 MP.',
                'origin': 'Comandante',
                'type': 'Subclasse',
                'level': 20
            }
        ],

        // ESPECIALISTA
        'Forasteiro': [
            {
                'name': 'Perspicácia',
                'description': 'Você tem +3 em todos os testes de Percepção em terrenos naturais. Marca automaticamente criaturas atacadas com \'Rastro da Presa\', permitindo saber sua localização até a morte em um raio de 10km. Descubra recursos ocultos com 50% de chance em testes de Percepção em ambientes naturais.',
                'origin': 'Forasteiro',
                'type': 'Subclasse',
                'level': 10
            },
            {
                'name': 'Espírito da Caçada',
                'description': 'Aumenta seu dano em +4d6 ao identificar fraquezas de inimigos em terrenos naturais. Torna inimigos vulneráveis a ataques subsequentes por 1 rodada. Detecta criaturas em um raio de 30 metros, concedendo +3 em Furtividade ou Percepção contra aproximações inimigas.',
                'origin': 'Forasteiro',
                'type': 'Subclasse',
                'level': 15
            },
            {
                'name': 'Caminho do Ermo',
                'description': 'Por 3 rodadas, você se torna imune a danos ambientais, recebe +3 em testes de Sobrevivência e +2 em Percepção. Pode consumir recursos naturais para restaurar 2d6 LP ou MP por rodada. Afeta aliados próximos, aumentando resistência ambiental.',
                'origin': 'Forasteiro',
                'type': 'Subclasse',
                'level': 20
            }
        ],
        'Errante': [
            {
                'name': 'Trilheiro',
                'description': 'Ignora penalidades de terreno difícil e permite aliados próximos fazerem o mesmo. Recebe +3 em testes de Sobrevivência e Percepção.',
                'origin': 'Errante',
                'type': 'Subclasse',
                'level': 10
            },
            {
                'name': 'Resiliência Inata',
                'description': 'Diminui todo dano recebido em -1d8+1.',
                'origin': 'Errante',
                'type': 'Subclasse',
                'level': 15
            },
            {
                'name': 'Trilha da Fortuna',
                'description': 'Uma vez por combate, ative um estado supremo por uma rodada para você e aliados: testes são automaticamente bem-sucedidos e adicionam +2d4 a qualquer dano ou cura realizada.',
                'origin': 'Errante',
                'type': 'Subclasse',
                'level': 20
            }
        ],

        // FEITICEIRO
        'Conjurador': [
            {
                'name': 'Conjuração',
                'description': 'Magias do tipo conjurada causam +3d8 de dano adicional e ignoram 3 pontos de resistência mágica. Tempo de conjuração aumenta em +1 turno.',
                'origin': 'Conjurador',
                'type': 'Subclasse',
                'level': 10
            },
            {
                'name': 'Sequela Perfeita',
                'description': 'Ao lançar uma magia de dano com custo maior que 10 MP, escolha um inimigo atingido para ficar vulnerável a dano mágico (+50% de dano recebido) até o final do seu próximo turno.',
                'origin': 'Conjurador',
                'type': 'Subclasse',
                'level': 15
            },
            {
                'name': 'Carga Rúnica',
                'description': 'Magias conjuradas deixam uma runa explosiva no local ou objeto atingido. A runa detona em até 3 turnos, causando 4d8 de dano em inimigos num raio de 10 metros.',
                'origin': 'Conjurador',
                'type': 'Subclasse',
                'level': 20
            }
        ],
        'Elementalista': [
            {
                'name': 'Domínio Elemental',
                'description': 'Escolha um elemento (fogo, água, ar, terra, eletricidade, luz, trevas ou não-elemental). Todas as suas magias desse elemento causam +2d6 de dano e têm +2 de chance de acerto. Você pode trocar o elemento escolhido durante um descanso longo.',
                'origin': 'Elementalista',
                'type': 'Subclasse',
                'level': 10
            },
            {
                'name': 'Fúria Elemental',
                'description': 'Sempre que atingir um inimigo com uma magia, você pode escolher um efeito adicional:\n\n- **Fogo**: O inimigo recebe queimadura simples (1d6 de dano de fogo por 2 turnos).\n- **Água**: Reduz o deslocamento do inimigo em 6.\n- **Terra**: Atordoa o inimigo por 1 turno (Resistência Física para negar).\n- **Ar**: Derruba o inimigo (teste de Reflexos para evitar).',
                'origin': 'Elementalista',
                'type': 'Subclasse',
                'level': 15
            },
            {
                'name': 'Manifestação Elemental',
                'description': 'Uma vez por combate, três vezes no dia, você pode invocar uma forma elemental durante duas rodadas. Escolha um elemento:\n\n- **Fogo**: Cria uma aura flamejante que causa 3d6 de dano a todos os inimigos próximos no início de cada turno. Seus ataques causam +1d12 de dano adicional.\n- **Água**: Você ganha resistência a ataques físicos e cura 1d8 LP por turno. Seus ataques causam 2d8 de dano e reduzem a velocidade dos inimigos.\n- **Terra**: Você ganha +5 AP e imunidade a atordoamento. Seus ataques causam 3d8 de dano e empurram inimigos em linha reta por 5 metros.\n- **Ar**: Sua velocidade dobra, você ganha vantagem em todos os testes que envolvem destreza e seus ataques causam 2d10 de dano adicional.',
                'origin': 'Elementalista',
                'type': 'Subclasse',
                'level': 20
            }
        ],

        // MONGE
        'Discípulo da Fúria': [
            {
                'name': 'Ecos de Raiva',
                'description': 'Sempre que você for alvo de um ataque crítico ou perder 50% ou mais de seus LPs, entre automaticamente no estado de Fúria no próximo turno. Além disso, ao perder LP pela primeira vez em combate, entre em fúria.',
                'origin': 'Discípulo da Fúria',
                'type': 'Subclasse',
                'level': 10
            },
            {
                'name': 'Impacto Devastador',
                'description': 'Ataques no estado de Fúria ignoram 2 de AP do alvo. Ao entrar em Fúria, o primeiro ataque corpo a corpo no turno causa +1d20 de dano adicional.',
                'origin': 'Discípulo da Fúria',
                'type': 'Subclasse',
                'level': 15
            },
            {
                'name': 'Fúria Implacável',
                'description': 'Ganha +2 em todos os testes que envolvem Vigor e Destreza enquanto estiver no estado de Fúria. Caso seus LPs estejam abaixo de 50%, fique em Fúria por tempo ilimitado até se curar ou morrer. Se derrotar um inimigo nesse estado, permaneça em Fúria por mais um turno sem custo adicional.',
                'origin': 'Discípulo da Fúria',
                'type': 'Subclasse',
                'level': 20
            }
        ],
        'Protetor da Alma': [
            {
                'name': 'Presença Tranquilizante',
                'description': 'Ao entrar no estado de Calma, restaura 2d6 LP para você e aliados em um raio de 5 metros no início do turno. Inimigos na área têm desvantagem em ataques e sofrem -2 em testes de resistência enquanto aliados ganham +2 em testes de Agilidade e curam 1d4 LP ao final de cada turno.',
                'origin': 'Protetor da Alma',
                'type': 'Subclasse',
                'level': 10
            },
            {
                'name': 'Aura Serena',
                'description': 'Aliados em um raio de 10 metros ganham +2 em testes de resistência mental e curam +1 LP por turno enquanto você estiver vivo.',
                'origin': 'Protetor da Alma',
                'type': 'Subclasse',
                'level': 15
            },
            {
                'name': 'Harmonia',
                'description': 'Ao entrar em calma 3 vezes consecutivas, você entra no estado de Harmonia: aliados próximos ganham imunidade a dano mágico, +3 em testes envolvendo Destreza e curas feitas por você ou aliados têm +2d8 de bônus. Ao final, cure todos em 3d8 e remova condições debilitantes. Dura até seu próximo turno.',
                'origin': 'Protetor da Alma',
                'type': 'Subclasse',
                'level': 20
            }
        ],

        // BRUXO
        'Necromante': [
            {
                'name': 'Aura Decadente',
                'description': 'Seus ataques e magias sombrias causam +1d6 de dano adicional. Inimigos caídos a 0 LP por suas magias não podem ser ressuscitados ou curados. Inimigos em um raio de 5 metros sofrem -2 em testes de resistência física e recebem 1d4 de dano por turno.',
                'origin': 'Necromante',
                'type': 'Subclasse',
                'level': 10
            },
            {
                'name': 'Legião Profana',
                'description': 'Gaste 10 MP para conjurar até 6 mortos-vivos como lacaios, que duram 3 turnos ou até serem derrotados. Cada lacaio causa 1d10 de dano e possui 15 LP. Ao término, recupere 1d6 MP por lacaio restante.',
                'origin': 'Necromante',
                'type': 'Subclasse',
                'level': 15
            },
            {
                'name': 'Vínculo Obscuro',
                'description': 'Transfira 1d6 LP de aliados ou lacaios para si ou outro aliado em um raio de 10 metros. Mortos-vivos temporariamente criados por você voltam com +2d6 de ataque e +2 AP, mas perdem 10 LP por turno.',
                'origin': 'Necromante',
                'type': 'Subclasse',
                'level': 20
            }
        ],
        'Espiritista': [
            {
                'name': 'Aliança Espectral',
                'description': 'Invoque um espírito aliado no início de cada combate como ação livre. Espíritos disponíveis: Espírito de Cura (+1d4 LP por turno a um aliado) ou Espírito de Ataque (2d8 de dano em inimigos em um raio de 5m). Ambos possuem 20 LP e são atingidos apenas por ataques mágicos.',
                'origin': 'Espiritista',
                'type': 'Subclasse',
                'level': 10
            },
            {
                'name': 'Sustento Espiritual',
                'description': 'Recupere 2 MP sempre que um espírito curar um aliado ou causar dano a um inimigo.',
                'origin': 'Espiritista',
                'type': 'Subclasse',
                'level': 15
            },
            {
                'name': 'Chamado dos Ancestrais',
                'description': 'Adicione +3 espíritos ao seu deck espiritual: Espírito Protetor (+2 AP a um aliado), Espírito Guerreiro (4d10 de dano a um inimigo) e Espírito da Morte (necrose mortal de 3d6 de dano das trevas, custando 2 LP por turno). Controle dois espíritos simultaneamente.',
                'origin': 'Espiritista',
                'type': 'Subclasse',
                'level': 20
            }
        ],

        // DRUIDA

        'Animante': [
            {
                'name': 'Ciclo Vital',
                'description': 'Sempre que um aliado cair a 0 LP, você pode gastar 10 MP para estabilizá-lo automaticamente e curar 3d6 LP. Disponível uma vez para cada aliado por combate.',
                'origin': 'Animante',
                'type': 'Subclasse',
                'level': 10
            },
            {
                'name': 'Fraternidade',
                'description': 'Três vezes por dia, uma vez por combate, você vincula os corações de todos os aliados que estão em batalha com você. Cada vez que eles sofrerem um ataque, todos ganham +3 LP, +2 MP e +1 de dano. Dura duas rodadas. Você pode compartilhar até 25 LP com um aliado em um raio de 3 metros, doando energia vital. Disponível uma vez para cada aliado por combate.',
                'origin': 'Animante',
                'type': 'Subclasse',
                'level': 15
            },
            {
                'name': 'Animação',
                'description': 'Ao pagar 15 MP, você pode criar suas próprias magias-vivas. Todas elas duram por 2 rodadas e possuem 25 LP e 15 AP. Escolha entre os seguintes tipos de magias-vivas: Inteligente (+5 em testes), Protetora (+3 AP em raio de 3 metros), Combatentea (dá 4d4 de dano, ataca duas vezes por turno), Curadora (cura 1d4 por turno), Guardiã (reanima aliados caídos com 100% LP e MP), ou Espiritual (causa ou cura baseado no número de turnos que ficou viva).',
                'origin': 'Animante',
                'type': 'Subclasse',
                'level': 20
            }
        ],
        'Naturomante': [
            {
                'name': 'Vanguarda',
                'description': 'Uma vez por combate, para cada aliado que você fortalecer ou curar, você invoca 5 orbes elementais diferentes aleatórios que causam 1d8 de dano cada. Além disso, aliados fortalecidos ou curados durante o turno ganham +1d4 para utilizar em seu próximo ataque ou teste.',
                'origin': 'Naturomante',
                'type': 'Subclasse',
                'level': 10
            },
            {
                'name': 'Vínculo Florido',
                'description': 'Você pode transferir 1d6 LP de si mesmo para aliados em um raio de 10 metros. Sempre que um aliado cair a 0 LP, pode revivê-lo temporariamente com 50% de LP por 1 turno, durante o qual ele tem +2 de AP e ataques causam dano de luz. Após esse turno, o aliado permanece consciente com 1 LP.',
                'origin': 'Naturomante',
                'type': 'Subclasse',
                'level': 15
            },
            {
                'name': 'Força da Vida',
                'description': 'Uma vez por combate, gaste 10 MP para manifestar energia vital em todo o campo de batalha por uma rodada. Todos os aliados recuperam 2d8 LP no início de cada turno, aliados invocados ganham +2d8 de dano, inimigos sofrem 1d12 de dano por turno e têm desvantagem em ataques. Ao final, aliados em um raio de 15 metros recebem +10 MP e +10 LP.',
                'origin': 'Naturomante',
                'type': 'Subclasse',
                'level': 20
            }
        ],

        // ARCANO

        'Arquimago': [
            {
                'name': 'Teia da Realidade',
                'description': 'Você pode lançar duas magias simultaneamente, desde que ambas sejam de nível 2 ou inferior. O custo de MP para cada magia é aumentado em +1.',
                'origin': 'Arquimago',
                'type': 'Subclasse',
                'level': 10
            },
            {
                'name': 'Anulação Mágica',
                'description': 'Gastando 8 MP, você pode cancelar uma magia de até nível 4 conjurada por um inimigo, desde que esteja dentro de 10 metros. Essa habilidade exige um teste de FOC contra a RES Mágica do inimigo.',
                'origin': 'Arquimago',
                'type': 'Subclasse',
                'level': 15
            },
            {
                'name': 'Manipulação Elemental',
                'description': 'Suas magias elementais podem ser alteradas para qualquer elemento (fogo, água, terra ou ar) antes de serem lançadas, adaptando-as às fraquezas dos inimigos. Além disso, todas suas magias causam um adicional de +1d8 de dano ou de cura.',
                'origin': 'Arquimago',
                'type': 'Subclasse',
                'level': 20
            }
        ],
        'Metamágico': [
            {
                'name': 'Intensificação Mágica',
                'description': 'Ao conjurar uma magia, você pode gastar 2 MP adicionais para aumentar o dano ou a cura em +2d8. Esse efeito pode ser aplicado a qualquer magia que você lançar.',
                'origin': 'Metamágico',
                'type': 'Subclasse',
                'level': 10
            },
            {
                'name': 'Conjuração Rápida',
                'description': 'Você pode lançar magias de nível 1 como ação bônus uma vez por turno.',
                'origin': 'Metamágico',
                'type': 'Subclasse',
                'level': 15
            },
            {
                'name': 'Estágio Quatro',
                'description': 'Você consegue utilizar o \'estágio 4\' de magias nível 1, 2 e 3 pagando um adicional de 12 MP, obtendo efeitos aprimorados como dano aumentado em +3d10, área dobrada, margem de crítico reduzida para 18 e duração de magias sustentadas aumentada. Para magias de nível 4, o custo é 20 MP.',
                'origin': 'Metamágico',
                'type': 'Subclasse',
                'level': 20
            }
        ],

        // LADINO

        'Espectro': [
            {
                'name': 'Desvanecer',
                'description': 'Gastando 6 MP, você pode se tornar invisível por 2 turnos. Durante esse período, ataques contra você têm desvantagem, e ataques feitos por você furtivamente causam +1d10 de dano adicional. Fora de combate dura 15 minutos.',
                'origin': 'Espectro',
                'type': 'Subclasse',
                'level': 10
            },
            {
                'name': 'Sombras Penetrantes',
                'description': 'Enquanto estiver furtivo, caso ataque um inimigo, ele sofre desvantagem em testes de resistência física, mágica e mental contra você. Além disso, você causa +2d6 de dano extra (enquanto estiver furtivo), mesmo que erre o ataque.',
                'origin': 'Espectro',
                'type': 'Subclasse',
                'level': 15
            },
            {
                'name': 'Assassino Etéreo',
                'description': 'Sempre que atacar furtivamente, você pode gastar 8 MP para transformar o dano do ataque em dano mágico, ignorando completamente a armadura do inimigo.',
                'origin': 'Espectro',
                'type': 'Subclasse',
                'level': 20
            }
        ],
        'Estrategista': [
            {
                'name': 'Ataque Calculado',
                'description': 'Sempre que você atacar um inimigo que ainda não tenha agido no combate, você adiciona +3d8 de dano ao ataque.',
                'origin': 'Estrategista',
                'type': 'Subclasse',
                'level': 10
            },
            {
                'name': 'Reflexos Táticos',
                'description': 'Você pode se esquivar de um primeiro ataque uma vez por combate e contra-atacar. Além disso, ganhe uma Retaliação contra a criatura que realizou o ataque.',
                'origin': 'Estrategista',
                'type': 'Subclasse',
                'level': 15
            },
            {
                'name': 'Ritmo da Batalha',
                'description': 'Uma vez por combate, você pode gastar 10 MP para entrar em um estado de domínio total por duas rodadas: realize dois ataques como parte de uma única ação padrão, todos os ataques ganham +2 em chance de acerto e ignoram 2 pontos de armadura. Inimigos atacados por você têm desvantagem em seus ataques no turno seguinte.',
                'origin': 'Estrategista',
                'type': 'Subclasse',
                'level': 20
            }
        ]
    },
    bonus: [],
    occupation: [
        {
            'name': 'Memorável',
            'description': 'Seu carisma convence o público. Testes que usam CAR podem ser somados a +1d10 além de jogar com vantagem (adiciona +1d20 para o teste) se forem pagos 2 MP.',
            'type': 'Profissão',
            'origin': 'Artista'
        },
        {
            'name': 'Salvador de Vidas',
            'description': 'Pode estabilizar um aliado caído (com 0 PV) como ação livre, restaurando 1d10 + Medicina. Pode ser usado 1 vez por combate ou cena.',
            'type': 'Profissão',
            'origin': 'Médico'
        },
        {
            'name': 'Disciplina de Combate',
            'description': 'Pode rolar novamente qualquer teste de Reflexos ou Liderança uma vez por combate.',
            'type': 'Profissão',
            'origin': 'Militar'
        },
        {
            'name': 'Golpe Sorrateiro',
            'description': 'Quando atacar um inimigo pelas costas ou em emboscadas, adicione 1d10 ao dano causado.',
            'type': 'Profissão',
            'origin': 'Mafioso'
        },
        {
            'name': 'Refogado Revigorante',
            'description': 'Como uma ação, pode preparar uma refeição simples que restaura 1d8+1 PV para até 3 aliados (uma vez por cena).',
            'type': 'Profissão',
            'origin': 'Cozinheiro'
        },
        {
            'name': 'Improvisação',
            'description': 'Pode gastar 1d4 turnos para construir um dispositivo, bugiganga, aparato ou armadilha que pode dar vantagem em um teste específico, dano, cura, entre outros (critério do Mestre).',
            'type': 'Profissão',
            'origin': 'Inventor'
        },
        {
            'name': 'Cultivador',
            'description': 'Pode criar um pequeno jardim que gera suprimentos básicos após 1d4 dias (critério do Mestre).',
            'type': 'Profissão',
            'origin': 'Jardineiro'
        },
        {
            'name': 'Hacker',
            'description': 'Pode invadir sistemas eletrônicos ou robôs, ganhando controle temporário por 1d6 turnos.',
            'type': 'Profissão',
            'origin': 'Programador'
        },
        {
            'name': 'Análise Rápida',
            'description': 'Pode identificar fraquezas de inimigos, concedendo vantagem a aliados por 2 turnos.',
            'type': 'Profissão',
            'origin': 'Cientista'
        },
        {
            'name': 'Descoberta',
            'description': 'Uma vez por cena, pode realizar um teste de Conhecimento com vantagem para encontrar informações úteis ou resolver enigmas.',
            'type': 'Profissão',
            'origin': 'Pesquisador'
        },
        {
            'name': 'Planejamento',
            'description': 'Concede +1d8 a testes de um aliado próximo por dois turnos (uma vez por cena).',
            'type': 'Profissão',
            'origin': 'Empresário'
        },
        {
            'name': 'Mentoria',
            'description': 'Pode ensinar um aliado, concedendo vantagem em um teste de sua escolha (uma vez por cena).',
            'type': 'Profissão',
            'origin': 'Professor'
        },
        {
            'name': 'Palavras que Movem',
            'description': 'Pode convencer NPCs a realizar uma ação específica, rolando Diplomacia com vantagem.',
            'type': 'Profissão',
            'origin': 'Político'
        },
        {
            'name': 'Mestre do Crime',
            'description': 'Pode realizar um teste de Furtividade ou Ladinagem com vantagem uma vez por cena.',
            'type': 'Profissão',
            'origin': 'Criminoso'
        },
        {
            'name': 'Construtor',
            'description': 'Pode improvisar uma barreira ou dispositivo funcional com materiais disponíveis (critério do Mestre).',
            'type': 'Profissão',
            'origin': 'Engenheiro'
        },
        {
            'name': 'Manutenção Rápida',
            'description': 'Pode restaurar temporariamente um veículo ou equipamento quebrado em 1d4 turnos.',
            'type': 'Profissão',
            'origin': 'Mecânico'
        },
        {
            'name': 'Versatilidade',
            'description': 'Pode escolher uma habilidade de outra profissão por uma cena (uma vez por dia).',
            'type': 'Profissão',
            'origin': 'Autônomo'
        },
        {
            'name': 'Explosão de Energia',
            'description': 'Pode adicionar +1d10 a um teste de Atletismo ou Reflexos (uma vez por cena).',
            'type': 'Profissão',
            'origin': 'Atleta'
        },
        {
            'name': 'Olhos de Águia',
            'description': 'Pode identificar detalhes cruciais em uma cena, concedendo vantagem a testes de Percepção.',
            'type': 'Profissão',
            'origin': 'Detetive'
        },
        {
            'name': 'Caminho Seguro',
            'description': 'Reduz pela metade o tempo necessário para viajar ou explorar uma área, evitando armadilhas e perigos ocultos.',
            'type': 'Profissão',
            'origin': 'Sucateiro'
        },
        {
            'name': 'Caçada Precisa',
            'description': 'Pode rolar novamente um teste de Pontaria contra um alvo.',
            'type': 'Profissão',
            'origin': 'Caçador'
        },
        {
            'name': 'Proteção Divina',
            'description': 'Pode conceder +1d6 em testes de RES Mental ou RES Física para um aliado (uma vez por cena).',
            'type': 'Profissão',
            'origin': 'Clérigo'
        },
        {
            'name': 'Resiliente',
            'description': 'Pode evitar a morte uma vez por cena, ficando com 1 PV em vez de cair.',
            'type': 'Profissão',
            'origin': 'Desempregado'
        }
    ],
    race: [
        {
            'name': 'Adaptabilidade Essencial',
            'description': 'Sua capacidade de adaptação, que levou à criação da magia artificial, permite que você aprenda mais rapidamente. Você ganha dois pontos de perícia adicional para distribuir em qualquer teste à sua escolha a cada 5 níveis de personagem.',
            'type': 'Raça',
            'origin': 'Humano'
        },
        {
            'name': 'Otimização Cibernética',
            'description': 'Sua fusão com a máquina permite otimizar sistemas. Uma vez por combate, você pode gastar 1 MP para recalibrar sua mira ou defesa. Seus próximos 2 ataques ganham +2 de bônus no teste de acerto, ou você ganha +1 AP temporário por 1 turno (a sua escolha).',
            'type': 'Raça',
            'origin': 'Ciborgue'
        },
        {
            'name': 'Resiliência Sintética',
            'description': 'Sua construção 100% mecânica  o torna resistente a certas condições. Você tem vantagem em testes de Resistência Física contra efeitos de envenenamento e doença. Além disso, quando for alvo de dano de eletricidade, o dano é reduzido em 1d10.',
            'type': 'Raça',
            'origin': 'Humanoide'
        },
        {
            'name': 'Carga Mágica',
            'description': 'Sua essência mágica infunde seus sistemas. Uma vez por combate, você pode escolher carregar um aliado (ou a si mesmo) com energia mágica. O alvo regenera 1 MP por turno por uma rodada. Essa habilidade pode ser usada uma vez por combate.',
            'type': 'Raça',
            'origin': 'Autômato'
        },
        {
            'name': 'Surto Adaptativo',
            'description': 'A energia mágica imbuída em você pode se manifestar em momentos de estresse. Quando seus LPs caírem abaixo de 25% do total, você ganha 1d6 de dano extra em todos os seus ataques por uma rodada. Essa habilidade pode ser ativada uma vez por combate.',
            'type': 'Raça',
            'origin': 'Mutante'
        },
        {
            'name': 'Essência Fluida',
            'description': 'Sendo um ser de pura magia, sua essência é maleável. Você pode gastar 1 MP adicional ao conjurar uma magia para aumentar seu alcance em um grau (Curto para Padrão, Padrão para Médio, etc.) ou para adicionar +2 à DT (Dificuldade de Teste) de um teste de resistência do alvo contra sua magia.',
            'type': 'Raça',
            'origin': 'Magia-viva'
        }
    ]
}