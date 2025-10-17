/* global use, db */
// MongoDB Migration Script - Magitech RPG II
// Script para migração completa da collection fichas

// Use the database
use('magitech');

// ============================================
// 1. Alterar raridade "Relíquia" para "Único" em itens, armas e armaduras
// ============================================
print("1. Alterando raridade 'Relíquia' para 'Único'...");

db.getCollection('fichas').updateMany(
    { "inventory.items.rarity": "Relíquia" },
    { $set: { "inventory.items.$[item].rarity": "Único" } },
    { arrayFilters: [{ "item.rarity": "Relíquia" }] }
);

db.getCollection('fichas').updateMany(
    { "inventory.weapons.rarity": "Relíquia" },
    { $set: { "inventory.weapons.$[weapon].rarity": "Único" } },
    { arrayFilters: [{ "weapon.rarity": "Relíquia" }] }
);

db.getCollection('fichas').updateMany(
    { "inventory.armors.rarity": "Relíquia" },
    { $set: { "inventory.armors.$[armor].rarity": "Único" } },
    { arrayFilters: [{ "armor.rarity": "Relíquia" }] }
);

print("✅ Raridades alteradas com sucesso!");

// ============================================
// 2. Mover maxLp, maxMp, maxAp para attributes
// ============================================
print("2. Movendo maxLp, maxMp, maxAp para attributes...");

// Primeiro, mover as propriedades soltas para attributes
db.getCollection('fichas').updateMany(
    { 
        $or: [
            { "maxLp": { $exists: true } },
            { "maxMp": { $exists: true } },
            { "maxAp": { $exists: true } }
        ]
    },
    [
        {
            $set: {
                "attributes.maxLp": { $ifNull: ["$maxLp", "$attributes.maxLp"] },
                "attributes.maxMp": { $ifNull: ["$maxMp", "$attributes.maxMp"] },
                "attributes.maxAp": { $ifNull: ["$maxAp", "$attributes.maxAp"] }
            }
        }
    ]
);

// Depois, remover as propriedades soltas
db.getCollection('fichas').updateMany(
    {},
    { 
        $unset: { 
            "maxLp": "",
            "maxMp": "",
            "maxAp": ""
        }
    }
);

print("✅ Propriedades max movidas para attributes!");

// ============================================
// 3. Alterar expertise "Argumentação" para "Diplomacia"
// ============================================
print("3. Alterando expertise 'Argumentação' para 'Diplomacia'...");

db.getCollection('fichas').updateMany(
    { "expertises.Argumentação": { $exists: true } },
    [
        {
            $set: {
                "expertises.Diplomacia": "$expertises.Argumentação"
            }
        },
        {
            $unset: "expertises.Argumentação"
        }
    ]
);

print("✅ Expertise 'Argumentação' alterada para 'Diplomacia'!");

// ============================================
// 4. Alterar defaultAttribute de "Intuição" e "RES Mental" para "sab"
// ============================================
print("4. Alterando defaultAttribute de expertises específicas...");

db.getCollection('fichas').updateMany(
    { "expertises.Intuição": { $exists: true } },
    { $set: { "expertises.Intuição.defaultAttribute": "sab" } }
);

db.getCollection('fichas').updateMany(
    { "expertises.RES Mental": { $exists: true } },
    { $set: { "expertises.RES Mental.defaultAttribute": "sab" } }
);

print("✅ DefaultAttribute alterado para 'sab'!");

// ============================================
// 5. Adicionar novas expertises
// ============================================
print("5. Adicionando novas expertises...");

db.getCollection('fichas').updateMany(
    {},
    {
        $set: {
            "expertises.Interrogação": {
                defaultAttribute: "car",
                value: 0,
                bonus: 0
            },
            "expertises.Engenharia": {
                defaultAttribute: "log",
                value: 0,
                bonus: 0
            },
            "expertises.Força": {
                defaultAttribute: "vig",
                value: 0,
                bonus: 0
            },
            "expertises.Culinária": {
                defaultAttribute: "des",
                value: 0,
                bonus: 0
            },
            "expertises.Tática": {
                defaultAttribute: "log",
                value: 0,
                bonus: 0
            }
        }
    }
);

print("✅ Novas expertises adicionadas!");

