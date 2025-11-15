import SystemIcon from '../../../utils/icons/system_icon'
import styles from './icon_button.module.css'

function IconButton({ iconName = 'ArrowRight', onClick, ariaLabel = iconName, className = '', ...rest }) {
  const combinedClassName = [styles.iconButton, className].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      className={combinedClassName}
      onClick={onClick}
      aria-label={ariaLabel}
      {...rest}
    >
      <SystemIcon name={iconName} className={styles.icon} aria-hidden={ariaLabel ? undefined : true} focusable="false" />
    </button>
  )
}

export default IconButton
