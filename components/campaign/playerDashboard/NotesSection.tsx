/* eslint-disable max-len */
/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useCampaignCurrentCharsheetContext } from '@contexts';
import {
    Edit,
    Notes,
    Save
} from '@mui/icons-material';
import {
    alpha,
    Box,
    Chip,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { color } from '@themes/tokens';
import { useState, type ReactElement } from 'react';

export default function NotesSection(): ReactElement {
    const { charsheet, updateCharsheet } = useCampaignCurrentCharsheetContext();

    const [ notes, setNotes ] = useState(charsheet?.anotacoes ?? '');
    const [ isEditing, setIsEditing ] = useState(false);
    
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const newValue = e.target.value;
        setNotes(newValue);
    };

    const handleFocus = () => {
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (charsheet) {
            updateCharsheet({ anotacoes: notes });
        }
    };

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <Paper 
                elevation={2}
                sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
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
                                    bgcolor: 'background.raised',
                                    border: '2px solid',
                                    borderColor: 'divider'
                                }}
                            >
                                <Notes sx={{ color: 'text.secondary', fontSize: '2rem' }} />
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
                                        bgcolor: (theme) => alpha(theme.palette.info.main, 0.14),
                                        color: 'info.main',
                                        fontWeight: 600,
                                        '& .MuiChip-icon': { color: 'inherit' }
                                    }}
                                />
                            ) : (
                                <Chip 
                                    icon={<Save />}
                                    label="Salvo"
                                    size="small"
                                    sx={{
                                        bgcolor: (theme) => alpha(theme.palette.success.main, 0.14),
                                        color: 'success.main',
                                        fontWeight: 600,
                                        '& .MuiChip-icon': { color: 'inherit' }
                                    }}
                                />
                            )}
                        </Box>
                    </Box>

                    {/* Campo de Texto */}
                    <Box flex={1}>
                        <TextField
                            fullWidth
                            multiline
                            rows={20}
                            value={notes}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            placeholder={'✍️ Escreva suas anotações aqui...\n\n• Lembretes importantes\n• Estratégias de combate\n• Informações sobre NPCs\n• Pistas e mistérios\n• Objetivos da sessão'}
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
                                        borderColor: color.borderControl,
                                        borderWidth: 2
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'text.secondary'
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'primary.main',
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
