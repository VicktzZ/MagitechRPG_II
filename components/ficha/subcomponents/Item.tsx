/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { itemAttributes, rarityColor, toastDefault } from '@constants'
import { WarningModal } from '@layout'
import {
    ArrowDropDown,
    ArrowDropUp,
    DeleteForever,
    Diamond,
    Edit,
    FitnessCenter,
    InfoOutlined,
    Inventory2
} from '@mui/icons-material'
import {
    alpha,
    Avatar,
    Badge,
    Box, Button,
    Chip,
    Collapse,
    Divider,
    IconButton,
    Paper,
    Stack,
    TextField, Typography, useTheme
} from '@mui/material'
import type {
    Ficha,
    Inventory,
    ItemTyping,
    MergedItems
} from '@types'
import { useSnackbar } from 'notistack'
import { type ReactElement, useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { ItemWrapperModal } from '../dialogs/ItemWrapperModal'
import { Armor } from './Armor'
import { Weapon } from './Weapon'

// TODO: ADICIONAR OPÇÃO PARA EDITAR ITENS

function ItemComponent(props: ItemTyping<'item'>): ReactElement {
    const theme = useTheme()
    const [ showDescription, setShowDescription ] = useState(false)

    // Formata a quantidade se existir
    const formattedQuantity = useMemo(() => {
        return props.quantity ? `${props.quantity}x` : '1x'
    }, [ props.quantity ])

    return (
        <Box height='100%' display='flex' flexDirection='column' justifyContent='space-between'>
            {/* Seção principal de informações */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    backgroundColor: alpha(theme.palette.background.paper, 0.3),
                    borderRadius: 2,
                    border: `1px solid ${alpha('#66bb6a', 0.2)}`
                }}
            >
                <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                        INFORMAÇÕES DO ITEM
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={() => setShowDescription(!showDescription)}
                        sx={{
                            transform: showDescription ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s'
                        }}
                    >
                        {showDescription ? <ArrowDropUp /> : <ArrowDropDown />}
                    </IconButton>
                </Stack>

                {/* Badges com informações principais */}
                <Stack direction="row" spacing={1} mb={2}>
                    <Badge
                        badgeContent={formattedQuantity}
                        color="success"
                        sx={{
                            '& .MuiBadge-badge': {
                                fontWeight: 'bold',
                                fontSize: '0.7rem'
                            }
                        }}
                    >
                        <Avatar
                            variant="rounded"
                            sx={{
                                width: 48,
                                height: 48,
                                backgroundColor: alpha(theme.palette.success.main, 0.1)
                            }}
                        >
                            <Inventory2 color="success" />
                        </Avatar>
                    </Badge>

                    <Badge
                        badgeContent={`${props.weight}kg`}
                        color="default"
                        sx={{
                            '& .MuiBadge-badge': {
                                fontWeight: 'bold',
                                fontSize: '0.7rem'
                            }
                        }}
                    >
                        <Avatar
                            variant="rounded"
                            sx={{
                                width: 48,
                                height: 48,
                                backgroundColor: alpha(theme.palette.grey[500], 0.1)
                            }}
                        >
                            <FitnessCenter color="action" />
                        </Avatar>
                    </Badge>
                </Stack>

                {/* Descrição do item - expansível */}
                <Collapse in={showDescription}>
                    <Box
                        p={1.5}
                        bgcolor={alpha(theme.palette.success.main, 0.05)}
                        borderRadius={1}
                        border={`1px dashed ${alpha(theme.palette.success.main, 0.3)}`}
                        mb={1}
                    >
                        <Typography variant="body2" color="textSecondary" sx={{ fontStyle: props.effects ? 'normal' : 'italic' }}>
                            {props.effects ?? 'Este item não possui efeitos especiais.'}
                        </Typography>
                    </Box>
                </Collapse>

                {/* Tags relacionadas ao item */}
                <Box mt={1}>
                    <Stack direction="row" flexWrap="wrap" spacing={0.5}>
                        {[ props.kind ].map((tag, index) => (
                            <Chip
                                key={index}
                                label={tag}
                                size="small"
                                variant="outlined"
                                sx={{
                                    borderColor: alpha(theme.palette.success.main, 0.3),
                                    color: theme.palette.success.main,
                                    fontSize: '0.7rem'
                                }}
                            />
                        ))}
                    </Stack>
                </Box>
            </Paper>
        </Box>
    )
}

