/**
 * Correções do catálogo de magias pedidas pelo dono em 29/10/2026 (`data/spellCatalogFixes.ts`):
 *   - o elemento `NãO-ELEMENTAL` (9 magias) vira `NÃO-ELEMENTAL`, para o filtro de elemento achá-las;
 *   - as 7 magias do lote novo que têm duração e estavam `(imediato)` viram `(contínuo)`.
 * Só os campos `element` e `type` são tocados. Para apagar a magia repetida, ver `removeDuplicateSpells.ts`.
 *
 * ESCREVE NO BANCO, por isso é seguro por padrão (o mesmo comportamento de `applySpellTypeChanges.ts`):
 *   (sem flags)    simulação: lista o que trocaria, o que já está trocado e o que não dá para trocar
 *   --apply        grava; cada magia é relida numa transação e só é trocada se o campo ainda for o antigo (edição manual no meio vira "conflito")
 *   --backup F     com --apply, guarda em F as trocas feitas (padrão: arquivo na pasta temporária)
 *   --revert F     desfaz as trocas guardadas em F (só nas magias que ainda estão com o valor novo)
 *
 * Rodar (precisa de NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY; para testar contra o emulador, defina FIRESTORE_EMULATOR_HOST):
 *   npx ts-node -T -r tsconfig-paths/register -O '{"module":"commonjs","moduleResolution":"node10"}' scripts/applySpellCatalogFixes.ts [--apply [--backup arquivo.json]] [--revert arquivo.json]
 */
import { readFileSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { invertSpellTypeChanges, type SpellTypeChange } from '../utils/spellTypeChanges'
import { applySpellTypeChanges, printReport, valueOf, type ApplySpellTypeReport } from './applySpellTypeChanges'
import { BATCH_DURATION_TYPE_FIXES, ELEMENT_CASE_FIXES } from './data/spellCatalogFixes'

export interface SpellCatalogFixes {
    element: SpellTypeChange[]
    type: SpellTypeChange[]
}

export const SPELL_CATALOG_FIXES: SpellCatalogFixes = { element: ELEMENT_CASE_FIXES, type: BATCH_DURATION_TYPE_FIXES }

export interface SpellCatalogFixesReport {
    element: ApplySpellTypeReport
    type: ApplySpellTypeReport
}

/** Aplica (ou simula) as duas famílias de troca, uma depois da outra */
export async function applySpellCatalogFixes({ apply = false, fixes = SPELL_CATALOG_FIXES }: { apply?: boolean; fixes?: SpellCatalogFixes } = {}): Promise<SpellCatalogFixesReport> {
    const element = await applySpellTypeChanges({ apply, changes: fixes.element, field: 'element' })
    const type = await applySpellTypeChanges({ apply, changes: fixes.type, field: 'type' })
    return { element, type }
}

if (require.main === module) {
    const argv = process.argv.slice(2)
    const apply = argv.includes('--apply')
    const revertFile = valueOf(argv, '--revert')
    const fixes: SpellCatalogFixes = revertFile
        ? (() => {
            const saved = JSON.parse(readFileSync(revertFile, 'utf8')) as SpellCatalogFixes
            return { element: invertSpellTypeChanges(saved.element ?? []), type: invertSpellTypeChanges(saved.type ?? []) }
        })()
        : SPELL_CATALOG_FIXES

    console.log(apply ? 'Gravando no banco.' : 'Simulação: nada será gravado. Use --apply para gravar.')

    applySpellCatalogFixes({ apply, fixes })
        .then((report) => {
            console.log('— Elemento (NãO-ELEMENTAL → NÃO-ELEMENTAL) —')
            printReport(report.element, apply, 'element')
            console.log('— Tipo das magias do lote novo (imediato → contínuo) —')
            printReport(report.type, apply, 'type')

            if (apply && !revertFile && (report.element.applied.length > 0 || report.type.applied.length > 0)) {
                const backupFile = valueOf(argv, '--backup') ?? join(tmpdir(), `spell-catalog-fixes-backup-${Date.now()}.json`)
                writeFileSync(backupFile, JSON.stringify({ element: report.element.applied, type: report.type.applied }, null, 2), { mode: 0o600 })
                console.log(`Trocas feitas guardadas em ${backupFile} (para desfazer: --revert ${backupFile} --apply)`)
            }
            process.exit(0)
        })
        .catch((error: unknown) => {
            console.error('Erro ao aplicar as correções do catálogo:', error)
            process.exit(1)
        })
}
