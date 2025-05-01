/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useCampaignContext } from '@contexts/campaignContext';
import { Grid, Paper, TextField, Typography } from '@mui/material';
import { useCallback, useEffect, useState, type ReactElement } from 'react';

interface NotesSectionProps {
    onNotesChange: (notes: string) => void;
}

export default function NotesSection({ onNotesChange }: NotesSectionProps): ReactElement {
    const { campaign: { myFicha: ficha } } = useCampaignContext()
    if (!ficha) return <></>;

    const [ notes, setNotes ] = useState(ficha.anotacoes ?? '');

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
