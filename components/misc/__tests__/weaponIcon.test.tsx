import { readFileSync } from 'fs'
import { join } from 'path'
import { itemAttributes } from '../../../constants'
import { renderToStaticMarkup } from 'react-dom/server'
import { getItemTypeConfig } from '../../campaign/playerDashboard/inventory/itemTypeConfig'
import WeaponIcon from '../WeaponIcon'

describe('WeaponIcon', () => {
    it('é um SVG de 24px com um caminho e um nome acessível para o teste', () => {
        const html = renderToStaticMarkup(<WeaponIcon />)
        expect(html).toContain('viewBox="0 0 24 24"')
        expect(html).toContain('data-testid="WeaponIcon"')
        expect(html).toContain('<path')
    })

    it('aceita fontSize e sx como os ícones do MUI', () => {
        expect(renderToStaticMarkup(<WeaponIcon fontSize="small" />)).toContain('MuiSvgIcon-fontSizeSmall')
    })

    it('a ficha (itemAttributes) e a campanha (getItemTypeConfig) usam o mesmo ícone de arma', () => {
        expect(itemAttributes.weapon.icon).toBe(WeaponIcon)
        expect(getItemTypeConfig('weapon').icon).toBe(WeaponIcon)
    })

    it('é um módulo de cliente: sem isso o build quebra em /grimoire/pdf, rota de servidor que importa @constants', () => {
        const source = readFileSync(join(__dirname, '..', 'WeaponIcon.tsx'), 'utf8')
        expect(/^\s*'use client'/.test(source)).toBe(true)
    })
})
