import { useEffect, useRef } from 'react'
import InputWindow from '../inputs/inputWindow'
import TextWindow from '../text_area/textWindow'
import SubmitButton from '../../buttons/submit_button/submitButton'
import { useContactContext } from '../../../utils/providers/contactProvider'
import { useI18n } from '../../../utils/providers/lang/langProvider'
import { getContactText } from '../../../utils/providers/lang/services'
import styles from './formContainer.module.css'

export default function FormContainer() {
  const {
    emailValue,
    setEmailValue,
    topicValue,
    setTopicValue,
    messageValue,
    setMessageValue,
    emailError,
    setEmailError,
    topicError,
    setTopicError,
    messageError,
    setMessageError,
    isSending,
    clearErrors,
    submitForm,
  } = useContactContext()
  const { t } = useI18n()
  const contactText = getContactText(t)

  const formRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!formRef.current) return
      if (!formRef.current.contains(event.target)) {
        clearErrors()
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [clearErrors])

  return (
    <>
      <form
        ref={formRef}
        className={styles.formContainer}
        onSubmit={submitForm}
        onFocusCapture={clearErrors}
        onMouseDownCapture={clearErrors}
      >
        <InputWindow
          name="email"
          type="email"
          placeholder={contactText.form.email.placeholder}
          autoComplete="email"
          value={emailValue}
          onChange={(event) => {
            const nextValue = event.target.value
            setEmailValue(nextValue)
            if (nextValue.trim()) {
              setEmailError(false)
            }
          }}
          isError={emailError}
          errorMessage={contactText.form.email.errorMessage}
        />
        <InputWindow
          name="topic"
          type="text"
          isDropdown={true}
          placeholder={contactText.form.topic.placeholder}
          autoComplete="off"
          value={topicValue}
          dropdownItems={contactText.topicOptions}
          onChange={(event) => {
            const nextValue = event.target.value
            setTopicValue(nextValue)
            if (nextValue.trim()) {
              setTopicError(false)
            }
          }}
          isError={topicError}
          errorMessage={contactText.form.topic.errorMessage}
        />
        <TextWindow
          name="message"
          placeholder={contactText.form.message.placeholder}
          autoComplete="off"
          value={messageValue}
          onChange={(event) => {
            const nextValue = event.target.value
            setMessageValue(nextValue)
            if (nextValue.trim()) {
              setMessageError(false)
            }
          }}
          isError={messageError}
          errorMessage={contactText.form.message.errorMessage}
        />
        <div className={styles.submitRow}>
          <SubmitButton name={contactText.submitButton} iconName="ArrowThinRight" />
        </div>
      </form>
    </>
  )
}
