import { jobRepository } from '@repositories';
import { Job, type JobLog } from '@models/entities';

const MAX_LOGS = 10;

/**
 * Calcula a próxima execução baseada em cron expression
 * Implementação simples sem dependência externa
 */
function calculateNextRun(cronExpression: string): string {
    // Parse simples para cron: "minuto hora dia mês diaSemana"
    const parts = cronExpression.split(' ');
    if (parts.length !== 5) return new Date().toISOString();
    
    const [ minute, hour ] = parts;
    const now = new Date();
    const next = new Date();
    
    // Define hora e minuto
    next.setHours(parseInt(hour) || 0, parseInt(minute) || 0, 0, 0);
    
    // Se já passou hoje, agenda para amanhã
    if (next <= now) {
        next.setDate(next.getDate() + 1);
    }
    
    return next.toISOString();
}

/**
 * Remove propriedades undefined de um objeto (Firestore não aceita undefined)
 */
function removeUndefined<T extends Record<string, any>>(obj: T): T {
    const result = { ...obj };
    Object.keys(result).forEach(key => {
        if (result[key] === undefined) {
            delete result[key];
        }
    });
    return result;
}

interface JobConfig {
    id: string;
    name: string;
    description: string;
    cronExpression: string;
}

/**
 * Inicializa ou obtém um job no banco de dados
 */
export async function initializeJob(config: JobConfig): Promise<Job> {
    try {
        let job = await jobRepository.findById(config.id);
        
        if (!job) {
            job = new Job({
                id: config.id,
                name: config.name,
                description: config.description,
                cronExpression: config.cronExpression,
                status: 'scheduled',
                successCount: 0,
                errorCount: 0,
                logs: []
            });
            await jobRepository.create(job);
            console.log(`[JobLogger] Job "${config.name}" inicializado no banco de dados`);
        } else {
            // Atualiza configuração se mudou
            job.name = config.name;
            job.description = config.description;
            job.cronExpression = config.cronExpression;
            const plainJob = JSON.parse(JSON.stringify(job));
            await jobRepository.update(removeUndefined(plainJob));
        }
        
        // Calcula próxima execução
        await updateNextRun(config.id, config.cronExpression);
        
        return job;
    } catch (error) {
        console.error(`[JobLogger] Erro ao inicializar job "${config.name}":`, error);
        throw error;
    }
}

/**
 * Atualiza o timestamp da próxima execução
 */
async function updateNextRun(jobId: string, cronExpression: string): Promise<void> {
    try {
        const nextRun = calculateNextRun(cronExpression);
        
        const job = await jobRepository.findById(jobId);
        if (job) {
            job.nextRun = nextRun;
            const plainJob = JSON.parse(JSON.stringify(job));
            await jobRepository.update(removeUndefined(plainJob));
        }
    } catch (error) {
        console.error('[JobLogger] Erro ao calcular próxima execução:', error);
    }
}

/**
 * Registra o início de uma execução de job
 */
export async function logJobStart(jobId: string): Promise<number> {
    const startTime = Date.now();
    
    try {
        const job = await jobRepository.findById(jobId);
        if (job) {
            job.status = 'running';
            job.lastRun = new Date().toISOString();
            const plainJob = JSON.parse(JSON.stringify(job));
            await jobRepository.update(removeUndefined(plainJob));
        }
    } catch (error) {
        console.error('[JobLogger] Erro ao registrar início do job:', error);
    }
    
    return startTime;
}

/**
 * Registra o sucesso de uma execução de job
 */
export async function logJobSuccess(
    jobId: string, 
    startTime: number, 
    message: string, 
    details?: Record<string, any>
): Promise<void> {
    const duration = Date.now() - startTime;
    
    try {
        const job = await jobRepository.findById(jobId);
        if (job) {
            job.status = 'success';
            job.lastDuration = duration;
            delete (job as any).lastError; // Remove lastError em vez de setar undefined
            job.successCount = (job.successCount || 0) + 1;
            
            // Adiciona log (remove details se undefined)
            const log: JobLog = removeUndefined({
                timestamp: new Date().toISOString(),
                status: 'success',
                message,
                duration,
                details
            }) as JobLog;
            
            job.logs = [ log, ...(job.logs || []).slice(0, MAX_LOGS - 1) ];
            
            const plainJob = JSON.parse(JSON.stringify(job));
            await jobRepository.update(removeUndefined(plainJob));
            
            // Atualiza próxima execução
            await updateNextRun(jobId, job.cronExpression);
            
            console.log(`[JobLogger] Job "${job.name}" concluído com sucesso em ${duration}ms`);
        }
    } catch (error) {
        console.error('[JobLogger] Erro ao registrar sucesso do job:', error);
    }
}

/**
 * Registra erro em uma execução de job
 */
export async function logJobError(
    jobId: string, 
    startTime: number, 
    error: Error | string,
    details?: Record<string, any>
): Promise<void> {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : error;
    
    try {
        const job = await jobRepository.findById(jobId);
        if (job) {
            job.status = 'error';
            job.lastDuration = duration;
            job.lastError = errorMessage;
            job.errorCount = (job.errorCount || 0) + 1;
            
            // Adiciona log (remove details se undefined)
            const log: JobLog = removeUndefined({
                timestamp: new Date().toISOString(),
                status: 'error',
                message: errorMessage,
                duration,
                details
            }) as JobLog;
            
            job.logs = [ log, ...(job.logs || []).slice(0, MAX_LOGS - 1) ];
            
            const plainJob = JSON.parse(JSON.stringify(job));
            await jobRepository.update(removeUndefined(plainJob));
            
            // Atualiza próxima execução
            await updateNextRun(jobId, job.cronExpression);
            
            console.error(`[JobLogger] Job "${job.name}" falhou após ${duration}ms: ${errorMessage}`);
        }
    } catch (err) {
        console.error('[JobLogger] Erro ao registrar falha do job:', err);
    }
}

/**
 * Wrapper para executar uma função de job com logging automático
 */
export async function withJobLogging<T>(
    jobId: string,
    fn: () => Promise<T>,
    successMessage: (result: T) => string,
    details?: (result: T) => Record<string, any>
): Promise<T | null> {
    const startTime = await logJobStart(jobId);
    
    try {
        const result = await fn();
        await logJobSuccess(
            jobId, 
            startTime, 
            successMessage(result),
            details ? details(result) : undefined
        );
        return result;
    } catch (error) {
        await logJobError(jobId, startTime, error as Error);
        return null;
    }
}
