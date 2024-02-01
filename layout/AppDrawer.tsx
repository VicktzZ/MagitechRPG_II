import { Avatar, Box, Button, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Modal, TextField, Typography, useTheme } from '@mui/material';
import { type KeyboardEvent, type MouseEvent, type ReactElement, type ReactNode, useState } from 'react';
import { Article, Group, Groups, Home, Logout, Menu, Start } from '@mui/icons-material';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CustomIconButton from './CustomIconButton';
import Image from 'next/image';
import { useSnackbar } from 'notistack';

export default function AppDrawer(): ReactElement {
    const { data: session } = useSession();
    const [ drawerOpen, setDrawerOpen ] = useState<boolean>(false);
    const [ modalOpen, setModalOpen ] = useState<boolean>(false);
    const [ sessionCode, setSessionCode ] = useState<string>('')

    const { enqueueSnackbar } = useSnackbar()
    const theme = useTheme()

    const router = useRouter()

    const toggleDrawer =
        (openParam: boolean) =>
            (event: KeyboardEvent | MouseEvent) => {
                if (
                    event.type === 'keydown' &&
                    ((event as KeyboardEvent).key === 'Tab' ||
                    (event as KeyboardEvent).key === 'Shift')
                ) {
                    return;
                }

                setDrawerOpen(openParam)
            };  

    console.log(session);

    const list = (): ReactNode => (
        <Box
            display='flex'
            flexDirection='column'
            justifyContent='space-between'
            p={1}
            bgcolor='background.paper'
            width='250px'
            role="presentation"
            height='100%'
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
        >
            <Box>
                <List>
                    <ListItem disablePadding onClick={() => { router.push('/plataform') }}>
                        <ListItemButton>
                            <ListItemIcon>
                                <Home />
                            </ListItemIcon>
                            <ListItemText primary='Home' />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding onClick={() => { router.push('/') }}>
                        <ListItemButton>
                            <ListItemIcon>
                                <Start />
                            </ListItemIcon>
                            <ListItemText primary='Início' />
                        </ListItemButton>
                    </ListItem>
                </List>
                <Divider />
                <List>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => { setModalOpen(true); setDrawerOpen(false) }}>
                            <ListItemIcon>
                                <Groups />
                            </ListItemIcon>
                            <ListItemText primary='Sessão' />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => { router.push('/plataform/ficha/create') }}>
                            <ListItemIcon>
                                <Article />
                            </ListItemIcon>
                            <ListItemText primary='Criar Ficha' />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => { signOut({ callbackUrl: '/' }) }}>
                            <ListItemIcon>
                                <Logout />
                            </ListItemIcon>
                            <ListItemText primary='Logout' />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
            <Box display='flex' p={2} alignItems='center' gap={2}>
                <Avatar sx={{ height: '3rem', width: '3rem', color: 'white', bgcolor: 'primary.main' }}>
                    {
                        session?.user?.image !== 'undefined' ? (
                            <Image
                                height={250}
                                width={250}
                                style={{ height: '100%', width: '100%' }} 
                                src={session?.user?.image ?? 'undefined'} 
                                alt={session?.user?.name ?? 'User Avatar'} 
                            />
                        ) : session?.user?.name?.charAt(0).toUpperCase()
                    }
                </Avatar>
                <Typography>{session?.user?.name}</Typography>
            </Box>
        </Box>
    );

    const joinSession = (): void => {
        if (sessionCode) {
            setModalOpen(false)
            router.push(`/plataform/session/${sessionCode}`)
        } else {
            enqueueSnackbar('Insira o código da sessão!', { variant: 'error' })
        }
    }

    const createSession = (): void => {
        
    }

    return (
        <>
            <Box>
                <CustomIconButton onClick={toggleDrawer(true)}>
                    <Menu />
                </CustomIconButton>
                <Drawer
                    anchor='left'
                    open={drawerOpen}
                    onClose={toggleDrawer(false)}
                >
                    {list()}
                </Drawer>
            </Box>
            <Modal 
                open={modalOpen}
                onClose={() => { setModalOpen(false) }}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    width: '100vw'
                }}
            >
                <Box
                    minHeight='20%'
                    width='40%'
                    bgcolor='background.paper'
                    borderRadius={2}
                    p={2.5}
                    sx={{
                        [theme.breakpoints.down('md')]: {
                            width: '80%'
                        }
                    }}
                >   
                    <Box height='100%' display='flex' gap={4} flexDirection='column'>
                        <Box display='flex' gap={2} justifyContent='space-between' alignItems='center'>
                            <Typography variant='h6'>Sessão</Typography>
                        </Box>
                        <Box display='flex' flexDirection='column' gap={2}>
                            <Box>
                                <TextField
                                    fullWidth 
                                    label='Código'
                                    placeholder='Insira o código da sessão...'
                                    value={sessionCode}
                                    onChange={(e) => { setSessionCode(e.target.value.toUpperCase()) }}
                                />
                            </Box>
                            <Box display='flex' gap={2} justifyContent='space-between' width='100%'>
                                <Button onClick={() => { setModalOpen(false) }} variant='outlined'>Cancelar</Button>
                                <Box display='flex'alignItems='center' gap={1.5}>
                                    <Button onClick={joinSession} variant='contained'>Ingressar</Button>
                                    <Typography>Ou...</Typography>
                                    <Button onClick={createSession} color={'terciary' as any} variant='contained'>Criar</Button>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </>
    );
}