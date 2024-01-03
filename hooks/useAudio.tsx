/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useRef } from 'react'

const useAudio = (audio: string): HTMLAudioElement => {
    const audioRef = useRef<HTMLAudioElement | null>()

    useEffect(() => {
        const mountAudio = (): HTMLAudioElement => new Audio(audio)

        audioRef.current = mountAudio()
    }, [ audio ])

    return audioRef.current!
}

export default useAudio