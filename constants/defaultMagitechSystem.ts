import type { RPGSystem, SystemAttribute, SystemExpertise, SystemClass, SystemSubclass, SystemRace, SystemLineage, SystemTrait, SystemOccupation } from '@models/entities';
import { skills } from './skills';
import { positiveTraits, negativeTraits } from './traits';

/**
 * Atributos padrão do Magitech RPG
 */
export const defaultAttributes: SystemAttribute[] = [
    { key: 'des', name: 'Destreza', abbreviation: 'DES', description: 'Agilidade, reflexos e coordenação motora' },
    { key: 'vig', name: 'Vigor', abbreviation: 'VIG', description: 'Força física, resistência e saúde' },
    { key: 'log', name: 'Lógica', abbreviation: 'LOG', description: 'Inteligência, raciocínio e memória' },
    { key: 'sab', name: 'Sabedoria', abbreviation: 'SAB', description: 'Intuição, percepção e experiência' },
    { key: 'foc', name: 'Foco', abbreviation: 'FOC', description: 'Concentração, determinação e força de vontade' },
    { key: 'car', name: 'Carisma', abbreviation: 'CAR', description: 'Presença, persuasão e liderança' }
];

/**
 * Perícias padrão do Magitech RPG
 */
export const defaultExpertises: SystemExpertise[] = [
    { key: 'agilidade', name: 'Agilidade', defaultAttribute: 'des' },
    { key: 'atletismo', name: 'Atletismo', defaultAttribute: 'vig' },
    { key: 'competencia', name: 'Competência', defaultAttribute: 'log' },
    { key: 'comunicacao', name: 'Comunicação', defaultAttribute: 'car' },
    { key: 'conducao', name: 'Condução', defaultAttribute: 'des' },
    { key: 'conhecimento', name: 'Conhecimento', defaultAttribute: 'sab' },
    { key: 'controle', name: 'Controle', defaultAttribute: 'vig' },
    { key: 'concentracao', name: 'Concentração', defaultAttribute: 'foc' },
    { key: 'criatividade', name: 'Criatividade', defaultAttribute: 'log' },
    { key: 'culinaria', name: 'Culinária', defaultAttribute: 'des' },
    { key: 'diplomacia', name: 'Diplomacia', defaultAttribute: 'car' },
    { key: 'eficacia', name: 'Eficácia', defaultAttribute: null },
    { key: 'enganacao', name: 'Enganação', defaultAttribute: 'car' },
    { key: 'engenharia', name: 'Engenharia', defaultAttribute: 'log' },
    { key: 'fortitude', name: 'Fortitude', defaultAttribute: null },
    { key: 'forca', name: 'Força', defaultAttribute: 'vig' },
    { key: 'furtividade', name: 'Furtividade', defaultAttribute: 'des' },
    { key: 'intimidacao', name: 'Intimidação', defaultAttribute: 'car' },
    { key: 'intuicao', name: 'Intuição', defaultAttribute: 'sab' },
    { key: 'interrogacao', name: 'Interrogação', defaultAttribute: 'car' },
    { key: 'investigacao', name: 'Investigação', defaultAttribute: 'log' },
    { key: 'ladinagem', name: 'Ladinagem', defaultAttribute: 'des' },
    { key: 'lideranca', name: 'Liderança', defaultAttribute: 'car' },
    { key: 'luta', name: 'Luta', defaultAttribute: 'vig' },
    { key: 'magia', name: 'Magia', defaultAttribute: 'foc' },
    { key: 'medicina', name: 'Medicina', defaultAttribute: 'sab' },
    { key: 'percepcao', name: 'Percepção', defaultAttribute: 'foc' },
    { key: 'persuasao', name: 'Persuasão', defaultAttribute: 'car' },
    { key: 'pontaria', name: 'Pontaria', defaultAttribute: 'des' },
    { key: 'reflexos', name: 'Reflexos', defaultAttribute: 'foc' },
    { key: 'resFisica', name: 'RES Física', defaultAttribute: 'vig' },
    { key: 'resMagica', name: 'RES Mágica', defaultAttribute: 'foc' },
    { key: 'resMental', name: 'RES Mental', defaultAttribute: 'sab' },
    { key: 'sorte', name: 'Sorte', defaultAttribute: 'sab' },
    { key: 'sobrevivencia', name: 'Sobrevivência', defaultAttribute: 'sab' },
    { key: 'tatica', name: 'Tática', defaultAttribute: 'log' },
    { key: 'tecnologia', name: 'Tecnologia', defaultAttribute: 'log' },
    { key: 'vontade', name: 'Vontade', defaultAttribute: 'foc' }
];

/**
 * Converte skills do formato antigo para o novo formato SystemSkill
 */
function convertSkills(oldSkills: any[]): any[] {
    return oldSkills.map(skill => ({
        id: skill.id || crypto.randomUUID?.() || Math.random().toString(36).substring(7),
        name: skill.name,
        description: skill.description,
        type: skill.type,
        origin: skill.origin,
        level: skill.level
    }));
}

/**
 * Classes padrão do Magitech RPG
 */
