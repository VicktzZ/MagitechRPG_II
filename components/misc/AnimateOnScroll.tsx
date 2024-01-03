/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { Box } from '@mui/material'
import React, { type MutableRefObject, useEffect, useRef, useState, type ReactElement } from 'react'
import { Animation } from 'react-animate-style'
import { type CssAnimation } from 'react-animate-style/dist/Animations/Animation'

export default function AnimateOnScroll({
    children,
    animation,
    delay,
    duration,
    style,
    animateOnce 
} : {
    children: React.ReactNode,
    animation: CssAnimation,
    delay?: number,
    duration?: number,
    style?: React.CSSProperties,
    animateOnce?: boolean
}) : ReactElement {
    const animationDelay = delay ?? 0
    const ref: MutableRefObject<React.ReactNode | any> = useRef()
    const observerRef = useRef<IntersectionObserver | null>()

    const [ isVisible, setIsVisible ] = useState(false)

    const mountItersectionObserver = (): IntersectionObserver => new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setIsVisible(true)
                
                setTimeout(() => {
                    ref.current.style.visibility = 'initial'
                }, animationDelay)
            } else {
                if (!animateOnce) {
                    setIsVisible(false)
                    
                    setTimeout(() => {
                        ref.current.style.visibility = 'hidden'
                    }, animationDelay)
                }
            }
        })
    })

    useEffect(() => {
        observerRef.current = mountItersectionObserver()
        observerRef?.current?.observe(ref.current as Element)
    }, [])

    return (
        <Box visibility='hidden' ref={ref}>
            <Animation 
                className={isVisible ? `animate__animated animate__${animation}` : ''} style={{ display: 'flex', ...style }}
                isVisible 
                animationIn=''
                animationInDuration={duration} 
                animationInDelay={animationDelay}
            >
                {children}
            </Animation>
        </Box>
    )
}