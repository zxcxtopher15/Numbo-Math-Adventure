import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
const LoadingScreen = () => {
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [fastLoad, setFastLoad] = useState(false);

  useEffect(() => {
    const start = () => {
      setLoading(true);
      setShowLoader(true);
      setFastLoad(false);
    };

    const finish = () => {
      setTimeout(() => {
        setLoading(false);
      }, 500); // Minimum 2-second delay

      if (fastLoad) {
        setTimeout(() => {
          setShowLoader(false);
        }, 500); // Slight delay for smooth transition
      } else {
        setTimeout(() => {
          setShowLoader(false);
        }, 1500); // Slight delay for smooth transition
      }
    };

    router.on('start', start);
    router.on('finish', finish);
    router.on('error', finish);

    return () => {
      router.off('start', start);
      router.off('finish', finish);
      router.off('error', finish);
    };
  }, [fastLoad]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (loading && showLoader) {
        setFastLoad(performance.now() - startTime < 2000);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [loading, showLoader]);

  if (!showLoader) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-white z-50 transition-opacity duration-1500 ${loading ? 'opacity-100' : 'opacity-0'}`}
    >
      <ApplicationLogo className="h-20 w-20 fill-current text-gray-500 animate-pulse" />
    </div>
  );
};

export default LoadingScreen;
