import SystemIcon from '../../../utils/icons/system_icon'
import styles from './smallCard.module.css'

function SmallCard({ label = 'name', iconName = 'PhotoIcon' }) {
  return (
    <article className={styles.container}>
      <div className={styles.iconWrapper}>
        <SystemIcon name={iconName} className={styles.icon} aria-hidden="true" focusable="false" />
      </div>
      <span className={styles.label}>{label}</span>
    </article>
  )
}

export default SmallCard
