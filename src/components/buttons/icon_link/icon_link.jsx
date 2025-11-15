import SystemIcon from '../../../utils/icons/system_icon'
import styles from './icon_link.module.css'

const IconLink = ({ link = '#', iconName, label, className = '', ...rest }) => {
  if (!iconName) {
    console.warn('IconLink wymaga podania nazwy ikony.')
    return null
  }

  const combinedClassName = [styles.iconLink, className].filter(Boolean).join(' ')
  const ariaLabel = label ?? iconName

  return (
    <a
      href={link}
      className={combinedClassName}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={ariaLabel}
      {...rest}
    >
      <SystemIcon name={iconName} className={styles.icon} aria-hidden={label ? undefined : true} />
    </a>
  )
}

export default IconLink
