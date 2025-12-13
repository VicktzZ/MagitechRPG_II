'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Alert,
    Divider
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import RefreshIcon from '@mui/icons-material/Refresh'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ScheduleIcon from '@mui/icons-material/Schedule'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import { green, red, blue, grey } from '@mui/material/colors'
import { useSnackbar } from 'notistack'

interface JobLog {
    timestamp: string
    status: 'running' | 'success' | 'error' | 'scheduled'
    message: string
    duration?: number
    details?: Record<string, any>
}

interface Job {
    id: string
    name: string
    description: string
    cronExpression: string
    lastRun?: string
    nextRun?: string
    status: 'running' | 'success' | 'error' | 'scheduled'
    lastDuration?: number
    lastError?: string
    successCount: number
    errorCount: number
    logs: JobLog[]
    timeRemaining?: string
}

const statusConfig = {
    running: { color: blue[500], icon: <HourglassEmptyIcon />, label: 'Executando' },
    success: { color: green[500], icon: <CheckCircleIcon />, label: 'Sucesso' },
    error: { color: red[500], icon: <ErrorIcon />, label: 'Erro' },
    scheduled: { color: grey[500], icon: <ScheduleIcon />, label: 'Agendado' }
}

export default function AdminJobsPage() {
    const [ jobs, setJobs ] = useState<Job[]>([])
    const [ loading, setLoading ] = useState(true)
    const [ runningJobs, setRunningJobs ] = useState<Set<string>>(new Set())
    const { enqueueSnackbar } = useSnackbar()

    const fetchJobs = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/jobs')
            const data = await response.json()

            if (data.success) {
                setJobs(data.jobs)
            } else {
                enqueueSnackbar(data.error || 'Erro ao carregar jobs', { variant: 'error' })
            }
        } catch (error) {
            console.error('Erro ao buscar jobs:', error)
            enqueueSnackbar('Erro ao carregar jobs', { variant: 'error' })
        } finally {
            setLoading(false)
        }
    }, [ enqueueSnackbar ])

    useEffect(() => {
        fetchJobs()
        
        // Atualiza a cada 30 segundos
        const interval = setInterval(fetchJobs, 30000)
        return () => clearInterval(interval)
    }, [ fetchJobs ])

    const handleRunJob = async (jobId: string) => {
        setRunningJobs(prev => new Set(prev).add(jobId))

        try {
            const response = await fetch(`/api/admin/jobs/${jobId}/run`, {
                method: 'POST'
            })
            const data = await response.json()

            if (data.success) {
                enqueueSnackbar(data.message, { variant: 'success' })
                // Aguarda um pouco e atualiza a lista
                setTimeout(fetchJobs, 2000)
            } else {
                enqueueSnackbar(data.error || 'Erro ao executar job', { variant: 'error' })
            }
        } catch (error) {
            console.error('Erro ao executar job:', error)
            enqueueSnackbar('Erro ao executar job', { variant: 'error' })
        } finally {
            setRunningJobs(prev => {
                const next = new Set(prev)
                next.delete(jobId)
                return next
            })
        }
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleString('pt-BR')
    }

    const formatDuration = (ms?: number) => {
        if (!ms) return '-'
        if (ms < 1000) return `${ms}ms`
        return `${(ms / 1000).toFixed(2)}s`
    }

    if (process.env.NODE_ENV !== 'development') {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">
                    Esta página está disponível apenas em ambiente de desenvolvimento.
                </Alert>
            </Box>
        )
    }

    return (
        <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        🔧 Admin: Jobs
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Monitoramento e gerenciamento de jobs da aplicação
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                    onClick={fetchJobs}
                    disabled={loading}
                >
                    Atualizar
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : jobs.length === 0 ? (
                <Alert severity="info">
                    Nenhum job registrado. Os jobs serão registrados quando a aplicação iniciar.
                </Alert>
            ) : (
                <TableContainer component={Paper} sx={{ mb: 4 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'background.paper' }}>
                                <TableCell><strong>Job</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell><strong>Última Execução</strong></TableCell>
                                <TableCell><strong>Próxima Execução</strong></TableCell>
                                <TableCell><strong>Duração</strong></TableCell>
                                <TableCell align="center"><strong>Sucesso / Erro</strong></TableCell>
                                <TableCell align="center"><strong>Ações</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {jobs.map((job) => {
                                const config = statusConfig[job.status]
                                const isRunning = runningJobs.has(job.id) || job.status === 'running'

                                return (
                                    <TableRow key={job.id} hover>
                                        <TableCell>
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                {job.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {job.description}
                                            </Typography>
                                            <Typography variant="caption" display="block" sx={{ mt: 0.5, fontFamily: 'monospace' }}>
                                                Cron: {job.cronExpression}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={config.icon}
                                                label={config.label}
                                                size="small"
                                                sx={{
                                                    bgcolor: `${config.color}20`,
                                                    color: config.color,
                                                    fontWeight: 600
                                                }}
                                            />
                                            {job.lastError && job.status === 'error' && (
                                                <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
                                                    {job.lastError}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(job.lastRun)}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(job.nextRun)}
                                            {job.timeRemaining && (
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    em {job.timeRemaining}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {formatDuration(job.lastDuration)}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={job.successCount}
                                                size="small"
                                                sx={{ bgcolor: green[100], color: green[800], mr: 1 }}
                                            />
                                            <Chip
                                                label={job.errorCount}
                                                size="small"
                                                sx={{ bgcolor: red[100], color: red[800] }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Executar agora">
                                                <span>
                                                    <IconButton
                                                        color="primary"
                                                        onClick={async () => await handleRunJob(job.id)}
                                                        disabled={isRunning}
                                                    >
                                                        {isRunning ? (
                                                            <CircularProgress size={24} />
                                                        ) : (
                                                            <PlayArrowIcon />
                                                        )}
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Logs Section */}
            {jobs.map((job) => (
                job.logs && job.logs.length > 0 && (
                    <Accordion key={`logs-${job.id}`} sx={{ mb: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={600}>
                                📋 Logs: {job.name}
                            </Typography>
                            <Chip
                                label={`${job.logs.length} registros`}
                                size="small"
                                sx={{ ml: 2 }}
                            />
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                                {job.logs.map((log, idx) => {
                                    const logConfig = statusConfig[log.status]
                                    return (
                                        <Box key={idx} sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                <Chip
                                                    icon={logConfig.icon}
                                                    label={logConfig.label}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: `${logConfig.color}20`,
                                                        color: logConfig.color,
                                                        '& .MuiChip-icon': { color: logConfig.color }
                                                    }}
                                                />
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDate(log.timestamp)}
                                                </Typography>
                                                {log.duration && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        • {formatDuration(log.duration)}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Typography variant="body2" sx={{ ml: 1 }}>
                                                {log.message}
                                            </Typography>
                                            {log.details && (
                                                <Typography 
                                                    variant="caption" 
                                                    component="pre"
                                                    sx={{ 
                                                        ml: 1, 
                                                        mt: 0.5, 
                                                        p: 1, 
                                                        bgcolor: 'background.paper', 
                                                        borderRadius: 1,
                                                        fontFamily: 'monospace',
                                                        fontSize: '0.75rem',
                                                        overflow: 'auto'
                                                    }}
                                                >
                                                    {JSON.stringify(log.details, null, 2)}
                                                </Typography>
                                            )}
                                            {idx < job.logs.length - 1 && <Divider sx={{ mt: 2 }} />}
                                        </Box>
                                    )
                                })}
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                )
            ))}
        </Box>
    )
}
