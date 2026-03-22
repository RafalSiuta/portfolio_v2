import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import ParticlesBackground from '../../components/containers/particles/particlesBackground'
import HeroWrapper from '../../components/containers/herowrapper/heroWrapper'
import IconButton from '../../components/buttons/icon_button/icon_button'
import SectionWrapper from '../../components/containers/wrapper/sectionWrapper'
import SliderNav from '../../components/navigation/slider_nav/sliderNav'
import ShotMiniature from '../../components/cards/shot_miniature/shotMiniature'
import { useProjectsContext } from '../../utils/providers/projectsProvider'
import { useNavContext } from '../../utils/providers/navProvider'
import { usePageTransitionContext } from '../../utils/providers/pageTransitionProvider'
import { resolveProjectImage } from '../../utils/projects/projectImages'
import styles from './projectDetails.module.css'

const AUTO_PROGRESS_STEP = 1
const AUTO_PROGRESS_INTERVAL_MS = 200
const INDICATOR_PROGRESS_STEP = 10
const MAX_PROGRESS = 100

export default function ProjectDetails() {
  const { projectId } = useParams()
  const { projectsList, heroImages } = useProjectsContext()
  const { lastSectionId } = useNavContext()
  const { returnToSection } = usePageTransitionContext()
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0)
  const [loadPercent, setLoadPercent] = useState(0)

  const project = useMemo(
    () => projectsList.find((item) => item.id === projectId) ?? null,
    [projectsList, projectId]
  )

  const screensList = project?.screens_list ?? []
  const currentScreen = screensList[currentScreenIndex] ?? null

  const heroImage = useMemo(() => {
    return resolveProjectImage(currentScreen, heroImages, isMobileViewport)
  }, [currentScreen, heroImages, isMobileViewport])

  useEffect(() => {
    const updateViewport = () => setIsMobileViewport(window.innerWidth < 500)
    updateViewport()
    window.addEventListener('resize', updateViewport)

    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  useEffect(() => {
    setCurrentScreenIndex(0)
    setLoadPercent(0)
  }, [projectId])

  const handleReturn = useCallback(() => {
    returnToSection(lastSectionId)
  }, [lastSectionId, returnToSection])

  const resetSliderProgress = () => {
    setLoadPercent(0)
  }

  const showNextScreen = useCallback(() => {
    setCurrentScreenIndex((prevIndex) =>
      screensList.length === 0 ? 0 : (prevIndex + 1) % screensList.length
    )
  }, [screensList.length])

  const showPrevScreen = useCallback(() => {
    setCurrentScreenIndex((prevIndex) =>
      screensList.length === 0
        ? 0
        : (prevIndex - 1 + screensList.length) % screensList.length
    )
  }, [screensList.length])

  const handleNextScreenClick = () => {
    resetSliderProgress()
    showNextScreen()
  }

  const handlePrevScreenClick = () => {
    resetSliderProgress()
    showPrevScreen()
  }

  const handleScreenMiniatureClick = (index) => {
    resetSliderProgress()
    setCurrentScreenIndex(index)
  }

  useEffect(() => {
    if (screensList.length <= 1) return undefined

    const intervalId = window.setInterval(() => {
      setLoadPercent((previousPercent) =>
        previousPercent >= MAX_PROGRESS
          ? MAX_PROGRESS
          : previousPercent + AUTO_PROGRESS_STEP
      )
    }, AUTO_PROGRESS_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [currentScreenIndex, screensList.length])

  useEffect(() => {
    if (screensList.length <= 1 || loadPercent < MAX_PROGRESS) return undefined

    const timeoutId = window.setTimeout(() => {
      showNextScreen()
      resetSliderProgress()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadPercent, screensList.length, showNextScreen])

  const activeIndicatorCount = Math.min(
    10,
    Math.floor(loadPercent / INDICATOR_PROGRESS_STEP)
  )

  return (
    <div className={styles.pageRoot}>
      <ParticlesBackground
        className="particles-overlay"
        style={{
          '--particles-align': 'stretch',
          '--particles-justify': 'flex-start',
        }}
      />
      <HeroWrapper className={styles.heroWrapper}>
        <SectionWrapper className={styles.wrapper}>
          <h1 className="strokeText">{project?.title ?? 'Project not found'}</h1>
          <div className={styles.content}>
            <div className={styles.imageContainer}>
              <div className={styles.imageFrame} aria-hidden="true">
                <img src={heroImage} alt={project?.title ?? ''} />
              </div>
            </div>
          </div>
          <SliderNav
            counterLabel="screen"
            nextProject={handlePrevScreenClick}
            prevProject={handleNextScreenClick}
            loadPercent={loadPercent}
            activeIndicatorCount={activeIndicatorCount}
            currentSlideNumber={screensList.length === 0 ? 0 : currentScreenIndex + 1}
            totalSlides={screensList.length}
          >
            {screensList.map((screen, index) => (
              <ShotMiniature
                key={screen.desktop ?? screen.mobile ?? index}
                src={resolveProjectImage(screen, heroImages, isMobileViewport)}
                alt={`${project?.title ?? 'project'} screen ${index + 1}`}
                isActive={index === currentScreenIndex}
                onClick={() => handleScreenMiniatureClick(index)}
              />
            ))}
          </SliderNav>
          <div className={styles.text_content}>
            {project?.subtitle ? <h2>{project.subtitle}</h2> : null}
            {project?.description ? <p>{project.description}</p> : null}
          </div>
        </SectionWrapper>

        <IconButton
          iconName="ArrowThinLeft"
          onClick={handleReturn}
          ariaLabel="Back to main page"
          hover="0deg"
          className={styles.backButton}
          iconClassName={styles.backIcon}
          style={{ '--icon-hover-shift': 'calc(var(--icon-button-width) * 0.18)' }}
        />
      </HeroWrapper>
    </div>
  )
}
