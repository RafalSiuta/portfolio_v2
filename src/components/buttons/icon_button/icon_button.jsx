import SystemIcon from '../../../utils/icons/system_icon'
import styles from './icon_button.module.css'

function IconButton({
  iconName = 'ArrowRight',
  onClick,
  ariaLabel = iconName,
  className = '',
  iconClassName = '',
  hover = '0deg',
  style,
  ...rest
}) {
  const combinedClassName = [styles.iconButton, className].filter(Boolean).join(' ')
  const iconClasses = [styles.icon, iconClassName].filter(Boolean).join(' ')
  const inlineStyle = { '--icon-hover-rotation': hover, ...style }

  return (
    <button
      type="button"
      className={combinedClassName}
      onClick={onClick}
      aria-label={ariaLabel}
      style={inlineStyle}
      {...rest}
    >
      <SystemIcon name={iconName} className={iconClasses} aria-hidden={ariaLabel ? undefined : true} focusable="false" />
    </button>
  )
}

export default IconButton
