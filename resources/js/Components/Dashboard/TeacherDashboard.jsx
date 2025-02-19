import Avatar from '@/Components/Avatar';
import { useState } from 'react';
import { FaClock } from 'react-icons/fa';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export function TeacherDashboard(result) {
    const [search, setSearch] = useState('');
    const students_data = result.data.filter((student) => student.name.toLowerCase().includes(search.toLowerCase()));
    const data = {
        datasets: [
            {
                data: [300, 200], // [correct, incorrect]
                backgroundColor: ['#FF9A9A', '#6CA6CD'], // slightly darker red and blue
                hoverBackgroundColor: ['#FF9A9A', '#6CA6CD'],
                borderWidth: 0,
            },
        ],
    };

    return (
        <div className="py-12">
            <div className="mx-auto max-w-[100rem] sm:px-6 lg:px-8">
                <div className="sm:p-4 p-0 space-y-5">
                    <div className="grid md:grid-cols-2 grid-cols-1 text-white gap-5 mb-14">
                        <div className="bg-gradient-to-br from-[#fdbdbd] to-[#92e0ff] rounded-2xl p-8 grid md:grid-cols-5 grid-cols-1">
                            <div className="flex flex-col justify-center col-span-3">
                                <h2 className="text-3xl font-bold mb-4">Overall Student Performance</h2>
                                <p className="font-light text-lg">
                                    Currently, 30% of students are answering questions correctly.
                                </p>
                            </div>
                            <div className="col-span-2 flex items-center justify-center">
                                <Pie data={data} />
                            </div>
                        </div>
                        <div className="bg-primary rounded-2xl p-4">box1</div>
                    </div>
                    <div className="bg-gray-100 sm:py-10 py-3 sm:px-8 px-2 rounded-3xl box-border overflow-hidden">
                        <h1 className="text-3xl font-bold text-primary mb-4">Students</h1>
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search Student"
                            className="w-full my-2 w-full text-lg bg-white text-gray-700 bg-transparent border border-gray-300 rounded-xl mb-7 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {students_data.length === 0 ? ( // Not Found
                            <div className="bg-gray-200 py-12 rounded-2xl flex flex-col items-center justify-center">
                                <img src="/images/assets/background/not_found.svg" alt="" />
                                <h1 className="text-3xl font-bold text-primary mt-5">Unable to Find the Student</h1>
                                <p>Please check the student name and try again.</p>
                            </div>
                        ) : (
                            // Student List
                            <div className="grid lg:grid-cols-2 grid-cols-1 gap-5 ">
                                {students_data.map((student) => (
                                    <div key={student.id} className="p-4 bg-white text-gray-600 rounded-2xl">
                                        <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 items-center ">
                                            <div className="flex items-center gap-3">
                                                {student.image ? (
                                                    <Avatar name={student.image} />
                                                ) : (
                                                    <Avatar name={student.name} />
                                                )}
                                                <h3 className="font-semibold"> {student.name}</h3>
                                            </div>
                                            <div className="flex md:flex-col md:gap-0 gap-5 md:bg-transparent bg-yellow-100 rounded-2xl md:items-end items-center md:justify-end justify-center p-4 ">
                                                <p>Average</p>
                                                <h1 className="rounded-2xl  text-warning font-bold text-3xl">80%</h1>
                                            </div>
                                        </div>
                                        <div className="p-4 mt-3 bg-gray-100 rounded-2xl">
                                            <h1 className="font-semibold text-xl text-primary">Recent Results</h1>
                                            {student.scores.map((score, index) => (
                                                <div key={score.id} className="flex items-center justify-between mb-2">
                                                    <div className="flex md:flex-row flex-col md:items-center items-start justify-between gap-2 p-2  border-b border-blue-200 w-full">
                                                        <div className="flex gap-3">
                                                            <p className="font-semibold">{index + 1}.</p>
                                                            <div className="flex flex-col">
                                                                <p className="font-medium">{score.category}</p>
                                                                <p className="text-white text-xs bg-primary rounded-2xl px-2 w-max">
                                                                    {score.type}
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
                                                        <div className="flex md:flex-col flex-row md:gap-0 gap-2 md:p-0 p-4 justify-center items-center bg-white px-3 min-w-max md:w-2/12 w-full rounded-xl">
                                                            <p className="text-sm ">score</p>
                                                            <p
                                                                className={`font-semibold ${score.score <= score.max_score * 0.4 ? 'text-red-600' : 'text-green-600'}`}
                                                            >
                                                                {score.score} / {score.max_score}
                                                            </p>
                                                            <p className="text-sm"></p>
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
