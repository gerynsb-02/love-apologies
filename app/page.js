'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import VideoPlayer from './VideoPlayer';

// ── Floating decoration configs ───────────────────────────────────────────────
const FLOATERS = [
  { emoji: '🌸', size: 2.2, x: 5,  y: 10, dur: 6,  delay: 0   },
  { emoji: '🍓', size: 1.8, x: 15, y: 70, dur: 8,  delay: 1   },
  { emoji: '🌺', size: 2.0, x: 88, y: 15, dur: 7,  delay: 0.5 },
  { emoji: '✨', size: 1.5, x: 92, y: 80, dur: 5,  delay: 2   },
  { emoji: '🌷', size: 1.9, x: 50, y: 5,  dur: 9,  delay: 1.5 },
  { emoji: '🦋', size: 1.6, x: 3,  y: 50, dur: 6,  delay: 3   },
  { emoji: '🍑', size: 1.7, x: 80, y: 55, dur: 7,  delay: 0.8 },
  { emoji: '🌸', size: 1.4, x: 40, y: 90, dur: 8,  delay: 2.5 },
  { emoji: '🐝', size: 1.8, x: 70, y: 8,  dur: 10, delay: 1.2 },
  { emoji: '🌼', size: 1.6, x: 25, y: 88, dur: 6,  delay: 3.5 },
];

const HAPPY_FLOATERS = [
  '🌸','🌺','✨','🌷','🦋','🌼','🍓','🎀','🌹','⭐',
  '🌸','✨','🌺','🦋','🎊','🌷','🌼','🍑','🌸','💫',
];

const SAD_FLOATERS = ['😢','🌧️','😿','💦','😭','🌂','💧','😔','🌧️','☁️'];

// No-button messages cycle
const NO_MESSAGES = [
  'Are you sure? 🥺',
  'Pliss maaf... 😢',
  'Tolonglah pliss 🙏',
];

