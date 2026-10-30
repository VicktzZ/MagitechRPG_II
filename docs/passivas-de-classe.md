# Habilidades de classe e subclasse no combate assistido

> Arquivo gerado por `scripts/generatePassivesDoc.ts` a partir de `utils/combat/passives/catalog.ts`. Não edite à mão.

Total: **120** habilidades (48 de classe e 72 de subclasse).
**25** automáticas · **18** ativadas · **77** só texto.

- **Automática**: vale sozinha (dano a mais, custo de MP, AP, resistência, iniciativa, regeneração...), sem o jogador acionar.
- **Ativada**: o jogador aciona pela seção Ações (quadrado da habilidade): o app confere MP e usos, gasta a ação (aviso, nunca trava), cura ou põe o efeito sobre o personagem. As de **reação a ataque** (Barreira de Ki, Metamorfose Adaptativa, Resposta Tática, Reflexos Táticos, Xeque-Mate) não têm quadrado: usam-se em "Reagir", no cartão do ataque recebido, antes de o mestre resolver; a armada só se paga se a condição se cumprir.
- **Só texto**: o app mostra a descrição; quem aplica é o mestre. Entra no catálogo uma de cada vez, acrescentando uma entrada em `catalog.ts`.

A coluna "Fora do automático" lista o que da descrição o app **não** faz sozinho nas habilidades já estruturadas.

## Classe

### Combatente

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Bom de Briga | Automática |  |  |
| Reflexos Aumentados | Automática |  | Testes de Agilidade fora da iniciativa: o +1 dado é na mão. |
| Regeneração Furiosa | Automática |  |  |
| Armado | Automática |  |  |
| Não-Elementalista | Automática |  |  |
| Muralha | Automática |  | Vale enquanto o LP está em 10% ou menos; a regra dura até a vida voltar a 50%, e essa memória é do mestre. |

### Especialista

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Treinado | Só texto |  |  |
| Esforço | Só texto |  |  |
| Perspectiva | Só texto |  |  |
| Afluência | Só texto |  |  |
| Preferência | Só texto |  |  |
| Sucessão | Só texto |  |  |

### Feiticeiro

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Feitiçaria | Automática |  | Escolher a magia de nível 1 ao adquirir a habilidade é na ficha. |
| Prevenção Mágica | Só texto |  |  |
| Magia Guiada | Só texto |  |  |
| Fixação Mágica | Só texto |  |  |
| Imunidade Mágica | Automática |  |  |
| Magismo Total | Automática |  |  |

### Bruxo

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Fazer Poção | Só texto |  |  |
| Inverter Polaridades | Só texto |  |  |
| Maldição | Só texto |  |  |
| Recobro Maldito | Só texto |  |  |
| Anátema Elemental | Só texto |  |  |
| Contato Astral | Só texto |  |  |

### Monge

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Autoconsciência | Só texto |  |  |
| Cura Interior | Ativada | Bônus · sem MP · 3 de 3 por dia · 1 de 1 por combate |  |
| Reflexos | Só texto |  |  |
| Meditação | Só texto |  |  |
| Força Vital | Automática |  |  |
| Aura Efêmera | Só texto |  |  |

### Druida

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Retaguarda | Só texto |  |  |
| Cura Reveladora | Só texto |  |  |
| Plano de Recuperação | Só texto |  |  |
| Vínculo Druídico | Só texto |  |  |
| Peripécia | Só texto |  |  |
| Fraternidade | Só texto |  |  |

### Arcano

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Magia Simbólica | Só texto |  |  |
| Concentração | Ativada | Completa · sem MP · 1 de 1 por combate | O limite é "uma vez por cena": o app conta uma vez por combate. |
| Magia Furtiva | Só texto |  |  |
| Magia Resiliente | Automática |  | Forçar novo teste de resistência (3 MP) é na mão. |
| Adiar Magia | Só texto |  |  |
| Ascensão Arcana | Automática |  |  |

