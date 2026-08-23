'use client';

import styles from './YouTubePlayer.module.css';

export default function YouTubePlayer({ videoId, onClose }) {
  // autoplay=1: Putar otomatis
  // controls=1: Tampilkan kontrol YouTube (play, pause, progress, dll)
  // modestbranding=1: Sembunyikan logo YouTube besar
  // rel=0: Jangan tampilkan video rekomendasi dari channel lain di akhir
  // playsinline=1: Mainkan di dalam website, jangan paksa buka full screen native
  // iv_load_policy=3: Sembunyikan anotasi/kartu info YouTube
  const url = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.wrap} onClick={(e) => e.stopPropagation()}>
        {/* Tombol Tutup */}
        <button className={styles.closeBtn} onClick={onClose} title="Tutup">✕</button>

        {/* Tombol Download — buka di YouTube agar bisa download */}
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.downloadBtn}
          title="Buka di YouTube untuk download"
        >
          ⬇️ Download
        </a>

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
