/* eslint-disable max-len */
import type { SpellTypeChange } from '../../utils/spellTypeChanges'

/**
 * Reorganização dos tipos e subtipos das magias do catálogo (decisão do dono, 29/10/2026), mapeada lendo o texto dos 3 estágios das 443 magias de produção:
 *  - Buff virou Suporte; Debuff, Ilusão e Anulação viraram Controle;
 *  - os subtipos Sacrifício, Multiplicador, Condicional e Adjacente foram removidos;
 *  - as magias **em área** ganharam o subtipo "Área" e as que **invocam** uma entidade ganharam "Invocação" (somados ao subtipo que já tinham: "imediato/Área").
 *
 * Critério de **área**: em algum estágio a magia atinge uma área (raio, cone, linha, onda, zona, aura com raio) ou todos num grupo ("todos os inimigos", "todos os aliados em alcance"). Não
 * entram: alvos escolhidos um a um ("até 3 alvos", "dois alvos diferentes"), a magia só sobre si, parede ou muralha que só bloqueia, e efeito de ricochete. Critério de **invocação**: a magia cria
 * uma entidade ou criatura com vida própria que age sob o controle do conjurador (gárgulas, golem, serpente, gato, tentáculos, duplicata, sombras de mortos); projétil, arma, escudo e armadilha
 * conjurados não contam.
 *
 * `from` é o `type` que a magia tem no banco: o script (`scripts/applySpellTaxonomy.ts`) só troca quando o documento ainda está assim, e a mesma lista serve para desfazer (`--revert`).
 */
