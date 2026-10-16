import { NextResponse, type NextRequest } from 'next/server'
import { seedCombatEffects } from '@scripts/seedCombatEffects'
import { handleRouteError, requireAdminOrApiKey } from '@utils/api'

/**
 * Popula o catálogo global de efeitos de combate com os presets do sistema.
 * Idempotente (upsert por id).
 *
 * Disponível em GET (conveniência — basta abrir no navegador) e POST (para invocar via script/curl).
 * Restrito a ambiente de desenvolvimento para manter o padrão dos outros endpoints de admin.
 */
async function runSeed(request: NextRequest): Promise<Response> {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
            { error: 'Endpoint disponível apenas em ambiente de desenvolvimento' },
            { status: 403 }
        )
    }

    try {
        await requireAdminOrApiKey(request)
        const result = await seedCombatEffects()
        return NextResponse.json({
            success: true,
            message: `${result.created} criados, ${result.updated} atualizados (total: ${result.total})`,
            ...result
        })
    } catch (error) {
        return handleRouteError(error, 'Erro ao popular efeitos pré-definidos')
    }
}

export async function GET(request: NextRequest): Promise<Response> {
    return await runSeed(request)
}

export async function POST(request: NextRequest): Promise<Response> {
    return await runSeed(request)
}
