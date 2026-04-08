import type { DamageType } from '@models/types/string';

export const damageWeakness: Partial<Record<DamageType, DamageType | null>> = {
    'Cortante': 'Impactante',
    'Perfurante': 'Cortante',
    'Impactante': 'Perfurante',
    
    'Fogo': 'Água',
    'Água': 'Eletricidade',
    'Ar': 'Terra',
    'Terra': 'Fogo',
    'Eletricidade': 'Ar',
    'Trevas': 'Luz',
    'Luz': 'Trevas',

    'Sangue': 'Tóxico',
    'Explosão': 'Vácuo',
    'Psíquico': 'Radiação',
    'Vácuo': 'Sangue',
    'Tóxico': 'Psíquico',
    'Radiação': 'Explosão',

    'Não-elemental': null
}