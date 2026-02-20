import SectionWrapper from '../../components/containers/wrapper/sectionWrapper'
import HeroWrapper from '../../components/containers/herowrapper/heroWrapper'
import styles from './contact.module.css'
import contactDesktop from '../../assets/images/contact.jpg'
import contactTablet from '../../assets/images/contact_M.jpg'
import contactMobile from '../../assets/images/contact_S.jpg'

export default function Contact() {
  return (
    <HeroWrapper
      id="contact"
      className={styles.section}
      images={{ desktop: contactDesktop, tablet: contactTablet, mobile: contactMobile }}
      isLastSection={true}
    >
      <SectionWrapper className={styles.wrapper}>
        <div className={styles.content}>
           <h1 className='strokeText'>let's talk...</h1>
        </div>
      </SectionWrapper>
    </HeroWrapper>
  )
}
