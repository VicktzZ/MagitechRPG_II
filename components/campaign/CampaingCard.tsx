import { Card, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { type ReactElement } from 'react';

export default function CampaingCard({
    title,
    description,
    gameMaster,
    playersQtd,
    code
}: {
    title: string;
    description: string;
    gameMaster: string[];
    playersQtd: number;
    code: string;
}): ReactElement {
    const { data: session } = useSession();
    const userIsGM = gameMaster.includes(session?.user._id ?? '');
    const router = useRouter();
    
    return (
        <Card
            sx={{
                minHeight: 250,
                width: 350,
                display: 'flex',
                backgroundColor: 'background.paper3',
                flexDirection: 'column',
                p: 2,
                gap: 2,
                transition: '.3s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                    backgroundColor: 'background.paper2'
                }
            }}
            onClick={() => { router.push(`/plataform/campaign/${code}`); }}
        >
            <Typography textAlign="center" variant="h6">
                {title}
            </Typography>
            <Typography variant="caption">{description}</Typography>
            <Typography>Players: {playersQtd}</Typography>
            <Typography 
                fontWeight={900}
                color={userIsGM ? 'primary.main' : 'text.secondary'}
            >{userIsGM ? 'Game Master' : 'Player'}</Typography>
        </Card>
    );
}