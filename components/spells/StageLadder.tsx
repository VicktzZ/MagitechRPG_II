'use client'

import { Bolt, ExpandMore, LockOutlined, Upgrade } from '@mui/icons-material';
import { alpha, Box, Button, ButtonBase, Chip, Collapse, Stack, Tooltip, Typography } from '@mui/material';
import { color } from '@themes/tokens';
import { calculateTotalManaCost } from '@utils/roguelite/spellCost';
import {
    evolutionBlockReason,
    formatEvolutionPoints,
    stageAccessText,
    type SpellProgress,
    type SpellStage,
    type StageInfo
} from '@utils/spellStages';
import { diffAgainst } from '@utils/textDiff';
import { type ReactElement, useMemo, useState } from 'react';

interface LadderSpell {
    name?: string | null;
    level?: unknown;
    element?: unknown;
    mpCost?: unknown;
    stages?: ReadonlyArray<string | null | undefined> | null;
}

export interface StageLadderProps {
    spell: LadderSpell;
    progress: SpellProgress;
    /** Só quem evolui a magia (o jogador) passa isto; sem isso o custo aparece mas não há botão (visão do mestre) */
    evolution?: {
        points: number;
        onEvolve: () => void | Promise<void>;
        busy?: boolean;
    };
    /**
     * Conjurar (campanha): cada estágio liberado tem o próprio botão, com o custo dele; o jogador conjura o estágio mais novo ou qualquer
     * anterior, sem trocar de "estágio ativo".
     */
    cast?: {
        onCast: (stage: SpellStage) => void | Promise<void>;
        isCasting?: boolean;
        /** MP atual de quem conjura; sem MP suficiente para o custo do estágio o botão fica desabilitado */
        currentMp?: number;
        /** Devolve o motivo quando conjurar este estágio (com este custo de MP) estouraria o limite de MP por turno */
        blockedReason?: (stage: SpellStage, cost: number) => string | undefined;
    };
}

/** Texto do custo de um estágio ainda bloqueado, sempre visível (o jogador precisa ver o preço antes de clicar) */
function lockedCostText(info: StageInfo, element: unknown, previous: StageInfo | undefined): string {
    const access = stageAccessText(info.rule, element);
    // O próximo estágio é o que vem agora; os de trás só valem depois do anterior (a maestria também só abre depois do estágio 2)
    if (info.status !== 'next') return `${access}, depois do ${previous?.label ?? 'estágio anterior'}`;
    return info.rule.access === 'mastery' ? `${access}; não se compra com pontos` : access;
}

function StageMark({ children }: { children: string }): ReactElement {
    return (
        <Box
            component="mark"
            data-testid="stage-diff-mark"
            sx={{ bgcolor: alpha(color.amber, 0.18), color: 'inherit', borderRadius: 0.5, px: 0.25, mx: -0.25 }}
        >
            {children}
        </Box>
    );
}

/**
 * Os estágios de uma magia, do primeiro ao último, como uma escada: os liberados ficam abertos (dá para recolher), com o que
 * cada um muda em relação ao anterior destacado, e os bloqueados mostram o custo para liberar.
 */
