import type { Skill } from '@types'

export const skills: {
    lineage: Skill[]
    class: Skill[]
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
            name: 'Cleptominia',
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
        }
    ],
    class: [],
    subclass: [],
    bonus: [],
    powers: []
}