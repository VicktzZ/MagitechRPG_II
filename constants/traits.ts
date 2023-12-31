import type { Trait } from "@types";

const traits: {
    good: Record<string, Trait>,
    bad: Record<string, Trait>
} = {
    good: {
        'Sentidos aguçados': {
            'Competência': 2,
            'Agilidade': 2
        },
    
        'Saúde de ferro': {
            'Sobrevivência': 2,
            'Destreza': 2
        },
    
        'Regeneração aprimorada': {
            'Resistência Física': 3
        },
    
        'Valentia': {
            'Força': 3
        },
    
        'Concentração': {
            'Destreza': 3
        },
    
        'Perfeccionismo': {
            'Competência': 3
        },
        
        'Imunidade': {
            'Sobrevivência': 3
        },
    
        'Sensatez': {
            'Argumentação': 3
        },
    
        'Moderação': {
            'Controle': 3
        },
    
        'Diligência': {
            'Competência': 2
        },
    
        'Otimismo': {
            'Persuasão': 2
        },
    
        'Coragem': {
            'Resistência Mental': 2
        },
    
        'Honradez': {
            'Liderança': 2
        },
    
        'Hipertrofia': {
            'Força': 2
        },
    
        'Robustez': {
            'Resistência Física': 2
        },
    
        'Atraente': {
            'Enganação': 2
        },
    
        'Conhecido como justo': {
            'Persuasão': 2
        },
    
        'Paciência': {
            'Controle': 1
        },
    
        'Bom humor': {
            'Resistência Mental': 1
        },
    
        'Ceticismo': {
            'Argumentação': 1
        },
    
        'Flexibilidade': {
            'Criatividade': 1
        },
    
        'Extroversão': {
            'Persuasão': 1
        },
    
        'Perspicácia': {
            'Percepção': 1
        },
    
        'Sagacidade': {
            'Agilidade': 1
        },
    
        'Eloquência': {
            'Liderança': 1
        }
    },
    
    bad: {
        'Timidez': {
            'Persuasão': -1
        },
    
        'Ingenuidade': {
            'Criatividade': -1
        },
    
        'Monotomia': {
            'Agilidade': -1
        },
    
        'Dicção prejudicada': {
            'Argumentação': -1
        },
    
        'Pavio curto': {
            'Controle': -2
        },
    
        'Depressão': {
            'Resistência Mental': -2 
        },
    
        'Fanatismo': {
            'Argumentação': -2
        },
    
        'Teimosia': {
            'Criatividade': -2
        },
    
        'Desnutrição': {
            'Força': -2
        },
    
        'Baixa estatura': {
            'Resistência Física': -2
        },
    
        'Repulsividade': {
            'Persuasão': -2
        },
    
        'Conhecido como injusto': {
            'Enganação': -2
        },
    
        'Preguiça': {
            'Competência': -3
        },
    
        'Pessimismo': {
            'Argumentação': -3
        },
    
        'Covardia': {
            'Resistência Mental': -3
        },
        
        'Desonra': {
            'Liderança': -3
        },
    
        'Negligência': {
            'Competência': -3
        },
    
        'Distração': {
            'Destreza': -3
        },
    
        'Insensatez': {
            'Criatividade':  -3
        },
    
        'Compulsão': {
            'Controle': -3
        },
    
        'Doença crônica/mental': {
            'Resistência Mental': -2,
            'Competência': -2
        },
    
        'Vulnerável a temperatura/química': {
            'Sobrevivência': -4
        },
    
        'Fobia incontrolável': {
            'Resistência Mental': -4 
        },
    
        'Alergia': {
            'Sobrevivência': -4
        },
    
        'Limitação física/sensorial': {
            'Força': -1,
            'Resistência Mental': -1,
            'Resistência Física': -1,
            'Competência': -2
        },
    
        'Doença degenerativa': {
            'Força': -1,
            'Resistência Física': -2,
            'Sobrevivência': -2
        },
    
        'Sociopatia': {
            'Liderança': -3,
            'Controle': -2
        },
    
        'Autodestruição': {
            'Resistência Mental': -2,
            'Controle': -3
        }
    }
}

export default traits