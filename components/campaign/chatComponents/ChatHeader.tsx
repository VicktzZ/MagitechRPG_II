'use client';

import {
    Box,
    Button,
    Chip,
    Paper,
    Stack,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material';
import { Chat, Casino } from '@mui/icons-material';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import { red } from '@mui/material/colors';
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

export default function ChatHeader({
    messageCount,
    isAdmin,
    combat,
    campaignId,
    onTestClick
}: ChatHeaderProps) {
    const { campaign, charsheets } = useCampaignContext();
    const theme = useTheme();

    return (
        <Paper 
            elevation={2}
            sx={{
                p: 3,
                background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #1a2332 0%, #2d3748 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '0 0 16px 0',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)'
                }
            }}
        >
            <Box position="relative" zIndex={1}>
                <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                    <Box 
                        sx={{
                            p: 1,
                            borderRadius: 2,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            border: '1px solid rgba(255,255,255,0.3)'
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
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
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
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    fontWeight: 600,
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.3)',
                                        transform: 'translateY(-1px)',
                                        boxShadow: 3
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
                            combat={combat as any}
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
                            bgcolor: red[500],
                            color: 'white',
                            fontWeight: 600,
                            '& .MuiChip-icon': { color: 'white' }
                        }}
                    />
                )}
            </Box>
        </Paper>
    );
}
