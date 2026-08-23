'use client';

import { useRef, useEffect } from 'react';
import styles from './VideoPlayer.module.css';

export default function VideoPlayer({ src, onClose }) {
  const videoRef = useRef(null);

  // Autoplay saat overlay terbuka
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
  }, [src]);

  // Hentikan video saat overlay ditutup
  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onClose();
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className={styles.wrap}>
        {/* Tombol Tutup */}
        <button className={styles.closeBtn} onClick={handleClose} title="Tutup">✕</button>

        {/* Tombol Download */}
        <a
          href={src}
          download
          className={styles.downloadBtn}
          title="Download video"
        >
          ⬇️ Download
        </a>

        {/* Video native — A/V sync sempurna, bisa fullscreen */}
        <video
          ref={videoRef}
          src={src}
          className={styles.video}
          playsInline
          controls
          preload="auto"
        />
      </div>
    </div>
  );
}
