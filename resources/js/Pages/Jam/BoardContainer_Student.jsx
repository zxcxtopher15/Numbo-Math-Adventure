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
    const [participant, setParticipant] = useState([]);

    useEffect(() => {
        const storedJam = localStorage.getItem('existingJam');
        if (storedJam) {
            const parsedJam = JSON.parse(storedJam);
            setExistingJam(parsedJam);
        }
    }, []);

    useEffect(() => {
        const storedJam = localStorage.getItem('disconnectedParticipant');
        if (storedJam) {
            const parsedJam = JSON.parse(storedJam);
            setParticipant(parsedJam);

            if (parsedJam.status == 'disconnected') {
                localStorage.removeItem('disconnectedParticipant');
                window.location.href = "/math-journey-join";
            }
        }
    }, []);

    console.log(participant);

    useEffect(() => {
        const beforeUnloadHandler = (event) => {
            handleDisconnect();
        };

        const offlineHandler = () => {
            handleDisconnect();
        };

        window.addEventListener('offline', offlineHandler);
        window.addEventListener('beforeunload', beforeUnloadHandler);

        return () => {
            window.removeEventListener('beforeunload', beforeUnloadHandler);
            window.removeEventListener('offline', offlineHandler);
        };
    }, [existingJam, studentId]);

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

        document.addEventListener('contextmenu', disableRightClick);
        window.addEventListener('keydown', disableReload);

        return () => {
            document.removeEventListener('contextmenu', disableRightClick);
            window.removeEventListener('keydown', disableReload);
        };
    }, []);

    const handleDisconnect = async (retryCount = 0) => {
        if (!studentId || !existingJam) return;

        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
        if (!baseUrl) return;

        const apiUrl = `${baseUrl}/math-journey/disconnect`;

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

            const result = await response.json();

            if (result.participant) {
                localStorage.setItem('disconnectedParticipant', JSON.stringify(result.participant));

                // Verify if data is stored correctly
                const storedData = localStorage.getItem('disconnectedParticipant');
                if (storedData) {
                    console.log('Participant data saved to localStorage:', result.participant);
                    console.log(result.message);
                    return;
                }
            }

            throw new Error('localStorage not set, retrying...');
        } catch (err) {
            console.error('Error during disconnect:', err);

            if (retryCount < 5) {  // Retry up to 5 times
                const delay = Math.pow(2, retryCount) * 1000;  // Exponential backoff
                console.log(`Retrying in ${delay / 1000} seconds...`);
                setTimeout(() => handleDisconnect(retryCount + 1), delay);
            } else {
                console.error('Max retries reached, failed to save data to localStorage.');
            }
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
