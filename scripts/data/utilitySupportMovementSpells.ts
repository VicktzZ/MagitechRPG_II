/* eslint-disable max-len */
import type { SeedSpell } from './manaRecoverySpells'

/**
 * Lote de 30 magias novas: 10 de **Utilidade**, 10 de **Suporte** e 10 de **Movimento**, de elementos e níveis variados (pedido do dono, 29/10/2026).
 *
 * Antes de escrever, li as magias que o catálogo já tinha dessas categorias (Utilidade 5, Suporte 12, Movimento 4) e as 443 do catálogo para não repetir nome nem conceito: não há segunda
 * "Colete de Terra" (já existe +AP com perda de deslocamento), segundo "Impulso" de 6m em linha (Eletrostático e Galeal), segundo "Brado de Guerra" (bônus de acerto em grupo) nem segunda
 * magia de Percepção em aliados (Lente Divina). Cada Utilidade resolve um problema fora da luta (luz, travessia, idioma, abrigo, guardar item, mapear, ouvir, detectar, ver magia, abrir caminho);
 * cada Suporte dá bônus a aliados (deslocamento, medo, conjuração, firmeza, AP em área, iniciativa, foco no alvo, frenesi, mente coletiva, coordenação); cada Movimento muda a posição de um
 * jeito próprio (teleporte de fogo, patinação, salto, sombras, condutor, subida, voo, dimensão, luz, dobra do espaço).
 *
 * Convenções do catálogo (conferidas no Firestore real): `element` em MAIÚSCULAS, `execution` Padrão/Completa/Bônus/Movimento/Reação, `range` abreviado, 3 estágios (no nível 4 o 3º é a
 * Maestria), texto em "turnos" e "combate" com metros como `4,5m`, no máximo UMA expressão de dados por estágio (`rollSpellEffect` rola todas as que achar, então duração nunca vem em dado).
 * O `type` já usa a taxonomia de 29/10/2026: `Categoria (subtipo)` com `/Área` nas que atingem uma área (nenhuma invoca entidade).
 *
 * Ids fixos `seed-ut-*`, `seed-su-*` e `seed-mv-*`. Gravar com `scripts/createSpellBatch.ts` (só ids e nomes novos; aborta se houver colisão).
 */
