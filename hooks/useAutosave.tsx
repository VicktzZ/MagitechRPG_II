/* eslint-disable react-hooks/exhaustive-deps */
import { useSnackbar } from 'notistack'
import { useEffect, useRef } from 'react'

export default function useAutosave(callback: () => void, delay = 1000, deps = []): void {
    const savedCallback = useRef<() => void>(() => {})
    const { enqueueSnackbar } = useSnackbar()

    useEffect(() => {
        savedCallback.current = callback
    }, [ callback ])
  
    useEffect(() => {
        function runCallback(): void {
            savedCallback.current()
            enqueueSnackbar('Ficha salva com sucesso!', { variant: 'success' })
        };

        if (typeof delay === 'number') {
            const interval = setInterval(runCallback, delay)
            return () => { clearInterval(interval) }
        }
    }, [ delay, ...deps ])
};