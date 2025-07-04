/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useCampaignCurrentFichaContext } from '@contexts';
import { Grid, Paper, TextField, Typography } from '@mui/material';
import { useEffect, useState, type ReactElement } from 'react';

export default function NotesSection(): ReactElement {
    const { ficha, updateFicha } = useCampaignCurrentFichaContext();
    const fichaCopy = { ...ficha };

    const [ notes, setNotes ] = useState(fichaCopy?.anotacoes ?? '');

    useEffect(() => {
        updateFicha({
            ...fichaCopy,
            anotacoes: notes
        });
    }, [ notes ]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const newValue = e.target.value;
        setNotes(newValue);
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
