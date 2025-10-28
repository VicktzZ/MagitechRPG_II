'use client'

import { Dialog, DialogContent, DialogTitle, Box, Typography, Paper, Grid, IconButton, Tooltip } from '@mui/material'
import { Close } from '@mui/icons-material'
import { skills } from '@constants/skills'
import { blue, green, indigo, orange, pink, purple, red, yellow } from '@mui/material/colors'
import type { Skill } from '@models'
import type { Charsheet } from '@models/entities'

interface SkillsTreeDialogProps {
    open: boolean
    onClose: () => void
    charsheet: Required<Charsheet>
}

interface SkillNodeProps {
    skill: Skill
    isUnlocked?: boolean
    skillClass: keyof typeof skills.class
    icon?: string
    size?: number
}

const skillColors: Record<keyof typeof skills.class, string> = {
    Combatente: red[500],
    Especialista: orange[500],
    Feiticeiro: pink[400],
    Bruxo: purple[400],
    Monge: yellow[600],
    Druida: green[500],
    Arcano: blue[500],
    Ladino: indigo[600]
}

function SkillNode({ skill, isUnlocked = false, skillClass, icon, size = 2.5 }: SkillNodeProps) {
    return (
        <Tooltip title={skill?.description}>
            <Paper
                elevation={3}
                sx={{
                    p: 2,
                    bgcolor: isUnlocked ? skillColors[skillClass ] : 'background.paper',
                    color: isUnlocked ? 'primary.contrastText' : 'text.primary',
                    cursor: 'pointer',
                    fontFamily: 'Runes',
                    fontSize: `${size}rem`,
                    transition: 'all 0.2s',
                    '&:hover': {
                        transform: 'scale(1.05)',
                        bgcolor: isUnlocked ? skillColors[skillClass ] : 'background.paper'
                    },
                    position: 'relative',
                    height: '7rem',
                    width: '7rem',
                    borderRadius: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center'
                }}
            >
                {icon}
            </Paper>
        </Tooltip>
    )
}

function ClassSkillTree({ charsheet }: { charsheet: Required<Charsheet> }) {
    const classSkills = skills.class[charsheet.class as keyof typeof skills.class] ?? []

    // Organiza as habilidades em níveis específicos (0, 1, 5, 10, 15, 20)
    const skillLevels = {
        0: classSkills[0],
        1: classSkills[1],
        5: classSkills[4],
        10: classSkills[8],
        15: classSkills[12],
        20: classSkills[16]
    }

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                minHeight: '70vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                pb: 4
            }}
        >
            {/* Nível 0 */}
            <Box>
                <SkillNode
                    skill={skillLevels[0]}
                    skillClass={charsheet.class as keyof typeof skills.class}
                    isUnlocked={charsheet.level >= 0}
                    icon='X'
                />
            </Box>

            {/* Nível 1 e 5 */}
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-around',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-4rem',
                        left: '25%',
                        width: '50%',
                        height: '4rem',
                        borderLeft: '2px solid',
                        borderRight: '2px solid',
                        borderColor: 'divider',
                        borderTop: '2px solid',
                        borderTopLeftRadius: '1rem',
                        borderTopRightRadius: '1rem'
                    }
                }}
            >
                <SkillNode
                    skill={skillLevels[1]}
                    skillClass={charsheet.class as keyof typeof skills.class}
                    isUnlocked={charsheet.level >= 1}
                    icon='a'
                />
                <SkillNode
                    skill={skillLevels[5]}
                    skillClass={charsheet.class as keyof typeof skills.class}
                    isUnlocked={charsheet.level >= 5}
                    icon='c'
                />
            </Box>

            {/* Nível 10 e 15 */}
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-around',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-4rem',
                        left: '25%',
                        width: '50%',
                        height: '4rem',
                        borderLeft: '2px solid',
                        borderRight: '2px solid',
                        borderColor: 'divider'
                    }
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '-4rem',
                            left: '50%',
                            width: '2px',
                            height: '4rem',
                            bgcolor: 'divider'
                        }
                    }}
                >
                    <SkillNode
                        skill={skillLevels[10]}
                        skillClass={charsheet.class as keyof typeof skills.class}
                        isUnlocked={charsheet.level >= 10}
                        size={3}
                        icon='7'
                    />
                </Box>
                <Box
                    sx={{
                        position: 'relative',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '-4rem',
                            left: '50%',
                            width: '2px',
                            height: '4rem',
                            bgcolor: 'divider'
                        }
                    }}
                >
                    <SkillNode
                        skill={skillLevels[15]}
                        skillClass={charsheet.class as keyof typeof skills.class}
                        isUnlocked={charsheet.level >= 15}
                        size={3}
                        icon='f'
                    />
                </Box>
            </Box>

            {/* Nível 20 */}
            <Box
                sx={{
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-4rem',
                        left: '50%',
                        width: '2px',
                        height: '4rem',
                        bgcolor: 'divider'
                    }
                }}
            >
                <SkillNode
                    skill={skillLevels[20]}
                    skillClass={charsheet.class as keyof typeof skills.class}
                    isUnlocked={charsheet.level >= 20}
                    size={3}
                    icon='B'
                />
            </Box>
        </Box>
    )
}

