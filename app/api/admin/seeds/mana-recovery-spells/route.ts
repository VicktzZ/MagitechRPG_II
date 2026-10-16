import { NextResponse, type NextRequest } from 'next/server'
import { seedManaRecoverySpells } from '@scripts/seedManaRecoverySpells'
import { handleRouteError, requireAdminOrApiKey } from '@utils/api'

/**
 * Popula o catálogo de magias com o lote de recuperação de mana.
 * Idempotente (upsert por id fixo).
 *
 * Somente POST (escreve no banco, então não pode ser disparado por um GET de outro site)
 * e restrito a administrador logado ou à API key interna.
 */
export async function POST(request: NextRequest): Promise<Response> {
    try {
        await requireAdminOrApiKey(request)
        const result = await seedManaRecoverySpells()
        return NextResponse.json({
            success: true,
            message: `${result.created} criadas, ${result.updated} atualizadas (total: ${result.total})`,
            ...result
        })
    } catch (error) {
        return handleRouteError(error, 'Erro ao popular magias de recuperação de mana')
    }
}
