import { createSvgIcon } from '@mui/material/utils'

/**
 * Espadas cruzadas: o ícone de "Arma" do inventário (ficha e campanha).
 * Glifo "swords" preenchido do Material Symbols (Google, Apache-2.0, https://github.com/marella/material-symbols),
 * que não existe no @mui/icons-material. O original está numa grade de 960 com a origem embaixo
 * (viewBox "0 -960 960 960"); a transformação leva ao 24px dos ícones do MUI, então ele aceita
 * `color`, `fontSize` e `sx` como os outros (Shield, Inventory2).
 */

/** Contornos do glifo, ainda na grade original de 960 */
const SWORDS_PATH = [
    'M769-88 645-212l-88 88-43-43q-17-17-17-42t17-42l199-199q17-17 42-17t42 17l43 43-88 88 123 124q9 9 9 21t-9 21l-64 65q-9 9-21 9t-21-9Z',
    'm111-636L427-271l19 20q17 17 17 42t-17 42l-43 43-88-88L191-88q-9 9-21 9t-21-9l-65-65q-9-9-9-21t9-21l124-124-88-88 43-43q17-17 42-17t42 17l20 19 453-453h160v160Z',
    'M278-526 80-724v-160h160l198 198-160 160Z'
].join('')

const WeaponIcon = createSvgIcon(
    <path
        transform="translate(0 24) scale(0.025)"
        d={SWORDS_PATH}
    />,
    'Weapon'
)

export default WeaponIcon
