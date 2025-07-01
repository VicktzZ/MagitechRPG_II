/* eslint-disable @typescript-eslint/no-misused-promises */
import { Avatar, Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { type KeyboardEvent, type MouseEvent, type ReactElement, type ReactNode, useState } from 'react';
import { Article, AutoStories, Home, Logout, Menu, Start } from '@mui/icons-material';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CustomIconButton from './CustomIconButton';
import Image from 'next/image';

export default function AppDrawer(): ReactElement {
    const { data: session } = useSession();
    
    const [ drawerOpen, setDrawerOpen ] = useState<boolean>(false);
   
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
                    <ListItem disablePadding onClick={() => { router.push('/app') }}>
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
                        <ListItemButton onClick={() => { router.push('/app/campaign') }}>
                            <ListItemIcon>
                                <AutoStories />
                            </ListItemIcon>
                            <ListItemText primary='Campanha' />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => { router.push('/app/ficha/create') }}>
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
                        (session?.user?.image !== 'undefined') && session?.user?.image ? (
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

    return (
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
    );
}