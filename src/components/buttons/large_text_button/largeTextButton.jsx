import SystemIcon from '../../../utils/icons/system_icon'
import styles from './largeTextButton.module.css'

export default function LargeTextButton({
  title,
  icon,
  onClick,
  className = '',
  ...rest
}) {
  const combinedClassName = [styles.largeTextButton, className].filter(Boolean).join(' ')

  return (
    <button type="button" className={combinedClassName} onClick={onClick} {...rest}>
      <h2 className={styles.title}>{title}</h2>
      {icon ? (
        <SystemIcon
          name={icon}
          className={styles.icon}
          aria-hidden="true"
          focusable="false"
        />
      ) : null}
    </button>
  )
}
