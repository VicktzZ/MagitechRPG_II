import { Collection } from 'fireorm';

export type JobStatus = 'running' | 'success' | 'error' | 'scheduled';

export interface JobLog {
    timestamp: string;
    status: JobStatus;
    message: string;
    duration?: number; // em ms
    details?: Record<string, any>;
}

@Collection('jobs')
export class Job {
    id: string; // Nome único do job (ex: 'cleanup-notifications', 'cleanup-messages')
    name: string; // Nome amigável para exibição
    description: string;
    cronExpression: string; // Ex: '0 0 * * *' (todo dia à meia-noite)
    lastRun?: string; // ISO timestamp
    nextRun?: string; // ISO timestamp
    status: JobStatus = 'scheduled';
    lastDuration?: number; // Duração da última execução em ms
    lastError?: string;
    successCount: number = 0;
    errorCount: number = 0;
    logs: JobLog[] = []; // Últimos 10 logs

    constructor(job?: Partial<Job>) {
        Object.assign(this, job);
    }
}
