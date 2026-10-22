/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useCampaignCurrentCharsheetContext } from '@contexts';
import { Edit, Save } from '@mui/icons-material';
import { alpha, Box, Chip, TextField, Typography } from '@mui/material';
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

    // A moldura e o título vêm do Section da campanha: aqui só o estado de gravação e o campo
    return (
        <Box sx={{ width: '100%' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} mb={1.5}>
                <Typography variant="body2" color="text.secondary">
                    {notes.trim() ? 'Suas anotações e lembretes importantes' : 'Adicione suas anotações aqui'}
                </Typography>
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

            <TextField
                fullWidth
                multiline
                minRows={10}
                maxRows={24}
                value={notes}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={'Escreva suas anotações aqui...\n\n• Lembretes importantes\n• Estratégias de combate\n• Informações sobre NPCs\n• Pistas e mistérios\n• Objetivos da sessão'}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        alignItems: 'flex-start',
                        padding: 2,
                        lineHeight: 1.6,
                        '& fieldset': { borderColor: color.borderControl },
                        '&:hover fieldset': { borderColor: 'text.secondary' },
                        '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                    }
                }}
            />
        </Box>
    );
}
