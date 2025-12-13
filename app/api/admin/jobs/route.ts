import { NextResponse } from 'next/server'
import { jobRepository } from '@repositories'

/**
 * GET /api/admin/jobs
 * Retorna lista de todos os jobs e seus status
 */
export async function GET(): Promise<NextResponse> {
    // Verifica se está em ambiente de desenvolvimento
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
            { error: 'Endpoint disponível apenas em ambiente de desenvolvimento' },
            { status: 403 }
        )
    }

    try {
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
        console.error('[API Admin Jobs] Erro ao buscar jobs:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
