import SystemIcon from '../../../utils/icons/system_icon'
import styles from './submitButton.module.css'

export default function SubmitButton({
  name = 'submit',
  iconName,
  className = '',
  iconClassName = '',
  onClick,
  ...rest
}) {
  const combinedClassName = [styles.submitButton, className].filter(Boolean).join(' ')
  const iconClasses = [styles.icon, iconClassName].filter(Boolean).join(' ')

  return (
    <button type="submit" className={combinedClassName} onClick={onClick} {...rest}>
      <span className={styles.label}>{name}</span>
      {iconName ? (
        <SystemIcon
          name={iconName}
          className={iconClasses}
          aria-hidden="true"
          focusable="false"
        />
      ) : null}
    </button>
  )
}
