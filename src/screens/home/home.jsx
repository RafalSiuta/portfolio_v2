import styles from './home.module.css'
import ContentWrapper from '../../components/wrapper/content_wrapper'
import SmallCard from '../../components/cards/small_card/smallCard'
import IconButton from '../../components/buttons/icon_button/icon_button'

function Home() {
  return (
    <section className={styles.heroContent} id="home">
      <ContentWrapper style={{ alignItems: 'flex-start', textAlign: 'left' }}>
        <article className={styles.herotext}>
          <h1>ui ux designer</h1>
          <h2>design & code</h2>
          <p>
            Hi I'm <strong>Rafal</strong>, UI designer and frontend developer.<br /> Technologies are just
            a tools that help us<br /> bring our beautiful <strong>ideas</strong> to life.<br /> Check out my
            projects and let me know how <strong>I can help</strong>.
          </p>
        <div className={styles.heroUtilityRow}>
          <SmallCard label="name" />
          <SmallCard label="name" />
          <SmallCard label="name" />
          <IconButton
            iconName="ArrowRight"
            onClick={() => console.log('button was clicked')}
            ariaLabel="Show next content"
          />
        </div>
        </article>
        
      </ContentWrapper>
    </section>
  )
}

export default Home
