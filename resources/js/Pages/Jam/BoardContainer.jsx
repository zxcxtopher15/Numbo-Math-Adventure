import { useState } from 'react';

import { Board } from '@/Components/Board'; // Ensure this path is correct
import { PageCountDown } from '@/Components/PageCountDown';

const data = [];

export default function BoardContainer({ auth }) {
    const [showCountdown, setShowCountdown] = useState(true);

    const handleCountdownComplete = () => {
        setShowCountdown(false);
    };

    return (
        <>
            <div className="overflow-hidden h-dvh lg:p-3 p-2 bg-gradient-to-br from-teal-400 to-yellow-200 box-border">
                {!showCountdown ? <PageCountDown onComplete={handleCountdownComplete} /> : <Board data={data} />}
            </div>
        </>
    );
}
