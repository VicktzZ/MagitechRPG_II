import { IsObject } from 'class-validator';
import type { Attributes } from './Attributes';

export class Expertise {
    value: number;
    defaultAttribute: keyof Attributes | null;

    constructor(attribute: keyof Attributes | null) {
        this.value = 0;
        this.defaultAttribute = attribute;
    }
}

export class Expertises {
    @IsObject() 'Agilidade': Expertise = new Expertise('des');
    @IsObject() 'Atletismo': Expertise = new Expertise('vig');
    @IsObject() 'Competência': Expertise = new Expertise('log');
    @IsObject() 'Comunicação': Expertise = new Expertise('car');
    @IsObject() 'Condução': Expertise = new Expertise('des');
    @IsObject() 'Conhecimento': Expertise = new Expertise('sab');
    @IsObject() 'Controle': Expertise = new Expertise('vig');
    @IsObject() 'Concentração': Expertise = new Expertise('foc');
    @IsObject() 'Criatividade': Expertise = new Expertise('log');
    @IsObject() 'Culinária': Expertise = new Expertise('des');
    @IsObject() 'Diplomacia': Expertise = new Expertise('car');
    @IsObject() 'Eficácia': Expertise = new Expertise(null);
    @IsObject() 'Enganação': Expertise = new Expertise('car');
    @IsObject() 'Engenharia': Expertise = new Expertise('log');
    @IsObject() 'Fortitude': Expertise = new Expertise(null);
    @IsObject() 'Força': Expertise = new Expertise('vig');
    @IsObject() 'Furtividade': Expertise = new Expertise('des');
    @IsObject() 'Intimidação': Expertise = new Expertise('car');
    @IsObject() 'Intuição': Expertise = new Expertise('sab');
    @IsObject() 'Interrogação': Expertise = new Expertise('car');
    @IsObject() 'Investigação': Expertise = new Expertise('log');
    @IsObject() 'Ladinagem': Expertise = new Expertise('des');
    @IsObject() 'Liderança': Expertise = new Expertise('car');
    @IsObject() 'Luta': Expertise = new Expertise('vig');
    @IsObject() 'Magia': Expertise = new Expertise('foc');
    @IsObject() 'Medicina': Expertise = new Expertise('sab');
    @IsObject() 'Percepção': Expertise = new Expertise('foc');
    @IsObject() 'Persuasão': Expertise = new Expertise('car');
    @IsObject() 'Pontaria': Expertise = new Expertise('des');
    @IsObject() 'Reflexos': Expertise = new Expertise('foc');
    @IsObject() 'RES Física': Expertise = new Expertise('vig');
    @IsObject() 'RES Mágica': Expertise = new Expertise('foc');
    @IsObject() 'RES Mental': Expertise = new Expertise('sab');
    @IsObject() 'Sorte': Expertise = new Expertise('sab');
    @IsObject() 'Sobrevivência': Expertise = new Expertise('sab');
    @IsObject() 'Tática': Expertise = new Expertise('log');
    @IsObject() 'Tecnologia': Expertise = new Expertise('log');
    @IsObject() 'Vontade': Expertise = new Expertise('foc');

    constructor(expertises?: Expertises) {
        Object.assign(this, expertises)
    }
}