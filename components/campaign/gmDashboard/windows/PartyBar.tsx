'use client';

import { useCampaignContext } from '@contexts';
import type { CharsheetDTO } from '@models/dtos';
import { Box, Typography } from '@mui/material';
import { color } from '@themes/tokens';
import { combatantVitals } from '@utils/combatantVitals';
import { isCombatantInTurn } from '@utils/combatTurn';
import { memo, useState, type ReactElement } from 'react';
import { useCharsheetPointsView } from '../useCharsheetPointsView';
import { useGMWindowActions, useGMWindowView } from './GMWindowProvider';
import { PARTY_BAR_WIDTH } from './layout';
import { PartyPortrait, type PortraitVital } from './PartyPortrait';
import SectionMenu from './SectionMenu';
import { windowKey } from './windowKinds';
import { useCombatCreatures, type CombatCreatureEntry } from '../dashboard/useCombatCreatures';

const PartyMember = memo(function PartyMember({ charsheet }: { charsheet: Required<CharsheetDTO> }): ReactElement {
    const { campaign, users } = useCampaignContext();
    const { windows } = useGMWindowView();
    const { openWindow } = useGMWindowActions();
    const view = useCharsheetPointsView(charsheet);
    const [ menuAnchor, setMenuAnchor ] = useState<HTMLElement | null>(null);

    const stats = charsheet.stats;
    const vitals: PortraitVital[] = [];
    if (view.hasLP) vitals.push({ key: 'lp', name: view.lpName, value: stats?.lp ?? 0, max: stats?.maxLp ?? 0, barColor: color.lp });
    if (view.hasMP) vitals.push({ key: 'mp', name: view.mpName, value: stats?.mp ?? 0, max: stats?.maxMp ?? 0, barColor: color.mp });
    if (view.hasAP) vitals.push({ key: 'ap', name: view.apName, value: stats?.ap ?? 0, max: stats?.maxAp ?? 0, barColor: color.ap });

    return (
        <>
            <PartyPortrait
                name={charsheet.name}
                level={charsheet.level}
                image={users.players?.find(user => user.id === charsheet.userId)?.image}
                online={campaign.session?.users?.includes(charsheet.userId) ?? false}
                inTurn={isCombatantInTurn(campaign.session?.combat, charsheet)}
                open={windows.some(entry => entry.key === windowKey('summary', charsheet.id))}
                vitals={vitals}
                onClick={() => openWindow('summary', charsheet.id)}
                onOpenMenu={setMenuAnchor}
            />
            <SectionMenu
                anchorEl={menuAnchor}
                onClose={() => setMenuAnchor(null)}
                charsheetId={charsheet.id}
                charsheetName={charsheet.name}
            />
        </>
    );
});

/** Retrato de um jogador no grupo "Em combate": abre a janela "Em combate" dele (a do resumo continua no retrato do grupo, acima) */
const PlayerCombatMember = memo(function PlayerCombatMember({ charsheet, isCurrentTurn }: { charsheet: Required<CharsheetDTO>; isCurrentTurn: boolean }): ReactElement {
    const { campaign, users } = useCampaignContext();
    const { windows } = useGMWindowView();
    const { openWindow } = useGMWindowActions();
    const view = useCharsheetPointsView(charsheet);

    const stats = charsheet.stats;
    const vitals: PortraitVital[] = [];
    if (view.hasLP) vitals.push({ key: 'lp', name: view.lpName, value: stats?.lp ?? 0, max: stats?.maxLp ?? 0, barColor: color.lp });
    if (view.hasMP) vitals.push({ key: 'mp', name: view.mpName, value: stats?.mp ?? 0, max: stats?.maxMp ?? 0, barColor: color.mp });

    return (
        <PartyPortrait
            name={charsheet.name}
            level={charsheet.level}
            image={users.players?.find(user => user.id === charsheet.userId)?.image}
            online={campaign.session?.users?.includes(charsheet.userId) ?? false}
            inTurn={isCurrentTurn}
            open={windows.some(entry => entry.key === windowKey('combatant', charsheet.id))}
            vitals={vitals}
            actionLabel="Abrir em combate"
            onClick={() => openWindow('combatant', charsheet.id)}
        />
    );
});

