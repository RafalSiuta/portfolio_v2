import { Link } from 'react-router-dom'
import SystemIcon from '../../../utils/icons/system_icon'
import styles from './textLinkButton.module.css'

export default function TextLinkButton({
  name,
  to,
  iconName,
  className = '',
  iconClassName = '',
  isLink = false,
  isActive = true,
  ...rest
}) {
  const combinedClassName = [
    styles.textLinkButton,
    'text-link',
    isActive ? styles.active : styles.inactive,
    className,
  ]
    .filter(Boolean)
    .join(' ')
  const iconClasses = [styles.icon, iconClassName].filter(Boolean).join(' ')

  if (isLink) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className={combinedClassName}
        {...rest}
      >
        <span className={styles.label}>{name}</span>
        {iconName ? (
          <SystemIcon
            name={iconName}
            className={iconClasses}
            aria-hidden="true"
            focusable="false"
          />
        ) : null}
      </a>
    )
  }

  return (
    <Link to={to} className={combinedClassName} {...rest}>
      <span className={styles.label}>{name}</span>
      {iconName ? (
        <SystemIcon
          name={iconName}
          className={iconClasses}
          aria-hidden="true"
          focusable="false"
        />
      ) : null}
    </Link>
  )
}
