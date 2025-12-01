"use client"

import React, { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react'

interface ModalContextType {
    openModal: <T = any>(modalKey: string, props?: T) => void
    closeModal: () => void
    modalKey: string | null
    modalProps: any
    isOpen: boolean
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modalKey, setModalKey] = useState<string | null>(null)
    const [modalProps, setModalProps] = useState<any>({})
    const [isOpen, setIsOpen] = useState(false)
    const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const openModal = useCallback(<T = any>(key: string, props?: T) => {
        // Clear any pending timeout when opening a new modal
        if (clearTimeoutRef.current) {
            clearTimeout(clearTimeoutRef.current)
            clearTimeoutRef.current = null
        }
        setModalKey(key)
        setModalProps(props || {})
        setIsOpen(true)
    }, [])

    const closeModal = useCallback(() => {
        setIsOpen(false)
        // Schedule clearing of key/props to allow animation (300ms matches typical Tailwind transition)
        // Only clear after animation completes to prevent layout shift
        clearTimeoutRef.current = setTimeout(() => {
            setModalKey(null)
            setModalProps({})
            clearTimeoutRef.current = null
        }, 300)
    }, [])

    // Cleanup: clear timeout on unmount
    useEffect(() => {
        return () => {
            if (clearTimeoutRef.current) {
                clearTimeout(clearTimeoutRef.current)
            }
        }
    }, [])

    return (
        <ModalContext.Provider value={{ openModal, closeModal, modalKey, modalProps, isOpen }}>
            {children}
        </ModalContext.Provider>
    )
}

export function useModal() {
    const context = useContext(ModalContext)
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider')
    }
    return context
}
