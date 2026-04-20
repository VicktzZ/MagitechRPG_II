/* eslint-disable @typescript-eslint/ban-types */
import type { Armor, Item, Weapon } from '@models';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { SvgIconTypeMap } from '@mui/material/SvgIcon';

export type ItemTyping<C> =
    C extends 'weapon' ? (Weapon & { bonusValue: number[], isDisadvantage: boolean, diceQuantity: number }) :
    C extends 'armor' ? Armor : Item

export type ItemAttributes = {
    [key in 'weapon' | 'armor' | 'item']: {
        icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>> & { muiName: string; }
        color: string
        label: string
        badgeColor: string
    }
}