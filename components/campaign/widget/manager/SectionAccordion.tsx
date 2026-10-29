import type { ReactElement, ReactNode } from 'react';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface SectionAccordionProps {
    /** Conteúdo do cabeçalho do acordeão (título da seção) */
    summary: ReactNode;
    defaultExpanded?: boolean;
    children: ReactNode;
}

/** Acordeão padrão das seções do diálogo de administração de widgets */
export default function SectionAccordion({ summary, defaultExpanded, children }: SectionAccordionProps): ReactElement {
    return (
        <Accordion defaultExpanded={defaultExpanded} disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                {summary}
            </AccordionSummary>
            <AccordionDetails>
                {children}
            </AccordionDetails>
        </Accordion>
    );
}
