import InputWindow from '../inputs/inputWindow'
import styles from './formContainer.module.css'

export default function FormContainer() {
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
        autoComplete="topic"
      />
    </form>
  )
}
