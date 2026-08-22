'use client';

import styles from './YouTubePlayer.module.css';

export default function YouTubePlayer({ videoId, onClose }) {
  // controls=0: Sembunyikan UI YouTube (play, pause, progress bar)
  // modestbranding=1: Sembunyikan logo YouTube besar
  // rel=0: Jangan tampilkan video rekomendasi dari channel lain di akhir
  // playsinline=1: Mainkan di dalam website, jangan paksa buka full screen native
  // iv_load_policy=3: Sembunyikan anotasi/kartu info YouTube
  const url = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&disablekb=1&fs=0`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.wrap} onClick={(e) => e.stopPropagation()}>
        {/* Tombol Tutup Kustom */}
        <button className={styles.closeBtn} onClick={onClose} title="Tutup">✕</button>

        <div className={styles.iframeContainer}>
          <iframe
            src={url}
            title="Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={styles.iframe}
          ></iframe>
        </div>
      </div>
    </div>
  );
}
