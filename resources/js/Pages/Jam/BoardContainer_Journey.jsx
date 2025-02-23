import { useState, useEffect } from 'react';

import { Board_Journey } from '@/Components/Board_Journey';
import { PageCountDown } from '@/Components/PageCountDown';

export default function BoardContainer_Journey({ auth }) {
    const [showCountdown, setShowCountdown] = useState(true);
    const [categoryTitle, setCategoryTitle] = useState('');
    const [existingJam, setExistingJam] = useState(null);
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        setCategoryTitle(localStorage.getItem("category") || "Default Title");

        const storedJam = localStorage.getItem("existingJam");
        if (storedJam) {
            const parsedJam = JSON.parse(storedJam);
            setExistingJam(parsedJam);
            updateAnswers(parsedJam);
        }
    }, []);

    useEffect(() => {
        const checkDisconnectedHost = () => {
            const storedJam = localStorage.getItem('disconnectedHost');
            if (storedJam) {
                const parsedJam = JSON.parse(storedJam);
                if (parsedJam.status === 'disconnected') {
                    localStorage.removeItem('disconnectedHost');
                    window.location.replace("/math-journey");
                }
            }
        };

        checkDisconnectedHost();

        const interval = setInterval(checkDisconnectedHost, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (existingJam?.math_jam_id) {
            fetchOrderedQuestions(existingJam.math_jam_id);
        }
    }, [existingJam]);

    const fetchOrderedQuestions = async (mathJamId) => {
        try {
            const response = await fetch(`/get_ordered_questions?math_jam_id=${mathJamId}`);
            const data = await response.json();

            if (data.length > 0) {
                const formattedQuestions = data.map((item) => ({
                    title: `${item.question.category} Challenge`,
                    time: existingJam?.time_limit,
                    question_data: {
                        id: item.question.id,
                        type: item.question.question_type || "addition",
                        image: null,
                        title: "Solve This",
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
        } catch (error) {
            console.error("Error fetching ordered questions:", error);
        }
    };

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
        const existingJam = localStorage.getItem('existingJam');

        if (!existingJam) return;

        const parsedJam = JSON.parse(existingJam);
        if (!parsedJam || !parsedJam.math_jam_id) return;

        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
        if (!baseUrl) return;

        const apiUrl = `${baseUrl}/math-journey/disconnect_jam`;

        const payload = JSON.stringify({
            math_jam_id: existingJam.math_jam_id,
        });

        try {
            const blob = new Blob([payload], { type: "application/json" });
            navigator.sendBeacon(apiUrl, blob);

            localStorage.setItem('disconnectedHost', JSON.stringify({ status: "disconnected" }));
            console.log("disconnectedHost stored in localStorage:", payload);

        } catch (err) {
            console.error('Error during disconnect:', err);
        }
    };

    const updateAnswers = async (jam) => {
        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute("content");
        const apiUrl1 = `${baseUrl}/math-journey/update_answers`;

        try {
            const response = await axios.post(apiUrl1, {
                math_jam_code: jam.math_jam_code,
                has_answer: 0,
            }, {
                headers: {
                    "Content-Type": "application/json",
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
            });

            console.log("Has Answer updated:", response.data);
        } catch (err) {
            console.error("Error during update:", err.response?.data || err.message);
        }
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
