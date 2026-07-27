export const VerifiedBadge = ({ size = 10 }) => (
  <span className="inline-flex items-center justify-center flex-shrink-0 ml-0.5" title="HDM Verified">
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="10" fill="#3B82F6" stroke="#2563EB" strokeWidth="0.5"/>
      <circle cx="11" cy="11" r="10" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="3 2"/>
      <path d="M7 11L10 13L15 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </span>
);