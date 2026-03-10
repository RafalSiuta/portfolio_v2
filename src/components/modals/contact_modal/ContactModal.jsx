import BaseModal from '../base_modal/baseModal'
import { useContactContext } from '../../../utils/providers/contactProvider'
import { useI18n } from '../../../utils/providers/lang/langProvider'
import { getContactText } from '../../../utils/providers/lang/services'

export default function ContactModal() {
  const {
    isOverlayOpen,
    isLoading,
    isModalError,
    modalPhase,
    closeModal,
  } = useContactContext()
  const { t } = useI18n()
  const contactText = getContactText(t)
  const modalText = isModalError ? contactText.modalError : contactText.modalSuccess

  return (
    <BaseModal
      isOpen={isOverlayOpen}
      isLoading={isLoading}
      isClosing={modalPhase === 'closing'}
      isError={isModalError}
      onClose={closeModal}
      title={modalText.title}
      subtitle={modalText.subtitle}
      message={modalText.message}
      buttonText={modalText.buttonText}
    />
  )
}
