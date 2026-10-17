'use client'

import Magic from '@components/charsheet/subcomponents/Magic'
import type { Spell } from '@models/entities'
import { Box, Typography } from '@mui/material'
import { color } from '@themes/tokens'
import ResourceMeter from './ResourceMeter'
import RollResult from './RollResult'

/** Magia real do catálogo, usada como exemplo na landing */
const BRASA_VORAZ = {
    id: 'landing-brasa-voraz',
    name: 'Brasa Voraz',
    element: 'FOGO',
    level: 1,
    mpCost: 1,
    type: 'Ataque (imediato)',
    execution: 'Padrão',
    range: 'Médio',
    stages: [
        'Você lança uma brasa faminta em um alvo, causando 1d6 de dano de fogo. Se o alvo for derrotado por este ataque, você recupera 3 MP.',
        'A brasa causa 2d6 de dano de fogo. Se o ataque acertar, você recupera 2 MP; se o alvo for derrotado, você recupera 4 MP no total.',
        'A brasa causa 3d6 de dano de fogo. Se o ataque acertar, você recupera 3 MP; se o alvo for derrotado, você recupera 6 MP no total e a brasa salta para outro inimigo a até 3m dele, causando metade do dano.'
    ]
} as unknown as Spell

/**
 * O produto como protagonista da landing: recursos da ficha, um cartão de magia real (com as abas de
 * estágio funcionando) e o resultado de uma rolagem com as fontes dos dados. Os valores são de exemplo.
 */
export default function HeroShowcase() {
    return (
        <Box
            sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                bgcolor: 'background.paper',
                p: { xs: 2, sm: 3 },
                display: 'grid',
                gap: 3
            }}
        >
            <Typography component="p" sx={{ color: 'text.disabled', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Ficha de exemplo
            </Typography>

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' } }}>
                <ResourceMeter label="Vida (LP)" value={42} max={60} barColor={color.lp} />
                <ResourceMeter label="Mana (MP)" value={18} max={24} barColor={color.mp} />
                <ResourceMeter label="Armadura (AP)" value={6} max={10} barColor={color.ap} />
            </Box>

            <Magic as="magic-spell" compact magic={BRASA_VORAZ} id="landing-brasa-voraz" selectedStage={2} />

            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.raised', p: 2 }}>
                <Typography component="p" sx={{ mb: 1, color: 'text.secondary', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em' }}>
                    ROLAGEM · BRASA VORAZ, 2d6
                </Typography>
                <RollResult sides={6} dice={[ 4, 6 ]} label="Brasa Voraz, 2d6 de dano de fogo" />
            </Box>
        </Box>
    )
}
