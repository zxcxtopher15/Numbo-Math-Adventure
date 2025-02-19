import { FaPause } from 'react-icons/fa';
import { useState, useEffect } from 'react';
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

function RoundResult({ isTimeUp, isCorrect, correctAnswer, onNext }) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-white p-6 rounded-3xl shadow-lg">
            <h2
                className={`text-3xl font-bold text-center ${isTimeUp ? 'text-orange-500' : isCorrect ? 'text-green-500' : 'text-red-500'
                    }`}
            >
                {isTimeUp ? "Time's Up!" : isCorrect ? 'Correct!' : 'Incorrect'}
            </h2>
            <p className="text-xl mt-4">
                {isTimeUp
                    ? 'You ran out of time.'
                    : isCorrect
                        ? 'Great job!'
                        : `The correct answer is: ${correctAnswer}`}
            </p>
            <button className="bg-primary text-white text-lg px-6 py-2 rounded-2xl font-semibold mt-4" onClick={onNext}>
                Next
            </button>
        </div>
    );
}

function TotalResult({ totalQuestions, gameState, totalTimeSpent }) {
    const { width, height } = useWindowSize();
    const [schemaTitle, setSchemeTitle] = useState('');
    const [categoryTitle, setCategoryTitle] = useState('');
    const [gameTitle, setGameTitle] = useState('');

    useEffect(() => {
        setSchemeTitle(localStorage.getItem('schemaTitle') || 'Default Title');
    }, []);

    useEffect(() => {
        setCategoryTitle(localStorage.getItem('categoryTitle') || 'Default Title');
    }, []);

    useEffect(() => {
        setGameTitle(localStorage.getItem('gameTitle') || 'Default Title');
    }, []);

    const totalTimeInMinutes = Math.floor(totalTimeSpent / 60000);
    const totalTimeInSeconds = Math.floor((totalTimeSpent % 60000) / 1000);

    return (
        <>
            <Confetti width={width} height={height} />

            <div className="w-full h-full flex  items-center justify-between bg-white p-6 rounded-3xl shadow-lg box-border">
                <div className="w-full h-full justify-center items-end p-10 relative">
                    <h1 className="text-6xl font-bold text-primary relative z-10">GREAT JOB!!!</h1>

                    <div className="flex justify-center items-center h-full w-full">
                        <SvgAsset
                            movement="sm"
                            value="/images/assets/background/students_result.svg"
                            className=" hidden sm:block sm:absolute top-0 right-40 h-full z-0"
                        />
                    </div>
                </div>
                <div className="flex flex-col bg-gray-200 h-full rounded-3xl p-6 gap-4 lg:w-1/3">
                    <div className="flex justify-start items-center w-full p-4 bg-white rounded-3xl px-6 gap-8 ">
                        <img className="w-14 h-14" src="/images/assets/stars/glossy_3.svg" alt="" />
                        <h1 className="text-warning font-bold  text-6xl">
                            {gameState.correctQuestions.length} / {totalQuestions}
                        </h1>
                    </div>

                    <div className="bg-white h-full rounded-3xl  p-4 space-y-4  mt-4">
                        <div className="bg-primary text-white p-4 rounded-3xl font-semibold text-2xl">
                            {' '}
                            Time: {totalTimeInMinutes} min {totalTimeInSeconds} sec
                        </div>
                        <div className="bg-success text-white rounded-3xl p-4 flex flex-col full justify-center items-center">
                            {' '}
                            <h3 className="text-xl font-semibold">{schemaTitle}</h3>
                            <h1 className="text-4xl font-bold">{gameTitle}</h1>
                        </div>
                    </div>
                    <div className="flex py-4 w-full justify-between text-xl font-semibold text-white">
                        <Link href="/dashboard" className="bg-warning rounded-2xl p-2">
                            Main Menu
                        </Link>
                        <Link href="/board" className="bg-primary  rounded-2xl p-2 px-4">
                            Play Again
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export function Board({ data }) {
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

    useEffect(() => {
        setStartTime(Date.now());
    }, [currentQuestion]);

    const handleDialogOpen = () => setIsPaused(true);
    const handleDialogClose = () => {
        setIsPaused(false);
        setStartTime(Date.now());
    };

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                setIsPaused(true);
            } else {
                setIsPaused(false);
                setStartTime(Date.now());
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

    const handleNext = () => {
        setIsAnswered(false);
        setIsTimeUp(false);
        setCorrectAnswer('');
        setCurrentQuestion((prev) => (prev < data.length - 1 ? prev + 1 : prev + 1));
    };

    const handleTimeUp = () => {
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
        }
    };

    const colors = ['bg-blue-400', 'bg-purple-400', 'bg-pink-400', 'bg-green-400', 'bg-yellow-400', 'bg-red-400'];

    const isGameFinished = currentQuestion >= data.length;

    const totalTimeSpent = timeSpent.reduce((acc, time) => acc + time, 0);

    return isGameFinished ? (
        <TotalResult totalQuestions={data.length} gameState={gameState} totalTimeSpent={totalTimeSpent} />
    ) : (
        <>
            <div className="w-full h-full bg-white rounded-3xl p-6">
                <div className="flex flex-col justify-between w-full h-full">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex gap-2 rounded-3xl w-max bg-gray-200 p-3">
                            <button
                                className="bg-warning text-white text-lg px-6 py-2 rounded-2xl font-semibold"
                                onClick={() => setCurrentQuestion((prev) => (prev > 0 ? prev - 1 : prev))}
                            >
                                Prev
                            </button>
                            <button
                                className="bg-primary text-white text-lg px-6 py-2 rounded-2xl font-semibold"
                                onClick={handleNext}
                            >
                                Next
                            </button>
                        </div>

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

                    <div className="w-full p-4 sm:p-0 text-success text-center lg:text-9xl text-5xl font-bold">
                        {data[currentQuestion].question_data.question}
                    </div>

                    <div className="relative">
                        <div className="mt-4 text-start text-xl font-bold text-primary absolute bottom-2 left-2">
                            Score: {gameState.score}
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row justify-center w-full">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 rounded-3xl bg-gray-200">
                                {data[currentQuestion].answers.map((answer, index) => (
                                    <button
                                        key={answer.id}
                                        className={`${colors[index % colors.length]} text-center text-white text-2xl font-bold w-full min-w-56 rounded-2xl p-4 hover:bg-opacity-75 active:bg-opacity-50`}
                                        onClick={() => handleAnswer(answer)}
                                        disabled={isAnswered}
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
                            isTimeUp={isTimeUp}
                            isCorrect={isCorrect}
                            correctAnswer={correctAnswer}
                            onNext={handleNext}
                        />
                    </div>
                )}
            </div>
        </>
    );
}
