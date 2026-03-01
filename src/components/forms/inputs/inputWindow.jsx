import { useEffect, useRef, useState } from 'react'
import SystemIcon from '../../../utils/icons/system_icon'
import Tooltip from '../tooltip/tooltip'
import styles from './inputWindow.module.css'

const DEFAULT_DROPDOWN_ITEMS = ['ui design', 'brand design', 'web dev', 'mobile dev', 'full service']

export default function InputWindow({
  className,
  placeholder,
  isDropdown = false,
  isError = false,
  errorMessage = '',
  dropdownItems = DEFAULT_DROPDOWN_ITEMS,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [internalValue, setInternalValue] = useState('')
  const wrapperRef = useRef(null)
  const closeTimerRef = useRef(null)
  const isControlled = props.value !== undefined
  const inputValue = isControlled ? props.value : internalValue

  const combinedClassName = [
    styles.inputWindow,
    isError ? styles.inputError : null,
    className
  ].filter(Boolean).join(' ')

  const handleDropdownClick = () => {
    setIsOpen((prev) => !prev)
  }

  const handleInputChange = (event) => {
    if (!isControlled) {
      setInternalValue(event.target.value)
    }
    if (props.onChange) {
      props.onChange(event)
    }
  }

  const handleSelect = (value) => {
    if (!isControlled) {
      setInternalValue(value)
    }
    if (props.onChange) {
      props.onChange({ target: { name: props.name, value } })
    }
    setIsOpen(false)
  }

  useEffect(() => {
    if (!isOpen) return
    const handleOutsideClick = (event) => {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isOpen])

  return (
    <div className={styles.inputWrapper} ref={wrapperRef}>
      <input
        className={combinedClassName}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        {...props}
      />
      <Tooltip
        message={errorMessage}
        isError={isError}
        isOpen={isError}
      />
      {
        isDropdown ? (
          <button
            type="button"
            className={styles.suffixButton}
            onClick={handleDropdownClick}
            aria-label="Open dropdown"
            aria-expanded={isOpen}
          >
            <SystemIcon
              name="ArrowDrpDown"
              className={styles.suffixIcon}
              aria-hidden="true"
            />
          </button>
        ) : null
      }
      {
        isDropdown && isOpen ? (
          <div className={styles.dropdownMenu} role="listbox">
            {dropdownItems.map((item, index) => (
              <button
                type="button"
                key={item}
                className={[
                  styles.dropdownItem,
                  !isOpen ? styles.dropdownItemClosing : '',
                ].filter(Boolean).join(' ')}
                style={{
                  animationDelay: `${!isOpen
                    ? (dropdownItems.length - 1 - index) * 60
                    : index * 60}ms`,
                }}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(item)}
                role="option"
                aria-selected={inputValue === item}
              >
                {item}
              </button>
            ))}
          </div>
        ) : null
      }
    </div>
  )
}
