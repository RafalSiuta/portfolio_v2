import styles from './wrapper.module.css'

export default function SectionWrapper({ children, className = '', style: inlineStyle }) {
  const classes = [styles.wrapper, className].filter(Boolean).join(' ')
  return (
    <div className={classes} style={inlineStyle}>
      {children}
    </div>
  )
}
