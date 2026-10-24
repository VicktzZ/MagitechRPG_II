import { Add, Backpack, Block, Bolt, ChatBubbleOutline, RestartAlt, DirectionsRun, LocalPolice, MonetizationOn, MoreVert, Upgrade, ViewList, ViewSidebar } from '@mui/icons-material'
import {
    Box,
    Chip,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    MenuList,
    Paper,
    Typography
} from '@mui/material'
import { memo, useState } from 'react'
import { useCampaignContext } from '@contexts';
import type { CharsheetDTO } from '@models/dtos'
import useNumbersWithSpaces from '@hooks/useNumbersWithSpace'
import { color, font } from '@themes/tokens'
import SheetMetricsView from './SheetMetricsView'
import StatMeter from './StatMeter'
import { getSheetMetrics } from '@utils/charsheetMetrics'
import { isCombatantInTurn } from '@utils/combatTurn'
import { useCharsheetPointsView } from './useCharsheetPointsView'
import { usePlayerActions } from './usePlayerActions'
import { useGMWindowActions } from './windows/GMWindowProvider'
import SectionMenu from './windows/SectionMenu'
import { useQuickEffect } from './actions/useQuickEffect'
import { campaignService } from '@services'
import { errorMessage } from '@utils/errors'
import { enqueueSnackbar } from 'notistack'

/** Texto só para leitor de tela (o rótulo do número ao lado, que a tela mostra por ícone) */
const srOnly = {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap'
} as const

