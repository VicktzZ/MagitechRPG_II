import ElementIcon from '@components/misc/ElementIcon'
import { Box, Typography } from '@mui/material'
import { element, type ElementName } from '@themes/tokens'

/** Os 13 elementos do catálogo como marcas: glifo na cor do elemento e o nome ao lado */
export default function ElementStrip() {
    return (
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {(Object.keys(element) as ElementName[]).map(name => (
                <Box
                    component="li"
                    key={name}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25,
                        px: 1.75,
                        py: 1.25,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'background.raised'
                    }}
                >
                    <ElementIcon element={name} colored />
                    <Typography component="span" sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em' }}>
                        {name}
                    </Typography>
                </Box>
            ))}
        </Box>
    )
}
