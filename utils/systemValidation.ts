import type { RPGSystem } from '@models/entities';
import { extractFormulaTokens } from './formulaEvaluator';

export interface SystemWarning {
    tabId: string;
    message: string;
}

/**
 * Valida a consistência de um sistema de RPG antes de salvar.
 * Retorna avisos (não bloqueantes) — o criador decide se salva mesmo assim.
 */
export function validateSystemForSave(system: Partial<RPGSystem>): SystemWarning[] {
    const warnings: SystemWarning[] = [];
    const ef = system.enabledFields;
    const cn = system.conceptNames;

    // ── Campos habilitados sem conteúdo ──
    if (ef?.class && !(system.classes?.length)) {
        warnings.push({ tabId: 'classes', message: `${cn?.class || 'Classe'}s estão habilitadas, mas nenhuma foi criada.` });
    }
    if (ef?.subclass && !(system.subclasses?.length)) {
        warnings.push({ tabId: 'classes', message: `${cn?.subclass || 'Subclasse'}s estão habilitadas, mas nenhuma foi criada.` });
    }
    if (ef?.race && !(system.races?.length)) {
        warnings.push({ tabId: 'races', message: `${cn?.race || 'Raça'}s estão habilitadas, mas nenhuma foi criada.` });
    }
    if (ef?.lineage && !(system.lineages?.length)) {
        warnings.push({ tabId: 'lineages', message: `${cn?.lineage || 'Linhagem'}s estão habilitadas, mas nenhuma foi criada.` });
    }
    if (ef?.occupation && !(system.occupations?.length)) {
        warnings.push({ tabId: 'occupations', message: `${cn?.occupation || 'Profissão'}s estão habilitadas, mas nenhuma foi criada.` });
    }
    if (ef?.spells && !(system.spells?.length)) {
        warnings.push({ tabId: 'spells', message: `${cn?.spell || 'Magia'}s estão habilitadas, mas nenhuma foi criada.` });
    }
    if (ef?.traits) {
        const traitCount = (system.traits?.positive?.length ?? 0) + (system.traits?.negative?.length ?? 0);
        if (traitCount === 0) {
            warnings.push({ tabId: 'traits', message: `${cn?.trait || 'Traço'}s estão habilitados, mas nenhum foi criado.` });
        }
    }

    // ── Atributos ──
    if (!(system.attributes?.length)) {
        warnings.push({ tabId: 'attributes', message: 'Nenhum atributo foi definido. Fichas deste sistema não terão atributos.' });
    }

    // ── Fórmulas referenciando atributos inexistentes ──
    const validTokens = new Set<string>([
        'LEVEL', 'NIVEL', 'NÍVEL',
        ...(system.attributes ?? []).map(a => a.abbreviation.toUpperCase()),
        ...(system.attributes ?? []).map(a => a.key.toUpperCase())
    ]);

    const checkFormula = (formula: string | undefined, context: string, tabId: string) => {
        if (!formula?.trim()) return;
        const unknown = extractFormulaTokens(formula)
            .filter(t => !validTokens.has(t.toUpperCase()));
        if (unknown.length > 0) {
            const validList = [ ...validTokens ].join(', ') || '(nenhuma — defina atributos primeiro)';
            warnings.push({
                tabId,
                message: `Fórmula de ${context} referencia variáveis desconhecidas: ${unknown.join(', ')}. ` +
                    `Variáveis válidas: ${validList}.`
            });
        }
    };

    checkFormula(system.initialFields?.life?.formula, system.initialFields?.life?.label || 'Vida', 'initial_fields');
    checkFormula(system.initialFields?.mana?.formula, system.initialFields?.mana?.label || 'Mana', 'initial_fields');
    checkFormula(system.initialFields?.armor?.formula, system.initialFields?.armor?.label || 'Armadura', 'initial_fields');
    checkFormula(system.skillPointRules?.maxPointsPerSkillFormula, 'limite por perícia', 'progression');
    (system.customResources ?? []).forEach(res => {
        checkFormula(res.formula, `recurso "${res.name}"`, 'resources');
    });

    // ── Tabela de progressão incompleta ──
    const maxLevel = system.maxLevel ?? 20;
    const tableLen = system.progressionTable?.length ?? 0;
    if (tableLen > 0 && tableLen < maxLevel) {
        warnings.push({
            tabId: 'progression',
            message: `Tabela de progressão tem ${tableLen} níveis, mas o nível máximo é ${maxLevel}. Níveis sem linha não darão recompensas.`
        });
    }

    return warnings;
}
