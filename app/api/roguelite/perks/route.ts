/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { type NextRequest, NextResponse } from 'next/server';
import { perkRepository, weaponRepository, itemRepository, armorRepository, spellRepository, powerRepository, skillRepository } from '@repositories';
import { Perk } from '@models/entities';
import { calculatePowerRarity, calculateSkillRarity } from '@utils/calculatePerksRarity';
import { PerkTypeEnum } from "@enums/rogueliteEnum";
import createRandom from 'random-seed';
import { getRarityWeights } from '@features/roguelite/utils/perkRarityRoller';
import { cache, generateCacheKey, generateETag, isCacheValid } from '@utils/cacheApi';

/**
 * Calcula bônus de dano para armas baseado na raridade
 * Incomum: +2, Raro: +4, Épico: +6, Lendário: +8, Único: +10
 */
function getWeaponDamageBonus(rarity: string): number {
    const bonusMap: Record<string, number> = {
        'Incomum': 2,
        'Raro': 4,
        'Épico': 6,
        'Lendário': 8,
        'Único': 10,
        'Mágico': 5, // Equivalente a Épico
        'Amaldiçoado': 5, // Equivalente a Raro
        'Especial': 5 // Equivalente a Lendário
    };
    
    return bonusMap[rarity] || 0;
}

/**
 * Calcula bônus de defesa para armaduras baseado na raridade
 * Incomum: +1, Raro: +2, Épico: +3, Lendário: +4, Único: +5
 */
function getArmorDefenseBonus(rarity: string): number {
    const bonusMap: Record<string, number> = {
        'Incomum': 1,
        'Raro': 2,
        'Épico': 3,
        'Lendário': 4,
        'Único': 5,
        'Mágico': 3, // Equivalente a Épico
        'Amaldiçoado': 2, // Equivalente a Raro
        'Especial': 4 // Equivalente a Lendário
    };
    return bonusMap[rarity] || 0;
}

/**
 * Adiciona bônus de dano ao valor de dano da arma
 * Formatos suportados: "2d6", "3d8+2", "1d12", "5", etc.
 */
function addDamageBonus(currentDamage: string, bonus: number): string {
    // Se já tem um bônus, soma ao existente
    if (currentDamage.includes('+')) {
        const parts = currentDamage.split('+');
        const baseDamage = parts[0];
        const existingBonus = parseInt(parts[1]) || 0;
        return `${baseDamage}+${existingBonus + bonus}`;
    }
    
    // Adiciona bônus ao dano existente
    return `${currentDamage}+${bonus}`;
}

/**
 * Formata o dano com bônus coloridos para exibição
 * @param baseDamage Dano base (ex: "2d8")
 * @param bonus Bônus de dano (ex: 4)
 * @param isCritical Se é dano crítico (usa amarelo em vez de verde)
 */
function formatDamageWithBonus(baseDamage: string, bonus: number, isCritical: boolean = false): string {
    if (bonus <= 0) return baseDamage;
    
    const color = isCritical ? 'yellow' : 'green';
    return `${baseDamage} <span style="color: ${color}">(+${bonus})</span>`;
}

/**
 * Formata o dano completo com bônus coloridos
 * @param damageString String de dano completa (ex: "2d8+4")
 * @param isCritical Se é dano crítico
 */
function formatCompleteDamageWithBonus(damageString: string, isCritical: boolean = false): string {
    if (!damageString.includes('+')) return damageString;
    
    const parts = damageString.split('+');
    const baseDamage = parts[0];
    const bonus = parseInt(parts[1]) || 0;
    
    return formatDamageWithBonus(baseDamage, bonus, isCritical);
}

/**
 * Determina quais collections buscar baseado no perkType para otimizar consultas Firestore
 */
function getCollectionsForPerkType(perkType?: string): string[] {
    if (!perkType) {
        // Se não há perkType, buscar todas as collections (comportamento atual)
        return ['perks', 'powers', 'skills', 'items', 'armors', 'spells', 'weapons'];
    }

    switch (perkType) {
        case PerkTypeEnum.WEAPON:
            return ['weapons'];
        case PerkTypeEnum.ITEM:
            return ['items'];
        case PerkTypeEnum.ARMOR:
            return ['armors'];
        case PerkTypeEnum.STATS:
        case PerkTypeEnum.ACCESSORY:
        case PerkTypeEnum.UPGRADE:
        case PerkTypeEnum.BONUS:
        case PerkTypeEnum.EXPERTISE:
            return ['perks'];
        case PerkTypeEnum.SKILL:
            return ['perks', 'skills'];
        case PerkTypeEnum.SPELL:
            return ['spells'];
        default:
            // Para perkTypes não mapeados, buscar todas
            return ['perks', 'powers', 'skills', 'items', 'armors', 'spells', 'weapons'];
    }
}

/**
 * Seleciona aleatoriamente N itens de um array usando seed (random-seed)
 */
