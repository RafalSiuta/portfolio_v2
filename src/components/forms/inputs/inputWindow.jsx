import SystemIcon from '../../../utils/icons/system_icon'
import styles from './inputWindow.module.css'

export default function InputWindow({ className, placeholder,isDropdown = false, ...props }) {
  const combinedClassName = [styles.inputWindow, className].filter(Boolean).join(' ')

  return (
    <div className={styles.inputWrapper}>
      <input
        className={combinedClassName}
        placeholder={placeholder}
        {...props}
      />
      {
        isDropdown ? <SystemIcon
        name="ArrowDrpDown"
        className={styles.suffixIcon}
        aria-hidden="true"
        /> : null
      }
        
      
      
    </div>
  )
}
