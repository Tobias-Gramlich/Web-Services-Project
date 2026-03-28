import { useEffect, useRef } from 'react';

const CARD_COLORS = {
  '-2': { bg: '#1D9E75', color: '#fff', border: '#0F6E56' },
  '0':  { bg: '#3a7bc8', color: '#fff', border: '#185FA5' },
  '1':  { bg: '#4fa8b0', color: '#fff', border: '#2d7d88' },
  '3':  { bg: '#5ba05b', color: '#fff', border: '#3a6e3a' },
  '5':  { bg: '#f5c542', color: '#1a1a1a', border: '#d4a00e' },
  '7':  { bg: '#d07a3e', color: '#fff', border: '#8a4e1f' },
  '8':  { bg: '#c47b27', color: '#fff', border: '#8a5213' },
  '10': { bg: '#e05c5c', color: '#fff', border: '#a32d2d' },
  '12': { bg: '#c0392b', color: '#fff', border: '#8e1a12' },
};

const INITIAL_CARDS = [
  // [value | null (face-down), row, col, rotationDeg]
  ['-2', 0, 0, -6],
  [null, 0, 1, -2],
  [null, 0, 2,  3],
  ['10', 0, 3,  5],
  ['5',  1, 0, -4],
  [null, 1, 1,  1],
  ['7',  1, 2, -3],
  [null, 1, 3,  2],
];

const FLIP_SEQUENCE = ['1', '0', '12', '-2'];

export function SkyjoHero({ colorScheme }) {
  const {
    background = '#0d1f2d',
    surface    = '#1e3a4f',
    primary    = '#1D9E75',
    secondary  = '#f5c542',
  } = colorScheme ?? {};

  const flipIdx = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const backEls = Array.from(document.querySelectorAll('.sjh-card-back'));

    const flip = () => {
      if (backEls.length === 0) return;
      const target = backEls[flipIdx.current % backEls.length];
      const val = FLIP_SEQUENCE[flipIdx.current % FLIP_SEQUENCE.length];
      const c = CARD_COLORS[val];

      target.style.background = c.bg;
      target.style.borderColor = c.border;
      target.style.color = c.color;
      target.textContent = val;
      target.classList.remove('sjh-card-back');
      target.classList.add('sjh-card-flipped');

      setTimeout(() => {
        target.style.background = surface;
        target.style.borderColor = `${primary}33`;
        target.style.color = 'transparent';
        target.textContent = '';
        target.classList.add('sjh-card-back');
        target.classList.remove('sjh-card-flipped');
      }, 2200);

      flipIdx.current++;
    };

    intervalRef.current = setInterval(flip, 1800);
    return () => clearInterval(intervalRef.current);
  }, [surface, primary]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: 380,
      background,
      borderRadius: 20,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1rem 2rem',
      boxSizing: 'border-box',
    }}>

      {/* Glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 60% 50% at 50% 60%, ${primary}1a, transparent 70%)`,
      }} />

      {/* Stars */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 25% 70%, rgba(255,255,255,0.3) 0%, transparent 100%),
          radial-gradient(1px 1px at 40% 15%, rgba(255,255,255,0.6) 0%, transparent 100%),
          radial-gradient(1px 1px at 55% 55%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 70% 30%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 85% 80%, rgba(255,255,255,0.3) 0%, transparent 100%),
          radial-gradient(1px 1px at 92% 45%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at  7% 88%, rgba(255,255,255,0.4) 0%, transparent 100%)
        `,
      }} />

      {/* Subtitle */}
      <p style={{
        fontSize: 12,
        color: `${primary}cc`,
        letterSpacing: '3px',
        textTransform: 'uppercase',
        margin: '0 0 1.4rem',
      }}>
        Das Kartenspiel
      </p>

      {/* Card grid */}
      <div style={{ position: 'relative', width: 310, height: 175, marginBottom: '1.5rem' }}>

        {INITIAL_CARDS.map(([val, row, col, rot], i) => {
          const c = val ? CARD_COLORS[val] : null;
          return (
            <div
              key={i}
              className={val ? 'sjh-card' : 'sjh-card sjh-card-back'}
              style={{
                position: 'absolute',
                left: col * 74,
                top: row * 88,
                width: 64,
                height: 88,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Georgia, serif',
                fontSize: 22,
                fontWeight: 700,
                cursor: 'pointer',
                transform: `rotate(${rot}deg)`,
                zIndex: val ? 2 : 1,
                boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                background: c ? c.bg : surface,
                border: `2px solid ${c ? c.border : primary + '33'}`,
                color: c ? c.color : 'transparent',
                userSelect: 'none',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = `rotate(${rot}deg) translateY(-6px) scale(1.06)`;
                e.currentTarget.style.zIndex = 20;
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.6)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = `rotate(${rot}deg)`;
                e.currentTarget.style.zIndex = val ? 2 : 1;
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.5)';
              }}
            >
              {val ?? ''}
            </div>
          );
        })}

        {/* Discard pile */}
        {[
          { val: '8', rot: 20, zIndex: 3, opacity: 0.7, bottom: 0,  right: -8  },
          { val: '3', rot: 15, zIndex: 4, opacity: 0.9, bottom: 2,  right: -14 },
        ].map(({ val, rot, zIndex, opacity, bottom, right }) => {
          const c = CARD_COLORS[val];
          return (
            <div key={val} style={{
              position: 'absolute', right, bottom,
              width: 64, height: 88, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700,
              background: c.bg, border: `2px solid ${c.border}`, color: c.color,
              transform: `rotate(${rot}deg)`, zIndex, opacity,
              boxShadow: '0 6px 18px rgba(0,0,0,0.6)',
            }}>
              {val}
            </div>
          );
        })}
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: 'Georgia, serif',
        fontSize: 44,
        fontWeight: 700,
        margin: '0 0 4px',
        letterSpacing: -1,
        color: '#fff',
      }}>
        Sky<span style={{ color: primary }}>jo</span>
      </h1>

      <style>{`
        .sjh-card-flipped {
          animation: sjh-flip-in 0.45s ease both;
        }
        @keyframes sjh-flip-in {
          0%   { transform: rotateY(90deg) scale(0.85); opacity: 0; }
          100% { transform: rotateY(0deg)  scale(1);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}