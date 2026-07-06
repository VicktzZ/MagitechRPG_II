import { Collection } from 'fireorm';
import type { Weapon } from '../Weapon';
import type { Armor } from '../Armor';
import type { Item } from '../Item';

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

/**
 * Como o valor de um atributo influencia TODOS os testes de perícias
 * vinculadas a ele.
 * - 'advantage': mais dados rolados (pega o melhor)
 * - 'sum': bônus fixo somado ao resultado
 * - 'none': sem influência
 */
export interface AttributeTestInfluence {
    mode: 'none' | 'advantage' | 'sum';
    /**
     * Fórmula com as variáveis "attr" (valor do atributo) e "level".
     * Ex: "attr / 2" = a cada 2 pontos, +1. Vazio = "attr" (1 para 1).
     */
    formula?: string;
    /**
     * Ajuste manual por valor do atributo (chave = valor do atributo,
     * valor = dados extras/bônus). Tem prioridade sobre a fórmula.
     */
    manualMap?: Record<string, number>;
}

export interface SystemAttribute {
    key: string;
    name: string;
    abbreviation: string;
    description?: string;
    defaultValue?: number;
    minValue?: number;
    maxValue?: number;
    /** Influência do atributo nos testes de perícias vinculadas */
    testInfluence?: AttributeTestInfluence;
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
    /**
     * Restringe a habilidade a uma classe (key ou name).
     * Usado em habilidades gerais (system.skills): no level-up, a habilidade
     * é concedida automaticamente se `level` foi atingido e a classe da ficha
     * corresponde. Vazio/undefined = qualquer classe.
     */
    requiredClass?: string;
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
    // ── Concessões ao escolher a classe na criação da ficha ──
    /** Pontos de perícia extras concedidos pela classe */
    expertisePoints?: number;
    /** Pontos de atributo extras concedidos pela classe */
    attributePoints?: number;
    /** Bônus direto em atributos (key do atributo → valor) */
    attributeBonus?: Record<string, number>;
    /** Bônus direto em perícias (key da perícia → valor) */
    expertiseBonus?: Record<string, number>;
    /** Itens iniciais concedidos pela classe */
    grantedItems?: {
        weapons: Array<Partial<Weapon>>;
        armors: Array<Partial<Armor>>;
        items: Array<Partial<Item>>;
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
// Tipos para progressão e recursos customizados
// ============================================

export interface SystemProgressionLevel {
    level: number;
    label?: string;               // "Recruta", "Veterano", "Especialista"...
    hpBonus: number;              // HP ganho ao atingir este nível (stats.maxLp)
    skillPoints: number;          // Pontos de perícia ganhos (points.expertises)
    attributePoints?: number;     // Pontos de atributo ganhos (points.attributes)
    unlocksClassAbility?: boolean; // Se este nível desbloqueia habilidade de classe
    customResourceBonuses?: Record<string, number>; // Bônus em recursos customizados
    /**
     * Bônus genéricos para outros campos da charsheet.
     * Chaves suportadas: 'mp' (stats.maxMp), 'ap' (stats.maxAp),
     * 'magicPoints' (points.magics), 'spellSpaces' (spellSpace)
     */
    fieldBonuses?: Record<string, number>;
    customLabel?: string;         // Texto exibido na notificação de level-up
}

export interface SkillPointRules {
    classSkillCost: number;       // Custo por ponto em perícias de classe (padrão: 1)
    otherSkillCost: number;       // Custo por ponto em outras perícias (padrão: 1)
    maxPointsPerSkillFormula?: string; // Ex: "level * 2" — cap por perícia baseado no nível
}

export interface ResourceThreshold {
    /**
     * Valor do limiar. Quando `mode` é 'max' ou 'min', é um OFFSET
     * relativo ao máximo/mínimo atual do personagem (ex: mode 'max' +
     * value -2 → dispara em máx-2; value 0 → dispara no máximo).
     */
    value: number;
    label: string;
    color: string;
    /** 'constant' (padrão) = valor fixo; 'max'/'min' = relativo ao limite do personagem */
    mode?: 'constant' | 'max' | 'min';
}

export interface CustomResource {
    key: string;
    name: string;
    abbreviation?: string;
    type: 'percentage' | 'counter' | 'gauge';
    min: number;
    max: number;
    defaultValue?: number;
    formula?: string;             // Fórmula para valor inicial baseado em atributos
    color?: string;               // Cor da barra (hex ou nome CSS)
    thresholds?: ResourceThreshold[]; // Limiares para efeitos visuais/mecânicos
}

/**
 * Recurso simbólico/contável exibido em "Informações Gerais" da ficha,
 * junto do dinheiro (ex: "Pedras do Nexus"). Sem barra — apenas contador.
 */
export interface SymbolicResource {
    key: string;
    name: string;
    abbreviation?: string;
    defaultValue?: number;
    description?: string;
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

    // Nível máximo do sistema (padrão 20; Cosmos RPG usa 5)
    maxLevel: number = 20;

    /**
     * Nível inicial de uma ficha recém-criada neste sistema.
     * Undefined/0 = comportamento padrão (ficha começa no nível 0).
     */
    startingLevel?: number;

    // Pontos de atributo para distribuir na criação da ficha
    // (undefined = usa o padrão da aplicação)
    initialAttributePoints?: number;

    // Pontos de perícia para distribuir na criação da ficha
    // (undefined = usa o padrão da aplicação)
    initialExpertisePoints?: number;

    /**
     * Fórmula do limite máximo de pontos por atributo, com "level" como
     * variável (ex: "level", "level * 2", "level + 1").
     * Vazio/undefined = sem limite por nível (usa apenas o max do atributo).
     */
    attributeCapFormula?: string;

    /**
     * Configuração da moeda do sistema. enabled=false remove o dinheiro
     * da ficha; name/abbreviation renomeiam o conceito.
     */
    currency?: {
        enabled: boolean;
        name: string;
        abbreviation?: string;
    };

    /**
     * Configuração de peso/carga do inventário.
     * unit: conceito exibido ("kg", "slots", "" = número simbólico).
     * initialCargo/initialMax: peso inicial e capacidade máxima da ficha.
     */
    weightConfig?: {
        unit: string;
        initialCargo?: number;
        initialMax: number;
    };

    // Recursos simbólicos/contáveis exibidos em "Informações Gerais" (ex: Pedras do Nexus)
    symbolicResources?: SymbolicResource[];

    // Catálogo de itens criados para este sistema (usados nas concessões de classe)
    customItems?: {
        weapons: Array<Partial<Weapon>>;
        armors: Array<Partial<Armor>>;
        items: Array<Partial<Item>>;
    };

    // Tabela de progressão por nível — se vazia, usa lógica legada do Magitech
    progressionTable: SystemProgressionLevel[] = [];

    // Regras de custo de pontos de perícia
    skillPointRules: SkillPointRules = {
        classSkillCost: 1,
        otherSkillCost: 1,
    };

    // Recursos customizados além de LP/MP/AP (ex: Bateria, O2, Estresse)
    customResources: CustomResource[] = [];

    constructor(system?: Partial<RPGSystem>) {
        Object.assign(this, system);
    }
}
