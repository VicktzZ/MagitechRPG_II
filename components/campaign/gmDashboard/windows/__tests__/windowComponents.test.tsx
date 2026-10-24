import { ThemeProvider } from '@mui/material';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { healthySheet } from '@utils/__tests__/charsheetFixture';
import theme from '../../../../../themes/theme';
import { color } from '../../../../../themes/tokens';
import FloatingWindow from '../FloatingWindow';
import { PartyPortrait, type PortraitVital } from '../PartyPortrait';
import EditableSection from '../EditableSection';
import { SummaryView, type SummaryActions } from '../SummaryView';
import VitalsPanel, { type VitalRow } from '../VitalsPanel';
import type { Bounds } from '../windowGeometry';
import type { WindowEntry } from '../windowState';

// O hook de sistema customizado puxa os contextos do app; aqui basta o padrão (sem sistema customizado)
jest.mock('../../useCharsheetPointsView', () => ({
    useCharsheetPointsView: () => ({
        customSystem: null,
        weightUnit: 'kg',
        hasLP: true,
        hasMP: true,
        hasAP: true,
        lpName: 'Vida',
        mpName: 'Mana',
        apName: 'Armadura'
    })
}));

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>);

const bounds: Bounds = { left: 100, top: 72, right: 1100, bottom: 792 };

const entry = (overrides: Partial<WindowEntry> = {}): WindowEntry => ({
    key: 'summary:a',
    kind: 'summary',
    charsheetId: 'a',
    x: 200,
    y: 150,
    w: 380,
    h: 520,
    collapsed: false,
    z: 1,
    ...overrides
});

const noop = (): void => undefined;

// A edição de verdade grava na ficha pelo serviço; aqui só importa o estado que a casca mostra
const mockEditing = { isEditing: false, isSaving: false };
jest.mock('../../modals/charsheetDetails/useCharsheetEditing', () => ({
    useCharsheetEditing: () => ({
        isEditing: mockEditing.isEditing,
        setIsEditing: () => undefined,
        isSaving: mockEditing.isSaving,
        editedData: {},
        updateNestedField: () => undefined,
        handleNumberInputChange: () => undefined,
        handleSave: () => undefined,
        handleCancelEdit: () => undefined
    })
}));

const playerActions: SummaryActions = {
    canGrantEvolution: true,
    onAddItem: noop,
    onGrantEvolution: noop,
    onNotify: noop,
    onRemove: noop
};

const windowProps = {
    title: 'Resumo: Kael',
    rank: 0,
    isFront: true,
    bounds,
    mobile: false,
    focusToken: 0,
    onFocus: noop,
    onClose: noop,
    onCommit: noop,
    onToggleCollapse: noop
};

