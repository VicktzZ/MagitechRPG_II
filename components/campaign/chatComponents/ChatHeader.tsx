'use client';

import { memo } from 'react';
import {
    Box,
    Button,
    Chip,
    Paper,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import { Chat, Casino } from '@mui/icons-material';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import CombatActionButton from '../CombatActionButton';
import type { Combat } from '@models';
import { useCampaignContext } from '@contexts';

interface ChatHeaderProps {
    messageCount: number;
    isAdmin: boolean;
    combat?: Combat | null;
    campaignId: string;
    onTestClick: () => void;
}

function ChatHeader({
    messageCount,
    isAdmin,
    combat,
    campaignId,
    onTestClick
}: ChatHeaderProps) {
    const { campaign, charsheets } = useCampaignContext();

    return (
        <Paper 
            elevation={2}
            sx={{
                p: 3,
                bgcolor: 'background.paper',
                color: 'text.primary',
                borderRadius: '0 0 16px 0',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Box position="relative" zIndex={1}>
                <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                    <Box 
                        sx={{
                            p: 1,
                            borderRadius: 2,
                            bgcolor: 'background.raised',
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <Chat sx={{ fontSize: '1.5rem' }} />
                    </Box>
                    <Box flex={1}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                            Chat da Sessão
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Chip 
                                label={`${messageCount} mensagem${messageCount !== 1 ? 's' : ''}`}
                                size="small"
                                sx={{
                                    bgcolor: 'background.raised',
                                    color: 'text.primary',
                                    fontWeight: 600
                                }}
                            />
                        </Stack>
                    </Box>
                </Stack>
                
                {/* Botões de Ação para GMs */}
                {isAdmin && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Tooltip title="Solicitar teste de atributo ou perícia">
                            <Button 
                                variant="contained" 
                                startIcon={<Casino />}
                                onClick={onTestClick}
                                sx={{
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    border: '1px solid',
                                    borderColor: 'primary.main',
                                    fontWeight: 600,
                                    '&:hover': {
                                        bgcolor: 'primary.light'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Solicitar Teste
                            </Button>
                        </Tooltip>
                        
                        {/* Botão de Dano/Cura - só aparece em combate */}
                        <CombatActionButton 
                            campaignId={campaignId}
                            campaignCode={campaign?.campaignCode}
                            combat={combat}
                            charsheets={charsheets}
                        />
                    </Box>
                )}
                
                {/* Indicador de Combate Ativo */}
                {combat?.isActive && (
                    <Chip
                        icon={<SportsKabaddiIcon />}
                        label={`Combate R${combat.round} - ${combat.phase === 'INITIATIVE' ? 'Iniciativa' : 'Ação'}`}
                        sx={{
                            mt: 1,
                            bgcolor: 'error.main',
                            color: 'error.contrastText',
                            fontWeight: 600,
                            '& .MuiChip-icon': { color: 'error.contrastText' }
                        }}
                    />
                )}
            </Box>
        </Paper>
    );
}

export default memo(ChatHeader);
