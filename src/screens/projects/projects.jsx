import { useEffect } from 'react'
import SectionWrapper from '../../components/containers/wrapper/sectionWrapper'
import ParticlesBackground from '../../components/containers/particles/particlesBackground'
import projectsData from '../../assets/data/projects_data.json'
import ChipButton from '../../components/buttons/chip_button/chipButton'
import TextLinkButton from '../../components/buttons/textlink_button/textLinkButton'
import IconButton from '../../components/buttons/icon_button/icon_button'
import SmallCard from '../../components/cards/small_card/smallCard'
import vipImage from '../../assets/data/image_data/vip.png'
import styles from './projects.module.css'

const projectsList = projectsData

export default function Projects() {

  useEffect(() => {
    const logProjects = () => {
      projectsList.map(({ title, subtitle, description, hero_img, tools }) => {
        console.log('title:', title)
        console.log('subtitle:', subtitle)
        console.log('description:', description)
        console.log('hero_img:', hero_img)
        console.log('tools:', tools)
        return null
      })
    }

    logProjects()
  }, [])
  
  return (
    <ParticlesBackground id="projects" className={styles.section}>
      <SectionWrapper className={styles.wrapper}>
        <h1>projects</h1>
        <div className={styles.content}>
          <div className={styles.imageContainer}>
            <div className={styles.imageFrame} aria-hidden="true">
              <img src={vipImage} alt="" />
            </div>
          </div>
          <div className={styles.textContainer}>
            <h2>project title</h2>
            <h4>project subtitle</h4>
            <p className='description'>
              Description for the highlighted project goes here. Share a quick overview of what
              the project is about and why it stands out.Description for the highlighted project goes here. Share a quick overview of what
              the project is about and why it stands out.
            </p>
            <div className={styles.divider} aria-hidden="true" />
            <p className='description'>project tools...</p>
            <div className={styles.chipRow}>
              <ChipButton text="test" onClick={() => {}} />
              <ChipButton text="test" onClick={() => {}} />
              <ChipButton text="test" onClick={() => {}} />
            </div>
            <div className={styles.linkRow}>
              <TextLinkButton name="see more..." to="/projects" className='description' />
            </div>
          </div>
        </div>
        <div className={styles.projectCardsContainer}>
          <div className={styles.navButtonsContainer}>
            <IconButton
              iconName="ArrowThinLeft"
              onClick={() => {}}
              className={styles.navButtonLeft}
              iconClassName={styles.navIconLeft}
              style={{ '--icon-hover-shift': 'calc(var(--icon-button-width) * 0.18)' }}
            />
            <IconButton
              iconName="ArrowThinRight"
              onClick={() => {}}
              className={styles.navButtonRight}
              iconClassName={styles.navIconRight}
              style={{ '--icon-hover-shift': 'calc(var(--icon-button-width) * 0.18)' }}
            />
          </div>
          <div className={styles.cardsContainer}>
            <SmallCard label="name" />
            <SmallCard label="name" />
            <SmallCard label="name" />
            <SmallCard label="name" />
          </div>
        </div>
      </SectionWrapper>
    </ParticlesBackground>
  )
}