function SubclassSkillTree({ charsheet }: { charsheet: Required<Charsheet> }) {
    if (!charsheet.subclass) return null

    const subclassSkills = skills.subclass[charsheet.subclass as keyof typeof skills.subclass] ?? []

    // Organiza as habilidades em níveis específicos (10, 15, 20)
    const skillLevels = {
        10: subclassSkills[0],
        15: subclassSkills[1],
        20: subclassSkills[2]
    }

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                minHeight: '600px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                pl: '25%',
                pr: '25%'
            }}
        >
            {/* Nível 10 */}
            <Box>
                <SkillNode
                    skill={skillLevels[10]}
                    skillClass={charsheet.class as keyof typeof skills.class}
                    isUnlocked={charsheet.level >= 10}
                    icon='g'
                />
            </Box>

            {/* Nível 15 */}
            <Box
                sx={{
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-4rem',
                        left: '50%',
                        width: '2px',
                        height: '4rem',
                        bgcolor: 'divider'
                    }
                }}
            >
                <SkillNode
                    skill={skillLevels[15]}
                    skillClass={charsheet.class as keyof typeof skills.class}
                    isUnlocked={charsheet.level >= 15}
                    icon='h'
                />
            </Box>

            {/* Nível 20 */}
            <Box
                sx={{
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-4rem',
                        left: '50%',
                        width: '2px',
                        height: '4rem',
                        bgcolor: 'divider'
                    }
                }}
            >
                <SkillNode
                    skill={skillLevels[20]}
                    skillClass={charsheet.class as keyof typeof skills.class}
                    isUnlocked={charsheet.level >= 20}
                    icon='i'
                />
            </Box>
        </Box>
    )
}

export default function SkillsTreeDialog({ open, onClose, charsheet }: SkillsTreeDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xl"
            fullWidth
            PaperProps={{
                sx: {
                    minHeight: '80vh',
                    bgcolor: 'background.paper2'
                }
            }}
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Árvore de Habilidades</Typography>
                    <IconButton onClick={onClose}>
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ position: 'relative' }}>
                    {charsheet.subclass && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: '50%',
                                height: '100%',
                                width: '2px',
                                bgcolor: 'divider',
                                zIndex: 0
                            }}
                        />
                    )}
                    <Grid container spacing={4}>
                        {/* Lado esquerdo - Classe */}
                        <Grid item xs={12} md={charsheet.subclass ? 6 : 12}>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Typography fontFamily='Sakana' variant="h4">
                                    {charsheet.class as string}
                                </Typography>
                            </Box>
                            <ClassSkillTree charsheet={charsheet} />
                        </Grid>

                        {/* Lado direito - Subclasse (se existir) */}
                        {charsheet.subclass && (
                            <Grid item xs={12} md={6}>
                                <Box sx={{ textAlign: 'center', mb: 4 }}>
                                    <Typography fontFamily='Sakana' variant="h4">
                                        {charsheet.subclass as string}
                                    </Typography>
                                </Box>
                                <SubclassSkillTree charsheet={charsheet} />
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </DialogContent>
        </Dialog>
    )
}
