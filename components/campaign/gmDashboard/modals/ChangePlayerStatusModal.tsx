import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Tab, Tabs, TextField } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { charsheetService } from '@services';
import { useSnackbar } from 'notistack';
import { type CharsheetDTO } from '@models/dtos';

// Os TextFields numéricos devolvem string: z.coerce converte para número
// (antes z.number()/z.string() faziam a validação falhar e o formulário não salvava)
const playerStatusSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    race: z.string().min(1, 'Raça é obrigatória'),
    traits: z.string().refine(val => !val.includes(',  '), { message: 'Os traços devem ser separados por apenas uma vírgula e um espaço' }),
    attributes: z.object({
        vig: z.coerce.number().int().min(0),
        des: z.coerce.number().int().min(0),
        foc: z.coerce.number().int().min(0),
        log: z.coerce.number().int().min(0),
        sab: z.coerce.number().int().min(0),
        car: z.coerce.number().int().min(0)
    }),
    stats: z.object({
        lp: z.coerce.number().int().min(0),
        mp: z.coerce.number().int().min(0),
        ap: z.coerce.number().int().min(0),
        maxLp: z.coerce.number().int().min(0),
        maxMp: z.coerce.number().int().min(0),
        maxAp: z.coerce.number().int().min(0)
    }),
    money: z.coerce.number({ invalid_type_error: 'O valor deve ser um número válido e maior ou igual a 0' })
        .min(0, 'O valor deve ser um número válido e maior ou igual a 0')
});

type PlayerStatusFormData = z.infer<typeof playerStatusSchema>;

function buildDefaultValues(charsheet: Required<CharsheetDTO>): PlayerStatusFormData {
    return {
        name: charsheet.name,
        race: charsheet.race as unknown as string,
        traits: (charsheet.traits ?? [])
            .map((trait: any) => (typeof trait === 'string' ? trait : trait?.name))
            .filter(Boolean)
            .join(', '),
        attributes: {
            vig: Number(charsheet.attributes?.vig ?? 0),
            des: Number(charsheet.attributes?.des ?? 0),
            foc: Number(charsheet.attributes?.foc ?? 0),
            log: Number(charsheet.attributes?.log ?? 0),
            sab: Number(charsheet.attributes?.sab ?? 0),
            car: Number(charsheet.attributes?.car ?? 0)
        },
        stats: {
            lp: Number(charsheet.stats?.lp ?? 0),
            mp: Number(charsheet.stats?.mp ?? 0),
            ap: Number(charsheet.stats?.ap ?? 0),
            maxLp: Number(charsheet.stats?.maxLp ?? 0),
            maxMp: Number(charsheet.stats?.maxMp ?? 0),
            maxAp: Number(charsheet.stats?.maxAp ?? 0)
        },
        money: Number(charsheet.inventory?.money ?? 0)
    };
}

