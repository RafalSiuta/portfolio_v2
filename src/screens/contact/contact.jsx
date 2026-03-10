import SectionWrapper from '../../components/containers/wrapper/sectionWrapper'
import HeroWrapper from '../../components/containers/herowrapper/heroWrapper'
import styles from './contact.module.css'
import contactDesktop from '../../assets/images/contact.jpg'
import contactTablet from '../../assets/images/contact_M.jpg'
import contactMobile from '../../assets/images/contact_S.jpg'
import FormContainer from '../../components/forms/form_container/formContainer'
import { useI18n } from '../../utils/providers/lang/langProvider'
import { getContactText } from '../../utils/providers/lang/services'

export default function Contact() {
  const { t } = useI18n()
  const contactText = getContactText(t)

  return (
    <HeroWrapper
      id="contact"
      className={styles.section}
      images={{
        desktop: contactDesktop,
        tablet: contactTablet,
        mobile: contactMobile,
      }}
      isLastSection={true}
    >
      <SectionWrapper className={styles.wrapper}>
        <div className={styles.content}>
          <h1 className="strokeText">{contactText.title}</h1>
          <FormContainer />
        </div>
      </SectionWrapper>
    </HeroWrapper>
  )
}
