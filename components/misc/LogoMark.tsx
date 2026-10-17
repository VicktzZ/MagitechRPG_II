import { color } from '@themes/tokens'
import { LOGO_ACCENTS, LOGO_STROKES, LOGO_VIEWBOX } from './logoMark'

interface LogoMarkProps {
    /** Lado em px (a marca é quase quadrada) */
    size?: number
    /** Nome acessível; sem ele a marca é decorativa */
    title?: string
}

/** Marca do logo em SVG: traço na cor do texto (`currentColor`) e pontas em ciano */
export default function LogoMark({ size = 40, title }: LogoMarkProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox={LOGO_VIEWBOX}
            role={title ? 'img' : undefined}
            aria-label={title}
            aria-hidden={title ? undefined : true}
            focusable="false"
            style={{ flex: 'none' }}
        >
            <path fill="currentColor" fillRule="evenodd" d={LOGO_STROKES} />
            <path fill={color.cyan} fillRule="evenodd" d={LOGO_ACCENTS} />
        </svg>
    )
}
