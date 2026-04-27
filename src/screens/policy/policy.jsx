import HeroWrapper from '../../components/containers/herowrapper/heroWrapper'
import r85Desktop from '../../assets/images/r85.jpg'
import r85Tablet from '../../assets/images/r85_M.jpg'
import r85Mobile from '../../assets/images/r85_S.jpg'
import { useI18n } from '../../utils/providers/lang/langProvider'
import { getPolicyText } from '../../utils/providers/lang/services'
import styles from './policy.module.css'

export default function Policy() {
  const { t } = useI18n()
  const policyText = getPolicyText(t)

  return (
    <HeroWrapper
      id="policy"
      className={styles.section}
      images={{
        desktop: r85Desktop,
        tablet: r85Tablet,
        mobile: r85Mobile,
      }}
      isLastSection={true}
    >
      <div className={styles.content}>
        <h1 className="strokeText">{policyText.title}</h1>
        <p>{policyText.status}</p>
      </div>
    </HeroWrapper>
  )
}
