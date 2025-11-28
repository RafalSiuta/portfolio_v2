import { useEffect, useRef } from "react";
import styles from "./navButton.module.css";


const MenuBtn = (props) => {

    const iconRef = useRef(null);

  useEffect(() => {
    const svg = iconRef.current;
    if (!svg) return;

    const bar1 = svg.querySelector('#bar1');
    const bar2 = svg.querySelector('#bar2');
    const bar3 = svg.querySelector('#bar3');
    const bar4 = svg.querySelector('#bar4');

    [bar1, bar2, bar3, bar4].forEach(bar => {
      if (bar) {
        bar.style.transition = 'transform .3s ease, opacity .6s ease';
      }
    });

    if (props.isOpen) {
      bar3?.classList.remove(styles.transparent);
      bar1?.classList.add(styles.bar1fade);
      bar2?.classList.add(styles.bar2fade);
      bar3?.classList.add(styles.bar3rotated);
      bar4?.classList.add(styles.bar4rotated);
      
    } else {
      bar3?.classList.add(styles.transparent);
      bar1?.classList.remove(styles.bar1fade);
      bar2?.classList.remove(styles.bar2fade);
      bar3?.classList.remove(styles.bar3rotated);
      bar4?.classList.remove(styles.bar4rotated);
    }
  }, [props.isOpen]);

    return (
        <button onClick={props.toogle} ref={props.buttonRef} className={styles.menu__btn}>

            <svg 
                ref={iconRef}
                width="73"
                height="60"
                viewBox="0 0 73 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={styles.menu__icon}
            >
                <path id="bar1" d="M13 14H61" stroke="white"/>
                <path id="bar3" d="M13 30H61" stroke="white"/>
                <path id="bar4" d="M13 30H61" stroke="white"/>
                <path id="bar2" d="M13 46H61" stroke="white"/>
            </svg>
        </button>
    )
}

export default MenuBtn;