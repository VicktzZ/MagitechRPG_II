/* eslint-disable @typescript-eslint/ban-types */
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { SvgIconTypeMap } from '@mui/material/SvgIcon';
import type { Armor, Item, Weapon } from './ficha'

export type ItemTyping<C> =
    C extends 'weapon' ? (Weapon<'Leve' | 'Pesada'> & { bonusValue: number[], isDisadvantage: boolean, diceQuantity: number }) :
    C extends 'armor' ? Armor : Item

export type ItemAttributes = {
    [key in 'weapon' | 'armor' | 'item']: {
        icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>> & { muiName: string; }
        color: string
        label: string
        badgeColor: string
    }
}