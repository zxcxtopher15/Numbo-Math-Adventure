import Avatar from '@/Components/Avatar';
import { useState } from 'react';
import { FaClock, FaQuestion } from 'react-icons/fa';
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
import getCategoryType from '../ui/getCategoryType';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function AdminDashboard({ data: studentsData, userCounts }) {
    const [search, setSearch] = useState('');

    const raw_students_data = studentsData;
    const students_data = raw_students_data.filter((student) =>
        student.name.toLowerCase().includes(search.toLowerCase()),
    );
    console.log(userCounts);

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
            if (scoreData.category && !categories[scoreData.category]) {
                categories[scoreData.category] = {
                    totalScore: 0,
                    totalQuestions: 0,
                };
            }
            if (scoreData.category) {
                categories[scoreData.category].totalScore += scoreData.score;
                categories[scoreData.category].totalQuestions += scoreData.num_questions;
            }
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
                <div className="sm:p-4 p-0 grid lg:grid-cols-3 grid-cols-1 gap-4  ">
                    <div className="bg-gradient-to-br from-[#34c759] to-[#f7dc6f] text-white rounded-2xl p-7 flex flex-col justify-center min-h-6 relative text-end py-6">
                        <img
                            className="absolute -left-7 bottom-0 w-36 h-36"
                            src="/images/assets/avatar/student.svg"
                            alt=""
                        />
                        <h3 className="text-xl font-semibold">Student Count</h3>
                        <h1 className="text-5xl font-bold ">{userCounts.students}</h1>
                    </div>
                    <div className="bg-gradient-to-br from-[#3b82f6] to-[#38bdf8] text-white p-7 rounded-2xl flex flex-col justify-center min-h-6 relative text-end py-6">
                        <img
                            className="absolute -left-7 bottom-0 w-36 h-36"
                            src="/images/assets/avatar/teacher.svg"
                            alt=""
                        />
                        <h3 className="text-xl font-semibold">Teacher Count</h3>
                        <h1 className="text-5xl font-bold ">{userCounts.teachers}</h1>
                    </div>
                    <div className="bg-gradient-to-tl from-[#ffa875] to-[#ffca28] text-white p-7 rounded-2xl flex flex-col justify-center min-h-6 relative text-end py-6">
                        <img
                            className="absolute -left-7 bottom-0 w-36 h-36"
                            src="/images/assets/avatar/parent.svg"
                            alt=""
                        />
                        <h3 className="text-xl font-semibold">Parent Count</h3>
                        <h1 className="text-5xl font-bold ">{userCounts.parents}</h1>
                    </div>
                </div>
                <div className="sm:p-4 p-0 space-y-5">
                    <div className="grid lg:grid-cols-2 md:grid-cols-1 grid-cols-1 text-white gap-5 mb-14">
                        {/* Overall Student Performance */}
                        <div className="bg-gradient-to-tl from-[#fdbdbd] to-[#92e0ff] rounded-2xl p-8 grid md:grid-cols-5 grid-cols-1">
                            <div className="flex flex-col justify-center col-span-3">
                                <h2 className="text-3xl font-bold mb-4">Overall Student Performance</h2>
                                <p className="font-light text-lg">
                                    Keep track of students' progress!{' '}
                                    <span className="font-semibold ">{Math.round(overallCorrectAverage)}%</span> of
                                    questions are answered correctly by the students.
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
                </div>
            </div>
        </div>
    );
}
