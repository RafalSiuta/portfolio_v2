import styles from "./sectionContainer.module.css";

const Section = ({ children, id }) => {

  return (
    <div id={id} className={styles.section}>
      {children}
    </div>
  );
};

export default Section;