import { useNavContext } from '../../../utils/providers/navProvider'
import styles from './sectionTitle.module.css'

const titles = ['r85studio', 'my work', 'about', 'contact']

export default function SectionTitle({ className = '' }) {
  const { pageCounter } = useNavContext()
  const isFirstPage = pageCounter === 0
  const title = titles[pageCounter] ?? titles[0]
  const headingClassName = [
    styles.sectionTitle,
    isFirstPage ? styles.hidden : '',
    'strokeText',
    className
  ]
    .filter(Boolean)
    .join(' ')
  return <h1 className={headingClassName}>{title}</h1>
}
