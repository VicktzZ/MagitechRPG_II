import { Badge, Box, Menu, MenuItem, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import CustomIconButton from './CustomIconButton';
import NotificationIcon from '@mui/icons-material/Notifications';
import type { Notification } from '@types';
import { notificationService } from '@services';
import { useSession } from 'next-auth/react';

export default function Notifications() {
    const [ anchorEl, setAnchorEl ] = useState<null | HTMLElement>(null);
    const [ notifications, setNotifications ] = useState<Notification[]>([])
    const { data: session } = useSession() 
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        notificationService
            .getUserNotifications(session?.user._id ?? '')
            .then(data => setNotifications(data))
    }, [])

    function NotificationComponent({ notification }: { notification: Notification }) {
        return (
            <MenuItem onClick={handleClose}>
                <Box>
                    <Typography>{notification.content}</Typography>
                    <Typography variant='caption' color='text.secondary'>
                        {new Intl.DateTimeFormat('pt-BR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        }).format(new Date(notification.timestamp))}
                    </Typography>
                </Box>
            </MenuItem>
        )
    }
    
    return (
        <Box>
            <Badge badgeContent={notifications.length} color="error">
                <CustomIconButton onClick={handleClick}>
                    <NotificationIcon />
                </CustomIconButton>
            </Badge>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button'
                }}
            >
                {notifications.length > 0 && notifications.map(notification => (
                    <NotificationComponent key={notification._id} notification={notification} />
                ))}
                {notifications.length === 0 && (
                    <MenuItem onClick={handleClose}>
                        <Box>
                            <Typography>Você não possui notificações.</Typography>
                        </Box>
                    </MenuItem>
                )}
            </Menu>
        </Box>
    );
}