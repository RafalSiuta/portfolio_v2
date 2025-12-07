import { Link } from 'react-router-dom'
import styles from './textLinkButton.module.css'

export default function TextLinkButton({ name, to, className = '', ...rest }) {
  const combinedClassName = [styles.textLinkButton, 'text-link', className].filter(Boolean).join(' ')

  return (
    <Link to={to} className={combinedClassName} {...rest}>
      {name}
    </Link>
  )
}
