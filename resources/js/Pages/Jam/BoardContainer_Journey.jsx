import { useState, useEffect } from 'react';

import { Board_Journey } from '@/Components/Board_Journey';
import { PageCountDown } from '@/Components/PageCountDown';

export default function BoardContainer_Journey({ auth }) {
    const [showCountdown, setShowCountdown] = useState(true);
    const [categoryTitle, setCategoryTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [existingJam, setExistingJam] = useState(null);

    console.log(questions);

    useEffect(() => {
        const storedJam = localStorage.getItem('existingJam');
        if (storedJam) {
            setExistingJam(JSON.parse(storedJam));
        }
    }, []);

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; 
        }
        return array;
    };

    useEffect(() => {
        setCategoryTitle(localStorage.getItem('category') || 'Default Title');

        if (categoryTitle) {
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
                    setQuestions(shuffledData);
                })
                .catch((error) => {
                    console.error('Error fetching questions:', error);
                });
        }
    }, [categoryTitle]);

    useEffect(() => {
        setCategoryTitle(localStorage.getItem('categoryTitle') || 'Default Title');
    }, []);

    const handleCountdownComplete = () => {
        setShowCountdown(false);
    };

    return (
        <>
            <div className="overflow-hidden h-dvh lg:p-3 p-2 bg-gradient-to-br from-teal-400 to-yellow-200 box-border">
                {showCountdown ? <PageCountDown onComplete={handleCountdownComplete} /> : <Board_Journey data={questions} />}
            </div>
        </>
    );
}
