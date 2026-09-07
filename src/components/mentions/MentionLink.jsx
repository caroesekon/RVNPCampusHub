import { useNavigate } from 'react-router-dom';

const MentionLink = ({ mention }) => {
  const navigate = useNavigate();

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/profile/${mention.userId || mention.id}`);
      }}
      className="text-rvnp-green cursor-pointer hover:underline font-medium"
    >
      @{mention.fullName || mention.name}
    </span>
  );
};

export default MentionLink;