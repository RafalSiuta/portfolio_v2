import { useNavContext } from '../../../utils/providers/navProvider'
import styles from './sectionTitle.module.css'

const titles = ['r85studio', 'my work', 'about', 'contact']

export default function SectionTitle({ className = '' }) {
  const { pageCounter } = useNavContext()
  const title = titles[pageCounter] ?? titles[0]
  const headingClassName = [styles.sectionTitle, 'strokeText', className].filter(Boolean).join(' ')
  return <h1 className={headingClassName}>{title}</h1>
}
