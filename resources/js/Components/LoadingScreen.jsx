import { useEffect, useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';

const LoadingScreen = ({ time = 1500, text }) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, time); // Simulates a loading time based on the provided prop

        return () => clearTimeout(timer);
    }, [time]);

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-white z-50"
            style={{
                opacity: loading ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out',
            }}
        >
            <span className="flex flex-col items-center space-y-4">
                <ApplicationLogo className="h-20 w-20 fill-current text-gray-500 animate-pulse" />
                <h4 className="text-xl font-bold text-primary animate-pulse">{text || 'Loading...'}</h4>
            </span>
        </div>
    );
};

export default LoadingScreen;
