'use client'

import { useState, type ReactElement } from 'react'
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Paper,
    Tooltip
} from '@mui/material'
import { useSnackbar } from 'notistack'
import { campaignService } from '@services'
import { useCampaignContext } from '@contexts';
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import StickyNote2Icon from '@mui/icons-material/StickyNote2'
import type { Note } from '@models'
import Section from './Section'

// Cartão de nota: a altura vem do conteúdo, entre o mínimo e o máximo (acima disso o texto rola)
const NOTE_MIN_HEIGHT = 96
const NOTE_MAX_HEIGHT = 220

export default function CampaignNotes(): ReactElement {
    const { campaign, isUserGM } = useCampaignContext()
    const { enqueueSnackbar } = useSnackbar()
    const [ noteDialogOpen, setNoteDialogOpen ] = useState(false)
    const [ editingNote, setEditingNote ] = useState<Note | null>(null)
    const [ noteContent, setNoteContent ] = useState('')

    const notes = campaign.notes ?? []

    // Sem nota, o jogador não vê nada; o mestre vê o estado vazio e o botão de criar
    if (notes.length === 0 && !isUserGM) return <></>

    const handleNewNote = () => {
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
            await campaignService.deleteNote(campaign.id, noteId)
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

            if (editingNote) await campaignService.updateNote(campaign.id, editingNote.id, noteContent)
            else await campaignService.createNote(campaign.id, { content: noteContent })

            setNoteDialogOpen(false)
            enqueueSnackbar('Nota salva com sucesso!', { variant: 'success' })
        } catch (error) {
            console.error('Erro ao salvar nota:', error)
            enqueueSnackbar('Erro ao salvar nota', { variant: 'error' })
        }
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Section
                title="Notas da campanha"
                icon={<StickyNote2Icon sx={{ color: 'text.secondary' }} />}
                action={isUserGM ? (
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<NoteAddIcon />}
                        onClick={handleNewNote}
                        sx={{ minHeight: 40 }}
                    >
                        Nova nota
                    </Button>
                ) : undefined}
            >
                {notes.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        Nenhuma nota ainda. Registre pistas e lembretes para os jogadores.
                    </Typography>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', alignItems: 'start', gap: 2 }}>
                        {notes.map((note) => (
                            <Paper
                                key={note.id}
                                variant="outlined"
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minHeight: NOTE_MIN_HEIGHT,
                                    maxHeight: NOTE_MAX_HEIGHT,
                                    bgcolor: 'background.raised',
                                    borderRadius: 2
                                }}
                            >
                                <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2 }}>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                                        {note.content}
                                    </Typography>
                                </Box>
                                {isUserGM && (
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, px: 1, pb: 1 }}>
                                        <Tooltip title="Editar nota">
                                            <IconButton size="small" aria-label="Editar nota" onClick={() => handleEditNote(note)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Excluir nota">
                                            <IconButton size="small" aria-label="Excluir nota" onClick={async () => await handleDeleteNote(note.id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                )}
                            </Paper>
                        ))}
                    </Box>
                )}
            </Section>

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
