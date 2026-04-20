'use client';

import {
    ArrowForward,
    Delete,
    Group,
    Person,
    Shield,
    Campaign as CampaignIcon    
} from '@mui/icons-material';
import {
    Avatar,
    Box,
    Card,
    Chip,
    Divider,
    IconButton,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { type ReactElement, useState } from 'react';
import { DeleteCampaignModal } from './DeleteCampaignModal';

interface CampaingCardProps {
    id: string;
    title: string;
    description: string;
    gameMaster: string[];
    playersQtd: number;
    code: string;
}

export default function CampaingCard({
    id,
    title,
    description,
    gameMaster,
    playersQtd,
    code
}: CampaingCardProps): ReactElement {
    const { data: session } = useSession();
    const userIsGM = gameMaster?.includes?.(session?.user.id ?? '');
    const router = useRouter();
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));
    const [ isDeleteModalOpen, setIsDeleteModalOpen ] = useState(false);
    
    const handleCardClick = (e: React.MouseEvent): void => {
        if (e.target instanceof HTMLButtonElement || e.target instanceof SVGElement) return;
        router.push(`/app/campaign/${code}`);
    };
    
    return (
        <>
            <Card
                onClick={handleCardClick}
                sx={{
                    position: 'relative',
                    height: !matches ? 290 : 320,
                    width: !matches ? 320 : '100%',
                    maxWidth: 360,
                    borderRadius: 3,
                    background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(160deg, #1a2234 0%, #2a3441 100%)'
                        : 'linear-gradient(160deg, #f8fafc 0%, #edf2f7 100%)',
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    boxShadow: theme.palette.mode === 'dark' 
                        ? '0 8px 16px rgba(0,0,0,0.3)'
                        : '0 8px 16px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    overflow: 'hidden',
                    '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: theme.palette.mode === 'dark'
                            ? '0 12px 20px rgba(0,0,0,0.4)'
                            : '0 12px 20px rgba(0,0,0,0.12)',
                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
                    },
                    '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: userIsGM ? theme.palette.primary.main : theme.palette.secondary.main,
                        opacity: 0.9
                    }
                }}
            >
                <Stack spacing={1} sx={{ p: 2.5, height: '100%' }}>
                    {/* Header com Avatar e Nome */}
                    <Box display='flex' alignItems='center' gap={2}>
                        <Avatar
                            sx={{
                                width: 46,
                                height: 46,
                                bgcolor: userIsGM ? 'primary.main' : 'secondary.main',
                                fontSize: '1.2rem',
                                fontWeight: 700
                            }}
                        >
                            <CampaignIcon />
                        </Avatar>
                        <Box flex={1} minWidth={0}>
                            <Typography 
                                variant='h6' 
                                sx={{ 
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                    lineHeight: 1.3,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {title}
                            </Typography>
                            <Typography 
                                variant='body2' 
                                color='text.secondary'
                                sx={{
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    opacity: 0.8
                                }}
                            >
                                Código: {code}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Status Badge */}
                    <Box display='flex' justifyContent='flex-start' mb={1}>
                        <Chip
                            icon={userIsGM ? <Shield sx={{ fontSize: '0.9rem' }} /> : <Person sx={{ fontSize: '0.9rem' }} />}
                            label={userIsGM ? 'Game Master' : 'Jogador'}
                            size='small'
                            color={userIsGM ? 'primary' : 'secondary'}
                            variant='filled'
                            sx={{
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: 24
                            }}
                        />
                    </Box>

                    {/* Descrição */}
                    <Box flex={1} display='flex' flexDirection='column' gap={1}>
                        <Typography 
                            variant='body2' 
                            color='text.secondary'
                            sx={{
                                lineHeight: 1.5,
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                minHeight: '3.6em'
                            }}
                        >
                            {description || 'Sem descrição disponível'}
                        </Typography>
                    </Box>

                    <Divider sx={{ opacity: 0.4 }} />

                    {/* Footer com Jogadores e Ações */}
                    <Box display='flex' justifyContent='space-between' alignItems='center'>
                        <Box 
                            display='flex' 
                            alignItems='center' 
                            sx={{
                                px: 0.8,
                                py: 0.2,
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.08)',
                                borderRadius: 1.5,
                                gap: 0.5
                            }}
                        >
                            <Group sx={{ fontSize: '1rem', color: 'success.main' }} />
                            <Typography 
                                variant='body1' 
                                sx={{ 
                                    fontWeight: 600,
                                    color: 'success.main',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {playersQtd} jogador{playersQtd !== 1 ? 'es' : ''}
                            </Typography>
                        </Box>
                        
                        <Box display='flex' alignItems='center' gap={1}>
                            {userIsGM && (
                                <Tooltip title='Deletar Campanha'>
                                    <IconButton
                                        onClick={e => { e.stopPropagation(); setIsDeleteModalOpen(true) }}
                                        size='small'
                                        sx={{
                                            color: theme.palette.error.main,
                                            opacity: 0.7,
                                            '&:hover': {
                                                opacity: 1
                                            }
                                        }}
                                    >
                                        <Delete fontSize='small' />
                                    </IconButton>
                                </Tooltip>
                            )}
                            <IconButton
                                size='small'
                                sx={{
                                    color: theme.palette.primary.main,
                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.12)' : 'rgba(25, 118, 210, 0.08)',
                                    '&:hover': {
                                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.2)' : 'rgba(25, 118, 210, 0.12)'
                                    }
                                }}
                            >
                                <ArrowForward fontSize='small' />
                            </IconButton>
                        </Box>
                    </Box>
                </Stack>
            </Card>
            
            <DeleteCampaignModal
                open={isDeleteModalOpen}
                campaignId={id}
                onClose={() => { setIsDeleteModalOpen(false); }}
            />
        </>
    );
}