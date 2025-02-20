import { useState, useEffect } from 'react';

import { Board_Journey } from '@/Components/Board_Journey';
import { PageCountDown } from '@/Components/PageCountDown';

export default function BoardContainer_Journey({ auth }) {
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
        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
        
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
            handleDisconnect();
            window.location.href = `${baseUrl}/math-journey`;
        };

        const offlineHandler = () => {
            handleDisconnect();
            Swal.fire({
                icon: 'error',
                title: 'Connection Lost',
                text: 'You have been disconnected due to a lost internet connection.',
                confirmButtonColor: '#d33',
                allowOutsideClick: false,
            }).then(() => {
                window.location.href = `${baseUrl}/math-journey`;
            });
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

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const handleDisconnect = async () => {
        const existingJam = JSON.parse(localStorage.getItem('existingJam'));

        if (!existingJam || !existingJam.math_jam_id) return;

        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
        if (!baseUrl) return;

        const apiUrl = `${baseUrl}/math-journey/disconnect_jam`;

        try {
            await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}',
                },
                body: JSON.stringify({
                    math_jam_id: existingJam.math_jam_id,
                }),
            });
        } catch (err) {
            console.error('Error during disconnect:', err);
        }
    };

    useEffect(() => {
        setCategoryTitle(localStorage.getItem('category') || 'Default Title');

        if (existingJam?.math_jam_id) {
            fetch(`/get_ordered_questions?math_jam_id=${existingJam.math_jam_id}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.length > 0) {
                        setQuestions(data.map((item) => ({
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
                        })));
                    } else {
                        fetchNewQuestions();
                    }
                })
                .catch((error) => console.error('Error fetching ordered questions:', error));
        }
    }, [existingJam]);

    const fetchNewQuestions = () => {
        fetch(`/questions_list_teacher?categoryTitle=${categoryTitle}&num_questions=${existingJam.num_questions}`)
            .then((response) => response.json())
            .then((data) => {
                const formattedData = data.map((question) => ({
                    title: `${question.category} Challenge`,
                    time: existingJam.time_limit,
                    question_data: {
                        id: question.id,
                        type: question.question_type || 'addition',
                        image: null,
                        title: 'Solve This',
                        question: question.question,
                    },
                    answers: question.choices.map((choice, index) => ({
                        id: index + 1,
                        answer: choice,
                        is_correct: choice === question.correct_answer,
                    })),
                }));

                const shuffledData = shuffleArray(formattedData);
                saveOrderedQuestions(shuffledData);
                setQuestions(shuffledData);
            })
            .catch((error) => {
                console.error('Error fetching questions:', error);
            });
    };

    const handleCountdownComplete = () => {
        setShowCountdown(false);
    };

    return (
        <div className="overflow-hidden h-dvh lg:p-3 p-2 bg-gradient-to-br from-teal-400 to-yellow-200 box-border">
            {showCountdown ? <PageCountDown onComplete={handleCountdownComplete} /> : <Board_Journey data={questions} />}
        </div>
    );
}