/** Retrato de uma criatura em combate: o mesmo molde do jogador, sem presença nem menu de seções */
const CombatantMember = memo(function CombatantMember({ combatant, creature, isCurrentTurn }: CombatCreatureEntry): ReactElement {
    const { windows } = useGMWindowView();
    const { openWindow } = useGMWindowActions();

    const { lp, maxLp, mp, maxMp } = combatantVitals(combatant, creature);

    const vitals: PortraitVital[] = [ { key: 'lp', name: 'Vida', value: lp, max: maxLp, barColor: color.lp } ];
    if (maxMp > 0) vitals.push({ key: 'mp', name: 'Mana', value: mp, max: maxMp, barColor: color.mp });

    return (
        <PartyPortrait
            name={combatant.name || creature.name}
            level={creature.level}
            image={creature.imageUrl || undefined}
            inTurn={isCurrentTurn}
            open={windows.some(entry => entry.key === windowKey('combatant', combatant.id))}
            vitals={vitals}
            actionLabel="Abrir criatura"
            onClick={() => openWindow('combatant', combatant.id)}
        />
    );
});

/**
 * Barra do grupo do mestre: um retrato por jogador, fixa ao lado do conteúdo enquanto a página rola.
 * Com combate ativo, quem está nele (jogadores e criaturas, na ordem do combate) vem num segundo grupo, "Em combate", abaixo, com o mesmo molde de retrato:
 * o clique abre a janela "Em combate" do combatente (a do jogador mostra a ficha dele no combate).
 * Só aparece do `md` em diante; no celular as janelas se abrem pelo menu do cartão do jogador e pelo cartão da criatura.
 */
export default function PartyBar(): ReactElement | null {
    const { campaign, charsheets } = useCampaignContext();
    const { allCreaturesInCombat } = useCombatCreatures();

    if (charsheets.length === 0) return null;

    // O grupo "Em combate" segue a ordem do combate e traz jogadores e criaturas
    const combat = campaign.session?.combat;
    const inCombat = combat?.isActive ? (Array.isArray(combat.combatants) ? combat.combatants : []) : [];
    const currentId = combat?.combatants?.[combat.currentTurnIndex]?.id;
    const combatMembers = inCombat.flatMap(combatant => {
        if (combatant.type === 'player') {
            const charsheet = charsheets.find(sheet => sheet.id === combatant.id);
            return charsheet ? [ { key: combatant.id, node: <PlayerCombatMember key={combatant.id} charsheet={charsheet as unknown as Required<CharsheetDTO>} isCurrentTurn={combatant.id === currentId} /> } ] : [];
        }
        const entry = allCreaturesInCombat.find(candidate => candidate.combatant.id === combatant.id);
        return entry ? [ { key: combatant.id, node: <CombatantMember key={combatant.id} {...entry} /> } ] : [];
    });

    return (
        <Box
            component="nav"
            aria-label="Grupo"
            sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                gap: 1,
                flexShrink: 0,
                width: PARTY_BAR_WIDTH,
                position: 'sticky',
                top: 16,
                alignSelf: 'flex-start',
                maxHeight: 'calc(100vh - 32px)',
                overflowY: 'auto'
            }}
        >
            {charsheets.map(charsheet => (
                <PartyMember key={charsheet.id} charsheet={charsheet as unknown as Required<CharsheetDTO>} />
            ))}

            {combatMembers.length > 0 && (
                <Box
                    role="group"
                    aria-label="Em combate"
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}
                >
                    <Typography aria-hidden sx={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', textAlign: 'center' }}>
                        Em combate
                    </Typography>
                    {combatMembers.map(member => member.node)}
                </Box>
            )}
        </Box>
    );
}
