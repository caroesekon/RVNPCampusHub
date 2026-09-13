const VerifiedBadge = ({ size = 16 }) => {
  const uniqueId = `verified-${size}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className="shrink-0 inline-block"
      style={{ shapeRendering: 'geometricPrecision' }}
    >
      <defs>
        <linearGradient id={uniqueId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1D9BF0" />
          <stop offset="100%" stopColor="#0A66C2" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${uniqueId})`}
        d="M50 2
           L56 6 L63 4 L68 9 L75 8 L78 14 L85 15 L86 22 L92 25
           L91 32 L96 37 L92 43 L95 49 L91 55 L94 61 L88 66 L89 73
           L82 76 L81 83 L74 84 L71 90 L64 88 L59 93 L53 89 L47 93
           L41 88 L35 91 L31 85 L24 86 L22 79 L15 78 L14 71 L8 68
           L10 61 L5 56 L9 50 L4 44 L9 39 L7 32 L13 28 L12 21
           L19 20 L22 14 L29 16 L33 10 L40 12 L45 7 Z"
      />
      <path
        d="M30 52l14 14 26-28"
        stroke="#FFFFFF"
        strokeWidth="9"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default VerifiedBadge;