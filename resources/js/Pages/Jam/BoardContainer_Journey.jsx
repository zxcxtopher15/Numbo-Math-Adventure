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
            setExistingJam(JSON.parse(storedJam));
        }
    }, []);

    useEffect(() => {
        setCategoryTitle(localStorage.getItem('category') || 'Default Title');
    }, []);

    useEffect(() => {
        if (!existingJam) return;

        const fetchQuestions = async () => {
            try {
                const response = await fetch(
                    `/questions_list_teacher?categoryTitle=${categoryTitle}`
                );
                const data = await response.json();

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

                setQuestions(shuffleArray(formattedData));
            } catch (error) {
                console.error('Error fetching questions:', error);
            }
        };

        fetchQuestions();
    }, [existingJam, categoryTitle]);

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
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
