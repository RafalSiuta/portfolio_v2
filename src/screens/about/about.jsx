import { useCallback } from 'react'
import SectionWrapper from '../../components/containers/wrapper/sectionWrapper'
import SectionTitle from '../../components/headers/section_title/secctionTitle'
import styles from './about.module.css'
import ArtCanvas from '../../components/containers/art_canvas/art_canvas'
import { gsap } from 'gsap'
import IconLink from '../../components/buttons/icon_link/icon_link'
import DascriptionCard from '../../components/cards/description_card/DascriptionCard'
import ChipButton from '../../components/buttons/chip_button/chipButton'
import { toHtml } from '../../utils/convert/stringConvert'
import IconButton from '../../components/buttons/icon_button/icon_button'
import { useNavContext } from '../../utils/providers/navProvider'
import navLinks from '../../utils/constants/navLinks'
const iconsList = [
  { link: 'https://www.google.com/maps/place/Piotrkowska,+90-001+%C5%81%C3%B3d%C5%BA/@51.7605719,19.4582415,3a,75y,90t/data=!3m8!1e2!3m6!1sCIHM0ogKEICAgIC2w7bERQ!2e10!3e12!6shttps:%2F%2Flh3.googleusercontent.com%2Fgps-cs-s%2FAHVAwerFrfAfvQFomYqgLypUAAGS9acbDIpjl2tu226Sn2Rqnxyjgre9rFO1gsBBKqY41XRfuCbQERWqODRcjP44qV07Dhf85R6SEzbay7kJXg-1ciyuDg0TGVX1Q6KePnVzTSx2JW4g%3Dw203-h119-k-no!7i5559!8i3266!4m17!1m9!3m8!1s0x471a34d6b72fc851:0x96dbeb8c2cd474b0!2zUGlvdHJrb3dza2EsIDkwLTAwMSDFgcOzZMW6!3b1!8m2!3d51.7605694!4d19.458271!10e5!16s%2Fm%2F02rrybm!3m6!1s0x471a34d6b72fc851:0x96dbeb8c2cd474b0!8m2!3d51.7605694!4d19.458271!10e5!16s%2Fm%2F02rrybm?authuser=0&entry=ttu&g_ep=EgoyMDI2MDEyOC4wIKXMDSoKLDEwMDc5MjA3M0gBUAM%3D', name: 'LDZ', label: 'Łódź' },
  { link: 'https://linkedin.com/in/rafal-siuta-3023ba323', name: 'Linkedin', label: 'LinkedIn' },
  { link: 'https://github.com/RafalSiuta', name: 'Github', label: 'GitHub' },
  { link: '#', name: 'Play', label: 'Odtworz' },
]

const serviceDescriptionList = [
  {
    "id":"1",
    "title":"skills",
    "description":"From concept to finished product. I design clear interfaces and implement them into <strong>working websites and applications.<strong/><br/>I combine UX, aesthetics, and code to quickly transform an idea into a product that works and looks great.",
    "skillsList":[]
  },
  {
    "id":"2",
    "title":"design",
    "description":"Starting from scratch, <strong>I can design your brand,</strong> define your goal analysis, user flow, information architecture, and usability. I can design a consistent style for all graphics, and create user-friendly, responsive interfaces.",
    "skillsList":[
      "brand design","UI/UX design", "system design", "user flows", "responsive design"
    ]
  },
  {
    "id":"3",
    "title":"code",
    "description":"As a front-end developer, <strong>I have experience building websites, web, mobile, and desktop applications.<strong/><br/> Depending on the needs, I create a digital, scalable product that fit seamlessly with brand design.",
    "skillsList":[
      "landing pages", "mobile apps", "web apps", "desktop", 
    ]
  },
]

const aboutDescriptionList = [
  {
    "id":"1",
    "title":"bio",
    "description":"<strong>Graphic design and programming</strong> have been my passions for years. I wanted more than just aesthetics, so after graduating in graphic design, I decided to <strong>combine both passions<strong/> by creating interactive interfaces. This combination gives me the ability to <strong>bring the entire project to life,<strong/> providing users with digital experiences that are not only beautiful but also intuitive, functional, and user-centric.",
  },
  {
    "id":"2",
    "title":"education",
    "description":"<strong>2024 - Bachelor's degree</strong> in computer graphics at the Academy of Humanities and Economics in Łódź",
  },
]

