/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useCampaignContext } from '@contexts';
import { Grid, Paper, TextField, Typography } from '@mui/material';
import { useCallback, useEffect, useState, type ReactElement } from 'react';

export default function NotesSection(): ReactElement {
    const { campaign: { myFicha: ficha }, setFichaUpdated } = useCampaignContext()
    if (!ficha) return <></>;

    const [ notes, setNotes ] = useState(ficha.anotacoes ?? '');

    useEffect(() => {
        setNotes(ficha.anotacoes ?? '');
    }, [ ficha.anotacoes ]);

    const onChange = useCallback((value: string) => {
        ficha.anotacoes = value;
        setFichaUpdated(true);
    }, [ ficha, setFichaUpdated ]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const newValue = e.target.value;
        setNotes(newValue);
        onChange(newValue);
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
