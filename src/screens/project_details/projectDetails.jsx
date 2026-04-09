import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useParams } from 'react-router-dom'
import ParticlesBackground from '../../components/containers/particles/particlesBackground'
import PhotoGrid from '../../components/containers/photo_grid/photoGrid'
import HeroWrapper from '../../components/containers/herowrapper/heroWrapper'
import IconButton from '../../components/buttons/icon_button/icon_button'
import LargeTextButton from '../../components/buttons/large_text_button/largeTextButton'
import ChipButton from '../../components/buttons/chip_button/chipButton'
import TextLinkButton from '../../components/buttons/textlink_button/textLinkButton'
import SectionWrapper from '../../components/containers/wrapper/sectionWrapper'
import SliderNav from '../../components/navigation/slider_nav/sliderNav'
import ShotMiniature from '../../components/cards/shot_miniature/shotMiniature'
import SmallCard from '../../components/cards/small_card/smallCard'
import { useProjectsContext } from '../../utils/providers/projectsProvider'
import { useNavContext } from '../../utils/providers/navProvider'
import { usePageTransitionContext } from '../../utils/providers/pageTransitionProvider'
import { useI18n } from '../../utils/providers/lang/langProvider'
import { getDetailsText } from '../../utils/providers/lang/services'
import { resolveProjectImage } from '../../utils/projects/projectImages'
import styles from './projectDetails.module.css'

const AUTO_PROGRESS_STEP = 1
const AUTO_PROGRESS_INTERVAL_MS = 200
const INDICATOR_PROGRESS_STEP = 10
const MAX_PROGRESS = 100

