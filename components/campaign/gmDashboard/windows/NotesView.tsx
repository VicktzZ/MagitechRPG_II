'use client';

import { Alert, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { TEXT_LIMITS } from '@utils/api/input';
import { NOTE_STATUS_LABEL, type NoteStatus } from '@utils/gmNoteDraft';
import type { ReactElement } from 'react';

interface NotesViewProps {
    charsheetName: string;
    value: string;
    status: NoteStatus;
    /** Ainda lendo o que está salvo: o campo fica travado para não gravar por cima de algo que não chegou */
    loading: boolean;
    /** Não deu para ler o que está salvo: o campo fica travado pelo mesmo motivo */
    loadError: boolean;
    onChange: (value: string) => void;
    onRetry: () => void;
}

/** A anotação em si: campo de texto, aviso de que só o mestre vê e o estado do salvamento */
export function NotesView({ charsheetName, value, status, loading, loadError, onChange, onRetry }: NotesViewProps): ReactElement {
    return (
        <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
                Só o mestre vê estas anotações. O jogador não tem acesso a elas, nem pela ficha.
            </Typography>

            {loadError && (
                <Alert severity="error">Não foi possível carregar as anotações. Recarregue a página; nada foi alterado.</Alert>
            )}

            <TextField
                multiline
                minRows={10}
                fullWidth
                value={value}
                disabled={loading || loadError}
                placeholder={loading ? 'Carregando…' : `Segredos, ganchos e lembretes sobre ${charsheetName}`}
                onChange={event => onChange(event.target.value)}
                inputProps={{ maxLength: TEXT_LIMITS.note, 'aria-label': `Anotações privadas sobre ${charsheetName}` }}
            />

            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1} role="status" aria-live="polite">
                    {status === 'saving' && <CircularProgress size={14} />}
                    <Typography variant="body2" color={status === 'error' ? 'error.light' : 'text.secondary'}>
                        {NOTE_STATUS_LABEL[status]}
                    </Typography>
                    {status === 'error' && (
                        <Button size="small" onClick={onRetry}>Tentar de novo</Button>
                    )}
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {value.length} / {TEXT_LIMITS.note}
                </Typography>
            </Stack>
        </Stack>
    );
}
