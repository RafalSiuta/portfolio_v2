import styles from './sideIndicator.module.css'
import { useNavContext } from '../../utils/providers/navProvider'

function SideIndicator() {
  const { pageCounter } = useNavContext()
  const displayValue = String(pageCounter + 1).padStart(2, '0')

  return (
    <aside className={styles.container} aria-hidden="true">
      <span className={styles.divider} />
      <h3 className={styles.label}>{displayValue}</h3>
      <span className={styles.divider} />
    </aside>
  )
}

export default SideIndicator
