import { Collection } from 'fireorm';

// ============================================
// Tipos para configuração de campos iniciais
// ============================================

export interface InitialFieldConfig {
    enabled: boolean;
    label: string;
    required: boolean;
}

export interface InitialFields {
    // Campos de vida/pontos
    life: InitialFieldConfig & { defaultValue: number; formula?: string };
    mana: InitialFieldConfig & { defaultValue: number; formula?: string };
    armor: InitialFieldConfig & { defaultValue: number; formula?: string };
    // Campos de informação do personagem
    age: InitialFieldConfig & { min?: number; max?: number };
    gender: InitialFieldConfig & { options: string[] };
    // Campos financeiros
    financialCondition: InitialFieldConfig & { options: string[] };
    // Campos customizados adicionais
    customInitialFields: Array<{
        key: string;
        label: string;
        type: 'text' | 'number' | 'select' | 'boolean';
        required: boolean;
        defaultValue?: string | number | boolean;
        options?: string[];
        min?: number;
        max?: number;
    }>;
}

// ============================================
// Tipos para atributos e perícias
// ============================================

export interface SystemAttribute {
    key: string;
    name: string;
    abbreviation: string;
    description?: string;
    defaultValue?: number;
    minValue?: number;
    maxValue?: number;
}

export interface SystemExpertise {
    key: string;
    name: string;
    defaultAttribute: string | null;
    description?: string;
}

// ============================================
// Tipos para habilidades e magias
// ============================================

export interface SystemSkill {
    id?: string;
    name: string;
    description: string;
    type: string;
    origin: string;
    level?: number;
    effects?: number[];
    // Novos campos para customização
    cost?: number;
    cooldown?: string;
    duration?: string;
    range?: string;
    prerequisites?: string[];
}

export interface SystemSpell {
    id?: string;
    name: string;
    description: string;
    level: number;
    element: string;
    cost: number;
    damage?: string;
    duration?: string;
    range?: string;
    castingTime?: string;
    components?: string[];
    school?: string;
}

// ============================================
// Tipos para classes, subclasses e linhagens
// ============================================

export interface SystemClass {
    key: string;
    name: string;
    description: string;
    skills: SystemSkill[];
    // Novos campos
    hitDice?: string;
    baseHealth?: number;
    healthPerLevel?: number;
    proficiencies?: string[];
    savingThrows?: string[];
    startingEquipment?: string[];
    spellcasting?: {
        enabled: boolean;
        ability?: string;
        spellSlots?: Record<number, number[]>;
    };
}

export interface SystemSubclass {
    key: string;
    name: string;
    parentClass: string;
    description?: string;
    skills: SystemSkill[];
    // Novos campos
    unlockLevel?: number;
    bonusFeatures?: string[];
}

export interface SystemLineage {
    key: string;
    name: string;
    // Nome customizado do conceito (Linhagem, Ancestral, Origem, etc.)
    conceptName: string;
    description?: string;
    skills: SystemSkill[];
    // Bônus de atributos
    attributeBonus?: Record<string, number>;
    // Bônus de perícias
    expertiseBonus?: Record<string, number>;
    // Itens iniciais
    startingItems?: string[];
    // Proficiências
    proficiencies?: string[];
    // Idiomas
    languages?: string[];
}

// ============================================
// Tipos para raças e ocupações
// ============================================

export interface SystemRace {
    key: string;
    name: string;
    description: string;
    skills: SystemSkill[];
    attributeModifiers?: Record<string, number>;
    size?: string;
    speed?: number;
    darkvision?: number;
    languages?: string[];
    traits?: string[];
}

export interface SystemOccupation {
    key: string;
    name: string;
    // Nome customizado do conceito (Profissão, Ocupação, Background, etc.)
    conceptName: string;
    description?: string;
    skills: SystemSkill[];
    expertiseBonus?: Record<string, number>;
    startingItems?: string[];
    startingMoney?: number;
    proficiencies?: string[];
}

// ============================================
// Tipos para traços
// ============================================

export interface SystemTrait {
    name: string;
    description?: string;
    value: number;
    target: {
        kind: 'attribute' | 'expertise' | 'custom';
        name: string;
    };
}

// ============================================
// Tipos para configurações gerais
// ============================================

export interface EnabledFields {
    traits: boolean;
    lineage: boolean;
    occupation: boolean;
    subclass: boolean;
    elementalMastery: boolean;
    financialCondition: boolean;
    spells: boolean;
    race: boolean;
    class: boolean;
    customFields: Array<{ key: string; label: string; type: 'text' | 'number' | 'select' | 'boolean'; options?: string[]; }>;
}

export interface DiceRules {
    defaultDice: string;
    criticalRange: number;
    fumbleRange: number;
    customRules?: string;
    advantageSystem?: 'reroll' | '2d20_best' | 'bonus' | 'none';
    advantageBonus?: number;
}

