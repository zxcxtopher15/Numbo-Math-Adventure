import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Board_Student } from '@/Components/Board_Student';
import { PageCountDown } from '@/Components/PageCountDown';

export default function BoardContainer_Student({ }) {
    const [showCountdown, setShowCountdown] = useState(true);
    const [categoryTitle, setCategoryTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [existingJam, setExistingJam] = useState(null);
    const { auth } = usePage().props;
    const studentId = auth?.user.id;

    useEffect(() => {
        const storedJam = localStorage.getItem('existingJam');
        if (storedJam) {
            const parsedJam = JSON.parse(storedJam);
            setExistingJam(parsedJam);
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
            handleDisconnect();
        };

        const offlineHandler = () => {
            handleDisconnect();
            Swal.fire({
                icon: 'error',
                title: 'Connection Lost',
                text: 'You have been disconnected due to a lost internet connection.',
                confirmButtonColor: '#d33',
                allowOutsideClick: false,
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

    const handleDisconnect = async () => {
        if (!studentId || !existingJam) return;

        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
        if (!baseUrl) return;

        const apiUrl = `${baseUrl}/math-journey/disconnect`;

        try {
            await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}',
                },
                body: JSON.stringify({
                    student_id: studentId,
                    math_jam_code: existingJam.math_jam_code,
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
                        handleReconnect();
                    }
                })
                .catch((error) => console.error('Error fetching ordered questions:', error));
        }
    }, [existingJam]);

    const handleReconnect = async () => {
        if (!studentId || !existingJam) {
            return;
        }

        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
        if (!baseUrl) {
            return;
        }

        const apiUrl = `${baseUrl}/math-journey/reconnect`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}',
                },
                body: JSON.stringify({
                    student_id: studentId,
                    math_jam_code: existingJam.math_jam_code,
                }),
            });

            const data = await response.json();
            setExistingJam(JSON.parse(data.jam));

            if (data) {
                console.log("success");
            }
        } catch (err) {
            console.error('Error reconnecting:', err);
        } finally {
        }
    };

    const handleCountdownComplete = () => {
        setShowCountdown(false);
    };

    return (
        <div className="overflow-hidden h-dvh lg:p-3 p-2 bg-gradient-to-br from-teal-400 to-yellow-200 box-border">
            {showCountdown ? <PageCountDown onComplete={handleCountdownComplete} /> : <Board_Student data={questions} />}
        </div>
    );
}
