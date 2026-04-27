import HeroWrapper from '../../components/containers/herowrapper/heroWrapper'
import r85Desktop from '../../assets/images/r85.jpg'
import r85Tablet from '../../assets/images/r85_M.jpg'
import r85Mobile from '../../assets/images/r85_S.jpg'
import { useI18n } from '../../utils/providers/lang/langProvider'
import { getVideoText } from '../../utils/providers/lang/services'
import styles from './video.module.css'

export default function Video() {
  const { t } = useI18n()
  const videoText = getVideoText(t)

  return (
    <HeroWrapper
      id="video"
      className={styles.section}
      images={{
        desktop: r85Desktop,
        tablet: r85Tablet,
        mobile: r85Mobile,
      }}
      isLastSection={true}
    >
      <div className={styles.content}>
        <h1 className="strokeText">{videoText.title}</h1>
        <p>{videoText.status}</p>
      </div>
    </HeroWrapper>
  )
}