### Ladino

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Disfarce | Automática |  | Vale quando o efeito Furtivo é aplicado no turno dele. |
| Ligeireza | Automática |  | Andar sem alertar criaturas é do mestre. |
| Ataque Duplo | Só texto |  |  |
| Sempre Distante | Automática |  |  |
| Abscondido | Automática |  | Sentidos aguçados e +1 MP por turno enquanto furtivo são do mestre. |
| Prejuízo | Só texto |  |  |

## Subclasse

### Polimorfo

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Metamorfose Adaptativa | Ativada | Reação · 3 MP · 3 de 3 por combate · reação a ataque, armada | A ação é premissa minha (o texto só diz "sempre que você sofre dano"): o app a trata como Reação; só se paga se o ataque causar dano. |
| Pele Resistente | Automática |  |  |
| Forma Primordial | Ativada | Bônus · todo o MP · 1 de 1 por dia | A ação gasta é premissa minha (o texto não diz). |

### Comandante

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Liderar | Só texto |  |  |
| Postura Defensiva | Ativada | Bônus · 5 MP · 3 de 3 por dia | Os aliados a 6m recebem o mesmo efeito pelo mestre; +3 de Agilidade e −1d8 nos seus ataques são na mão; a ação gasta é premissa minha. |
| Chamado à Glória | Ativada | Padrão · 12 MP · 3 de 3 por dia · 1 de 1 por combate | Os aliados são os que você marca (o app não mede os 15m); o +2 nas resistências e os +1d4 MP por turno são na mão; a cura vem no começo do turno de cada um; a ação é premissa minha. |

### Aniquilador

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Força Implacável | Só texto |  |  |
| Frenesi de Batalha | Só texto |  |  |
| Avatar da Destruição | Ativada | Completa · 20 MP · 1 de 1 por dia | A imunidade a Medo, Atordoado e Paralisado é do mestre; o dobro vale para todo ataque (o texto diz corpo a corpo). |

### Forasteiro

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Perspicácia | Só texto |  |  |
| Espírito da Caçada | Só texto |  |  |
| Caminho do Ermo | Só texto |  |  |

### Errante

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Trilheiro | Automática |  | +3 em Sobrevivência e Percepção e o mesmo para os aliados são do mestre. |
| Resiliência Inata | Automática |  | O dado é rolado pelo mestre. |
| Trilha da Fortuna | Ativada | Bônus · sem MP · 1 de 1 por combate | Testes automaticamente bem-sucedidos e o efeito nos aliados são do mestre; a ação gasta é premissa minha. |

### Duelista

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Analisar Oponente | Ativada | Padrão · 8 MP | Revelar a resistência ou vulnerabilidade do alvo é do mestre; o d20 vale para todo ataque, não só contra o alvo analisado. |
| Resposta Tática | Ativada | Reação · sem MP · reação a ataque, armada | "Uma vez por rodada" é a própria Reação (uma por rodada); só se paga se o ataque corpo a corpo errar. |
| Xeque-Mate | Ativada | Reação · 20 MP · 1 de 1 por dia · reação a ataque | A duração do choque (até o fim do próximo turno de quem o aplicou) é de 1 rodada: premissa minha. |

### Conjurador

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Conjuração | Automática |  | Ignorar 3 de resistência mágica e +1 turno de conjuração são do mestre. |
| Sequela Perfeita | Só texto |  |  |
| Carga Rúnica | Só texto |  |  |

### Elementalista

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Domínio Elemental | Automática |  | O elemento escolhido é o da maestria elemental da ficha (premissa minha: a ficha não guarda outra escolha). |
| Fúria Elemental | Só texto |  |  |
| Manifestação Elemental | Só texto |  |  |

### Caoticista

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Magia Instável | Só texto |  |  |
| Absorção Entrópica | Só texto |  |  |
| Zona de Anomalia Arcana | Só texto |  |  |

### Discípulo

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Ecos de Raiva | Só texto |  |  |
| Impacto Devastador | Só texto |  |  |
| Fúria Implacável | Só texto |  |  |

