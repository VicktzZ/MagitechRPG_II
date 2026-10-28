'use client';

import { useCampaignContext, useCampaignCurrentCharsheetContext } from '@contexts';
import type { Item, Weapon } from '@models';
import type { SpellDTO } from '@models/dtos';
import { SportsKabaddi } from '@mui/icons-material';
import { Box, Button, Chip, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { font } from '@themes/tokens';
import ActionBlocksNotice from '../../ActionBlocksNotice';
import ActionPips from '../../ActionPips';
import Section from '../../Section';
import { actionBlocks, blockReason, effectiveBudget, isBlocked } from '@utils/combat/actionFlags';
import {
    buildActionTiles,
    countByExecution,
    filterTiles,
    groupTiles,
    isTileSpent,
    TILE_CATEGORIES,
    TILE_CATEGORY_LABEL,
    TILE_EXECUTIONS,
    type ActionTile,
    type TileExecution
} from '@utils/combat/actionTiles';
import { getSpellMpCost } from '@utils/combat/spellRoller';
import { findAwaitingDamage } from '@utils/combat/pendingAttacks';
import { normalizeToArray } from '@utils/normalizeToArray';
import { getSpellProgress, spellStageLabel } from '@utils/spellStages';
import { useMemo, useState, type MouseEvent as ReactMouseEvent, type ReactElement } from 'react';
import AttackTargetPicker from '../attacks/AttackTargetPicker';
import { collectEntries } from '../inventory/inventoryList';
import { useWeaponRolls } from '../inventory/useWeaponRolls';
import { useSpellCasting } from '../spells/SpellCastingContext';
import ActionTileButton, { type TileState } from './ActionTileButton';
import { useItemUse } from './useItemUse';

const spellKey = (spell: Pick<SpellDTO, 'id' | 'name'>): string => spell.id || spell.name;

/**
 * "Ações": no topo do painel do jogador, só em combate. As ações da rodada (Padrão, Bônus, Movimento, Reação) e tudo que o personagem pode fazer, em quadrados no estilo
 * hotbar separados em Ataque, Cura e Outros, com filtro pela ação que cada um gasta. **O alvo do ataque é escolhido aqui, uma vez só**, e vale para o teste de acerto da arma,
 * a conjuração de magia de ataque e os quadrados, tanto clicando neles quanto indo à arma ou à magia nas outras seções. Ao gastar uma ação, todo quadrado dela fica cinza e
 * desativado. Os quadrados usam os mesmos caminhos das outras seções (`useWeaponRolls`, `useSpellCasting`), então a regra do acerto, do MP e da ação gasta é uma só.
 */
export default function ActionsSection(): ReactElement | null {
    const { campaign } = useCampaignContext();
    const { charsheet } = useCampaignCurrentCharsheetContext();
    const { handleWeaponHit, handleWeaponDamage, targeting } = useWeaponRolls();
    const casting = useSpellCasting();
    const { activateItem } = useItemUse();
    const [ filter, setFilter ] = useState<TileExecution | null>(null);
    const [ stageMenu, setStageMenu ] = useState<{ anchor: HTMLElement; spell: SpellDTO } | null>(null);

    const combat = campaign?.session?.combat;
    const me = combat?.isActive ? combat.combatants?.find(candidate => candidate.id === charsheet?.id) : undefined;

    const opportunityActive = targeting.opportunity.active;
    const tiles = useMemo(() => {
        if (!charsheet) return [];
        const entries = collectEntries(charsheet.inventory);
        return buildActionTiles({
            weapons: entries.filter(entry => entry.type === 'weapon').map(entry => entry.item as Weapon),
            spells: normalizeToArray<SpellDTO>(charsheet.spells),
            items: entries.filter(entry => entry.type === 'item').map(entry => entry.item as Item),
            opportunityActive,
            spellDetail: (spell) => {
                const unlocked = getSpellProgress(spell, charsheet, { enabled: casting.stageRule }).unlocked;
                const lowest = getSpellMpCost(spell, 1);
                const highest = getSpellMpCost(spell, unlocked);
                return lowest === highest ? `${highest} MP` : `${lowest} a ${highest} MP`;
            }
        });
    }, [ charsheet, casting.stageRule, opportunityActive ]);

    if (!charsheet || !combat || !me) return null;

    // Efeitos que impedem agir (Paralisia: sem ações e sem magias) ou conjurar (Silenciamento): os quadrados ficam sem uso e dizem por quê. É aviso, o mestre remove o efeito para liberar
    const blocks = actionBlocks(me.effects);
    const noActions = isBlocked(blocks, 'no_actions');
    const budget = effectiveBudget(me);
    const acting = combat.phase === 'ACTION';
    const isMyTurn = acting && combat.combatants?.[combat.currentTurnIndex]?.id === me.id;
    const target = targeting.targets.find(candidate => candidate.id === targeting.targetId);

    const visible = filterTiles(tiles, filter);
    const groups = groupTiles(visible);
    const counts = countByExecution(tiles);

    /** O estado do quadrado e o texto da dica: o que ele faz, ou por que não dá para usar agora */
    const describe = (tile: ActionTile): { state: TileState; hint: string; active: boolean } => {
        const active = tile.kind === 'spell' && Boolean(casting.sustainedActive[spellKey(tile.spell)]);
        const cost = tile.execution ? `Gasta a ação ${tile.execution}.` : 'A execução desta magia não é reconhecida: nenhuma ação é gasta.';
        const doing = tile.kind === 'weapon' ? 'Teste de acerto.' : tile.kind === 'spell' ? 'Conjurar.' : 'Usar o item.';

        if (!acting) return { state: 'blocked', hint: 'As ações abrem quando a iniciativa estiver definida.', active };
        if (active) return { state: 'ready', hint: 'Magia sustentada ativa. Clique para desconjurar.', active };
        if (tile.kind === 'spell' && isBlocked(blocks, 'no_spells')) return { state: 'blocked', hint: `${blockReason(blocks, 'no_spells', 'Você')}.`, active };
        if (noActions) return { state: 'spent', hint: `${blockReason(blocks, 'no_actions', 'Você')}.`, active };
        if (isTileSpent(tile, budget)) return { state: 'spent', hint: `Sem a ação ${tile.execution} nesta rodada.`, active };
        if (tile.category === 'attack' && !targeting.targetId) {
            return { state: 'blocked', hint: targeting.targets.length > 0 ? 'Defina o alvo do ataque no campo acima.' : 'Não há alvos no combate.', active };
        }
        if (tile.kind === 'spell' && casting.castingSpellId) return { state: 'blocked', hint: 'Conjurando outra magia...', active };
        return { state: 'ready', hint: `${doing} ${cost}`, active };
    };

    const castFromTile = (spell: SpellDTO, anchor: HTMLElement): void => {
        if (casting.sustainedActive[spellKey(spell)]) {
            void casting.endSustained(spell);
            return;
        }
        // Mais de um estágio liberado: o jogador escolhe qual conjurar (pode ser qualquer um dos liberados)
        if (getSpellProgress(spell, charsheet, { enabled: casting.stageRule }).unlocked > 1) {
            setStageMenu({ anchor, spell });
            return;
        }
        void casting.castSpell(spell, 1);
    };

    const activate = (tile: ActionTile, event: ReactMouseEvent<HTMLElement>): void => {
        if (tile.kind === 'weapon') void handleWeaponHit(tile.weapon, event);
        else if (tile.kind === 'spell') castFromTile(tile.spell, event.currentTarget);
        else if (tile.execution) void activateItem(tile.item, tile.execution, tile.category === 'attack' ? target?.name : undefined);
    };

    /** Dano e Crítico da arma que já acertou e espera o dano; Efetuar da magia conjurada com sucesso */
    const extrasOf = (tile: ActionTile): ReactElement | undefined => {
        if (tile.kind === 'weapon' && findAwaitingDamage(combat.pendingAttacks, me.id, tile.weapon.name, 'weapon')) {
            return (
                <>
                    <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        onClick={(event) => { void handleWeaponDamage(tile.weapon, false, event); }}
                        sx={{ textTransform: 'none', minWidth: 0, px: 1 }}
                    >
                        Dano
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={(event) => { void handleWeaponDamage(tile.weapon, true, event); }}
                        sx={{ textTransform: 'none', minWidth: 0, px: 1 }}
                    >
                        Crítico
                    </Button>
                </>
            );
        }
        if (tile.kind === 'spell') {
            const stage = casting.pendingEffects[spellKey(tile.spell)];
            if (stage) {
                return (
                    <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        disabled={casting.effectingSpellId === spellKey(tile.spell)}
                        onClick={() => { void casting.effectSpell(tile.spell, stage); }}
                        aria-label={`Efetuar ${tile.spell.name}`}
                        sx={{ textTransform: 'none', minWidth: 0, px: 1 }}
                    >
                        Efetuar
                    </Button>
                );
            }
        }
        return undefined;
    };

    return (
        <Section id="acoes" title="Ações" icon={<SportsKabaddi sx={{ color: 'text.secondary' }} />}>
            <Stack spacing={2} data-testid="actions-section">
                <ActionBlocksNotice blocks={blocks} who="Você" />
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <ActionPips budget={budget} />
                    {isMyTurn && <Chip size="small" color="primary" label="Sua vez" />}
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {acting ? 'Quadrado cinza: a ação dele já foi gasta nesta rodada.' : 'As ações abrem quando a iniciativa estiver definida.'}
                    </Typography>
                </Box>

                <Box role="group" aria-label="Filtrar pela ação" sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }} data-testid="actions-filter">
                    <Chip
                        size="small"
                        clickable
                        variant={filter === null ? 'filled' : 'outlined'}
                        color={filter === null ? 'primary' : 'default'}
                        label={`Tudo (${tiles.length})`}
                        onClick={() => { setFilter(null); }}
                    />
                    {TILE_EXECUTIONS.map(execution => (
                        <Chip
                            key={execution}
                            size="small"
                            clickable
                            variant={filter === execution ? 'filled' : 'outlined'}
                            color={filter === execution ? 'primary' : 'default'}
                            label={`${execution} (${counts[execution]})`}
                            aria-pressed={filter === execution}
                            onClick={() => { setFilter(current => (current === execution ? null : execution)); }}
                        />
                    ))}
                </Box>

                {TILE_CATEGORIES.map(category => (
                    <Box key={category} data-testid={`actions-group-${category}`}>
                        <Typography component="h3" sx={{ fontFamily: font.display, fontWeight: 600, fontSize: 15, mb: 1 }}>
                            {TILE_CATEGORY_LABEL[category]}
                            <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>{groups[category].length}</Typography>
                        </Typography>

                        {category === 'attack' && (
                            targeting.enabled
                                ? <Box sx={{ mb: 1.5 }}><AttackTargetPicker targeting={targeting} /></Box>
                                : <Typography variant="caption" component="p" sx={{ color: 'text.secondary', mb: 1 }}>O alvo do ataque é escolhido quando a fase de ação começar.</Typography>
                        )}

                        {groups[category].length === 0 ? (
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {filter ? `Nada de ${TILE_CATEGORY_LABEL[category].toLowerCase()} gasta a ação ${filter}.` : 'Nada por aqui.'}
                            </Typography>
                        ) : (
                            <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'repeat(auto-fill, minmax(124px, 1fr))' }}>
                                {groups[category].map(tile => {
                                    const { state, hint, active } = describe(tile);
                                    return (
                                        <ActionTileButton
                                            key={tile.id}
                                            tile={tile}
                                            state={state}
                                            hint={hint}
                                            active={active}
                                            onActivate={(event) => { activate(tile, event); }}
                                            extras={extrasOf(tile)}
                                        />
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                ))}
            </Stack>

            <Menu anchorEl={stageMenu?.anchor} open={Boolean(stageMenu)} onClose={() => { setStageMenu(null); }}>
                {stageMenu && getSpellProgress(stageMenu.spell, charsheet, { enabled: casting.stageRule }).stages
                    .filter(info => info.status === 'unlocked')
                    .map(info => (
                        <MenuItem
                            key={info.stage}
                            onClick={() => {
                                const { spell } = stageMenu;
                                setStageMenu(null);
                                void casting.castSpell(spell, info.stage);
                            }}
                        >
                            {spellStageLabel(stageMenu.spell.level, info.stage, stageMenu.spell.element)} · {getSpellMpCost(stageMenu.spell, info.stage)} MP
                        </MenuItem>
                    ))}
            </Menu>
        </Section>
    );
}
