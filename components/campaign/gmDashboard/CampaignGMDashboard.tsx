/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
'use client'

import { useCampaignContext } from '@contexts';
import { useChatContext } from '@contexts/chatContext';
import {
    CardGiftcard,
    ExpandMore,
    People,
    Pets,
    Person,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Casino,
    TrendingUp,
    Star,
    EmojiEvents
} from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Box,
    Chip,
    Button,
    IconButton,
    Paper,
    Skeleton,
    Stack,
    Tooltip,
    Typography,
    alpha,
    type Theme
} from '@mui/material';
import { rarityColor } from '@constants';
import { color } from '@themes/tokens';
import { MessageType } from '@enums';
import { useSnackbar } from 'notistack';
import { type ReactElement, useMemo, useState } from 'react';
import PlayerCard from './PlayerCard';
import CreatureCreator from './CreatureCreator';
import CampaignStatsStrip from './CampaignStatsStrip';
import DeleteCreatureDialog from './DeleteCreatureDialog';
import Section from '../Section';
import type { CharsheetDTO } from '@models/dtos';

const getGMExpertiseLevel = (value: number): 'novice' | 'trained' | 'expert' | 'master' | 'legendary' => {
    if (value < 2) return 'novice';
    if (value < 5) return 'trained';
    if (value < 7) return 'expert';
    if (value < 9) return 'master';
    return 'legendary';
};

/** Fundo translúcido (14%) da cor de um papel do tema, para chips e ícones */
const roleTint = (role: 'error' | 'info' | 'primary' | 'success' | 'warning') =>
    (theme: Theme) => alpha(theme.palette[role].main, 0.14);

/** Cor de cada nível de perícia: a mesma escada de raridades (Comum a Lendário) */
const getGMExpertiseConfig = (value: number) => {
    const level = getGMExpertiseLevel(value);

    switch (level) {
    case 'novice':
        return {
            color: rarityColor.Comum,
            label: 'Destreinado',
            icon: Person
        };
    case 'trained':
        return {
            color: rarityColor.Incomum,
            label: 'Treinado',
            icon: TrendingUp
        };
    case 'expert':
        return {
            color: rarityColor.Raro,
            label: 'Especialista',
            icon: Star
        };
    case 'master':
        return {
            color: rarityColor['Épico'],
            label: 'Mestre',
            icon: EmojiEvents
        };
    case 'legendary':
    default:
        return {
            color: rarityColor['Lendário'],
            label: 'Lendário',
            icon: Casino
        };
    }
};

