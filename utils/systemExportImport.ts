import type { RPGSystem } from '@models/entities';

/** Campos removidos na exportação — específicos da instância no banco */
const INSTANCE_FIELDS = [ 'id', 'creatorId', 'createdAt', 'updatedAt' ] as const;

export type SystemImportResult =
    | { ok: true; system: Partial<RPGSystem> }
    | { ok: false; errors: string[] };

/**
 * Baixa um sistema como arquivo JSON (client-side), sem campos de instância.
 */
export function downloadSystemJson(system: Partial<RPGSystem>): void {
    const exportable: Record<string, unknown> = Object.fromEntries(
        Object.entries(system).filter(([ key ]) => !(INSTANCE_FIELDS as readonly string[]).includes(key))
    );

    const json = JSON.stringify(exportable, null, 2);
    const blob = new Blob([ json ], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const slug = (system.name || 'sistema-rpg')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${slug || 'sistema-rpg'}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
}

/**
 * Valida e parseia um JSON de sistema importado.
 * Estrutura mínima exigida: `name` (string não vazia). Arrays principais,
 * se presentes, devem ser arrays. Campos de instância são descartados.
 */
export function parseSystemImport(raw: string): SystemImportResult {
    let data: unknown;
    try {
        data = JSON.parse(raw);
    } catch {
        return { ok: false, errors: [ 'O arquivo não é um JSON válido.' ] };
    }

    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        return { ok: false, errors: [ 'O JSON deve ser um objeto de sistema de RPG.' ] };
    }

    const obj = data as Record<string, unknown>;
    const errors: string[] = [];

    if (typeof obj['name'] !== 'string' || !obj['name'].trim()) {
        errors.push('Campo obrigatório ausente ou inválido: "name" (nome do sistema).');
    }

    const arrayFields = [
        'attributes', 'expertises', 'classes', 'subclasses', 'races',
        'lineages', 'occupations', 'spells', 'skills', 'elements',
        'progressionTable', 'customResources'
    ];
    for (const field of arrayFields) {
        if (field in obj && obj[field] !== undefined && !Array.isArray(obj[field])) {
            errors.push(`Campo "${field}" deve ser uma lista.`);
        }
    }

    if (errors.length > 0) {
        return { ok: false, errors };
    }

    const cleaned = Object.fromEntries(
        Object.entries(obj).filter(([ key ]) => !(INSTANCE_FIELDS as readonly string[]).includes(key))
    );

    return { ok: true, system: cleaned as Partial<RPGSystem> };
}

/** Chave do sessionStorage usada para passar o seed de import/template à página create */
export const SYSTEM_BUILDER_SEED_KEY = 'system-builder-seed';
