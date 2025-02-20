import Avatar from '@/Components/Avatar';
import { useState } from 'react';
import { FaClock } from 'react-icons/fa';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pie, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function TeacherDashboard(result) {
    const [search, setSearch] = useState('');

    const raw_students_data = result.data;
    const students_data = result.data.filter((student) => student.name.toLowerCase().includes(search.toLowerCase()));

    const overallCorrectAverage = (() => {
        let totalCorrect = 0;
        let totalQuestions = 0;

        raw_students_data.forEach((student) => {
            student.scores.forEach((scoreData) => {
                totalCorrect += scoreData.score;
                totalQuestions += scoreData.num_questions;
            });
        });

        return (totalCorrect / totalQuestions) * 100;
    })();

    const overallIncorrectAverage = 100 - overallCorrectAverage;

    const pieData = {
        datasets: [
            {
                data: [Math.round(overallIncorrectAverage), Math.round(overallCorrectAverage)],
                backgroundColor: ['#FF9A9A', '#6CA6CD'],
                hoverBackgroundColor: ['#FF9A9A', '#6CA6CD'],
                borderWidth: 0,
            },
        ],
    };

    const categories = {};
    raw_students_data.forEach((student) => {
        student.scores.forEach((scoreData) => {
            if (!categories[scoreData.category]) {
                categories[scoreData.category] = {
                    totalScore: 0,
                    totalQuestions: 0,
                };
            }
            categories[scoreData.category].totalScore += scoreData.score;
            categories[scoreData.category].totalQuestions += scoreData.num_questions;
        });
    });

    const labels = Object.keys(categories);

    const data = labels.map((category) => {
        const categoryData = categories[category];
        return (categoryData.totalScore / categoryData.totalQuestions) * 100;
    });

    const lineData = {
        labels,
        datasets: [
            {
                label: 'Student Performance',
                data,
                borderColor: 'rgba(173, 216, 230, 1)', // Light blue line
                backgroundColor: 'rgba(173, 216, 230, 0.2)',
                pointStyle: 'circle',
                pointRadius: 6,
                pointBackgroundColor: 'rgba(255, 255, 255, 1)', // White points
                pointBorderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 2,
                fill: false,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: 'Performance by Category',
                color: 'white',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.2)' },
                ticks: { color: 'white' },
            },
            x: {
                grid: { color: 'rgba(255, 255, 255, 0.2)' },
                ticks: { color: 'white' },
            },
        },
    };
    return (
        <div className="py-12">
            <div className="mx-auto max-w-[100rem] sm:px-6 lg:px-8">
                <div className="sm:p-4 p-0 space-y-5">
                    <div className="grid lg:grid-cols-2 md:grid-cols-1 grid-cols-1 text-white gap-5 mb-14">
                        {/* Overall Student Performance */}
                        <div className="bg-gradient-to-tl from-[#fdbdbd] to-[#92e0ff] rounded-2xl p-8 grid md:grid-cols-5 grid-cols-1">
                            <div className="flex flex-col justify-center col-span-3">
                                <h2 className="text-3xl font-bold mb-4">Overall Student Performance</h2>
                                <p className="font-light text-lg">
                                    On average,{' '}
                                    <span className="font-semibold ">{Math.round(overallCorrectAverage)}%</span> of
                                    questions are answered correctly by students.
                                </p>
                            </div>
                            <div className="col-span-2 flex items-center justify-center">
                                <Pie data={pieData} />
                            </div>
                        </div>
                        {/* Skill Analysis */}
                        <div className="bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-2xl p-8">
                            <h2 className="text-lg font-semibold text-white mb-3">Skill Analysis</h2>
                            <Line className="w-full text-white p-5 rounded-2xl" data={lineData} options={options} />
                        </div>
                    </div>
                    {/* Students Listr */}
                    <div className="bg-gray-100 sm:py-10 py-3 sm:px-8 px-2 rounded-3xl box-border overflow-hidden">
                        <h1 className="text-3xl font-bold text-primary mb-4">Students</h1>
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search Student"
                            className="w-full my-2 w-full text-lg bg-white text-gray-700 bg-transparent border border-gray-300 rounded-xl mb-7 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {students_data.length === 0 ? (
                            <div className="bg-gray-200 py-12 rounded-2xl flex flex-col items-center justify-center">
                                <img src="/images/assets/background/not_found.svg" alt="" />
                                <h1 className="text-3xl font-bold text-primary mt-5">Unable to Find the Student</h1>
                                <p>Please check the student name and try again.</p>
                            </div>
                        ) : (
                            <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
                                {students_data.map((student) => (
                                    <div key={student.id} className="p-4 bg-white text-gray-600 rounded-2xl">
                                        <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 items-center">
                                            <div className="flex items-center gap-3">
                                                {student.image ? (
                                                    <Avatar name={student.image} />
                                                ) : (
                                                    <Avatar name={student.name} />
                                                )}
                                                <h3 className="font-semibold">{student.name}</h3>
                                            </div>
                                            <div className="flex md:flex-col md:gap-0 gap-5 md:bg-transparent bg-yellow-100 rounded-2xl md:items-end items-center md:justify-end justify-center p-4">
                                                <p>Average score</p>
                                                <h1 className="rounded-2xl text-warning font-bold text-3xl">
                                                    {(
                                                        (student.scores.reduce((acc, score) => acc + score.score, 0) /
                                                            student.scores.reduce(
                                                                (acc, score) => acc + score.num_questions,
                                                                0,
                                                            )) *
                                                        100
                                                    ).toFixed(1)}
                                                    %
                                                </h1>
                                            </div>
                                        </div>
                                        <div className="p-4 mt-3 bg-gray-100 rounded-2xl">
                                            <div className="flex justify-between items-center mb-5">
                                                <h1 className="font-semibold text-xl text-gray-600 ">Recent Results</h1>

                                                <Dialog>
                                                    <DialogTrigger className="px-2 py-1 bg-primary text-white font-semibold text-sm rounded-xl mx-2">
                                                        View All
                                                    </DialogTrigger>
                                                    <DialogContent className="max-h-[70vh] overflow-y-auto">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-2xl text-primary">
                                                                All Student Scores
                                                            </DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-4">
                                                            {student.scores.map((score, index) => (
                                                                <div key={score.id} className="mt-3">
                                                                    <div className="flex md:flex-row flex-col md:items-center items-start justify-between gap-2 p-2 border-b border-blue-200 w-full">
                                                                        <div className="flex gap-3">
                                                                            <p className="font-semibold">
                                                                                {index + 1}.
                                                                            </p>
                                                                            <div className="flex flex-col">
                                                                                <p className="font-medium">
                                                                                    {score.type +
                                                                                        ' -  ' +
                                                                                        score.category}
                                                                                </p>
                                                                                <p className="text-xs bg-primary text-white px-2 rounded-2xl w-max">
                                                                                    {score.math_journey_for}
                                                                                </p>
                                                                                <div className="text-xs mt-2 flex items-center gap-1">
                                                                                    <FaClock />
                                                                                    {new Intl.DateTimeFormat('en-US', {
                                                                                        month: 'short',
                                                                                        day: '2-digit',
                                                                                        year: 'numeric',
                                                                                        hour: '2-digit',
                                                                                        minute: '2-digit',
                                                                                    }).format(new Date(score.date))}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex bg-gray-100 rounded-xl px-5 items-center flex-col sm:w-max w-full">
                                                                            <p>score</p>
                                                                            <p
                                                                                className={`font-semibold ${
                                                                                    score.score <=
                                                                                    score.num_questions * 0.4
                                                                                        ? 'text-red-600'
                                                                                        : 'text-green-600'
                                                                                }`}
                                                                            >
                                                                                {score.score} / {score.num_questions}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                            {student.scores.slice(0, 2).map((score, index) => (
                                                <div key={score.id} className="flex items-center justify-between mb-2">
                                                    <div className="flex md:flex-row flex-col md:items-center items-start justify-between gap-2 p-2 border-b border-blue-200 w-full">
                                                        <div className="flex gap-3">
                                                            <p className="font-semibold">{index + 1}.</p>
                                                            <div className="flex flex-col">
                                                                <p className="font-medium">
                                                                    {score.type + ' -  ' + score.category}
                                                                </p>
                                                                <p className="text-white text-xs bg-primary rounded-2xl px-2 w-max">
                                                                    {score.math_journey_for}
                                                                </p>
                                                                <div className="text-xs mt-2 flex items-center gap-1">
                                                                    <FaClock />
                                                                    {new Intl.DateTimeFormat('en-US', {
                                                                        month: 'short',
                                                                        day: '2-digit',
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                    }).format(new Date(score.date))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex bg-white rounded-xl px-5 items-center flex-col sm:w-max w-full">
                                                            <p>score</p>
                                                            <p
                                                                className={`font-semibold ${
                                                                    score.score <= score.num_questions * 0.4
                                                                        ? 'text-red-600'
                                                                        : 'text-green-600'
                                                                }`}
                                                            >
                                                                {score.score} / {score.num_questions}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