export default function CampaignGMDashboard(): ReactElement | null {
    const { campaign, users, charsheets, updateCampaign } = useCampaignContext()
    const { handleSendMessage, setIsChatOpen, isChatOpen } = useChatContext()
    const { enqueueSnackbar } = useSnackbar()
    
    const [ expandedPlayer, setExpandedPlayer ] = useState<string | false>(false);
    const [ creatureModalOpen, setCreatureModalOpen ] = useState(false);
    const [ selectedCreature, setSelectedCreature ] = useState<any | null>(null);
    const [ selectedCreatureReadOnly, setSelectedCreatureReadOnly ] = useState(false);
    // Exclusão de criatura: o alvo fica guardado após fechar para o nome não sumir durante a animação do diálogo
    const [ creatureToDelete, setCreatureToDelete ] = useState<{ id: string; name: string } | null>(null);
    const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false);
    const [ isDeletingCreature, setIsDeletingCreature ] = useState(false);
    
    // As fichas já chegam em tempo real pelo campaignContext (useCampaignData) —
    // assinar de novo aqui duplicava o listener do Firestore para os mesmos docs.
    const playerCharsheets = charsheets;
    const isPlayerCharsheetsPending = campaign.players.length > 0 && charsheets.length === 0;

    const players = useMemo(() => {
        return users.players?.map(player => {
            const playerCharsheet = playerCharsheets?.find(f => f.userId === player.id)
    
            return {
                id: player.id,
                name: player.name,
                avatar: player.image ?? '/assets/default-avatar.jpg',
                status: [],
                charsheet: playerCharsheet
            }
        })
    }, [ users, playerCharsheets ])

    const campaignStats = useMemo(() => {
        const totalPlayers = players?.length ?? 0;
        const averageLevel = playerCharsheets?.length 
            ? Math.round(playerCharsheets.reduce((sum, f) => sum + f.level, 0) / playerCharsheets.length)
            : 0;
        const highestLevel = playerCharsheets?.length 
            ? Math.max(...playerCharsheets.map(f => f.level))
            : 0;
        
        return {
            totalPlayers,
            averageLevel,
            highestLevel
        };
    }, [ players, playerCharsheets ]);

    // Obter criatura atualmente em turno (apenas para destaque)
    const currentCreatureInTurn = useMemo(() => {
        const combat: any = (campaign as any).session?.combat;
        const creatures = campaign.custom?.creatures || [];

        if (!combat?.isActive || !Array.isArray(combat.combatants) || combat.combatants.length === 0) {
            return null;
        }

        const current = combat.combatants[combat.currentTurnIndex];
        
        if (!current || current.type !== 'creature') return null;

        const rawId: string = current.id;
        let baseId: string = rawId;

        const lastDashIndex = rawId?.lastIndexOf('-') ?? -1;
        if (lastDashIndex > 0) {
            const possibleBaseId = rawId.slice(0, lastDashIndex);
            if (creatures.some((c: any) => c.id === possibleBaseId)) {
                baseId = possibleBaseId;
            }
        }

        const baseCreature = creatures.find((c: any) => c.id === baseId);
        if (!baseCreature) return null;

        return {
            combatant: current,
            creature: baseCreature
        };
    }, [ campaign.custom?.creatures, campaign.session?.combat ]);

    // Obter TODAS as criaturas ativas no combate
    const allCreaturesInCombat = useMemo(() => {
        const combat: any = (campaign as any).session?.combat;
        const creatures = campaign.custom?.creatures || [];

        if (!combat?.isActive || !Array.isArray(combat.combatants) || combat.combatants.length === 0) {
            return [];
        }

        return combat.combatants
            .filter((combatant: any) => combatant.type === 'creature')
            .map((combatant: any) => {
                const rawId: string = combatant.id;
                let baseId: string = rawId;

                const lastDashIndex = rawId?.lastIndexOf('-') ?? -1;
                if (lastDashIndex > 0) {
                    const possibleBaseId = rawId.slice(0, lastDashIndex);
                    if (creatures.some((c: any) => c.id === possibleBaseId)) {
                        baseId = possibleBaseId;
                    }
                }

                const baseCreature = creatures.find((c: any) => c.id === baseId);
                if (!baseCreature) return null;

                return {
                    combatant,
                    creature: baseCreature,
                    isCurrentTurn: combat.combatants[combat.currentTurnIndex]?.id === combatant.id
                };
            })
            .filter(Boolean);
    }, [ campaign.custom?.creatures, campaign.session?.combat ]);

    const handleCreatureExpertiseRoll = async (expertiseName: string, expertise: any, specificCreature?: any, specificCombatant?: any) => {
        // Use criatura específica se fornecida, senão usa a atual em turno
        let creature, combatant;
        if (specificCreature && specificCombatant) {
            creature = specificCreature;
            combatant = specificCombatant;
        } else if (currentCreatureInTurn) {
            const data = currentCreatureInTurn as any;
            creature = data.creature;
            combatant = data.combatant;
        } else {
            return;
        }
        const expertiseValue = Number(expertise?.value ?? 0) || 0;

        const defaultAttrKey = expertise?.defaultAttribute as keyof typeof creature.attributes | null;
        let numDice = 1;

        if (defaultAttrKey) {
            const attrValue = Number(creature.attributes?.[defaultAttrKey] ?? 0) || 0;
            // Nova fórmula: 0=-1, 5=1, 10=2, 15=3, 20=4, 30+=5
            let attrMod = attrValue === 0 ? -1 : Math.min(5, Math.floor(attrValue / 5));
            if (!Number.isFinite(attrMod)) attrMod = 1;
            numDice = attrMod;
        }

        if (!Number.isFinite(numDice) || numDice < 1) numDice = 1;

        const rolls: number[] = [];
        for (let i = 0; i < numDice; i++) {
            rolls.push(Math.floor(Math.random() * 20) + 1);
        }

        const bestRoll = rolls.length > 1 ? Math.max(...rolls) : rolls[0];
        const total = bestRoll + expertiseValue;
        const rollPart = rolls.length > 1
            ? `${rolls.join(', ')}: ${bestRoll}`
            : `${bestRoll}`;

        const creatureName = combatant?.name || creature.name || 'Criatura';

        const text = `🎲 [${creatureName}] ${expertiseName.toUpperCase()} - ${numDice}d20${expertiseValue >= 0 ? '+' : ''}${expertiseValue}: [${rollPart}] = ${total}`;

        await handleSendMessage(text, MessageType.EXPERTISE);

        if (!isChatOpen) {
            setIsChatOpen(true);
        }
    };

    // Extrai vantagens adquiridas por cada jogador. Vantagens podem ser
    // oferecidas em QUALQUER modo de campanha (não só Roguelite), então esta
    // visão não é mais restrita ao Roguelite — o mestre precisa ver o que cada
    // jogador recebeu independentemente do modo.
    const playersWithPerks = useMemo(() => {
        if (!playerCharsheets) return [];

        return playerCharsheets.map(charsheet => {
            // Busca a sessão da campanha atual
            const session = charsheet.session?.find((s: any) => s.campaignCode === campaign.campaignCode);
            const perks = session?.perks || [];

            // Busca dados do usuário para pegar a foto
            const user = users.players?.find(p => p.id === charsheet.userId);

            return {
                charsheetId: charsheet.id,
                charsheetName: charsheet.name,
                level: charsheet.level,
                perks,
                userImage: user?.image || null,
                userName: user?.name || charsheet.name
            };
        }).filter(p => p.perks.length > 0);
    }, [ campaign.campaignCode, playerCharsheets, users.players ]);

    // Função para obter cor por tipo de perk
    const getPerkTypeColor = (perkType: string) => {
        switch (perkType) {
        case 'WEAPON': return { bg: roleTint('error'), color: 'error.light' };
        case 'ARMOR': return { bg: roleTint('info'), color: 'info.main' };
        case 'ITEM': return { bg: roleTint('primary'), color: 'primary.main' };
        case 'SKILL': 
        case 'HABILIDADE': return { bg: alpha(color.ap, 0.14), color: 'text.secondary' };
        case 'SPELL': return { bg: roleTint('warning'), color: 'warning.light' };
        case 'BONUS': return { bg: roleTint('success'), color: 'success.main' };
        default: return { bg: 'action.hover', color: 'text.secondary' };
        }
    };

    // Função para traduzir tipo de perk
    const getPerkTypeLabel = (perkType: string) => {
        switch (perkType) {
        case 'WEAPON': return 'Arma';
        case 'ARMOR': return 'Armadura';
        case 'ITEM': return 'Item';
        case 'SKILL':
        case 'HABILIDADE': return 'Habilidade';
        case 'SPELL': return 'Magia';
        case 'BONUS': return 'Bônus';
        case 'EXPERTISE': return 'Perícia';
        default: return perkType;
        }
    };

    // Excluir criatura customizada: primeiro pede confirmação, depois remove
    const handleRequestDeleteCreature = (creatureId: string, creatureName: string) => {
        setCreatureToDelete({ id: creatureId, name: creatureName });
        setDeleteDialogOpen(true);
    };

    const handleConfirmDeleteCreature = async () => {
        if (!creatureToDelete) return;

        setIsDeletingCreature(true);
        try {
            const response = await fetch(`/api/campaign/${campaign.id}/custom/creatures`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creatureId: creatureToDelete.id })
            });

            if (!response.ok) {
                throw new Error('Erro ao excluir criatura');
            }

            // A rota DELETE já grava a remoção na campanha; o listener da campanha atualiza a lista.
            // Gravar `custom` de novo aqui sobrescreveria o objeto inteiro com um valor possivelmente velho.
        } catch (error) {
            console.error('Erro ao deletar criatura:', error);
            enqueueSnackbar('Erro ao excluir criatura', { variant: 'error' });
        } finally {
            setIsDeletingCreature(false);
            setDeleteDialogOpen(false);
        }
    };

    const handleViewCreature = (creature: any) => {
        setSelectedCreature(creature);
        setSelectedCreatureReadOnly(true);
        setCreatureModalOpen(true);
    };

    const handleEditCreature = (creature: any) => {
        setSelectedCreature(creature);
        setSelectedCreatureReadOnly(false);
        setCreatureModalOpen(true);
    };

    const handleCreatureSaved = async (creature: any) => {
        const existingCreatures = campaign.custom?.creatures || [];
        const index = existingCreatures.findIndex((c: any) => c.id === creature.id);

        const updatedCreatures = index === -1
            ? [ ...existingCreatures, creature ]
            : existingCreatures.map((c: any) => c.id === creature.id ? { ...c, ...creature } : c);

        await updateCampaign({
            custom: {
                ...campaign.custom,
                creatures: updatedCreatures
            }
        });
    };

    return (
        <Stack spacing={2} sx={{ width: '100%' }}>
            {/* Faixa com o resumo da campanha (e o combate, se houver) */}
            <CampaignStatsStrip
                totalPlayers={campaignStats.totalPlayers}
                averageLevel={campaignStats.averageLevel}
                highestLevel={campaignStats.highestLevel}
                combatRound={campaign.session?.combat?.isActive ? campaign.session.combat.round : undefined}
                loading={isPlayerCharsheetsPending}
            />

            {/* Lista de Jogadores */}
            <Section 
                title="Jogadores da campanha" 
                icon={<People sx={{ color: 'text.secondary' }} />}
            >
                <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {playerCharsheets?.length || 0} ficha{(playerCharsheets?.length || 0) !== 1 ? 's' : ''} ativa{(playerCharsheets?.length || 0) !== 1 ? 's' : ''}
                    </Typography>
                    
                    {isPlayerCharsheetsPending ? (
                        <Stack spacing={2}>
                            <Skeleton variant="rounded" height={140} />
                            <Skeleton variant="rounded" height={140} />
                            <Skeleton variant="rounded" height={140} />
                        </Stack>
                    ) : (!playerCharsheets || playerCharsheets.length === 0) ? (
                        <Paper 
                            sx={{ 
                                p: 4, 
                                textAlign: 'center',
                                border: '2px dashed',
                                borderColor: 'divider',
                                bgcolor: 'transparent'
                            }}
                        >
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                Nenhum jogador encontrado
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Os jogadores da campanha aparecerão aqui quando se juntarem.
                            </Typography>
                        </Paper>
                    ) : (
                        <Box 
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: 'repeat(2, 1fr)',
                                    lg: 'repeat(3, 1fr)'
                                },
                                gap: 3
                            }}
                        >
                            {playerCharsheets.map(charsheet => (
                                <PlayerCard
                                    key={charsheet.id}
                                    charsheet={charsheet as unknown as Required<CharsheetDTO>}
                                />
                            ))}
                        </Box>
                    )}
                </Box>
            </Section>

            {/* Ficha das criaturas em combate (sempre visível durante combate) */}
            {allCreaturesInCombat.length > 0 && (
                <Section 
                    title="Criaturas em combate" 
                    icon={<Pets sx={{ color: 'text.secondary' }} />}
                >
                    <Box>
                        {allCreaturesInCombat.map((creatureData: any, index: number) => {
                            if (!creatureData) return null;
                            const { combatant, creature, isCurrentTurn } = creatureData;
                            const expertisesEntries = Object.entries(creature.expertises || {});

                            return (
                                <Paper
                                    key={combatant.id}
                                    sx={{
                                        p: 2,
                                        mb: index < allCreaturesInCombat.length - 1 ? 2 : 0,
                                        border: isCurrentTurn ? '3px solid' : '1px solid',
                                        borderColor: isCurrentTurn ? 'warning.main' : 'divider',
                                        borderRadius: 2,
                                        bgcolor: isCurrentTurn 
                                            ? (theme) => alpha(theme.palette.warning.main, 0.12)
                                            : 'background.raised',
                                        position: 'relative',
                                        '&::before': isCurrentTurn ? {
                                            content: '"Vez desta criatura"',
                                            position: 'absolute',
                                            top: -12,
                                            left: 16,
                                            bgcolor: 'warning.main',
                                            color: 'warning.contrastText',
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 1,
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            zIndex: 1
                                        } : {}
                                    }}
                                >
                                    <Stack spacing={2}>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Avatar sx={{ 
                                                bgcolor: (theme) => alpha(theme.palette.warning.main, isCurrentTurn ? 0.28 : 0.14), 
                                                color: 'warning.main',
                                                border: isCurrentTurn ? '2px solid' : 'none',
                                                borderColor: 'warning.main'
                                            }}>
                                                <Pets />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={700}>
                                                    {combatant?.name || creature.name}
                                                    {isCurrentTurn && (
                                                        <Chip 
                                                            label="EM TURNO" 
                                                            size="small" 
                                                            sx={{ 
                                                                ml: 1, 
                                                                bgcolor: 'warning.main', 
                                                                color: 'warning.contrastText',
                                                                fontWeight: 700,
                                                                fontSize: '0.75rem'
                                                            }} 
                                                        />
                                                    )}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Nível {creature.level} • LP {combatant.currentLp ?? creature.stats?.lp ?? 0}/{combatant.maxLp ?? creature.stats?.maxLp ?? creature.stats?.lp ?? 0} • MP {combatant.currentMp ?? creature.stats?.mp ?? 0}/{combatant.maxMp ?? creature.stats?.maxMp ?? creature.stats?.mp ?? 0}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Lista de Perícias da Criatura */}
                                        {expertisesEntries.length === 0 ? (
                                            <Paper 
                                                sx={{ 
                                                    p: 2, 
                                                    textAlign: 'center',
                                                    border: '2px dashed',
                                                    borderColor: 'divider',
                                                    bgcolor: 'transparent'
                                                }}
                                            >
                                                <Typography variant="body2" color="text.secondary">
                                                    Esta criatura não possui perícias configuradas.
                                                </Typography>
                                            </Paper>
                                        ) : (
                                            <Box 
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: {
                                                        xs: 'repeat(2, 1fr)',
                                                        sm: 'repeat(3, 1fr)',
                                                        md: 'repeat(4, 1fr)'
                                                    },
                                                    gap: 1.5
                                                }}
                                            >
                                                {expertisesEntries.map(([ nome, expertise ]: any) => {
                                                    const config = getGMExpertiseConfig(expertise.value ?? 0);
                                                    const IconComponent = config.icon;

                                                    return (
                                                        <Button
                                                            key={`${combatant.id}-${nome}`}
                                                            fullWidth
                                                            onClick={async () => await handleCreatureExpertiseRoll(nome, expertise, creature, combatant)}
                                                            disabled={false}
                                                            sx={{
                                                                p: 1.5,
                                                                bgcolor: alpha(config.color, 0.12),
                                                                border: '1px solid',
                                                                borderColor: alpha(config.color, 0.25),
                                                                borderRadius: 2,
                                                                justifyContent: 'flex-start',
                                                                textAlign: 'left',
                                                                textTransform: 'none',
                                                                opacity: 1,
                                                                '&:hover': {
                                                                    bgcolor: alpha(config.color, 0.18),
                                                                    borderColor: alpha(config.color, 0.5)
                                                                }
                                                            }}
                                                        >
                                                            <Stack spacing={1} width="100%">
                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                    <Box 
                                                                        sx={{
                                                                            p: 0.8,
                                                                            borderRadius: 1,
                                                                            bgcolor: alpha(config.color, 0.12),
                                                                            border: '1px solid',
                                                                            borderColor: alpha(config.color, 0.25)
                                                                        }}
                                                                    >
                                                                        <IconComponent 
                                                                            sx={{ 
                                                                                color: config.color,
                                                                                fontSize: '1.1rem'
                                                                            }} 
                                                                        />
                                                                    </Box>
                                                                    <Typography 
                                                                        variant="subtitle2" 
                                                                        sx={{ 
                                                                            fontWeight: 600,
                                                                            flex: 1
                                                                        }}
                                                                    >
                                                                        {nome}
                                                                    </Typography>
                                                                </Box>
                                                                <Box display="flex" gap={1} flexWrap="wrap" justifyContent="space-between">
                                                                    <Chip 
                                                                        label={`${expertise.value >= 0 ? '+' : ''}${expertise.value}`}
                                                                        size="small"
                                                                        sx={{
                                                                            bgcolor: config.color,
                                                                            color: color.canvas,
                                                                            fontWeight: 700,
                                                                            fontSize: '0.75rem'
                                                                        }}
                                                                    />
                                                                    {expertise.defaultAttribute && (
                                                                        <Chip 
                                                                            label={(expertise.defaultAttribute as string).toUpperCase()}
                                                                            size="small"
                                                                            sx={{
                                                                                bgcolor: 'action.hover',
                                                                                fontWeight: 600,
                                                                                fontSize: '0.75rem'
                                                                            }}
                                                                        />
                                                                    )}
                                                                    <Chip 
                                                                        label={getGMExpertiseLevel(expertise.value).replace(/^(\w)/, (_, c) => c.toUpperCase())}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        sx={{
                                                                            borderColor: alpha(config.color, 0.38),
                                                                            color: 'text.primary',
                                                                            fontWeight: 600,
                                                                            fontSize: '0.75rem'
                                                                        }}
                                                                    />
                                                                </Box>
                                                            </Stack>
                                                        </Button>
                                                    );
                                                })}
                                            </Box>
                                        )}
                                    </Stack>
                                </Paper>
                            );
                        })}
                    </Box>
                </Section>
            )}

            {/* Seção de Vantagens Adquiridas — visível no Roguelite (sempre) ou
                em qualquer modo quando algum jogador já recebeu vantagens */}
            {(campaign.mode === 'Roguelite' || playersWithPerks.length > 0) && (
                <Section
                    title="Vantagens adquiridas"
                    icon={<CardGiftcard sx={{ color: 'text.secondary' }} />}
                >
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Vantagens obtidas por cada jogador nesta campanha
                        </Typography>
                        
                        {isPlayerCharsheetsPending ? (
                            <Stack spacing={1}>
                                <Skeleton variant="rounded" height={60} />
                                <Skeleton variant="rounded" height={60} />
                            </Stack>
                        ) : playersWithPerks.length === 0 ? (
                            <Paper 
                                sx={{ 
                                    p: 3, 
                                    textAlign: 'center',
                                    border: '2px dashed',
                                    borderColor: 'divider',
                                    bgcolor: 'transparent'
                                }}
                            >
                                <Typography variant="body1" color="text.secondary">
                                    Nenhuma vantagem adquirida ainda
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    As vantagens aparecerão aqui quando os jogadores as selecionarem
                                </Typography>
                            </Paper>
                        ) : (
                            <Stack spacing={1}>
                                {playersWithPerks.map(player => (
                                    <Accordion 
                                        key={player.charsheetId}
                                        expanded={expandedPlayer === player.charsheetId}
                                        onChange={(_, isExpanded) => setExpandedPlayer(isExpanded ? player.charsheetId : false)}
                                        sx={{
                                            borderRadius: 2,
                                            '&:before': { display: 'none' },
                                            bgcolor: 'background.raised'
                                        }}
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMore />}
                                            sx={{ 
                                                borderRadius: 2,
                                                '&:hover': { bgcolor: 'action.hover' }
                                            }}
                                        >
                                            <Box display="flex" alignItems="center" gap={2} width="100%">
                                                <Avatar 
                                                    src={player.userImage || undefined}
                                                    sx={{ 
                                                        width: 44, 
                                                        height: 44,
                                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
                                                        color: 'primary.main',
                                                        fontSize: '1rem',
                                                        fontWeight: 700,
                                                        border: '2px solid',
                                                        borderColor: (theme) => alpha(theme.palette.primary.main, 0.5)
                                                    }}
                                                >
                                                    {!player.userImage && (player.charsheetName?.charAt(0)?.toUpperCase() || '?')}
                                                </Avatar>
                                                <Box flex={1}>
                                                    <Typography variant="subtitle1" fontWeight={600}>
                                                        {player.charsheetName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Nível {player.level} • {player.userName}
                                                    </Typography>
                                                </Box>
                                                <Chip 
                                                    label={`${player.perks.length} vantagem${player.perks.length !== 1 ? 's' : ''}`}
                                                    size="small"
                                                    sx={{ 
                                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14), 
                                                        color: 'primary.main',
                                                        fontWeight: 600
                                                    }}
                                                />
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ pt: 0 }}>
                                            <Box 
                                                sx={{ 
                                                    display: 'flex', 
                                                    flexWrap: 'wrap', 
                                                    gap: 1,
                                                    p: 1,
                                                    bgcolor: 'background.paper',
                                                    borderRadius: 1
                                                }}
                                            >
                                                {player.perks.map((perk: any, index: number) => {
                                                    const typeColor = getPerkTypeColor(perk.perkType);
                                                    return (
                                                        <Tooltip 
                                                            key={index}
                                                            title={
                                                                <Box>
                                                                    <Typography variant="subtitle2">{perk.name}</Typography>
                                                                    {perk.description && (
                                                                        <Typography variant="caption">{perk.description}</Typography>
                                                                    )}
                                                                </Box>
                                                            }
                                                            arrow
                                                        >
                                                            <Chip
                                                                label={
                                                                    <Box display="flex" alignItems="center" gap={0.5}>
                                                                        <Typography variant="caption" fontWeight={600}>
                                                                            {perk.name}
                                                                        </Typography>
                                                                        <Chip 
                                                                            label={getPerkTypeLabel(perk.perkType)}
                                                                            size="small"
                                                                            sx={{ 
                                                                                height: 18,
                                                                                fontSize: '0.75rem',
                                                                                bgcolor: typeColor.bg,
                                                                                color: typeColor.color
                                                                            }}
                                                                        />
                                                                        <Chip 
                                                                            label={getPerkTypeLabel(perk.rarity)}
                                                                            size="small"
                                                                            sx={{ 
                                                                                height: 18,
                                                                                fontSize: '0.75rem',
                                                                                bgcolor: typeColor.bg,
                                                                                color: typeColor.color
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                }
                                                                size="medium"
                                                                sx={{
                                                                    bgcolor: 'background.raised',
                                                                    border: '1px solid',
                                                                    borderColor: 'divider',
                                                                    cursor: 'pointer',
                                                                    '&:hover': {
                                                                        bgcolor: 'background.overlay'
                                                                    }
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    );
                                                })}
                                            </Box>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </Stack>
                        )}
                    </Box>
                </Section>
            )}

            {/* Seção de Criaturas Customizadas */}
            {campaign.custom?.creatures && campaign.custom.creatures.length > 0 && (
                <Section 
                    title="Criaturas customizadas" 
                    icon={<Pets sx={{ color: 'text.secondary' }} />}
                >
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Criaturas criadas para esta campanha
                        </Typography>
                        
                        <Stack spacing={1}>
                            {campaign.custom.creatures.map((creature: any) => (
                                <Paper
                                    key={creature.id}
                                    sx={{
                                        p: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 2,
                                        bgcolor: 'background.raised'
                                    }}
                                >
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Avatar
                                                src={creature.imageUrl || undefined}
                                                sx={{ bgcolor: (theme) => alpha(theme.palette.warning.main, 0.14), color: 'warning.main' }}
                                            >
                                                <Pets />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={600}>
                                                    {creature.name}
                                                    {creature.type && (
                                                        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                            {creature.type}
                                                        </Typography>
                                                    )}
                                                </Typography>
                                                <Box display="flex" gap={0.5} mt={0.5} flexWrap="wrap">
                                                    <Chip
                                                        label={`Nível ${creature.level}`}
                                                        size="small"
                                                        sx={{ height: 20, fontSize: '0.75rem', bgcolor: (theme) => alpha(theme.palette.success.main, 0.14), color: 'success.main' }}
                                                    />
                                                    <Chip 
                                                        label={`LP: ${creature.stats?.lp || 0}`} 
                                                        size="small" 
                                                        sx={{ height: 20, fontSize: '0.75rem', bgcolor: alpha(color.lp, 0.14), color: 'error.light' }} 
                                                    />
                                                    <Chip 
                                                        label={`MP: ${creature.stats?.mp || 0}`} 
                                                        size="small" 
                                                        sx={{ height: 20, fontSize: '0.75rem', bgcolor: alpha(color.mp, 0.14), color: color.mp }} 
                                                    />
                                                    {creature.skills?.length > 0 && (
                                                        <Chip 
                                                            label={`${creature.skills.length} habilidade(s)`} 
                                                            size="small" 
                                                            sx={{ height: 20, fontSize: '0.75rem', bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14), color: 'primary.main' }} 
                                                        />
                                                    )}
                                                    {creature.spells?.length > 0 && (
                                                        <Chip 
                                                            label={`${creature.spells.length} magia(s)`} 
                                                            size="small" 
                                                            sx={{ height: 20, fontSize: '0.75rem', bgcolor: (theme) => alpha(theme.palette.info.main, 0.14), color: 'info.main' }} 
                                                        />
                                                    )}
                                                </Box>
                                                {creature.description && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                        {creature.description}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                            <Tooltip title="Ver detalhes da criatura">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleViewCreature(creature)}
                                                    sx={{ 
                                                        color: 'info.main',
                                                        '&:hover': { 
                                                            bgcolor: (theme) => alpha(theme.palette.info.main, 0.14),
                                                            color: 'info.light'
                                                        }
                                                    }}
                                                >
                                                    <SearchIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Editar criatura">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEditCreature(creature)}
                                                    sx={{ 
                                                        color: 'primary.main',
                                                        '&:hover': { 
                                                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
                                                            color: 'primary.light'
                                                        }
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Excluir criatura">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRequestDeleteCreature(creature.id, creature.name)}
                                                    sx={{ 
                                                        color: 'error.main',
                                                        '&:hover': { 
                                                            bgcolor: (theme) => alpha(theme.palette.error.main, 0.14),
                                                            color: 'error.light'
                                                        }
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                </Paper>
                            ))}
                        </Stack>
                    </Box>
                </Section>
            )}

            <CreatureCreator
                open={creatureModalOpen}
                onClose={() => {
                    setCreatureModalOpen(false);
                    setSelectedCreature(null);
                }}
                editingCreature={selectedCreature || undefined}
                readOnly={selectedCreatureReadOnly}
                onSave={handleCreatureSaved}
            />

            <DeleteCreatureDialog
                open={deleteDialogOpen}
                creatureName={creatureToDelete?.name ?? ''}
                deleting={isDeletingCreature}
                onConfirm={handleConfirmDeleteCreature}
                onCancel={() => setDeleteDialogOpen(false)}
            />
        </Stack>
    )
}
