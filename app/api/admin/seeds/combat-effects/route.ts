import { NextResponse } from 'next/server'
import { seedCombatEffects } from '@scripts/seedCombatEffects'

/**
 * Popula o catálogo global de efeitos de combate com os presets do sistema.
 * Idempotente (upsert por id).
 *
 * Disponível em GET (conveniência — basta abrir no navegador) e POST (para invocar via script/curl).
 * Restrito a ambiente de desenvolvimento para manter o padrão dos outros endpoints de admin.
 */
async function runSeed(): Promise<NextResponse> {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
            { error: 'Endpoint disponível apenas em ambiente de desenvolvimento' },
            { status: 403 }
        )
    }

    try {
        const result = await seedCombatEffects()
        return NextResponse.json({
            success: true,
            message: `${result.created} criados, ${result.updated} atualizados (total: ${result.total})`,
            ...result
        })
    } catch (error) {
        console.error('[Seed Combat Effects] Erro:', error)
        return NextResponse.json(
            { error: 'Erro ao popular efeitos pré-definidos', details: (error as Error).message },
            { status: 500 }
        )
    }
}

export async function GET(): Promise<NextResponse> {
    return runSeed()
}

export async function POST(): Promise<NextResponse> {
    return runSeed()
}
