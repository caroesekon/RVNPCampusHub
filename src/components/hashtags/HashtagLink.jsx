import { useNavigate } from 'react-router-dom';

const HashtagLink = ({ tag }) => {
  const navigate = useNavigate();

  const cleanTag = tag.replace('#', '');

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/hashtags/${cleanTag}`);
      }}
      className="text-rvnp-green cursor-pointer hover:underline font-medium"
    >
      #{cleanTag}
    </span>
  );
};

export default HashtagLink;