import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const ContactContext = createContext(null)

export function ContactProvider({ children }) {
  const [emailValue, setEmailValue] = useState('')
  const [topicValue, setTopicValue] = useState('')
  const [messageValue, setMessageValue] = useState('')
  const [emailError, setEmailError] = useState(false)
  const [topicError, setTopicError] = useState(false)
  const [messageError, setMessageError] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [modalPhase, setModalPhase] = useState('idle')
  const [modalKind, setModalKind] = useState('success')
  const closeTimeoutRef = useRef(null)
  const autoCloseTimeoutRef = useRef(null)

  const clearErrors = useCallback(() => {
    setEmailError(false)
    setTopicError(false)
    setMessageError(false)
  }, [])

  const openSuccessModal = useCallback(() => {
    setModalKind('success')
    setModalPhase('success')
  }, [])

  const openErrorModal = useCallback(() => {
    setModalKind('error')
    setModalPhase('error')
  }, [])

  const closeModal = useCallback(() => {
    if (modalPhase === 'idle' || modalPhase === 'loading') return
    setModalPhase('closing')
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    closeTimeoutRef.current = setTimeout(() => {
      setModalPhase('idle')
      closeTimeoutRef.current = null
    }, 240)
  }, [modalPhase])

  useEffect(() => {
    if (modalPhase === 'success' || modalPhase === 'error') {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current)
      }
      autoCloseTimeoutRef.current = setTimeout(() => {
        closeModal()
      }, 10000)
    }
    return () => {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current)
        autoCloseTimeoutRef.current = null
      }
    }
  }, [modalPhase, closeModal])

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

    // ustaw bledy UI (tak jak wczesniej)
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

    // jesli wszystko OK -> wysylka do lokalnego backendu
    try {
      setIsSending(true)
      setModalPhase('loading')

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

      console.log('Mail sent successfully:', {
        email: trimmedEmail,
        topic: trimmedTopic,
        message: trimmedMessage,
      })

      // opcjonalnie: czysc pola po sukcesie
      setEmailValue('')
      setTopicValue('')
      setMessageValue('')
      clearErrors()
      openSuccessModal()
    } catch (err) {
      console.log('Mail send error:', err?.message || err)
      openErrorModal()

      // jesli chcesz, mozesz tu ustawic np. messageError=true
      // setMessageError(true)
    } finally {
      setIsSending(false)
    }
  }

  const isOverlayOpen = modalPhase !== 'idle'
  const isModalError = modalKind === 'error'
  const isModalReady = modalPhase === 'success' || modalPhase === 'error'
  const isLoading = modalPhase === 'loading'

  const value = useMemo(
    () => ({
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
      modalPhase,
      modalKind,
      isOverlayOpen,
      isModalError,
      isModalReady,
      isLoading,
      clearErrors,
      submitForm,
      closeModal,
    }),
    [
      emailValue,
      topicValue,
      messageValue,
      emailError,
      topicError,
      messageError,
      isSending,
      modalPhase,
      modalKind,
      isOverlayOpen,
      isModalError,
      isModalReady,
      isLoading,
      clearErrors,
      closeModal,
    ]
  )

  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>
}

export function useContactContext() {
  const context = useContext(ContactContext)
  if (!context) {
    throw new Error('useContactContext must be used within a ContactProvider')
  }
  return context
}
