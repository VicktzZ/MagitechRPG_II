import { Badge, Box, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import CustomIconButton from './CustomIconButton';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function Notifications() {
    const [ anchorEl, setAnchorEl ] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    
    return (
        <Box>
            <Badge badgeContent={1} color="error">
                <CustomIconButton onClick={handleClick}>
                    <NotificationsIcon />
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
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
                <MenuItem onClick={handleClose}>Logout</MenuItem>
            </Menu>
        </Box>
    );
}