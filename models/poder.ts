import type { MagicPower } from '@types';
import { Schema, model, models } from 'mongoose';

const poderSchema = new Schema<MagicPower>({
    nome: {
        type: String,
        required: true
    },
    'descrição': {
        type: String,
        required: true
    },
    elemento: {
        type: String,
        required: true
    },
    maestria: {
        type: String,
        required: true
    },
    'pré-requisito': {
        type: String
    }
})

const Poder = models['Poderes'] || model('Poderes', poderSchema)

export default Poder