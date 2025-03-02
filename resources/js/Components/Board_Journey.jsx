import { FaPause } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { Link } from '@inertiajs/react';
import { SvgAsset } from './SvgAsset';
import Categories from './Categories';
import Swal from 'sweetalert2';
import Avatar from './Avatar';
import axios from "axios";

function RoundResult({ numQuestion, participants, onNext }) {
    return (
        <div className="w-full h-full flex flex-col lg:flex-row bg-white sm:px-6  px-2 py-5 rounded-3xl shadow-lg">
            <div className="flex flex-col w-full lg:w-[35rem] relative z-10">
                <h1 className="text-3xl font-bold text-primary mb-5">Student Scores</h1>

                {/* Scrollable List Container */}
                <div className="p-4 rounded-3xl bg-gray-200 flex-grow overflow-auto max-h-[calc(100vh-230px)]">
                    <div className="grid grid-cols-1 gap-4">
                        {[...new Map(participants.map(p => [p.id, p])).values()] // Remove duplicates
                            .slice()
                            .sort((a, b) => b.score - a.score) // Sort in descending order
                            .map((participant, index) => (
                                <div key={participant.id} className="flex items-center justify-between gap-3 text-gray-600 bg-white px-4 py-3 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium">{index + 1}.</span>
                                        <Avatar name={participant.image || participant.name} />
                                        <h3 className="font-semibold">{participant.name}</h3>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <p className="text-xs font-medium">Score</p>
                                        <h3 className="font-semibold text-warning">{participant.score} / {numQuestion}</h3>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            {/* Button Section - Prevents Overlap */}
            <div className="p-4 rounded-3xl  w-full flex items-end justify-end mt-4 lg:mt-0 relative z-0">
                <div className="lg:flex hidden justify-center items-center h-0rem w-full ">
                    <SvgAsset
                        movement="sm"
                        value="/images/assets/background/students_result.svg"
                        className=" hidden lg:block lg:absolute top-10 right-30 "
                    />
                </div>
                <button className="bg-primary relative z-2 text-white text-lg px-6 py-2 rounded-2xl font-semibold" onClick={onNext}>
                    Next
                </button>
            </div>
        </div>

    );
}

function TotalResult({ participants, numQuestion, gameTitle, category }) {
    const { width, height } = useWindowSize();
    const [existingJam, setExistingJam] = useState(null);

    useEffect(() => {
        const storedJam = localStorage.getItem('existingJam');
        if (storedJam) {
            setExistingJam(JSON.parse(storedJam));
            console.log('existingJam:', existingJam);

        }
    }, []);

    // const totalTimeInMinutes = Math.floor(totalTimeSpent / 60000);
    // const totalTimeInSeconds = Math.floor((totalTimeSpent % 60000) / 1000);

    const handleMainMenuClick = async (e) => {
        if (!existingJam) return;

        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
        if (!baseUrl) {
            console.error('Base URL not found.');
            return;
        }

        const apiUrl = `${baseUrl}/math-journey/update-status`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    math_jam_id: existingJam.math_jam_id,
                    status: 'ended',
                }),
            });

            if (response.ok) {
                console.log('Math Jam status updated to ended');
                localStorage.removeItem('existingJam');
            } else {
                console.error('Failed to update Math Jam status');
            }
        } catch (error) {
            console.error('Error updating Math Jam status:', error);
        }
    };

    return (
        <>
            <Confetti width={width} height={height} />

            <div className="w-full h-full flex flex-col lg:flex-row items-center justify-between bg-white p-6 rounded-3xl shadow-lg box-border">
                <div className="w-full lg:h-full h-max lg:w-1/2 justify-center items-end lg:px-10 lg:text-start text-center py-5 relative">
                    <h1 className="lg:text-6xl text-5xl font-bold text-primary relative z-10">Math Journey Completed!</h1>

                    <div className="lg:flex hidden justify-center items-center h-full w-full ">
                        <SvgAsset
                            movement="sm"
                            value="/images/assets/background/students_result.svg"
                            className=" hidden sm:block sm:absolute top-0 -right-20 h-full z-0"
                        />
                    </div>
                </div>
                <div className="flex flex-col bg-gray-200 h-full rounded-3xl md:p-6 p-2 gap-4 lg:w-4/12 sm:w-full w-full ">


                    <div className="bg-white h-full rounded-3xl  p-4 space-y-4  mt-4">
                        <div className="bg-success text-white rounded-3xl p-4 flex flex-col full justify-center items-center">

                            <h3 className="text-xl font-semibold">{gameTitle}</h3>
                            <h1 className="text-4xl font-bold">{category}</h1>
                        </div>
                        <h1 className="text-2xl font-bold">Final Scores</h1>
                        <div className="p-4 rounded-3xl bg-gray-200 flex-grow overflow-auto max-h-[calc(100vh-300px)]">
                            <div className="grid grid-cols-1 gap-4">
                                {[...new Map(participants.map(p => [p.id, p])).values()] // Remove duplicates
                                    .slice()
                                    .sort((a, b) => b.score - a.score) // Sort in descending order
                                    .map((participant, index) => (
                                        <div key={participant.id} className="flex items-center justify-between gap-3 text-gray-600 bg-white px-4 py-3 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium">{index + 1}.</span>
                                                <Avatar name={participant.image || participant.name} />
                                                <h3 className="font-semibold">{participant.name}</h3>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <p className="text-xs font-medium">Score</p>
                                                <h3 className="font-semibold text-warning">{participant.score} / {numQuestion}</h3>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex py-4 w-full justify-between text-xl font-semibold text-white">
                        <Link href="/dashboard" className="bg-warning rounded-2xl p-2" onClick={handleMainMenuClick}>
                            Main Menu
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export function Board_Journey({ data }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [isAnswered, setIsAnswered] = useState(false);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [gameState, setGameState] = useState({
        score: 0,
        userAnswers: [],
        correctQuestions: [],
    });
    const [timeSpent, setTimeSpent] = useState([]);
    const { auth } = usePage().props;
    const [existingJam, setExistingJam] = useState(null);
    const [participants, setParticipants] = useState([]);
    const updateScoreCalled = useRef(false);
    const updateAnswersCalled = useRef(false);
    const hasShownSwal = useRef(false);

    useEffect(() => {
        const storedJam = localStorage.getItem('existingJam');
        if (storedJam) {
            setExistingJam(JSON.parse(storedJam));
        }
    }, []);

    useEffect(() => {
        const updateAnswers = async () => {
            if (updateAnswersCalled.current) return;

            updateAnswersCalled.current = true;

            const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
            const apiUrl1 = `${baseUrl}/math-journey/update_answers`;

            try {
                const response = await axios.post(apiUrl1, {
                    math_jam_code: existingJam?.math_jam_code || null,
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

        const updateScore = async () => {
            if (updateScoreCalled.current) return;

            updateScoreCalled.current = true;

            const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
            if (!baseUrl) return;

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const apiUrl = `${baseUrl}/math-journey/update_score`;

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify({
                        math_jam_code: existingJam?.math_jam_code || null,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                console.log("Score updated successfully");
            } catch (err) {
                console.error("Error updating score:", err.message);
            }

            if (currentQuestion < data.length) {
                const currentQuestionId = data[currentQuestion].question_data.id;

                try {
                    const response = await fetch(`/ordered-questions/${currentQuestionId}/${existingJam.math_jam_id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`Error: ${response.statusText}`);
                    }

                    console.log(`Question ${currentQuestionId} deleted successfully`);
                } catch (error) {
                    console.error('Error deleting question:', error.message);
                }
            }
        };

        if (participants.length > 0) {
            const joinedParticipants = participants.filter(participant => participant.status === 'joined');
            const allAnswered = joinedParticipants.every(participant => participant.has_answer === 1);
            const isCorrect = joinedParticipants.every(participant => participant.is_correct === 1);

            if (allAnswered) {
                if (isCorrect) {
                    updateScore();
                }
                setIsAnswered(true);
                updateAnswers();
            }
        }

        if (participants.length > 0) {
            const joinedParticipants = participants.filter(participant => participant.status === 'joined');

            if (joinedParticipants.length === 0 && !hasShownSwal.current) {
                hasShownSwal.current = true;

                Swal.fire({
                    icon: 'warning',
                    title: 'No Participants',
                    text: 'There are no participants in the session.',
                    confirmButtonColor: '#d33',
                }).then(() => {
                    window.location.href = '/math-journey';
                });
            }
        }

    }, [participants, existingJam]);

    useEffect(() => {
        setStartTime(Date.now());
    }, [currentQuestion]);

    useEffect(() => {
        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
        const sseUrl = `${baseUrl}/math-journey/stream-participants?teacher_id=${auth.user.id}`;


        let eventSource;

        const connectSSE = () => {
            eventSource = new EventSource(sseUrl);

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setParticipants(data);

            };

            eventSource.onerror = (error) => {
                // console.error("SSE Error:", error);
                eventSource.close();
                setTimeout(() => {
                    // console.log("Reconnecting SSE...");
                    connectSSE();
                }, 1000);
            };
        };

        connectSSE();

        // const beforeUnloadHandler = (event) => {
        //     handleDisconnect();
        // };

        // window.addEventListener('beforeunload', beforeUnloadHandler);

        // const offlineHandler = () => {
        //     handleDisconnect();
        //     Swal.fire({
        //         icon: 'error',
        //         title: 'Connection Lost',
        //         text: 'You have been disconnected due to a lost internet connection.',
        //         confirmButtonColor: '#d33',
        //         allowOutsideClick: false,
        //     }).then(() => {
        //         window.location.reload();
        //     });
        // };

        // window.addEventListener('offline', offlineHandler);

        return () => {
            eventSource?.close();
            // window.removeEventListener('beforeunload', beforeUnloadHandler);
            // window.removeEventListener('offline', offlineHandler);
        };
    }, [auth.user.id]);

    const handleDialogOpen = async () => {
        if (!existingJam) return;

        setIsPaused(true);

        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
        if (!baseUrl) {
            console.error('Base URL not found.');
            return;
        }

        const apiUrl = `${baseUrl}/math-journey/update-pause-status`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    math_jam_id: existingJam.math_jam_id,
                    is_paused: 1,
                }),
            });

            if (response.ok) {
                // console.log("Math Jam paused successfully.");
                setExistingJam({ ...existingJam, is_paused: 1 }); // Update the state
            } else {
                console.error('Failed to pause Math Jam.');
            }
        } catch (error) {
            console.error('Error updating pause status:', error);
        }
    };

    const handleDialogClose = async () => {
        setIsPaused(false);
        setStartTime(Date.now());

        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
        if (!baseUrl) {
            console.error('Base URL not found.');
            return;
        }

        const apiUrl = `${baseUrl}/math-journey/update-pause-status`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    math_jam_id: existingJam.math_jam_id,
                    is_paused: 0,
                }),
            });

            if (response.ok) {
                // console.log("Math Jam paused successfully.");
                setExistingJam({ ...existingJam, is_paused: 0 });
            } else {
                console.error('Failed to pause Math Jam.');
            }
        } catch (error) {
            console.error('Error updating pause status:', error);
        }
    };
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                localStorage.setItem('pausedTime', Date.now());
            } else {
                const pausedAt = parseInt(localStorage.getItem('pausedTime'), 10) || Date.now();
                const timeElapsed = Date.now() - pausedAt;
                setStartTime((prev) => prev + timeElapsed);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const handleAnswer = (answer) => {
        setIsCorrect(false); // Reset the isCorrect state

        setIsAnswered(true);

        const endTime = Date.now();
        const questionTime = endTime - startTime;

        setTimeSpent((prev) => [...prev, questionTime]);

        const correct = answer ? answer.is_correct : false;
        setCorrectAnswer(correct ? answer.answer : data[currentQuestion].answers.find((a) => a.is_correct).answer);

        const newUserAnswer = {
            questionIndex: currentQuestion,
            answer: answer ? answer.answer : 'Times Up',
            isCorrect: correct,
        };

        if (correct) {
            setIsCorrect(true);
        }

        setGameState((prevState) => {
            const newScore = correct ? prevState.score + 1 : prevState.score;
            const newCorrectQuestions = correct
                ? [...prevState.correctQuestions, currentQuestion]
                : prevState.correctQuestions;

            return {
                score: newScore,
                userAnswers: [...prevState.userAnswers, newUserAnswer],
                correctQuestions: newCorrectQuestions,
            };
        });
    };

    const handleNext = async () => {
        updateScoreCalled.current = false;
        updateAnswersCalled.current = false;
        if (currentQuestion < data.length) {
            const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute("content");
            const apiUrl1 = `${baseUrl}/math-journey/update_answers`;

            try {
                const response = await axios.post(apiUrl1, {
                    math_jam_code: existingJam.math_jam_code,
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

            setIsAnswered(false);
            setIsTimeUp(false);
            setCorrectAnswer('');
            setCurrentQuestion((prev) => (prev < data.length - 1 ? prev + 1 : prev + 1));
        }
    };

    useEffect(() => {
        if (currentQuestion < data.length) {
            updateCurrentQuestionId(data[currentQuestion].question_data.id);
        } else {
            updateCurrentQuestionId(0);
        }
    }, [currentQuestion]);

    const handleTimeUp = async () => {
        if (!isAnswered) {
            const endTime = Date.now();
            const questionTime = endTime - startTime;

            setTimeSpent((prev) => [...prev, questionTime]);

            setIsTimeUp(true);
            setCorrectAnswer(data[currentQuestion].answers.find((a) => a.is_correct).answer);

            const newUserAnswer = {
                questionIndex: currentQuestion,
                answer: 'Times Up',
                isCorrect: false,
            };

            setGameState((prevState) => ({
                ...prevState,
                userAnswers: [...prevState.userAnswers, newUserAnswer],
            }));

            const currentQuestionId = data[currentQuestion].question_data.id;

            try {
                const response = await fetch(`/ordered-questions/${currentQuestionId}/${existingJam.math_jam_id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                console.log(`Question ${currentQuestionId} deleted successfully`);
            } catch (error) {
                console.error('Error deleting question:', error.message);
            }
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

    const colors = ['bg-blue-400', 'bg-purple-400', 'bg-pink-400', 'bg-green-400', 'bg-yellow-400', 'bg-red-400'];

    const isGameFinished = currentQuestion >= data.length;

    const totalTimeSpent = timeSpent.reduce((acc, time) => acc + time, 0);
    const [fontSize, setFontSize] = useState('3rem');

    useEffect(() => {
        const updateFontSize = () => {
            const question = data?.[currentQuestion]?.question_data?.question;
            const questionLength = question ? question.length : 0;
            const screenWidth = window.innerWidth;

            if (screenWidth < 640) {
                if (questionLength > 20) {
                    setFontSize('min(8vw, 1rem)'); // Adjust for mobile screens
                } else {
                    setFontSize('min(10vw, 4rem)');
                }
            } else if (questionLength > 20) {
                setFontSize('2.5rem'); // Smaller font for longer questions
            } else {
                setFontSize('10rem'); // Default large font
            }
        };

        updateFontSize();
        window.addEventListener('resize', updateFontSize);

        return () => window.removeEventListener('resize', updateFontSize);
    }, [currentQuestion, data]);
    return isGameFinished ? (
        <TotalResult participants={participants} numQuestion={existingJam.num_questions} gameTitle={existingJam.math_journey_for} category={existingJam.category} />
    ) : (
        <>
            <div className="w-full h-full bg-white rounded-3xl p-6">
                <div className="flex flex-col justify-between w-full h-full">
                    <div className="flex items-center justify-between w-full">
                        {auth.user && auth.user.user_type == 'Teacher' && (
                            <div className="flex gap-2 rounded-3xl w-max bg-gray-200 p-3">
                                <button
                                    className="bg-primary text-white text-lg px-6 py-2 rounded-2xl font-semibold"
                                    onClick={handleNext}
                                >
                                    Next
                                </button>
                            </div>
                        )}

                        <Dialog onOpenChange={(open) => (open ? handleDialogOpen() : handleDialogClose())}>
                            <DialogTrigger asChild>
                                <button
                                    className="rounded-full w-max bg-gray-200 p-3 text-success hover:bg-success hover:text-white"
                                    onClick={() => setIsPaused((prev) => !prev)}
                                >
                                    <FaPause className="text-4xl" />
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Pause</DialogTitle>
                                    <DialogDescription>Game is paused. Resume when you're ready.</DialogDescription>
                                </DialogHeader>
                                <DialogFooter></DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="w-full p-4 text-success text-center font-bold" style={{ fontSize }}>
                        {data[currentQuestion].question_data.question}
                    </div>

                    <div className="relative">
                        <div className="mt-4 text-start text-xl font-bold text-primary absolute bottom-2 left-2">
                            Score: {gameState.score}
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row justify-center w-full">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 rounded-3xl bg-gray-200">

                                {data[currentQuestion].answers
                                    .filter((answer) => answer?.answer) // Filter out empty answers
                                    .map((answer, index) => (
                                        <button
                                            key={answer.id}
                                            className={`${colors[index % colors.length]} text-center text-white text-2xl font-bold w-full min-w-56 rounded-2xl p-4 hover:bg-opacity-75 active:bg-opacity-50`}
                                            onClick={() => handleAnswer(answer)}
                                            disabled={isAnswered || auth.user.user_type === 'Teacher'}
                                        >
                                            {answer.answer}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </div>

                    <div className="absolute lg:bottom-7 bottom-0 lg:right-8 right-0">
                        <div className="rounded-full bg-primary lg:h-[150px] h-24">
                            {currentQuestion < data.length && (
                                <CountdownCircleTimer
                                    key={currentQuestion} // Reset timer on new question
                                    isPlaying={!isPaused && !isAnswered} // Only play when not paused & unanswered
                                    duration={data[currentQuestion].time}
                                    colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                                    colorsTime={[10, 5, 2, 0]}
                                    size={window.innerWidth > 768 ? 150 : 100}
                                    onComplete={handleTimeUp} // Trigger when timer runs out
                                >
                                    {({ remainingTime }) => (
                                        <div className="lg:text-5xl text-3xl font-bold text-white">
                                            {remainingTime > 0 ? (
                                                <div className="flex items-center">{remainingTime}</div>
                                            ) : (
                                                <motion.img
                                                    src="/images/assets/objects/clock.svg"
                                                    className="w-14 h-14"
                                                    alt="clock"
                                                    initial={{ y: 0, rotate: 0 }}
                                                    animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
                                                    transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
                                                />
                                            )}
                                        </div>
                                    )}
                                </CountdownCircleTimer>
                            )}
                        </div>
                    </div>
                </div>

                {(isAnswered || isTimeUp) && (
                    <div className="absolute inset-0 flex justify-center items-center z-50 bg-opacity-50 p-3">
                        <RoundResult
                            numQuestion={existingJam.num_questions} // di ko alam kung saan kukunin par hahaha
                            participants={participants}
                            onNext={handleNext}
                        />
                    </div>
                )}
            </div>
        </>
    );
}