export const UTILITY_SUPPORT_MOVEMENT_SPELLS: SeedSpell[] = [
    // ═══════════════════════════════════════════════════════════════════════
    // UTILIDADE
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'seed-ut-vigia-luminoso',
        element: 'LUZ',
        name: 'Vigia Luminoso',
        level: 1,
        mpCost: 1,
        type: 'Utilidade (contínuo)',
        execution: 'Padrão',
        range: 'Curto',
        stages: [
            'Você cria um orbe de luz do tamanho de um punho que ilumina 6m de raio e acompanha você a até 9m de distância. Você pode movê-lo como ação de movimento. Dura 10 minutos.',
            'O orbe também revela armadilhas comuns, portas secretas e criaturas invisíveis a até 3m dele: elas ficam delineadas pela luz e perdem os benefícios de estar invisíveis contra quem as vê. Dura 30 minutos.',
            'Você controla até dois orbes e a luz passa a 12m de raio. Ilusões dentro da luz tremeluzem: você e seus aliados ganham +2 em testes para percebê-las. Dura 1 hora.'
        ]
    },
    {
        id: 'seed-ut-ponte-de-gelo',
        element: 'ÁGUA',
        name: 'Ponte de Gelo',
        level: 1,
        mpCost: 2,
        type: 'Utilidade (contínuo)',
        execution: 'Padrão',
        range: 'Curto',
        stages: [
            'Você cria uma ponte de gelo de 1,5m de largura e até 9m de comprimento sobre um vão, um fosso ou água. A ponte aguenta até 500 kg e dura 5 turnos.',
            'A ponte pode ter 15m de comprimento e 3m de largura, aguenta 2 toneladas e não é escorregadia. Você pode criá-la como rampa ou escada. Dura 10 turnos.',
            'A ponte pode se curvar e subir como uma passarela de até 6m de altura. Se for criada sobre água, ela congela uma faixa de 3m de cada lado, deixando o chão firme. Dura 20 turnos.'
        ]
    },
    {
        id: 'seed-ut-interprete-arcano',
        element: 'NÃO-ELEMENTAL',
        name: 'Intérprete Arcano',
        level: 1,
        mpCost: 1,
        type: 'Utilidade (contínuo)',
        execution: 'Padrão',
        range: 'Toque',
        stages: [
            'Você toca uma criatura e passa a entender e falar o idioma dela enquanto ela estiver falando. Dura 1 hora.',
            'Você entende também a escrita nesse idioma e consegue ler os textos que a criatura reconheça. Dura 2 horas.',
            'Você entende todos os idiomas falados e escritos que ouvir ou ler, e até dois aliados a 3m de você também. Dura 4 horas.'
        ]
    },
    {
        id: 'seed-ut-fogueira-eterna',
        element: 'FOGO',
        name: 'Fogueira Eterna',
        level: 1,
        mpCost: 1,
        type: 'Utilidade (contínuo)',
        execution: 'Padrão',
        range: 'Curto',
        stages: [
            'Você acende uma fogueira mágica que não precisa de lenha, ilumina 6m e aquece quem estiver a até 3m dela, protegendo do frio comum. Dura 1 hora.',
            'A fogueira também cozinha, seca roupas em poucos minutos, não se apaga com chuva ou vento comum e afasta animais selvagens não mágicos. Dura 4 horas.',
            'Você pode mudar a cor e a intensidade da chama quando quiser. Quem descansa ao redor dela por uma noite acorda sem sofrer os efeitos de frio ou calor extremo do dia anterior. Dura 8 horas.'
        ]
    },
    {
        id: 'seed-ut-bolso-do-vazio',
        element: 'VÁCUO',
        name: 'Bolso do Vazio',
        level: 2,
        mpCost: 4,
        type: 'Utilidade (imediato)',
        execution: 'Padrão',
        range: 'Toque',
        stages: [
            'Você abre um bolso no vácuo e guarda nele um objeto de até 5 kg que esteja tocando. Você o saca como ação de movimento. O bolso guarda um único objeto e se fecha se você ficar inconsciente.',
            'O bolso guarda até 3 objetos, somando até 15 kg. Você saca um deles como ação Bônus.',
            'O bolso guarda até 6 objetos, somando até 40 kg, e pode ser aberto por um aliado de sua escolha. Armas e objetos mágicos também cabem. Sacar um objeto é ação Bônus.'
        ]
    },
    {
        id: 'seed-ut-mapa-telurico',
        element: 'TERRA',
        name: 'Mapa Telúrico',
        level: 2,
        mpCost: 4,
        type: 'Utilidade (imediato)',
        execution: 'Completa',
        range: 'Pessoal',
        stages: [
            'Você se concentra com os pés no chão e sente as vibrações da terra: percebe a forma de corredores, vãos e as criaturas que tocam o solo em um raio de 18m, sem enxergá-las.',
            'O raio passa a 30m. Você distingue o tamanho e a quantidade das criaturas e localiza minérios, túneis e armadilhas enterradas.',
            'O raio passa a 45m. Você também reconhece o tipo de cada criatura (humanoide, fera, morto-vivo...) e os aliados em contato com você enxergam o mapa que você sente.'
        ]
    },
    {
        id: 'seed-ut-eco-distante',
        element: 'AR',
        name: 'Eco Distante',
        level: 2,
        mpCost: 3,
        type: 'Utilidade (contínuo)',
        execution: 'Padrão',
        range: 'Longo',
        stages: [
            'Você prende um eco do vento em um ponto dentro do alcance e passa a ouvir tudo que for dito a até 9m dele. Dura 5 turnos.',
            'Você também pode falar pelo eco, com a sua voz. Ele só é percebido por quem passar em um teste de Percepção (DT 14). Dura 10 turnos.',
            'Você pode criar dois ecos ao mesmo tempo, em pontos diferentes, e passar a ouvir e falar por qualquer um deles a cada turno. Dura 20 turnos.'
        ]
    },
    {
        id: 'seed-ut-sonar-voltaico',
        element: 'ELETRICIDADE',
        name: 'Sonar Voltaico',
        level: 3,
        mpCost: 6,
        type: 'Utilidade (contínuo/Área)',
        execution: 'Padrão',
        range: 'Pessoal',
        stages: [
            'Você emite um pulso elétrico que revela a posição de todas as criaturas e dispositivos eletrônicos em um raio de 18m, mesmo atrás de paredes finas ou invisíveis. Você sabe onde estão, mas não o que são.',
            'O raio passa a 27m. Você também percebe quais criaturas estão feridas (abaixo de metade dos LP) e quais dispositivos estão ligados.',
            'O raio passa a 36m. As criaturas reveladas perdem os benefícios de estar invisíveis ou escondidas contra você e seus aliados por 3 turnos.'
        ]
    },
    {
        id: 'seed-ut-olhar-arcano',
        element: 'NÃO-ELEMENTAL',
        name: 'Olhar Arcano',
        level: 3,
        mpCost: 5,
        type: 'Utilidade (sustentado)',
        execution: 'Padrão',
        range: 'Pessoal',
        stages: [
            'Você enxerga auras mágicas: as magias ativas, os itens encantados e os conjuradores em um raio de 18m brilham com a cor do elemento deles, enquanto você mantiver a concentração.',
            'Você também identifica o nível de cada magia ativa e a raridade de cada item mágico à vista, além do elemento.',
            'Você vê em que estágio cada magia ativa foi conjurada e quem a conjurou, mesmo que a fonte esteja escondida ou invisível.'
        ]
    },
    {
        id: 'seed-ut-passagem-rochosa',
        element: 'TERRA',
        name: 'Passagem Rochosa',
        level: 4,
        mpCost: 10,
        type: 'Utilidade (contínuo)',
        execution: 'Completa',
        range: 'Médio',
        stages: [
            'Você abre uma passagem de 3m de largura e até 18m de comprimento em linha reta através de terra, pedra ou parede não mágica. A passagem fica aberta por 1 hora e depois se fecha devagar.',
            'A passagem pode ter 30m de comprimento e até duas curvas. Você pode fechá-la quando quiser com um comando, sem esmagar ninguém: quem estiver dentro é empurrado para fora.',
            'A passagem tem até 45m e atravessa também estruturas mágicas fracas (de magias de nível 2 ou menor). Ela fica aberta por 8 horas e você escolhe quem pode usá-la.'
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // SUPORTE
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'seed-su-vento-nas-costas',
        element: 'AR',
        name: 'Vento nas Costas',
        level: 1,
        mpCost: 2,
        type: 'Suporte (contínuo)',
        execution: 'Padrão',
        range: 'Curto',
        stages: [
            'Um vento favorável impulsiona um aliado em alcance: ele ganha +3m de deslocamento e +1 em testes de esquiva (Reflexos). Dura 3 turnos.',
            'Afeta até dois aliados. O deslocamento adicional passa a +4,5m e o bônus de esquiva a +2.',
            'Afeta até três aliados. O deslocamento adicional passa a +6m, o bônus de esquiva continua +2 e o terreno difícil não reduz o deslocamento deles.'
        ]
    },
    {
        id: 'seed-su-chama-da-coragem',
        element: 'FOGO',
        name: 'Chama da Coragem',
        level: 1,
        mpCost: 2,
        type: 'Suporte (contínuo)',
        execution: 'Padrão',
        range: 'Curto',
        stages: [
            'Uma chama brilha no peito de um aliado em alcance: ele ganha +2 em testes de Resistência Mental e fica imune ao Estado Medo. Dura 3 turnos.',
            'Afeta até dois aliados e o bônus passa a +3.',
            'Afeta até três aliados. No início do turno, cada um deles remove um Estado mental (Medo, Confusão ou Charme) que esteja sofrendo.'
        ]
    },
    {
        id: 'seed-su-gota-de-clareza',
        element: 'ÁGUA',
        name: 'Gota de Clareza',
        level: 1,
        mpCost: 2,
        type: 'Suporte (contínuo)',
        execution: 'Padrão',
        range: 'Toque',
        stages: [
            'Você pinga uma gota de água fria sobre a testa de um aliado, clareando a mente dele: ele ganha +2 nos testes de conjuração (Magia) por 3 turnos.',
            'O bônus passa a +3 e, na primeira vez em que o aliado perderia a concentração durante a magia, ele a mantém.',
            'O bônus passa a +4 e o custo em MP da primeira magia que o aliado conjurar a cada turno diminui em 1.'
        ]
    },
    {
        id: 'seed-su-raizes-firmes',
        element: 'TERRA',
        name: 'Raízes Firmes',
        level: 2,
        mpCost: 4,
        type: 'Suporte (contínuo)',
        execution: 'Padrão',
        range: 'Curto',
        stages: [
            'Raízes invisíveis prendem os pés de um aliado ao chão: ele não pode ser empurrado, puxado nem derrubado e ganha +2 em testes de Resistência Física. O deslocamento dele cai pela metade. Dura 3 turnos.',
            'Afeta até dois aliados e o bônus passa a +3.',
            'Afeta até três aliados e eles deixam de sofrer a redução de deslocamento.'
        ]
    },
    {
        id: 'seed-su-estandarte-de-luz',
        element: 'LUZ',
        name: 'Estandarte de Luz',
        level: 2,
        mpCost: 5,
        type: 'Suporte (sustentado/Área)',
        execution: 'Padrão',
        range: 'Médio',
        stages: [
            'Você ergue um estandarte de luz em um ponto dentro do alcance. Aliados em um raio de 4,5m dele ganham +1 de AP e ficam imunes ao Estado Cegueira, enquanto você mantiver a concentração.',
            'O raio passa a 6m e o bônus de AP a +2.',
            'O raio passa a 9m. Quando um aliado dentro da área receber um Estado negativo, ele pode repetir o teste de resistência contra ele, uma vez por aliado por combate.'
        ]
    },
    {
        id: 'seed-su-adrenalina-voltaica',
        element: 'ELETRICIDADE',
        name: 'Adrenalina Voltaica',
        level: 2,
        mpCost: 4,
        type: 'Suporte (contínuo)',
        execution: 'Padrão',
        range: 'Toque',
        stages: [
            'Você descarrega uma corrente leve em um aliado, acelerando os reflexos dele: ele ganha +2 na Iniciativa e +1 em testes de Reflexos por 3 turnos.',
            'O bônus passa a +3 na Iniciativa e +2 em Reflexos, e o aliado ganha +1,5m de deslocamento.',
            'O bônus passa a +4 na Iniciativa e +2 em Reflexos. Uma vez durante a magia, o aliado pode usar uma Reação extra.'
        ]
    },
    {
        id: 'seed-su-alvo-prioritario',
        element: 'NÃO-ELEMENTAL',
        name: 'Alvo Prioritário',
        level: 3,
        mpCost: 6,
        type: 'Suporte (contínuo)',
        execution: 'Padrão',
        range: 'Médio',
        stages: [
            'Você marca um inimigo em alcance como alvo prioritário. Seus aliados ganham +2 nos testes de acerto contra ele por 3 turnos. Só um inimigo pode estar marcado por vez.',
            'O bônus passa a +3 e o inimigo marcado sofre -1 de AP.',
            'O bônus passa a +3, o AP do alvo cai em 2 e, quando ele for derrotado, você marca outro inimigo em alcance sem gastar ação.'
        ]
    },
    {
        id: 'seed-su-foco-coletivo',
        element: 'PSÍQUICO',
        name: 'Foco Coletivo',
        level: 3,
        mpCost: 6,
        type: 'Suporte (sustentado/Área)',
        execution: 'Padrão',
        range: 'Médio',
        stages: [
            'Você sincroniza a mente dos aliados em um raio de 6m ao seu redor: eles ganham +2 em testes de Resistência Mental e não podem ser controlados por magias de nível 2 ou menor, enquanto você mantiver a concentração.',
            'O bônus passa a +3 e, no início do turno de cada aliado, ele remove um Estado mental que esteja sofrendo.',
            'O bônus passa a +4, o raio a 9m e os aliados ganham +2 em Percepção, compartilhando o que cada um percebe.'
        ]
    },
    {
        id: 'seed-su-frenesi-compartilhado',
        element: 'SANGUE',
        name: 'Frenesi Compartilhado',
        level: 4,
        mpCost: 12,
        type: 'Suporte (contínuo/Área)',
        execution: 'Completa',
        range: 'Curto',
        stages: [
            'Você inflama o sangue de até quatro aliados em um raio de 4,5m. Por 3 turnos, eles causam +2 de dano nos ataques e recuperam LP igual a 25% do dano que causarem. Você perde 5% do seu LP máximo (ignora AP).',
            'O raio passa a 6m, o dano adicional a +3 e a recuperação a 35% do dano causado.',
            'Afeta até seis aliados em um raio de 9m. O dano adicional passa a +4, a recuperação a 50% do dano causado e eles ficam imunes aos Estados Medo e Atordoamento enquanto durar.'
        ]
    },
    {
        id: 'seed-su-estrategia-perfeita',
        element: 'NÃO-ELEMENTAL',
        name: 'Estratégia Perfeita',
        level: 4,
        mpCost: 12,
        type: 'Suporte (contínuo)',
        execution: 'Completa',
        range: 'Médio',
        stages: [
            'Você coordena até quatro aliados em alcance por 3 turnos. Uma vez por turno, cada aliado pode repetir um teste que tenha acabado de fazer e ficar com o melhor resultado. Todos ganham +2 na Iniciativa enquanto a magia durar.',
            'A magia dura 4 turnos e os aliados também ganham +1 de AP.',
            'Afeta até seis aliados. O bônus de AP passa a +2 e, uma vez por turno, um aliado pode trocar de lugar com outro aliado sem gastar ação de movimento.'
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // MOVIMENTO
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'seed-mv-passo-de-chamas',
        element: 'FOGO',
        name: 'Passo de Chamas',
        level: 1,
        mpCost: 2,
        type: 'Movimento (contínuo)',
        execution: 'Movimento',
        range: 'Pessoal',
        stages: [
            'Você se envolve em chamas e reaparece em outro ponto que veja a até 6m, sem provocar ataques de oportunidade. As chamas que ficam onde você estava queimam por 1 turno: quem começar o turno nelas sofre 1d6 de dano de fogo.',
            'O deslocamento passa a 9m e as chamas causam 2d6 de dano de fogo.',
            'O deslocamento passa a 12m e, no ponto de chegada, as chamas afastam 1,5m os inimigos adjacentes (teste de Resistência Física evita).'
        ]
    },
    {
        id: 'seed-mv-patinacao-glacial',
        element: 'ÁGUA',
        name: 'Patinação Glacial',
        level: 1,
        mpCost: 2,
        type: 'Movimento (contínuo)',
        execution: 'Movimento',
        range: 'Pessoal',
        stages: [
            'Você cria gelo sob os pés e desliza: ganha +6m de deslocamento por 3 turnos e ignora terreno difícil e superfícies escorregadias.',
            'O bônus passa a +9m e você deixa uma trilha de gelo: inimigos que a atravessarem fazem um teste de Reflexos ou ficam Caídos.',
            'O bônus passa a +12m e até dois aliados que você tocar no início da magia deslizam junto, com +6m de deslocamento.'
        ]
    },
    {
        id: 'seed-mv-salto-sismico',
        element: 'TERRA',
        name: 'Salto Sísmico',
        level: 1,
        mpCost: 2,
        type: 'Movimento (imediato/Área)',
        execution: 'Movimento',
        range: 'Pessoal',
        stages: [
            'Você impulsiona o corpo com a força da terra e salta até 6m de altura ou 9m de distância, sem precisar de corrida. Você pousa de pé e não sofre dano de queda.',
            'O salto alcança 9m de altura ou 12m de distância e, ao pousar, o chão estremece: inimigos adjacentes sofrem 2d6 de dano de terra e fazem um teste de Reflexos ou ficam Caídos.',
            'O salto alcança 12m de altura ou 18m de distância e o estremecimento atinge todos os inimigos em um raio de 3m, causando 4d6 de dano de terra.'
        ]
    },
    {
        id: 'seed-mv-passo-entre-sombras',
        element: 'TREVAS',
        name: 'Passo entre Sombras',
        level: 2,
        mpCost: 4,
        type: 'Movimento (imediato)',
        execution: 'Movimento',
        range: 'Médio',
        stages: [
            'Você mergulha em uma sombra e emerge de outra a até 12m, desde que veja a segunda sombra. Não provoca ataques de oportunidade e, se estiver Furtivo, continua Furtivo.',
            'O alcance passa a 18m e você pode levar consigo um aliado adjacente.',
            'O alcance passa a 24m, você pode levar até dois aliados adjacentes e, ao emergir, o seu primeiro ataque neste turno ganha +2 no acerto.'
        ]
    },
    {
        id: 'seed-mv-salto-relampago',
        element: 'ELETRICIDADE',
        name: 'Salto Relâmpago',
        level: 2,
        mpCost: 4,
        type: 'Movimento (imediato/Área)',
        execution: 'Movimento',
        range: 'Médio',
        stages: [
            'Você se transforma em relâmpago e reaparece sobre uma superfície condutora (metal ou água) que veja a até 18m, sem provocar ataques de oportunidade.',
            'Ao chegar, uma descarga atinge o inimigo mais próximo em até 3m, causando 2d6 de dano elétrico.',
            'Você pode levar um aliado adjacente. Ao chegar, a descarga atinge todos os inimigos em um raio de 3m, causando 3d6 de dano elétrico.'
        ]
    },
    {
        id: 'seed-mv-corrente-ascendente',
        element: 'AR',
        name: 'Corrente Ascendente',
        level: 2,
        mpCost: 3,
        type: 'Movimento (imediato)',
        execution: 'Bônus',
        range: 'Curto',
        stages: [
            'Uma corrente de ar ergue você ou um aliado em alcance até 6m na vertical e o carrega 6m na horizontal. A criatura não sofre dano de queda neste turno.',
            'A criatura sobe até 9m na vertical e é carregada até 9m na horizontal, e pousa de pé.',
            'Afeta até duas criaturas, com até 12m de deslocamento cada uma.'
        ]
    },
    {
        id: 'seed-mv-asas-de-vento',
        element: 'AR',
        name: 'Asas de Vento',
        level: 3,
        mpCost: 7,
        type: 'Movimento (sustentado)',
        execution: 'Movimento',
        range: 'Pessoal',
        stages: [
            'Você ganha asas de vento e pode voar com o seu deslocamento normal, mas precisa terminar cada turno sobre uma superfície sólida ou desce 3m por turno. Dura enquanto você mantiver a concentração.',
            'Você voa com +3m de deslocamento e pode ficar no ar entre os turnos, a até 12m de altura.',
            'Você voa com +6m de deslocamento, até 30m de altura, e pode carregar uma criatura de tamanho médio agarrada a você.'
        ]
    },
    {
        id: 'seed-mv-passo-dimensional',
        element: 'NÃO-ELEMENTAL',
        name: 'Passo Dimensional',
        level: 3,
        mpCost: 6,
        type: 'Movimento (imediato)',
        execution: 'Movimento',
        range: 'Longo',
        stages: [
            'Você rasga o espaço e atravessa para um ponto livre que veja a até 12m, sem provocar ataques de oportunidade.',
            'O alcance passa a 18m e você pode levar um aliado adjacente.',
            'O alcance passa a 24m, você leva até dois aliados adjacentes e, ao chegar, pode se deslocar mais 3m.'
        ]
    },
    {
        id: 'seed-mv-cavalgar-a-luz',
        element: 'LUZ',
        name: 'Cavalgar a Luz',
        level: 3,
        mpCost: 6,
        type: 'Movimento (contínuo/Área)',
        execution: 'Padrão',
        range: 'Pessoal',
        stages: [
            'Você vira um raio de luz e atravessa 18m em linha reta instantaneamente, sem provocar ataques de oportunidade. As criaturas no caminho ficam ofuscadas (-2 nos testes de acerto por 1 turno).',
            'O trajeto passa a 24m e as criaturas no caminho fazem um teste de Resistência Física ou ficam cegas por 1 turno.',
            'O trajeto passa a 30m e, ao chegar, o seu primeiro ataque neste turno ganha +2 no acerto.'
        ]
    },
    {
        id: 'seed-mv-dobra-espacial',
        element: 'VÁCUO',
        name: 'Dobra Espacial',
        level: 4,
        mpCost: 12,
        type: 'Movimento (imediato/Área)',
        execution: 'Completa',
        range: 'Médio',
        stages: [
            'Você dobra o espaço: você e até três aliados em um raio de 3m são transportados para um ponto livre que veja a até 18m, sem provocar ataques de oportunidade.',
            'Até cinco aliados em um raio de 4,5m são transportados para um ponto que veja a até 27m.',
            'Todos os aliados em um raio de 6m são transportados para um ponto a até 36m, mesmo que você não o veja, desde que você já tenha estado nele.'
        ]
    }
]