export const SPELL_TAXONOMY_CHANGES: SpellTypeChange[] = [
    { id: '67806103878f9dc617521f6c', name: 'Abismo', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '67806103878f9dc617521fc1', name: 'Âncora Gravitacional', from: 'Encantamento (conjurado)', to: 'Encantamento (conjurado/Área)' },
    { id: 'seed-car-aplauso-estrondoso', name: 'Aplauso Estrondoso', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '67806103878f9dc617521f22', name: 'Apocalipse da Ventania', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '67806103878f9dc617521eff', name: 'Arapuca Gélida', from: 'Encantamento (conjurado)', to: 'Encantamento (conjurado/Área)' },
    { id: '67806103878f9dc617521f95', name: 'Arco de Luz', from: 'Mentalização (sustentado)', to: 'Mentalização (sustentado/Área)' },
    { id: '68afec438f3889f0ef90232e', name: 'Armadilha de Choque Neural', from: 'Ataque (Conjurado)', to: 'Ataque (Conjurado/Área)' },
    { id: '68afec438f3889f0ef902334', name: 'Armadilha de Cristalização', from: 'Controle (Conjurado)', to: 'Controle (Conjurado/Área)' },
    { id: '67806103878f9dc617521f40', name: 'Armadilha do Basilisco', from: 'Transmutação (conjurado)', to: 'Transmutação (conjurado/Área)' },
    { id: '67806103878f9dc617521f7f', name: 'Armadilha Sombria', from: 'Defesa (imediato)', to: 'Defesa (imediato/Área)' },
    { id: '67806103878f9dc617521f13', name: 'Armadura de Pressão', from: 'Defesa (contínuo)', to: 'Defesa (contínuo/Área)' },
    { id: '67806103878f9dc617521ed3', name: 'Armadura Infernal', from: 'Defesa (contínuo)', to: 'Defesa (contínuo/Área)' },
    { id: '68b7c8a851f884cd85067a3a', name: 'Armageddon', from: 'Ataque (Conjurado)', to: 'Ataque (Conjurado/Área)' },
    { id: '68afec438f3889f0ef902349', name: 'Ascensão Gloriosa', from: 'Encantamento/Cura (Sustentado)', to: 'Encantamento/Cura (Sustentado/Área)' },
    { id: '67806103878f9dc617521f8e', name: 'Aura de Luz', from: 'Defesa (sustentada)', to: 'Defesa (sustentada/Área)' },
    { id: '68afec438f3889f0ef902332', name: 'Aura de Melancolia', from: 'Debuff (Contínuo)', to: 'Controle (Contínuo/Área)' },
    { id: '68afec438f3889f0ef902359', name: 'Aura de Precisão', from: 'Encantamento (Contínuo)', to: 'Encantamento (Contínuo/Área)' },
    { id: '67806103878f9dc617521f92', name: 'Aurora', from: 'Encantamento (conjurado)', to: 'Encantamento (conjurado/Área)' },
    { id: 'seed-tmp-aurora-da-fenix', name: 'Aurora da Fênix', from: 'Cura/Recuperação (conjurado)', to: 'Cura/Recuperação (conjurado/Área)' },
    { id: 'seed-mp-aurora-restauradora', name: 'Aurora Restauradora', from: 'Recuperação (imediato)', to: 'Recuperação (imediato/Área)' },
    { id: '67806103878f9dc617521efd', name: 'Avalanche', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '67806103878f9dc617521ee1', name: 'Avatar das Chamas', from: 'Transmutação (contínuo)', to: 'Transmutação (contínuo/Área)' },
    { id: '67806103878f9dc617521f61', name: 'Bafo Amaldiçoado', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '67806103878f9dc617521ef3', name: 'Bafo Gelado', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '68b7c8a851f884cd85067a32', name: 'Barreira Explosiva', from: 'Defesa (Conjurado)', to: 'Defesa (Conjurado/Área)' },
    { id: 'seed-tmp-bastiao-de-vida', name: 'Bastião de Vida', from: 'Cura (contínuo)', to: 'Cura (contínuo/Área)' },
    { id: '67806103878f9dc617521ed6', name: 'Bola de Fogo', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '67806103878f9dc617521eee', name: 'Bolhas Explosivas', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '68b7c8a851f884cd85067a1b', name: 'Buraco Negro Compacto', from: 'Ataque (Conjurado)', to: 'Ataque (Conjurado/Área)' },
    { id: '67806103878f9dc617521f66', name: 'Cajado-cobra', from: 'Mentalização (imediato)', to: 'Mentalização (imediato/Invocação)' },
    { id: '68b7c8a851f884cd85067a17', name: 'Campo de Anulação de Oxigênio', from: 'Mentalização (Contínuo)', to: 'Mentalização (Contínuo/Área)' },
    { id: '68b7c8a851f884cd85067a31', name: 'Campo de Detonação', from: 'Ataque (Conjurado)', to: 'Ataque (Conjurado/Área)' },
    { id: '68afec438f3889f0ef902344', name: 'Campo de Estase Aquática', from: 'Defesa (Sustentado)', to: 'Defesa (Sustentado/Área)' },
    { id: '68afec438f3889f0ef90232b', name: 'Campo de Instabilidade Quântica', from: 'Controle/Ataque (Conjurado)', to: 'Controle/Ataque (Conjurado/Área)' },
    { id: '68afec438f3889f0ef90233b', name: 'Campo de Névoa Gélida', from: 'Controle (Contínuo)', to: 'Controle (Contínuo/Área)' },
    { id: '68afec438f3889f0ef902356', name: 'Campo de Nulificação', from: 'Anulação (Sustentado)', to: 'Controle (Sustentado/Área)' },
    { id: '67806103878f9dc617521f5b', name: 'Campo de Plasma', from: 'Ataque (sustentado)', to: 'Ataque (sustentado/Área)' },
    { id: '68afec438f3889f0ef90232f', name: 'Campo de Pressão Atmosférica', from: 'Controle (Contínuo)', to: 'Controle (Contínuo/Área)' },
    { id: '68afec438f3889f0ef902336', name: 'Campo de Repulsão Eletromagnética', from: 'Defesa (Contínuo)', to: 'Defesa (Contínuo/Área)' },
    { id: '68afec438f3889f0ef90234a', name: 'Campo de Ressonância Energética', from: 'Utilidade/Suporte/Recuperação (Sustentado)', to: 'Utilidade/Suporte/Recuperação (Sustentado/Área)' },
    { id: '68afec438f3889f0ef90235b', name: 'Campo de Reversão Gravitacional', from: 'Transmutação (Sustentado)', to: 'Transmutação (Sustentado/Área)' },
    { id: '68b7c8a851f884cd85067a1a', name: 'Campo de Silêncio', from: 'Defesa (Contínuo)', to: 'Defesa (Contínuo/Área)' },
    { id: '68b7c8a851f884cd85067a2c', name: 'Camuflagem de Radiação', from: 'Defesa (Contínuo)', to: 'Defesa (Contínuo/Área)' },
    { id: 'seed-car-canto-de-sereia', name: 'Canto de Sereia', from: 'Controle (conjurado)', to: 'Controle (conjurado/Área)' },
    { id: '67806103878f9dc617521fb3', name: 'Caos', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '68b7c8a851f884cd85067a13', name: 'Cápsula de Pressão Negativa', from: 'Controle (Conjurado)', to: 'Controle (Conjurado/Área)' },
    { id: '67806103878f9dc617521f9e', name: 'Cascata Solar', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '67806103878f9dc617521eef', name: 'Chuva Ácida', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '67806103878f9dc617521eea', name: 'Chuva de Lâminas', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '67806103878f9dc617521ed9', name: 'Chuva de Meteoros', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '67806103878f9dc617521f1a', name: 'Ciclone Cortante', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '68b7c8a851f884cd85067a2b', name: 'Ciclone de Partículas', from: 'Controle (Conjurado)', to: 'Controle (Conjurado/Área)' },
    { id: '67806103878f9dc617521f11', name: 'Ciclone Invertido', from: 'Mentalização (contínuo)', to: 'Mentalização (contínuo/Área)' },
    { id: '67806103878f9dc617521ed2', name: 'Concentração de Luz Solar', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '67806103878f9dc617521f48', name: 'Condução', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '68afec438f3889f0ef902343', name: 'Conexão Pirocinética', from: 'Mentalização (Sustentado)', to: 'Mentalização (Sustentado/Área)' },
    { id: '67806103878f9dc617521f99', name: 'Contador Geiger', from: 'Encantamento (sustentado)', to: 'Encantamento (sustentado/Área)' },
    { id: '68b7c8a851f884cd85067a25', name: 'Controle de Mente Massivo', from: 'Controle (Imediato)', to: 'Controle (Imediato/Área)' },
    { id: '68afec438f3889f0ef902328', name: 'Convergência de Impacto', from: 'Ataque (Imediato/Multiplicador)', to: 'Ataque (Imediato)' },
    { id: 'seed-mp-convergencia-zepta', name: 'Convergência Zepta', from: 'Recuperação (contínuo)', to: 'Recuperação (contínuo/Área)' },
    { id: '67806103878f9dc617521edf', name: 'Coração Ardente', from: 'Encantamento (contínuo)', to: 'Encantamento (contínuo/Área)' },
    { id: '67806103878f9dc617521fa2', name: 'Corona Celestial', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '67806103878f9dc617521f87', name: 'Criar ou Destruir Luz', from: 'Transmutação (imediato)', to: 'Transmutação (imediato/Área)' },
    { id: '67806103878f9dc617521f2e', name: 'Criar ou Destruir Plantas', from: 'Transmutação (imediato)', to: 'Transmutação (imediato/Área)' },
    { id: '67806103878f9dc617521f23', name: 'Criar ou Destruir Terra', from: 'Transmutação (imediato)', to: 'Transmutação (imediato/Área)' },
    { id: '67806103878f9dc617521f42', name: 'Cristalização Explosiva', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: 'seed-mp-danca-do-vento', name: 'Dança do Vento', from: 'Recuperação (imediato)', to: 'Recuperação (imediato/Área)' },
    { id: 'seed-mp-decaimento-benigno', name: 'Decaimento Benigno', from: 'Encantamento/Recuperação (contínuo)', to: 'Encantamento/Recuperação (contínuo/Área)' },
    { id: '68afec438f3889f0ef902354', name: 'Deformação Temporal Localizada', from: 'Mentalização/Recuperação (Imediato)', to: 'Mentalização/Recuperação (Imediato/Área)' },
    { id: '67806103878f9dc617521f57', name: 'Descarga Potencializada', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '68afec438f3889f0ef902324', name: 'Despertar Telúrico', from: 'Ataque (Conjurado)', to: 'Ataque (Conjurado/Área)' },
    { id: 'seed-mp-detonacao-capacitora', name: 'Detonação Capacitora', from: 'Ataque/Recuperação (imediato)', to: 'Ataque/Recuperação (imediato/Área)' },
    { id: 'seed-tmp-diluvio-arcano', name: 'Dilúvio Arcano', from: 'Recuperação (imediato)', to: 'Recuperação (imediato/Área)' },
    { id: 'seed-car-discurso-inflamado', name: 'Discurso Inflamado', from: 'Ataque (sustentado)', to: 'Ataque (sustentado/Área)' },
    { id: '67806103878f9dc617521fc4', name: 'Distorção Temporal', from: 'Encantamento (conjurado)', to: 'Encantamento (conjurado/Área)' },
    { id: '68afec438f3889f0ef902348', name: 'Drenagem de Alma', from: 'Ataque/Suporte/Recuperação (Sustentado)', to: 'Ataque/Suporte/Recuperação (Sustentado/Área)' },
    { id: 'seed-tmp-eclipse-cintilante', name: 'Eclipse Cintilante', from: 'Recuperação (conjurado)', to: 'Recuperação (conjurado/Área)' },
    { id: 'seed-car-elogio-venenoso', name: 'Elogio Venenoso', from: 'Debuff (contínuo)', to: 'Controle (contínuo)' },
    { id: '67806103878f9dc617521f35', name: 'Enraizar', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '67806103878f9dc617521ee2', name: 'Erupção Primordial', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '68b7c8a851f884cd85067a0d', name: 'Escudo de Sangue Coagulado', from: 'Defesa (Imediato)', to: 'Defesa (Imediato/Área)' },
    { id: '67806103878f9dc617521f07', name: 'Esfera de Vácuo', from: 'Mentalização (conjurado)', to: 'Mentalização (conjurado/Área)' },
    { id: '67806103878f9dc617521edc', name: 'Espada Solar', from: 'Mentalização (contínuo)', to: 'Mentalização (contínuo/Área)' },
    { id: '67806103878f9dc617521f3f', name: 'Espinhos Peçonhentos', from: 'Transmutação (conjurado)', to: 'Transmutação (conjurado/Área)' },
    { id: '67806103878f9dc617521f36', name: 'Esporos', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '67806103878f9dc617521ef5', name: 'Estalactite de Gelo', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '67806103878f9dc617521f8b', name: 'Explosão de Luz', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: 'seed-mp-fenda-devoradora', name: 'Fenda Devoradora', from: 'Anulação/Recuperação (imediato)', to: 'Controle/Recuperação (imediato)' },
    { id: '67806103878f9dc617521ed8', name: 'Fênix', from: 'Mentalização (conjurado)', to: 'Mentalização (conjurado/Área/Invocação)' },
    { id: '67806103878f9dc617521f91', name: 'Flash', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '67806103878f9dc617521f3a', name: 'Floresta', from: 'Encantamento/Recuperação (conjurado)', to: 'Encantamento/Recuperação (conjurado/Área)' },
    { id: '68afec438f3889f0ef902329', name: 'Fornalha de Sacrifício', from: 'Ataque/Recuperação (Área/Sacrifício)', to: 'Ataque/Recuperação (Área)' },
    { id: '67806103878f9dc617521f0d', name: 'Furacão', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '68b7c8a851f884cd85067a0e', name: 'Gárgulas de Sangue', from: 'Ataque (Invocação)', to: 'Ataque (Invocação/Área)' },
    { id: '67806103878f9dc617521f67', name: 'Gato Negro', from: 'Ataque (imediato)', to: 'Ataque (imediato/Invocação)' },
    { id: '67806103878f9dc617521efe', name: 'Geleira', from: 'Transmutação (contínuo)', to: 'Transmutação (contínuo/Área)' },
    { id: '68afec438f3889f0ef902351', name: 'Geocarga Explosiva', from: 'Ataque (Área/Condicional)', to: 'Ataque (Área)' },
    { id: '67806103878f9dc617521f5d', name: 'Golem Trovejante', from: 'Mentalização (conjurado)', to: 'Mentalização (conjurado/Invocação)' },
    { id: '68b7c8a851f884cd85067a20', name: 'Ilusão Massiva', from: 'Ilusão (Contínuo)', to: 'Controle (Contínuo/Área)' },
    { id: '67806103878f9dc617521f20', name: 'Implosão', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '67806103878f9dc617521fc5', name: 'Implosão Dimensional', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '67806103878f9dc617521f86', name: 'Implosão Sombria', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '67806103878f9dc617521f15', name: 'Impulso Ascendente', from: 'Ataque', to: 'Ataque (Área)' },
    { id: '67806103878f9dc617521ed7', name: 'Inferno', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '68afec438f3889f0ef902335', name: 'Infusão de Vitalidade', from: 'Cura/Buff (Imediato)', to: 'Cura/Suporte (Imediato)' },
    { id: '68b7c8a851f884cd85067a19', name: 'Inversão Gravitacional', from: 'Controle (Contínuo)', to: 'Controle (Contínuo/Área)' },
    { id: 'seed-rx-inversao-necrotica', name: 'Inversão Necrótica', from: 'Debuff (imediato)', to: 'Controle (imediato)' },
    { id: '68afec438f3889f0ef902326', name: 'Jardim do Éden', from: 'Cura/Recuperação (Conjurado, Contínuo)', to: 'Cura/Recuperação (Conjurado, Contínuo, Área)' },
    { id: '67806103878f9dc617521fa5', name: 'Julgamento Celestial', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '68afec438f3889f0ef902325', name: 'Kraken', from: 'Mentalização/Recuperação (Contínuo)', to: 'Mentalização/Recuperação (Contínuo/Invocação)' },
    { id: '67806103878f9dc617521f79', name: 'Lamaçal Venenoso', from: 'Transmutação (contínuo)', to: 'Transmutação (contínuo/Área)' },
    { id: '67806103878f9dc617521f00', name: 'Lâminas Glaciais', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '67806103878f9dc617521ee3', name: 'Legião Flamejante', from: 'Mentalização (conjurado)', to: 'Mentalização (conjurado/Área/Invocação)' },
    { id: '67806103878f9dc617521f9f', name: 'Lente Dimensional', from: 'Transmutação (sustentada)', to: 'Transmutação (sustentada/Área)' },
    { id: '68afec438f3889f0ef90232d', name: 'Lente Divina', from: 'Utilidade/Suporte (Sustentado)', to: 'Utilidade/Suporte (Sustentado/Área)' },
    { id: '67806103878f9dc617521ed1', name: 'Mãos Flamejantes', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '67806103878f9dc617521ee0', name: 'Marca da Fênix', from: 'Transmutação (contínuo)', to: 'Transmutação (contínuo/Área)' },
    { id: 'seed-mp-mare-cheia', name: 'Maré Cheia', from: 'Recuperação (contínuo)', to: 'Recuperação (contínuo/Área)' },
    { id: 'seed-tmp-mare-de-esperanca', name: 'Maré de Esperança', from: 'Cura (conjurado)', to: 'Cura (conjurado/Área)' },
    { id: '67806103878f9dc617521ef2', name: 'Maremoto', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '67806103878f9dc617521f2b', name: 'Meteorito', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '67806103878f9dc617521ecf', name: 'Mina Incendiária', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '68b7c8a851f884cd85067a33', name: 'Míssil Teleguiado', from: 'Ataque (Imediato)', to: 'Ataque (Imediato/Área)' },
    { id: '67806103878f9dc617521f9a', name: 'Muro de Luz', from: 'Defesa (sustentado)', to: 'Defesa (sustentado/Área)' },
    { id: '67806103878f9dc617521ef8', name: 'Nevasca', from: 'Ataque (contínua)', to: 'Ataque (contínua/Área)' },
    { id: '67806103878f9dc617521f12', name: 'Névoa Cortante', from: 'Ataque (contínuo)', to: 'Ataque (contínuo/Área)' },
    { id: '67806103878f9dc617521f62', name: 'Névoa das Trevas', from: 'Transmutação (contínuo)', to: 'Transmutação (contínuo/Área)' },
    { id: '67806103878f9dc617521f7a', name: 'Névoa Fétida', from: 'Transmutação (contínuo)', to: 'Transmutação (contínuo/Área)' },
    { id: 'seed-mp-nucleo-geotermico', name: 'Núcleo Geotérmico', from: 'Recuperação (contínuo)', to: 'Recuperação (contínuo/Área)' },
    { id: '67806103878f9dc617521f37', name: 'Nuvem de Pólen', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '68b7c8a851f884cd85067a27', name: 'Nuvem Radioativa', from: 'Ataque (Contínuo)', to: 'Ataque (Contínuo/Área)' },
    { id: '67806103878f9dc617521f81', name: 'Nuvem Tóxica', from: 'Encantamento (conjurado)', to: 'Encantamento (conjurado/Área)' },
    { id: '67806103878f9dc617521efc', name: 'Onda Gélida', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '67806103878f9dc617521ecb', name: 'Orbe de Fogo', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: 'seed-rx-orvalho-purificador', name: 'Orvalho Purificador', from: 'Utilidade (imediato)', to: 'Utilidade (imediato/Área)' },
    { id: '67806103878f9dc617521f7b', name: 'Peçonha', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '67806103878f9dc617521f6a', name: 'Penumbra', from: 'Defesa (conjurado)', to: 'Defesa (conjurado/Área)' },
    { id: '67806103878f9dc617521f7c', name: 'Peste Negra', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '68afec438f3889f0ef902345', name: 'Pilar da Ancoragem', from: 'Controle (Imediato)', to: 'Controle (Imediato/Área)' },
    { id: 'seed-car-plateia-espectral', name: 'Plateia Espectral', from: 'Ilusão/Recuperação (contínuo)', to: 'Controle/Recuperação (contínuo/Área)' },
    { id: '67806103878f9dc617521f83', name: 'Poço de Pestilência', from: 'Encantamento (conjurado)', to: 'Encantamento (conjurado/Área)' },
    { id: '67806103878f9dc617521fc2', name: 'Prisão Cinética', from: 'Encantamento (conjurado)', to: 'Encantamento (conjurado/Área)' },
    { id: '68b7c8a851f884cd85067a35', name: 'Pulso de Dispersão', from: 'Controle (Imediato)', to: 'Controle (Imediato/Área)' },
    { id: '67806103878f9dc617521f50', name: 'Pulso Eletromagnético', from: 'Ataque (completo)', to: 'Ataque (completo/Área)' },
    { id: '68b7c8a851f884cd85067a2a', name: 'Pulso Radioativo', from: 'Ataque (Imediato)', to: 'Ataque (Imediato/Área)' },
    { id: '67806103878f9dc617521fbf', name: 'Quebra Dimensional', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '68afec438f3889f0ef902341', name: 'Reações em Cadeia Incendiárias', from: 'Ataque (Imediato/Adjacente)', to: 'Ataque (Imediato)' },
    { id: 'seed-rx-recusa-derradeira', name: 'Recusa Derradeira', from: 'Defesa (imediato)', to: 'Defesa (imediato/Área)' },
    { id: '67806103878f9dc617521f5e', name: 'Rede de Capacitores', from: 'Transmutação (sustentada)', to: 'Transmutação (sustentada/Área)' },
    { id: '67806103878f9dc617521f51', name: 'Rede Elétrica', from: 'Ataque (contínuo)', to: 'Ataque (contínuo/Área)' },
    { id: '68b7c8a851f884cd85067a0f', name: 'Ritual de Vigor Drenante', from: 'Encantamento (Contínuo)', to: 'Encantamento (Contínuo/Área)' },
    { id: '67806103878f9dc617521fbc', name: 'Ruptura Dimensional', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '67806103878f9dc617521f80', name: 'Selos Sombrios', from: 'Encantamento (conjurado)', to: 'Encantamento (conjurado/Área)' },
    { id: '68afec438f3889f0ef90233f', name: 'Semblante do Vazio', from: 'Mentalização (Contínuo)', to: 'Mentalização (Contínuo/Área)' },
    { id: '68afec438f3889f0ef90232c', name: 'Semente da Ruína', from: 'Debuff/Ataque (Imediato)', to: 'Controle/Ataque (Imediato)' },
    { id: '67806103878f9dc617521edd', name: 'Serpente de Lava', from: 'Mentalização (conjurado)', to: 'Mentalização (conjurado/Invocação)' },
    { id: '68afec438f3889f0ef902327', name: 'Símbolo da Revelação', from: 'Encantamento (Imediato)', to: 'Encantamento (Imediato/Área)' },
    { id: '67806103878f9dc617521fbe', name: 'Singularidade', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '68afec438f3889f0ef902347', name: 'Sobrecarga Arcana', from: 'Encantamento (Imediato)', to: 'Encantamento (Imediato/Área)' },
    { id: '67806103878f9dc617521f58', name: 'Sobrecarga de Poder', from: 'Encantamento (contínuo)', to: 'Encantamento (contínuo/Área)' },
    { id: '67806103878f9dc617521f5c', name: 'Sobrecarga Neural Massiva', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '67806103878f9dc617521ee4', name: 'Sol Negro', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '68b7c8a851f884cd85067a10', name: 'Sombra de Sangue', from: 'Transmutação (Contínuo)', to: 'Transmutação (Contínuo/Área/Invocação)' },
    { id: 'seed-mp-sombra-glutona', name: 'Sombra Glutona', from: 'Controle/Recuperação (contínuo)', to: 'Controle/Recuperação (contínuo/Área)' },
    { id: '68afec438f3889f0ef90235d', name: 'Sombras Devoradoras', from: 'Ataque (Conjurado)', to: 'Ataque (Conjurado/Área)' },
    { id: '67806103878f9dc617521f09', name: 'Sopro do Dragão', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '67806103878f9dc617521ee6', name: 'Supernova', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '67806103878f9dc617521f28', name: 'Tempestade de Areia', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '67806103878f9dc617521f5f', name: 'Tempestade de Plasma', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '67806103878f9dc617521f4e', name: 'Tempestade Elétrica', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '68afec438f3889f0ef90234b', name: 'Tempestade Eólica Desorientadora', from: 'Ataque/Debuff (Área)', to: 'Ataque/Controle (Área)' },
    { id: '67806103878f9dc617521ede', name: 'Tempestade Vulcânica', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '67806103878f9dc617521f2c', name: 'Terremoto', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '67806103878f9dc617521f1c', name: 'Tormenta Acerada', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '68b7c8a851f884cd85067a1c', name: 'Tornado de Vácuo', from: 'Ataque (Conjurado)', to: 'Ataque (Conjurado/Área)' },
    { id: '68b7c8a851f884cd85067a29', name: 'Transmutação Radioativa', from: 'Transmutação (Imediato)', to: 'Transmutação (Imediato/Área)' },
    { id: 'seed-car-tregua-forcada', name: 'Trégua Forçada', from: 'Controle (contínuo)', to: 'Controle (contínuo/Área)' },
    { id: 'seed-rx-tremor-disruptivo', name: 'Tremor Disruptivo', from: 'Debuff (imediato)', to: 'Controle (imediato)' },
    { id: '67806103878f9dc617521f29', name: 'Tremores', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '67806103878f9dc617521f4f', name: 'Trovão Divino', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '67806103878f9dc617521f14', name: 'Trovão Sônico', from: 'Ataque (imediato)', to: 'Ataque (imediato/Área)' },
    { id: '67806103878f9dc617521ef1', name: 'Tsunami', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '67806103878f9dc617521f01', name: 'Tsunami Congelante', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: '67806103878f9dc617521f5a', name: 'Tsunami Elétrico', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: 'seed-car-ultima-palavra', name: 'Última Palavra', from: 'Anulação/Recuperação (imediato)', to: 'Controle/Recuperação (imediato)' },
    { id: '67806103878f9dc617521f85', name: 'Vácuo da Morte', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área/Invocação)' },
    { id: '67806103878f9dc617521f1f', name: 'Vendaval', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' },
    { id: 'seed-tmp-vento-reconfortante', name: 'Vento Reconfortante', from: 'Cura/Suporte (contínuo)', to: 'Cura/Suporte (contínuo/Área)' },
    { id: '68b7c8a851f884cd85067a39', name: 'Vórtex da Destruição', from: 'Ataque (Conjurado)', to: 'Ataque (Conjurado/Área)' },
    { id: '67806103878f9dc617521fc3', name: 'Vórtex do Vazio', from: 'Transmutação (conjurado)', to: 'Transmutação (conjurado/Área)' },
    { id: '67806103878f9dc617521f2d', name: 'Vulcão', from: 'Ataque (conjurado)', to: 'Ataque (conjurado/Área)' }
]

/** As magias em área (por id), para conferir e para criar magia nova já com o subtipo */
export const SPELL_AREA_IDS: readonly string[] = [
    '67806103878f9dc617521ecb', // Orbe de Fogo
    '67806103878f9dc617521ecf', // Mina Incendiária
    '67806103878f9dc617521ed1', // Mãos Flamejantes
    '67806103878f9dc617521ed2', // Concentração de Luz Solar
    '67806103878f9dc617521ed3', // Armadura Infernal
    '67806103878f9dc617521ed6', // Bola de Fogo
    '67806103878f9dc617521ed7', // Inferno
    '67806103878f9dc617521ed8', // Fênix
    '67806103878f9dc617521ed9', // Chuva de Meteoros
    '67806103878f9dc617521edc', // Espada Solar
    '67806103878f9dc617521ede', // Tempestade Vulcânica
    '67806103878f9dc617521edf', // Coração Ardente
    '67806103878f9dc617521ee0', // Marca da Fênix
    '67806103878f9dc617521ee1', // Avatar das Chamas
    '67806103878f9dc617521ee2', // Erupção Primordial
    '67806103878f9dc617521ee3', // Legião Flamejante
    '67806103878f9dc617521ee4', // Sol Negro
    '67806103878f9dc617521ee6', // Supernova
    '67806103878f9dc617521eea', // Chuva de Lâminas
    '67806103878f9dc617521eee', // Bolhas Explosivas
    '67806103878f9dc617521eef', // Chuva Ácida
    '67806103878f9dc617521ef1', // Tsunami
    '67806103878f9dc617521ef2', // Maremoto
    '67806103878f9dc617521ef3', // Bafo Gelado
    '67806103878f9dc617521ef5', // Estalactite de Gelo
    '67806103878f9dc617521ef8', // Nevasca
    '67806103878f9dc617521efc', // Onda Gélida
    '67806103878f9dc617521efd', // Avalanche
    '67806103878f9dc617521efe', // Geleira
    '67806103878f9dc617521eff', // Arapuca Gélida
    '67806103878f9dc617521f00', // Lâminas Glaciais
    '67806103878f9dc617521f01', // Tsunami Congelante
    '67806103878f9dc617521f07', // Esfera de Vácuo
    '67806103878f9dc617521f09', // Sopro do Dragão
    '67806103878f9dc617521f0d', // Furacão
    '67806103878f9dc617521f11', // Ciclone Invertido
    '67806103878f9dc617521f12', // Névoa Cortante
    '67806103878f9dc617521f13', // Armadura de Pressão
    '67806103878f9dc617521f14', // Trovão Sônico
    '67806103878f9dc617521f15', // Impulso Ascendente
    '67806103878f9dc617521f1a', // Ciclone Cortante
    '67806103878f9dc617521f1c', // Tormenta Acerada
    '67806103878f9dc617521f1f', // Vendaval
    '67806103878f9dc617521f20', // Implosão
    '67806103878f9dc617521f22', // Apocalipse da Ventania
    '67806103878f9dc617521f23', // Criar ou Destruir Terra
    '67806103878f9dc617521f28', // Tempestade de Areia
    '67806103878f9dc617521f29', // Tremores
    '67806103878f9dc617521f2b', // Meteorito
    '67806103878f9dc617521f2c', // Terremoto
    '67806103878f9dc617521f2d', // Vulcão
    '67806103878f9dc617521f2e', // Criar ou Destruir Plantas
    '67806103878f9dc617521f35', // Enraizar
    '67806103878f9dc617521f36', // Esporos
    '67806103878f9dc617521f37', // Nuvem de Pólen
    '67806103878f9dc617521f3a', // Floresta
    '67806103878f9dc617521f3f', // Espinhos Peçonhentos
    '67806103878f9dc617521f40', // Armadilha do Basilisco
    '67806103878f9dc617521f42', // Cristalização Explosiva
    '67806103878f9dc617521f48', // Condução
    '67806103878f9dc617521f4e', // Tempestade Elétrica
    '67806103878f9dc617521f4f', // Trovão Divino
    '67806103878f9dc617521f50', // Pulso Eletromagnético
    '67806103878f9dc617521f51', // Rede Elétrica
    '67806103878f9dc617521f57', // Descarga Potencializada
    '67806103878f9dc617521f58', // Sobrecarga de Poder
    '67806103878f9dc617521f5a', // Tsunami Elétrico
    '67806103878f9dc617521f5b', // Campo de Plasma
    '67806103878f9dc617521f5c', // Sobrecarga Neural Massiva
    '67806103878f9dc617521f5e', // Rede de Capacitores
    '67806103878f9dc617521f5f', // Tempestade de Plasma
    '67806103878f9dc617521f61', // Bafo Amaldiçoado
    '67806103878f9dc617521f62', // Névoa das Trevas
    '67806103878f9dc617521f6a', // Penumbra
    '67806103878f9dc617521f6c', // Abismo
    '67806103878f9dc617521f79', // Lamaçal Venenoso
    '67806103878f9dc617521f7a', // Névoa Fétida
    '67806103878f9dc617521f7b', // Peçonha
    '67806103878f9dc617521f7c', // Peste Negra
    '67806103878f9dc617521f7f', // Armadilha Sombria
    '67806103878f9dc617521f80', // Selos Sombrios
    '67806103878f9dc617521f81', // Nuvem Tóxica
    '67806103878f9dc617521f83', // Poço de Pestilência
    '67806103878f9dc617521f85', // Vácuo da Morte
    '67806103878f9dc617521f86', // Implosão Sombria
    '67806103878f9dc617521f87', // Criar ou Destruir Luz
    '67806103878f9dc617521f8b', // Explosão de Luz
    '67806103878f9dc617521f8e', // Aura de Luz
    '67806103878f9dc617521f91', // Flash
    '67806103878f9dc617521f92', // Aurora
    '67806103878f9dc617521f95', // Arco de Luz
    '67806103878f9dc617521f99', // Contador Geiger
    '67806103878f9dc617521f9a', // Muro de Luz
    '67806103878f9dc617521f9e', // Cascata Solar
    '67806103878f9dc617521f9f', // Lente Dimensional
    '67806103878f9dc617521fa2', // Corona Celestial
    '67806103878f9dc617521fa5', // Julgamento Celestial
    '67806103878f9dc617521fb3', // Caos
    '67806103878f9dc617521fbc', // Ruptura Dimensional
    '67806103878f9dc617521fbe', // Singularidade
    '67806103878f9dc617521fbf', // Quebra Dimensional
    '67806103878f9dc617521fc1', // Âncora Gravitacional
    '67806103878f9dc617521fc2', // Prisão Cinética
    '67806103878f9dc617521fc3', // Vórtex do Vazio
    '67806103878f9dc617521fc4', // Distorção Temporal
    '67806103878f9dc617521fc5', // Implosão Dimensional
    '68afec438f3889f0ef902324', // Despertar Telúrico
    '68afec438f3889f0ef902326', // Jardim do Éden
    '68afec438f3889f0ef902327', // Símbolo da Revelação
    '68afec438f3889f0ef902329', // Fornalha de Sacrifício
    '68afec438f3889f0ef90232b', // Campo de Instabilidade Quântica
    '68afec438f3889f0ef90232d', // Lente Divina
    '68afec438f3889f0ef90232e', // Armadilha de Choque Neural
    '68afec438f3889f0ef90232f', // Campo de Pressão Atmosférica
    '68afec438f3889f0ef902332', // Aura de Melancolia
    '68afec438f3889f0ef902334', // Armadilha de Cristalização
    '68afec438f3889f0ef902336', // Campo de Repulsão Eletromagnética
    '68afec438f3889f0ef90233b', // Campo de Névoa Gélida
    '68afec438f3889f0ef90233f', // Semblante do Vazio
    '68afec438f3889f0ef902343', // Conexão Pirocinética
    '68afec438f3889f0ef902344', // Campo de Estase Aquática
    '68afec438f3889f0ef902345', // Pilar da Ancoragem
    '68afec438f3889f0ef902347', // Sobrecarga Arcana
    '68afec438f3889f0ef902348', // Drenagem de Alma
    '68afec438f3889f0ef902349', // Ascensão Gloriosa
    '68afec438f3889f0ef90234a', // Campo de Ressonância Energética
    '68afec438f3889f0ef90234b', // Tempestade Eólica Desorientadora
    '68afec438f3889f0ef902350', // Vórtice Defasador
    '68afec438f3889f0ef902351', // Geocarga Explosiva
    '68afec438f3889f0ef902353', // Praga da Desesperança
    '68afec438f3889f0ef902354', // Deformação Temporal Localizada
    '68afec438f3889f0ef902356', // Campo de Nulificação
    '68afec438f3889f0ef902359', // Aura de Precisão
    '68afec438f3889f0ef90235b', // Campo de Reversão Gravitacional
    '68afec438f3889f0ef90235d', // Sombras Devoradoras
    '68b7c8a851f884cd85067a0a', // Chuva Carmesim
    '68b7c8a851f884cd85067a0d', // Escudo de Sangue Coagulado
    '68b7c8a851f884cd85067a0e', // Gárgulas de Sangue
    '68b7c8a851f884cd85067a0f', // Ritual de Vigor Drenante
    '68b7c8a851f884cd85067a10', // Sombra de Sangue
    '68b7c8a851f884cd85067a12', // Vórtice de Hemorragia
    '68b7c8a851f884cd85067a13', // Cápsula de Pressão Negativa
    '68b7c8a851f884cd85067a14', // Implosão de Pressão
    '68b7c8a851f884cd85067a17', // Campo de Anulação de Oxigênio
    '68b7c8a851f884cd85067a19', // Inversão Gravitacional
    '68b7c8a851f884cd85067a1a', // Campo de Silêncio
    '68b7c8a851f884cd85067a1b', // Buraco Negro Compacto
    '68b7c8a851f884cd85067a1c', // Tornado de Vácuo
    '68b7c8a851f884cd85067a20', // Ilusão Massiva
    '68b7c8a851f884cd85067a25', // Controle de Mente Massivo
    '68b7c8a851f884cd85067a27', // Nuvem Radioativa
    '68b7c8a851f884cd85067a29', // Transmutação Radioativa
    '68b7c8a851f884cd85067a2a', // Pulso Radioativo
    '68b7c8a851f884cd85067a2b', // Ciclone de Partículas
    '68b7c8a851f884cd85067a2c', // Camuflagem de Radiação
    '68b7c8a851f884cd85067a2f', // Apocalipse Radioativo
    '68b7c8a851f884cd85067a31', // Campo de Detonação
    '68b7c8a851f884cd85067a32', // Barreira Explosiva
    '68b7c8a851f884cd85067a33', // Míssil Teleguiado
    '68b7c8a851f884cd85067a35', // Pulso de Dispersão
    '68b7c8a851f884cd85067a39', // Vórtex da Destruição
    '68b7c8a851f884cd85067a3a', // Armageddon
    'seed-car-aplauso-estrondoso', // Aplauso Estrondoso
    'seed-car-canto-de-sereia', // Canto de Sereia
    'seed-car-discurso-inflamado', // Discurso Inflamado
    'seed-car-plateia-espectral', // Plateia Espectral
    'seed-car-tregua-forcada', // Trégua Forçada
    'seed-mp-aurora-restauradora', // Aurora Restauradora
    'seed-mp-convergencia-zepta', // Convergência Zepta
    'seed-mp-danca-do-vento', // Dança do Vento
    'seed-mp-decaimento-benigno', // Decaimento Benigno
    'seed-mp-detonacao-capacitora', // Detonação Capacitora
    'seed-mp-mare-cheia', // Maré Cheia
    'seed-mp-nucleo-geotermico', // Núcleo Geotérmico
    'seed-mp-sombra-glutona', // Sombra Glutona
    'seed-rx-orvalho-purificador', // Orvalho Purificador
    'seed-rx-recusa-derradeira', // Recusa Derradeira
    'seed-tmp-aurora-da-fenix', // Aurora da Fênix
    'seed-tmp-bastiao-de-vida', // Bastião de Vida
    'seed-tmp-diluvio-arcano', // Dilúvio Arcano
    'seed-tmp-eclipse-cintilante', // Eclipse Cintilante
    'seed-tmp-mare-de-esperanca', // Maré de Esperança
    'seed-tmp-vento-reconfortante' // Vento Reconfortante
]

/** As magias que invocam uma entidade (por id) */
export const SPELL_SUMMON_IDS: readonly string[] = [
    '67806103878f9dc617521ed8', // Fênix
    '67806103878f9dc617521edd', // Serpente de Lava
    '67806103878f9dc617521ee3', // Legião Flamejante
    '67806103878f9dc617521f5d', // Golem Trovejante
    '67806103878f9dc617521f66', // Cajado-cobra
    '67806103878f9dc617521f67', // Gato Negro
    '67806103878f9dc617521f85', // Vácuo da Morte
    '68afec438f3889f0ef902325', // Kraken
    '68b7c8a851f884cd85067a0e', // Gárgulas de Sangue
    '68b7c8a851f884cd85067a10' // Sombra de Sangue
]
