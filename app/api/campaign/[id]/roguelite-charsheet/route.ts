import { charsheetRepository, campaignRepository } from '@repositories';
import type { NextRequest } from 'next/server';

interface RogueliteCharsheetBody {
    name: string;
    race: string;
    age: number;
    gender: 'Masculino' | 'Feminino' | 'Não-binário' | 'Outro' | 'Não definido';
    userId: string;
    playerName: string;
    campaignCode: string;
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
    try {
        const { id: campaignId } = await params;
        const body: RogueliteCharsheetBody = await req.json();

        // Buscar a campanha
        const campaign = await campaignRepository.findById(campaignId);
        if (!campaign) {
            return Response.json({ message: 'Campanha não encontrada' }, { status: 404 });
        }

        // Verificar se o usuário já está na campanha
        const existingPlayer = campaign.players.find(p => p.userId === body.userId);
        if (existingPlayer) {
            return Response.json({ message: 'Usuário já está na campanha' }, { status: 400 });
        }

        // Criar ficha roguelite com valores padrões zerados
        const rogueliteCharsheet = {
            // Dados básicos do jogador
            name: body.name,
            playerName: body.playerName,
            userId: body.userId,
            race: body.race,
            age: body.age,
            gender: body.gender,
            
            // Valores fixos para roguelite
            class: 'Sem Classe',
            subclass: '',
            lineage: 'Sem Linhagem',
            mode: 'Classic', // Modo da ficha
            financialCondition: 'Miserável',
            anotacoes: '',
            elementalMastery: '',
            createdAt: new Date().toISOString(),
            
            // Valores numéricos iniciais
            level: 0,
            ORMLevel: 0,
            displacement: 9,
            spellSpace: 2,
            mpLimit: 0,
            overall: 0,
            
            // Arrays vazios
            status: [],
            dices: [],
            passives: [],
            spells: [],
            traits: [],
            
            // Atributos zerados
            attributes: {
                des: 0,
                vig: 0,
                log: 0,
                sab: 0,
                foc: 0,
                car: 0
            },
            
            // Stats iniciais roguelite
            stats: {
                lp: 20,
                mp: 10,
                ap: 5,
                maxLp: 20,
                maxMp: 10,
                maxAp: 5
            },
            
            // Pontos zerados
            points: {
                attributes: 0,
                expertises: 0,
                skills: 0,
                magics: 0
            },
            
            // Modificadores zerados
            mods: {
                attributes: {
                    des: 0,
                    vig: 0,
                    log: 0,
                    sab: 0,
                    foc: 0,
                    car: 0
                },
                discount: 0
            },
            
            // Inventário inicial
            inventory: {
                items: [],
                weapons: [],
                armors: [],
                money: 50
            },
            
            // Capacidade inicial
            capacity: {
                cargo: 0,
                max: 5
            },
            
            // Munição zerada
            ammoCounter: {
                current: 0,
                max: 0
            },
            
            // Skills vazios
            skills: {
                lineage: [],
                class: [],
                subclass: [],
                bonus: [],
                powers: [],
                race: []
            },
            
            // Perícias com valores padrão zerados
            expertises: {
                'Agilidade': { value: 0, defaultAttribute: 'des' },
                'Atletismo': { value: 0, defaultAttribute: 'vig' },
                'Competência': { value: 0, defaultAttribute: 'log' },
                'Comunicação': { value: 0, defaultAttribute: 'car' },
                'Condução': { value: 0, defaultAttribute: 'des' },
                'Conhecimento': { value: 0, defaultAttribute: 'sab' },
                'Controle': { value: 0, defaultAttribute: 'vig' },
                'Concentração': { value: 0, defaultAttribute: 'foc' },
                'Criatividade': { value: 0, defaultAttribute: 'log' },
                'Culinária': { value: 0, defaultAttribute: 'des' },
                'Diplomacia': { value: 0, defaultAttribute: 'car' },
                'Eficácia': { value: 0, defaultAttribute: null },
                'Enganação': { value: 0, defaultAttribute: 'car' },
                'Engenharia': { value: 0, defaultAttribute: 'log' },
                'Fortitude': { value: 0, defaultAttribute: null },
                'Força': { value: 0, defaultAttribute: 'vig' },
                'Furtividade': { value: 0, defaultAttribute: 'des' },
                'Intimidação': { value: 0, defaultAttribute: 'car' },
                'Intuição': { value: 0, defaultAttribute: 'sab' },
                'Interrogação': { value: 0, defaultAttribute: 'car' },
                'Investigação': { value: 0, defaultAttribute: 'log' },
                'Ladinagem': { value: 0, defaultAttribute: 'des' },
                'Liderança': { value: 0, defaultAttribute: 'car' },
                'Luta': { value: 0, defaultAttribute: 'vig' },
                'Magia': { value: 0, defaultAttribute: 'foc' },
                'Medicina': { value: 0, defaultAttribute: 'sab' },
                'Percepção': { value: 0, defaultAttribute: 'foc' },
                'Persuasão': { value: 0, defaultAttribute: 'car' },
                'Pontaria': { value: 0, defaultAttribute: 'des' },
                'Reflexos': { value: 0, defaultAttribute: 'foc' },
                'RES Física': { value: 0, defaultAttribute: 'vig' },
                'RES Mágica': { value: 0, defaultAttribute: 'foc' },
                'RES Mental': { value: 0, defaultAttribute: 'sab' },
                'Sorte': { value: 0, defaultAttribute: 'sab' },
                'Sobrevivência': { value: 0, defaultAttribute: 'sab' },
                'Tática': { value: 0, defaultAttribute: 'log' },
                'Tecnologia': { value: 0, defaultAttribute: 'log' },
                'Vontade': { value: 0, defaultAttribute: 'foc' }
            },
            
            // Session para roguelite
            session: [{
                campaignCode: body.campaignCode,
                stats: {
                    maxLp: 20,
                    maxMp: 10,
                    maxAp: 5,
                    lp: 20,
                    mp: 10,
                    ap: 5
                },
                perks: []
            }]
        };

        // Criar a ficha diretamente no Firestore (bypass class-validator)
        const createdCharsheet = await charsheetRepository.create(rogueliteCharsheet as any);

        // Adicionar jogador à campanha
        campaign.players.push({
            userId: body.userId,
            charsheetId: createdCharsheet.id
        });

        await campaignRepository.update(campaign);

        return Response.json({
            charsheet: createdCharsheet,
            message: 'Ficha roguelite criada com sucesso'
        }, { status: 201 });
    } catch (error: any) {
        console.error('Erro ao criar ficha roguelite:', error);
        return Response.json({ message: 'Erro ao criar ficha', error: error.message }, { status: 500 });
    }
}
