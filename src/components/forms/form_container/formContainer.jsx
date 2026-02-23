import InputWindow from '../inputs/inputWindow'
import TextWindow from '../text_area/textWindow'
import SubmitButton from '../../buttons/submit_button/submitButton'
import styles from './formContainer.module.css'

export default function FormContainer() {
  const handleSubmitClick = (event) => {
    event.preventDefault()
    console.log('submit was clicked')
  }

  return (
    <form className={styles.formContainer}>
      <InputWindow
        name="email"
        type="email"
        placeholder="your email"
        autoComplete="email"
      />
      <InputWindow
        name="topic"
        type="text"
        isDropdown={true}
        placeholder="topic"
        autoComplete="off"
      />
      <TextWindow
        name="message"
        placeholder="message"
        autoComplete="off"
      />
      <div className={styles.submitRow}>
        <SubmitButton name="sent" iconName="ArrowThinRight" onClick={handleSubmitClick} />
      </div>
    </form>
  )
}
