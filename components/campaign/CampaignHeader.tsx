'use client'

import { useCampaignContext } from '@contexts'
import type { User } from '@models/entities'
import { ContentCopy, MoreVert } from '@mui/icons-material'
import {
    Avatar,
    Badge,
    Box,
    Button,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Stack,
    Tooltip,
    Typography
} from '@mui/material'
import { campaignService } from '@services'
import { font } from '@themes/tokens'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { useState, type ReactElement } from 'react'
import LeaveCampaignDialog from './LeaveCampaignDialog'

interface PersonProps {
    name: string
    caption: string
    image?: string
    online: boolean
}

/**
 * Participante da campanha. A presença não depende só da cor: o ponto é cheio quando está online e vazado
 * quando não está, a foto fica em tons de cinza e o texto diz "online" ou "offline" (leitor de tela inclusive).
 */
function Person({ name, caption, image, online }: PersonProps): ReactElement {
    const status = online ? 'online' : 'offline'

    return (
        <Stack direction="row" spacing={1.25} alignItems="center" role="listitem" aria-label={`${name}, ${caption}, ${status}`}>
            <Badge
                overlap="circular"
                variant="dot"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                sx={{
                    '& .MuiBadge-badge': {
                        width: 12,
                        height: 12,
                        minWidth: 12,
                        borderRadius: '50%',
                        border: '2px solid',
                        borderColor: online ? 'background.raised' : 'text.disabled',
                        bgcolor: online ? 'success.main' : 'background.raised'
                    }
                }}
            >
                <Avatar
                    src={image || undefined}
                    alt=""
                    sx={{ width: 36, height: 36, filter: online ? 'none' : 'grayscale(100%)', opacity: online ? 1 : 0.75 }}
                >
                    {name.charAt(0).toUpperCase()}
                </Avatar>
            </Badge>
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{name}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap component="div">
                    {caption} · {status}
                </Typography>
            </Box>
        </Stack>
    )
}

/** Faixa no topo da campanha: título, código, mestre e jogadores (quem está online) */
export default function CampaignHeader(): ReactElement {
    const { campaign, users, charsheets, isUserGM } = useCampaignContext()
    const { data: session } = useSession()
    const { enqueueSnackbar } = useSnackbar()
    const router = useRouter()

    const [ copiedCode, setCopiedCode ] = useState(false)
    const [ menuAnchor, setMenuAnchor ] = useState<HTMLElement | null>(null)
    const [ leaveOpen, setLeaveOpen ] = useState(false)
    const [ leaving, setLeaving ] = useState(false)

    const isOnline = (userId?: string): boolean => !!userId && campaign.session.users.includes(userId)
    const onlineCount = users.all.filter(user => isOnline(user.id)).length

    const copyCode = () => {
        navigator.clipboard.writeText(campaign.campaignCode).then(
            () => {
                setCopiedCode(true)
                window.setTimeout(() => { setCopiedCode(false) }, 1500)
            },
            () => { enqueueSnackbar('Não foi possível copiar o código', { variant: 'error' }) }
        )
    }

    // A remoção e o disconnect reescrevem a campanha inteira: disparados juntos, o último a gravar
    // pode devolver o jogador à lista. Por isso só a remoção, aguardada; o disconnect roda ao sair da tela.
    const handleLeave = async () => {
        const userId = session?.user?.id
        if (!userId || !campaign.id || leaving) return

        setLeaving(true)
        try {
            await campaignService.removeUser(campaign.id, userId)
            router.push('/app/campaign')
        } catch (error) {
            console.error('Erro ao sair da campanha:', error)
            enqueueSnackbar('Não foi possível sair da campanha. Tente de novo.', { variant: 'error' })
            setLeaving(false)
        }
    }

    const playerCaption = (user: User): string => user.name ?? 'jogador'

    return (
        <Paper
            component="header"
            sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: 'background.raised', borderRadius: 2 }}
        >
            <Stack direction="row" alignItems="flex-start" spacing={2}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h5" component="h1">{campaign.title}</Typography>
                    {campaign.description && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            title={campaign.description}
                            sx={{ mt: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                        >
                            {campaign.description}
                        </Typography>
                    )}
                </Box>

                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
                    <Tooltip open={copiedCode} title="Copiado!" placement="top" disableHoverListener disableFocusListener disableTouchListener>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ContentCopy fontSize="small" />}
                            onClick={copyCode}
                            aria-label={`Copiar o código da campanha, ${campaign.campaignCode}`}
                            sx={{ fontFamily: font.mono, letterSpacing: '0.04em' }}
                        >
                            {campaign.campaignCode}
                        </Button>
                    </Tooltip>

                    {!isUserGM && (
                        <>
                            <IconButton
                                aria-label="Mais opções da campanha"
                                aria-haspopup="menu"
                                aria-expanded={!!menuAnchor}
                                onClick={(event) => { setMenuAnchor(event.currentTarget) }}
                            >
                                <MoreVert />
                            </IconButton>
                            <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => { setMenuAnchor(null) }}>
                                <MenuItem onClick={() => { setMenuAnchor(null); setLeaveOpen(true) }} sx={{ color: 'error.light' }}>
                                    Sair da campanha
                                </MenuItem>
                            </Menu>
                            <LeaveCampaignDialog
                                open={leaveOpen}
                                campaignTitle={campaign.title}
                                leaving={leaving}
                                onConfirm={handleLeave}
                                onCancel={() => { setLeaveOpen(false) }}
                            />
                        </>
                    )}
                </Stack>
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            <Stack direction="row" flexWrap="wrap" alignItems="center" columnGap={3} rowGap={1.5} role="list" aria-label="Participantes da campanha">
                {users.admin.map(user => (
                    <Person key={user.id} name={user.name ?? 'Mestre'} caption="mestre" image={user.image} online={isOnline(user.id)} />
                ))}
                {users.players.map(user => (
                    <Person
                        key={user.id}
                        name={charsheets.find(sheet => sheet.userId === user.id)?.name ?? playerCaption(user)}
                        caption={playerCaption(user)}
                        image={user.image}
                        online={isOnline(user.id)}
                    />
                ))}
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                    {onlineCount} de {users.all.length} online
                </Typography>
            </Stack>
        </Paper>
    )
}
