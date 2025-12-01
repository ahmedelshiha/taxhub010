"use client"

import { useModal } from '@/components/providers/ModalProvider'
import { GlobalSearchModal } from '@/components/portal/GlobalSearchModal'
import WelcomeModal from '@/components/portal/onboarding/WelcomeModal'
import NotificationCenterModal from '@/components/portal/modals/NotificationCenterModal'

export function ModalRegistry() {
    const { modalKey, modalProps, closeModal, isOpen } = useModal()

    if (!isOpen || !modalKey) return null

    const renderModal = () => {
        switch (modalKey) {
            case 'global-search':
                return (
                    <GlobalSearchModal
                        isOpen={isOpen}
                        onOpenChange={(open) => !open && closeModal()}
                        {...modalProps}
                    />
                )
            case 'welcome':
                return (
                    <WelcomeModal
                        isOpen={isOpen}
                        onOpenChange={(open) => !open && closeModal()}
                        {...modalProps}
                    />
                )
            case 'notifications':
                return (
                    <NotificationCenterModal
                        isOpen={isOpen}
                        onOpenChange={(open) => !open && closeModal()}
                        {...modalProps}
                    />
                )
            default:
                return null
        }
    }

    return renderModal()
}
