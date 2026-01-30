import styles from './dascriptionCard.module.css'

export default function DascriptionCard({ title = '', description = '', children }) {
  const descriptionProps =
    typeof description === 'string'
      ? { children: description }
      : { dangerouslySetInnerHTML: description }

  return (
    <div className={styles.card}>
      <h4 className={styles.title}>{title}</h4>
      <span className={styles.divider} />
      <div className={styles.body}>
        <p className={`description ${styles.description}`} {...descriptionProps} />
        <div className={styles.childrenContainer}>
          {children}
        </div>
        
      </div>
    </div>
  )
}
