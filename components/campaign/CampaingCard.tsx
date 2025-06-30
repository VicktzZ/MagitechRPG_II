import { Box, Button, Card, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { type ReactElement, useState } from 'react';
import { DeleteCampaignModal } from './DeleteCampaignModal';

interface CampaingCardProps {
    id: string;
    title: string;
    description: string;
    gameMaster: string[];
    playersQtd: number;
    code: string;
    onDelete: () => void;
}

export default function CampaingCard({
    id,
    title,
    description,
    gameMaster,
    playersQtd,
    code,
    onDelete
}: CampaingCardProps): ReactElement {
    const { data: session } = useSession();
    const userIsGM = gameMaster.includes(session?.user._id ?? '');
    const router = useRouter();
    const [ isDeleteModalOpen, setIsDeleteModalOpen ] = useState(false);
    
    const handleCardClick = (e: React.MouseEvent): void => {
        if (e.target instanceof HTMLButtonElement) return;
        router.push(`/app/campaign/${code}`);
    };
    
    return (
        <>
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
                onClick={handleCardClick}
            >
                <Typography textAlign="center" variant="h6">
                    {title}
                </Typography>
                <Typography variant="caption">{description}</Typography>
                <Typography>Players: {playersQtd}</Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography 
                        fontWeight={900}
                        color={userIsGM ? 'primary.main' : 'text.secondary'}
                    >
                        {userIsGM ? 'Game Master' : 'Player'}
                    </Typography>
                    {userIsGM && (
                        <Button
                            variant="contained"
                            color={'terciary' as any}
                            size="small"
                            onClick={() => { setIsDeleteModalOpen(true); }}
                        >
                            Deletar
                        </Button>
                    )}
                </Box>
            </Card>
            
            <DeleteCampaignModal
                open={isDeleteModalOpen}
                campaignId={id}
                onClose={() => { setIsDeleteModalOpen(false); }}
                onDelete={onDelete}
            />
        </>
    );
}