import type { ReactNode } from 'react';
import { Box } from '@mui/material';

interface TabPanelProps {
    children?: ReactNode;
    index: number;
    value: number;
}

export default function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`charsheet-tabpanel-${index}`}
            aria-labelledby={`charsheet-tab-${index}`}
            {...other}
            style={{ maxHeight: '500px', overflowY: 'auto' }}
        >
            {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
        </div>
    );
}

export function a11yProps(index: number) {
    return {
        id: `charsheet-tab-${index}`,
        'aria-controls': `charsheet-tabpanel-${index}`
    };
}
