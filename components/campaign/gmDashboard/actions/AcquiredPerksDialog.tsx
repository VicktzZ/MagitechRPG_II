'use client';

import { Close } from '@mui/icons-material';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import type { ReactElement } from 'react';
import AcquiredPerksList from '../dashboard/AcquiredPerksList';
import { usePlayersWithPerks } from '../dashboard/usePlayersWithPerks';
import { useGMDashboardData } from '../dashboard/useGMDashboardData';

interface AcquiredPerksDialogProps {
    open: boolean;
    onClose: () => void;
}

/**
 * Modal "Vantagens adquiridas" do mestre (menu "Mais ações"): o que cada jogador recebeu na campanha. Vale em qualquer modo de campanha (a oferta de vantagens não é só do Roguelite). As
 * fichas vêm do mesmo contexto do dashboard, então o modal já abre com os dados e acompanha o tempo real.
 */
export default function AcquiredPerksDialog({ open, onClose }: AcquiredPerksDialogProps): ReactElement {
    const { playerCharsheets, isPlayerCharsheetsPending } = useGMDashboardData();
    const players = usePlayersWithPerks(playerCharsheets);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" aria-labelledby="acquired-perks-title">
            <DialogTitle id="acquired-perks-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ flex: 1 }}>Vantagens adquiridas</Box>
                {players.length > 0 && (
                    <Typography component="span" variant="caption" color="text.secondary">
                        {players.length} {players.length === 1 ? 'jogador' : 'jogadores'}
                    </Typography>
                )}
                <IconButton size="small" onClick={onClose} aria-label="Fechar"><Close fontSize="small" /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <AcquiredPerksList players={players} pending={isPlayerCharsheetsPending} />
            </DialogContent>
        </Dialog>
    );
}
