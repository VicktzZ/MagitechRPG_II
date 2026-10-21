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
    alpha,
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
import { color } from '@themes/tokens';
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
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'border-color 120ms, background-color 120ms',
                    overflow: 'hidden',
                    '&:hover': {
                        bgcolor: 'background.raised',
                        borderColor: color.borderStrong
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
                                fontSize: '0.75rem',
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
                                bgcolor: alpha(theme.palette.success.main, 0.15),
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
                                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.2)
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