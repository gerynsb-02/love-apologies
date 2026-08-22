'use client';

import { useRef, useEffect } from 'react';
import styles from './VideoPlayer.module.css';

export default function VideoPlayer({ src, onClose }) {
  const videoRef = useRef(null);
  const wrapRef = useRef(null);

  const onEnded = () => {
    // Optionally close or do something when ended
  };

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={wrapRef} className={styles.wrap}>
        {/* Close button */}
        <button className={styles.closeBtn} onClick={onClose} title="Tutup">?</button>

        {/* Video element using Native Controls for perfect A/V sync on mobile */}
        <video
          ref={videoRef}
          src={src}
          className={styles.video}
          onEnded={onEnded}
          playsInline
          controls
          controlsList="nodownload"
          preload="metadata"
        />
      </div>
    </div>
  );
}
