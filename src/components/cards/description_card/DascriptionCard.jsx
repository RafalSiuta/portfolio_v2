import styles from './dascriptionCard.module.css'

export default function DascriptionCard({ title = '', description = '', children }) {
  const hasDescription =
    typeof description === 'string'
      ? description.trim().length > 0
      : Boolean(description?.__html?.trim())

  const descriptionProps =
    typeof description === 'string'
      ? { children: description }
      : { dangerouslySetInnerHTML: description }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{title}</h2>
      <span className={styles.divider} />
      <div className={styles.body}>
        {hasDescription ? (
          <p className={`description ${styles.description}`} {...descriptionProps} />
        ) : null}
        <div className={styles.childrenContainer}>
          {children}
        </div>
      </div>
    </div>
  )
}
