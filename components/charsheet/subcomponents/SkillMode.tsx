'use client';

import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { findPassive, type PassiveDef, type PassiveMode, type PassiveSource } from '@utils/combat/passives';
import { normalizeToArray } from '@utils/normalizeToArray';
import type { ReactElement } from 'react';

/**
 * Como o app trata a habilidade de classe ou subclasse (ver `utils/combat/passives`): automática (aplica sozinho), ativada (quadrado na seção Ações, em combate) ou só texto
 * (o mestre aplica). Serve à lista de habilidades da ficha e da campanha (`Skills`).
 */
export const SKILL_MODE_LABEL: Record<PassiveMode, { label: string; hint: string }> = {
    automatica: { label: 'Automática', hint: 'O app aplica sozinho nas rolagens e no combate.' },
    ativada: { label: 'Ativada', hint: 'Aparece como quadrado na seção Ações, em combate: o app gasta o MP e a ação e conta os usos.' },
    texto: { label: 'Só texto', hint: 'O app só mostra a descrição; quem aplica é o mestre.' }
};

interface SkillModeInfo {
    source: PassiveSource;
    mode: PassiveMode;
    def: PassiveDef | undefined;
}

type SkillLists = { class?: unknown; subclass?: unknown } | null | undefined;

/** A habilidade está na lista de classe ou de subclasse da ficha (as outras, como linhagem, raça e bônus, não são passivas de combate) */
export function skillSource(skills: SkillLists, name: string): PassiveSource | null {
    if (normalizeToArray<{ name?: string }>(skills?.class).some(skill => skill?.name === name)) return 'class';
    if (normalizeToArray<{ name?: string }>(skills?.subclass).some(skill => skill?.name === name)) return 'subclass';
    return null;
}

/** O modo da habilidade; `null` para o que não é passiva de combate (outras origens) e em ficha de sistema customizado (as habilidades dela têm outras regras) */
export function skillModeOf(skills: SkillLists, systemId: unknown, name: string): SkillModeInfo | null {
    if (systemId) return null;
    const source = skillSource(skills, name);
    if (!source) return null;
    const def = findPassive(source, name);
    return { source, def, mode: def?.mode ?? 'texto' };
}

/** O texto curto do cartão ("Ativada"), só para o que o app trata de fato; "Só texto" é o padrão e não vale a pena repetir em cada cartão */
export const skillModeTag = (info: SkillModeInfo | null): string => (info && info.mode !== 'texto' ? SKILL_MODE_LABEL[info.mode].label : '');

/** O rótulo do modo e, nas habilidades já estruturadas, o que o app **não** faz sozinho; usado no painel de detalhe da habilidade */
export default function SkillMode({ info }: { info: SkillModeInfo | null }): ReactElement | null {
    if (!info) return null;
    const config = SKILL_MODE_LABEL[info.mode];

    return (
        <Box data-testid="skill-mode-detail">
            <Tooltip title={config.hint}>
                <Chip size="small" variant="outlined" label={config.label} data-testid="skill-mode" sx={{ fontWeight: 600 }} />
            </Tooltip>
            <Typography variant="body2" component="p" sx={{ color: 'text.secondary', mt: 0.75 }}>{config.hint}</Typography>
            {info.def?.pending && (
                <Typography variant="body2" component="p" sx={{ color: 'text.secondary', mt: 0.75 }}>
                    Fora do automático: {info.def.pending}
                </Typography>
            )}
        </Box>
    );
}
