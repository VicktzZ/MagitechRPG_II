import { elementColor } from '@constants'
import { SvgIcon, type SvgIconProps } from '@mui/material'
import { elementGlyphs, resolveElement } from './elementGlyphs'

interface ElementIconProps extends Omit<SvgIconProps, 'children'> {
    /** Elemento da magia ou do poder, em qualquer caixa */
    element?: string | null
    /** Pinta o glifo com a cor do elemento; sem isso ele herda `currentColor` */
    colored?: boolean
}

export { resolveElement }

/** Glifo SVG do elemento (substitui o ícone de faíscas e os ícones soltos do Material) */
export default function ElementIcon({ element, colored = false, sx, titleAccess, ...props }: ElementIconProps) {
    const name = resolveElement(element)

    return (
        <SvgIcon
            viewBox="0 0 24 24"
            titleAccess={titleAccess}
            sx={{
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: 1.75,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                ...(colored ? { color: elementColor[name] } : {}),
                ...sx
            }}
            {...props}
        >
            <path d={elementGlyphs[name]} />
        </SvgIcon>
    )
}
