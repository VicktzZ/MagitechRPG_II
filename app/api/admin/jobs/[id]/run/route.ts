import { NextResponse, type NextRequest } from 'next/server'
import { jobRepository } from '@repositories'
import { cleanupNotifications } from '@jobs/cleanupNotifications'

// Mapa de funções de jobs disponíveis
const JOB_FUNCTIONS: Record<string, () => Promise<void>> = {
    'cleanup-notifications': cleanupNotifications
}

/**
 * POST /api/admin/jobs/[id]/run
 * Executa um job manualmente
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    // Verifica se está em ambiente de desenvolvimento
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
            { error: 'Endpoint disponível apenas em ambiente de desenvolvimento' },
            { status: 403 }
        )
    }

    try {
        const { id: jobId } = await params
        
        // Verifica se o job existe
        const job = await jobRepository.findById(jobId)
        if (!job) {
            return NextResponse.json(
                { error: 'Job não encontrado' },
                { status: 404 }
            )
        }

        // Verifica se o job está configurado para execução manual
        const jobFunction = JOB_FUNCTIONS[jobId]
        if (!jobFunction) {
            return NextResponse.json(
                { error: 'Job não pode ser executado manualmente' },
                { status: 400 }
            )
        }

        // Verifica se já está rodando
        if (job.status === 'running') {
            return NextResponse.json(
                { error: 'Job já está em execução' },
                { status: 409 }
            )
        }

        // Executa o job em background
        jobFunction().catch(error => {
            console.error(`[API Admin Jobs] Erro ao executar job ${jobId}:`, error)
        })

        return NextResponse.json({
            success: true,
            message: `Job "${job.name}" iniciado com sucesso`,
            jobId
        })

    } catch (error) {
        console.error('[API Admin Jobs] Erro ao executar job:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
