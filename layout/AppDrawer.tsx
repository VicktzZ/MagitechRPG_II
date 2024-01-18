import { Avatar, Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { type KeyboardEvent, type MouseEvent, type ReactElement, type ReactNode, useState } from 'react';
import { Article, Group, Home, Logout, Menu } from '@mui/icons-material';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CustomIconButton from './CustomIconButton';
import Image from 'next/image';
import { useSnackbar } from 'notistack';

export default function AppDrawer(): ReactElement {
    const { data: session } = useSession();
    const [ open, setOpen ] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar()
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

                setOpen(openParam)
            };  

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
                </List>
                <Divider />
                <List>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => { enqueueSnackbar('Em desenvolvimento', { variant: 'warning' }) }}>
                            <ListItemIcon>
                                <Group />
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
                <Avatar sx={{ height: '3rem', width: '3rem' }}>
                    <Image
                        height={250}
                        width={250}
                        style={{ height: '100%', width: '100%' }} 
                        src={session?.user?.image ?? 'undefined'} 
                        alt={session?.user?.name ?? 'User Avatar'} 
                    />
                </Avatar>
                <Typography>{session?.user?.name}</Typography>
            </Box>
        </Box>
    );

    return (
        <Box>
            <CustomIconButton onClick={toggleDrawer(true)}>
                <Menu />
            </CustomIconButton>
            <Drawer
                anchor='left'
                open={open}
                onClose={toggleDrawer(false)}
            >
                {list()}
            </Drawer>
        </Box>
    );
}