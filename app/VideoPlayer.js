'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import styles from './VideoPlayer.module.css';

export default function VideoPlayer({ src, onClose }) {
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef(null);
  const wrapRef = useRef(null);

  // Auto-play on mount, waiting for enough data to prevent audio desync
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const tryPlay = () => {
      v.play().then(() => setPlaying(true)).catch(() => {});
    };

    if (v.readyState >= 3) { // HAVE_FUTURE_DATA
      tryPlay();
    } else {
      v.addEventListener('canplay', tryPlay);
    }

    return () => {
      v.removeEventListener('canplay', tryPlay);
    };
  }, []);

  // Track fullscreen change from browser
  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    resetHideTimer();
    return () => clearTimeout(hideTimer.current);
  }, [playing, resetHideTimer]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const seekTo = useCallback((clientX) => {
    const bar = progressRef.current;
    if (!bar || !videoRef.current) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    videoRef.current.currentTime = ratio * duration;
    setCurrent(ratio * duration);
  }, [duration]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else          { v.pause(); setPlaying(false); }
    resetHideTimer();
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!dragging && v) setCurrent(v.currentTime);
  };

  const onLoaded = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const onEnded = () => setPlaying(false);

  // Progress bar mouse
  const onBarMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    seekTo(e.clientX);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => seekTo(e.clientX);
    const onUp   = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, seekTo]);

  // Touch progress
  const onBarTouchStart = (e) => {
    setDragging(true);
    seekTo(e.touches[0].clientX);
  };
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => seekTo(e.touches[0].clientX);
    const onEnd  = () => setDragging(false);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [dragging, seekTo]);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    resetHideTimer();
  };

  const onVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setMuted(val === 0);
    }
    resetHideTimer();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      wrapRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    resetHideTimer();
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        ref={wrapRef}
        className={`${styles.wrap} ${fullscreen ? styles.fullscreenWrap : ''}`}
        onMouseMove={resetHideTimer}
        onTouchStart={resetHideTimer}
      >
        {/* Close button */}
        <button className={styles.closeBtn} onClick={onClose} title="Tutup">✕</button>

        {/* Video element */}
        <video
          ref={videoRef}
          src={src}
          className={styles.video}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoaded}
          onEnded={onEnded}
          onClick={togglePlay}
          playsInline
          preload="auto"
        />

        {/* Controls overlay */}
        <div className={`${styles.controls} ${showControls ? styles.visible : styles.hidden}`}>

          {/* Progress bar */}
          <div
            ref={progressRef}
            className={styles.progressBar}
            onMouseDown={onBarMouseDown}
            onTouchStart={onBarTouchStart}
          >
            <div className={styles.progressBg} />
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            <div className={styles.progressThumb} style={{ left: `${progress}%` }} />
          </div>

          {/* Bottom row */}
          <div className={styles.bottomRow}>
            {/* Play / Pause */}
            <button className={styles.ctrlBtn} onClick={togglePlay} title={playing ? 'Pause' : 'Play'}>
              {playing ? '⏸' : '▶'}
            </button>

            {/* Volume */}
            <button className={styles.ctrlBtn} onClick={toggleMute} title="Mute">
              {muted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
            </button>
            <input
              type="range"
              min="0" max="1" step="0.02"
              value={muted ? 0 : volume}
              onChange={onVolumeChange}
              className={styles.volSlider}
              title="Volume"
            />

            {/* Time */}
            <span className={styles.timeLabel}>{fmt(currentTime)} / {fmt(duration)}</span>

            {/* Fullscreen */}
            <button className={styles.ctrlBtn} onClick={toggleFullscreen} title="Fullscreen">
              {fullscreen ? '⛶' : '⛶'}
              <span style={{ fontSize:'0.7rem' }}>{fullscreen ? 'exit' : 'full'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