export interface PointsConfig {
    hasLP: boolean;
    hasMP: boolean;
    hasAP: boolean;
    lpName?: string;
    mpName?: string;
    apName?: string;
    lpFormula?: string;
    mpFormula?: string;
    apFormula?: string;
    customPoints: Array<{ key: string; name: string; abbreviation: string; formula?: string; }>;
}

export interface MagicConfig {
    // Configurações iniciais de magia
    initialSpellSpace: number;      // Espaços de magia inicial (padrão: 0)
    initialORMLevel: number;         // Nível inicial do ORM (padrão: 0)
    initialMagicPoints: number;      // Pontos de magia para aprender magias (padrão: 0)
    hasSpellSystem: boolean;         // Se o sistema usa magias
}

export interface ConceptNames {
    lineage: string;      // "Linhagem", "Ancestral", "Origem"
    occupation: string;   // "Profissão", "Ocupação", "Background"
    class: string;        // "Classe", "Arquétipo"
    subclass: string;     // "Subclasse", "Especialização", "Caminho"
    race: string;         // "Raça", "Espécie", "Povo"
    trait: string;        // "Traço", "Característica", "Peculiaridade"
    spell: string;        // "Magia", "Feitiço", "Encantamento"
    skill: string;        // "Habilidade", "Poder", "Talento"
}

// ============================================
// Entidade principal RPGSystem
// ============================================

@Collection('rpg_systems')
export class RPGSystem {
    id: string;
    name: string;
    description: string = '';
    creatorId: string;
    isPublic: boolean = false;
    createdAt: string = new Date().toISOString();
    updatedAt: string = new Date().toISOString();
    
    // Nomes customizados dos conceitos
    conceptNames: ConceptNames = {
        lineage: 'Linhagem',
        occupation: 'Profissão',
        class: 'Classe',
        subclass: 'Subclasse',
        race: 'Raça',
        trait: 'Traço',
        spell: 'Magia',
        skill: 'Habilidade'
    };
    
    // Configuração de campos iniciais
    initialFields: InitialFields = {
        life: { enabled: true, label: 'Vida', required: true, defaultValue: 10, formula: 'VIG * 2 + 10' },
        mana: { enabled: true, label: 'Mana', required: true, defaultValue: 10, formula: 'FOC * 2 + 10' },
        armor: { enabled: true, label: 'Armadura', required: false, defaultValue: 0 },
        age: { enabled: true, label: 'Idade', required: true, min: 1, max: 999 },
        gender: { 
            enabled: true, 
            label: 'Gênero', 
            required: true, 
            options: ['Masculino', 'Feminino', 'Não-binário', 'Outro', 'Não definido'] 
        },
        financialCondition: { 
            enabled: true, 
            label: 'Condição Financeira', 
            required: false, 
            options: ['Miserável', 'Pobre', 'Estável', 'Rico'] 
        },
        customInitialFields: []
    };
    
    // Configuração de campos habilitados na ficha
    enabledFields: EnabledFields = {
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
    };
    
    // Atributos customizados
    attributes: SystemAttribute[] = [];
    
    // Perícias customizadas
    expertises: SystemExpertise[] = [];
    
    // Classes disponíveis
    classes: SystemClass[] = [];
    
    // Subclasses
    subclasses: SystemSubclass[] = [];
    
    // Raças
    races: SystemRace[] = [];
    
    // Linhagens
    lineages: SystemLineage[] = [];
    
    // Profissões/Ocupações
    occupations: SystemOccupation[] = [];
    
    // Traços positivos e negativos
    traits: {
        positive: SystemTrait[];
        negative: SystemTrait[];
    } = {
        positive: [],
        negative: []
    };
    
    // Magias do sistema
    spells: SystemSpell[] = [];
    
    // Habilidades genéricas do sistema (não vinculadas a classe/raça)
    skills: SystemSkill[] = [];
    
    // Elementos disponíveis para magias
    elements: string[] = ['Fogo', 'Água', 'Ar', 'Terra', 'Luz', 'Trevas', 'Arcano'];
    
    // Regras de dados
    diceRules: DiceRules = {
        defaultDice: '1d20',
        criticalRange: 20,
        fumbleRange: 1,
        advantageSystem: '2d20_best'
    };
    
    // Configuração de pontos
    pointsConfig: PointsConfig = {
        hasLP: true,
        hasMP: true,
        hasAP: true,
        lpName: 'LP',
        mpName: 'MP',
        apName: 'AP',
        customPoints: []
    };
    
    // Configuração de magia
    magicConfig: MagicConfig = {
        initialSpellSpace: 0,
        initialORMLevel: 0,
        initialMagicPoints: 0,
        hasSpellSystem: true
    };

    constructor(system?: Partial<RPGSystem>) {
        Object.assign(this, system);
    }
}
