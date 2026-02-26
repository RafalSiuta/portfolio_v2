import { useEffect, useRef, useState } from 'react'
import Tooltip from '../tooltip/tooltip'
import styles from './textWindow.module.css'

export default function TextWindow({
  className,
  placeholder = 'message',
  maxLength = 500,
  isError = false,
  errorMessage = '',
  value,
  onChange,
  ...props
}) {
  const [internalValue, setInternalValue] = useState('')
  const [limitExceeded, setLimitExceeded] = useState(false)
  const textRef = useRef(null)

  const currentValue = value ?? internalValue
  const usedCount = currentValue.length
  const isAtMax = usedCount >= maxLength

  const handleChange = (event) => {
    if (onChange) {
      onChange(event)
    }
    if (value === undefined) {
      setInternalValue(event.target.value)
    }
  }

  const shouldFlagLimit = () => {
    const textarea = textRef.current
    if (!textarea) {
      return false
    }
    const selectionLength = (textarea.selectionEnd ?? 0) - (textarea.selectionStart ?? 0)
    return isAtMax && selectionLength === 0
  }

  const handleBeforeInput = (event) => {
    if (event.inputType && event.inputType.startsWith('insert') && shouldFlagLimit()) {
      setLimitExceeded(true)
    }
  }

  const handlePaste = () => {
    if (shouldFlagLimit()) {
      setLimitExceeded(true)
    }
  }

  const handleKeyDown = (event) => {
    if (!shouldFlagLimit()) {
      return
    }
    if (event.key && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      setLimitExceeded(true)
    }
  }

  useEffect(() => {
    const textarea = textRef.current
    if (!textarea) {
      return
    }

    // Auto-grow up to the CSS max-height.
    textarea.style.height = 'auto'
    const computed = getComputedStyle(textarea)
    const maxHeight = Number.parseFloat(computed.maxHeight) || 0
    const minHeight = Number.parseFloat(computed.minHeight) || 0
    const measuredHeight = maxHeight > 0 ? Math.min(textarea.scrollHeight, maxHeight) : textarea.scrollHeight
    const targetHeight = Math.max(measuredHeight, minHeight)
    textarea.style.height = `${targetHeight}px`
  }, [currentValue])

  useEffect(() => {
    if (!isAtMax && limitExceeded) {
      setLimitExceeded(false)
    }
  }, [isAtMax, limitExceeded])

  const combinedClassName = [
    styles.textWindow,
    isError ? styles.textError : null,
    className
  ].filter(Boolean).join(' ')
  const counterClassName = [
    styles.counter,
    isAtMax ? styles.counterAlert : null
  ].filter(Boolean).join(' ')

  return (
    <div className={styles.textWrapper}>
      <textarea
        ref={textRef}
        className={combinedClassName}
        placeholder={placeholder}
        maxLength={maxLength}
        value={currentValue}
        onChange={handleChange}
        onBeforeInput={handleBeforeInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        {...props}
      />
      <Tooltip
        message={errorMessage}
        isError={isError}
        isOpen={isError}
      />
      <span className={counterClassName}>
        {usedCount}/{maxLength}
        {limitExceeded && isAtMax ? ' • limit exceeded' : null}
      </span>
    </div>
  )
}