export default function StageLadder({ spell, progress, evolution, cast }: StageLadderProps): ReactElement {
    const [ collapsed, setCollapsed ] = useState<ReadonlySet<number>>(new Set());
    const level = Number(spell.level) || 1;
    const baseCost = Number(spell.mpCost) || 0;
    const texts = spell.stages ?? [];

    const costOf = (stage: number): number => calculateTotalManaCost(baseCost, level, stage - 1);
    const diffs = useMemo(
        () => progress.stages.map(info => (info.stage > 1 && info.status === 'unlocked'
            ? diffAgainst(texts[info.stage - 2], texts[info.stage - 1])
            : null)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ progress.stages, texts.join('\u0000') ]
    );

    const unlockedStages = progress.stages.filter(info => info.status === 'unlocked');
    const allCollapsed = unlockedStages.every(info => collapsed.has(info.stage));
    const hasMarks = diffs.some(diff => diff && diff.changedWords > 0 && !diff.rewritten);

    const toggle = (stage: number): void => {
        setCollapsed(current => {
            const next = new Set(current);
            if (next.has(stage)) next.delete(stage);
            else next.add(stage);
            return next;
        });
    };
    const toggleAll = (): void => {
        setCollapsed(allCollapsed ? new Set() : new Set(unlockedStages.map(info => info.stage)));
    };

    const blockReason = evolution ? evolutionBlockReason(progress, evolution.points, spell.element) : null;
    const canPay = evolution !== undefined && progress.nextCost !== null && evolution.points >= progress.nextCost;

    return (
        <Stack spacing={1} data-testid="stage-ladder">
            {(unlockedStages.length > 1 || hasMarks) && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="caption" color="text.secondary">
                        {hasMarks ? 'O destaque mostra o que é novo em relação ao estágio anterior.' : 'Estágios liberados desta magia.'}
                    </Typography>
                    {unlockedStages.length > 1 && (
                        <Button size="small" color="secondary" onClick={toggleAll} data-testid="stage-toggle-all" sx={{ py: 0, minHeight: 28 }}>
                            {allCollapsed ? 'Expandir estágios' : 'Recolher estágios'}
                        </Button>
                    )}
                </Box>
            )}

            <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
                {progress.stages.map((info, index) => {
                    const unlocked = info.status === 'unlocked';
                    const cost = costOf(info.stage);
                    const castBlocked = unlocked && cast ? cast.blockedReason?.(info.stage, cost) : undefined;
                    const open = unlocked && !collapsed.has(info.stage);
                    const previous = progress.stages[index - 1];
                    const diff = diffs[index];
                    const text = texts[info.stage - 1];
                    const delta = previous ? cost - costOf(previous.stage) : 0;
                    const isNext = info.status === 'next';

                    return (
                        <Box
                            component="li"
                            key={info.stage}
                            data-testid={`stage-row-${info.stage}`}
                            data-status={info.status}
                            sx={{
                                position: 'relative',
                                ml: 1,
                                pl: 2.5,
                                pb: index === progress.stages.length - 1 ? 0 : 1.5,
                                borderLeft: '2px solid',
                                borderColor: index === progress.stages.length - 1
                                    ? 'transparent'
                                    : unlocked && progress.stages[index + 1]?.status === 'unlocked' ? color.amberLine : 'divider',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    left: -7,
                                    top: 10,
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    border: '2px solid',
                                    borderColor: unlocked ? color.amber : color.borderStrong,
                                    bgcolor: unlocked ? color.amber : 'background.default'
                                }
                            }}
                        >
                            {unlocked ? (
                                <Box
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 2,
                                        bgcolor: 'background.raised',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', pr: 1 }}>
                                        <ButtonBase
                                            onClick={() => { toggle(info.stage) }}
                                            aria-expanded={open}
                                            aria-controls={`stage-body-${info.stage}`}
                                            data-testid={`stage-toggle-${info.stage}`}
                                            sx={{ flex: 1, minWidth: 160, justifyContent: 'flex-start', gap: 1, px: 1.5, py: 1, textAlign: 'left' }}
                                        >
                                            <ExpandMore
                                                fontSize="small"
                                                sx={{ color: 'text.secondary', transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform 120ms' }}
                                            />
                                            <Typography variant="subtitle2" component="span" sx={{ fontWeight: 700 }}>
                                                {info.label}
                                            </Typography>
                                            {info.byMastery && <Chip size="small" variant="outlined" label="Aberta pela maestria" />}
                                        </ButtonBase>

                                        <Tooltip title={previous ? `Custo total ${cost} MP (${delta >= 0 ? '+' : ''}${delta} em relação ao ${previous.label})` : `Custo total ${cost} MP`}>
                                            <Chip
                                                size="small"
                                                label={previous ? `${cost} MP (${delta >= 0 ? '+' : ''}${delta})` : `${cost} MP`}
                                                data-testid={`stage-cost-${info.stage}`}
                                                sx={{ bgcolor: alpha(color.mp, 0.14), color: color.mp, fontWeight: 600 }}
                                            />
                                        </Tooltip>

                                        {cast && (
                                            <Tooltip
                                                title={cast.currentMp !== undefined && cast.currentMp < cost
                                                    ? `MP insuficiente (precisa de ${cost})`
                                                    : castBlocked ?? `Conjurar o ${info.label} — gasta ${cost} MP`}
                                            >
                                                <span>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        startIcon={<Bolt fontSize="small" />}
                                                        disabled={cast.isCasting || (cast.currentMp !== undefined && cast.currentMp < cost)}
                                                        onClick={() => { void cast.onCast(info.stage) }}
                                                        aria-label={`Conjurar ${spell.name ?? 'a magia'} no ${info.label}`}
                                                        data-testid={`stage-cast-${info.stage}`}
                                                        sx={{ textTransform: 'none', fontWeight: 700, opacity: castBlocked ? 0.55 : 1 }}
                                                    >
                                                        Conjurar
                                                    </Button>
                                                </span>
                                            </Tooltip>
                                        )}
                                    </Box>

                                    <Collapse in={open} unmountOnExit>
                                        <Box id={`stage-body-${info.stage}`} sx={{ px: 1.5, pb: 1.5, pt: 0.5 }}>
                                            {text ? (
                                                <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                                    {diff && diff.changedWords > 0 && !diff.rewritten
                                                        ? diff.segments.map((segment, segmentIndex) => (segment.changed
                                                            ? <StageMark key={segmentIndex}>{segment.text}</StageMark>
                                                            : <span key={segmentIndex}>{segment.text}</span>))
                                                        : text}
                                                </Typography>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">Sem descrição para este estágio.</Typography>
                                            )}
                                            {diff?.rewritten && previous && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                    Texto novo, bem diferente do {previous.label}.
                                                </Typography>
                                            )}
                                        </Box>
                                    </Collapse>
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        flexWrap: 'wrap',
                                        border: '1px dashed',
                                        borderColor: 'divider',
                                        borderRadius: 2,
                                        px: 1.5,
                                        py: 1
                                    }}
                                >
                                    <LockOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
                                    <Typography variant="subtitle2" component="span" color="text.secondary" sx={{ fontWeight: 700 }}>
                                        {info.label}
                                    </Typography>
                                    <Chip size="small" variant="outlined" label="Bloqueado" aria-label={`${info.label} bloqueado`} />
                                    <Typography variant="body2" color="text.secondary" data-testid={`stage-requirement-${info.stage}`} sx={{ flex: 1, minWidth: 180 }}>
                                        {lockedCostText(info, spell.element, previous)}
                                    </Typography>
                                    {isNext && evolution && progress.nextCost !== null && (
                                        <Tooltip title={blockReason ?? `Gasta ${formatEvolutionPoints(progress.nextCost)} (você tem ${evolution.points})`} arrow>
                                            <span>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<Upgrade fontSize="small" />}
                                                    disabled={!canPay || evolution.busy}
                                                    onClick={() => { void evolution.onEvolve() }}
                                                    aria-label={`Evoluir ${spell.name ?? 'a magia'} para o ${info.label}`}
                                                    data-testid="stage-evolve"
                                                    sx={{ textTransform: 'none' }}
                                                >
                                                    {`Evoluir (${progress.nextCost} ${progress.nextCost === 1 ? 'ponto' : 'pontos'})`}
                                                </Button>
                                            </span>
                                        </Tooltip>
                                    )}
                                    {isNext && evolution && progress.nextCost !== null && blockReason && (
                                        <Typography variant="caption" color="text.secondary" sx={{ flexBasis: '100%' }} data-testid="stage-evolve-reason">
                                            {blockReason}
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </Box>
                    );
                })}
            </Box>
        </Stack>
    );
}
