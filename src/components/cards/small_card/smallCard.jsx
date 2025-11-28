// import SystemIcon from '../../../utils/icons/system_icon'
// import styles from './smallCard.module.css'

// function SmallCard({ label = 'name', iconName = 'PhotoIcon' }) {
//   return (
//     <article className={styles.container}>
//       <div className={styles.iconWrapper}>
//         <SystemIcon name={iconName} className={styles.icon} aria-hidden="true" focusable="false" />
//       </div>
//       <span className={styles.label}>{label}</span>
//     </article>
//   )
// }

// export default SmallCard
import { useEffect, useRef } from 'react';
import VanillaTilt from 'vanilla-tilt';
import SystemIcon from '../../../utils/icons/system_icon';
import styles from './smallCard.module.css';

function SmallCard({ label = 'name', iconName = 'PhotoIcon' }) {
  const tiltRef = useRef(null);

  useEffect(() => {
    if (!tiltRef.current) return;
    const el = tiltRef.current;
    VanillaTilt.init(el, {
      max: 14,
      speed: 1000,
      perspective: 1000,
      scale: 1.01,
      glare: true,
      'max-glare': 0.05,
      gyroscope: true,
      reverse: false,
      reset: true,
      easing: 'cubic-bezier(.03,.98,.52,.99)',
    });
    return () => {
      el.vanillaTilt?.destroy();
    };
  }, []);

  return (
    <div ref={tiltRef} className={styles.tiltWrapper}>
      <svg
        className={styles.container}
        viewBox="0 0 146.25 195"
        aria-hidden="false"
        role="group"
      >
      <defs>
        <clipPath id="smallCardClip">
          <path d="M120.1524 0.225586 L132.5406 13.690425 V13.691895 L146.0244 28.79445 V194.775 H0.225586 V0.225586 H120.1524 Z" />
        </clipPath>
      </defs>

      {/* TŁO + TREŚĆ, przycięte clipPath-em */}
      <g clipPath="url(#smallCardClip)">
        <foreignObject x="0" y="0" width="146.25" height="195">
          {/* UWAGA: potrzebne xmlns dla HTML w foreignObject */}
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            className={styles.content}
            
          >
            <div className={styles.iconWrapper}>
              <SystemIcon
                name={iconName}
                className={styles.icon}
                aria-hidden="true"
                focusable="false"
              />
            </div>
            <span className={styles.label}>{label}</span>
          </div>
        </foreignObject>
      </g>

      {/* OBRYS – pełna kontrola stroke */}
      <path
        d="M120.1524 0.225586 L132.5406 13.690425 V13.691895 L146.0244 28.79445 V194.775 H0.225586 V0.225586 H120.1524 Z"
        className={styles.border}
      />
    </svg>
    </div>
    
    
  );
}

export default SmallCard;
