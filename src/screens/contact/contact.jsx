import SectionWrapper from '../../components/containers/wrapper/sectionWrapper'
import styles from './contact.module.css'
import AnimatedSvgBackground from '../../components/background/AnimatedSvgBackground'
import contactDesktop from '../../assets/images/contact.jpg'
import contactTablet from '../../assets/images/contact_M.jpg'
import contactMobile from '../../assets/images/contact_S.jpg'

export default function Contact() {
  return (
    <section id="contact" className={styles.section}>
      <AnimatedSvgBackground
  images={{ desktop: contactDesktop, tablet: contactTablet, mobile: contactMobile }}
  objectPosition={{
    desktop: '50% 50%',
    tablet: '50% 45%',
    mobile: '50% 40%',
  }}
  idleAmp={9}
  maxLift={16}
  speed={1}
  overlay={0.25}
/>

      <SectionWrapper className={styles.wrapper}>
        <div className={styles.content}>
           <h1 className='strokeText'>let's talk...</h1>
        </div>
      </SectionWrapper>
    </section>
  )
}