function selectRandomItems(items: any[], count: number, seed: string): any[] {
    if (items.length <= count) return items;
    
    // Criar gerador aleatório com seed usando random-seed
    const rng = createRandom(seed);
    
    // Fisher-Yates shuffle com seed
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, count);
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    
    const perkType = searchParams.get('perkType');
    
    // Otimização: usar perkType para determinar collections específicas e reduzir consumo de quota Firestore
    const collections = perkType 
        ? getCollectionsForPerkType(perkType)
        : searchParams.get('collections')?.split(',').map(c => c.trim()) || 
          [ 'perks', 'powers', 'items', 'armors', 'spells', 'weapons', 'skills' ];
    const levelRequired = searchParams.get('levelRequired');
    const rarity = searchParams.get('rarity');
    const seed = searchParams.get('seed');
    const perkAmountParam = searchParams.get('perkAmount');
    const userLevelParam = searchParams.get('level');
    const userLevel = userLevelParam ? parseInt(userLevelParam) : undefined;
    
    // Validação: se perkAmount for informado
    let finalSeed = seed;
    if (perkAmountParam) {
        const perkAmount = parseInt(perkAmountParam);
        if (isNaN(perkAmount) || perkAmount < 1 || perkAmount > 10) {
            return NextResponse.json({
                error: 'perkAmount deve ser um número entre 1 e 10'
            }, { status: 400 });
        }
        
        // Gerar seed aleatória se não for informada
        if (!seed) {
            finalSeed = Math.random().toString(36).substring(2, 15);
        }
    }
    
    // Gerar chave de cache baseada nos parâmetros
    const filters = {
        perkType: perkType || null,
        levelRequired: levelRequired || null,
        rarity: rarity || null,
        seed: finalSeed || null,
        perkAmount: perkAmountParam || null,
        level: userLevel || null
    };
    
    const cacheKey = generateCacheKey(collections, filters);
    
    // Verificar cache válido
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && isCacheValid(cachedEntry)) {
        console.log('Cache HIT para:', cacheKey);
        const cachedData = cachedEntry.data;
        
        // Adicionar headers de cache HTTP
        const response = NextResponse.json(cachedData);
        response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
        response.headers.set('ETag', generateETag(cachedData.data || Object.values(cachedData).flat()));
        response.headers.set('X-Cache', 'HIT');
        
        return response;
    }
    
    console.log('Cache MISS para:', cacheKey);
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
            
            // Filtrar skills por nível do usuário (não mostrar skills com nível > nível do usuário)
            if (userLevel !== undefined) {
                skills = skills.filter(skill => {
                    const skillLevel = (skill as any).level;
                    return skillLevel === undefined || skillLevel <= userLevel;
                });
            }
            
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
            
            // Ajustar raridade de armaduras comuns baseado no nível do usuário
            if (userLevel !== undefined) {
                const rarityWeights = getRarityWeights(userLevel);
                const armorSeed = finalSeed ? `${finalSeed}-armors` : 'default-armors';
                const armorRng = createRandom(armorSeed);
                
                armors = armors.map(armor => {
                    const armorObj = armor as any;
                    
                    // Se não tem rogueliteRarity, usar rarity como base
                    if (!armorObj.rogueliteRarity && armorObj.rarity) {
                        armorObj.rogueliteRarity = armorObj.rarity;
                    }
                    
                    // Apenas ajustar armaduras com raridade "Comum"
                    const hasCommonRarity = armorObj.rogueliteRarity === 'Comum' || armorObj.rarity === 'Comum';
                    
                    if (hasCommonRarity) {
                        // Calcular probabilidade cumulativa para upgrade
                        const roll = armorRng.random() * 100;
                        let cumulative = 0;
                        
                        // Tentar upgrade para raridades superiores
                        for (const [rarity, weight] of Object.entries(rarityWeights)) {
                            if (rarity !== 'Comum') {
                                cumulative += weight;
                                
                                if (roll <= cumulative) {
                                    const defenseBonus = getArmorDefenseBonus(rarity);
                                    const upgradedArmor = {
                                        ...armorObj,
                                        rarity: rarity as any,
                                        rogueliteRarity: rarity as any,
                                        upgradedFromCommon: true
                                    };
                                    
                                    // Adicionar bônus de defesa à armadura
                                    if (upgradedArmor.value !== undefined) {
                                        upgradedArmor.originalValue = armorObj.value; // Guardar valor original
                                        upgradedArmor.value = armorObj.value + defenseBonus;
                                    }
                                    
                                    // Também adicionar bônus ao campo de defesa se existir
                                    if (upgradedArmor.defense !== undefined) {
                                        upgradedArmor.originalDefense = armorObj.defense;
                                        upgradedArmor.defense = armorObj.defense + defenseBonus;
                                    }
                                    
                                    return upgradedArmor;
                                }
                            }
                        }
                    }
                    
                    return armorObj;
                });
            }
            
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
            
            // Ajustar raridade de armas comuns baseado no nível do usuário
            if (userLevel !== undefined) {
                const rarityWeights = getRarityWeights(userLevel);
                const weaponSeed = finalSeed ? `${finalSeed}-weapons` : 'default-weapons';
                const weaponRng = createRandom(weaponSeed);
                
                weapons = weapons.map(weapon => {
                    const weaponObj = weapon as any;
                    
                    // Se não tem rogueliteRarity, usar rarity como base
                    if (!weaponObj.rogueliteRarity && weaponObj.rarity) {
                        weaponObj.rogueliteRarity = weaponObj.rarity;
                    }
                    
                    // Apenas ajustar armas com raridade "Comum"
                    const hasCommonRarity = weaponObj.rogueliteRarity === 'Comum' || weaponObj.rarity === 'Comum';
                    
                    if (hasCommonRarity) {
                        // Calcular probabilidade cumulativa para upgrade
                        const roll = weaponRng.random() * 100;
                        let cumulative = 0;
                        
                        // Tentar upgrade para raridades superiores
                        for (const [rarity, weight] of Object.entries(rarityWeights)) {
                            if (rarity !== 'Comum') {
                                cumulative += weight;
                                
                                if (roll <= cumulative) {
                                    const damageBonus = getWeaponDamageBonus(rarity);
                                    const upgradedWeapon = {
                                        ...weaponObj,
                                        rarity: rarity as any,
                                        rogueliteRarity: rarity as any,
                                        upgradedFromCommon: true
                                    };
                                    
                                    // Adicionar bônus de dano ao efeito da arma
                                    if (upgradedWeapon.effect && upgradedWeapon.effect.value) {
                                        const originalValue = weaponObj.effect.value;
                                        const newValue = addDamageBonus(originalValue, damageBonus);
                                        
                                        upgradedWeapon.effect = {
                                            ...upgradedWeapon.effect,
                                            value: newValue,
                                            originalValue: originalValue, // Guardar valor original
                                            // Propriedades formatadas para exibição
                                            displayValue: formatCompleteDamageWithBonus(newValue, false),
                                            displayCritValue: null // Será preenchido se existir critValue
                                        };
                                        
                                        // Também adicionar bônus ao dano crítico proporcionalmente
                                        if (upgradedWeapon.effect.critValue) {
                                            const originalCritValue = weaponObj.effect.critValue;
                                            const newCritValue = addDamageBonus(originalCritValue, damageBonus * 2);
                                            
                                            upgradedWeapon.effect.critValue = newCritValue;
                                            upgradedWeapon.effect.originalCritValue = originalCritValue;
                                            upgradedWeapon.effect.displayCritValue = formatCompleteDamageWithBonus(newCritValue, true);
                                        }
                                    }
                                    
                                    return upgradedWeapon;
                                }
                            }
                        }
                    }
                    
                    return weaponObj;
                });
            }
            
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
            
            // Aplicar seleção aleatória se perkAmount for informado
            let finalData = responseWithMetadata;
            if (perkAmountParam && finalSeed) {
                const perkAmount = parseInt(perkAmountParam);
                const selectedItems = selectRandomItems(filteredResults, perkAmount, finalSeed);
                
                finalData = {
                    data: selectedItems,
                    _query: {
                        ...responseWithMetadata._query,
                        seed: finalSeed,
                        perkAmount,
                        selectedFrom: filteredResults.length,
                        autoGenerated: !seed
                    }
                };
            }
            
            // Armazenar no cache
            cache.set(cacheKey, {
                data: finalData,
                timestamp: Date.now()
            });
            
            const response = NextResponse.json(finalData);
            
            // Adicionar headers de cache para 5 minutos
            response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
            response.headers.set('ETag', generateETag(Array.isArray(finalData.data) ? finalData.data : filteredResults));
            response.headers.set('X-Cache', 'MISS');
            
            return response;
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

        // Aplicar seleção aleatória se perkAmount for informado
        let finalResult = result;
        if (perkAmountParam && finalSeed) {
            const perkAmount = parseInt(perkAmountParam);
            
            // Unificar todos os dados em uma única array
            const allItems = Object.values(result)
                .filter(Array.isArray)
                .flat() as any[];
            
            const selectedItems = selectRandomItems(allItems, perkAmount, finalSeed);
            
            finalResult = {
                data: selectedItems,
                _query: {
                    ...result._query,
                    seed: finalSeed,
                    perkAmount,
                    selectedFrom: allItems.length,
                    autoGenerated: !seed
                }
            };
        }

        // Armazenar no cache
        cache.set(cacheKey, {
            data: finalResult,
            timestamp: Date.now()
        });
        
        const response = NextResponse.json(finalResult);
        
        // Adicionar headers de cache para 5 minutos
        response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
        const etagData = finalResult.data ? finalResult.data : Object.values(finalResult).flat();
        response.headers.set('ETag', generateETag(etagData));
        response.headers.set('X-Cache', 'MISS');
        
        return response;

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
