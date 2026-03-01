import { useEffect, useRef } from 'react'
import InputWindow from '../inputs/inputWindow'
import TextWindow from '../text_area/textWindow'
import SubmitButton from '../../buttons/submit_button/submitButton'
import { useContactContext } from '../../../utils/providers/contactProvider'
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
          placeholder="your email"
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
          errorMessage="Email is required"
        />
        <InputWindow
          name="topic"
          type="text"
          isDropdown={true}
          placeholder="topic"
          autoComplete="off"
          value={topicValue}
          onChange={(event) => {
            const nextValue = event.target.value
            setTopicValue(nextValue)
            if (nextValue.trim()) {
              setTopicError(false)
            }
          }}
          isError={topicError}
          errorMessage="Topic is required"
        />
        <TextWindow
          name="message"
          placeholder="message"
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
          errorMessage="Message is required"
        />
        <div className={styles.submitRow}>
          <SubmitButton name="just send it" iconName="ArrowThinRight" />
        </div>
      </form>
    </>
  )
}
