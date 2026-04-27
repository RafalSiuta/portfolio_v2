import HeroWrapper from '../../components/containers/herowrapper/heroWrapper'
import r85Desktop from '../../assets/images/404.jpg'
import r85Tablet from '../../assets/images/404_M.jpg'
import r85Mobile from '../../assets/images/404_S.jpg'
import { useI18n } from '../../utils/providers/lang/langProvider'
import { getErrorPageText } from '../../utils/providers/lang/services'
import styles from './error_page.module.css'

export default function ErrorPage() {
  const { t } = useI18n()
  const errorPageText = getErrorPageText(t)

  return (
    <HeroWrapper
      id="404"
      className={styles.section}
      images={{
        desktop: r85Desktop,
        tablet: r85Tablet,
        mobile: r85Mobile,
      }}
      isLastSection={true}
    >
      <div className={styles.content}>
        <h1 className="strokeText">{errorPageText.title}</h1>
        <h2>{errorPageText.subtitle}</h2>
      </div>
    </HeroWrapper>
  )
}