export const defaultClasses: SystemClass[] = Object.entries(skills.class).map(([ className, classSkills ]) => ({
    key: className.toLowerCase().replace(/\s/g, '_'),
    name: className,
    description: '',
    skills: convertSkills(classSkills)
}));

/**
 * Subclasses padrão do Magitech RPG
 */
export const defaultSubclasses: SystemSubclass[] = Object.entries(skills.subclass).map(([ subclassName, subclassSkills ]) => {
    // Determina a classe pai baseado no nome da subclasse
    const parentClassMap: Record<string, string> = {
        'Polimorfo': 'Combatente',
        'Comandante': 'Combatente',
        'Aniquilador': 'Combatente',
        'Forasteiro': 'Especialista',
        'Errante': 'Especialista',
        'Duelista': 'Especialista',
        'Conjurador': 'Feiticeiro',
        'Elementalista': 'Feiticeiro',
        'Caoticista': 'Feiticeiro',
        'Discípulo': 'Monge',
        'Protetor': 'Monge',
        'Mestre': 'Monge',
        'Necromante': 'Bruxo',
        'Espiritista': 'Bruxo',
        'Arauto': 'Bruxo',
        'Animante': 'Druida',
        'Naturomante': 'Druida',
        'Guardião': 'Druida',
        'Arquimago': 'Arcano',
        'Metamágico': 'Arcano',
        'Glifomante': 'Arcano',
        'Espectro': 'Ladino',
        'Estrategista': 'Ladino',
        'Embusteiro': 'Ladino'
    };

    return {
        key: subclassName.toLowerCase().replace(/\s/g, '_'),
        name: subclassName,
        parentClass: parentClassMap[subclassName] || '',
        skills: convertSkills(subclassSkills)
    };
});

/**
 * Raças padrão do Magitech RPG
 */
export const defaultRaces: SystemRace[] = skills.race.map(skill => ({
    key: skill.origin.toLowerCase().replace(/\s/g, '_'),
    name: skill.origin,
    description: '',
    skills: [ {
        id: crypto.randomUUID?.() || Math.random().toString(36).substring(7),
        name: skill.name,
        description: skill.description,
        type: 'Raça',
        origin: skill.origin
    } ]
}));

/**
 * Linhagens padrão do Magitech RPG
 */
export const defaultLineages: SystemLineage[] = skills.lineage.map(skill => ({
    key: skill.origin.toLowerCase().replace(/\s/g, '_'),
    name: skill.origin,
    skills: [ {
        id: crypto.randomUUID?.() || Math.random().toString(36).substring(7),
        name: skill.name,
        description: skill.description,
        type: 'Linhagem',
        origin: skill.origin
    } ]
}));

/**
 * Profissões padrão do Magitech RPG
 */
export const defaultOccupations: SystemOccupation[] = skills.occupation.map(skill => ({
    key: skill.origin.toLowerCase().replace(/\s/g, '_'),
    name: skill.origin,
    skills: [ {
        id: crypto.randomUUID?.() || Math.random().toString(36).substring(7),
        name: skill.name,
        description: skill.description,
        type: 'Profissão',
        origin: skill.origin
    } ]
}));

/**
 * Converte traços do formato antigo para o novo formato
 */
function convertTraits(oldTraits: any[]): SystemTrait[] {
    return oldTraits.map(trait => ({
        name: trait.name,
        value: trait.value,
        target: {
            kind: trait.target.kind,
            name: trait.target.name
        }
    }));
}

/**
 * Traços padrão do Magitech RPG
 */
export const defaultTraits = {
    positive: convertTraits(positiveTraits),
    negative: convertTraits(negativeTraits)
};

/**
 * Configuração completa do sistema padrão Magitech RPG
 * Pode ser usado como template para criar novos sistemas
 */
export const defaultMagitechSystem: Omit<RPGSystem, 'id' | 'creatorId' | 'createdAt' | 'updatedAt'> = {
    name: 'Magitech RPG',
    description: 'O sistema padrão de Magitech RPG, com todas as classes, raças, linhagens e habilidades do jogo base.',
    isPublic: true,
    enabledFields: {
        traits: true,
        lineage: true,
        occupation: true,
        subclass: true,
        elementalMastery: true,
        financialCondition: true,
        spells: true,
        race: true,
        class: true,
        customFields: []
    },
    attributes: defaultAttributes,
    expertises: defaultExpertises,
    classes: defaultClasses,
    subclasses: defaultSubclasses,
    races: defaultRaces,
    lineages: defaultLineages,
    occupations: defaultOccupations,
    traits: defaultTraits,
    diceRules: {
        defaultDice: '1d20',
        criticalRange: 20,
        fumbleRange: 1,
        customRules: 'Vantagem: Role 2d20 e escolha o maior resultado.\nDesvantagem: Role 2d20 e escolha o menor resultado.'
    },
    pointsConfig: {
        hasLP: true,
        hasMP: true,
        hasAP: true,
        lpName: 'LP',
        mpName: 'MP',
        apName: 'AP',
        customPoints: []
    }
};
