import { useState, type ReactElement } from 'react';
import { alpha, Box, Button, Chip, Collapse, Paper, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssignmentIcon from '@mui/icons-material/Assignment';
import type { CampaignWidget } from '@models';
import { bountyStatusConfig } from './panelConfig';

interface BountiesSectionProps {
    widget: CampaignWidget;
    isUserGM: boolean;
    isFinished: boolean;
    /** O usuário tem uma ficha na campanha (pode reivindicar tarefas) */
    hasCharsheet: boolean;
    onClaimBounty: (bountyId: string) => Promise<void>;
    onApproveBounty: (bountyId: string) => Promise<void>;
}

/** Tarefas/contratos (beta) — jogadores reivindicam, o mestre aprova e libera a recompensa */
export default function BountiesSection({
    widget, isUserGM, isFinished, hasCharsheet, onClaimBounty, onApproveBounty
}: BountiesSectionProps): ReactElement | null {
    const [ bountiesOpen, setBountiesOpen ] = useState(false);

    if ((widget.bounties?.length ?? 0) === 0) return null;

    return (
        <Box>
            <Box
                display="flex" alignItems="center" gap={0.5}
                sx={{ cursor: 'pointer', width: 'fit-content' }}
                onClick={() => setBountiesOpen(prev => !prev)}
            >
                <AssignmentIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    Tarefas ({widget.bounties.length})
                </Typography>
                <Chip label="BETA" size="small" color="secondary" sx={{ height: 16, fontSize: '0.75rem', fontWeight: 700 }} />
                <ExpandMoreIcon
                    sx={{ fontSize: 14, color: 'text.secondary', transform: bountiesOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                />
            </Box>
            <Collapse in={bountiesOpen}>
                <Box display="flex" flexDirection="column" gap={0.75} mt={0.75}>
                    {widget.bounties.map(bounty => {
                        const statusCfg = bountyStatusConfig[bounty.status];
                        const rewardResource = widget.resources.find(r => r.id === bounty.rewardResourceId);
                        const rewardParts = [
                            bounty.rewardText,
                            rewardResource ? `${bounty.rewardAmount ?? 0} ${rewardResource.name}` : null
                        ].filter(Boolean);
                        return (
                            <Paper key={bounty.id} variant="outlined" sx={{ p: 1 }}>
                                <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                                    <Typography variant="caption" fontWeight={700}>{bounty.title}</Typography>
                                    <Chip
                                        label={statusCfg.label}
                                        size="small"
                                        sx={{ height: 16, fontSize: '0.75rem', fontWeight: 700, bgcolor: alpha(statusCfg.color, 0.15), color: statusCfg.color }}
                                    />
                                </Box>
                                {bounty.description && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        {bounty.description}
                                    </Typography>
                                )}
                                {rewardParts.length > 0 && (
                                    <Typography variant="caption" color="text.secondary" fontStyle="italic" display="block">
                                        Recompensa: {rewardParts.join(' + ')}
                                    </Typography>
                                )}
                                {bounty.status !== 'open' && bounty.claimedByName && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Reivindicada por {bounty.claimedByName}
                                    </Typography>
                                )}
                                <Box display="flex" gap={0.5} mt={0.5} justifyContent="flex-end">
                                    {bounty.status === 'open' && hasCharsheet && !isFinished && (
                                        <Button size="small" variant="outlined" onClick={async () => await onClaimBounty(bounty.id)}>
                                            Cumprir
                                        </Button>
                                    )}
                                    {bounty.status === 'pending' && isUserGM && !isFinished && (
                                        <Button size="small" variant="contained" onClick={async () => await onApproveBounty(bounty.id)}>
                                            Aprovar
                                        </Button>
                                    )}
                                </Box>
                            </Paper>
                        );
                    })}
                </Box>
            </Collapse>
        </Box>
    );
}
