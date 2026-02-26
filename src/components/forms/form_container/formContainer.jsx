import { useEffect, useRef, useState } from 'react'
import InputWindow from '../inputs/inputWindow'
import TextWindow from '../text_area/textWindow'
import SubmitButton from '../../buttons/submit_button/submitButton'
import styles from './formContainer.module.css'

export default function FormContainer() {
  const [emailValue, setEmailValue] = useState('')
  const [topicValue, setTopicValue] = useState('')
  const [messageValue, setMessageValue] = useState('')
  const [emailError, setEmailError] = useState(false)
  const [topicError, setTopicError] = useState(false)
  const [messageError, setMessageError] = useState(false)
  const formRef = useRef(null)

  const [isSending, setIsSending] = useState(false)

  const clearErrors = () => {
    setEmailError(false)
    setTopicError(false)
    setMessageError(false)
  }

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
  }, [])

  // const submitForm = (event) => {
  //   event.preventDefault()

  //   const trimmedEmail = emailValue.trim()
  //   const trimmedTopic = topicValue.trim()
  //   const trimmedMessage = messageValue.trim()

  //   const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  //   const isEmailValid = emailPattern.test(trimmedEmail)
  //   const isTopicValid = trimmedTopic.length > 0
  //   const isMessageValid = trimmedMessage.length > 0

  //   const missingFields = []
  //   if (!trimmedEmail) missingFields.push('email')
  //   if (!trimmedTopic) missingFields.push('topic')
  //   if (!trimmedMessage) missingFields.push('message')

  //   if (missingFields.length > 0) {
  //     console.log('Missing fields:', missingFields)
  //   }

  //   if (trimmedEmail && !isEmailValid) {
  //     console.log('Invalid email format:', trimmedEmail)
  //   }

  //   if (isEmailValid && isTopicValid && isMessageValid) {
  //     console.log('Form OK:', {
  //       email: trimmedEmail,
  //       topic: trimmedTopic,
  //       message: trimmedMessage,
  //     })
  //   }

  //   setEmailError(!trimmedEmail)
  //   setTopicError(!trimmedTopic)
  //   setMessageError(!trimmedMessage)
  // }

  const submitForm = async (event) => {
  event.preventDefault()

  if (isSending) return // blokada double-click

  const trimmedEmail = emailValue.trim()
  const trimmedTopic = topicValue.trim()
  const trimmedMessage = messageValue.trim()

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isEmailValid = emailPattern.test(trimmedEmail)
  const isTopicValid = trimmedTopic.length > 0
  const isMessageValid = trimmedMessage.length > 0

  // ustaw błędy UI (tak jak wcześniej)
  setEmailError(!trimmedEmail || !isEmailValid)
  setTopicError(!trimmedTopic)
  setMessageError(!trimmedMessage)

  // logi diagnostyczne (opcjonalne)
  const missingFields = []
  if (!trimmedEmail) missingFields.push('email')
  if (!trimmedTopic) missingFields.push('topic')
  if (!trimmedMessage) missingFields.push('message')

  if (missingFields.length > 0) {
    console.log('Missing fields:', missingFields)
    return
  }

  if (!isEmailValid) {
    console.log('Invalid email format:', trimmedEmail)
    return
  }

  if (!isTopicValid || !isMessageValid) {
    console.log('Validation failed (topic/message).')
    return
  }

  // jeśli wszystko OK -> wysyłka do lokalnego backendu
  try {
    setIsSending(true)

    console.log('Sending message to local mail server...')

    const resp = await fetch('http://localhost:3001/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: trimmedEmail,
        topic: trimmedTopic,
        message: trimmedMessage,
      }),
    })

    const data = await resp.json().catch(() => ({}))

    if (!resp.ok || !data.ok) {
      throw new Error(data.error || `Send failed (HTTP ${resp.status})`)
    }

    console.log('✅ Mail sent successfully:', {
      email: trimmedEmail,
      topic: trimmedTopic,
      message: trimmedMessage,
    })

    // opcjonalnie: czyść pola po sukcesie
    setEmailValue('')
    setTopicValue('')
    setMessageValue('')
    clearErrors()
  } catch (err) {
    console.log('❌ Mail send error:', err?.message || err)

    // jeśli chcesz, możesz tu ustawić np. messageError=true
    // setMessageError(true)
  } finally {
    setIsSending(false)
  }
}

  return (
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
        <SubmitButton name="sent" iconName="ArrowThinRight" />
      </div>
    </form>
  )
}