### Protetor

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Presença Tranquilizante | Só texto |  |  |
| Aura Serena | Só texto |  |  |
| Harmonia | Só texto |  |  |

### Mestre

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Golpe de Ki | Ativada | Bônus · 4 MP | O alcance de 3m do ataque desarmado é do mestre; o dano vale para arma branca (o ataque desarmado do Monge entra na ficha como arma); a ação gasta é premissa minha. |
| Barreira de Ki | Ativada | Reação · 8 MP · reação a ataque | O empurrão de 3m é do mestre (o app não move ninguém). |
| Canhão de Ki Devastador | Só texto |  |  |

### Necromante

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Aura Decadente | Automática |  | Impedir ressurreição, −2 de resistência física e 1d4 de dano por turno nos inimigos a 5m são do mestre. |
| Legião Profana | Só texto |  |  |
| Vínculo Obscuro | Só texto |  |  |

### Espiritista

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Aliança Espectral | Só texto |  |  |
| Sustento Espiritual | Só texto |  |  |
| Chamado dos Ancestrais | Só texto |  |  |

### Arauto

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Maldição Debilitante | Ativada | Padrão · 8 MP | O alvo precisa estar visível (é do mestre); só uma criatura de cada vez (o app tira a maldição do alvo anterior). |
| Vínculo Doloroso | Só texto |  |  |
| Ceifar a Essência | Só texto |  |  |

### Animante

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Ciclo Vital | Só texto |  |  |
| Fraternidade | Só texto |  |  |
| Animação | Só texto |  |  |

### Naturomante

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Vanguarda | Só texto |  |  |
| Vínculo Florido | Só texto |  |  |
| Força da Vida | Só texto |  |  |

### Guardião

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Postura Bestial | Ativada | Bônus · sem MP | Os +3 de RES e os 5 LP temporários do Urso, o passo de 3m do Lobo e ignorar cobertura da Águia são na mão; a ação é "livre" (Bônus). |
| Mimetismo Feral | Só texto |  |  |
| Fúria da Natureza | Só texto |  |  |

### Arquimago

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Teia da Realidade | Só texto |  |  |
| Anulação Mágica | Só texto |  |  |
| Manipulação Elemental | Automática |  | Trocar o elemento da magia antes de lançar é na mão. |

### Metamágico

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Intensificação Mágica | Só texto |  |  |
| Conjuração Rápida | Só texto |  |  |
| Estágio Quatro | Só texto |  |  |

### Glifomante

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Glifo de Proteção | Só texto |  |  |
| Sentinela Rúnica | Só texto |  |  |
| Selo do Arcanista Supremo | Só texto |  |  |

### Espectro

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Desvanecer | Ativada | Bônus · 6 MP | A desvantagem dos ataques contra ele é do mestre; fora de combate dura 15 minutos; a ação gasta é premissa minha. |
| Sombras Penetrantes | Automática |  | Desvantagem do alvo nas resistências e o dano ao errar são do mestre. |
| Assassino Etéreo | Só texto |  |  |

### Estrategista

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Ataque Calculado | Automática |  | Vale só na primeira rodada, contra o alvo escolhido que ainda não agiu. |
| Reflexos Táticos | Ativada | Reação · sem MP · 1 de 1 por combate · reação a ataque, armada | A esquiva em si é a de sempre (Reflexos); a habilidade dá o contra-ataque quando ela anula o dano e a Retaliação quando o personagem leva dano corpo a corpo sem esquivar. O texto limita só a esquiva ("um primeiro ataque, uma vez por combate"); o app conta os dois no mesmo uso por combate (premissa minha). |
| Ritmo da Batalha | Ativada | Bônus · 10 MP · 1 de 1 por combate | Dois ataques numa só ação e a desvantagem dos inimigos no turno seguinte são do mestre; a ação gasta é premissa minha. |

### Embusteiro

| Habilidade | Modo | Ativação | Fora do automático |
| --- | --- | --- | --- |
| Imagem Espelhada | Só texto |  |  |
| Passo do Enganador | Só texto |  |  |
| Fantasma da Traição | Só texto |  |  |
