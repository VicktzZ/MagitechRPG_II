'use client';

import { CustomResources, DynamicAttributes, Characteristics, CustomDices, Expertises, Inventory, LevelAndInfo, Magics, Passives, Skills, SkillsModal } from '@components/charsheet';
import { font } from '@themes/tokens'
import { useAudio, useCharsheetSystem } from '@hooks';
import { CustomIconButton, WarningModal } from '@layout';
import type { CharsheetDTO } from '@models/dtos';
import {
    Add,
    ArticleRounded,
    AutoStories,
    CasinoSharp,
    Edit,
    Equalizer,
    EventNote,
    Inventory2,
    Notes,
    Person,
    Psychology,
    Save,
    SportsMartialArts
} from '@mui/icons-material';
import {
    Backdrop,
    Box,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { CHARSHEET_SECTION_IDS, listFormErrors } from '@utils/charsheetErrors';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect, useState, type FormEvent, type ReactElement } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormErrors, PendingPoints } from './page/FormProblems';
import Section from './page/Section';
import { useCharsheetSubmit } from './page/useCharsheetSubmit';
import { useUnsavedChangesWarning } from './page/useUnsavedChangesWarning';
import { useSession } from 'next-auth/react';

export default function CharsheetComponent(): ReactElement {
    const form = useFormContext<CharsheetDTO>()
    const charsheet = form.getValues()
    const isCreating = !charsheet.id
    const { system } = useCharsheetSystem(charsheet.systemId)
    const { data: session } = useSession()
    const audio = useAudio('/sounds/arcade-cyber-bling.wav')
    const submitter = useCharsheetSubmit(form, session?.user?.id)
    useUnsavedChangesWarning(form)
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const [ openSkillsModal, setOpenSkillsModal ] = useState<boolean>(false)
    const [ confirmReset, setConfirmReset ] = useState<boolean>(false)
    const [ , setCreateCharsheetAutosave ] = useLocalStorage<CharsheetDTO | null>('create-charsheet-autosave')

    const points = useWatch({ control: form.control, name: 'points' })
    const lineage = useWatch({ control: form.control, name: 'lineage' })
    const errorList = listFormErrors(form.formState.errors, charsheet)

    // Sistema customizado: tira os itens padrão do Magitech da ficha nova
    useEffect(() => {
        if (!charsheet.systemId || charsheet.id) return
        const hasDefaultItems = charsheet.inventory?.items?.some(item => item.name === 'Celular' || item.name === 'ORM')
        const hasDefaultWeapons = charsheet.inventory?.weapons?.some(weapon => weapon.name === 'Bastão Retrátil')
        const hasDefaultArmors = charsheet.inventory?.armors?.some(armor => armor.name === 'Uniforme da UFEM')

        if (hasDefaultItems || hasDefaultWeapons || hasDefaultArmors) {
            form.setValue('inventory.items', [])
            form.setValue('inventory.weapons', [])
            form.setValue('inventory.armors', [])
            form.setValue('spellSpace', 0)
            form.setValue('ORMLevel', 0)
            form.setValue('points.magics', 0)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ charsheet.systemId, charsheet.id, form ])

    const changeGameMode = (): void => {
        const currentMode = form.getValues('mode')
        const newMode = currentMode === 'Classic' ? 'Apocalypse' : 'Classic'

        form.setValue('mode', newMode, { shouldValidate: true })
        form.setValue('financialCondition', '' as any)
        form.setValue('inventory.money', 0)
        form.setValue('lineage', undefined as unknown as any)
        void audio?.play()?.catch(() => undefined)
    }

    const resetDraft = (): void => {
        setCreateCharsheetAutosave(null)
        window.location.reload()
    }

    // Em ficha criada, Enter num campo não pode salvar nem recarregar a página
    const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
        if (isCreating) void submitter.submit(event)
        else event.preventDefault()
    }

    const saveTooltip = submitter.isSaving ? 'Salvando...'
        : errorList.length > 0 ? 'Corrija os problemas indicados antes de salvar'
            : isCreating ? 'Criar a ficha' : 'Salvar alterações'

    const saveButton = (
        <Tooltip title={saveTooltip}>
            <span>
                <Button
                    variant="contained"
                    color="primary"
                    type="button"
                    onClick={(event) => { void submitter.submit(event) }}
                    disabled={submitter.isSaving}
                    startIcon={submitter.isSaving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                    size={isMobile ? 'small' : 'medium'}
                    sx={{ minWidth: isMobile ? 100 : 150 }}
                >
                    {submitter.isSaving ? 'Salvando...' : isCreating ? 'Criar' : 'Salvar'}
                </Button>
            </span>
        </Tooltip>
    )

    const skillsAction = (
        <Tooltip title="Gerenciar habilidades">
            <CustomIconButton
                onClick={() => setOpenSkillsModal(true)}
                size="small"
                aria-label="Gerenciar habilidades"
            >
                <Edit fontSize="small" />
            </CustomIconButton>
        </Tooltip>
    )

    return (
        <Box
            component="form"
            noValidate
            onSubmit={onFormSubmit}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                p: isMobile ? '15px 0' : 3,
                maxWidth: '1900px',
                mx: 'auto',
                width: '100%'
            }}
        >
            {/* Header com informações e ações */}
            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: 'background.paper'
                }}
            >
                <Stack
                    direction={isMobile ? 'column' : 'row'}
                    justifyContent="space-between"
                    alignItems={isMobile ? 'stretch' : 'center'}
                    spacing={2}
                >
                    <Box display='flex' gap={2}>
                        <Box>
                            <Typography
                                variant={isMobile ? 'h5' : 'h4'}
                                component="h1"
                                fontFamily={font.display}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                            >
                                {isCreating ? (
                                    <>
                                        <Add /> Criar Nova Ficha
                                    </>
                                ) : (
                                    <>
                                        <Person /> {charsheet.name || 'Ficha sem nome'}
                                    </>
                                )}
                            </Typography>
                            {!isCreating && (
                                <Typography variant="body2" color="text.secondary" mt={1}>
                                    Jogador: {charsheet.playerName}
                                </Typography>
                            )}
                        </Box>
                        {isCreating && (
                            <Box>
                                <Button
                                    variant='outlined'
                                    color='secondary'
                                    type='button'
                                    onClick={() => setConfirmReset(true)}
                                >
                                    Resetar Ficha
                                </Button>
                            </Box>
                        )}
                    </Box>

                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        {/* Mostra o sistema (nome do sistema customizado, ou modo Magitech) */}
                        <Chip
                            label={`Sistema: ${system?.name || charsheet.mode || 'Magitech RPG'}`}
                            color="secondary"
                            sx={{ fontWeight: 600 }}
                        />
                        {/* Trocar modo: só no sistema padrão, em ficha nova e antes de escolher a linhagem
                            (os bônus da linhagem escolhida ficariam na ficha e os da nova somariam por cima) */}
                        {!charsheet.systemId && isCreating && (
                            <Tooltip title={lineage ? 'Para trocar o modo, use "Resetar Ficha": os bônus da linhagem já aplicados não saem sozinhos' : ''}>
                                <span>
                                    <Button
                                        variant='outlined'
                                        color='secondary'
                                        type='button'
                                        onClick={changeGameMode}
                                        disabled={!!lineage}
                                        size="small"
                                    >
                                        Trocar Modo
                                    </Button>
                                </span>
                            </Tooltip>
                        )}
                        {saveButton}
                    </Stack>
                </Stack>
            </Paper>

            <PendingPoints points={points} creating={isCreating} />
            <FormErrors errors={errorList} />

            {/* Características */}
            <Section
                id={CHARSHEET_SECTION_IDS.characteristics}
                title="Características"
                icon={<ArticleRounded />}
            >
                <Characteristics />
            </Section>

            {/* Recursos customizados (ex: Bateria, O2, Estresse no Cosmos RPG) */}
            <CustomResources />

            {/* Atributos e habilidades: duas colunas em tela larga, uma só nas demais */}
            <Stack
                direction={{ xs: 'column', xl: 'row' }}
                spacing={3}
                sx={{ width: '100%' }}
            >
                <Stack spacing={3} sx={{ flex: 1, minWidth: 0 }}>
                    <Section
                        id={CHARSHEET_SECTION_IDS.attributes}
                        title="Atributos"
                        icon={<Equalizer />}
                    >
                        <Box>
                            <DynamicAttributes system={system} />
                            {system && <LevelAndInfo />}
                        </Box>
                    </Section>
                </Stack>

                <Stack spacing={3} sx={{ flex: 1, minWidth: 0 }}>
                    <Section
                        id={CHARSHEET_SECTION_IDS.skills}
                        title="Habilidades"
                        icon={<SportsMartialArts />}
                        action={skillsAction}
                    >
                        <Skills />
                    </Section>

                    <Section
                        id={CHARSHEET_SECTION_IDS.dices}
                        title='Dados Personalizados'
                        icon={<CasinoSharp />}
                    >
                        <Box>
                            <CustomDices />
                        </Box>
                    </Section>

                    <Section
                        id={CHARSHEET_SECTION_IDS.passives}
                        title='Passivas'
                        icon={<EventNote />}
                    >
                        <Box>
                            <Passives />
                        </Box>
                    </Section>
                </Stack>
            </Stack>

            {/* Perícias */}
            <Section
                id={CHARSHEET_SECTION_IDS.expertises}
                title="Perícias"
                icon={<Psychology />}
            >
                <Expertises />
            </Section>

            {/* Inventário */}
            <Section
                id={CHARSHEET_SECTION_IDS.inventory}
                title="Inventário"
                icon={<Inventory2 />}
            >
                <Inventory />
            </Section>

            {/* Magias — oculto para sistemas com spells desabilitado */}
            {(!system || system.enabledFields?.spells !== false) && (
                <Section
                    id={CHARSHEET_SECTION_IDS.spells}
                    title="Magias"
                    icon={<AutoStories />}
                >
                    <Magics />
                </Section>
            )}

            {/* Anotações */}
            <Section
                id={CHARSHEET_SECTION_IDS.notes}
                title="Anotações"
                icon={<Notes />}
                sx={{ height: '100%' }}
            >
                <Box>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mb: 1, display: 'block' }}
                    >
                        Use este espaço para anotar informações importantes sobre seu personagem
                    </Typography>
                    <Box
                        component='textarea'
                        {...form.register('anotacoes')}
                        aria-label="Anotações do personagem"
                        placeholder='Digite suas anotações aqui...'
                        sx={{
                            width: '100%',
                            minHeight: isMobile ? '15rem' : '20rem',
                            maxHeight: '20rem',
                            p: 2,
                            fontSize: '1rem',
                            lineHeight: 1.5,
                            color: 'text.primary',
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            transition: 'border-color 0.2s ease',
                            '&:focus': {
                                outline: 'none',
                                borderColor: 'primary.main'
                            },
                            '&:hover': {
                                borderColor: 'text.secondary'
                            }
                        }}
                    />
                </Box>
            </Section>

            {/* Barra de salvar: a página é longa, o botão do topo some de vista */}
            <Paper
                variant="outlined"
                sx={{
                    position: 'sticky',
                    bottom: 16,
                    zIndex: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    bgcolor: 'background.raised'
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    {errorList.length > 0
                        ? `${errorList.length} ${errorList.length === 1 ? 'problema' : 'problemas'} para corrigir`
                        : isCreating ? 'Revise a ficha e crie quando estiver pronto' : 'Suas alterações só vão ao banco quando você salva'}
                </Typography>
                {saveButton}
            </Paper>

            {/* Modais */}
            <WarningModal
                open={submitter.confirmingCreate}
                onClose={submitter.cancelCreate}
                onConfirm={submitter.confirmCreate}
                text='Após criar a ficha, alguns campos (nome, classe, raça, linhagem e idade) não poderão ser alterados. Deseja continuar?'
                title='Confirmar Criação'
            />

            <WarningModal
                open={confirmReset}
                onClose={() => setConfirmReset(false)}
                onConfirm={resetDraft}
                text='Isso apaga tudo o que você preencheu nesta ficha e começa de novo. Deseja continuar?'
                title='Resetar Ficha'
            />

            <Backdrop
                open={submitter.isRedirecting}
                sx={{
                    zIndex: (muiTheme) => muiTheme.zIndex.drawer + 1
                }}
            >
                <Stack spacing={2} alignItems="center">
                    <CircularProgress size={60} />
                    <Typography variant="h6" color="primary">
                        Criando ficha...
                    </Typography>
                </Stack>
            </Backdrop>

            {openSkillsModal && (
                <SkillsModal
                    open={openSkillsModal}
                    onClose={() => setOpenSkillsModal(false)}
                />
            )}
        </Box>
    )
}
