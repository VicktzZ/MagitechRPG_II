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
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RefreshIcon from '@mui/icons-material/Refresh'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import PublicIcon from '@mui/icons-material/Public'
import LockIcon from '@mui/icons-material/Lock'
import { green, grey } from '@mui/material/colors'
import { useSnackbar } from 'notistack'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import type { RPGSystem } from '@models/entities'

export default function AdminSystemsPage() {
    const [ systems, setSystems ] = useState<RPGSystem[]>([])
    const [ loading, setLoading ] = useState(true)
    const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false)
    const [ duplicateDialogOpen, setDuplicateDialogOpen ] = useState(false)
    const [ selectedSystem, setSelectedSystem ] = useState<RPGSystem | null>(null)
    const [ newSystemName, setNewSystemName ] = useState('')
    const { enqueueSnackbar } = useSnackbar()
    const router = useRouter()
    const { data: session } = useSession()

    const fetchSystems = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/rpg-system')
            const data = await response.json()
            setSystems(data)
        } catch (error) {
            console.error('Erro ao buscar sistemas:', error)
            enqueueSnackbar('Erro ao carregar sistemas', { variant: 'error' })
        } finally {
            setLoading(false)
        }
    }, [ enqueueSnackbar ])

    useEffect(() => {
        fetchSystems()
    }, [ fetchSystems ])

    const handleDelete = async () => {
        if (!selectedSystem) return

        try {
            const response = await fetch(`/api/rpg-system/${selectedSystem.id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                enqueueSnackbar('Sistema deletado com sucesso', { variant: 'success' })
                fetchSystems()
            } else {
                const data = await response.json()
                enqueueSnackbar(data.error || 'Erro ao deletar sistema', { variant: 'error' })
            }
        } catch (error) {
            console.error('Erro ao deletar sistema:', error)
            enqueueSnackbar('Erro ao deletar sistema', { variant: 'error' })
        } finally {
            setDeleteDialogOpen(false)
            setSelectedSystem(null)
        }
    }

    const handleDuplicate = async () => {
        if (!selectedSystem || !newSystemName.trim()) return

        try {
            const response = await fetch(`/api/rpg-system/${selectedSystem.id}/duplicate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: newSystemName, 
                    creatorId: session?.user?.id 
                })
            })

            if (response.ok) {
                enqueueSnackbar('Sistema duplicado com sucesso', { variant: 'success' })
                fetchSystems()
            } else {
                const data = await response.json()
                enqueueSnackbar(data.error || 'Erro ao duplicar sistema', { variant: 'error' })
            }
        } catch (error) {
            console.error('Erro ao duplicar sistema:', error)
            enqueueSnackbar('Erro ao duplicar sistema', { variant: 'error' })
        } finally {
            setDuplicateDialogOpen(false)
            setSelectedSystem(null)
            setNewSystemName('')
        }
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleString('pt-BR')
    }

    return (
        <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        ⚙️ Sistemas de RPG
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Gerencie os sistemas de RPG customizados da plataforma
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                        onClick={fetchSystems}
                        disabled={loading}
                    >
                        Atualizar
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => router.push('/admin/systems/create')}
                    >
                        Novo Sistema
                    </Button>
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : systems.length === 0 ? (
                <Alert severity="info">
                    Nenhum sistema de RPG cadastrado. Clique em &quot;Novo Sistema&quot; para criar o primeiro!
                </Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'background.paper' }}>
                                <TableCell><strong>Nome</strong></TableCell>
                                <TableCell><strong>Descrição</strong></TableCell>
                                <TableCell><strong>Visibilidade</strong></TableCell>
                                <TableCell><strong>Atributos</strong></TableCell>
                                <TableCell><strong>Perícias</strong></TableCell>
                                <TableCell><strong>Classes</strong></TableCell>
                                <TableCell><strong>Magias</strong></TableCell>
                                <TableCell><strong>Criado em</strong></TableCell>
                                <TableCell align="center"><strong>Ações</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {systems.map((system) => (
                                <TableRow key={system.id} hover>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            {system.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            sx={{ 
                                                maxWidth: 200, 
                                                overflow: 'hidden', 
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {system.description || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={system.isPublic ? <PublicIcon /> : <LockIcon />}
                                            label={system.isPublic ? 'Público' : 'Privado'}
                                            size="small"
                                            sx={{
                                                bgcolor: system.isPublic ? `${green[500]}20` : `${grey[500]}20`,
                                                color: system.isPublic ? green[700] : grey[700]
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={system.attributes?.length || 0} size="small" />
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={system.expertises?.length || 0} size="small" />
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={system.classes?.length || 0} size="small" />
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={system.spells?.length || 0} size="small" color="secondary" />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption">
                                            {formatDate(system.createdAt)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Editar">
                                            <IconButton
                                                color="primary"
                                                onClick={() => router.push(`/admin/systems/${system.id}`)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Duplicar">
                                            <IconButton
                                                color="info"
                                                onClick={() => {
                                                    setSelectedSystem(system)
                                                    setNewSystemName(`${system.name} (Cópia)`)
                                                    setDuplicateDialogOpen(true)
                                                }}
                                            >
                                                <ContentCopyIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Deletar">
                                            <IconButton
                                                color="error"
                                                onClick={() => {
                                                    setSelectedSystem(system)
                                                    setDeleteDialogOpen(true)
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogContent>
                    <Typography>
                        Tem certeza que deseja excluir o sistema <strong>{selectedSystem?.name}</strong>?
                    </Typography>
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        Esta ação não pode ser desfeita. Campanhas e fichas que usam este sistema podem ser afetadas.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Excluir
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Duplicate Dialog */}
            <Dialog open={duplicateDialogOpen} onClose={() => setDuplicateDialogOpen(false)}>
                <DialogTitle>Duplicar Sistema</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        Digite o nome para a cópia do sistema <strong>{selectedSystem?.name}</strong>:
                    </Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Nome do novo sistema"
                        value={newSystemName}
                        onChange={(e) => setNewSystemName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDuplicateDialogOpen(false)}>Cancelar</Button>
                    <Button 
                        onClick={handleDuplicate} 
                        color="primary" 
                        variant="contained"
                        disabled={!newSystemName.trim()}
                    >
                        Duplicar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
