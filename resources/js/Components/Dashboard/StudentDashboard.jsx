import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Info } from 'lucide-react';
import { FaPlay, FaRandom } from 'react-icons/fa';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTrigger,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import PrimaryButton from '@/Components/PrimaryButton';
import Checkbox from '@/Components/Checkbox';
import { SvgAsset } from '@/Components/SvgAsset';
import Avatar from '@/Components/Avatar';
import Confetti from 'react-confetti';


export function StudentDashboard({ data: result, topStudentsData }) {
    let data = result.data;
    const visibleStudents = topStudentsData.slice(0, 5);
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-4xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Top Students</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead>
                                    <tr>
                                        <th className="py-2 px-4 border-b text-left">#</th>
                                        <th className="py-2 px-4 border-b text-left">Name</th>
                                        <th className="py-2 px-4 border-b text-left">Ranking</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topStudentsData.map((student, index) => (
                                        <tr key={index} className="hover:bg-gray-100">
                                            <td className="py-2 px-4 border-b">{index + 1}</td>
                                            <td className="py-2 px-4 border-b">{student.name}</td>
                                            <td className="py-2 px-4 border-b">{student.rank}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 text-right">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="py-12">
                <div className="mx-auto max-w-[100rem] sm:px-6 lg:px-8">
                    <div className="p-4 space-y-10">
                        <div className="grid lg:grid-cols-1 sm:grid-cols-1 gap-4">
                            <div className="relative">
                                <img
                                    src="/images/assets/shapes/medal.svg"
                                    alt=""
                                    className="absolute -top-5 -right-10 h-32 w-32 z-10"
                                />
                                <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-2xl lg:px-6 px-2 py-8 pb-10 relative overflow-hidden">
                                    <h3 className="lg:text-3xl text-xl font-bold text-white mb-6">Top Students of the Week</h3>
                                    {topStudentsData && topStudentsData.length > 0 ? (
                                        <>
                                            <Confetti numberOfPieces={200} gravity={0.05} />
                                            <div className="grid lg:grid-cols-1 md:grid-cols-1 grid-cols-1 gap-2 grid-flow-row bg-white rounded-2xl border p-4">
                                                {visibleStudents.map((student, index) => (
                                                    <div key={index} className="flex justify-between border-b pb-2">
                                                        <div className="flex items-center gap-4">
                                                            <Avatar name={student.name} className="w-14 h-14" />
                                                            <h2 className="font-semibold text-xl text-gray-600">{student.name}</h2>
                                                        </div>
                                                        <span className="flex flex-col items-center bg-gray-100 p-2 px-5 rounded-2xl">
                                                            <p className="font-semibold text-xs text-gray-500">Ranking</p>
                                                            <h2 className="text-3xl font-bold text-warning">{student.rank}</h2>
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            {topStudentsData.length > 5 && (
                                                <button
                                                    onClick={() => setIsModalOpen(true)}
                                                    className="mt-4 px-4 py-2 bg-white text-yellow-600 font-semibold rounded-full shadow hover:bg-yellow-100 transition"
                                                >
                                                    View All
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <Confetti numberOfPieces={30} gravity={0.02} />
                                            <div className="bg-white py-12 rounded-2xl flex flex-col items-center justify-center">
                                                <img
                                                    src="/images/assets/background/students_result.svg"
                                                    alt="Students"
                                                    className="w-96 h-w-96"
                                                />
                                                <h1 className="text-3xl font-bold text-warning mt-5">
                                                    Top Students of the Week
                                                </h1>
                                                <p className="max-w-md text-center">
                                                    As soon as students start their math practice, the top students will be displayed here.
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* === Other Data Row === */}
                    <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">
                        {data.map((sample) => (
                            <div
                                key={sample.id}
                                className={`p-6 bg-gradient-to-tl ${sample.gradient} text-white rounded-3xl shadow-md relative min-h-72`}
                            >
                                <div className="w-8 h-8 top-7 right-5 absolute">
                                    <Popover>
                                        <PopoverTrigger>
                                            <div className="hover:text-green-200 hover:cursor-pointer hover:scale-110">
                                                <Info className={`w-6 h-6 bg-white ${sample.textColor} rounded-full`} />
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent>{sample.description}</PopoverContent>
                                    </Popover>
                                </div>
                                <div className="mt-1 text-3xl font-semibold max-w-[90%]">{sample.title}</div>

                                <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-2 mt-8">
                                    {sample.items.map((item) => (
                                        <>
                                            {item.id === 0 ? (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <div
                                                            className={`p-4 bg-white ${sample.textColor} rounded-3xl shadow-md cursor-pointer`}
                                                        >
                                                            <div className="flex items-center justify-between px-3">
                                                                <h2 className="text-lg font-semibold">{item.title}</h2>
                                                                <FaRandom className="w-5 h-5" />
                                                            </div>
                                                        </div>
                                                    </DialogTrigger>

                                                    <DialogContent>
                                                        <DialogTitle>{item.title}</DialogTitle>
                                                        <DialogDescription>{item.description}</DialogDescription>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {sample?.items
                                                                .filter((item2) => item2.id !== 0)
                                                                .map((item2) => (
                                                                    <div key={item2.id} className="flex items-center">
                                                                        <div
                                                                            className={`p-4 bg-white rounded-2xl border-2 border-gray-400 w-full flex`}
                                                                        >
                                                                            <Checkbox
                                                                                type="checkbox"
                                                                                className={`mr-2 bg-gray-300  h-6 w-6 ${sample.textColor}`}
                                                                                value={item2.title}
                                                                            />

                                                                            <div className="flex items-center justify-between px-3">
                                                                                <h2 className="font-semibold">
                                                                                    {item2.title}
                                                                                </h2>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                        <div className="mt-2">
                                                            <div className="flex justify-end gap-2">
                                                                <Link href={'/board'}>
                                                                    <PrimaryButton
                                                                        className={` ${sample.textColor}`}
                                                                        onClick={() => {
                                                                            let selectedItems =
                                                                                document.querySelectorAll(
                                                                                    'input[type="checkbox"]:checked',
                                                                                );
                                                                            let selectedItemsTitles = [];
                                                                            selectedItems.forEach((item) => {
                                                                                selectedItemsTitles.push(item.value);
                                                                            });
                                                                            localStorage.setItem(
                                                                                'schemaTitle',
                                                                                sample.title,
                                                                            );
                                                                            localStorage.setItem(
                                                                                'categoryTitle',
                                                                                JSON.stringify(selectedItemsTitles),
                                                                            );
                                                                            localStorage.setItem(
                                                                                'gameTitle',
                                                                                item.title,
                                                                            );
                                                                        }}
                                                                    >
                                                                        {' '}
                                                                        Start
                                                                    </PrimaryButton>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            ) : (
                                                <Popover key={item.id}>
                                                    <PopoverTrigger>
                                                        <div
                                                            key={item.id}
                                                            className={`p-4 bg-white ${sample.textColor} rounded-3xl shadow-md`}
                                                        >
                                                            <div className="flex items-center justify-between px-3">
                                                                <h2 className="font-semibold text-start">
                                                                    {item.title}
                                                                </h2>
                                                                <FaPlay className="w-5 h-5" />
                                                            </div>
                                                        </div>
                                                    </PopoverTrigger>
                                                    <PopoverContent>
                                                        <div className="mb-5">
                                                            <h1 className="font-semibold text-xl text-gray-700 ">
                                                                {item.title}
                                                            </h1>
                                                            <p className="text-gray-500">{item.description}</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className={`text-sm text-gray-500`}>Example</p>
                                                            <h2
                                                                className={` font-semibold ${item.sample.length < 12 ? 'text-5xl' : item.sample.length < 30 ? 'text-2xl' : 'text-xl'} mb-5 ${sample.textColor}`}
                                                            >
                                                                {item.sample}
                                                            </h2>
                                                        </div>
                                                        <div className="flex justify-end">
                                                            <Link href={'/board'}>
                                                                <PrimaryButton
                                                                    onClick={() => {
                                                                        localStorage.setItem(
                                                                            'schemaTitle',
                                                                            sample.title,
                                                                        );
                                                                        localStorage.setItem(
                                                                            'categoryTitle',
                                                                            item.title,
                                                                        );
                                                                        localStorage.setItem('gameTitle', item.title);
                                                                    }}
                                                                >
                                                                    Play
                                                                </PrimaryButton>
                                                            </Link>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        </>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
