import { Box, LinearProgress, type LinearProgressProps, Typography, styled, linearProgressClasses } from '@mui/material';
import { type ReactElement } from 'react';

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800]
    },
    [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 5
    }
}));

export default function LinearProgressWithLabel(
    props: LinearProgressProps & {
        minvalue: number,
        maxvalue: number,
        label: string,
        MoreComponents?: ReactElement 
    }
): ReactElement {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', mr: 1 }}>
                <Box display='flex' alignItems='center' gap={1}>
                    <Typography>{props.label}:</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {`${props.minvalue}/${props.maxvalue}`}
                    </Typography>
                    {props.MoreComponents}
                </Box>
                <BorderLinearProgress 
                    variant='determinate' 
                    value={props.minvalue < props.maxvalue ? (props.minvalue / props.maxvalue) * 100 : 100} 
                    {...props}
                />
            </Box>
        </Box>
    );
}