describe('FloatingWindow', () => {
    it('é um diálogo não modal, com nome, título, botões de recolher e fechar e as três alças de tamanho', () => {
        const html = render(<FloatingWindow entry={entry()} {...windowProps}><p>conteúdo</p></FloatingWindow>);
        expect(html).toContain('role="dialog"');
        expect(html).toContain('aria-modal="false"');
        expect(html).toContain('aria-label="Resumo: Kael"');
        expect(html).toContain('aria-label="Recolher Resumo: Kael"');
        expect(html).toContain('aria-label="Fechar Resumo: Kael"');
        expect(html).toContain('conteúdo');
        expect(html.match(/cursor:\s*(ew|ns|nwse)-resize|ew-resize|ns-resize|nwse-resize/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
    });

    it('fica na posição e no tamanho guardados e acima das janelas de trás', () => {
        const html = render(<FloatingWindow entry={entry()} {...windowProps} rank={3}><p>x</p></FloatingWindow>);
        expect(html).toContain('left:200px');
        expect(html).toContain('top:150px');
        expect(html).toContain('width:380px');
        expect(html).toContain('height:520px');
        expect(html).toContain('z-index:1103');
    });

    it('uma janela guardada fora da área aparece puxada para dentro, sem alterar o guardado', () => {
        const html = render(<FloatingWindow entry={entry({ x: 5000, y: 5000 })} {...windowProps}><p>x</p></FloatingWindow>);
        expect(html).toContain('left:720px');
        expect(html).toContain('top:272px');
    });

    it('recolhida, mostra só a barra de título, mas mantém o conteúdo montado', () => {
        const html = render(<FloatingWindow entry={entry({ collapsed: true })} {...windowProps}><p>conteúdo</p></FloatingWindow>);
        expect(html).toContain('data-collapsed="true"');
        expect(html).toContain('height:40px');
        expect(html).toContain('aria-label="Expandir Resumo: Kael"');
        expect(html).toContain('aria-expanded="false"');
        expect(html).toContain('hidden');
        expect(html).toContain('conteúdo');
        expect(html).not.toContain('nwse-resize');
    });

    it('no celular ocupa a tela toda, sem alça de tamanho nem botão de recolher', () => {
        const html = render(<FloatingWindow entry={entry()} {...windowProps} mobile><p>x</p></FloatingWindow>);
        expect(html).toContain('inset:0');
        expect(html).toContain('z-index:1250');
        expect(html).not.toContain('nwse-resize');
        expect(html).not.toContain('Recolher Resumo');
        expect(html).toContain('aria-label="Fechar Resumo: Kael"');
    });

    it('no celular, só a janela da frente aparece', () => {
        const html = render(<FloatingWindow entry={entry()} {...windowProps} mobile isFront={false}><p>x</p></FloatingWindow>);
        expect(html).toContain('display:none');
        expect(html).toContain('data-front="false"');
    });
});

const vitals: PortraitVital[] = [
    { key: 'lp', name: 'Vida', value: 30, max: 40, barColor: color.lp },
    { key: 'mp', name: 'Mana', value: 5, max: 20, barColor: color.mp }
];

describe('PartyPortrait', () => {
    const base = { name: 'Aria Valen', level: 7, online: true, inTurn: false, open: false, vitals, onClick: noop };

    it('é um botão com nome acessível completo: quem é, presença, vitais e a ação', () => {
        const html = render(<PartyPortrait {...base} />);
        expect(html).toContain('aria-label="Aria Valen, nível 7, online, Vida 30 de 40, Mana 5 de 20. Abrir resumo"');
        expect(html).toContain('aria-pressed="false"');
        expect(html).toContain('Nv. 7');
    });

    it('as barras refletem a proporção de cada recurso', () => {
        const html = render(<PartyPortrait {...base} />);
        expect(html).toContain('data-vital="lp"');
        expect(html).toContain('width:75%');
        expect(html).toContain('width:25%');
        expect(html).not.toContain('data-vital="ap"');
    });

    it('em turno troca o nível por texto e entra no nome acessível', () => {
        const html = render(<PartyPortrait {...base} inTurn />);
        expect(html).toContain('Em turno');
        expect(html).toContain('em turno');
        expect(html).not.toContain('Nv. 7');
    });

    it('offline entra no nome acessível, e janela aberta marca o botão como pressionado', () => {
        const html = render(<PartyPortrait {...base} online={false} open />);
        expect(html).toContain('offline');
        expect(html).toContain('aria-pressed="true"');
    });

    it('com menu de seções, tem um botão próprio (irmão do retrato, nunca aninhado) que avisa que abre um menu', () => {
        const html = render(<PartyPortrait {...base} onOpenMenu={noop} />);
        expect(html).toContain('aria-label="Abrir seções de Aria Valen"');
        expect(html).toContain('aria-haspopup="menu"');
        // dois botões, lado a lado: se um estivesse dentro do outro, o HTML seria inválido
        expect(html.match(/<button/g)).toHaveLength(2);
        expect(html).not.toMatch(/<button[^>]*>(?:(?!<\/button>).)*<button/);
    });

    it('sem o menu, só o botão do retrato', () => {
        expect(render(<PartyPortrait {...base} />).match(/<button/g)).toHaveLength(1);
    });

    it('sem nenhum recurso (sistema customizado sem LP, MP e AP), não desenha barras', () => {
        const html = render(<PartyPortrait {...base} vitals={[]} />);
        expect(html).not.toContain('data-vital');
        expect(html).toContain('aria-label="Aria Valen, nível 7, online. Abrir resumo"');
    });
});

describe('SummaryView', () => {
    // O fixture é uma ficha saudável mínima; o resumo só lê os campos que o teste preenche
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sheet = (overrides: Record<string, unknown> = {}): any => ({
        ...healthySheet(),
        name: 'Aria Valen',
        playerName: 'Vic',
        class: 'Piromante',
        lineage: 'Brasa',
        race: 'Humano',
        level: 7,
        stats: { lp: 30, maxLp: 40, mp: 5, maxMp: 20, ap: 2, maxAp: 4 },
        attributes: { vig: 10, des: 8, foc: 12, log: 5, sab: 6, car: 4 },
        mods: { attributes: { vig: 2, des: 1, foc: 2, log: 0, sab: -1, car: 0 } },
        points: { attributes: 0, expertises: 2, skills: 0, magics: 1, evolution: 3 },
        inventory: { money: 12500, items: [], weapons: [], armors: [] },
        ammoCounter: { current: 0, max: 0 },
        capacity: { cargo: 12, max: 40 },
        displacement: 9,
        ...overrides
    });

    it('mostra quem é, os pontos vitais e os atributos com modificador', () => {
        const html = render(<SummaryView charsheet={sheet()} inTurn={false} showEvolution onOpenSection={noop} onAdjustVital={noop} actions={playerActions} />);
        expect(html).toContain('Aria Valen');
        expect(html).toContain('Nv. 7');
        expect(html).toContain('Piromante');
        expect(html).toContain('aria-label="Vida de Aria Valen"');
        expect(html).toContain('30/40');
        expect(html).toContain('5/20');
        expect(html).toContain('VIG');
        expect(html).toContain('mod +2');
        expect(html).toContain('mod -1');
    });

    it('mostra a bolsa: dinheiro com milhar, carga com unidade, deslocamento e esconde a munição vazia', () => {
        const html = render(<SummaryView charsheet={sheet()} inTurn={false} showEvolution onOpenSection={noop} onAdjustVital={noop} actions={playerActions} />);
        expect(html).toContain('12 500');
        expect(html).toContain('12/40 kg');
        expect(html).toContain('9m');
        expect(html).not.toContain('Munição');

        const withAmmo = render(
            <SummaryView
                charsheet={sheet({ ammoCounter: { current: 3, max: 10 } })}
                inTurn={false}
                showEvolution
                onOpenSection={noop}
                onAdjustVital={noop}
                actions={playerActions}
            />
        );
        expect(withAmmo).toContain('Munição');
        expect(withAmmo).toContain('3/10');
    });

    it('lista só os pontos para gastar que sobraram, e a evolução quando a regra vale', () => {
        const html = render(<SummaryView charsheet={sheet()} inTurn={false} showEvolution onOpenSection={noop} onAdjustVital={noop} actions={playerActions} />);
        expect(html).toContain('Perícias: 2');
        expect(html).toContain('Magias: 1');
        expect(html).not.toContain('Atributos: 0');
        expect(html).toContain('Evolução: 3');

        const noRule = render(<SummaryView charsheet={sheet()} inTurn={false} showEvolution={false} onOpenSection={noop} onAdjustVital={noop} actions={playerActions} />);
        expect(noRule).not.toContain('Evolução');
    });

    it('sem pontos nem regra de evolução, a seção de pontos some', () => {
        const html = render(
            <SummaryView
                charsheet={sheet({ points: { attributes: 0, expertises: 0, skills: 0, magics: 0 } })}
                inTurn={false}
                showEvolution={false}
                onOpenSection={noop} onAdjustVital={noop} actions={playerActions}
            />
        );
        expect(html).not.toContain('Pontos para gastar');
    });

    it('em turno mostra o selo', () => {
        const html = render(<SummaryView charsheet={sheet()} inTurn showEvolution onOpenSection={noop} onAdjustVital={noop} actions={playerActions} />);
        expect(html).toContain('Em turno');
    });

    it('tem um atalho para cada seção da ficha (menos o próprio resumo)', () => {
        const html = render(<SummaryView charsheet={sheet()} inTurn={false} showEvolution onOpenSection={noop} onAdjustVital={noop} actions={playerActions} />);
        [ 'Informações', 'Atributos', 'Perícias', 'Inventário', 'Habilidades', 'Magias' ].forEach(label => expect(html).toContain(`>${label}<`));
        expect(html).not.toContain('>Resumo<');
    });

    it('tem as ações do jogador; o ponto de evolução some quando a regra não vale', () => {
        const html = render(<SummaryView charsheet={sheet()} inTurn={false} showEvolution onOpenSection={noop} onAdjustVital={noop} actions={playerActions} />);
        [ 'Adicionar item', 'Conceder ponto de evolução', 'Enviar notificação', 'Remover da campanha' ].forEach(label => expect(html).toContain(label));

        const noRule = render(
            <SummaryView
                charsheet={sheet()}
                inTurn={false}
                showEvolution={false}
                onOpenSection={noop} onAdjustVital={noop}
                actions={{ ...playerActions, canGrantEvolution: false }}
            />
        );
        expect(noRule).not.toContain('Conceder ponto de evolução');
        expect(noRule).toContain('Adicionar item');
    });

    it('ficha antiga com campos faltando não quebra', () => {
        const html = render(
            <SummaryView
                charsheet={sheet({ stats: undefined, mods: undefined, points: undefined, ammoCounter: undefined, capacity: undefined, inventory: undefined })}
                inTurn={false}
                showEvolution={false}
                onOpenSection={noop} onAdjustVital={noop} actions={playerActions}
            />
        );
        expect(html).toContain('Aria Valen');
        expect(html).not.toContain('NaN');
        expect(html).not.toContain('undefined');
    });
});

describe('EditableSection', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sheet: any = { ...healthySheet(), id: 'a', name: 'Aria Valen' };
    const body = () => <p>conteúdo da seção</p>;

    afterEach(() => {
        mockEditing.isEditing = false;
        mockEditing.isSaving = false;
    });

    it('fora da edição mostra só o botão Editar e o conteúdo', () => {
        const html = render(<EditableSection charsheet={sheet}>{body}</EditableSection>);
        expect(html).toContain('Editar');
        expect(html).toContain('conteúdo da seção');
        expect(html).not.toContain('Salvar');
        expect(html).not.toContain('Cancelar');
    });

    it('em edição mostra Cancelar e Salvar e avisa do modo de edição', () => {
        mockEditing.isEditing = true;
        const html = render(<EditableSection charsheet={sheet}>{body}</EditableSection>);
        expect(html).toContain('Salvar');
        expect(html).toContain('Cancelar');
        expect(html).toContain('Modo de edição');
        expect(html).not.toContain('>Editar<');
    });

    it('salvando, os dois botões ficam desabilitados', () => {
        mockEditing.isEditing = true;
        mockEditing.isSaving = true;
        const html = render(<EditableSection charsheet={sheet}>{body}</EditableSection>);
        expect(html.match(/disabled=""/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
    });

    it('entrega ao conteúdo o estado de edição e a unidade de peso', () => {
        mockEditing.isEditing = true;
        const html = render(
            <EditableSection charsheet={sheet}>
                {({ isEditing, weightUnit }) => <p>{`editando=${isEditing} unidade=${weightUnit}`}</p>}
            </EditableSection>
        );
        expect(html).toContain('editando=true unidade=kg');
    });
});

describe('VitalsPanel', () => {
    const rows: VitalRow[] = [
        { key: 'lp', label: 'LP', name: 'Vida', value: 30, max: 40, barColor: color.lp },
        { key: 'mp', label: 'MP', name: 'Mana', value: 5, max: 20, barColor: color.mp }
    ];

    it('mostra uma barra com − e + para cada ponto vital, e o campo de valor começa em 1', () => {
        const html = render(<VitalsPanel charsheetName="Aria Valen" rows={rows} onAdjust={noop} />);
        expect(html).toContain('aria-label="Vida de Aria Valen"');
        expect(html).toContain('aria-label="Reduzir Vida de Aria Valen em 1"');
        expect(html).toContain('aria-label="Aumentar Vida de Aria Valen em 1"');
        expect(html).toContain('aria-label="Reduzir Mana de Aria Valen em 1"');
        expect(html).toContain('aria-label="Aumentar Mana de Aria Valen em 1"');
        expect(html).toContain('aria-label="Valor a aplicar em Aria Valen"');
        expect(html).toContain('value="1"');
        expect(html).toContain('30/40');
    });

    it('com valor válido, os botões estão habilitados e sem aviso', () => {
        const html = render(<VitalsPanel charsheetName="Aria Valen" rows={rows} onAdjust={noop} />);
        expect(html).not.toContain('Use um inteiro de 1 a 9999');
        expect(html.match(/<button[^>]*disabled/g)).toBeNull();
    });

    it('sem pontos vitais para mostrar, só o cabeçalho e o campo (o resumo nem monta o painel)', () => {
        const html = render(<VitalsPanel charsheetName="Aria Valen" rows={[]} onAdjust={noop} />);
        expect(html).not.toContain('role="meter"');
        expect(html).not.toContain('Reduzir');
    });
});
