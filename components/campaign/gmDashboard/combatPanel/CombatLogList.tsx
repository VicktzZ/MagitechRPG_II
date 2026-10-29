import { Box, Typography } from '@mui/material';
import type { CombatLog } from '@models';
import type { ReactElement, ReactNode } from 'react';

/** O texto do log com **negrito** e quebras de linha (o formato que o servidor escreve) */
function renderLogText(text: string): ReactNode[] {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
        if (!part.includes('\n')) return part;
        return part.split('\n').map((line, lineIndex) => (
            <span key={`${index}-${lineIndex}`}>
                {lineIndex > 0 && <br />}
                {line}
            </span>
        ));
    });
}

/** Os últimos registros do combate, o mais novo primeiro */
export default function CombatLogList({ logs, limit = 12 }: { logs: readonly CombatLog[] | undefined; limit?: number }): ReactElement {
    const recent = (logs ?? []).slice(-limit).reverse();

    if (recent.length === 0) return <Typography variant="body2" color="text.secondary">Nada registrado ainda.</Typography>;

    return (
        <Box
            component="ol"
            aria-label="Registro do combate"
            sx={{ m: 0, p: 0, listStyle: 'none', maxHeight: 220, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.raised' }}
        >
            {recent.map((log, index) => (
                <Typography
                    key={index}
                    component="li"
                    sx={{ fontSize: 13, lineHeight: 1.5, px: 1.5, py: 1, borderBottom: index < recent.length - 1 ? '1px solid' : 'none', borderColor: 'divider', '& strong': { fontWeight: 700 } }}
                >
                    {renderLogText(log.message ?? '')}
                </Typography>
            ))}
        </Box>
    );
}
