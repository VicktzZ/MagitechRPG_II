'use client';

import BoltIcon from '@mui/icons-material/Bolt';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import { alpha, Avatar, Box, Button, Chip, Collapse, IconButton, MenuItem, TextField, Tooltip, Typography } from '@mui/material';
import type { Combatant, Creature } from '@models';
import { color, font } from '@themes/tokens';
import type { MpLimitView } from '@utils/combat/combatPanel';
import { combatantBudget, combatantPerRound } from '@utils/combat/actionBudgets';
import { combatantSide, SIDE_LABEL } from '@utils/combat/sides';
import { initialsOf } from '@utils/combat/turnOrder';
import type { CombatantVitals } from '@utils/combatantVitals';
import { useState, type ReactElement } from 'react';
import ActionPips from '../../ActionPips';
import StatMeter from '../StatMeter';
import EffectBadges from '../actions/EffectBadges';
import CreatureSkills from '../dashboard/CreatureSkills';
import InitiativeControl from './InitiativeControl';
import MpLimitMenu from './MpLimitMenu';
import type { CombatantActions } from './useCombatantActions';

interface CombatantRowProps {
    combatant: Combatant;
    phase: 'INITIATIVE' | 'ACTION' | 'ENDED';
    current: boolean;
    vitals: CombatantVitals;
    mp: MpLimitView;
    /** A criatura de origem, só no combatente que é criatura (habilita as perícias) */
    creature?: Creature;
    actions: CombatantActions;
    /** Os jogadores que podem controlar um invocado (ID do usuário e nome); vazio esconde o seletor */
    controllers?: ReadonlyArray<{ id: string; name: string }>;
    /** Esperando o servidor (iniciativa): os botões de rolar ficam desabilitados */
    busy: boolean;
    onRollInitiative: (combatantId: string, value?: number) => void;
}

/**
 * Um combatente na lista do painel do mestre, numa linha enxuta: retrato, nome, vida e mana, o gasto do limite de MP, as ações da rodada e os efeitos. Quem tem a vez
 * leva o filete âmbar. A criatura tem as perícias recolhidas ("Perícias"): são 44 botões, abertos só quando o mestre precisa rolar uma.
 */
