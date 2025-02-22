import { useState, useEffect } from 'react';

import { Board_Journey } from '@/Components/Board_Journey';
import { PageCountDown } from '@/Components/PageCountDown';

export default function BoardContainer_Journey({ auth }) {
    const [showCountdown, setShowCountdown] = useState(true);
    const [categoryTitle, setCategoryTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [existingJam, setExistingJam] = useState(null);

    useEffect(() => {
        setCategoryTitle(localStorage.getItem("category") || "Default Title");

        const storedJam = localStorage.getItem("existingJam");
        if (storedJam) {
            const parsedJam = JSON.parse(storedJam);
            setExistingJam(parsedJam);
            updateAnswers(parsedJam);
            if (parsedJam.status === "disconnected") {
                window.location.href = '/math-journey';
            }
        }
    }, []);

    useEffect(() => {
        if (existingJam?.math_jam_id) {
            fetchOrderedQuestions(existingJam.math_jam_id);
        }
    }, [existingJam]);

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

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const handleDisconnect = async (retryCount = 0) => {
        const existingJam = localStorage.getItem('existingJam');

        if (!existingJam) return;

        const parsedJam = JSON.parse(existingJam);
        if (!parsedJam || !parsedJam.math_jam_id) return;

        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
        if (!baseUrl) return;

        const apiUrl = `${baseUrl}/math-journey/disconnect_jam`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
                body: JSON.stringify({
                    math_jam_id: parsedJam.math_jam_id,
                }),
            });

            if (!response.ok) {
                console.error(`Failed to disconnect: ${response.status}`);
                return;
            }

            const data = await response.json();

            if (data?.jam) {
                localStorage.setItem('existingJam', JSON.stringify(data.jam));

                // **Verify if localStorage is set correctly**
                const storedData = localStorage.getItem('existingJam');
                if (storedData) {
                    console.log('Updated existingJam in localStorage:', data.jam);
                    return; // **Success, stop retrying**
                }
            } else {
                console.warn('No valid jam data in response');
                localStorage.removeItem('existingJam');
            }

            throw new Error('localStorage not updated, retrying...');
        } catch (err) {
            console.error('Error during disconnect:', err);

            if (retryCount < 5) { // **Retry up to 5 times**
                const delay = Math.pow(2, retryCount) * 1000; // **Exponential backoff**
                console.log(`Retrying in ${delay / 1000} seconds...`);
                setTimeout(() => handleDisconnect(retryCount + 1), delay);
            } else {
                console.error('Max retries reached, failed to update localStorage.');
            }
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

                if (formattedQuestions.length > 0) {
                    updateCurrentQuestionId(formattedQuestions[0].question_data.id);
                }
            } else {
                fetchNewQuestions();
            }
        } catch (error) {
            console.error("Error fetching ordered questions:", error);
        }
    };

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

                if (shuffledData.length > 0) {
                    updateCurrentQuestionId(shuffledData[0].question_data.id);
                }
            })
            .catch((error) => {
                console.error('Error fetching questions:', error);
            });
    };

    const saveOrderedQuestions = async (questions) => {
        const orderedQuestions = questions.map((question, index) => ({
            math_jam_id: existingJam?.math_jam_id,
            question_id: question.question_data.id,
            order_number: index + 1,
        }));

        try {
            const response = await fetch('/save_ordered_questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ questions: orderedQuestions }),
            });

            const data = await response.json();
            console.log('Response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to save ordered questions');
            }

            console.log('Ordered questions saved successfully');
        } catch (error) {
            console.error('Error saving ordered questions:', error);
        }
    };

    const updateCurrentQuestionId = async (questionId) => {
        if (!existingJam || !existingJam.math_jam_id) return;

        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
        if (!baseUrl) return;

        try {
            const response = await fetch(`${baseUrl}/math-journey/update_current_question`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}',
                },
                body: JSON.stringify({
                    math_jam_id: existingJam.math_jam_id,
                    current_question_id: questionId,
                }),
            });

            const data = await response.json();
            console.log('Updated current_question_id:', data);
        } catch (error) {
            console.error('Error updating current_question_id:', error);
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
