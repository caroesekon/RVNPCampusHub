import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout.jsx';
import Button from '../components/ui/Button.jsx';
import { IoHome, IoArrowBack } from 'react-icons/io5';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-7xl font-heading font-bold text-text-primary">404</h1>
        <h2 className="text-2xl font-heading font-semibold text-text-primary mt-4">
          Page Not Found
        </h2>
        <p className="text-text-secondary mt-2 text-center max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <IoArrowBack className="inline mr-1" size={16} />
            Go Back
          </Button>
          <Button onClick={() => navigate('/feed')}>
            <IoHome className="inline mr-1" size={16} />
            Home
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;