import { Warning } from '@mui/icons-material';
import { Alert, Link, Stack, Typography } from '@mui/material';
import { CHARSHEET_SECTION_IDS, describePendingPoints, type FormErrorItem } from '@utils/charsheetErrors';
import type { ReactElement } from 'react';
import { scrollToSection } from './scrollToSection';

/** Erros do formulário, um por linha, com o caminho legível e um atalho para a seção. */
export function FormErrors({ errors }: { errors: FormErrorItem[] }): ReactElement | null {
    if (errors.length === 0) return null;

    return (
        <Alert severity="error" icon={<Warning />} role="alert">
            <Stack spacing={0.5}>
                <Typography variant="body2">
                    {errors.length === 1 ? 'Há 1 problema na ficha:' : `Há ${errors.length} problemas na ficha:`}
                </Typography>
                {errors.map(error => (
                    <Typography key={`${error.path}|${error.message}`} variant="body2" component="div">
                        {'• '}
                        {error.sectionId ? (
                            <Link component="button" type="button" underline="hover" color="inherit" onClick={() => scrollToSection(error.sectionId)} sx={{ textAlign: 'left', verticalAlign: 'baseline' }}>
                                {error.label}
                            </Link>
                        ) : error.label}
                        {`: ${error.message}`}
                    </Typography>
                ))}
            </Stack>
        </Alert>
    )
}

/** Pontos que sobraram. Na criação impedem criar; em ficha já criada é só um lembrete. */
export function PendingPoints({ points, creating }: { points: { attributes?: number; expertises?: number } | undefined; creating: boolean }): ReactElement | null {
    const pending = describePendingPoints(points);
    if (pending.length === 0) return null;

    const target = Number(points?.attributes ?? 0) > 0 ? CHARSHEET_SECTION_IDS.attributes : CHARSHEET_SECTION_IDS.expertises;

    return (
        <Alert severity={creating ? 'warning' : 'info'}>
            <Typography variant="body2">
                {creating ? 'Para criar a ficha, gaste todos os pontos. Faltam: ' : 'Você ainda tem para gastar: '}
                <Link component="button" type="button" underline="hover" color="inherit" onClick={() => scrollToSection(target)} sx={{ verticalAlign: 'baseline' }}>
                    {pending.join(' e ')}
                </Link>
                .
            </Typography>
        </Alert>
    )
}
