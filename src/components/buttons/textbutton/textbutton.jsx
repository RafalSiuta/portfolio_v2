import styles from './textbutton.module.css'

export default function TextButton({ children, className = '', style, onClick, type = 'button' }) {
  const classes = [styles.textButton, className].filter(Boolean).join(' ')
  return (
    <button type={type} className={classes} style={style} onClick={onClick}>
      {children}
    </button>
  )
}

