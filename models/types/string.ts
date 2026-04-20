export type FinancialCondition = 'Miserável' | 'Pobre' | 'Estável' | 'Rico'
export type Gender = 'Masculino' | 'Feminino' | 'Não-binário' | 'Outro' | 'Não definido'
export type UpperCaseAttributes = 'DES' | 'VIG' | 'LOG' | 'SAB' | 'FOC' | 'CAR'
export type ItemType = 'Especial' | 'Utilidade' | 'Consumível' | 'Item Chave' | 'Munição' | 'Capacidade' | 'Padrão' | 'Arremessável' | 'Equipamento'
export type RarityType = 'Comum' | 'Incomum' | 'Raro' | 'Épico' | 'Lendário' | 'Único' | 'Mágico' | 'Especial' | 'Amaldiçoado'
export type WeaponType = `Arremessável (${ThrowableRangeType})` | 'Duas mãos' | 'Padrão' | 'Automática' | 'Semi-automática'
export type ArmorType = 'Padrão' | 'Total' | DamageType
export type DamageType = 'Cortante' | 'Impactante' | 'Perfurante' | 'Explosivo' | Element
export type EquipamentSpace = 'Não Ocupa' | 'Botas' | 'Colar' | 'Amuleto' | 'Anel' | 'Cinto' | 'Peitoral' | 'Capacete' | 'Costas' | 'Luvas' | 'Pernas'

export type WeaponKind = 
    'Arma de Haste' |
    'Espada' |
    'Adaga' |
    'Adagas Duplas' |
    'Arma de Energia' |
    'Arma de Concussão' |
    'Foice' |
    'Escudo' |
    'Machado' |
    'Arma de Fogo' |
    'Lança' |
    'Martelo' |
    'Arma Explosiva' |
    'Arco' | 
    'Soqueira' | 
    'Pistola' | 
    'Pistola de Energia' |
    'Metralhadora' |  
    'Metralhadora de Energia' |
    'Submetralhadora' | 
    'Submetralhadora de Energia' |
    'Espingarda' | 
    'Espingarda de Energia' |
    'Fuzil' |
    'Fuzil de Energia' |
    'Rifle de Atirador' |
    'Rifle de Atirador de Energia'

export type ClassNames =
    'Combatente' |
    'Especialista' |
    'Feiticeiro' |
    'Bruxo' |
    'Monge' |
    'Druida' |
    'Arcano' |
    'Ladino' 

export type SubclassNames = 
    'Polimorfo' |
    'Comandante' |
    'Aniquilador' |

    'Forasteiro' |
    'Errante' |
    'Duelista' |

    'Conjurador' |
    'Elementalista' |
    'Caoticista' |

    'Necromante' |
    'Espiritista' |
    'Arauto' |

    'Discípulo' |
    'Protetor' |
    'Mestre' |

    'Animante' |
    'Naturomante' |
    'Guardião' |

    'Arquimago' |
    'Metamágico' |
    'Glifomante' |

    'Espectro' |
    'Estrategista' |
    'Embusteiro'
    
export type LineageNames = 
    'Órfão' |
    'Órfão' |
    'Infiltrado' |
    'Estrangeiro' |
    'Camponês' |
    'Burguês' |
    'Artista' |
    'Ginasta' |
    'Herdeiro' |
    'Cobaia' |
    'Gangster' |
    'Hacker' |
    'Atirador' |
    'Clínico' |
    'Aventureiro' |
    'Trambiqueiro' |
    'Prodígio' |
    'Novato' |
    'Inventor' |
    'Idólatra' |
    'Cismático' |
    'Pesquisador' |
    'Investigador'

export type OccupationNames =
    'Artista' |
    'Médico' |
    'Militar' |
    'Mafioso' |
    'Cozinheiro' |
    'Inventor' |
    'Jardineiro' |
    'Programador' |
    'Cientista' |
    'Pesquisador' |
    'Empresário' |
    'Professor' |
    'Político' | 
    'Criminoso' |
    'Engenheiro' |
    'Mecânico' | 
    'Autônomo' |
    'Atleta' | 
    'Detetive' |
    'Sucateiro' |
    'Caçador' |
    'Clérigo' |
    'Desempregado'

