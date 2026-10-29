/**
 * Gera `docs/passivas-de-classe.md`: a tabela das 120 habilidades de classe e subclasse (`constants/skills.ts`) com o que o app faz com cada uma (automática, ativada ou só
 * texto), tirada do catálogo estruturado (`utils/combat/passives/catalog.ts`). Não toca no banco. Refaça o arquivo sempre que o catálogo mudar:
 *   npx ts-node -T -r tsconfig-paths/register -O '{"module":"commonjs","moduleResolution":"node10"}' scripts/generatePassivesDoc.ts [--check]
 * Com `--check` não grava: sai com erro se o arquivo está desatualizado.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { skills } from '../constants/skills'
import { describeLimits, findPassive, limitStatuses, NO_USES, type PassiveDef, type PassiveMode, type PassiveSource } from '../utils/combat/passives'

const OUTPUT = resolve(__dirname, '../docs/passivas-de-classe.md')

const MODE_LABEL: Record<PassiveMode, string> = { automatica: 'Automática', ativada: 'Ativada', texto: 'Só texto' }

interface Row {
    source: PassiveSource
    group: string
    name: string
    def: PassiveDef | undefined
}

const cell = (text: string): string => text.replace(/\|/g, '/').replace(/\s+/g, ' ').trim()

function collectRows(): Row[] {
    const rows: Row[] = []
    for (const [ group, list ] of Object.entries(skills.class)) rows.push(...list.map(skill => ({ source: 'class' as const, group, name: skill.name, def: findPassive('class', skill.name) })))
    for (const [ group, list ] of Object.entries(skills.subclass)) rows.push(...list.map(skill => ({ source: 'subclass' as const, group, name: skill.name, def: findPassive('subclass', skill.name) })))
    return rows
}

/** "Bônus · 5 MP · 3 de 3 por dia" */
function describeActivation(def: PassiveDef): string {
    const activation = def.activation
    if (!activation) return ''
    const cost = activation.cost?.allMp ? 'todo o MP' : activation.cost?.mp ? `${activation.cost.mp} MP` : 'sem MP'
    const limits = describeLimits(limitStatuses(activation, def.key, NO_USES))
    return [ activation.execution, cost, limits ].filter(Boolean).join(' · ')
}

export function buildDoc(): string {
    const rows = collectRows()
    const count = (mode: PassiveMode): number => rows.filter(row => (row.def?.mode ?? 'texto') === mode).length
    const lines: string[] = [
        '# Habilidades de classe e subclasse no combate assistido',
        '',
        '> Arquivo gerado por `scripts/generatePassivesDoc.ts` a partir de `utils/combat/passives/catalog.ts`. Não edite à mão.',
        '',
        `Total: **${rows.length}** habilidades (${rows.filter(row => row.source === 'class').length} de classe e ${rows.filter(row => row.source === 'subclass').length} de subclasse).`,
        `**${count('automatica')}** automáticas · **${count('ativada')}** ativadas · **${count('texto')}** só texto.`,
        '',
        '- **Automática**: vale sozinha (dano a mais, custo de MP, AP, resistência, iniciativa, regeneração...), sem o jogador acionar.',
        '- **Ativada**: o jogador aciona pela seção Ações (quadrado da habilidade): o app confere MP e usos, gasta a ação (aviso, nunca trava), cura ou põe o efeito sobre o personagem.',
        '- **Só texto**: o app mostra a descrição; quem aplica é o mestre. Entra no catálogo uma de cada vez, acrescentando uma entrada em `catalog.ts`.',
        '',
        'A coluna "Fora do automático" lista o que da descrição o app **não** faz sozinho nas habilidades já estruturadas.',
        ''
    ]

    for (const source of [ 'class', 'subclass' ] as const) {
        lines.push(`## ${source === 'class' ? 'Classe' : 'Subclasse'}`, '')
        const groups = [ ...new Set(rows.filter(row => row.source === source).map(row => row.group)) ]
        for (const group of groups) {
            lines.push(`### ${group}`, '', '| Habilidade | Modo | Ativação | Fora do automático |', '| --- | --- | --- | --- |')
            for (const row of rows.filter(candidate => candidate.source === source && candidate.group === group)) {
                const mode = row.def?.mode ?? 'texto'
                lines.push(`| ${cell(row.name)} | ${MODE_LABEL[mode]} | ${row.def ? cell(describeActivation(row.def)) : ''} | ${row.def?.pending ? cell(row.def.pending) : ''} |`)
            }
            lines.push('')
        }
    }
    return `${lines.join('\n').trimEnd()}\n`
}

if (require.main === module) {
    const doc = buildDoc()
    if (process.argv.includes('--check')) {
        const current = existsSync(OUTPUT) ? readFileSync(OUTPUT, 'utf8') : ''
        if (current !== doc) {
            console.error('docs/passivas-de-classe.md está desatualizado: rode o script sem --check.')
            process.exit(1)
        }
        console.log('docs/passivas-de-classe.md está em dia.')
    } else {
        mkdirSync(dirname(OUTPUT), { recursive: true })
        writeFileSync(OUTPUT, doc)
        console.log(`Gravado ${OUTPUT}`)
    }
}
