import { ContentCopy, Delete as DeleteIcon, Edit as EditIcon, ExpandLess, ExpandMore, GroupAdd, OpenInNew, Pets } from '@mui/icons-material';
import { Avatar, Box, Button, Chip, Collapse, IconButton, Tooltip, Typography, alpha } from '@mui/material';
import { color, font } from '@themes/tokens';
import type { Creature } from '@models';
import type { CreatureDice } from '@utils/combat/creatureDice';
import { useMemo, type ReactElement } from 'react';
import { toCreatureCard } from '../windows/creature/creatureCard';
import CreatureCardDetails from './creatures/CreatureCardDetails';

interface CustomCreatureCardProps {
    creature: Creature;
    /** A ficha completa está aberta no cartão */
    expanded: boolean;
    onToggle: (creatureId: string) => void;
    /** Abre a janela da criatura */
    onView: (creature: Creature) => void;
    onEdit: (creature: Creature) => void;
    onDelete: (creatureId: string, creatureName: string) => void;
    onDuplicate: (creature: Creature) => void;
    /** Põe uma cópia no combate em andamento; sem isso (não há combate ativo) o botão não aparece */
    onAddToCombat?: (creature: Creature) => void;
    onRollDice?: (creature: Creature, dice: CreatureDice) => void;
    /** Quantas cópias dela estão no combate agora */
    copiesInCombat?: number;
    /** Esperando o servidor (duplicando ou adicionando ao combate): os botões que mexem no servidor ficam desligados */
    busy?: boolean;
}

const statChipSx = (tint: string) => ({ height: 22, fontSize: 12, fontFamily: font.mono, bgcolor: alpha(tint, 0.14), color: tint });

/**
 * Cartão de uma criatura customizada da campanha: o essencial à vista (nível, tipo, LP, MP, AP, elemento, quantas habilidades, magias e dados), as ações rápidas (ver a
 * janela, editar, duplicar, excluir e, com combate ativo, adicionar ao combate) e a ficha completa que abre ali mesmo, sem trocar de tela.
 */
export default function CustomCreatureCard({
    creature, expanded, onToggle, onView, onEdit, onDelete, onDuplicate, onAddToCombat, onRollDice, copiesInCombat = 0, busy = false
}: CustomCreatureCardProps): ReactElement {
    const card = useMemo(() => toCreatureCard(creature), [ creature ]);
    const counts = [
        card.skills.length > 0 ? `${card.skills.length} ${card.skills.length === 1 ? 'habilidade' : 'habilidades'}` : '',
        card.spells.length > 0 ? `${card.spells.length} ${card.spells.length === 1 ? 'magia' : 'magias'}` : '',
        card.dices.length > 0 ? `${card.dices.length} ${card.dices.length === 1 ? 'dado' : 'dados'}` : ''
    ].filter(Boolean);

    return (
        <Box
            component="article"
            data-testid="custom-creature-card"
            data-expanded={expanded}
            aria-label={card.name}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                p: 1.5,
                minWidth: 0,
                border: '1px solid',
                borderColor: 'divider',
                borderLeft: '3px solid',
                borderLeftColor: copiesInCombat > 0 ? 'primary.main' : 'divider',
                borderRadius: 2,
                bgcolor: 'background.raised',
                gridColumn: expanded ? '1 / -1' : undefined,
                '&:hover': { borderColor: color.borderStrong, borderLeftColor: copiesInCombat > 0 ? 'primary.main' : color.borderStrong }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Avatar src={card.imageUrl || undefined} alt="" sx={{ width: 40, height: 40, bgcolor: theme => alpha(theme.palette.warning.main, 0.14), color: 'warning.main' }}>
                    <Pets />
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography component="h3" noWrap sx={{ fontWeight: 600, fontSize: 15 }}>{card.name}</Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Nv. {card.level}{card.type ? ` • ${card.type}` : ''}</Typography>
                </Box>
                {copiesInCombat > 0 && <Chip size="small" color="primary" label={copiesInCombat > 1 ? `Em combate ×${copiesInCombat}` : 'Em combate'} />}
                <Tooltip title={expanded ? 'Recolher' : 'Mostrar tudo'}>
                    <IconButton size="small" aria-expanded={expanded} aria-label={`${expanded ? 'Recolher' : 'Mostrar tudo de'} ${card.name}`} onClick={() => { onToggle(creature.id); }}>
                        {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                    </IconButton>
                </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                <Chip size="small" label={`LP ${card.stats.maxLp}`} sx={statChipSx(color.lp)} />
                {card.stats.maxMp > 0 && <Chip size="small" label={`MP ${card.stats.maxMp}`} sx={statChipSx(color.mp)} />}
                <Chip size="small" label={`AP ${card.stats.ap}`} sx={statChipSx(color.ap)} />
                {card.defenses.element && <Chip size="small" variant="outlined" label={card.defenses.element} sx={{ height: 22, fontSize: 12 }} />}
                {counts.length > 0 && <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{counts.join(' • ')}</Typography>}
            </Box>

            {card.description && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={expanded ? { whiteSpace: 'pre-wrap' } : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                >
                    {card.description}
                </Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                {onAddToCombat && (
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<GroupAdd fontSize="small" />}
                        disabled={busy}
                        onClick={() => { onAddToCombat(creature); }}
                        aria-label={`Adicionar ${card.name} ao combate`}
                        sx={{ textTransform: 'none', mr: 'auto' }}
                    >
                        Adicionar ao combate
                    </Button>
                )}
                <Box sx={{ display: 'flex', gap: 0.25, ml: onAddToCombat ? 0 : 'auto' }}>
                    <Tooltip title="Abrir a ficha em janela">
                        <IconButton size="small" aria-label={`Abrir a ficha de ${card.name} em janela`} onClick={() => { onView(creature); }}><OpenInNew fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Editar criatura">
                        <IconButton size="small" aria-label={`Editar ${card.name}`} onClick={() => { onEdit(creature); }}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Duplicar criatura">
                        <span>
                            <IconButton size="small" aria-label={`Duplicar ${card.name}`} disabled={busy} onClick={() => { onDuplicate(creature); }}>
                                <ContentCopy fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Excluir criatura">
                        <IconButton size="small" aria-label={`Excluir ${card.name}`} onClick={() => { onDelete(creature.id, creature.name); }} sx={{ color: 'error.main' }}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Collapse in={expanded} unmountOnExit>
                <Box sx={{ pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                    <CreatureCardDetails creature={card} onRollDice={onRollDice ? dice => { onRollDice(creature, dice); } : undefined} />
                </Box>
            </Collapse>
        </Box>
    );
}