export default function CombatantRow({ combatant, phase, current, vitals, mp, creature, actions, controllers = [], busy, onRollInitiative }: CombatantRowProps): ReactElement {
    const [ skillsOpen, setSkillsOpen ] = useState(false);
    const isPlayer = combatant.type === 'player';
    const side = combatantSide(combatant);
    const hasEffects = Array.isArray(combatant.effects) && combatant.effects.length > 0;
    const controller = controllers.find(option => option.id === combatant.controllerId);
    const mpSpentColor = mp.released ? 'success.main' : mp.spent >= mp.limit ? 'error.light' : 'text.secondary';

    return (
        <Box
            component="li"
            data-testid={`combatant-row-${combatant.id}`}
            data-current={current ? 'true' : undefined}
            sx={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                p: 1.5,
                border: '1px solid',
                borderColor: current ? 'primary.main' : 'divider',
                borderLeftWidth: current ? 3 : 1,
                borderRadius: 2,
                bgcolor: current ? color.amberSubtle : 'background.raised'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Avatar
                    src={combatant.avatar}
                    alt=""
                    sx={{
                        width: 32,
                        height: 32,
                        fontSize: 13,
                        fontFamily: font.mono,
                        color: isPlayer ? 'text.primary' : 'warning.light',
                        bgcolor: isPlayer ? 'background.paper' : alpha(color.warning, 0.14),
                        border: '1px solid',
                        borderColor: isPlayer ? 'divider' : 'warning.main'
                    }}
                >
                    {initialsOf(combatant.name)}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 140, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 700 }}>{combatant.name}</Typography>
                    {current && <Chip size="small" label="Em turno" sx={{ height: 20, fontSize: 12, fontWeight: 700, bgcolor: 'primary.main', color: color.onAmber }} />}
                    {!isPlayer && <Chip size="small" variant="outlined" label={combatant.controllerId ? `Invocado por ${controller?.name ?? 'um jogador'}` : 'Criatura'} data-testid={`combatant-kind-${combatant.id}`} sx={{ height: 20, fontSize: 12 }} />}
                    <Tooltip title="Lado no combate. Auras, curas em grupo e áreas usam o lado. Clique para trocar.">
                        <Chip
                            size="small"
                            variant="outlined"
                            color={side === 'ally' ? 'success' : 'error'}
                            label={SIDE_LABEL[side]}
                            data-testid={`combatant-side-${combatant.id}`}
                            onClick={() => { void actions.toggleSide(combatant); }}
                            aria-label={`Lado de ${combatant.name}: ${SIDE_LABEL[side]}. Trocar`}
                            sx={{ height: 20, fontSize: 12 }}
                        />
                    </Tooltip>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                    {!isPlayer && controllers.length > 0 && (
                        <TextField
                            select
                            size="small"
                            value={combatant.controllerId ?? ''}
                            onChange={(event) => { const id = event.target.value; void actions.setController(combatant, id || null, controllers.find(option => option.id === id)?.name); }}
                            SelectProps={{ displayEmpty: true, renderValue: (value) => (value ? `Controle: ${controllers.find(option => option.id === value)?.name ?? 'jogador'}` : 'Controle: mestre') }}
                            inputProps={{ 'aria-label': `Quem controla ${combatant.name}` }}
                            sx={{ width: 170, '& .MuiSelect-select': { py: 0.5, fontSize: 12 } }}
                            data-testid={`combatant-controller-${combatant.id}`}
                        >
                            <MenuItem value="">Mestre</MenuItem>
                            {controllers.map(option => <MenuItem key={option.id} value={option.id}>{`Invocado por ${option.name}`}</MenuItem>)}
                        </TextField>
                    )}
                    {phase === 'INITIATIVE' ? (
                        <InitiativeControl
                            name={combatant.name}
                            isPlayer={isPlayer}
                            total={combatant.initiativeRoll === 0 ? 0 : combatant.initiativeTotal}
                            disabled={busy}
                            onRoll={(value) => { onRollInitiative(combatant.id, value); }}
                        />
                    ) : (
                        <Typography sx={{ fontSize: 12, fontFamily: font.mono, color: 'text.secondary', mr: 0.5 }}>Init {combatant.initiativeTotal}</Typography>
                    )}
                    <Tooltip title="Dano">
                        <IconButton size="small" aria-label={`Aplicar dano em ${combatant.name}`} onClick={() => { actions.damageHeal('damage', combatant); }}>
                            <WhatshotIcon fontSize="small" sx={{ color: 'error.main' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Cura">
                        <IconButton size="small" aria-label={`Aplicar cura em ${combatant.name}`} onClick={() => { actions.damageHeal('heal', combatant); }}>
                            <LocalHospitalIcon fontSize="small" sx={{ color: 'success.main' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Aplicar efeito">
                        <IconButton size="small" aria-label={`Aplicar efeito em ${combatant.name}`} onClick={() => { actions.applyEffect(combatant); }}>
                            <BoltIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {mp.enforced && (
                        <MpLimitMenu
                            name={combatant.name}
                            released={mp.released}
                            onSetSpent={() => { actions.setMpSpent(combatant, mp); }}
                            onReset={() => { void actions.resetMpLimit(combatant.id); }}
                            onRelease={(enabled) => { void actions.releaseMpLimit(combatant.id, enabled); }}
                        />
                    )}
                    <Tooltip title="Abrir em janela">
                        <IconButton size="small" aria-label={`Abrir ${combatant.name} em janela`} onClick={() => { actions.openWindow(combatant); }}>
                            <OpenInNewIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: { xs: 1.5, sm: 2 }, maxWidth: 520 }}>
                <StatMeter label="LP" ariaLabel={`Vida de ${combatant.name}`} value={vitals.lp} max={vitals.maxLp} barColor={color.lp} />
                <StatMeter label="MP" ariaLabel={`Mana de ${combatant.name}`} value={vitals.mp} max={vitals.maxMp} barColor={color.mp} />
            </Box>

            {mp.enforced && (
                <Typography sx={{ fontSize: 12, color: mpSpentColor }} data-testid={`mp-limit-${combatant.id}`}>
                    MP no turno: <Box component="span" sx={{ fontFamily: font.mono }}>{mp.spent}/{mp.limit}</Box>{mp.released ? ' (liberado)' : ''}
                </Typography>
            )}

            {phase === 'ACTION' && (
                <ActionPips
                    budget={combatantBudget(combatant)}
                    perRound={combatantPerRound(combatant)}
                    busy={actions.togglingAction}
                    onSelect={(slot, available) => { void actions.toggleAction(combatant.id, slot, available); }}
                    onGrant={() => { actions.grantActions(combatant); }}
                    ownerName={combatant.name}
                />
            )}

            {hasEffects && <EffectBadges effects={combatant.effects ?? []} canRemove onRemove={(id) => { void actions.removeEffect(combatant.id, id); }} />}

            {creature && (
                <>
                    <Box>
                        <Button
                            size="small"
                            variant="text"
                            aria-expanded={skillsOpen}
                            endIcon={skillsOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                            onClick={() => { setSkillsOpen(open => !open); }}
                            sx={{ textTransform: 'none' }}
                        >
                            Perícias
                        </Button>
                    </Box>
                    <Collapse in={skillsOpen} unmountOnExit>
                        <CreatureSkills
                            creature={creature}
                            combatant={combatant}
                            onRoll={async (name, expertise) => await actions.rollCreatureExpertise(name, expertise, creature, combatant)}
                        />
                    </Collapse>
                </>
            )}
        </Box>
    );
}
