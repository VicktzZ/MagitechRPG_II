'use client';

import type { Combat } from '@models';
import { Box, Typography } from '@mui/material';
import type { ReactElement } from 'react';
import CombatHistoryPanel from '../actions/combat/CombatHistoryPanel';
import CombatLogList from './CombatLogList';

interface HistoryTabProps {
    campaignId: string;
    combat: Combat;
}

function SectionTitle({ children }: { children: string }): ReactElement {
    return <Typography component="h3" sx={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', mb: 0.75 }}>
        {children}
    </Typography>
}

/** O registro do combate (o que o chat também mostra) e o histórico com "Desfazer" */
export default function HistoryTab({ campaignId, combat }: HistoryTabProps): ReactElement {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
                <SectionTitle>Registro</SectionTitle>
                <CombatLogList logs={combat.logs} />
            </Box>
            <Box>
                <SectionTitle>Desfazer</SectionTitle>
                <CombatHistoryPanel
                    campaignId={campaignId}
                    signature={`${combat.isActive}|${combat.round}|${combat.logs?.length ?? 0}`}
                    onChanged={() => undefined}
                    defaultOpen
                    flush
                />
            </Box>
        </Box>
    );
}
