import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { renderToStream } from '@react-pdf/renderer';
import { spellRepository } from '@repositories';
import type { Spell } from '@models/entities';
import { elementColor as elementColors } from '@constants'

// Estilos
const styles = StyleSheet.create({
    page: {
        backgroundColor: '#0A0E27',
        padding: 30,
        fontFamily: 'Helvetica'
    },
    header: {
        marginBottom: 20,
        borderBottom: '2px solid #00D9FF',
        paddingBottom: 10
    },
    title: {
        fontSize: 28,
        color: '#00D9FF',
        textAlign: 'center',
        letterSpacing: 3,
        fontWeight: 'bold'
    },
    subtitle: {
        fontSize: 10,
        color: '#7A8B99',
        textAlign: 'center',
        marginTop: 5
    },
    elementSection: {
        marginBottom: 25
    },
    elementHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        paddingLeft: 8,
        paddingTop: 6,
        paddingBottom: 6,
        borderLeft: '4px solid',
        backgroundColor: 'rgba(0, 217, 255, 0.05)'
    },
    specialElementsTitle: {
        fontSize: 18,
        color: '#FF00FF',
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 15,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 2
    },
    columnsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15
    },
    column: {
        width: '32%',
        flexDirection: 'column'
    },
    spellCard: {
        backgroundColor: '#151B3D',
        border: '1px solid #2A3F5F',
        borderRadius: 6,
        padding: 12,
        marginBottom: 12,
        boxShadow: '0 2px 8px rgba(0, 217, 255, 0.1)'
    },
    spellElementBadge: {
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        marginBottom: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 3,
        alignSelf: 'flex-start'
    },
    spellName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 6,
        letterSpacing: 0.5
    },
    spellInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
        paddingBottom: 6,
        borderBottom: '1px solid #2A3F5F'
    },
    infoItem: {
        flexDirection: 'row'
    },
    infoLabel: {
        fontSize: 8,
        color: '#7A8B99',
        marginRight: 3
    },
    infoValue: {
        fontSize: 8,
        color: '#00D9FF',
        fontWeight: 'bold'
    },
    spellType: {
        fontSize: 8,
        color: '#FFD700',
        fontStyle: 'italic',
        marginBottom: 6
    },
    stageContainer: {
        marginTop: 4
    },
    stageHeader: {
        fontSize: 8,
        color: '#00D9FF',
        fontWeight: 'bold',
        marginTop: 4,
        marginBottom: 2
    },
    stageDescription: {
        fontSize: 7.5,
        color: '#C5D3E0',
        lineHeight: 1.4,
        paddingLeft: 6
    }
});

// Componente de Badge do Elemento
function ElementBadge({ element }: { element: string }) {
    return (
        <View
            style={[
                styles.spellElementBadge,
                {
                    backgroundColor: elementColors[element] || '#808080',
                    color: element === 'LUZ' ? '#000000' : '#FFFFFF',
                }
            ]}
        >
            <Text>{element}</Text>
        </View>
    );
}

// Componente de Card de Magia
function SpellCard({ spell }: { spell: Spell }) {
    const extraMpCost = {
        1: {
            1: 1,
            2: 2
        },
        2: {
            1: 2,
            2: 4
        },
        3: {
            1: 2,
            2: 5
        },
        4: {
            1: 4,
            2: 9
        }
    }

    return (
        <View style={styles.spellCard}>
            <ElementBadge element={spell.element} />

            <Text style={styles.spellName}>{spell.name}</Text>

            <View style={styles.spellInfo}>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Nível:</Text>
                    <Text style={styles.infoValue}>{spell.level}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>MP:</Text>
                    <Text style={styles.infoValue}>{spell.mpCost}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Alcance:</Text>
                    <Text style={styles.infoValue}>{spell.range}</Text>
                </View>
            </View>

            <Text style={styles.spellType}>{spell.type} • {spell.execution}</Text>

            <View style={styles.stageContainer}>
                {spell.stages.map((stage, index) => (
                    <>
                        {!!stage && (
                            <View key={index}>
                                <Text style={styles.stageHeader}>
                                    {Number(spell.level) === 4 && index === 2 ? 'MAESTRIA:' : `Estágio ${index + 1}:`}
                                </Text>
                                <Text style={styles.stageDescription}>{stage}</Text>
                            </View>
                        )}
                    </>
                ))}
            </View>
        </View>
    );
}

