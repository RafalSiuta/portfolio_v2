import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import HeroWrapper from '../../components/containers/herowrapper/heroWrapper'
import IconButton from '../../components/buttons/icon_button/icon_button'
import r85Desktop from '../../assets/images/r85.jpg'
import r85Tablet from '../../assets/images/r85_M.jpg'
import r85Mobile from '../../assets/images/r85_S.jpg'
import styles from './r85.module.css'

export default function R85() {
  const navigate = useNavigate()

  const handleReturn = useCallback(() => {
    navigate('/')
  }, [navigate])

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
      <IconButton
        iconName="ArrowThinRight"
        onClick={handleReturn}
        ariaLabel="Back to main page"
        hover="45deg"
        className={styles.heroIconButton}
        iconClassName={styles.heroIcon}
      />
    </HeroWrapper>
  )
}
