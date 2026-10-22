import { useCampaignContext } from '@contexts';
import type { Creature } from '@models';
import { Pets } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import type { ReactElement } from 'react';
import Section from '../../Section';
import CustomCreatureCard from './CustomCreatureCard';

interface CustomCreaturesSectionProps {
    onView: (creature: Creature) => void;
    onEdit: (creature: Creature) => void;
    onDelete: (creatureId: string, creatureName: string) => void;
}

/** Seção de Criaturas Customizadas (só aparece quando a campanha tem alguma) */
export default function CustomCreaturesSection({ onView, onEdit, onDelete }: CustomCreaturesSectionProps): ReactElement | null {
    const { campaign } = useCampaignContext();

    if (!campaign.custom?.creatures || campaign.custom.creatures.length === 0) return null;

    return (
        <Section 
            title="Criaturas customizadas" 
            icon={<Pets sx={{ color: 'text.secondary' }} />}
        >
            <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Criaturas criadas para esta campanha
                </Typography>
                
                <Stack spacing={1}>
                    {campaign.custom.creatures.map(creature => (
                        <CustomCreatureCard
                            key={creature.id}
                            creature={creature}
                            onView={onView}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </Stack>
            </Box>
        </Section>
    );
}
