/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/dot-notation */

'use client';

import { CustomIconButton } from '@layout';
import { Add, Close } from '@mui/icons-material';
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState, type ReactElement, type MouseEvent } from 'react';
import type { Magia } from '@types';
import { amber, blue, blueGrey, brown, green, grey, indigo, pink, red } from '@mui/material/colors';

type magicStages = 'estágio 1' | 'estágio 2' | 'estágio 3' | 'maestria'

export default function Magic({ magic, id, isAdding, onIconClick }: { magic: Magia, id: string, isAdding?: boolean, onIconClick?: () => void }): ReactElement {
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    const [ description, setDescritpion ] = useState<string>(magic['estágio 1'])
    const [ buttonVariants, setButtonVariants ] = useState({
        'estágio 1': 'outlined',
        'estágio 2': 'text',
        'estágio 3': 'text',
        'maestria': 'text'
    })

    const [ extraManaCost, setExtraManaCost ] = useState<number>(0)

    const magicColor = {
        'FOGO': red[500],
        'ÁGUA': blue[600],
        'AR': grey[300],
        'TERRA': brown[400],
        'PLANTA': green[200],
        'ELETRICIDADE': indigo[300],
        'GELO': blue[300],
        'METAL': grey[500],
        'LUZ': amber[400],
        'TOXINA': green[600],
        'TREVAS': blueGrey[400],
        'PSÍQUICO': pink[500],
        'NÃO-ELEMENTAL': grey[100]
    }

    const onClick = (e: MouseEvent<HTMLButtonElement>): void => {
        const buttonName: magicStages = e.currentTarget.innerText.toLowerCase() as magicStages

        let extraCost: {
            [key in magicStages]?: number
        } = {}

        if (Number(magic.nível) === 5) {
            extraCost = {
                'estágio 1': 0,
                'estágio 2': 15,
                'maestria': 25
            }
            
        } else if (Number(magic.nível) >= 3) {
            extraCost = {
                'estágio 1': 0,
                'estágio 2': 10,
                'estágio 3': 15
            }
        } else {
            extraCost = {
                'estágio 1': 0,
                'estágio 2': 5,
                'estágio 3': 10
            }
        }

        setExtraManaCost(extraCost[buttonName]!)

        setButtonVariants({
            'estágio 1': 'text',
            'estágio 2': 'text',
            'estágio 3': 'text',
            'maestria': 'text',
            [buttonName]: 'outlined'
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
                bgcolor: 'background.paper',
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
                        color={magicColor[magic.elemento]} 
                        border={`1px solid ${magicColor[magic.elemento]}`}
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