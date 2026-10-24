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
})
