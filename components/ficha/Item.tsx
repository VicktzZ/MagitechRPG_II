import { Box, IconButton, Typography, useTheme } from '@mui/material'
import { type ReactElement } from 'react'
import type {
    Item as ItemProps, 
    Weapon as WeaponProps,
    Armor as ArmorProps
} from '@types'
import { Edit } from '@mui/icons-material'
import { RPGIcon } from '@components/misc'

type ItemTyping<C> = C extends 'weapon' ? WeaponProps<'Leve' | 'Pesada'> : C extends 'armor' ? ArmorProps : ItemProps

function Weapon(props: ItemTyping<'weapon'>): ReactElement {
    return (
        <Box display='flex' flexDirection='column'>
            <Box>
                <RPGIcon 
                    icon='all_for_one'
                />
            </Box>
        </Box>
    )
}

function Armor(props: ItemTyping<'armor'>): ReactElement {
    return (
        <Box>
            {'Armor'}
        </Box>
    )
}

function ItemComponent(props: ItemTyping<'item'>): ReactElement {
    return (
        <Box>
            {'Item'}
        </Box>
    )
}

function ItemWrapper({ children, title }: { children: ReactElement, title: string }): ReactElement {
    const theme = useTheme()
    
    return (
        <Box
            display='flex'
            flexDirection='column'
            height='25rem'
            width='15rem'
            boxShadow={theme.shadows[10]}
            bgcolor='background.paper3'
            borderRadius={3}
            p={2}
            gap={3}
        >
            <Box display='flex' alignItems='center' justifyContent='center'>
                <Typography width='100%' textAlign='center' variant='h6'>{title}</Typography>
                <IconButton sx={{ border: `1px solid ${theme.palette.primary.main}50`, p: 1.25 }}>
                    <Edit />
                </IconButton>
            </Box>
            <Box>
                {children}
            </Box>
        </Box>
    )
}

export default function Item<C extends 'weapon' | 'armor' | 'item'>({
    title,
    as,
    ...props
}: {
    title: string,
    as?: C,
} & ItemTyping<C>): ReactElement {
    const Component = as === 'weapon' ? Weapon : as === 'armor' ? Armor : ItemComponent
    
    return (
        <ItemWrapper title={title}>
            <Component {...props as any} />
        </ItemWrapper>
    )
}