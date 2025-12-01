"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

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

    const openModal = useCallback(<T = any>(key: string, props?: T) => {
        setModalKey(key)
        setModalProps(props || {})
        setIsOpen(true)
    }, [])

    const closeModal = useCallback(() => {
        setIsOpen(false)
        // Delay clearing key/props to allow animation to finish if needed
        setTimeout(() => {
            setModalKey(null)
            setModalProps({})
        }, 300)
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
