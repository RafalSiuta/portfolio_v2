import SystemIcon from '../../../utils/icons/system_icon'
import styles from './inputWindow.module.css'

export default function InputWindow({ className, placeholder,isDropdown = false,...props }) {

  const combinedClassName = [styles.inputWindow, className].filter(Boolean).join(' ')
  const handleDropdownClick = () => {
    console.log('btn was clicked')
  }

  return (
    <div className={styles.inputWrapper}>
      <input
        className={combinedClassName}
        placeholder={placeholder}
        {...props}
      />
      {
        isDropdown ? (
          <button
            type="button"
            className={styles.suffixButton}
            onClick={handleDropdownClick}
            aria-label="Open dropdown"
          >
            <SystemIcon
              name="ArrowDrpDown"
              className={styles.suffixIcon}
              aria-hidden="true"
            />
          </button>
        ) : null
      }
        
      
      
    </div>
  )
}
