'use client';

import { Grid, Paper, TextField, Typography } from '@mui/material';
import type { Ficha } from '@types';
import { useCallback, useEffect, useState, type ReactElement } from 'react';

interface NotesSectionProps {
    ficha: Ficha;
    onNotesChange: (notes: string) => void;
}

export default function NotesSection({ ficha, onNotesChange }: NotesSectionProps): ReactElement {
    const [ notes, setNotes ] = useState(ficha.anotacoes ?? '');

    // Atualiza o estado local quando a ficha mudar
    useEffect(() => {
        setNotes(ficha.anotacoes ?? '');
    }, [ ficha.anotacoes ]);

    // Debounce para evitar chamadas excessivas ao componente pai
    const debouncedOnChange = useCallback((value: string) => {
        const timeoutId = setTimeout(() => {
            onNotesChange(value);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [ onNotesChange ]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const newValue = e.target.value;
        setNotes(newValue);
        debouncedOnChange(newValue);
    };

    return (
        <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Anotações
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={notes}
                    onChange={handleChange}
                />
            </Paper>
        </Grid>
    );
}
