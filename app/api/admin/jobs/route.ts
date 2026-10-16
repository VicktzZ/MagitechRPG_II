import { NextResponse, type NextRequest } from 'next/server'
import { jobRepository } from '@repositories'
import { handleRouteError, requireAdminOrApiKey } from '@utils/api'

/**
 * GET /api/admin/jobs
 * Retorna lista de todos os jobs e seus status
 */
export async function GET(request: NextRequest): Promise<Response> {
    // Verifica se está em ambiente de desenvolvimento
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
            { error: 'Endpoint disponível apenas em ambiente de desenvolvimento' },
            { status: 403 }
        )
    }

    try {
        await requireAdminOrApiKey(request)
        const jobs = await jobRepository.find()
        
        // Calcula tempo restante para próxima execução
        const jobsWithTimeRemaining = jobs.map(job => {
            let timeRemaining: string | null = null
            
            if (job.nextRun) {
                const nextRunDate = new Date(job.nextRun)
                const now = new Date()
                const diffMs = nextRunDate.getTime() - now.getTime()
                
                if (diffMs > 0) {
                    const hours = Math.floor(diffMs / (1000 * 60 * 60))
                    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
                    timeRemaining = `${hours}h ${minutes}m`
                } else {
                    timeRemaining = 'Aguardando execução'
                }
            }
            
            return {
                ...job,
                timeRemaining
            }
        })

        return NextResponse.json({
            success: true,
            jobs: jobsWithTimeRemaining,
            count: jobs.length
        })

    } catch (error) {
        return handleRouteError(error, 'Erro ao buscar jobs')
    }
}
