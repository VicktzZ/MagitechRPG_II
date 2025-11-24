/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { type NextRequest, NextResponse } from 'next/server';
import { perkRepository, weaponRepository, itemRepository, armorRepository, spellRepository, powerRepository, skillRepository } from '@repositories';
import { Perk } from '@models/entities';
import { calculatePowerRarity, calculateSkillRarity } from '@utils/calculatePerksRarity';
import { PerkTypeEnum } from '@enums/rogueliteEnum';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    
    const collections = searchParams.get('collections')?.split(',').map(c => c.trim()) || 
        [ 'perks', 'powers', 'items', 'armors', 'spells', 'weapons', 'skills' ];
    const perkType = searchParams.get('perkType');
    const levelRequired = searchParams.get('levelRequired');
    const rarity = searchParams.get('rarity');
    
    const result: any = {};

    try {
        // Buscar collections solicitadas
        if (collections.includes('perks')) {
            let perks = await perkRepository.find();
            
            // Aplicar filtros para perks
            if (perkType) {
                perks = perks.filter(perk => perk.perkType === perkType);
            }
            if (levelRequired) {
                const level = parseInt(levelRequired);
                if (!isNaN(level)) {
                    perks = perks.filter(perk => 
                        perk.levelRequired === undefined || perk.levelRequired === level
                    );
                }
            }

            if (rarity) {
                perks = perks.filter(perk => 
                    (perk as any).rarity === rarity
                );
            }
            
            result.perks = perks;
        }

        if (collections.includes('powers')) {
            let powers = await powerRepository.find();
            
            // Adicionar raridade calculada baseada nos pré-requisitos
            powers = powers.map(power => {
                const powerObj = power as any;
                const rogueliteRarity = calculatePowerRarity(powerObj.preRequisite);
                return {
                    ...powerObj,
                    rogueliteRarity
                };
            });
            
            // Aplicar filtros para powers (se aplicável)
            if (perkType) {
                powers = powers.filter(power => (power as any).perkType === perkType);
            }
            if (levelRequired) {
                const level = parseInt(levelRequired);
                if (!isNaN(level)) {
                    powers = powers.filter(power => 
                        (power as any).levelRequired === undefined || (power as any).levelRequired === level
                    );
                }
            }
            if (rarity) {
                powers = powers.filter(power => 
                    (power as any).rogueliteRarity === rarity
                );
            }
            
            // Adicionar perkType após todo o processamento
            powers = powers.map(power => ({
                ...power,
                perkType: PerkTypeEnum.SKILL
            }));
            
            result.powers = powers;
        }
        
        if (collections.includes('skills')) {
            let skills = await skillRepository.find();
            
            // Adicionar raridade calculada baseada no tipo e nível
            skills = skills.map(skill => {
                const skillObj = skill as any;
                const calculatedRarity = calculateSkillRarity(
                    skillObj.type, 
                    skillObj.level, 
                    skillObj.rarity
                );
                return {
                    ...skillObj,
                    rogueliteRarity: calculatedRarity
                };
            });
            
            // Aplicar filtros para skills
            if (rarity) {
                skills = skills.filter(skill => 
                    (skill as any).rogueliteRarity === rarity
                );
            }
            if (levelRequired) {
                const level = parseInt(levelRequired);
                if (!isNaN(level)) {
                    skills = skills.filter(skill => 
                        (skill as any).level === undefined || (skill as any).level === level
                    );
                }
            }
            
            // Adicionar perkType após todo o processamento
            skills = skills.map(skill => ({
                ...skill,
                perkType: PerkTypeEnum.SKILL
            }));
            
            result.skills = skills;
        }

        if (collections.includes('items')) {
            let items = await itemRepository.find();
            
            // Aplicar filtros para items
            if (rarity) {
                items = items.filter(item => 
                    (item as any).rogueliteRarity === rarity
                );
            }
            if (levelRequired) {
                const level = parseInt(levelRequired);
                if (!isNaN(level)) {
                    items = items.filter(item => 
                        (item as any).levelRequired === undefined || (item as any).levelRequired === level
                    );
                }
            }
            
            // Adicionar perkType após todo o processamento
            items = items.map(item => ({
                ...item,
                perkType: PerkTypeEnum.ITEM
            }));
            
            result.items = items;
        }

        if (collections.includes('armors')) {
            let armors = await armorRepository.find();
            
            // Aplicar filtros para armors
            if (rarity) {
                armors = armors.filter(armor => 
                    (armor as any).rogueliteRarity === rarity
                );
            }
            if (levelRequired) {
                const level = parseInt(levelRequired);
                if (!isNaN(level)) {
                    armors = armors.filter(armor => 
                        (armor as any).levelRequired === undefined || (armor as any).levelRequired === level
                    );
                }
            }
            
            // Adicionar perkType após todo o processamento
            armors = armors.map(armor => ({
                ...armor,
                perkType: PerkTypeEnum.ARMOR
            }));
            
            result.armors = armors;
        }

        if (collections.includes('spells')) {
            let spells = await spellRepository.find();
            
            // Aplicar filtros para spells
            if (rarity) {
                spells = spells.filter(spell => 
                    (spell as any).rogueliteRarity === rarity
                );
            }
            if (levelRequired) {
                const level = parseInt(levelRequired);
                if (!isNaN(level)) {
                    spells = spells.filter(spell => 
                        (spell as any).levelRequired === undefined || (spell as any).levelRequired === level
                    );
                }
            }
            
            // Adicionar perkType após todo o processamento
            spells = spells.map(spell => ({
                ...spell,
                perkType: PerkTypeEnum.SPELL
            }));
            
            result.spells = spells;
        }

        if (collections.includes('weapons')) {
            let weapons = await weaponRepository.find();
            
            // Aplicar filtros para weapons
            if (rarity) {
                weapons = weapons.filter(weapon => 
                    (weapon as any).rogueliteRarity === rarity
                );
            }
            if (levelRequired) {
                const level = parseInt(levelRequired);
                if (!isNaN(level)) {
                    weapons = weapons.filter(weapon => 
                        (weapon as any).levelRequired === undefined || (weapon as any).levelRequired === level
                    );
                }
            }
            
            // Adicionar perkType após todo o processamento
            weapons = weapons.map(weapon => ({
                ...weapon,
                perkType: PerkTypeEnum.WEAPON
            }));
            
            result.weapons = weapons;
        }

        // Se perkType for filtrado, retornar array unificada com metadados
        if (perkType) {
            const allResults = Object.values(result).flat() as any[];
            
            // Aplicar filtro final por perkType (já foi aplicado em cada collection)
            const filteredResults = allResults.filter(item => item.perkType === perkType);
            
            // Adicionar metadados da consulta
            const responseWithMetadata = {
                data: filteredResults,
                _query: {
                    collections,
                    filters: {
                        perkType: perkType || null,
                        levelRequired: levelRequired || null,
                        rogueliteRarity: rarity || null
                    },
                    totalItems: filteredResults.length
                }
            };
            
            return NextResponse.json(responseWithMetadata);
        }

        // Adicionar metadados da consulta para resposta normal
        result._query = {
            collections,
            filters: {
                perkType: perkType || null,
                levelRequired: levelRequired || null,
                rogueliteRarity: rarity || null
            },
            totalItems: Object.values(result).filter(Array.isArray).reduce((sum, arr) => sum + arr.length, 0)
        };

        return NextResponse.json(result);

    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        return NextResponse.json({
            error: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const body = await request.json()
    const perk = new Perk(body)
    await perkRepository.create(perk)
    return NextResponse.json(perk)
}
