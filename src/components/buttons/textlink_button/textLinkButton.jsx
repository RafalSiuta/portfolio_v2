import { Link } from 'react-router-dom'
import SystemIcon from '../../../utils/icons/system_icon'
import styles from './textLinkButton.module.css'

export default function TextLinkButton({
  name,
  to,
  iconName,
  className = '',
  iconClassName = '',
  ...rest
}) {
  const combinedClassName = [styles.textLinkButton, 'text-link', className].filter(Boolean).join(' ')
  const iconClasses = [styles.icon, iconClassName].filter(Boolean).join(' ')

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
