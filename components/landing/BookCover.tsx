import { elementGlyphs } from '@components/misc/elementGlyphs'
import { LOGO_ACCENTS, LOGO_STROKES } from '@components/misc/logoMark'
import { Box } from '@mui/material'
import { color, element, font, type ElementName } from '@themes/tokens'

interface BookCoverProps {
    variant: 'guia' | 'grimorio'
    title: [ string, string? ]
    /** Nome acessível do botão (ex.: "Baixar o Livro de Regras") */
    label: string
    onClick: () => void
}

const WIDTH = 300
const HEIGHT = 400
const CENTER_X = WIDTH / 2
const CENTER_Y = 160
const RING_RADIUS = 96
const GLYPH_SCALE = 1.35

/** Capa tipográfica em SVG, no lugar das capas em PNG de 10 MB: marca, glifos dos elementos e título */
export default function BookCover({ variant, title, label, onClick }: BookCoverProps) {
    const names = Object.keys(element) as ElementName[]
    const [ first, second ] = title

    return (
        <Box
            component="button"
            type="button"
            onClick={onClick}
            aria-label={label}
            sx={{
                all: 'unset',
                display: 'block',
                cursor: 'pointer',
                width: '100%',
                maxWidth: WIDTH,
                borderRadius: 3,
                '&:hover .cover-frame': { stroke: color.borderStrong },
                '&:focus-visible': { outline: `2px solid ${color.amber}`, outlineOffset: 3 }
            }}
        >
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" role="img" aria-hidden focusable="false" style={{ display: 'block' }}>
                <rect className="cover-frame" x="0.5" y="0.5" width={WIDTH - 1} height={HEIGHT - 1} rx="12" fill={color.surface} stroke={color.border} />
                <rect x="14" y="14" width={WIDTH - 28} height={HEIGHT - 28} rx="6" fill="none" stroke={color.border} />

                <text x={CENTER_X} y="44" textAnchor="middle" fill={color.inkMuted} fontFamily={font.display} fontSize="11" fontWeight="600" letterSpacing="3.5">
                    MAGITECH RPG
                </text>

                {variant === 'grimorio' ? (
                    <g>
                        {names.map((name, index) => {
                            const angle = -Math.PI / 2 + (index * 2 * Math.PI) / names.length
                            const x = CENTER_X + RING_RADIUS * Math.cos(angle) - 12 * GLYPH_SCALE
                            const y = CENTER_Y + RING_RADIUS * Math.sin(angle) - 12 * GLYPH_SCALE
                            return (
                                <path
                                    key={name}
                                    d={elementGlyphs[name]}
                                    transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${GLYPH_SCALE})`}
                                    fill="none"
                                    stroke={element[name]}
                                    strokeWidth="1.75"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            )
                        })}
                        <g transform={`translate(${CENTER_X - 36} ${CENTER_Y - 36}) scale(${72 / 520})`}>
                            <path fill={color.ink} fillRule="evenodd" d={LOGO_STROKES} />
                            <path fill={color.cyan} fillRule="evenodd" d={LOGO_ACCENTS} />
                        </g>
                    </g>
                ) : (
                    <g transform={`translate(${CENTER_X - 85} ${CENTER_Y - 85}) scale(${170 / 520})`}>
                        <path fill={color.ink} fillRule="evenodd" d={LOGO_STROKES} />
                        <path fill={color.cyan} fillRule="evenodd" d={LOGO_ACCENTS} />
                    </g>
                )}

                <line x1="60" y1="296" x2={WIDTH - 60} y2="296" stroke={color.amberLine} strokeWidth="1" />
                <text x={CENTER_X} y={second ? 332 : 346} textAnchor="middle" fill={color.ink} fontFamily={font.display} fontSize="30" fontWeight="600">
                    {first}
                </text>
                {second && (
                    <text x={CENTER_X} y="366" textAnchor="middle" fill={color.ink} fontFamily={font.display} fontSize="30" fontWeight="600">
                        {second}
                    </text>
                )}
            </svg>
        </Box>
    )
}
