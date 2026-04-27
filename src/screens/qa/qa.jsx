import HeroWrapper from '../../components/containers/herowrapper/heroWrapper'
import r85Desktop from '../../assets/images/r85.jpg'
import r85Tablet from '../../assets/images/r85_M.jpg'
import r85Mobile from '../../assets/images/r85_S.jpg'
import { useI18n } from '../../utils/providers/lang/langProvider'
import { getQaText } from '../../utils/providers/lang/services'
import styles from './qa.module.css'

export default function Qa() {
  const { t } = useI18n()
  const qaText = getQaText(t)

  return (
    <HeroWrapper
      id="qa"
      className={styles.section}
      images={{
        desktop: r85Desktop,
        tablet: r85Tablet,
        mobile: r85Mobile,
      }}
      isLastSection={true}
    >
      <div className={styles.content}>
        <h1 className="strokeText">{qaText.title}</h1>
        <p>{qaText.status}</p>
      </div>
    </HeroWrapper>
  )
}
