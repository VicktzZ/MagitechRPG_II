/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { CustomDices, Passives } from '@components/ficha';
import { useCampaignContext } from '@contexts';
import { SkillType } from '@enums';
import { 
    AttachMoney,
    AutoAwesome,
    CasinoSharp,
    EventNote,
    Inventory2,
    Notes,
    Person,
    SportsMartialArts
} from '@mui/icons-material';
import {
    Backdrop,
    Box,
    CircularProgress,
    Divider,
    Paper,
    Stack,
    Typography,
    type SxProps
} from '@mui/material';
import { useState, type ReactElement } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { campaignCurrentFichaContext } from '@contexts';
import { useFichaUpdater } from '@services/firestore/hooks';
import ExpertiseSection from './ExpertiseSection';
import InventorySection from './InventorySection';
import MoneyAndAmmo from './MoneyAndAmmo';
import NotesSection from './NotesSection';
import PlayerHeader from './PlayerHeader';
import SkillsSection from './SkillsSection';
import SpellsSection from './SpellsSection';
import { useCompleteFicha } from '@hooks/useCompleteFicha';
import type { Charsheet } from '@models/entities';

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
    const fichaId = localStorage.getItem('currentFicha');
    
    if (!fichaId) return null;

    // 🔥 Usando hook personalizado para ficha completa em tempo real
    const { data: ficha, loading } = useCompleteFicha({ fichaId });

    const { updateFicha } = useFichaUpdater(fichaId);

    const form = useForm<Charsheet>({
        defaultValues: ficha,
        values: ficha
    });

    if (!ficha || isUserGM) return null;
    
    const fichaUser = users.players.find(player => player.id === ficha.userId);
    const avatar = fichaUser?.image ?? '/assets/default-avatar.jpg';

    return (
        <Box 
            sx={{ 
                width: '100%', 
                pb: 8, 
                position: 'relative',
                minHeight: '100vh'
            }}
        >
            {loading ? (
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
                                mx: 'auto'
                            }}
                        >
                            {/* Header da Ficha */}
                            <PlayerHeader avatar={avatar} />

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
                                        <CustomDices enableChatIntegration={true} />
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