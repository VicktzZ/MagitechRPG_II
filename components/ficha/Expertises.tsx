/* eslint-disable react-hooks/exhaustive-deps */
import { Expertise } from '@components/ficha';
import { Box, Button, Grid,Typography, useTheme } from '@mui/material';
import { blue, green, grey, purple, yellow } from '@mui/material/colors';
import { useFormikContext, type FormikContextType } from 'formik';
import { useState, type ReactElement, useRef, useCallback, useMemo } from 'react';
import { lineageExpertises } from '@constants/lineageExpertises';

import type { 
    Ficha,
    Attributes,
    Lineage,
    Expertise as ExpertiseType,
    Expertises as ExpertisesType
} from '@types';

export default function Expertises({ disabled }: { disabled?: boolean }): ReactElement {
    const f: FormikContextType<Ficha> = useFormikContext()
    const theme = useTheme()

    const buttonRef = useRef<'add' | 'sub' | null>()
    const lineageRef = useRef<Lineage['name'] | null>()

    const [ edit, setEdit ] = useState({
        isEditing: false,
        value: 0
    })

    const [ buttonStyle, setButtonStyle ] = useState<Record<string, 'outlined' | 'contained'>>({
        add: 'outlined',
        sub: 'outlined'
    })

    function ExpertiseButton ({ children, type }: { children: ReactElement | string, type: 'add' | 'sub' }): ReactElement {
        const [ buttonClicked, setButtonClicked ] = useState(false)

        const onClick = useCallback((): any => {
            if (edit.isEditing) {
                if (buttonRef.current === type) {
                    setButtonClicked(false)
                    setButtonStyle({
                        add: 'outlined',
                        sub: 'outlined'
                    })

                    setEdit({
                        isEditing: false,
                        value: 0
                    })
                } else {
                    setButtonClicked(true)
                    setButtonStyle({
                        [buttonRef.current as any]: 'outlined',
                        [type]: 'contained'
                    })

                    setEdit({
                        isEditing: true,
                        value: type === 'add' ? 2 : -2
                    })
                }
                
                if (buttonClicked) {
                    setButtonStyle({
                        ...buttonStyle,
                        [type]: 'outlined'
                    })

                    buttonRef.current = null
                    return 
                }
            } else {
                setButtonClicked(true)
                
                setButtonStyle({
                    ...buttonStyle,
                    [type]: 'contained'
                })

                setEdit({
                    isEditing: true,
                    value: type === 'add' ? 2 : -2
                })

            }

            buttonRef.current = type
        }, [])

        return (
            <Button 
                onClick={onClick} 
                variant={buttonStyle[type]}
            >{children}</Button>
        )
    }
    
    const tests = useMemo(() => {
        if (!disabled) {
            const lineage: Lineage['name'] = f.values.lineage as unknown as Lineage['name']
            const expertiseOfLineage = lineageExpertises[lineage] 
            let expertiseOfLineageRef: typeof expertiseOfLineage
    
            if (lineageRef.current) {
                expertiseOfLineageRef = lineageExpertises[lineageRef.current]
    
                if (expertiseOfLineageRef?.tests) {
                    Object.keys(expertiseOfLineageRef.tests).forEach((key: string) => {
                        const k: keyof ExpertisesType = key as keyof ExpertisesType
                        f.values.expertises[k].value -= expertiseOfLineageRef.tests?.[k] ?? 0
                    })
                }
        
                if (expertiseOfLineageRef?.points) {
                    if (!disabled) {
                        f.values.points.expertises -= expertiseOfLineageRef?.points ?? 0
                    }
                }
            }
    
            if (expertiseOfLineage?.tests) {
                Object.keys(expertiseOfLineage.tests).forEach((key: string) => {
                    const k: keyof ExpertisesType = key as keyof ExpertisesType
                    f.values.expertises[k].value += expertiseOfLineage.tests?.[k] ?? 0
                })
            }
    
            if (expertiseOfLineage?.points) {
                if (!disabled) {
                    f.values.points.expertises += expertiseOfLineage?.points ?? 0
                }
            }
    
            lineageRef.current = lineage
        }

        const expertisesNodeArr = Object.entries(f.values.expertises).map(([ name, expertise ]: [ name: keyof ExpertisesType | any, expertise: ExpertiseType<any> ]) => (
            <Expertise 
                key={name}
                name={name}
                expertise={expertise}
                diceQuantity={f.values.attributes[expertise.defaultAttribute as Attributes]}
                disabled={disabled ?? false}
                edit={edit}
            />
        ))

        return expertisesNodeArr
    }, [ f.values.lineage, f.values.expertises, f.values.points.expertises, edit, f.values.traits ])

    return (
        <>
            <Box display='flex' flexDirection='column' gap={3}>
                <Box display='flex' alignItems='center' gap={2}>
                    <Typography>Pontos de Perícia: <b style={{ color: theme.palette.primary.main }}>{f.values.points.expertises}</b></Typography>
                    <Box display='flex' gap={1}>
                        <ExpertiseButton type='add'>+1</ExpertiseButton>
                        <ExpertiseButton type='sub'>-1</ExpertiseButton>
                    </Box>
                </Box>
                <Grid
                    sx={{ flexGrow: 1 }}
                    justifyContent='center'
                    spacing={1.5} 
                    container
                >
                    {tests}
                </Grid>
                <Box display='flex' width='100%' gap={2} justifyContent='center'>
                    <Typography 
                        variant='caption'
                        fontWeight={900}
                        color={grey[500]}
                    >Destreinado: {'< 2'}</Typography>
                    <Typography 
                        variant='caption'
                        fontWeight={900}
                        color={green[500]}
                    >Treinado: {'< 5'}</Typography>
                    <Typography 
                        variant='caption'
                        fontWeight={900}
                        color={blue[500]}
                    >Competente: {'< 10'}</Typography>
                    <Typography 
                        variant='caption'
                        fontWeight={900}
                        color={purple[500]}
                    >Experiente: {'< 15'}</Typography>
                    <Typography 
                        variant='caption'
                        fontWeight={900}
                        color={yellow[500]}
                    >Especialista: {'15+'}</Typography>
                </Box>
            </Box>
        </>
    )
}