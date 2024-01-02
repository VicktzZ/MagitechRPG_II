import { Test } from '@components/ficha';
import { Box, Grid, IconButton, Modal, Typography, useTheme } from '@mui/material';
import { blue, green, grey, purple, yellow } from '@mui/material/colors';
import { type FormikContextType } from 'formik';
import { useState, type ReactElement } from 'react';
import { Edit } from '@mui/icons-material';
import type { Ficha, Expertise, Attributes } from '@types';

export default function Expertises({ formik }: { formik: any }): ReactElement {
    const f: FormikContextType<Ficha> = formik
    const theme = useTheme()

    const [ openModal, setOpenModal ] = useState<boolean>(false)

    return (
        <>
            <Box display='flex' flexDirection='column' gap={3}>
                <Box display='flex' gap={2}>
                    <Typography>Pontos de Perícia: <b style={{ color: theme.palette.primary.main }}>{f.values.points.expertises}</b></Typography>
                    <IconButton onClick={() => { setOpenModal(true) }}>
                        <Edit />
                    </IconButton>
                </Box>
                <Grid
                    sx={{ flexGrow: 1 }} 
                    spacing={2} 
                    container
                >
                    {Object.entries(f.values.expertises).map(([ name, expertise ]: [ name: string, expertise: Expertise<any> ]) => (
                        <Test 
                            key={name}
                            name={name}
                            expertise={expertise}
                            diceQuantity={f.values.attributes[expertise.defaultAttribute as Attributes]}
                        />
                    ))}
                </Grid>
                <Box display='flex' width='100%' gap={2} justifyContent='center'>
                    <Typography 
                        variant='caption'
                        fontWeight={900}
                        color={grey[500]}
                    >Destreinado: {'< 1'}</Typography>
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
            <Modal
                open={openModal}
                onClose={() => { setOpenModal(false) }}
            >
                <Box></Box>
            </Modal>
        </>
    )
}