function ChangePlayerStatusModal({ open, onClose, charsheet }: { open: boolean, onClose: () => void, charsheet: Required<CharsheetDTO> }) {
    const [ tabValue, setTabValue ] = useState(0);
    const { enqueueSnackbar } = useSnackbar();

    // Valores exibidos ao abrir o modal: base para gravar só o que o mestre alterou
    const baselineRef = useRef<PlayerStatusFormData>(buildDefaultValues(charsheet));

    const { control, handleSubmit, reset, formState: { errors } } = useForm<PlayerStatusFormData>({
        resolver: zodResolver(playerStatusSchema),
        defaultValues: baselineRef.current
    });

    // O componente fica montado com o modal fechado: recarrega os dados atuais
    // da ficha a cada abertura (antes exibia — e regravava — valores antigos)
    useEffect(() => {
        if (!open) return;
        const values = buildDefaultValues(charsheet);
        baselineRef.current = values;
        reset(values);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ open ]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const onSubmit = async (data: PlayerStatusFormData) => {
        const baseline = baselineRef.current;
        // Grava só os campos alterados (por caminho), sem regravar a ficha inteira:
        // evita sobrescrever o que o jogador mudou com o modal aberto
        const changes: Record<string, unknown> = {};

        if (data.name !== baseline.name) changes['name'] = data.name;
        if (data.race !== baseline.race) changes['race'] = data.race;
        if (data.traits !== baseline.traits) {
            changes['traits'] = data.traits.split(',').map(trait => trait.trim()).filter(Boolean);
        }
        (Object.keys(data.attributes) as Array<keyof PlayerStatusFormData['attributes']>).forEach(key => {
            if (data.attributes[key] !== baseline.attributes[key]) changes[`attributes.${key}`] = data.attributes[key];
        });
        (Object.keys(data.stats) as Array<keyof PlayerStatusFormData['stats']>).forEach(key => {
            if (data.stats[key] !== baseline.stats[key]) changes[`stats.${key}`] = data.stats[key];
        });
        if (data.money !== baseline.money) changes['inventory.money'] = data.money;

        if (Object.keys(changes).length === 0) {
            onClose();
            return;
        }

        try {
            await charsheetService.updateFields(charsheet.id, changes as any);
    
            enqueueSnackbar('Status do jogador atualizado com sucesso!', { variant: 'success' });
        } catch (error) {
            console.error(error);
            enqueueSnackbar('Erro ao atualizar charsheet', { variant: 'error' });
            return;
        }

        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Alterar Status do Jogador</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <Tabs value={tabValue} onChange={handleTabChange} aria-label="abas de status do jogador">
                            <Tab label="Características" />
                            <Tab label="Atributos" />
                        </Tabs>
                    </Box>

                    {tabValue === 0 && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Nome"
                                            margin="normal"
                                            error={!!errors.name}
                                            helperText={errors.name?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="race"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Raça"
                                            margin="normal"
                                            error={!!errors.race}
                                            helperText={errors.race?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller
                                    name="traits"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Traços"
                                            margin="normal"
                                            placeholder="Separe os traços por vírgula (traço1, traço2, traço3)"
                                            error={!!errors.traits}
                                            helperText={errors.traits?.message}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    )}

                    {tabValue === 1 && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <Controller
                                    name="attributes.vig"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Vigor (VIG)"
                                            type="number"
                                            margin="normal"
                                            error={!!errors.attributes?.vig}
                                            helperText={errors.attributes?.vig?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Controller
                                    name="attributes.des"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Destreza (DES)"
                                            type="number"
                                            margin="normal"
                                            error={!!errors.attributes?.des}
                                            helperText={errors.attributes?.des?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Controller
                                    name="attributes.foc"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Foco (FOC)"
                                            type="number"
                                            margin="normal"
                                            error={!!errors.attributes?.foc}
                                            helperText={errors.attributes?.foc?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Controller
                                    name="attributes.log"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Lógica (LOG)"
                                            type="number"
                                            margin="normal"
                                            error={!!errors.attributes?.log}
                                            helperText={errors.attributes?.log?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Controller
                                    name="attributes.sab"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Sabedoria (SAB)"
                                            type="number"
                                            margin="normal"
                                            error={!!errors.attributes?.sab}
                                            helperText={errors.attributes?.sab?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Controller
                                    name="attributes.car"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Carisma (CAR)"
                                            type="number"
                                            margin="normal"
                                            error={!!errors.attributes?.car}
                                            helperText={errors.attributes?.car?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Controller
                                    name="stats.lp"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Pontos de Vida (LP)"
                                            type="number"
                                            margin="normal"
                                            error={!!errors.stats?.lp}
                                            helperText={errors.stats?.lp?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Controller
                                    name="maxLp"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Pontos de Vida Máximos (MaxLp)"
                                            type="number"
                                            margin="normal"
                                            error={!!errors?.stats?.maxLp}
                                            helperText={errors?.stats?.maxLp?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="stats.mp"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Pontos de Mana (MP)"
                                            type="number"
                                            margin="normal"
                                            error={!!errors.stats?.mp}
                                            helperText={errors.stats?.mp?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="stats.ap"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Pontos de Armadura (AP)"
                                            type="number"
                                            margin="normal"
                                            error={!!errors.stats?.ap}
                                            helperText={errors.stats?.ap?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="money"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Dinheiro"
                                            type="number"
                                            margin="normal"
                                            error={!!errors.money}
                                            helperText={errors.money?.message}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="contained" color="primary">Salvar Alterações</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

export default ChangePlayerStatusModal;