// ── Audio helper (plays segment of an audio file on loop) ────────────────────
function useSegmentAudio(src, startSec, endSec) {
  const audioRef = useRef(null);

  const play = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
    }
    const audio = audioRef.current;
    audio.currentTime = startSec;
    audio.play().catch(() => {});

    const onTimeUpdate = () => {
      if (audio.currentTime >= endSec) {
        audio.currentTime = startSec;
      }
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio._onTimeUpdate = onTimeUpdate;
  }, [src, startSec, endSec]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      if (audioRef.current._onTimeUpdate) {
        audioRef.current.removeEventListener('timeupdate', audioRef.current._onTimeUpdate);
      }
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => {});
  }, []);

  return { play, stop, pause, resume };
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Home() {
  // 'main' | 'happy' | 'sad'
  const [scene, setScene] = useState('main');
  const [noCount, setNoCount]   = useState(0);
  const [yesScale, setYesScale] = useState(1);
  const [noScale, setNoScale]   = useState(1);
  const [noMsg, setNoMsg]       = useState('');
  const [happyParticles, setHappyParticles] = useState([]);
  const [sadParticles, setSadParticles]     = useState([]);
  const [videoSrc, setVideoSrc]             = useState(null); // null = closed

  // Audio
  const happyAudio = useSegmentAudio('/semenjak-ada-dirimu.mp3', 30, 60);
  const sadAudio   = useSegmentAudio('/gurun-hujan.mp3', 52, 83);

  // Pause music when video opens, resume when video closes
  useEffect(() => {
    const audio = scene === 'happy' ? happyAudio : scene === 'sad' ? sadAudio : null;
    if (!audio) return;
    if (videoSrc) {
      audio.pause();
    } else {
      audio.resume();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoSrc]);

  // Generate particle arrays once
  useEffect(() => {
    setHappyParticles(
      HAPPY_FLOATERS.map((e, i) => ({
        emoji: e,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1.2 + Math.random() * 1.5,
        dur: 4 + Math.random() * 5,
        delay: Math.random() * 3,
        id: i,
      }))
    );
    setSadParticles(
      SAD_FLOATERS.map((e, i) => ({
        emoji: e,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1.2 + Math.random() * 1.2,
        dur: 5 + Math.random() * 4,
        delay: Math.random() * 2,
        id: i,
      }))
    );
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleYes = () => {
    happyAudio.play();
    setScene('happy');
  };

  const handleNo = () => {
    const next = noCount + 1;
    setNoCount(next);

    // Message cycling
    const msgIdx = Math.min(next - 1, NO_MESSAGES.length - 1);
    setNoMsg(NO_MESSAGES[msgIdx]);

    // YES grows slightly, NO shrinks — kept natural
    if (next < 4) {
      setYesScale(prev => Math.min(prev + 0.18, 1.55));
      setNoScale(prev => Math.max(prev - 0.20, 0.30));
    }

    // After 4th No → sad scene
    if (next >= 4) {
      happyAudio.stop();
      sadAudio.play();
      setScene('sad');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.root}>

      {/* ── Ambient floating decorations (always visible in main) ── */}
      {scene === 'main' && FLOATERS.map((f, i) => (
        <span
          key={i}
          className={styles.floater}
          style={{
            left: `${f.x}%`,
            top:  `${f.y}%`,
            fontSize: `${f.size}rem`,
            animationDuration: `${f.dur}s`,
            animationDelay: `${f.delay}s`,
          }}
        >
          {f.emoji}
        </span>
      ))}

      {/* ═══════════════ HAPPY SCENE ═══════════════ */}
      {scene === 'happy' && !videoSrc && (
        <div className={styles.happyScene}>
          {happyParticles.map(p => (
            <span
              key={p.id}
              className={styles.happyParticle}
              style={{
                left: `${p.x}%`,
                top:  `${p.y}%`,
                fontSize: `${p.size}rem`,
                animationDuration: `${p.dur}s`,
                animationDelay: `${p.delay}s`,
              }}
            >
              {p.emoji}
            </span>
          ))}

          <div className={styles.happyCard}>
            <div className={styles.happyCat}>🐱</div>
            <h1 className={styles.happyTitle}>Thank you so much Yola!</h1>
            <p className={styles.happySub}>Makasih udah maafin, janji gak bakal ku ulang :)</p>
            <div className={styles.heartRow}>
              {['🌸', '✨', '🌷', '🌺', '🌼'].map((h, i) => (
                <span key={i} className={styles.heartBounce} style={{ animationDelay: `${i * 0.15}s` }}>{h}</span>
              ))}
            </div>
            <div className={styles.flowerRow}>🌸🌺🌷🌼🌸🌺🌷🌼🌸</div>
            <a
              id="watch-yes-video-button"
              className={styles.videoBtn}
              href="/video-yes.mp4"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}
            >
              🎥 Video maaf saya kak Yol :)
            </a>
            <button
              id="back-from-happy-button"
              className={styles.backBtn}
              onClick={() => { happyAudio.stop(); setScene('main'); }}
            >
              ← Kembali
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════ SAD SCENE ═══════════════ */}
      {scene === 'sad' && !videoSrc && (
        <div className={styles.sadScene}>
          {sadParticles.map(p => (
            <span
              key={p.id}
              className={styles.sadParticle}
              style={{
                left: `${p.x}%`,
                top:  `${p.y}%`,
                fontSize: `${p.size}rem`,
                animationDuration: `${p.dur}s`,
                animationDelay: `${p.delay}s`,
              }}
            >
              {p.emoji}
            </span>
          ))}
          <div className={styles.sadCard}>
            <div className={styles.sadFace}>😢</div>
            <h1 className={styles.sadTitle}>Yola...</h1>
            <p className={styles.sadSub}>Sorry... gak sopan 😔</p>
            <p className={styles.sadNote}>I hope one day you&apos;ll forgive me</p>
            <p className={styles.sadNote}>I&apos;ll keep waiting for you... 🌧️</p>
            <a
              id="watch-no-video-button"
              className={`${styles.videoBtn} ${styles.videoBtnSad}`}
              href="/video-no.mp4"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}
            >
              🎥 Video maaf saya kak Yol :(
            </a>
            <button
              id="back-button"
              className={styles.backBtn}
              onClick={() => { sadAudio.stop(); setScene('main'); setNoCount(0); setYesScale(1); setNoScale(1); setNoMsg(''); }}
            >
              ← Kembali
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════ MAIN SCENE ═══════════════ */}
      {scene === 'main' && !videoSrc && (
        <div className={styles.mainContent}>

          {/* Cute bear / character */}
          <div className={styles.characterWrap}>
            <span className={styles.mainCharacter}>🐻</span>
            <span className={styles.charStar} style={{ top: '-10px', right: '-5px' }}>✨</span>
            <span className={styles.charStar} style={{ bottom: '5px', left: '-10px', animationDelay: '0.7s' }}>💫</span>
          </div>

          {/* Apology card */}
          <div className={styles.card}>
            <div className={styles.cardTopDeco}>🌸 ✨ 🌸</div>

            <h1 className={styles.title}>
              Sorry yah Yola
            </h1>
            <p className={styles.subtitle}>please forgive me</p>

            <div className={styles.catRow}>
              <span className={styles.catEmoji}>🐱</span>
              <span className={styles.heartPulse}>🌸</span>
              <span className={styles.catEmoji} style={{ transform: 'scaleX(-1)' }}>🐱</span>
            </div>

            {/* No message hint */}
            {noMsg && (
              <p className={styles.noMsg}>{noMsg}</p>
            )}

            {/* Buttons */}
            <div className={styles.btnRow}>
              <button
                id="yes-button"
                className={styles.yesBtn}
                style={{ transform: `scale(${yesScale})`, transformOrigin: 'center' }}
                onClick={handleYes}
              >
                💖 Yes!
              </button>

              <button
                id="no-button"
                className={styles.noBtn}
                style={{ transform: `scale(${noScale})`, transformOrigin: 'center' }}
                onClick={handleNo}
              >
                No 😔
              </button>
            </div>

            <div className={styles.cardBotDeco}>🌷 🌼 🌷</div>
          </div>

          {/* Small cute emojis floating near card */}
          <div className={styles.sideHearts}>
            {['🌸','✨','🌷'].map((h, i) => (
              <span
                key={i}
                className={styles.sideHeart}
                style={{ animationDelay: `${i * 0.8}s` }}
              >{h}</span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
