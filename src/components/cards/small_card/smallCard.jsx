

import { useEffect, useId, useMemo, useRef } from 'react';
import VanillaTilt from 'vanilla-tilt';
import SystemIcon from '../../../utils/icons/system_icon';
import { resolveProjectSvgComponent } from '../../../utils/projects/projectAssets';
import styles from './smallCard.module.css';

function SmallCard({
  label = 'name',
  iconName = 'PhotoIcon',
  logo = '',
  isActive = false,
  onClick,
}) {
  const tiltRef = useRef(null);
  const displayLabel =
    typeof label === 'string'
      ? label.length > 8
        ? `${label.slice(0, 8)}..`
        : label
      : String(label ?? '');
  const LogoComponent = useMemo(() => resolveProjectSvgComponent(logo), [logo]);
  const reactId = useId();
  const clipPathId = `small-card-clip-${reactId.replace(/:/g, '')}`;

  useEffect(() => {
    if (!tiltRef.current) return;
    const el = tiltRef.current;
    VanillaTilt.init(el, {
      max: 16 ,
      speed: 1000,
      perspective: 1000,
      scale: 1.01,
      glare: true,
      'max-glare': 0.05,
      gyroscope: false,
      reverse: false,
      reset: true,
      easing: 'cubic-bezier(.03,.98,.52,.99)',
    });
    el.style.willChange = '';

    const clearWillChange = () => {
      el.style.willChange = '';
    };
    el.addEventListener('mouseleave', clearWillChange);

    return () => {
      el.removeEventListener('mouseleave', clearWillChange);
      el.vanillaTilt?.destroy();
    };
  }, []);

  const borderClassName = useMemo(
    () => `${styles.border} ${isActive ? styles.active : ''}`.trim(),
    [isActive]
  );
  const wrapperClassName = useMemo(
    () => `${styles.tiltWrapper} ${isActive ? styles.isActive : ''}`.trim(),
    [isActive]
  );

  return (
    <div ref={tiltRef} className={wrapperClassName} onClick={onClick}>
      <svg
        className={styles.container}
        viewBox="0 0 146.25 195"
        aria-hidden="false"
        role="group"
      >
      <defs>
        <clipPath id={clipPathId}>
          <path d="M120.1524 0.225586 L132.5406 13.690425 V13.691895 L146.0244 28.79445 V194.775 H0.225586 V0.225586 H120.1524 Z" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipPathId})`}>
        <foreignObject x="0" y="0" width="146.25" height="195">
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            className={styles.content}
            
          >
            <div className={styles.iconWrapper}>
              {LogoComponent ? (
                <LogoComponent
                  className={`${styles.icon} ${styles.logoIcon}`}
                  aria-hidden="true"
                  focusable="false"
                />
              ) : (
                <SystemIcon
                  name={iconName}
                  className={styles.icon}
                  aria-hidden="true"
                  focusable="false"
                />
              )}
            </div>
            <span className={styles.label}>{displayLabel}</span>
          </div>
        </foreignObject>
      </g>

      <path
        d="M120.1524 0.225586 L132.5406 13.690425 V13.691895 L146.0244 28.79445 V194.775 H0.225586 V0.225586 H120.1524 Z"
        className={borderClassName}
      />
    </svg>
    </div>
    
    
  );
}

export default SmallCard;
