/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/dot-notation */

'use client';

import { CustomIconButton } from '@layout';
import { Add, Close } from '@mui/icons-material';
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState, type ReactElement, type MouseEvent } from 'react';
import type { Magia as MagiaType, MagicPower as MagicPowerType } from '@types';
import { elementColor } from '@constants';

type magicStages = 'estágio 1' | 'estágio 2' | 'estágio 3' | 'maestria'
type MagicTyping<C extends 'magic-spell' | 'magic-power'> = 
    C extends 'magic-spell' ?
        { 
            magic: MagiaType,
            id: string,
            isAdding?: boolean,
            onIconClick?: () => void
        } 
    :
        {
            magicPower: MagicPowerType,
            id: string,
            isAdding?: boolean,
            onIconClick?: () => void 
        } 

function MagicPower({ 
    magicPower,
    id,
    isAdding,
    onIconClick 
}: { 
    magicPower: MagicPowerType,
    id: string,
    isAdding?: boolean,
    onIconClick?: () => void 
}): ReactElement {
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    const [ description, setDescritpion ] = useState<string>(magicPower['descrição'])

    const [ buttonVariants, setButtonVariants ] = useState({
        'descrição': 'contained',
        'maestria': 'text'
    })

    const onClick = (e: MouseEvent<HTMLButtonElement>): void => {
        const buttonName = e.currentTarget.innerText.toLowerCase() as 'descrição' | 'maestria'

        setButtonVariants({
            'descrição': 'text',
            'maestria': 'text',
            [buttonName]: 'contained'
        })

        setDescritpion(magicPower[buttonName]!)
    }

    return (
        <Box
            data-id={id}
            sx={{
                height: { xs: '32rem', sm: '36rem' },
                width: '100%',
                maxWidth: '22rem',
                minWidth: '18rem',
                display: 'flex',
                p: 2,
                bgcolor: 'background.paper2',
                boxShadow: theme.shadows[5],
                borderRadius: 2,
                boxSizing: 'border-box',
                margin: '0 auto',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[8]
                }
            }}
        >
            <Box 
                display='flex'
                flexDirection={'column'}
                justifyContent='space-between'
                gap={2}
                height='100%'
                width='100%'
            >
                <Box display='flex' height='10%' alignItems='center' gap={2}>
                    <Typography
                        textAlign='center'
                        minWidth='100px'
                        color={elementColor[magicPower.elemento.toUpperCase() as keyof typeof elementColor]} 
                        border={`1px solid ${elementColor[magicPower.elemento.toUpperCase() as keyof typeof elementColor]}`}
                        p={1}
                        borderRadius={1}
                    >{magicPower.elemento}</Typography>
                    <Typography variant='h6'>{magicPower.nome}</Typography>
                </Box>
                <Box display='flex' flexDirection='column' gap={1}>
                    <Box display='flex' gap={1}>
                        <Typography fontWeight={900} >PRÉ-REQUISITOS: </Typography>
                        <Typography>{magicPower['pré-requisito'] ?? 'Nenhum'}</Typography>
                    </Box>
                </Box>
                <Typography
                    sx={{
                        height: '100%',
                        width: '100%',
                        variant: 'caption',
                        noWrap: true,
                        whiteSpace: 'pre-wrap',
                        overflow: 'auto',
                        '&::-webkit-scrollbar': {
                            width: '0.2em'
                        },
                        '&::-webkit-scrollbar-track': {
                            bgcolor: 'transparent'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            bgcolor: theme.palette.primary.main,
                            borderRadius: 2
                        }
                    } as any}
                >
                    {description}
                </Typography>
                <Box display='flex' width='100%' gap={matches ? 2 : 0} justifyContent='end'>
                    <Box display='flex' gap={1} width='100%' justifyContent='start'>
                        <Button 
                            sx={matches ? { p: 0 } : {}}
                            onClick={e => { onClick(e) }}
                            variant={buttonVariants['descrição'] as any} 
                        >Descrição</Button>
                        <Button
                            sx={matches ? { p: 0 } : {}}
                            onClick={e => { onClick(e) }}
                            variant={buttonVariants['maestria'] as any} 
                        >Maestria</Button>
                    </Box>
                    <Box display='flex' justifyContent='end'>
                        <CustomIconButton onClick={onIconClick ?? (() => {})}>
                            {isAdding ? (
                                <Add />
                            ) : (
                                <Close />
                            )}
                        </CustomIconButton>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function MagicSpell({
    magic,
    id,
    isAdding,
    onIconClick 
}: MagicTyping<'magic-spell'>): ReactElement {
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    const [ description, setDescritpion ] = useState<string>(magic['estágio 1'])
    const [ buttonVariants, setButtonVariants ] = useState<Record<magicStages, string>>({
        'estágio 1': 'contained',
        'estágio 2': 'text',
        'estágio 3': 'text',
        'maestria': 'text'
    })

    const [ extraManaCost, setExtraManaCost ] = useState<number>(0)

    const onClick = (e: MouseEvent<HTMLButtonElement>): void => {
        const buttonName: magicStages = e.currentTarget.innerText.toLowerCase() as magicStages

        let extraCost: Partial<Record<magicStages, number>> = {}

        if (Number(magic.nível) === 4) {
            extraCost = {
                'estágio 1': 0,
                'estágio 2': 4,
                'maestria': 9
            }
            
        } else if (Number(magic.nível) === 3) {
            extraCost = {
                'estágio 1': 0,
                'estágio 2': 2,
                'estágio 3': 5
            }
        } else if (Number(magic.nível) === 2) {
            extraCost = {
                'estágio 1': 0,
                'estágio 2': 2,
                'estágio 3': 4
            }
        } else {
            extraCost = {
                'estágio 1': 0,
                'estágio 2': 1,
                'estágio 3': 2
            }
        }

        setExtraManaCost(extraCost[buttonName]!)

        setButtonVariants({
            'estágio 1': 'text',
            'estágio 2': 'text',
            'estágio 3': 'text',
            'maestria': 'text',
            [buttonName]: 'contained'
        })

        setDescritpion(magic[buttonName]!)
    }

    return (
        <Box
            data-id={id}
            sx={{
                height: '40rem',
                width: '25rem',
                minWidth: matches ? '25rem' : '',
                display: 'flex',
                p: 3,
                bgcolor: 'background.paper2',
                boxShadow: theme.shadows[10],
                borderRadius: 3
            }}
        >
            <Box 
                display='flex'
                flexDirection={'column'}
                justifyContent='space-between'
                gap={2}
                height='100%'
                width='100%'
            >
                <Box display='flex' height='10%' alignItems='center' gap={2}>
                    <Typography
                        textAlign='center'
                        minWidth='100px'
                        color={elementColor[magic.elemento]} 
                        border={`1px solid ${elementColor[magic.elemento]}`}
                        p={1}
                        borderRadius={1}
                    >{magic.elemento}</Typography>
                    <Typography variant='h6'>{magic.nome}</Typography>
                </Box>
                <Box display='flex' flexDirection='column' gap={1}>
                    <Box display='flex' gap={1}>
                        <Typography fontWeight={900} >NÍVEL: </Typography>
                        <Typography>{magic['nível']}</Typography>
                    </Box>
                    <Box display='flex' gap={1}>
                        <Typography fontWeight={900} >CUSTO: </Typography>
                        <Typography>{Number(magic.custo) + extraManaCost} MP</Typography>
                    </Box>
                    <Box display='flex' gap={1}>
                        <Typography fontWeight={900} >TIPO: </Typography>
                        <Typography>{magic.tipo}</Typography>
                    </Box>
                    <Box display='flex' gap={1}>
                        <Typography fontWeight={900} >EXECUÇÃO: </Typography>
                        <Typography>{magic['execução']}</Typography>
                    </Box>
                    <Box display='flex' gap={1}>
                        <Typography fontWeight={900} >ALCANCE: </Typography>
                        <Typography>{magic.alcance}</Typography>
                    </Box>
                </Box>
                <Typography height='100%' width='100%' variant='caption' noWrap whiteSpace='pre-wrap'>{description}</Typography>
                <Box display='flex' width='100%' gap={matches ? 2 : 0} justifyContent='end'>
                    <Box display='flex' gap={1} width='100%' justifyContent='start'>
                        <Button 
                            sx={matches ? { p: 0 } : {}}
                            onClick={e => { onClick(e) }}
                            variant={buttonVariants['estágio 1'] as any} 
                        >Estágio 1</Button>
                        {magic['estágio 2'] && (
                            <Button 
                                sx={matches ? { p: 0 } : {}}
                                onClick={e => { onClick(e) }}
                                variant={buttonVariants['estágio 2'] as any} 
                            >Estágio 2</Button>
                        )}
                        {magic['estágio 3'] && (
                            <Button                         
                                sx={matches ? { p: 0 } : {}}
                                onClick={e => { onClick(e) }}
                                variant={buttonVariants['estágio 3'] as any} 
                            >Estágio 3</Button>
                        )}
                        {magic['maestria'] && (
                            <Button
                                sx={matches ? { p: 0 } : {}}
                                onClick={e => { onClick(e) }}
                                variant={buttonVariants['maestria'] as any} 
                            >Maestria</Button>
                        )}
                    </Box>
                    <Box display='flex' justifyContent='end'>
                        <CustomIconButton onClick={onIconClick ?? (() => {})}>
                            {isAdding ? (
                                <Add />
                            ) : (
                                <Close />
                            )}
                        </CustomIconButton>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default function Magic<C extends 'magic-spell' | 'magic-power'>({
    as,
    ...props
}: {
    as?: C
} & MagicTyping<C>): ReactElement {
    const Component = as === 'magic-power' ? MagicPower : as === 'magic-spell' ? MagicSpell : MagicSpell
    
    return (
        <Component {...props as any} />
    )
}