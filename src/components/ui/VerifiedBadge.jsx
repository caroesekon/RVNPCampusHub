const VerifiedBadge = ({ size = 16 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className="shrink-0 inline-block"
    >
      <defs>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#1D9BF0', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#0A66C2', stopOpacity: 1 }} />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.2" />
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <path
          fill="url(#blueGradient)"
          d="M12 0.8l2.6 2 3.3-.4 1.3 3.1 3 1.5-.6 3.3 1.9 2.7-1.9 2.7.6 3.3-3 1.5-1.3 3.1-3.3-.4-2.6 2-2.6-2-3.3.4-1.3-3.1-3-1.5.6-3.3L.5 10l1.9-2.7-.6-3.3 3-1.5L6.1 0l3.3.4L12 0.8z"
        />
        <path
          d="M7.6 12.2l2.3 2.3 4.5-4.5"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

export default VerifiedBadge;