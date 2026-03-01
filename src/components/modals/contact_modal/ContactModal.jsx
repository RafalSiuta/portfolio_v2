import BaseModal from '../base_modal/baseModal'
import { useContactContext } from '../../../utils/providers/contactProvider'

export default function ContactModal() {
  const {
    isOverlayOpen,
    isLoading,
    isModalError,
    modalPhase,
    closeModal,
  } = useContactContext()

  return (
    <BaseModal
      isOpen={isOverlayOpen}
      isLoading={isLoading}
      isClosing={modalPhase === 'closing'}
      isError={isModalError}
      onClose={closeModal}
    />
  )
}