export type AmmoType = 
    '9mm' |
    'Calibre .50' |
    'Calibre 12' |
    'Calibre 22' | 
    'Dardo' |
    'Ácido' |
    'Bateria de lítio' |
    'Amplificador de partículas' |
    'Cartucho de fusão' |
    'Servomotor iônico' |
    'Flecha' |
    'Combustível' | 
    'Foguete' | 
    'Granada' |
    'Serra de metal' |
    'Bateria de Cádmio com Óxido de Grafeno'

export type RangeType = 
    'Corpo-a-corpo' |
    'Curto (3m)' |
    'Padrão (9m)' |
    'Médio (18m)' |
    'Longo (30m)' |
    'Ampliado (90m)' |
    'Visível' |
    'Ilimitado'

export type ThrowableRangeType = 
    '3m' |
    '9m' |
    '18m' |
    '30m' |
    '90m' |
    'Visível' |
    'Ilimitado'

export type PassiveOccasion = 
    'Início do turno' |
    'Final do turno' |
    'Ao ser atacado' |
    'Ao atacar' |
    'Ao usar magia' |
    'Ao sofrer dano' |
    'Ao causar dano' |
    'Sempre ativo' |
    'Quando curar' |
    'Ao se deslocar' |
    'Condição específica' |
    'Personalizado'

export type WeaponCategory <T extends 'Leve' | 'Pesada'> = 
    `Arma Branca (${T})` |
    `Arma de Longo Alcance (${T})` |
    `Arma de Fogo (${T})` |
    `Arma de Energia (${T})` |
    `Arma Mágica (${T})` |
    `Arma Especial (${T})`

export type WeaponAccesoriesType = WeaponScientificAccesoriesType | WeaponMagicalAccesoriesType | 'Não possui acessórios'
export type ArmorAccessoriesType = ArmorScientificAccesoriesType | ArmorMagicalAccesoriesType | 'Não possui acessórios'

export type WeaponScientificAccesoriesType = 
    'Gravitron' |
    'Nanomáquinas' |
    'Electrochip' |
    'Lasering' |
    'Nióbio sônico' |
    'Silenciador' |
    'Pente estendido' |
    'Mira' |
    'Cano curto' |
    'Ponta de tungstênio' |
    'Munição explosiva' |
    'Munição perfurante' |
    'Ponta oca' | 
    'Empunhadura' |
    'Munição teleguiada' |
    'Cabo de borracha' |
    'Lanterna' |
    'Espinhos/Lâmina de Tungstênio' |
    'Cano/Lâmina Estriada' |
    'Polímero Treliçado'

export type WeaponMagicalAccesoriesType = 
    'Switch Elemental' |
    'CNT' |
    'Chip mágico' |
    'Correntes mágicas' |
    'Repetidor' |
    'Paralisante' |
    'Espaços adicionais'

export type ArmorScientificAccesoriesType = 
    'Revestimento de Tungstênio' |
    'Polímero de Estireno' |
    'Polímero Treliçado' |
    'Exoesqueleto mecânico' |
    'DCA' |
    'Sistema de Temperamento' |
    'Compartimentos Extras' |
    'Visão noturna' |
    'Sistema de Auto-Reparo' |
    'SSC'

export type ArmorMagicalAccesoriesType = 
    'Switch Elemental' |
    'Espaços Adicionais' |
    'Restauração Mágica' |
    'DSD' |
    'Reservatório de Mana' |
    'SAM'

export type Element = 
    'Fogo' |
    'Água' |
    'Terra' |
    'Ar' |
    'Eletricidade' |
    'Trevas' |
    'Luz' |
    'Não-elemental' |
    'Sangue' |
    'Radiação' |
    'Explosão' |
    'Tóxico' |
    'Psíquico' |
    'Vácuo'

export type ElementToUpper = 
    'FOGO' |
    'ÁGUA' |
    'TERRA' |
    'AR' |
    'ELETRICIDADE' |
    'TREVAS' |
    'LUZ' |
    'NÃO-ELEMENTAL' | 
    'SANGUE' |
    'RADIAÇÃO' |
    'EXPLOSAO' |
    'PSÍQUICO' |
    'VÁCUO'