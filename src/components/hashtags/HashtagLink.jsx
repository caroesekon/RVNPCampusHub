import { useNavigate } from 'react-router-dom';

const HashtagLink = ({ tag }) => {
  const navigate = useNavigate();

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/hashtags/${tag.replace('#', '')}`);
      }}
      className="text-rvnp-green cursor-pointer hover:underline font-medium"
    >
      #{tag.replace('#', '')}
    </span>
  );
};

export default HashtagLink;