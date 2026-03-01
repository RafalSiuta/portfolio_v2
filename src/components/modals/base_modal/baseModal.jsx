import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

import ChipButton from '../../buttons/chip_button/chipButton'
import Spinner from '../spinner/Spinner'
import styles from './baseModal.module.css'

const DEFAULT_SUCCESS = {
  title: 'thank you',
  subtitle: 'email was send successfully',
  message:
    'Thank you for visiting and your time, I am very pleased, I will reply to your message as soon as possible :)',
  buttonText: 'ok cool',
}

const DEFAULT_ERROR = {
  title: 'opsss',
  subtitle: 'some think went wrong',
  message:
    'possibly there is some error. check your form data and try again.',
  buttonText: 'lets try again',
}

export default function BaseModal({
  isOpen,
  isLoading,
  isClosing,
  onClose,
  isError = false,
  title,
  subtitle,
  message,
  buttonText,
}) {
  const shouldRender = isOpen || isClosing
  if (!shouldRender) return null

  const defaults = isError ? DEFAULT_ERROR : DEFAULT_SUCCESS
  const displayTitle = title ?? defaults.title
  const displaySubtitle = subtitle ?? defaults.subtitle
  const displayMessage = message ?? defaults.message
  const displayButtonText = buttonText ?? defaults.buttonText

  const cardRef = useRef(null)

  const overlayClasses = [
    styles.overlay,
    !isClosing ? styles.overlayVisible : '',
  ]
    .filter(Boolean)
    .join(' ')

  const cardClasses = [
    styles.modalCard,
    isError ? styles.error : '',
    !isClosing && !isLoading ? styles.cardVisible : '',
  ]
    .filter(Boolean)
    .join(' ')

  useEffect(() => {
    const el = cardRef.current
    if (!el || isLoading) return

    gsap.killTweensOf(el)

    if (isClosing) {
      gsap.to(el, { opacity: 0, scale: 0.5, duration: 0.3, ease: 'power2.in' })
      return
    }

    gsap.fromTo(
      el,
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
    )
  }, [isLoading, isClosing])

  return (
    <div className={overlayClasses} onClick={onClose}>
      <Spinner className={isLoading ? styles.spinnerVisible : ''} />
      {!isLoading && (
        <div
          className={cardClasses}
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          onClick={(event) => event.stopPropagation()}
        >
          <div className={styles.header}>
            <h2>{displayTitle}</h2>
            <p className={styles.subtitle}>{displaySubtitle}</p>
          </div>
          <div className={styles.divider} />
          <p className={styles.message}>{displayMessage}</p>
          <div className={styles.buttonRow}>
            <ChipButton onClick={onClose} text={displayButtonText} />
          </div>
        </div>
      )}
    </div>
  )
}
