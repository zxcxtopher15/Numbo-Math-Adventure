import { useState, useEffect } from 'react';

import { Board_Student } from '@/Components/Board_Student';
import { PageCountDown } from '@/Components/PageCountDown';

export default function BoardContainer_Student({ auth }) {
    const [showCountdown, setShowCountdown] = useState(true);
    const [categoryTitle, setCategoryTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [existingJam, setExistingJam] = useState(null);

    useEffect(() => {
        const storedJam = localStorage.getItem('existingJam');
        if (storedJam) {
            const parsedJam = JSON.parse(storedJam);
            setExistingJam(parsedJam);
            if (parsedJam.status === "disconnected") {
                window.location.href = '/math-journey';
            }
        }
    }, []);

    useEffect(() => {
        const disableRightClick = (event) => {
            event.preventDefault();
        };

        const disableReload = (event) => {
            if (event.key === 'F5' || (event.ctrlKey && event.key === 'r') || (event.ctrlKey && event.key === 'R')) {
                event.preventDefault();
                Swal.fire({
                    icon: 'warning',
                    title: 'Action Blocked',
                    text: 'Page reload is disabled on this section.',
                });
            }
        };

        const beforeUnloadHandler = (event) => {
            window.location.href = "/math-journey-join";
        };

        const offlineHandler = () => {
            window.location.href = "/math-journey-join";
        };

        window.addEventListener('offline', offlineHandler);
        window.addEventListener('beforeunload', beforeUnloadHandler);
        document.addEventListener('contextmenu', disableRightClick);
        window.addEventListener('keydown', disableReload);

        return () => {
            window.removeEventListener('beforeunload', beforeUnloadHandler);
            window.removeEventListener('offline', offlineHandler);
            document.removeEventListener('contextmenu', disableRightClick);
            window.removeEventListener('keydown', disableReload);
        };
    }, []);

    // const handleDisconnect = async () => {
    //     const existingJam = localStorage.getItem('existingJam');

    //     if (!existingJam) return;

    //     const parsedJam = JSON.parse(existingJam);
    //     if (!parsedJam || !parsedJam.math_jam_id) return;

    //     const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
    //     if (!baseUrl) return;

    //     const apiUrl = `${baseUrl}/math-journey/disconnect_jam`;

    //     try {
    //         const response = await fetch(apiUrl, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
    //             },
    //             body: JSON.stringify({
    //                 math_jam_id: parsedJam.math_jam_id,
    //             }),
    //         });

    //         if (!response.ok) {
    //             console.error('Failed to disconnect:', response.status);
    //             return;
    //         }

    //         const data = await response.json();

    //         if (data?.jam) {
    //             localStorage.setItem('existingJam', JSON.stringify(data.jam));
    //         } else {
    //             console.warn('No valid jam data in response');
    //             localStorage.removeItem('existingJam');
    //         }
    //     } catch (err) {
    //         console.error('Error during disconnect:', err);
    //     }
    // };

    useEffect(() => {
        setCategoryTitle(localStorage.getItem('category') || 'Default Title');

        if (existingJam?.math_jam_id) {
            fetch(`/get_ordered_questions?math_jam_id=${existingJam.math_jam_id}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.length > 0) {
                        const formattedQuestions = data.map((item) => ({
                            title: `${item.question.category} Challenge`,
                            time: existingJam.time_limit,
                            question_data: {
                                id: item.question.id,
                                type: item.question.question_type || 'addition',
                                image: null,
                                title: 'Solve This',
                                question: item.question.question,
                            },
                            answers: item.question.choices.map((choice, index) => ({
                                id: index + 1,
                                answer: choice,
                                is_correct: choice === item.question.correct_answer,
                            })),
                        }));

                        setQuestions(formattedQuestions);
                    }
                })
                .catch((error) => console.error('Error fetching ordered questions:', error));
        }
    }, [existingJam]);

    const handleCountdownComplete = () => {
        setShowCountdown(false);
    };

    return (
        <div className="overflow-hidden h-dvh lg:p-3 p-2 bg-gradient-to-br from-teal-400 to-yellow-200 box-border">
            {showCountdown ? <PageCountDown onComplete={handleCountdownComplete} /> : <Board_Student data={questions} />}
        </div>
    );
}
