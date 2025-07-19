'use client'

import { useState, type ReactElement } from 'react'
import {
    Box,
    Paper,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Card,
    CardContent,
    CardActions
} from '@mui/material'
import { useSnackbar } from 'notistack'
import { campaignService } from '@services'
import { useCampaignContext } from '@contexts';
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import type { Note } from '@types'

const NOTE_HEIGHT = 200 // Altura padrão para as notas em pixels

export default function CampaignNotes(): ReactElement {
    const { campaign, isUserGM } = useCampaignContext()
    const { enqueueSnackbar } = useSnackbar()
    const [ noteDialogOpen, setNoteDialogOpen ] = useState(false)
    const [ editingNote, setEditingNote ] = useState<Note | null>(null)
    const [ noteContent, setNoteContent ] = useState('')

    const handleAddNote = () => {
        setEditingNote(null)
        setNoteContent('')
        setNoteDialogOpen(true)
    }

    const handleEditNote = (note: Note) => {
        setEditingNote(note)
        setNoteContent(note.content)
        setNoteDialogOpen(true)
    }

    const handleDeleteNote = async (noteId: string) => {
        try {
            await campaignService.deleteNote(campaign._id!, noteId)
            enqueueSnackbar('Nota excluída com sucesso!', { variant: 'success' })
        } catch (error) {
            console.error('Erro ao deletar nota:', error)
            enqueueSnackbar('Erro ao excluir nota', { variant: 'error' })
        }
    }

    const handleSaveNote = async () => {
        try {
            if (!noteContent) {
                enqueueSnackbar('Conteúdo da nota é obrigatório', { variant: 'error' })
                return
            }

            if (editingNote) {
                await campaignService.updateNote(campaign._id!, editingNote._id!, noteContent)
            } else {
                const newNote: Note = {
                    content: noteContent,
                    timestamp: new Date()
                }
                await campaignService.createNote(campaign._id!, newNote)
            }

            setNoteDialogOpen(false)
            enqueueSnackbar('Nota salva com sucesso!', { variant: 'success' })
        } catch (error) {
            console.error('Erro ao salvar nota:', error)
            enqueueSnackbar('Erro ao salvar nota', { variant: 'error' })
        }
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                {isUserGM && (
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleAddNote}
                    >
                        Nova Nota
                    </Button>
                )}
            </Box>

            <Paper sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, mb: 2 }}>
                <Typography variant="h6">Notas da Campanha</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
                    {campaign.notes.length === 0 && (
                        <Typography variant="body1">A campanha não possui nenhuma nota.</Typography>
                    )}
                    {campaign.notes.map((note) => (
                        <Card 
                            key={note._id} 
                            sx={{ 
                                height: NOTE_HEIGHT, 
                                display: 'flex', 
                                flexDirection: 'column',
                                bgcolor: 'background.paper3'
                            }}
                        >
                            <CardContent 
                                sx={{ 
                                    flexGrow: 1,
                                    overflow: 'auto',
                                    '&::-webkit-scrollbar': {
                                        width: '8px'
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        backgroundColor: 'background.paper'
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: 'primary.main',
                                        borderRadius: '4px'
                                    }
                                }}
                            >
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {note.content}
                                </Typography>
                            </CardContent>
                            {isUserGM && (
                                <CardActions>
                                    <IconButton size="small" onClick={() => handleEditNote(note)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton size="small" onClick={async () => await handleDeleteNote(note._id!)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </CardActions>
                            )}
                        </Card>
                    ))}
                </Box>
            </Paper>

            <Dialog 
                open={noteDialogOpen} 
                onClose={() => setNoteDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {editingNote ? 'Editar Nota' : 'Nova Nota'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Conteúdo"
                            multiline
                            rows={4}
                            fullWidth
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNoteDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSaveNote} variant="contained" color="primary">
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
