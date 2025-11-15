import { useCallback } from 'react'
import { gsap } from 'gsap'
import styles from './home.module.css'
import ContentWrapper from '../../components/wrapper/content_wrapper'
import SmallCard from '../../components/cards/small_card/smallCard'
import IconButton from '../../components/buttons/icon_button/icon_button'
import { useNavContext } from '../../utils/providers/navProvider'
import navLinks from '../../utils/constants/navLinks'

function Home() {
  const { pageCounter, setPageCounter, scrollProgress, setScrollProgress, setScrollDirection } = useNavContext()

  const handleNextSection = useCallback(() => {
    const nextIndex = Math.min(pageCounter + 1, navLinks.length - 1)
    if (nextIndex === pageCounter) return

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
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      },
    })
  }, [pageCounter, scrollProgress, setPageCounter, setScrollProgress, setScrollDirection])

  return (
    <section className={styles.heroContent} id="home">
      <ContentWrapper style={{ alignItems: 'flex-start', textAlign: 'left' }}>
        <article className={styles.herotext}>
          <h1>UI UX designer</h1>
          <h2>idea | design | code</h2>
          <p>
            Hi I'm <strong>Rafal</strong>, UI designer and frontend developer.<br /> Technologies are just
            a tools that help us<br /> bring our beautiful <strong>ideas</strong> to life.<br /> Check out my
            projects and let me know how <strong>I can help</strong>.
          </p>
          <p>my projects...</p>
          <div className={styles.heroUtilityRow}>
            <SmallCard label="name" />
            <SmallCard label="name" />
            <SmallCard label="name" />
            <IconButton
              iconName="ArrowRight"
              onClick={handleNextSection}
              ariaLabel="Show next content"
            />
          </div>
        </article>
      </ContentWrapper>
    </section>
  )
}

export default Home
