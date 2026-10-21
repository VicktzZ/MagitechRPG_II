import type { Expertise } from '@models';
import { Box, Button, Chip, Stack, Typography, alpha } from '@mui/material';
import { color } from '@themes/tokens';
import type { ReactElement } from 'react';
import { getGMExpertiseConfig, getGMExpertiseLevel } from './expertiseConfig';

interface CreatureExpertiseButtonProps {
    name: string;
    expertise: Expertise;
    onRoll: () => Promise<void>;
}

/** Botão de uma perícia da criatura: mostra o bônus, o atributo padrão e o nível, e rola o teste ao clicar */
export default function CreatureExpertiseButton({ name, expertise, onRoll }: CreatureExpertiseButtonProps): ReactElement {
    const config = getGMExpertiseConfig(expertise.value ?? 0);
    const IconComponent = config.icon;

    return (
        <Button
            fullWidth
            onClick={onRoll}
            disabled={false}
            sx={{
                p: 1.5,
                bgcolor: alpha(config.color, 0.12),
                border: '1px solid',
                borderColor: alpha(config.color, 0.25),
                borderRadius: 2,
                justifyContent: 'flex-start',
                textAlign: 'left',
                textTransform: 'none',
                opacity: 1,
                '&:hover': {
                    bgcolor: alpha(config.color, 0.18),
                    borderColor: alpha(config.color, 0.5)
                }
            }}
        >
            <Stack spacing={1} width="100%">
                <Box display="flex" alignItems="center" gap={1}>
                    <Box 
                        sx={{
                            p: 0.8,
                            borderRadius: 1,
                            bgcolor: alpha(config.color, 0.12),
                            border: '1px solid',
                            borderColor: alpha(config.color, 0.25)
                        }}
                    >
                        <IconComponent 
                            sx={{ 
                                color: config.color,
                                fontSize: '1.1rem'
                            }} 
                        />
                    </Box>
                    <Typography 
                        variant="subtitle2" 
                        sx={{ 
                            fontWeight: 600,
                            flex: 1
                        }}
                    >
                        {name}
                    </Typography>
                </Box>
                <Box display="flex" gap={1} flexWrap="wrap" justifyContent="space-between">
                    <Chip 
                        label={`${expertise.value >= 0 ? '+' : ''}${expertise.value}`}
                        size="small"
                        sx={{
                            bgcolor: config.color,
                            color: color.canvas,
                            fontWeight: 700,
                            fontSize: '0.75rem'
                        }}
                    />
                    {expertise.defaultAttribute && (
                        <Chip 
                            label={(expertise.defaultAttribute as string).toUpperCase()}
                            size="small"
                            sx={{
                                bgcolor: 'action.hover',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                            }}
                        />
                    )}
                    <Chip 
                        label={getGMExpertiseLevel(expertise.value).replace(/^(\w)/, (_, c) => c.toUpperCase())}
                        size="small"
                        variant="outlined"
                        sx={{
                            borderColor: alpha(config.color, 0.38),
                            color: 'text.primary',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                        }}
                    />
                </Box>
            </Stack>
        </Button>
    );
}
