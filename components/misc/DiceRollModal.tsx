/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-eval */
'use client';

import { Box, Chip, Modal, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useMemo, type ReactElement, useEffect, memo } from 'react'
import type { Attributes, Roll } from '@types';
import { Animation } from 'react-animate-style';
import { rollDice } from '@utils/diceRoller';

const DiceRollModal = memo(({
    open,
    onClose,
    roll,
    sum,
    isDisadvantage,
    bonus,
    setResult,
    visibleDices,
    visibleBaseAttribute
}: Partial<Roll> & {
    open: boolean
    onClose: () => void
    isDisadvantage?: boolean
    setResult?: (result: number | number[]) => void
    roll: { 
        dice: number,
        quantity: number
        name: string,
        attribute: Attributes
    }
}): ReactElement => {
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    const diceRoll = useMemo(() => {
        const notation = `${roll.quantity === 0 ? 1 : roll.quantity}d${roll.dice}`;
        const diceResult = rollDice(notation);
        
        if (!diceResult) return null;

        const rolls = diceResult.rolls;
        const sortedRolls = isDisadvantage ?
            rolls.slice().sort((a, b) => a - b) : rolls.slice().sort((a, b) => b - a);

        const rollsFormatted = `[ ${rolls.join(', ')} ]`;
        let rawResult = sortedRolls[0];
        let rawBonus = 0;

        if (sum) {
            rawResult = rolls.reduce((acc, curr) => acc + curr, 0);
        }

        if (bonus) {
            rawBonus = bonus.reduce((acc, curr) => acc + curr, 0);
            rawResult += rawBonus;
        }

        // Constrói a expressão para exibição
        let expression = '';
        if (bonus && !sum) {
            expression = `${sortedRolls[0]} + ${bonus.join(' + ')}`;
        } else if (bonus && sum) {
            expression = `${sortedRolls.join(' + ')} + ${bonus.join(' + ')}`;
        } else if (!bonus && sum) {
            expression = sortedRolls.join(' + ');
        } else {
            expression = String(sortedRolls[0]);
        }

        return {
            rolls: rollsFormatted,
            rawRolls: rolls,
            rawResult,
            result: `${expression} = ${rawResult}`
        };
    }, [ roll, sum, isDisadvantage, bonus ]);

    useEffect(() => {
        if (setResult && open && diceRoll) {
            setResult(diceRoll.rawResult);
        }
    }, [ setResult, diceRoll?.rawResult, open ]);

    function Result(): ReactElement[] {
        if (!diceRoll) return [];

        let resultRolls = diceRoll.rawRolls.sort((a, b) => b - a);

        const getLetter = (num: number): string => {
            const letter = String.fromCharCode(num + 64);
            return letter;
        };

        if (bonus && roll.quantity > 1 && !sum) {
            if (isDisadvantage) resultRolls = [ Number(resultRolls.slice().sort(((a, b) => a - b))[0]) ];
            else resultRolls = [ Number(resultRolls[0]) ];
        }

        const result = useMemo(() => {
            return resultRolls.map((item, index) => {
                if (resultRolls.length < 2 && !bonus) {
                    return (
                        <Typography key={item} fontSize='3rem' fontFamily={`D${roll.dice}`}>{getLetter(item)}</Typography>
                    );
                }

                if (bonus && resultRolls.length > 1 && index === 0) {
                    return (
                        <Typography key={item} fontSize='3rem' fontFamily={`D${roll.dice}`}>{getLetter(item)}</Typography>
                    );
                }

                if (index === resultRolls.length - 1) {
                    if (bonus) {
                        return (
                            <>
                                <Typography key={item} fontSize='3rem' fontFamily={`D${roll.dice}`}>{getLetter(item)}</Typography>
                                <Typography whiteSpace='pre-wrap' key={`bonus-${item}`}>{bonus.map(i => '+ ' + i + ' ')}</Typography>
                                <Typography whiteSpace='pre-wrap' key={`equals1-${item}`}> = </Typography>
                                <Typography whiteSpace='pre-wrap' key={`result-${item}`}>{diceRoll.rawResult}</Typography>
                            </>
                        );    
                    }
                    
                    return (
                        <>
                            <Typography key={item} fontSize='3rem' fontFamily={`D${roll.dice}`}>{getLetter(item)}</Typography>
                            <Typography whiteSpace='pre-wrap' key={`equals2-${item}`}> = </Typography>
                            <Typography whiteSpace='pre-wrap' key={`result2-${item}`}>{diceRoll.rawResult}</Typography>
                        </>
                    );
                }

                return (
                    <>
                        <Typography key={item} fontSize='3rem' fontFamily={`D${roll.dice}`}>{getLetter(item)}</Typography>
                        <Typography whiteSpace='pre-wrap' key={`plus-${item}`}> + </Typography>
                    </>
                );
            });
        }, [ resultRolls ]);

        return result;
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            disableAutoFocus
            disableEnforceFocus
            disableRestoreFocus
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                width: '100%'
            }}
            BackdropProps={{
                style: {
                    backgroundColor: 'transparent',
                    boxShadow: 'none'
                }
            }}
        >
            <Animation
                isVisible={open}
                animationIn='fadeIn'
                animationInDuration={300}
            >
                <Box
                    height='20vh'
                    minHeight='20vh'
                    width={matches ? '80vw' : '30vw'}
                    bgcolor='background.paper'
                    borderRadius={2}
                    boxShadow={theme.shadows[10]}
                    p={2.5}
                >
                    <Box height='100%' display='flex' justifyContent='space-between' flexDirection='column'>
                        <Box display='flex' flexDirection='column' gap={visibleDices ? 0 : 1}>
                            <Box display='flex' alignItems='center' gap={visibleDices ? 2 : 1}>
                                <Typography fontWeight={900}>{roll.name}:</Typography>
                                <Box display='flex' alignItems='center'>
                                    {visibleDices ? (
                                        <Result />
                                    ) : (
                                        <Typography position='relative'>{diceRoll?.result}</Typography>
                                    )}
                                </Box>
                            </Box>
                            {visibleBaseAttribute && (
                                <Box display='flex' gap={1} alignItems='center'>
                                    <Typography variant='caption'>Atributo base:</Typography>
                                    <Chip
                                        sx={{
                                            height: '1.5rem',
                                            fontSize: '.8rem'
                                        }}
                                        label={roll.attribute?.toUpperCase()}
                                    />
                                </Box>
                            )}
                        </Box>
                        <Box display='flex' justifyContent='space-between'>
                            <Typography variant='caption' color='text.secondary'>
                                {diceRoll?.rolls}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Animation>
        </Modal>
    );
})

DiceRollModal.displayName = 'DiceRollModal';

export default DiceRollModal;