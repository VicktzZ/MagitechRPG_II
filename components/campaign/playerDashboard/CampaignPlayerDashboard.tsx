/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useCampaignContext } from '@contexts';
import { SkillType } from '@enums';
import { 
    Backdrop, 
    Box, 
    CircularProgress, 
    Paper,
    Stack,
    Typography,
    Divider,
    useTheme,
    useMediaQuery,
    type SxProps
} from '@mui/material';
import { 
    Person,
    EventNote,
    CasinoSharp,
    AutoAwesome,
    Inventory2,
    SportsMartialArts,
    Notes,
    AttachMoney
} from '@mui/icons-material';
import { useState, type ReactElement } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Passives, CustomDices } from '@components/ficha';
import type { Ficha } from '@types';

import { useSaveFichaChanges } from '@hooks';
import CharacterInfo from './CharacterInfo';
import ExpertiseSection from './ExpertiseSection';
import InventorySection from './InventorySection';
import MoneyAndAmmo from './MoneyAndAmmo';
import NotesSection from './NotesSection';
import SkillsSection from './SkillsSection';
import SpellsSection from './SpellsSection';
import { useRealtimeDatabase } from '@hooks';
import { useLocalStorage } from '@uidotdev/usehooks';
import { fichaService } from '@services';
import { campaignCurrentFichaContext } from '@contexts';

// Componente Section reutilizável
function Section({ title, icon, children, action, sx }: { 
    title: string; 
    icon?: ReactElement; 
    children: ReactElement;
    action?: ReactElement;
    sx?: SxProps;
}) {
    return (
        <Paper 
            elevation={2} 
            sx={{ 
                p: 3, 
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: 4
                },
                ...sx
            }}
        >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                    {icon}
                    <Typography variant="h6" fontFamily="Sakana">{title}</Typography>
                </Box>
                {action}
            </Box>
            <Divider sx={{ mb: 2 }} />
            {children}
        </Paper>
    )
}

export default function CampaignPlayerDashboard(): ReactElement | null {
    const { users, isUserGM } = useCampaignContext();
    const [ selectedSkillType, setSelectedSkillType ] = useState<SkillType>(SkillType.ALL);
    const [ fichaId ] = useLocalStorage<string>('currentFicha', '');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    if (!fichaId) return null;

    const { data: ficha, query: { isPending } } = useRealtimeDatabase({
        collectionName: 'fichas',
        pipeline: [
            {
                $match: {
                    _id: fichaId
                }
            }
        ]
    }, {
        queryKey: [ 'ficha', fichaId ],
        queryFn: async () => await fichaService.getById(fichaId)
    })

    const { updateFicha } = useSaveFichaChanges({ 
        ficha: ficha!, 
        enabled: !isUserGM && !!ficha 
    })

    // Formulário para integração com componentes da ficha
    const form = useForm<Ficha>({
        defaultValues: ficha,
        values: ficha
    });

    if (!ficha || isUserGM) return null;
    
    const fichaUser = users.player.find(player => player._id === ficha.userId);
    const avatar = fichaUser?.image ?? '/assets/default-avatar.jpg';

    return (
        <Box 
            sx={{ 
                width: '100%', 
                pb: 8, 
                position: 'relative',
                bgcolor: 'background.default',
                minHeight: '100vh'
            }}
        >
            {isPending ? (
                <Backdrop 
                    open={true}
                    sx={{ 
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                        backdropFilter: 'blur(3px)'
                    }}
                >
                    <Stack spacing={2} alignItems="center">
                        <CircularProgress size={60} />
                        <Typography variant="h6" color="primary">
                            Carregando ficha...
                        </Typography>
                    </Stack>
                </Backdrop>
            ) : (
                <FormProvider {...form}>
                    <campaignCurrentFichaContext.Provider value={{ ficha, updateFicha }}>
                        <Box 
                            sx={{
                                maxWidth: '1400px',
                                mx: 'auto',
                                p: { xs: 2, sm: 3, md: 4 }
                            }}
                        >
                            {/* Header da Ficha */}
                            <Paper 
                                elevation={3}
                                sx={{
                                    p: 3,
                                    mb: 4,
                                    borderRadius: 3,
                                    background: theme.palette.mode === 'dark'
                                        ? 'linear-gradient(135deg, #1a2332 0%, #2d3748 100%)'
                                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
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
                                    <CharacterInfo avatar={avatar} />
                                </Box>
                            </Paper>

                            {/* Grid Principal */}
                            <Stack spacing={4}>
                                {/* Seção de Passivas - Topo para fácil visualização */}
                                <Section 
                                    title="Habilidades Passivas" 
                                    icon={<EventNote sx={{ color: 'secondary.main' }} />}
                                >
                                    <Box>
                                        <Passives />
                                    </Box>
                                </Section>

                                {/* Dados Personalizados */}
                                <Section 
                                    title="Dados Personalizados" 
                                    icon={<CasinoSharp sx={{ color: 'primary.main' }} />}
                                >
                                    <Box>
                                        <CustomDices />
                                    </Box>
                                </Section>

                                {/* Grid de 2 colunas para seções principais */}
                                <Box 
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: {
                                            xs: '1fr',
                                            md: '1fr 1fr'
                                        },
                                        gap: 4
                                    }}
                                >
                                    {/* Coluna Esquerda */}
                                    <Stack spacing={4}>
                                        {/* Dinheiro e Munição */}
                                        <Section 
                                            title="Recursos" 
                                            icon={<AttachMoney sx={{ color: 'warning.main' }} />}
                                        >
                                            <Box>
                                                <MoneyAndAmmo />
                                            </Box>
                                        </Section>

                                        {/* Habilidades */}
                                        <Section 
                                            title="Habilidades" 
                                            icon={<SportsMartialArts sx={{ color: 'primary.main' }} />}
                                        >
                                            <Box>
                                                <SkillsSection 
                                                    selectedSkillType={selectedSkillType} 
                                                    setSelectedSkillType={setSelectedSkillType} 
                                                />
                                            </Box>
                                        </Section>

                                        {/* Perícias */}
                                        <Section 
                                            title="Perícias" 
                                            icon={<Person sx={{ color: 'info.main' }} />}
                                        >
                                            <Box>
                                                <ExpertiseSection />
                                            </Box>
                                        </Section>
                                    </Stack>

                                    {/* Coluna Direita */}
                                    <Stack spacing={4}>
                                        {/* Inventário */}
                                        <Section 
                                            title="Inventário" 
                                            icon={<Inventory2 sx={{ color: 'success.main' }} />}
                                        >
                                            <Box>
                                                <InventorySection />
                                            </Box>
                                        </Section>

                                        {/* Magias */}
                                        <Section 
                                            title="Magias" 
                                            icon={<AutoAwesome sx={{ color: 'secondary.main' }} />}
                                        >
                                            <Box>
                                                <SpellsSection />
                                            </Box>
                                        </Section>

                                        {/* Anotações */}
                                        <Section 
                                            title="Anotações" 
                                            icon={<Notes sx={{ color: 'text.secondary' }} />}
                                            sx={{ height: '100%' }}
                                        >
                                            <Box>
                                                <NotesSection />
                                            </Box>
                                        </Section>
                                    </Stack>
                                </Box>
                            </Stack>
                        </Box>
                    </campaignCurrentFichaContext.Provider>
                </FormProvider>
            )}
        </Box>
    );
}