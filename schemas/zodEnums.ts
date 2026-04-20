import { z } from 'zod';

export const ElementoEnum = z.enum([ 'Fogo', 'Água', 'Terra', 'Ar', 'Eletricidade', 'Trevas', 'Luz', 'Não-elemental' ])
export const ElementoToUpperEnum = z.enum([ 'FOGO', 'ÁGUA', 'AR', 'TERRA', 'ELETRICIDADE', 'TREVAS', 'LUZ', 'SANGUE', 'VÁCUO', 'PSÍQUICO', 'RADIAÇÃO', 'EXPLOSÃO', 'NÃO-ELEMENTAL' ])