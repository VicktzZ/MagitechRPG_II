/**
 * Troca o `name` das magias do catálogo conforme `data/spellRenames.ts` (nomes quase iguais ou genéricos). Só o campo `name` é tocado.
 *
 * ESCREVE NO BANCO, por isso é seguro por padrão (o mesmo comportamento de `applySpellTypeChanges.ts`):
 *   (sem flags)    simulação: lista o que trocaria, o que já está trocado e o que não dá para trocar
 *   --apply        grava; cada magia é relida numa transação e só é renomeada se o `name` ainda for o antigo (edição manual no meio vira "conflito")
 *   --backup F     com --apply, guarda em F as trocas feitas (padrão: arquivo na pasta temporária)
 *   --revert F     desfaz as trocas guardadas em F (só nas magias que ainda estão com o `name` novo)
 *
 * Rodar (precisa de NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY; para testar contra o emulador, defina FIRESTORE_EMULATOR_HOST):
 *   npx ts-node -T -r tsconfig-paths/register -O '{"module":"commonjs","moduleResolution":"node10"}' scripts/applySpellRenames.ts [--apply [--backup arquivo.json]] [--revert arquivo.json]
 */
import { readFileSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { invertSpellTypeChanges, type SpellTypeChange } from '../utils/spellTypeChanges'
import { applySpellTypeChanges, printReport, valueOf } from './applySpellTypeChanges'
import { SPELL_RENAMES } from './data/spellRenames'

if (require.main === module) {
    const argv = process.argv.slice(2)
    const apply = argv.includes('--apply')
    const revertFile = valueOf(argv, '--revert')
    const changes = revertFile ? invertSpellTypeChanges(JSON.parse(readFileSync(revertFile, 'utf8')) as SpellTypeChange[]) : SPELL_RENAMES

    console.log(apply ? 'Gravando no banco.' : 'Simulação: nada será gravado. Use --apply para gravar.')

    applySpellTypeChanges({ apply, changes, field: 'name' })
        .then((report) => {
            printReport(report, apply, 'name')

            if (apply && !revertFile && report.applied.length > 0) {
                const backupFile = valueOf(argv, '--backup') ?? join(tmpdir(), `spell-renames-backup-${Date.now()}.json`)
                writeFileSync(backupFile, JSON.stringify(report.applied, null, 2), { mode: 0o600 })
                console.log(`Trocas feitas guardadas em ${backupFile} (para desfazer: --revert ${backupFile} --apply)`)
            }
            process.exit(0)
        })
        .catch((error: unknown) => {
            console.error('Erro ao renomear as magias:', error)
            process.exit(1)
        })
}
