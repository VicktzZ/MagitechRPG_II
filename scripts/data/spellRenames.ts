/* eslint-disable max-len */
import type { SpellTypeChange } from '../../utils/spellTypeChanges'

/**
 * Nomes de magia trocados na revisão do catálogo (decisão do dono, 29/10/2026: "alguns nomes são muito semelhantes ou genéricos"). Cada linha diz o porquê. Critérios: nomes quase idênticos entre
 * magias diferentes (uma letra de diferença, mesmo radical com o mesmo efeito), nomes genéricos de uma palavra que não dizem o que a magia faz, nome que também é termo do sistema (perícia, iluminação
 * do combate) e caixa fora do padrão. Magias de famílias com sufixo distinto de propósito ("Criar ou Destruir ...", "Campo de ...", "Elo de ...") ficaram como estavam.
 *
 * **Fica de fora, para o dono decidir:** `Magnetismo` existe duas vezes no catálogo (ids `67806103878f9dc617521f3d` e `...f4d`), com o texto **idêntico**: trocar o nome não resolve, o certo é
 * excluir uma delas.
 *
 * As fichas guardam a magia por **id** (conferido nas 60 fichas de produção: nenhuma referencia o catálogo pelo nome), então trocar o nome não mexe em ficha nenhuma. `from` é o nome que a magia
 * tem no banco: o script (`scripts/applySpellRenames.ts`) só troca quando o documento ainda está assim, e a mesma lista desfaz (`--revert`).
 */
