import 'dotenv/config'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const BASE_URL = process.env.MCP_RPG_BASE_URL || 'http://localhost:3000'
const API_KEY = process.env.INTERNAL_API_KEY

async function callApi(path: string, init?: RequestInit) {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
            ...init?.headers
        }
    })
    const text = await res.text()
    let body: unknown
    try {
        body = text ? JSON.parse(text) : null
    } catch {
        body = text
    }
    return {
        content: [{ type: 'text' as const, text: JSON.stringify(body, null, 2) }],
        isError: !res.ok
    }
}

function toQuery(params: Record<string, unknown>) {
    const qs = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== '') qs.set(key, String(value))
    }
    const s = qs.toString()
    return s ? `?${s}` : ''
}

const server = new McpServer({ name: 'magitech-rpg', version: '1.0.0' })

server.registerTool(
    'list_campaigns',
    {
        description:
            'Lista campanhas. Sem userId retorna todas; com userId separa como mestre (asGm) e jogador (asPlayer).',
        inputSchema: { userId: z.string().optional() }
    },
    async ({ userId }) => callApi(`/api/campaign${toQuery({ userId })}`)
)

server.registerTool(
    'list_charsheets',
    {
        description: 'Lista as fichas de personagem dos jogadores de uma campanha (pra ver atributos/stats reais e calibrar criaturas).',
        inputSchema: { campaignId: z.string() }
    },
    async ({ campaignId }) => callApi(`/api/campaign/${encodeURIComponent(campaignId)}/fichas`)
)

server.registerTool(
    'search_powers',
    {
        description:
            'Busca habilidades/poderes existentes (prefixo do nome e/ou elemento) pra conferir duplicatas antes de criar.',
        inputSchema: {
            search: z.string().optional(),
            filter: z.string().optional().describe('Elemento, ex: FOGO'),
            limit: z.number().optional(),
            cursor: z.string().optional()
        }
    },
    async params => callApi(`/api/power${toQuery(params)}`)
)

server.registerTool(
    'search_spells',
    {
        description: 'Busca magias existentes (prefixo do nome e/ou elemento) pra conferir duplicatas antes de criar.',
        inputSchema: {
            search: z.string().optional(),
            filter: z.string().optional().describe('Elemento, ex: FOGO'),
            limit: z.number().optional(),
            cursor: z.string().optional()
        }
    },
    async params => callApi(`/api/spell${toQuery(params)}`)
)

server.registerTool(
    'create_power',
    {
        description: 'Cria habilidade/poder mágico (PowerDTO). type default "Poder Mágico" se omitido.',
        inputSchema: {
            name: z.string(),
            description: z.string(),
            element: z.string(),
            mastery: z.string(),
            type: z.string().optional(),
            origin: z.string().optional(),
            preRequisite: z.string().optional()
        }
    },
    async body => callApi('/api/power', { method: 'POST', body: JSON.stringify(body) })
)

server.registerTool(
    'create_spell',
    {
        description: 'Cria magia (SpellDTO).',
        inputSchema: {
            element: z.string(),
            name: z.string(),
            level: z.number().optional(),
            mpCost: z.number().optional(),
            type: z.string(),
            execution: z.string(),
            range: z.string(),
            stages: z.array(z.string()).optional()
        }
    },
    async body => callApi('/api/spell', { method: 'POST', body: JSON.stringify(body) })
)

const damageModifierSchema = z.object({
    kind: z.enum([ 'resistance', 'vulnerability' ]),
    element: z.string().optional().describe('Elemento/tipo de dano ("Fogo", "Cortante") ou "Físico"; vazio = todo dano'),
    value: z.string().describe('"25%" (percentual) ou "3" (fixo)')
})

const defensesSchema = {
    elementalMastery: z.string().optional().describe('Elemento da criatura (ex.: "Água"); dá a ela a fraqueza do elemento que vence este. Segredo do mestre.'),
    weaknesses: z.array(z.string()).optional().describe('Fraquezas declaradas: elementos ou tipos físicos ("Cortante", "Perfurante", "Impactante"). Segredo do mestre.'),
    damageModifiers: z.array(damageModifierSchema).optional().describe('Resistências/vulnerabilidades ao dano recebido. Segredo do mestre.')
}

server.registerTool(
    'list_creatures',
    {
        description: 'Lista as criaturas customizadas de uma campanha (painel do mestre), com defesas (elemento/fraquezas/resistências) já juntadas.',
        inputSchema: { campaignId: z.string() }
    },
    async ({ campaignId }) => callApi(`/api/campaign/${encodeURIComponent(campaignId)}/custom/creatures`)
)

server.registerTool(
    'create_creature',
    {
        description:
            'Cria criatura customizada dentro de uma campanha (painel do mestre). attributes/expertises aceitam chaves livres pra sistemas customizados.',
        inputSchema: {
            campaignId: z.string(),
            name: z.string(),
            description: z.string().optional(),
            type: z.string().optional(),
            imageUrl: z.string().optional(),
            level: z.number().optional(),
            attributes: z.record(z.number()).optional(),
            stats: z
                .object({
                    lp: z.number().optional(),
                    maxLp: z.number().optional(),
                    mp: z.number().optional(),
                    maxMp: z.number().optional(),
                    ap: z.number().optional()
                })
                .optional(),
            expertises: z.record(z.any()).optional(),
            skills: z.array(z.any()).optional(),
            spells: z.array(z.any()).optional(),
            ...defensesSchema
        }
    },
    async ({ campaignId, ...body }) =>
        callApi(`/api/campaign/${encodeURIComponent(campaignId)}/custom/creatures`, {
            method: 'POST',
            body: JSON.stringify(body)
        })
)

server.registerTool(
    'update_creature',
    {
        description:
            'Atualiza campos de uma criatura customizada já existente numa campanha (ex.: troncar spells/skills, ajustar stats). Só os campos enviados são sobrescritos; o resto é mantido.',
        inputSchema: {
            campaignId: z.string(),
            id: z.string().describe('id da criatura (retornado por create_creature ou pela listagem)'),
            name: z.string().optional(),
            description: z.string().optional(),
            type: z.string().optional(),
            imageUrl: z.string().optional(),
            level: z.number().optional(),
            attributes: z.record(z.number()).optional(),
            stats: z
                .object({
                    lp: z.number().optional(),
                    maxLp: z.number().optional(),
                    mp: z.number().optional(),
                    maxMp: z.number().optional(),
                    ap: z.number().optional()
                })
                .optional(),
            expertises: z.record(z.any()).optional(),
            skills: z.array(z.any()).optional(),
            spells: z.array(z.any()).optional(),
            ...defensesSchema
        }
    },
    async ({ campaignId, ...body }) =>
        callApi(`/api/campaign/${encodeURIComponent(campaignId)}/custom/creatures`, {
            method: 'PUT',
            body: JSON.stringify(body)
        })
)

server.registerTool(
    'create_character',
    {
        description:
            'Cria ficha de personagem (CharsheetDTO/BaseCharsheet). Schema grande e muda com frequência, então aceita o objeto completo em "character": campos típicos — id, userId, playerName, name, class, race, lineage, age, gender, financialCondition, attributes, stats, expertises, inventory, points, mods, dices[], passives[], spells[], skills{lineage,class,subclass,bonus,powers,race}, traits[]. Erros de validação voltam detalhados na resposta pra corrigir e tentar de novo.',
        inputSchema: { character: z.record(z.any()) }
    },
    async ({ character }) => callApi('/api/charsheet', { method: 'POST', body: JSON.stringify(character) })
)

const transport = new StdioServerTransport()
await server.connect(transport)
