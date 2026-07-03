'use client';

import { CharsheetCard } from '@components/charsheet';
import { usePusher } from '@hooks';
import { useCampaignData } from '@hooks/useCampaignData';
import { useFirestoreRealtime } from '@hooks/useFirestoreRealtime';
import { 
    Backdrop, 
    Box, 
    Button,
    CircularProgress, 
    FormControl,
    Grid, 
    InputLabel,
    MenuItem,
    Modal, 
    Select,
    Skeleton, 
    TextField,
    Typography 
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, type ReactElement } from 'react';
import { campaignContext, type CampaignContextValue } from './campaignContext';
import { campaignEntity } from '@utils/firestoreEntities';
import type { Campaign, RPGSystem } from '@models/entities';
import { useSnackbar } from 'notistack';

export function CampaignProvider({ children, code }: { children: ReactElement, code: string }) {
    document.title = 'Campaign - ' + code;

    const router = useRouter();
    const { data: session } = useSession();
    const { enqueueSnackbar } = useSnackbar();
    const [ charsheetId, setCharsheetId ] = useState('');
    const [ isCreating, setIsCreating ] = useState(false);
    
    // Estados para formulário roguelite
    const [ rogueliteForm, setRogueliteForm ] = useState({
        name: '',
        race: '',
        age: 18,
        gender: 'Não definido' as 'Masculino' | 'Feminino' | 'Não-binário' | 'Outro' | 'Não definido'
    });

    // Estado do sistema de RPG customizado
    const [ rpgSystem, setRpgSystem ] = useState<RPGSystem | null>(null);
    const [ loadingSystem, setLoadingSystem ] = useState(false);

    const campaignData = useCampaignData({
        campaignCode: code,
        userId: session?.user?.id
    });

    // Carrega o sistema de RPG quando a campanha tem um systemId
    useEffect(() => {
        async function loadRPGSystem() {
            if (!campaignData?.campaign?.systemId) {
                setRpgSystem(null);
                return;
            }

            setLoadingSystem(true);
            try {
                const response = await fetch(`/api/rpg-system/${campaignData.campaign.systemId}`);
                if (response.ok) {
                    const system = await response.json();
                    setRpgSystem(system);
                } else {
                    console.error('Sistema de RPG não encontrado');
                    setRpgSystem(null);
                }
            } catch (error) {
                console.error('Erro ao carregar sistema de RPG:', error);
                setRpgSystem(null);
            } finally {
                setLoadingSystem(false);
            }
        }

        loadRPGSystem();
    }, [ campaignData?.campaign?.systemId ]);

    const { data: charsheetsResponse, loading } = useFirestoreRealtime('charsheet', {
        filters: [
            { field: 'userId', operator: '==', value: session?.user?.id }
        ]
    });

    const isUserGM = campaignData?.isUserGM ?? false;
    const isRogueliteMode = campaignData?.campaign?.mode === 'Roguelite';

    usePusher(code, isUserGM, session)

    // Função para criar ficha roguelite
    const handleCreateRogueliteCharsheet = async () => {
        if (!rogueliteForm.name.trim() || !rogueliteForm.race.trim()) {
            enqueueSnackbar('Preencha o nome e a raça do personagem', { variant: 'warning' });
            return;
        }

        if (!session?.user?.id || !campaignData?.campaign?.id) return;

        setIsCreating(true);
        try {
            const response = await fetch(`/api/campaign/${campaignData.campaign.id}/roguelite-charsheet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: rogueliteForm.name,
                    race: rogueliteForm.race,
                    age: rogueliteForm.age,
                    gender: rogueliteForm.gender,
                    userId: session.user.id,
                    playerName: session.user.name || 'Jogador',
                    campaignCode: code
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao criar ficha');
            }

            const data = await response.json();
            enqueueSnackbar('Ficha criada com sucesso!', { variant: 'success' });
            setCharsheetId(data.charsheet.id);
        } catch (error: any) {
            console.error('Erro ao criar ficha roguelite:', error);
            enqueueSnackbar(error.message || 'Erro ao criar ficha', { variant: 'error' });
        } finally {
            setIsCreating(false);
        }
    };

    if (!campaignData) {
        return (
            <Backdrop open={true}>
                <CircularProgress />
            </Backdrop>
        )
    }

    if (campaignData === null) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    width: '100vw'
                }}
            >
                <Typography variant='h5'>Campanha não encontrada</Typography>
            </Box>
        )
    }

    if (!!campaignData && (isUserGM || !!campaignData.charsheets.find(c => c.userId === session?.user?.id) || campaignData.charsheets.map(c => c.id).includes(charsheetId)) || charsheetId) {
        localStorage.setItem('currentCharsheet', (charsheetId || campaignData.charsheets.find(f => f.userId === session?.user?.id)?.id) ?? '');

        const value: CampaignContextValue = {
            ...campaignData,
            updateCampaign: async (data: Partial<Campaign>) => {
                if (!campaignData.campaign.id) return;
                await campaignEntity.update(campaignData.campaign.id, data);
            },
            rpgSystem,
            loadingSystem,
            isDefaultSystem: !campaignData.campaign.systemId
        };

        return (
            <campaignContext.Provider value={value}>
                {children}
            </campaignContext.Provider>
        )
    } else if (isRogueliteMode) {
        // Modal para criação de ficha Roguelite
        return (
            <Modal
                open={true}
                onClose={() => { router.push('/app/campaign'); }}
                disableAutoFocus
                disableEnforceFocus
                disableRestoreFocus
                disablePortal
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    width: '100vw'
                }}
            >
                <Box
                    display='flex'
                    width='450px'
                    bgcolor='background.paper'
                    borderRadius={2}
                    flexDirection='column'
                    p={3}
                    gap={3}
                >
                    <Box>
                        <Typography variant='h5' fontWeight={600} gutterBottom>
                            🎲 Criar Personagem Roguelite
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                            Preencha os dados básicos do seu personagem. Você começará do zero e evoluirá durante a campanha!
                        </Typography>
                    </Box>
                    
                    <TextField
                        label="Nome do Personagem"
                        value={rogueliteForm.name}
                        onChange={(e) => setRogueliteForm(prev => ({ ...prev, name: e.target.value }))}
                        fullWidth
                        required
                        inputProps={{ maxLength: 50 }}
                    />
                    
                    <TextField
                        label="Raça"
                        value={rogueliteForm.race}
                        onChange={(e) => setRogueliteForm(prev => ({ ...prev, race: e.target.value }))}
                        fullWidth
                        required
                        placeholder="Ex: Humano, Elfo, Anão..."
                    />
                    
                    <TextField
                        label="Idade"
                        type="number"
                        value={rogueliteForm.age}
                        onChange={(e) => setRogueliteForm(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                        fullWidth
                        inputProps={{ min: 1, max: 999 }}
                    />
                    
                    <FormControl fullWidth>
                        <InputLabel>Gênero</InputLabel>
                        <Select
                            value={rogueliteForm.gender}
                            label="Gênero"
                            onChange={(e) => setRogueliteForm(prev => ({ ...prev, gender: e.target.value as typeof rogueliteForm.gender }))}
                        >
                            <MenuItem value="Masculino">Masculino</MenuItem>
                            <MenuItem value="Feminino">Feminino</MenuItem>
                            <MenuItem value="Não-binário">Não-binário</MenuItem>
                            <MenuItem value="Outro">Outro</MenuItem>
                            <MenuItem value="Não definido">Não definido</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <Box display='flex' gap={2} justifyContent='flex-end'>
                        <Button 
                            variant='outlined' 
                            onClick={() => router.push('/app/campaign')}
                            disabled={isCreating}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            variant='contained' 
                            onClick={handleCreateRogueliteCharsheet}
                            disabled={isCreating || !rogueliteForm.name.trim() || !rogueliteForm.race.trim()}
                        >
                            {isCreating ? <CircularProgress size={24} /> : 'Criar Personagem'}
                        </Button>
                    </Box>
                </Box>
            </Modal>
        )
    } else {
        // Modal clássico para escolha de ficha
        return (
            <Modal
                open={true}
                onClose={() => { router.push('/app/campaign'); }}
                disableAutoFocus
                disableEnforceFocus
                disableRestoreFocus
                disablePortal
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    width: '100vw'
                }}
            >
                <Box
                    display='flex'
                    height='50%'
                    width='61%'
                    bgcolor='background.paper'
                    borderRadius={1}
                    flexDirection='column'
                    p={2}
                    gap={2}
                >
                    <Box>
                        <Typography variant='h6'>Escolha uma ficha para ingressar</Typography>
                    </Box>
                    <Grid minHeight='100%' overflow='auto' gap={2} container>
                        {loading ? [ 0, 1, 2 ].map(() => (
                            <Skeleton
                                variant='rectangular' key={Math.random()} width='20rem' height='15rem'
                            />
                        )) : charsheetsResponse?.map(c => (
                            <CharsheetCard
                                key={c.id}
                                charsheet={c}
                                disableDeleteButton
                                onClick={() => setCharsheetId(c.id)}
                            />
                        ))}
                    </Grid>
                </Box>
            </Modal>
        )
    }
}