// Função para organizar magias
const organizeSpells = (spells: Spell[]) => {
    const normalElements = [ 'FOGO', 'ÁGUA', 'AR', 'TERRA', 'ELETRICIDADE', 'LUZ', 'TREVAS', 'NÃO-ELEMENTAL' ];
    const specialElements = [ 'SANGUE', 'RADIAÇÃO', 'PSÍQUICO', 'EXPLOSÃO', 'VÁCUO' ];

    const organized: Record<string, Spell[]> = {};

    spells.forEach(spell => {
        if (!organized[spell.element]) {
            organized[spell.element] = [];
        }
        organized[spell.element].push(spell);
    });

    // Ordenar magias dentro de cada elemento
    Object.keys(organized).forEach(element => {
        organized[element].sort((a, b) => {
            const levelDiff = parseInt(a.level) - parseInt(b.level);
            if (levelDiff !== 0) return levelDiff;
            return parseInt(a.mpCost) - parseInt(b.mpCost);
        });
    });

    return { organized, normalElements, specialElements };
};

// Função para distribuir magias em colunas
const distributeInColumns = (spells: Spell[]) => {
    const columns: Spell[][] = [ [], [], [] ];
    let currentColumn = 0;

    spells.forEach(spell => {
        columns[currentColumn].push(spell);
        currentColumn = (currentColumn + 1) % 3;
    });

    return columns;
};

// Componente Principal do Documento
function SpellsDocument({ spells }: { spells: Spell[] }) {
    const { organized, normalElements, specialElements } = organizeSpells(spells);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>MAGITECH - GRIMÓRIO</Text>
                    <Text style={styles.subtitle}>V1.4</Text>
                </View>

                {/* Elementos Normais */}
                {normalElements.map(element => {
                    if (!organized[element] || organized[element].length === 0) return null;

                    const columns = distributeInColumns(organized[element]);

                    return (
                        <View key={element} style={styles.elementSection}>
                            <Text
                                style={[
                                    styles.elementHeader,
                                    {
                                        color: elementColors[element],
                                        borderLeftColor: elementColors[element]
                                    }
                                ]}
                            >
                                {element}
                            </Text>

                            <View style={styles.columnsContainer}>
                                {columns.map((column, colIndex) => (
                                    <View key={colIndex} style={styles.column}>
                                        {column.map(spell => (
                                            <SpellCard key={spell.id} spell={spell} />
                                        ))}
                                    </View>
                                ))}
                            </View>
                        </View>
                    );
                })}
            </Page>

            {/* Página para Elementos Especiais */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>MAGITECH - GRIMÓRIO</Text>
                    <Text style={styles.subtitle}>V1.4</Text>
                </View>

                <Text style={styles.specialElementsTitle}>⚠ Elementos Especiais ⚠</Text>

                {specialElements.map(element => {
                    if (!organized[element] || organized[element].length === 0) return null;

                    const columns = distributeInColumns(organized[element]);

                    return (
                        <View key={element} style={styles.elementSection}>
                            <Text
                                style={[
                                    styles.elementHeader,
                                    {
                                        color: elementColors[element],
                                        borderLeftColor: elementColors[element]
                                    }
                                ]}
                            >
                                {element}
                            </Text>

                            <View style={styles.columnsContainer}>
                                {columns.map((column, colIndex) => (
                                    <View key={colIndex} style={styles.column}>
                                        {column.map(spell => (
                                            <SpellCard key={spell.id} spell={spell} />
                                        ))}
                                    </View>
                                ))}
                            </View>
                        </View>
                    );
                })}
            </Page>
        </Document>
    );
};

export async function GET() {
    const spells = await spellRepository.find();
    const stream = await renderToStream(<SpellsDocument spells={spells} />);

    return new Response(stream as any, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="magitech-grimoire.pdf"'
        }
    });
}