export const SPELL_RENAMES: SpellTypeChange[] = [
    { id: '67806103878f9dc617521f18', name: 'Dança das Brisas', from: 'Dança das Brisas', to: 'Corpo de Brisa' }, // AR N1: a magia transforma o corpo em brisa, não é uma dança; evita a semelhança com 'Dança das Brasas' (uma letra de diferença)
    { id: '68afec438f3889f0ef902333', name: 'Dança das Brasas', from: 'Dança das Brasas', to: 'Rastro de Brasas' }, // FOGO N1: deixa um rastro de brasas; evita a semelhança com 'Dança das Brisas'
    { id: '67806103878f9dc617521f01', name: 'Tsunami Congelante', from: 'Tsunami Congelante', to: 'Varredura Glacial' }, // ÁGUA N3: a família 'Tsunami' tinha 4 magias de elementos diferentes; uma onda de gelo que varre a área
    { id: '67806103878f9dc617521f1e', name: 'Tsunami Aéreo', from: 'Tsunami Aéreo', to: 'Vagalhão de Ar' }, // AR N3: onda de ar pressurizado que arremessa (não é um tsunami)
    { id: '67806103878f9dc617521f5a', name: 'Tsunami Elétrico', from: 'Tsunami Elétrico', to: 'Enchente Elétrica' }, // ELETRICIDADE N4: onda de eletricidade que avança 30m
    { id: '67806103878f9dc617521ee7', name: 'Onda', from: 'Onda', to: 'Golpe de Onda' }, // ÁGUA N1: nome genérico de uma palavra; a magia empurra um alvo com a onda e pega quem está atrás
    { id: '67806103878f9dc617521f5c', name: 'Sobrecarga Neural Massiva', from: 'Sobrecarga Neural Massiva', to: 'Apagão Neural' }, // ELETRICIDADE N4: versão de nível 4 em área de 'Sobrecarga Neural', com efeito próprio (até 5 alvos); nome quase igual ao da irmã
    { id: '67806103878f9dc617521f20', name: 'Implosão', from: 'Implosão', to: 'Asfixia Implosiva' }, // AR N3: nome genérico; seis magias começavam por 'Implosão'; esta remove o ar de uma esfera e sufoca
    { id: '68b7c8a851f884cd85067a14', name: 'Implosão de Pressão', from: 'Implosão de Pressão', to: 'Compressão Abissal' }, // VÁCUO N3: puxa os inimigos de uma área de 6m para o centro
    { id: '68b7c8a851f884cd85067a37', name: 'Implosão de Energia', from: 'Implosão de Energia', to: 'Colapso Energético' }, // EXPLOSÃO N3: a implosão atinge um inimigo e só causa o dano no turno seguinte
    { id: '67806103878f9dc617521f06', name: 'Voo', from: 'Voo', to: 'Rajada Repulsiva' }, // AR N2: o nome não descreve a magia (ela explode ar comprimido e empurra todos); o texto é quase o de 'Explosão de Ar'
    { id: '67806103878f9dc617521ee8', name: 'Bolha', from: 'Bolha', to: 'Bolha Protetora' }, // ÁGUA N1: nome genérico; é a defesa em reação (o outro 'Bolha de Ar' é para respirar)
    { id: '67806103878f9dc617521f27', name: 'Rocha', from: 'Rocha', to: 'Pedrada Atordoante' }, // TERRA N2: nome genérico de uma palavra; a rocha atordoa o alvo
    { id: '67806103878f9dc617521f32', name: 'Espinhos', from: 'Espinhos', to: 'Tríade de Espinhos' }, // TERRA N1: nome genérico; lança três espinhos (já existem 'Chicote de Espinhos' e 'Espinhos Peçonhentos')
    { id: '67806103878f9dc617521f30', name: 'Frutos', from: 'Frutos', to: 'Árvore Frutífera' }, // TERRA N1: nome genérico; cria uma árvore que gera frutos curativos
    { id: '67806103878f9dc617521f3a', name: 'Floresta', from: 'Floresta', to: 'Bosque Encantado' }, // TERRA N2: nome genérico; cria uma zona de plantas que protege e dá furtividade
    { id: '67806103878f9dc617521fb3', name: 'Caos', from: 'Caos', to: 'Entropia Selvagem' }, // NÃO-ELEMENTAL N3: nome genérico; efeito aleatório em área
    { id: '67806103878f9dc617521f91', name: 'Flash', from: 'Flash', to: 'Lampejo Cegante' }, // LUZ N2: era sinônimo de 'Clarão' (outra magia de Luz de nível 1)
    { id: '67806103878f9dc617521f8d', name: 'Prisma', from: 'Prisma', to: 'Espelho de Luz' }, // LUZ N1: nome quase igual ao de 'Prisma Refletor'; esta cria um prisma no ar que reflete magias
    { id: '67806103878f9dc617521f48', name: 'Condução', from: 'Condução', to: 'Projéteis Eletrizados' }, // ELETRICIDADE N1: 'Condução' também é o nome de uma perícia do sistema
    { id: '67806103878f9dc617521fac', name: 'Imunidade', from: 'Imunidade', to: 'Imunidade a Estados' }, // NÃO-ELEMENTAL N1: nome genérico; dá imunidade a estados negativos por 3 turnos
    { id: '67806103878f9dc617521fab', name: 'Habilidoso', from: 'Habilidoso', to: 'Impulso de Perícia' }, // NÃO-ELEMENTAL N1: adjetivo, não nome de magia; dá +3 para passar da DT do próximo teste
    { id: '67806103878f9dc617521fb6', name: 'Estabilização', from: 'Estabilização', to: 'Golpe Reforçado' }, // NÃO-ELEMENTAL N1: o nome não descreve a magia (+3 de dano no próximo ataque)
    { id: '67806103878f9dc617521f92', name: 'Aurora', from: 'Aurora', to: 'Aurora Inspiradora' }, // LUZ N4: havia três 'Aurora': 'Aurora', 'Aurora Restauradora' e 'Aurora da Fênix'
    { id: '67806103878f9dc617521f6a', name: 'Penumbra', from: 'Penumbra', to: 'Escuridão Conjurada' }, // TREVAS N2: 'Penumbra' é um termo de iluminação do combate (cobertura parcial); a magia reduz a visibilidade a zero, ou seja, escuridão
    { id: '67806103878f9dc617521ee5', name: 'Chama essencial', from: 'Chama essencial', to: 'Chama Essencial' }, // FOGO N3: caixa: só a primeira palavra estava com maiúscula
    { id: '67806103878f9dc617521ecc', name: 'Consumir em chamas', from: 'Consumir em chamas', to: 'Consumir em Chamas' }, // FOGO N1: caixa: o resto dos nomes usa maiúscula nas palavras principais
    { id: '67806103878f9dc617521fa6', name: 'Aprimorar alcance', from: 'Aprimorar alcance', to: 'Aprimorar Alcance' }, // NÃO-ELEMENTAL N1: caixa
    { id: '67806103878f9dc617521f60', name: 'Campo Plasmático', from: 'Campo Plasmático', to: 'Plasma Detonante' }, // ELETRICIDADE N1: nome quase igual ao de 'Campo de Plasma'; esta ioniza o ar e explode no turno seguinte
    { id: 'seed-rx-sombra-vingativa', name: 'Sombra Vingativa', from: 'Sombra Vingativa', to: 'Retaliação Sombria' }, // TREVAS N1: nome quase igual ao de 'Sombra Viva'; esta é a reação que golpeia de volta
    { id: '67806103878f9dc617521ef6', name: 'Lâmina Congelante', from: 'Lâmina Congelante', to: 'Arma Enregelada' }, // ÁGUA N1: nome quase igual ao de 'Lâminas Glaciais'; esta encanta a arma do conjurador com gelo
    { id: '68b7c8a851f884cd85067a21', name: 'Telecinese Aprimorada', from: 'Telecinese Aprimorada', to: 'Arremesso Telecinético' }, // PSÍQUICO N3: nome quase igual ao de 'Telecinese'; esta levita ou arremessa um alvo
    { id: 'seed-tmp-meia-vida-vital', name: 'Meia-Vida Vital', from: 'Meia-Vida Vital', to: 'Isótopo Revigorante' }, // RADIAÇÃO N4: nome quase igual ao de 'Meia-Vida'; esta dá LP temporários a cada turno de um aliado
    { id: 'seed-mp-pacto-carmesim', name: 'Pacto Carmesim', from: 'Pacto Carmesim', to: 'Sangria de Mana' }, // SANGUE N3: havia três pactos de sangue; esta sacrifica LP para recuperar MP
    { id: '67806103878f9dc617521f59', name: 'Corrente Condutora', from: 'Corrente Condutora', to: 'Raio Saltitante' } // ELETRICIDADE N1: quase igual a 'Corrente em Cadeia' no nome e no efeito (raio que salta entre alvos)
]
