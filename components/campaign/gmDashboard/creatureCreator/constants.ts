import { elements, SECONDARY_ELEMENTS } from '@constants';
import { Expertises, type Expertise as ExpertiseModel } from '@models';
import { PHYSICAL_ANY, PHYSICAL_DAMAGE_TYPES } from '@utils/combat/creatureDefense';
import type { AttributeDef, ExpertiseDef } from './types';

export const DEFAULT_ATTRIBUTE_DEFS: AttributeDef[] = [
    { key: 'vig', label: 'VIG', name: 'Vigor' },
    { key: 'des', label: 'DES', name: 'Destreza' },
    { key: 'foc', label: 'FOC', name: 'Foco' },
    { key: 'log', label: 'LOG', name: 'Lógica' },
    { key: 'sab', label: 'SAB', name: 'Sabedoria' },
    { key: 'car', label: 'CAR', name: 'Carisma' }
];

// Perícias padrão (Magitech) — preserva a defaultAttribute crua (minúscula) usada em combate
export const DEFAULT_EXPERTISE_DEFS: ExpertiseDef[] = (() => {
    const expertises = new Expertises();
    return Object.entries(expertises).map(([ name, value ]) => {
        const exp = value as ExpertiseModel;
        const attrKey = (exp.defaultAttribute as unknown as string) || null;
        return {
            key: name,
            name,
            attrKey,
            attrLabel: attrKey ? attrKey.toUpperCase() : '—'
        };
    });
})();

export const skillTypes = [
    'Poder Mágico',
    'Classe',
    'Linhagem',
    'Subclasse',
    'Bônus',
    'Profissão',
    'Exclusivo',
    'Raça',
    'Talento'
];

export const CREATURE_TYPE_SUGGESTIONS = [
    'Fera', 'Humanoide', 'Morto-vivo', 'Aberração', 'Constructo', 'Elemental',
    'Demônio', 'Celestial', 'Planta', 'Limo', 'Dragão', 'Espírito', 'Máquina',
    'Inseto', 'Monstruosidade', 'Gigante', 'Fada'
];

// Presets de papel (role) — preenchem um bloco de estatísticas escalado pelo nível
export const ROLE_PRESETS = [
    { id: 'minion', label: 'Lacaio', color: 'text.secondary', lpPerLevel: 8, mpPerLevel: 3, ap: 2, attrFactor: 0.5, desc: 'Frágil, aparece em grupo' },
    { id: 'standard', label: 'Padrão', color: 'info.main', lpPerLevel: 15, mpPerLevel: 5, ap: 3, attrFactor: 0.8, desc: 'Ameaça equilibrada' },
    { id: 'elite', label: 'Elite', color: 'primary.main', lpPerLevel: 30, mpPerLevel: 8, ap: 4, attrFactor: 1.0, desc: 'Resistente e perigoso' },
    { id: 'boss', label: 'Chefe', color: 'warning.main', lpPerLevel: 60, mpPerLevel: 12, ap: 5, attrFactor: 1.3, desc: 'Combate memorável' }
] as const;

export type RolePreset = typeof ROLE_PRESETS[number];

/** Elementos para a criatura ter ou ser fraca: os do ciclo de fraquezas e os secundários (Não-elemental não tem ciclo) */
export const CREATURE_ELEMENT_OPTIONS: string[] = [ ...elements.filter(element => element !== 'Não-Elemental'), ...SECONDARY_ELEMENTS ];

/** Fraquezas declaráveis: elementos e tipos de dano físico */
export const WEAKNESS_OPTIONS: string[] = [ ...CREATURE_ELEMENT_OPTIONS, ...PHYSICAL_DAMAGE_TYPES ];

/** Resistências e vulnerabilidades: tudo acima, mais Não-elemental e "Físico" (qualquer dano físico) */
export const DAMAGE_MODIFIER_TARGETS: string[] = [ ...WEAKNESS_OPTIONS, 'Não-Elemental', PHYSICAL_ANY ];
