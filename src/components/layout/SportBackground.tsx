export default function SportBackground() {
  return (
    <div className="sport-bg" aria-hidden="true">
      <svg width="100%" height="100%" viewBox="0 0 1400 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{ color: '#4a7c8e' }}>

        {/* ─── PALLONE DA CALCIO (sinistra alto) ─── */}
        <circle cx="130" cy="160" r="100" fill="none" stroke="currentColor" strokeWidth="3.5"/>
        {/* Pentagoni stilizzati */}
        <circle cx="130" cy="160" r="32" fill="currentColor" opacity="0.45"/>
        <line x1="130" y1="60" x2="130" y2="128" stroke="currentColor" strokeWidth="3"/>
        <line x1="130" y1="192" x2="130" y2="260" stroke="currentColor" strokeWidth="3"/>
        <line x1="30" y1="160" x2="98" y2="160" stroke="currentColor" strokeWidth="3"/>
        <line x1="162" y1="160" x2="230" y2="160" stroke="currentColor" strokeWidth="3"/>
        <line x1="60" y1="90" x2="108" y2="130" stroke="currentColor" strokeWidth="2.5"/>
        <line x1="152" y1="190" x2="200" y2="230" stroke="currentColor" strokeWidth="2.5"/>
        <line x1="60" y1="230" x2="108" y2="190" stroke="currentColor" strokeWidth="2.5"/>
        <line x1="152" y1="130" x2="200" y2="90" stroke="currentColor" strokeWidth="2.5"/>

        {/* ─── PALLONE PALLAVOLO (destra alto) ─── */}
        <circle cx="1260" cy="140" r="90" fill="none" stroke="currentColor" strokeWidth="3.5"/>
        <path d="M1260 50 Q1310 95 1260 140 Q1210 95 1260 50" fill="none" stroke="currentColor" strokeWidth="3"/>
        <path d="M1175 100 Q1217 140 1260 140 Q1245 185 1175 178" fill="none" stroke="currentColor" strokeWidth="3"/>
        <path d="M1345 100 Q1303 140 1260 140 Q1275 185 1345 178" fill="none" stroke="currentColor" strokeWidth="3"/>
        <path d="M1260 230 Q1210 185 1260 140 Q1310 185 1260 230" fill="none" stroke="currentColor" strokeWidth="2.5"/>

        {/* ─── PALLONE BASKET (centro basso) ─── */}
        <circle cx="700" cy="760" r="95" fill="none" stroke="currentColor" strokeWidth="3.5"/>
        <path d="M605 760 Q700 690 795 760" fill="none" stroke="currentColor" strokeWidth="3"/>
        <path d="M605 760 Q700 830 795 760" fill="none" stroke="currentColor" strokeWidth="3"/>
        <line x1="700" y1="665" x2="700" y2="855" stroke="currentColor" strokeWidth="3"/>
        <path d="M640 685 Q660 720 660 760 Q660 800 640 835" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
        <path d="M760 685 Q740 720 740 760 Q740 800 760 835" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6"/>

        {/* ─── CAMPO DI CALCIO (centro) ─── */}
        <rect x="300" y="280" width="800" height="500" fill="none" stroke="currentColor" strokeWidth="2.5" rx="6"/>
        {/* Linea di metà campo */}
        <line x1="300" y1="530" x2="1100" y2="530" stroke="currentColor" strokeWidth="2.5"/>
        {/* Cerchio centrale */}
        <circle cx="700" cy="530" r="80" fill="none" stroke="currentColor" strokeWidth="2.5"/>
        <circle cx="700" cy="530" r="5" fill="currentColor" opacity="0.5"/>
        {/* Area di rigore sinistra */}
        <rect x="300" y="415" width="130" height="230" fill="none" stroke="currentColor" strokeWidth="2"/>
        <rect x="300" y="460" width="58" height="140" fill="none" stroke="currentColor" strokeWidth="2"/>
        {/* Area di rigore destra */}
        <rect x="970" y="415" width="130" height="230" fill="none" stroke="currentColor" strokeWidth="2"/>
        <rect x="1042" y="460" width="58" height="140" fill="none" stroke="currentColor" strokeWidth="2"/>
        {/* Semicerchi area */}
        <path d="M430 480 Q480 530 430 580" fill="none" stroke="currentColor" strokeWidth="2"/>
        <path d="M970 480 Q920 530 970 580" fill="none" stroke="currentColor" strokeWidth="2"/>
        {/* Angoli */}
        <path d="M300 280 Q316 280 316 296" fill="none" stroke="currentColor" strokeWidth="2"/>
        <path d="M1100 280 Q1084 280 1084 296" fill="none" stroke="currentColor" strokeWidth="2"/>
        <path d="M300 780 Q316 780 316 764" fill="none" stroke="currentColor" strokeWidth="2"/>
        <path d="M1100 780 Q1084 780 1084 764" fill="none" stroke="currentColor" strokeWidth="2"/>

        {/* ─── RETE DA PALLAVOLO (in basso a destra) ─── */}
        <line x1="950" y1="820" x2="1380" y2="820" stroke="currentColor" strokeWidth="3"/>
        <line x1="950" y1="780" x2="1380" y2="780" stroke="currentColor" strokeWidth="2"/>
        {/* Pali */}
        <line x1="950" y1="770" x2="950" y2="870" stroke="currentColor" strokeWidth="3"/>
        <line x1="1380" y1="770" x2="1380" y2="870" stroke="currentColor" strokeWidth="3"/>
        {/* Maglie rete */}
        {[970,1010,1050,1090,1130,1170,1210,1250,1290,1330,1370].map(x => (
          <line key={x} x1={x} y1="780" x2={x} y2="870" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
        ))}
        {[800,820,840,860].map(y => (
          <line key={y} x1="950" y1={y} x2="1380" y2={y} stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        ))}

        {/* ─── CANESTRO BASKET (sinistra basso) ─── */}
        <rect x="20" y="680" width="5" height="160" fill="currentColor" opacity="0.5"/>
        <rect x="25" y="680" width="80" height="5" fill="currentColor" opacity="0.5"/>
        <ellipse cx="105" cy="700" rx="28" ry="8" fill="none" stroke="currentColor" strokeWidth="3"/>
        {/* Rete canestro */}
        <path d="M77 700 Q82 720 92 730 Q100 740 92 750" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.7"/>
        <path d="M133 700 Q128 720 118 730 Q110 740 118 750" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.7"/>
        <path d="M92 750 Q105 760 118 750" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.7"/>

        {/* ─── PICCOLO PALLONE IN ALTO AL CENTRO ─── */}
        <circle cx="700" cy="60" r="45" fill="none" stroke="currentColor" strokeWidth="2.5"/>
        <path d="M700 15 Q720 38 700 60 Q680 38 700 15" fill="none" stroke="currentColor" strokeWidth="2"/>
        <path d="M655 40 Q678 60 700 60 Q690 80 655 78" fill="none" stroke="currentColor" strokeWidth="2"/>
        <path d="M745 40 Q722 60 700 60 Q710 80 745 78" fill="none" stroke="currentColor" strokeWidth="2"/>
      </svg>
    </div>
  )
}