// memo: com as referências de ficha estabilizadas por item (useStableArrayItems),
// só o card do jogador cuja ficha mudou re-renderiza.
function PlayerCard({ charsheet }: { charsheet: Required<CharsheetDTO> }) {
    const { campaign } = useCampaignContext()
    const { customSystem, weightUnit, hasLP, hasMP, hasAP, lpName, mpName, apName } = useCharsheetPointsView(charsheet)
    const { openWindow } = useGMWindowActions()
    const actions = usePlayerActions(charsheet)
    const { openEffectFor, effectDialog } = useQuickEffect(campaign.id)
    // Efeito só vale em combate ativo e para quem está nele
    const inCombat = Boolean(campaign.session?.combat?.isActive && campaign.session.combat.combatants?.some(combatant => combatant.id === charsheet.id))

    // Combate ativo, fase de ação: o cartão de quem joga agora ganha o destaque "Em turno"
    const isMyTurn = isCombatantInTurn(campaign.session?.combat, charsheet)
    const metrics = getSheetMetrics(charsheet, campaign.mode, campaign.session?.combat)
    const [ playerAnchorEl, setPlayerAnchorEl ] = useState<null | HTMLElement>(null)
    const [ sectionAnchorEl, setSectionAnchorEl ] = useState<null | HTMLElement>(null)

    const stats = charsheet.stats
    const spacedMoney = useNumbersWithSpaces()

    const handlePlayerMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setPlayerAnchorEl(event.currentTarget)
    }

    const handlePlayerMenuClose = () => {
        setPlayerAnchorEl(null)
    }

    // Cada item do menu fecha o menu e depois faz a ação
    const afterClosing = (action: () => void) => () => {
        handlePlayerMenuClose()
        action()
    }

    const openSummaryWindow = afterClosing(() => openWindow('summary', charsheet.id))
    const openSectionMenu = () => {
        setSectionAnchorEl(playerAnchorEl)
        handlePlayerMenuClose()
    }

    return (
        <>
            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    bgcolor: 'background.raised',
                    borderRadius: 2,
                    borderColor: isMyTurn ? 'primary.main' : 'divider',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}
            >
                {/* Nome, situação e menu de opções */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 1, rowGap: 0.5 }}>
                            <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                {charsheet.name}
                            </Typography>
                            {isMyTurn && <Chip label="Em turno" size="small" color="primary" />}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            Nv. {charsheet.level} • {charsheet.class as string} • {charsheet.lineage as unknown as string}
                        </Typography>
                    </Box>
                    <IconButton
                        size="small"
                        aria-label={`Opções de ${charsheet.name}`}
                        aria-haspopup="menu"
                        onClick={handlePlayerMenuClick}
                        sx={{ mt: -0.5, mr: -0.5 }}
                    >
                        <MoreVert />
                    </IconButton>
                </Box>

                {/* Medidores de LP, MP e AP (os que o sistema da ficha usa) */}
                {(hasLP || hasMP || hasAP) && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                        {hasLP && (
                            <StatMeter
                                label={customSystem ? lpName : 'LP'}
                                ariaLabel={`${lpName} de ${charsheet.name}`}
                                value={stats?.lp ?? 0}
                                max={stats?.maxLp ?? 0}
                                barColor={color.lp}
                            />
                        )}
                        {hasMP && (
                            <StatMeter
                                label={customSystem ? mpName : 'MP'}
                                ariaLabel={`${mpName} de ${charsheet.name}`}
                                value={stats?.mp ?? 0}
                                max={stats?.maxMp ?? 0}
                                barColor={color.mp}
                            />
                        )}
                        {hasAP && (
                            <StatMeter
                                label={customSystem ? apName : 'AP'}
                                ariaLabel={`${apName} de ${charsheet.name}`}
                                value={stats?.ap ?? 0}
                                max={stats?.maxAp ?? 0}
                                barColor={color.ap}
                            />
                        )}
                    </Box>
                )}

                {/* Dinheiro, munição, carga e deslocamento */}
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        columnGap: 2,
                        rowGap: 0.5,
                        mt: 'auto',
                        pt: 1.5,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        '& .stat': {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: 'text.secondary'
                        },
                        '& .stat svg': { fontSize: 16 },
                        '& .stat .value': { fontSize: 13, fontFamily: font.mono, color: 'text.primary' }
                    }}
                >
                    <Box className="stat">
                        <MonetizationOn aria-hidden />
                        <Box component="span" sx={srOnly}>Dinheiro:</Box>
                        <Typography component="span" className="value">{spacedMoney(charsheet.inventory.money)}</Typography>
                    </Box>

                    {(charsheet.ammoCounter.max > 0 || charsheet.ammoCounter.current > 0) && (
                        <Box className="stat">
                            <LocalPolice aria-hidden />
                            <Box component="span" sx={srOnly}>Munição:</Box>
                            <Typography component="span" className="value">
                                {charsheet.ammoCounter.current}/{charsheet.ammoCounter.max}
                            </Typography>
                        </Box>
                    )}

                    <Box className="stat">
                        <Backpack aria-hidden />
                        <Box component="span" sx={srOnly}>Carga:</Box>
                        <Typography component="span" className="value">
                            {charsheet.capacity.cargo}/{charsheet.capacity.max}{weightUnit ? ` ${weightUnit}` : ''}
                        </Typography>
                    </Box>

                    <Box className="stat">
                        <DirectionsRun aria-hidden />
                        <Box component="span" sx={srOnly}>Deslocamento:</Box>
                        <Typography component="span" className="value">{charsheet.displacement || 0}m</Typography>
                    </Box>

                    <SheetMetricsView metrics={metrics} variant="inline" />
                </Box>
            </Paper>

            {/* Menu de Opções do Jogador */}
            <Menu anchorEl={playerAnchorEl} open={Boolean(playerAnchorEl)} onClose={handlePlayerMenuClose}>
                <Box sx={{ width: 320, maxWidth: '100%' }}>
                    <MenuList>
                        <MenuItem onClick={openSummaryWindow}>
                            <ListItemIcon>
                                <ViewSidebar fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Abrir resumo em janela</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={openSectionMenu}>
                            <ListItemIcon>
                                <ViewList fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Abrir seção da ficha…</ListItemText>
                        </MenuItem>
                        {inCombat && (
                            <MenuItem onClick={afterClosing(() => { openEffectFor({ id: charsheet.id, name: charsheet.name }) })}>
                                <ListItemIcon>
                                    <Bolt fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Aplicar efeito</ListItemText>
                            </MenuItem>
                        )}
                        {inCombat && (
                            <MenuItem onClick={afterClosing(() => {
                                campaignService.resetMpLimit(campaign.id, { combatantId: charsheet.id })
                                    .catch((error: unknown) => { enqueueSnackbar(errorMessage(error, 'Erro ao resetar o limite de MP'), { variant: 'error' }) })
                            })}>
                                <ListItemIcon>
                                    <RestartAlt fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Resetar limite de MP</ListItemText>
                            </MenuItem>
                        )}
                        <MenuItem onClick={afterClosing(actions.openAddItem)}>
                            <ListItemIcon>
                                <Add fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Adicionar item</ListItemText>
                        </MenuItem>
                        {actions.canGrantEvolution && (
                            <MenuItem onClick={afterClosing(() => { void actions.grantEvolutionPoint() })}>
                                <ListItemIcon>
                                    <Upgrade fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Conceder ponto de evolução</ListItemText>
                            </MenuItem>
                        )}
                        <MenuItem onClick={afterClosing(actions.openNotification)}>
                            <ListItemIcon>
                                <ChatBubbleOutline fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Enviar Notificação</ListItemText>
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={afterClosing(actions.openRemove)}>
                            <ListItemIcon>
                                <Block sx={{ color: 'error.main' }} />
                            </ListItemIcon>
                            <ListItemText sx={{ color: 'error.light' }}>Remover</ListItemText>
                        </MenuItem>
                    </MenuList>
                </Box>
            </Menu>

            <SectionMenu
                anchorEl={sectionAnchorEl}
                onClose={() => setSectionAnchorEl(null)}
                charsheetId={charsheet.id}
                charsheetName={charsheet.name}
            />

            {actions.dialogs}
            {effectDialog}
        </>
    )
}

export default memo(PlayerCard)
