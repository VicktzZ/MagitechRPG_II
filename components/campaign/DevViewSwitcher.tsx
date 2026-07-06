'use client';

import { useMemo, useState, type ReactElement } from 'react';
import {
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItemButton,
    ListItemText,
    Paper,
    Tooltip,
    Typography
} from '@mui/material';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import AddIcon from '@mui/icons-material/Add';
import { useSnackbar } from 'notistack';
import { useCampaignContext } from '@contexts';
import { useFirestoreRealtime } from '@hooks/useFirestoreRealtime';

interface DevViewSwitcherProps {
    campaignId: string;
    userId: string;
    activeCharsheetId: string | null;
    onChange: (charsheetId: string | null) => void;
}

/**
 * Painel visível SOMENTE em ambiente de desenvolvimento, para o mestre alternar
 * entre a visão de Mestre e a visão de Jogador (usando fichas da própria conta),
 * evitando a necessidade de logar em dois navegadores para testar a campanha.
 */
export default function DevViewSwitcher({ campaignId, userId, activeCharsheetId, onChange }: DevViewSwitcherProps): ReactElement {
    const { enqueueSnackbar } = useSnackbar();
    const { campaign, charsheets } = useCampaignContext();
    const [ pickerOpen, setPickerOpen ] = useState(false);
    const [ busy, setBusy ] = useState(false);

    // Fichas do próprio mestre já anexadas como jogador de teste nesta campanha
    const testCharsheets = useMemo(
        () => charsheets.filter(c => c.userId === userId),
        [ charsheets, userId ]
    );

    // Todas as fichas do mestre, para escolher qual anexar (só busca quando o diálogo abre)
    const { data: ownCharsheets } = useFirestoreRealtime('charsheet', {
        filters: userId ? [ { field: 'userId', operator: '==', value: userId } ] : undefined,
        enabled: !!userId && pickerOpen
    });

    const attachedIds = new Set(campaign.players?.map(p => p.charsheetId));
    const availableToAttach = (ownCharsheets ?? []).filter(c => !attachedIds.has(c.id));

    const attach = async (charsheetId: string) => {
        setBusy(true);
        try {
            const response = await fetch(`/api/campaign/${campaignId}/dev-test-player`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ charsheetId })
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erro ao anexar ficha de teste');
            }
            onChange(charsheetId);
            setPickerOpen(false);
        } catch (error: any) {
            enqueueSnackbar(error.message || 'Erro ao anexar ficha de teste', { variant: 'error' });
        } finally {
            setBusy(false);
        }
    };

    const detach = async (charsheetId: string) => {
        setBusy(true);
        try {
            const response = await fetch(`/api/campaign/${campaignId}/dev-test-player`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ charsheetId })
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erro ao remover ficha de teste');
            }
            if (activeCharsheetId === charsheetId) onChange(null);
        } catch (error: any) {
            enqueueSnackbar(error.message || 'Erro ao remover ficha de teste', { variant: 'error' });
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <Paper
                variant="outlined"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    flexWrap: 'wrap',
                    px: 1.5,
                    py: 1,
                    mb: 2,
                    borderStyle: 'dashed',
                    borderColor: 'warning.main',
                    bgcolor: 'action.hover'
                }}
            >
                <SwitchAccountIcon fontSize="small" color="warning" />
                <Typography variant="caption" fontWeight={700} color="warning.main">
                    MODO DEV — Visualizar como:
                </Typography>
                <Chip
                    label="🛠️ Mestre"
                    size="small"
                    color={!activeCharsheetId ? 'warning' : 'default'}
                    variant={!activeCharsheetId ? 'filled' : 'outlined'}
                    onClick={() => onChange(null)}
                />
                {testCharsheets.map(c => (
                    <Chip
                        key={c.id}
                        label={`🎭 ${c.name}`}
                        size="small"
                        disabled={busy}
                        color={activeCharsheetId === c.id ? 'warning' : 'default'}
                        variant={activeCharsheetId === c.id ? 'filled' : 'outlined'}
                        onClick={() => onChange(c.id)}
                        onDelete={async () => await detach(c.id)}
                    />
                ))}
                <Tooltip title="Anexar uma ficha da sua conta como jogador de teste">
                    <Chip icon={<AddIcon />} label="Anexar ficha" size="small" variant="outlined" onClick={() => setPickerOpen(true)} />
                </Tooltip>
            </Paper>

            <Dialog open={pickerOpen} onClose={() => setPickerOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Anexar ficha de teste</DialogTitle>
                <DialogContent>
                    {availableToAttach.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            Nenhuma ficha disponível para anexar — todas as suas fichas já estão nesta
                            campanha, ou você ainda não criou nenhuma. Crie uma ficha normalmente e volte aqui.
                        </Typography>
                    ) : (
                        <List dense>
                            {availableToAttach.map(c => (
                                <ListItemButton key={c.id} disabled={busy} onClick={async () => await attach(c.id)}>
                                    <ListItemText primary={c.name} secondary={c.class} />
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPickerOpen(false)}>Fechar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
