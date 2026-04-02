import { useCallback } from 'react'
import HeroWrapper from '../../components/containers/herowrapper/heroWrapper'
import IconButton from '../../components/buttons/icon_button/icon_button'
import r85Desktop from '../../assets/images/r85.jpg'
import r85Tablet from '../../assets/images/r85_M.jpg'
import r85Mobile from '../../assets/images/r85_S.jpg'
import { useNavContext } from '../../utils/providers/navProvider'
import { usePageTransitionContext } from '../../utils/providers/pageTransitionProvider'
import styles from './r85.module.css'

export default function R85() {
  const { lastSectionId } = useNavContext()
  const { returnToSection } = usePageTransitionContext()

  // const handleReturn = useCallback(() => {
  //   returnToSection(lastSectionId)
  // }, [lastSectionId, returnToSection])

  return (
    <HeroWrapper
      id="r85"
      className={styles.section}
      images={{
        desktop: r85Desktop,
        tablet: r85Tablet,
        mobile: r85Mobile,
      }}
      isLastSection={true}
    >
      <div className={styles.content}>
        <h1 className="strokeText">r85studio</h1>
      </div>
    </HeroWrapper>
  )
}
