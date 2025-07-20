/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useCampaignCurrentFichaContext } from '@contexts';
import { 
    Box,
    Paper, 
    TextField, 
    Typography,
    Stack,
    Chip,
    useTheme
} from '@mui/material';
import {
    Notes,
    Edit,
    Save
} from '@mui/icons-material';
import { useEffect, useState, type ReactElement } from 'react';
import { grey, blue, green } from '@mui/material/colors';

export default function NotesSection(): ReactElement {
    const { ficha, updateFicha } = useCampaignCurrentFichaContext();
    const theme = useTheme();
    const fichaCopy = { ...ficha };

    const [ notes, setNotes ] = useState(fichaCopy?.anotacoes ?? '');
    const [ isEditing, setIsEditing ] = useState(false);
    const [ wordCount, setWordCount ] = useState(0);
    const [ charCount, setCharCount ] = useState(0);

    useEffect(() => {
        updateFicha({
            ...fichaCopy,
            anotacoes: notes
        });
        
        // Atualiza contadores
        const words = notes.trim() ? notes.trim().split(/\s+/).length : 0;
        const chars = notes.length;
        setWordCount(words);
        setCharCount(chars);
    }, [ notes ]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const newValue = e.target.value;
        setNotes(newValue);
    };

    const handleFocus = () => {
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
    };

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <Paper 
                elevation={2}
                sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(145deg, #1e293b 0%, #334155 100%)'
                        : 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-2px)'
                    }
                }}
            >
                <Stack spacing={3} height="100%">
                    {/* Header */}
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={2}>
                            <Box 
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: grey[100],
                                    border: '2px solid',
                                    borderColor: grey[200]
                                }}
                            >
                                <Notes sx={{ color: grey[700], fontSize: '2rem' }} />
                            </Box>
                            <Box>
                                <Typography 
                                    variant="h5" 
                                    sx={{ 
                                        fontWeight: 700,
                                        color: 'primary.main',
                                        mb: 0.5
                                    }}
                                >
                                    Anotações Pessoais
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {notes.trim() ? 'Suas anotações e lembretes importantes' : 'Adicione suas anotações aqui'}
                                </Typography>
                            </Box>
                        </Box>
                        
                        {/* Status de Edição */}
                        <Box display="flex" alignItems="center" gap={1}>
                            {isEditing ? (
                                <Chip 
                                    icon={<Edit />}
                                    label="Editando"
                                    size="small"
                                    sx={{
                                        bgcolor: blue[100],
                                        color: blue[800],
                                        fontWeight: 600
                                    }}
                                />
                            ) : (
                                <Chip 
                                    icon={<Save />}
                                    label="Salvo"
                                    size="small"
                                    sx={{
                                        bgcolor: green[100],
                                        color: green[800],
                                        fontWeight: 600
                                    }}
                                />
                            )}
                        </Box>
                    </Box>

                    {/* Estatísticas */}
                    <Box 
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-around',
                            p: 2,
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <Stack alignItems="center" spacing={0.5}>
                            <Typography variant="h6" sx={{ color: blue[600], fontWeight: 700 }}>
                                {wordCount}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Palavra{wordCount !== 1 ? 's' : ''}
                            </Typography>
                        </Stack>
                        <Stack alignItems="center" spacing={0.5}>
                            <Typography variant="h6" sx={{ color: green[600], fontWeight: 700 }}>
                                {charCount}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Caractere{charCount !== 1 ? 's' : ''}
                            </Typography>
                        </Stack>
                        <Stack alignItems="center" spacing={0.5}>
                            <Typography variant="h6" sx={{ color: grey[600], fontWeight: 700 }}>
                                {Math.ceil(charCount / 280) || 1}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Página{Math.ceil(charCount / 280) !== 1 ? 's' : ''}
                            </Typography>
                        </Stack>
                    </Box>

                    {/* Campo de Texto */}
                    <Box flex={1}>
                        <TextField
                            fullWidth
                            multiline
                            value={notes}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            placeholder="✍️ Escreva suas anotações aqui...\n\n• Lembretes importantes\n• Estratégias de combate\n• Informações sobre NPCs\n• Pistas e mistérios\n• Objetivos da sessão"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    alignItems: 'flex-start',
                                    padding: 2,
                                    fontSize: '1rem',
                                    lineHeight: 1.6,
                                    '& textarea': {
                                        height: '100% !important',
                                        overflow: 'auto !important',
                                        resize: 'none'
                                    },
                                    '& fieldset': {
                                        borderColor: grey[300],
                                        borderWidth: 2
                                    },
                                    '&:hover fieldset': {
                                        borderColor: blue[400]
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: blue[600],
                                        borderWidth: 2
                                    }
                                }
                            }}
                        />
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
}
