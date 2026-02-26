import { useEffect, useRef, useState } from 'react'
import SystemIcon from '../../../utils/icons/system_icon'
import styles from './tooltip.module.css'

export default function Tooltip({
  message,
  isError = false,
  iconName = 'ErrorAlert',
  isOpen = false
}) {
  const [isVisible, setIsVisible] = useState(isOpen)
  const [isHiding, setIsHiding] = useState(false)
  const hideTimeoutRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }
      setIsVisible(true)
      setIsHiding(false)
      return
    }

    if (!isVisible) {
      return
    }

    setIsHiding(true)
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false)
      setIsHiding(false)
      hideTimeoutRef.current = null
    }, 180)
  }, [isOpen, isVisible])

  useEffect(() => () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
  }, [])

  if (!isVisible) {
    return null
  }

  const boxClassName = [
    styles.box,
    isHiding ? styles.boxHidden : null,
    isError ? styles.boxError : null
  ].filter(Boolean).join(' ')

  const iconClassName = [
    styles.icon,
    isError ? styles.iconError : null
  ].filter(Boolean).join(' ')

  const messageClassName = [
    styles.message,
    isError ? styles.messageError : null
  ].filter(Boolean).join(' ')

  return (
    <div className={boxClassName} role="status" aria-live="polite">
      <SystemIcon name={iconName} className={iconClassName} aria-label="Alert icon" />
      <p className={messageClassName}>{message}</p>
    </div>
  )
}