// ============================================
// 6. Adicionar propriedades "dices" e "passives" como arrays vazias
// ============================================
print("6. Adicionando propriedades 'dices' e 'passives'...");

db.getCollection('fichas').updateMany(
    { "dices": { $exists: false } },
    { $set: { "dices": [] } }
);

db.getCollection('fichas').updateMany(
    { "passives": { $exists: false } },
    { $set: { "passives": [] } }
);

print("✅ Propriedades 'dices' e 'passives' adicionadas!");

// ============================================
// 7. Multiplicar atributos de status por 5 (ou 0 se -1)
// ============================================
print("7. Multiplicando atributos de status por 5...");

db.getCollection('fichas').updateMany(
    {},
    [
        {
            $set: {
                "attributes.vig": {
                    $cond: {
                        if: { $eq: ["$attributes.vig", -1] },
                        then: 0,
                        else: { $multiply: ["$attributes.vig", 5] }
                    }
                },
                "attributes.des": {
                    $cond: {
                        if: { $eq: ["$attributes.des", -1] },
                        then: 0,
                        else: { $multiply: ["$attributes.des", 5] }
                    }
                },
                "attributes.foc": {
                    $cond: {
                        if: { $eq: ["$attributes.foc", -1] },
                        then: 0,
                        else: { $multiply: ["$attributes.foc", 5] }
                    }
                },
                "attributes.log": {
                    $cond: {
                        if: { $eq: ["$attributes.log", -1] },
                        then: 0,
                        else: { $multiply: ["$attributes.log", 5] }
                    }
                },
                "attributes.sab": {
                    $cond: {
                        if: { $eq: ["$attributes.sab", -1] },
                        then: 0,
                        else: { $multiply: ["$attributes.sab", 5] }
                    }
                },
                "attributes.car": {
                    $cond: {
                        if: { $eq: ["$attributes.car", -1] },
                        then: 0,
                        else: { $multiply: ["$attributes.car", 5] }
                    }
                }
            }
        }
    ]
);

print("✅ Atributos de status multiplicados por 5!");

// ============================================
// 8. Alterar classe "Lutador" para "Combatente"
// ============================================
print("8. Alterando classe 'Lutador' para 'Combatente'...");

db.getCollection('fichas').updateMany(
    { "class": "Lutador" },
    { $set: { "class": "Combatente" } }
);

print("✅ Classe 'Lutador' alterada para 'Combatente'!");

// ============================================
// 9. Transformar magics em array de _id apenas
// ============================================
print("9. Transformando magics em array de _id...");

db.getCollection('fichas').updateMany(
    { "magics": { $exists: true, $type: "array", $ne: [] } },
    [
        {
            $set: {
                "magics": {
                    $map: {
                        input: "$magics",
                        as: "magic",
                        in: "$$magic._id"
                    }
                }
            }
        }
    ]
);

print("✅ Magics transformadas em array de _id!");

// ============================================
// 10. Resetar propriedade "points"
// ============================================
print("10. Resetando propriedade 'points'...");

db.getCollection('fichas').updateMany(
    {},
    {
        $set: {
            "points": {
                attributes: 5,
                expertises: 4,
                skills: 0,
                magics: 1
            }
        }
    }
);

print("✅ Propriedade 'points' resetada!");

// ============================================
// RELATÓRIO FINAL
// ============================================
print("\n🎉 MIGRAÇÃO COMPLETA! 🎉");
print("=".repeat(50));
print("✅ 1. Raridades 'Relíquia' → 'Único'");
print("✅ 2. maxLp/maxMp/maxAp movidos para attributes");
print("✅ 3. Expertise 'Argumentação' → 'Diplomacia'");
print("✅ 4. DefaultAttribute de Intuição e RES Mental → 'sab'");
print("✅ 5. Novas expertises adicionadas");
print("✅ 6. Propriedades 'dices' e 'passives' adicionadas");
print("✅ 7. Atributos de status multiplicados por 3");
print("✅ 8. Classe 'Lutador' → 'Combatente'");
print("✅ 9. Magics transformadas em array de _id");
print("✅ 10. Propriedade 'points' resetada");
print("=".repeat(50));

// Contar documentos afetados
const totalFichas = db.getCollection('fichas').countDocuments();
print(`Total de fichas na collection: ${totalFichas}`);
