import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
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
import axios from "axios";

import { StudentDashboard } from '@/Components/Dashboard/StudentDashboard';
import { TeacherDashboard } from '@/Components/Dashboard/TeacherDashboard';
import { ParentDashboard } from '@/Components/Dashboard/ParentDashboard';
import { useState, useEffect } from 'react';

const data = [
    {
        id: 1,
        title: 'Addition Challenge',
        description: 'Addition problems with visual aids',
        gradient: 'from-[#CDDA1E] to-[#50DE65]',
        textColor: 'text-[#50DE65]',
        items: [
            {
                id: 0,
                title: 'Custom Game',
                description: 'Create your own custom category',
                sample: 'Create your own custom category',
            },
            {
                id: 1,
                title: 'Add Tens',
                description: 'Addition with tens',
                sample: '1 + 20 = 21',
            },
            {
                id: 2,
                title: 'Add Two Numbers',
                description: 'Add two numbers',
                sample: '1 + 2 = 3',
            },
            {
                id: 3,
                title: 'Addition Sentences',
                description: 'Addition sentences',
                sample: 'I have 1 apple and my friend has 2 apples.',
            },
            {
                id: 4,
                title: 'Complete The Equations (Addition)',
                description: 'Complete the equations',
                sample: '1 + 5 = 6',
            },
            {
                id: 5,
                title: 'Add Three Numbers',
                description: 'Add three numbers',
                sample: '2 + 3 + 4 = 9',
            },
        ],
    },
    {
        id: 2,
        title: 'Subtraction Showdown',
        description: 'Subtraction problems with visual aids',
        gradient: 'from-[#EC4899] to-[#FBBF24]',
        textColor: 'text-[#FBBF24]',
        items: [
            {
                id: 0,
                title: 'Custom Game',
                description: 'Create your own custom category',
                sample: 'Create your own custom category',
            },
            {
                id: 4,
                title: 'Subtract Tens',
                description: 'Subtraction with tens',
                sample: '50 - 20 = 30',
            },
            {
                id: 5,
                title: 'Subtract Two Numbers',
                description: 'Subtraction with two numbers',
                sample: '3 - 2 = 1',
            },
            {
                id: 6,
                title: 'Subtraction Sentences',
                description: 'Subtraction sentences',
                sample: 'I have 5 dogs and I gave 2 away. How many dogs do I have left?',
            },
        ],
    },
    {
        id: 3,
        title: 'Sample 3',
        description: 'This is sample 3',
        gradient: 'from-[#EC4899] to-[#8B5CF6]',
        textColor: 'text-[#8B5CF6]',
        items: [
            {
                id: 0,
                title: 'Custom Game',
                description: 'Create your own custom category',
                sample: 'Create your own custom category',
            },
            {
                id: 7,
                title: 'Item 7',
                description: 'This is item 7',
                sample: 'This is the sample for item 7',
            },
            {
                id: 8,
                title: 'Item 8',
                description: 'This is item 8',
                sample: 'This is the sample for item 8',
            },
            {
                id: 9,
                title: 'Item 9',
                description: 'This is item 9',
                sample: 'This is the sample for item 9',
            },
        ],
    },
    {
        id: 4,
        title: 'Sample 4',
        description: 'This is sample 4',
        gradient: 'from-[#34D399] to-[#6366F1]',
        textColor: 'text-[#6366F1]',
        items: [
            {
                id: 0,
                title: 'Custom Game',
                description: 'Create your own custom category',
                sample: 'Create your own custom category',
            },
            {
                id: 10,
                title: 'Item 10',
                description: 'This is item 10',
                sample: 'This is the sample for item 10',
            },
            {
                id: 11,
                title: 'Item 11',
                description: 'This is item 11',
                sample: 'This is the sample for item 11',
            },
            {
                id: 12,
                title: 'Item 12',
                description: 'This is item 12',
                sample: 'This is the sample for item 12',
            },
        ],
    },
];

export default function Dashboard() {
    const { auth } = usePage().props;
    const userType = auth?.user?.user_type;
    const [studentsData, setStudentsData] = useState([]);

    console.log(studentsData);

    useEffect(() => {
        axios.get("/student-results")
            .then(response => {
                setStudentsData(response.data.results);
            })
            .catch(error => {
                console.error("Error fetching student results:", error);
            });
    }, []);

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Dashboard</h2>}>
            <Head title="Dashboard" />
            <div className="pt-12 sm:px-6 lg:px-11 max-w-[100rem] mx-auto">
                <div className="grid lg:grid-cols-2 gap-4 bg-gradient-to-br from-[#6366F1] to-[#34D399] rounded-2xl min-h-96">
                    <div className="w-full relative">
                        <SvgAsset
                            movement="sm"
                            value="/images/assets/background/students_jam.svg"
                            className="sm:h-[45rem] absolute sm:-top-40 top-0 left-0 z-0 "
                            draggable={false}
                        />
                    </div>
                    <div className="flex flex-col items-center justify-center relative z-1">
                        <img src="/images/logo.png" alt="" className="h-32" />
                        {userType !== 'Parent' && (
                            <Link href={userType === 'Teacher' ? '/math-journey' : 'math-journey-join'}>
                                <div className="border-2 border-gray-50 rounded-2xl px-4 py-1 font-semibold text-white transition duration-300 ease-in-out hover:scale-105 hover:bg-primary">
                                    Math Journey{' '}
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
            {userType === 'Student' ? (
                <StudentDashboard data={data} />
            ) : userType === 'Teacher' ? (
                <TeacherDashboard data={studentsData} />
            ) : (
                <ParentDashboard data={studentsData} />
            )}
        </AuthenticatedLayout>
    );
}