function ItemWrapper({
    children,
    title
    ,
    item
}: {
    children: ReactElement,
    title: string,
    description: string,
    item: MergedItems<'Leve' | 'Pesada'>
}): ReactElement {
    const theme = useTheme()
    const { getValues, setValue } = useFormContext<Ficha>()

    const [ open, setOpen ] = useState(false)
    const [ , setShowTooltip ] = useState(false)
    const [ confirmModalOpen, setConfirmModalOpen ] = useState(false)
    const [ hovered, setHovered ] = useState(false)

    const { enqueueSnackbar } = useSnackbar()

    // Determina o tipo de item baseado nas propriedades
    const itemType: 'weapon' | 'armor' | 'item' =
        'ammo' in item ? 'weapon' :
            'displacementPenalty' in item ? 'armor' :
                'item'

    // Obtém os atributos visuais do tipo de item
    const itemAttr = itemAttributes[itemType]

    // Função para excluir o item
    const onConfirm = async (): Promise<void> => {
        const currentValues = getValues()
        const inventoryKey = `${itemType}s` as keyof Inventory
        const currentItems = [ ...currentValues.inventory[inventoryKey] as any[] ]
        const updatedItems = currentItems.filter((i: any) => i.name !== item.name)

        setValue(`inventory.${inventoryKey}`, updatedItems, { shouldValidate: true })

        setConfirmModalOpen(false)
        setOpen(false)
        enqueueSnackbar(
            `${item.name} excluído(a) com sucesso!`,
            toastDefault('itemDeleted', 'success')
        )
    }

    // Obtém a cor da raridade ou usa um fallback
    const getItemRarityColor = () => {
        return rarityColor[item.rarity] || '#9e9e9e' // Usa cinza como fallback
    }

    const rarityGlowAnimation = {
        '@keyframes rarityGlow': {
            '0%': {
                boxShadow: `0 0 5px ${alpha(getItemRarityColor(), 0.4)}, 
                   0 0 10px ${alpha(getItemRarityColor(), 0.2)}`
            },
            '50%': {
                boxShadow: `0 0 15px ${alpha(getItemRarityColor(), 0.6)}, 
                    0 0 20px ${alpha(getItemRarityColor(), 0.3)}`
            },
            '100%': {
                boxShadow: `0 0 5px ${alpha(getItemRarityColor(), 0.4)}, 
                    0 0 10px ${alpha(getItemRarityColor(), 0.2)}`
            }
        }
    }

    // Efeito de iluminação para o cartão do item
    const getCardGlow = () => {
        if (item.rarity === 'Comum' || item.rarity === 'Amaldiçoado') {
            return {}
        }

        return {
            animation: hovered ? 'rarityGlow 2s infinite' : 'none'
        }
    }

    return (
        <>
            <Paper
                elevation={hovered ? 12 : 4}
                onMouseEnter={() => { setHovered(true); setTimeout(() => setShowTooltip(true), 600) }}
                onMouseLeave={() => { setHovered(false); setShowTooltip(false) }}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '22rem',
                    width: { xs: '100%', sm: '18rem' },
                    backgroundColor: alpha(theme.palette.background.paper, 0.7),
                    border: `2px solid ${alpha(getItemRarityColor(), hovered ? 0.8 : 0.4)}`,
                    borderRadius: 4,
                    p: 2,
                    gap: 2,
                    transition: 'all .3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: hovered ? 'translateY(-8px) scale(1.03)' : 'translateY(0) scale(1)',
                    position: 'relative',
                    overflow: 'hidden',
                    ...getCardGlow(),
                    ...rarityGlowAnimation,
                    '&::before': item.rarity !== 'Comum' && item.rarity !== 'Amaldiçoado' ? {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: -100,
                        width: '50px',
                        height: '100%',
                        background: `linear-gradient(to right, transparent, ${alpha(getItemRarityColor(), 0.3)}, transparent)`,
                        transform: 'skewX(-25deg)',
                        animation: hovered ? 'shine 2.5s infinite' : 'none',
                        '@keyframes shine': {
                            '0%': { left: '-100px' },
                            '50%': { left: '200%' },
                            '100%': { left: '200%' }
                        }
                    } : {}
                }}
            >
                {/* Badge de tipo de item */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        backgroundColor: itemAttr.color,
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        borderRadius: '10px',
                        py: 0.3,
                        px: 1,
                        minWidth: '20px',
                        textAlign: 'center'
                    }}
                >
                    {itemAttr.label}
                </Box>

                {/* Header de raridade */}
                <Box
                    py={0.5}
                    px={1}
                    sx={{
                        background: `linear-gradient(90deg, 
                ${alpha(getItemRarityColor(), 0)} 0%, 
                ${alpha(getItemRarityColor(), 0.15)} 50%, 
                ${alpha(getItemRarityColor(), 0)} 100%)`,
                        borderRadius: 2
                    }}
                >
                    <Typography
                        fontFamily='Sakana'
                        width='100%'
                        textAlign='center'
                        fontSize="1rem"
                        color={getItemRarityColor()}
                        sx={{
                            textShadow: hovered ? `0 0 8px ${alpha(getItemRarityColor(), 0.7)}` : 'none',
                            transition: 'text-shadow 0.3s ease'
                        }}
                    >
                        {item.rarity?.toUpperCase()}
                    </Typography>
                </Box>

                {/* Título do item e botão de edição */}
                <Box
                    display='flex'
                    alignItems='center'
                    justifyContent='space-between'
                    borderBottom={`1px solid ${alpha(theme.palette.divider, 0.5)}`}
                    pb={1}
                    mt={1}
                >
                    <Typography
                        fontWeight="bold"
                        fontSize="1.1rem"
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 'calc(100% - 40px)'
                        }}
                    >
                        {title}
                    </Typography>
                    <IconButton
                        onClick={() => { setOpen(true) }}
                        size="small"
                        sx={{
                            border: `1px solid ${alpha(itemAttr.color, 0.3)}`,
                            color: itemAttr.color,
                            transition: 'all 0.2s',
                            '&:hover': {
                                backgroundColor: alpha(itemAttr.color, 0.05),
                                transform: 'scale(1.1)'
                            }
                        }}
                    >
                        <Edit fontSize="small" />
                    </IconButton>
                </Box>

                {/* Ícone do tipo de item */}
                <Box
                    display="flex"
                    justifyContent="center"
                    my={1.5}
                    sx={{ position: 'relative' }}
                >
                    <Avatar
                        sx={{
                            width: 60,
                            height: 60,
                            backgroundColor: alpha(itemAttr.color, 0.1),
                            border: `2px solid ${alpha(itemAttr.color, 0.3)}`,
                            color: itemAttr.color
                        }}
                    >
                        <itemAttr.icon fontSize="medium" />
                    </Avatar>
                </Box>

                {/* Conteúdo principal */}
                <Box flex={1}>
                    {children}
                </Box>
            </Paper>

            {/* Modal de detalhes/edição */}
            {open && (
                <ItemWrapperModal
                    open={open}
                    onClose={() => { setOpen(false) }}
                    itemType={itemType}
                >
                    <>
                        {/* Cabeçalho do modal com título, descrição e botão de exclusão */}
                        <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
                            <Box>
                                <Box display="flex" alignItems="center" gap={1.5}>
                                    <Avatar
                                        sx={{
                                            bgcolor: alpha(getItemRarityColor(), 0.2),
                                            color: getItemRarityColor()
                                        }}
                                    >
                                        <Diamond />
                                    </Avatar>
                                    <Box>
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                            <Typography variant='h6' fontWeight="bold">{item.name}</Typography>
                                            <Chip
                                                label={item.rarity?.toUpperCase()}
                                                size="small"
                                                sx={{
                                                    backgroundColor: alpha(getItemRarityColor(), 0.1),
                                                    color: getItemRarityColor(),
                                                    fontWeight: 'bold',
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                        </Box>
                                        <Typography variant='body2' color="text.secondary">{item.description}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Button
                                onClick={() => { setConfirmModalOpen(true) }}
                                variant='outlined'
                                color="error"
                                startIcon={<DeleteForever />}
                                sx={{ fontWeight: 'bold' }}
                            >
                                Excluir item
                            </Button>
                        </Box>

                        {/* Divisor */}
                        <Divider sx={{ mb: 3 }} />

                        {/* Área de edição de atributos do item */}
                        <Box display="flex" flexDirection="column" gap={3}>
                            <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
                                Propriedades do {itemAttr.label}
                            </Typography>

                            {/* Grid de campos de edição */}
                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                flexWrap="wrap"
                                gap={2}
                            >
                                {itemType === 'weapon' ? (
                                    <>
                                        <TextField
                                            label='Categoria'
                                            value={item.categ}
                                            fullWidth
                                            InputProps={{ readOnly: true }}
                                            size="small"
                                            sx={{ flexBasis: { md: '30%' } }}
                                        />
                                        <TextField
                                            label='Acessórios'
                                            value={item.accessories ?? 'Nenhum'}
                                            fullWidth
                                            InputProps={{ readOnly: true }}
                                            size="small"
                                            sx={{ flexBasis: { md: '30%' } }}
                                        />
                                        <TextField
                                            label='Alcance'
                                            value={item.range}
                                            fullWidth
                                            InputProps={{ readOnly: true }}
                                            size="small"
                                            sx={{ flexBasis: { md: '30%' } }}
                                        />
                                        <TextField
                                            label='Tipo de dano'
                                            value={item.effect.effectType}
                                            fullWidth
                                            InputProps={{ readOnly: true }}
                                            size="small"
                                            sx={{ flexBasis: { md: '30%' } }}
                                        />
                                        <TextField
                                            label='Tipo de arma'
                                            value={item.kind}
                                            fullWidth
                                            InputProps={{ readOnly: true }}
                                            size="small"
                                            sx={{ flexBasis: { md: '30%' } }}
                                        />
                                        <TextField
                                            label='Munição'
                                            value={item.ammo}
                                            fullWidth
                                            InputProps={{ readOnly: true }}
                                            size="small"
                                            sx={{ flexBasis: { md: '30%' } }}
                                        />
                                        <TextField
                                            label='Peso'
                                            value={item.weight}
                                            fullWidth
                                            InputProps={{ readOnly: true }}
                                            size="small"
                                            sx={{ flexBasis: { md: '30%' } }}
                                        />
                                        <TextField
                                            label='Dano base'
                                            value={item.effect.value}
                                            fullWidth
                                            InputProps={{ readOnly: true }}
                                            size="small"
                                            sx={{ flexBasis: { md: '30%' } }}
                                        />
                                        <TextField
                                            label='Dano crítico'
                                            value={item.effect.critValue}
                                            fullWidth
                                            InputProps={{ readOnly: true }}
                                            size="small"
                                            sx={{ flexBasis: { md: '30%' } }}
                                        />
                                    </>
                                ) : itemType === 'armor' ? (
                                    <>
                                        <TextField
                                            label='Categoria'
                                            value={item.categ}
                                            fullWidth
                                            InputProps={{ readOnly: true }}
                                            size="small"
                                            sx={{ flexBasis: { md: '30%' } }}
                                        />
                                        <TextField
                                            label='Pontos de Armadura'
                                            value={item.value ?? 'Nenhum'}
                                            fullWidth
                                            InputProps={{ readOnly: true }}
                                            size="small"
                                            sx={{ flexBasis: { md: '30%' } }}
                                        />
                                        <TextField
                                            label='Tipo de defesa'
                                            value={item.kind}
                                            fullWidth
                                            InputProps={{ readOnly: true }}
                                            size="small"
                                            sx={{ flexBasis: { md: '30%' } }}
                                        />
                                        <TextField
                                            label='Penalidade de deslocamento'
                                            value={item.displacementPenalty}
                                            fullWidth
                                            InputProps={{ readOnly: true }}
                                            size="small"
                                            sx={{ flexBasis: { md: '30%' } }}
                                        />
                                        <TextField
                                            label='Peso'
                                            value={item.weight}
                                            fullWidth
                                            InputProps={{ readOnly: true }}
                                            size="small"
                                            sx={{ flexBasis: { md: '30%' } }}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <TextField
                                            label='Quantidade'
                                            value={item.quantity ?? 'Nenhum'}
                                            fullWidth
                                            InputProps={{ readOnly: true }}
                                            size="small"
                                            sx={{ flexBasis: { md: '30%' } }}
                                        />
                                        <TextField
                                            label='Raridade'
                                            value={item.rarity ?? 'Nenhum'}
                                            fullWidth
                                            InputProps={{ readOnly: true }}
                                            size="small"
                                            sx={{ flexBasis: { md: '30%' } }}
                                        />
                                        <TextField
                                            label='Descrição'
                                            value={item.effects ?? 'Nenhum'}
                                            fullWidth
                                            InputProps={{ readOnly: true }}
                                            size="small"
                                            sx={{ flexBasis: { md: '30%' } }}
                                        />
                                        <TextField
                                            label='Peso'
                                            value={item.weight}
                                            fullWidth
                                            InputProps={{ readOnly: true }}
                                            size="small"
                                            sx={{ flexBasis: { md: '30%' } }}
                                        />
                                    </>
                                )}
                            </Stack>

                            {/* Informação adicional baseada no tipo */}
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    mt: 1,
                                    bgcolor: alpha(itemAttr.color, 0.05),
                                    borderColor: alpha(itemAttr.color, 0.3)
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={1}>
                                    <InfoOutlined fontSize="small" sx={{ color: itemAttr.color }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {itemType === 'weapon' ?
                                            `Esta arma causa ${item.effect.value} de dano base e ${item.effect.critValue} de dano crítico.` :
                                            itemType === 'armor' ?
                                                `Esta armadura oferece ${item.value} pontos de proteção com penalidade de deslocamento de ${item.displacementPenalty}.` :
                                                `Este item possui ${item.quantity ?? 1} unidade(s) e pesa ${item.weight}kg por unidade.`
                                        }
                                    </Typography>
                                </Box>
                            </Paper>
                        </Box>
                    </>
                </ItemWrapperModal>
            )}

            {/* Modal de confirmação para exclusão */}
            {confirmModalOpen && (
                <WarningModal
                    open={confirmModalOpen}
                    onClose={() => { setConfirmModalOpen(false) }}
                    title='Excluir item'
                    text={`Tem certeza que deseja excluir ${item.name}? Esta ação não pode ser desfeita.`}
                    onConfirm={onConfirm}
                />
            )}
        </>
    )
}

export default function Item<C extends 'weapon' | 'armor' | 'item'>({
    name,
    description,
    as,
    ...props
}: {
    name: string,
    description: string,
    as?: C,
} & ItemTyping<C>): ReactElement {
    // Seleciona o componente interno baseado no tipo de item
    const Component = as === 'weapon' ? Weapon : as === 'armor' ? Armor : ItemComponent

    return (
        <ItemWrapper
            description={description}
            title={name}
            item={{ name, description, ...props } as any}
        >
            <Component {...props as any} />
        </ItemWrapper>
    )
}