export default function About() {
  const { pageCounter, setPageCounter, scrollProgress, setScrollProgress, setScrollDirection, smoother } = useNavContext()

  const handleNextSection = useCallback(() => {
    const lastIndex = navLinks.length - 1
    const nextIndex = Math.min(pageCounter + 1, lastIndex)
    const contactIndex = lastIndex
    const contactSectionId = navLinks[contactIndex].href.replace('#', '')
    const contactSection = document.getElementById(contactSectionId)
    const isContactTarget = nextIndex === contactIndex

    const scrollContactToBottom = () => {
      if (!contactSection) return
      if (smoother) {
        smoother.scrollTo(contactSection, true, 'bottom bottom')
        return
      }
      const sectionTop = contactSection.getBoundingClientRect().top + window.scrollY
      const sectionBottom = sectionTop + contactSection.offsetHeight
      const target = Math.max(sectionBottom - window.innerHeight, sectionTop)
      window.scrollTo({ top: target, behavior: 'smooth' })
    }

    if (nextIndex === pageCounter) {
      if (isContactTarget) {
        scrollContactToBottom()
      }
      return
    }

    const nextSectionId = navLinks[nextIndex].href.replace('#', '')
    const nextSection = document.getElementById(nextSectionId)

    setScrollDirection('down')
    const proxy = { value: scrollProgress }
    gsap.to(proxy, {
      value: 100,
      duration: 0.35,
      ease: 'power2.out',
      onUpdate: () => setScrollProgress(Math.round(proxy.value)),
      onComplete: () => {
        setPageCounter(nextIndex)
        if (isContactTarget) {
          scrollContactToBottom()
          return
        }
        if (nextSection) {
          if (smoother) {
            smoother.scrollTo(nextSection, true, 'top top')
          } else {
            nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }
      },
    })
  }, [pageCounter, scrollProgress, setPageCounter, setScrollProgress, setScrollDirection, smoother])

  return (
    <section id="about" className={styles.particlesBackground}>
      <SectionWrapper className={styles.wrapper}>
        <div className={styles.content}>
          <article className={styles.welcome_text}>
            <h1 className='strokeText'>about me</h1>
            <p><strong>UI designer</strong> and frontend developer<br/> with graphic design background <strong>based in Łódź,</strong><br/>central Poland.</p>
            <div className={styles.socialList}>
              {iconsList.map(({ link, name, label }) => (
                <IconLink key={name} link={link} iconName={name} label={label} />
              ))}
            </div>
          </article>
          <div className={styles.art_canvas}>
            <ArtCanvas />
          </div>
        </div>
        <div className={styles.detailsContainer}>
            <h2 className='strokeText'>How can I help?</h2>
          
            {
              serviceDescriptionList.map((item,index)=>(
                  <DascriptionCard
                  key={`details-${index}`}
                  title={item.title}
                  description={toHtml(item.description)}
                  children={
                    item.skillsList.map((skill,index) => (
                      <ChipButton key={index} text={skill}/>
                    ))
                  }
                />
              ))
            }
       
        </div>
        <div className={styles.detailsContainer}>
          <h2 className='strokeText'>just call me rafi</h2>
          {
              aboutDescriptionList.map((item,index)=>(
                  <DascriptionCard
                  key={`details-${index}`}
                  title={item.title}
                  description={toHtml(item.description)}
                />
              ))
            }
        </div>
        <div className={styles.nextPageRow}>
          <IconButton
            iconName="ArrowThinRight"
            onClick={handleNextSection}
            ariaLabel="Show next content"
            hover="45deg"
            className={styles.nextPageIconButton}
            iconClassName={styles.heroIcon}
          />
        </div>
      </SectionWrapper>
    </section>
  )
}
