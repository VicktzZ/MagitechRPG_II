import type { Magia as MagiaType } from '@types';

import { Schema, model, models } from 'mongoose';

const magiaSchema = new Schema<MagiaType>({
    elemento: {
        type: String,
        required: [ true, 'Elemento is required!' ]
    },
    nome: {
        type: String,
        required: [ true, 'Name is required!' ]
    },
    custo: {
        type: Number,
        required: [ true, 'Custo is required!' ],
        default: 1
    },
    'nível': {
        type: Number,
        required: [ true, 'Nível is required!' ],
        default: 1
    },
    tipo: {
        type: String,
        required: [ true, 'Tipo is required!' ]
    },
    'execução': {
        type: String,
        required: [ true, 'Execução is required!' ]
    },
    alcance: {
        type: String,
        required: [ true, 'Alcance is required!' ]  
    },
    'estágio 1': {
        type: String
    },
    'estágio 2': {
        type: String
    },
    'estágio 3': {
        type: String
    },
    maestria: {
        type: String
    }
})

const Magia = models['Magia'] || model('Magia', magiaSchema)

export default Magia