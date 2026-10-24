/* eslint-disable max-len */
import type { SpellTypeChange } from '../../utils/spellTypeChanges'

/**
 * Magias do catálogo que RECUPERAM MANA (MP) e o `type` novo de cada uma, com a categoria "Recuperação".
 *
 * Como foi decidido (mapeado lendo o texto dos 3 estágios das 424 magias do catálogo real):
 *  - o critério é a magia devolver MP ao conjurador ou a aliados em algum estágio (inclusive como efeito
 *    secundário, p. ex. "o fruto cura 2d4 LP e 1d4 MP"). Não entram: magia que só CUSTA MP, aumenta ou reduz o
 *    custo de outras, ou tira MP de um inimigo sem devolver nada a ninguém;
 *  - magia cujo único efeito é recuperar MP passa a "Recuperação (subtipo)" (a categoria antiga sai);
 *  - magia que faz outra coisa também (dano, cura, defesa, controle...) ganha a categoria somada:
 *    "Ataque/Recuperação (imediato)". O subtipo, entre parênteses, nunca muda.
 *
 * `from` é o `type` que a magia tem hoje no banco: o script (`scripts/applySpellTypeChanges.ts`) só troca quando o
 * documento ainda está assim, para não passar por cima de uma edição manual.
 */
export const MANA_RECOVERY_TYPE_CHANGES: SpellTypeChange[] = [
    { id: 'seed-mp-arco-voltaico', name: 'Arco Voltaico', from: 'Ataque (imediato)', to: 'Ataque/Recuperação (imediato)' },
    { id: 'seed-mp-aurora-restauradora', name: 'Aurora Restauradora', from: 'Suporte (imediato)', to: 'Recuperação (imediato)' },
    { id: 'seed-mp-brasa-voraz', name: 'Brasa Voraz', from: 'Ataque (imediato)', to: 'Ataque/Recuperação (imediato)' },
    { id: 'seed-mp-capacitor-vivo', name: 'Capacitor Vivo', from: 'Encantamento (contínuo)', to: 'Recuperação (contínuo)' },
    { id: 'seed-mp-chama-piloto', name: 'Chama Piloto', from: 'Encantamento (contínuo)', to: 'Recuperação (contínuo)' },
    { id: 'seed-mp-cisterna-arcana', name: 'Cisterna Arcana', from: 'Utilidade (contínuo)', to: 'Recuperação (contínuo)' },
    { id: 'seed-mp-convergencia-zepta', name: 'Convergência Zepta', from: 'Suporte (contínuo)', to: 'Recuperação (contínuo)' },
    { id: 'seed-mp-danca-do-vento', name: 'Dança do Vento', from: 'Defesa (imediato)', to: 'Recuperação (imediato)' },
    { id: 'seed-mp-decaimento-benigno', name: 'Decaimento Benigno', from: 'Encantamento (contínuo)', to: 'Encantamento/Recuperação (contínuo)' },
    { id: 'seed-mp-detonacao-capacitora', name: 'Detonação Capacitora', from: 'Ataque (imediato)', to: 'Ataque/Recuperação (imediato)' },
    { id: 'seed-mp-fenda-devoradora', name: 'Fenda Devoradora', from: 'Anulação (imediato)', to: 'Anulação/Recuperação (imediato)' },
    { id: 'seed-mp-fluxo-perpetuo', name: 'Fluxo Perpétuo', from: 'Utilidade (contínuo)', to: 'Recuperação (contínuo)' },
    { id: 'seed-mp-mare-cheia', name: 'Maré Cheia', from: 'Encantamento (contínuo)', to: 'Recuperação (contínuo)' },
    { id: 'seed-mp-nucleo-geotermico', name: 'Núcleo Geotérmico', from: 'Encantamento (contínuo)', to: 'Recuperação (contínuo)' },
    { id: 'seed-mp-pacto-carmesim', name: 'Pacto Carmesim', from: 'Encantamento (contínuo)', to: 'Recuperação (contínuo)' },
    { id: 'seed-mp-pedra-de-foco', name: 'Pedra de Foco', from: 'Transmutação (imediato)', to: 'Recuperação (imediato)' },
    { id: 'seed-mp-prisma-refletor', name: 'Prisma Refletor', from: 'Defesa (imediato)', to: 'Defesa/Recuperação (imediato)' },
    { id: 'seed-mp-reserva-subconsciente', name: 'Reserva Subconsciente', from: 'Mentalização (contínuo)', to: 'Recuperação (contínuo)' },
    { id: 'seed-mp-sobrecarga-controlada', name: 'Sobrecarga Controlada', from: 'Utilidade (imediato)', to: 'Recuperação (imediato)' },
    { id: 'seed-mp-sombra-glutona', name: 'Sombra Glutona', from: 'Controle (contínuo)', to: 'Controle/Recuperação (contínuo)' },
    { id: 'seed-mp-transvase-arcano', name: 'Transvase Arcano', from: 'Suporte (imediato)', to: 'Recuperação (imediato)' },
    { id: '68afec438f3889f0ef902342', name: 'Fluxo de Mana', from: 'Cura (Imediato)', to: 'Recuperação (Imediato)' },
    { id: '67806103878f9dc617521f38', name: 'Fotossíntese', from: 'Cura (contínuo)', to: 'Recuperação (contínuo)' },
    { id: '68afec438f3889f0ef90234e', name: 'Sifão de Calor Residual', from: 'Utilidade (Imediato)', to: 'Recuperação (Imediato)' },
    { id: '67806103878f9dc617521f30', name: 'Frutos', from: 'Transmutação (sustentado)', to: 'Transmutação/Recuperação (sustentado)' },
    { id: '67806103878f9dc617521f39', name: 'Vinhedo', from: 'Defesa (conjurado)', to: 'Defesa/Recuperação (conjurado)' },
    { id: '67806103878f9dc617521f3a', name: 'Floresta', from: 'Encantamento (conjurado)', to: 'Encantamento/Recuperação (conjurado)' },
    { id: '67806103878f9dc617521f4c', name: 'Bateria Humana', from: 'Encantamento (sustentado)', to: 'Encantamento/Recuperação (sustentado)' },
    { id: '67806103878f9dc617521f8f', name: 'Cura de Luz', from: 'Cura (imediato)', to: 'Cura/Recuperação (imediato)' },
    { id: '67806103878f9dc617521fa1', name: 'Cura Solar', from: 'Cura (sustentada)', to: 'Cura/Recuperação (sustentada)' },
    { id: '68afec438f3889f0ef902325', name: 'Kraken', from: 'Mentalização (Contínuo)', to: 'Mentalização/Recuperação (Contínuo)' },
    { id: '68afec438f3889f0ef902326', name: 'Jardim do Éden', from: 'Cura (Conjurado, Contínuo)', to: 'Cura/Recuperação (Conjurado, Contínuo)' },
    { id: '68afec438f3889f0ef902329', name: 'Fornalha de Sacrifício', from: 'Ataque (Área/Sacrifício)', to: 'Ataque/Recuperação (Área/Sacrifício)' },
    { id: '68afec438f3889f0ef902340', name: 'Raio Purificador', from: 'Cura/Ataque (Imediato)', to: 'Cura/Ataque/Recuperação (Imediato)' },
    { id: '68afec438f3889f0ef902348', name: 'Drenagem de Alma', from: 'Ataque/Suporte (Sustentado)', to: 'Ataque/Suporte/Recuperação (Sustentado)' },
    { id: '68afec438f3889f0ef90234a', name: 'Campo de Ressonância Energética', from: 'Utilidade/Suporte (Sustentado)', to: 'Utilidade/Suporte/Recuperação (Sustentado)' },
    { id: '68afec438f3889f0ef902354', name: 'Deformação Temporal Localizada', from: 'Mentalização (Imediato)', to: 'Mentalização/Recuperação (Imediato)' },
    { id: '68afec438f3889f0ef902357', name: 'Fúria Catalisadora', from: 'Encantamento (Contínuo)', to: 'Encantamento/Recuperação (Contínuo)' },
    { id: '68afec438f3889f0ef902358', name: 'Correnteza da Vida', from: 'Cura (Sustentado)', to: 'Cura/Recuperação (Sustentado)' },
    { id: '68afec438f3889f0ef90235c', name: 'Elo Vampírico', from: 'Encantamento (Sustentado)', to: 'Encantamento/Recuperação (Sustentado)' },
    { id: '68b7c8a851f884cd85067a11', name: 'Oferenda de Vida', from: 'Cura (Imediato)', to: 'Cura/Recuperação (Imediato)' },
    { id: '68b7c8a851f884cd85067a22', name: 'Drenagem Psíquica', from: 'Drenagem (Contínuo)', to: 'Drenagem/Recuperação (Contínuo)' },
    { id: '68b7c8a851f884cd85067a28', name: 'Cura Radioativa', from: 'Cura (Imediato)', to: 'Cura/Recuperação (Imediato)' },
    { id: 'seed-car-plateia-espectral', name: 'Plateia Espectral', from: 'Ilusão (contínuo)', to: 'Ilusão/Recuperação (contínuo)' },
    { id: 'seed-car-ultima-palavra', name: 'Última Palavra', from: 'Anulação (imediato)', to: 'Anulação/Recuperação (imediato)' },
    { id: '67806103878f9dc617521f7e', name: 'Pacto de Sangue', from: 'Encantamento (sustentado)', to: 'Encantamento/Recuperação (sustentado)' }
]