export default function ProjectDetails() {
  const { projectId } = useParams()
  const { projectsList, heroImages } = useProjectsContext()
  const { smoother } = useNavContext()
  const { navigateToDetail, returnToSection, setIsDetailFooterVisible } = usePageTransitionContext()
  const { t } = useI18n()
  const detailsText = getDetailsText(t)
  const projectChangeTweenRef = useRef(null)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0)
  const [loadPercent, setLoadPercent] = useState(0)
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false)

  const project = useMemo(
    () => projectsList.find((item) => item.id === projectId) ?? null,
    [projectsList, projectId]
  )

  const screensList = project?.screens_list ?? []
  const webLinks = project?.web_links ?? []
  const graphicsList = project?.graphics ?? []
  const currentScreen = screensList[currentScreenIndex] ?? null
  const relatedProjects = useMemo(
    () => projectsList.filter(({ id }) => id && id !== projectId),
    [projectsList, projectId]
  )

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
    setIsAutoplayPaused(false)
  }, [projectId])

  useEffect(() => {
    projectChangeTweenRef.current?.kill()

    if (smoother) {
      smoother.scrollTo(0, true)
      return undefined
    }

    const scrollProxy = { y: window.scrollY }
    projectChangeTweenRef.current = gsap.to(scrollProxy, {
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: () => {
        window.scrollTo(0, scrollProxy.y)
      },
      onComplete: () => {
        projectChangeTweenRef.current = null
      },
    })

    return () => {
      projectChangeTweenRef.current?.kill()
      projectChangeTweenRef.current = null
    }
  }, [projectId, smoother])

  useEffect(() => {
    let hasLoggedBottom = false

    const checkIfScrolledToBottom = () => {
      const scrollTop = smoother
        ? smoother.scrollTop()
        : window.scrollY || window.pageYOffset || 0
      const viewportHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const isAtBottom = scrollTop + viewportHeight >= documentHeight - 2

      if (isAtBottom && !hasLoggedBottom) {
        console.log('scroll to bottom')
        setIsDetailFooterVisible(true)
        hasLoggedBottom = true
        return
      }

      if (!isAtBottom) {
        setIsDetailFooterVisible(false)
        hasLoggedBottom = false
      }
    }

    checkIfScrolledToBottom()

    if (smoother) {
      const trigger = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: checkIfScrolledToBottom,
      })

      return () => {
        trigger.kill()
        setIsDetailFooterVisible(false)
      }
    }

    window.addEventListener('scroll', checkIfScrolledToBottom, { passive: true })

    return () => {
      window.removeEventListener('scroll', checkIfScrolledToBottom)
      setIsDetailFooterVisible(false)
    }
  }, [projectId, setIsDetailFooterVisible, smoother])

  const handleContactReturn = useCallback(() => {
    returnToSection('contact')
  }, [returnToSection])

  const resetSliderProgress = () => {
    setLoadPercent(0)
  }

  const toggleSliderPause = () => {
    setIsAutoplayPaused((previousState) => !previousState)
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

  const handleProjectCardClick = useCallback((nextProjectId) => {
    if (!nextProjectId || nextProjectId === projectId) return
    navigateToDetail(`/projects/${nextProjectId}`)
  }, [navigateToDetail, projectId])

  useEffect(() => {
    if (screensList.length <= 1 || isAutoplayPaused) return undefined

    const intervalId = window.setInterval(() => {
      setLoadPercent((previousPercent) =>
        previousPercent >= MAX_PROGRESS
          ? MAX_PROGRESS
          : previousPercent + AUTO_PROGRESS_STEP
      )
    }, AUTO_PROGRESS_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [currentScreenIndex, isAutoplayPaused, screensList.length])

  useEffect(() => {
    if (screensList.length <= 1 || isAutoplayPaused || loadPercent < MAX_PROGRESS) return undefined

    const timeoutId = window.setTimeout(() => {
      showNextScreen()
      resetSliderProgress()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [isAutoplayPaused, loadPercent, screensList.length, showNextScreen])

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
      <HeroWrapper
        className={styles.heroWrapper}
        style={{
          '--hero-surface-align-tablet': 'stretch',
          '--hero-surface-padding-tablet': 'calc(var(--nav-min-height) * 0.35) 0 0',
        }}
      >
        <SectionWrapper className={styles.wrapper}>
          <header className={styles.header}>
            <h1 className="strokeText">{project?.title ?? detailsText.errorMessage}</h1>
            <h2>{project?.subtitle}</h2>
          </header>

          <div className={styles.content}>
            <div className={styles.imageContainer}>
              <div className={styles.imageFrame} aria-hidden="true">
                <img src={heroImage} alt={project?.title ?? ''} />
              </div>
            </div>
          </div>
          <SliderNav
            key={projectId ?? 'project-details-slider'}
            counterLabel={detailsText.screen}
            nextProject={handlePrevScreenClick}
            prevProject={handleNextScreenClick}
            pauseProject={toggleSliderPause}
            isAutoplayPaused={isAutoplayPaused}
            loadPercent={loadPercent}
            activeIndicatorCount={activeIndicatorCount}
            currentSlideNumber={screensList.length === 0 ? 0 : currentScreenIndex + 1}
            totalSlides={screensList.length}
          >
            {screensList.map((screen, index) => (
              <ShotMiniature
                key={`${projectId ?? 'project'}-${screen.desktop ?? screen.mobile ?? 'screen'}-${index}`}
                src={resolveProjectImage(screen, heroImages, isMobileViewport)}
                alt={`${project?.title ?? 'project'} screen ${index + 1}`}
                isActive={index === currentScreenIndex}
                onClick={() => handleScreenMiniatureClick(index)}
              />
            ))}
          </SliderNav>
          <div className={styles.text_content}>
            <h2>{detailsText.aboutProject}</h2>
            {project?.description ? <p>{project.description}</p> : null}
            <div className={styles.weblinks_container}>
            {webLinks.map(({ link_title, icon_name, link }, index) => (
              <TextLinkButton
                key={`${link_title}-${link}-${index}`}
                name={link_title}
                to={link}
                iconName={icon_name}
                isLink={true}
                isActive={index === webLinks.length - 1}
              />
            ))}
          </div>
          </div>
          <div className={styles.text_content}>
            <h2>{detailsText.role}</h2>
            {project?.role?.length ? (
              <ul className={styles.roleList}>
                {project.role.map((roleItem, index) => (
                  <li key={`${roleItem}-${index}`} className={styles.roleListItem}>
                    <span className={styles.roleListBullet} aria-hidden="true" />
                    <span className={styles.roleListText}>{roleItem}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className={styles.graphics_container}>
            <div className={styles.graphic_header}>
              <h2>{detailsText.screenshots}</h2>
              <h2>{graphicsList.length}</h2>
            </div>
            <PhotoGrid
              graphicsList={graphicsList}
              heroImages={heroImages}
              isMobileViewport={isMobileViewport}
            />
          </div>

          <div className={styles.project_tools_container}>
            <h2>{detailsText.tools}</h2>
            <div className={styles.project_tools_wrapper}>
              {project?.tools?.map(({ tool_name }) => (
                <ChipButton key={tool_name} text={tool_name} onClick={() => {}} />
              ))}
            </div>
          </div>
          <div className={styles.solutions_container}>
            <h2>{detailsText.challanges}</h2>
              {project?.challanges ? <p>{project.challanges}</p> : null}
            {/* <div className={styles.small_content}>
              
            </div> */}
            {/* <div className={styles.small_content}>
              <h2>solutions</h2>
              {project?.role?.length ? (
                <ul className={styles.roleList}>
                  {project.solutions.map((item, index) => (
                    <li key={`${item}-${index}`} className={styles.roleListItem}>
                      <span className={styles.roleListBullet} aria-hidden="true" />
                      <span className={styles.roleListText}>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div> */}
            
          </div>
          {relatedProjects.length ? (
            <div className={styles.related_projects_container}>
              <h2>{detailsText.projectsList}</h2>
              <div className={styles.related_projects_wrapper}>
                {relatedProjects.map(({ id, title, logo }) => (
                  <SmallCard
                    key={id}
                    label={title}
                    logo={logo}
                    onClick={() => handleProjectCardClick(id)}
                  />
                ))}
              </div>
              <div className={styles.contact_container}>
                <LargeTextButton
                  title={detailsText.ctaButton}
                  icon="ArrowRight"
                  onClick={handleContactReturn}
                  aria-label="Back to contact section"
                />
              </div>
            </div>
          ) : null}
          
        </SectionWrapper>
      </HeroWrapper>
    </div>
  )
}
