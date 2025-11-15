import IconLink from '../buttons/icon_link/icon_link'
import styles from './footer.module.css'

const iconsList = [
  { link: '#', name: 'Play', label: 'Odtworz' },
  // { link: '#', name: 'Youtube', label: 'YouTube' },
  { link: 'https://github.com/RafalSiuta', name: 'Github', label: 'GitHub' },
  { link: '#', name: 'Linkedin', label: 'LinkedIn' },
]

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.socialList}>
          {iconsList.map(({ link, name, label }) => (
            <IconLink key={name} link={link} iconName={name} label={label} />
          ))}
        </div>
      </div>
    </footer>
  )
}

export default Footer
