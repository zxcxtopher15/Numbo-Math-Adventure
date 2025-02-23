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
        description: 'Practice addition problems with visual aids and engaging exercises.',
        gradient: 'from-[#CDDA1E] to-[#50DE65]',
        textColor: 'text-[#50DE65]',
        items: [
            {
                id: 0,
                title: 'Custom Game',
                description: 'Create your own set of addition challenges.',
                sample: 'Design your own addition problems and difficulty levels.',
            },
            {
                id: 1,
                title: 'Adding Multiples of Ten',
                description: 'Practice adding multiples of ten.',
                sample: '10 + 30 = 40',
            },
            {
                id: 2,
                title: 'Basic Addition',
                description: 'Add two single-digit or double-digit numbers.',
                sample: '7 + 5 = 12',
            },
            {
                id: 3,
                title: 'Addition Sentences',
                description: 'Solve word problems related to addition.',
                sample: 'I have 3 apples, and my friend gives me 2 more. How many apples do I have?',
            },
            {
                id: 4,
                title: 'Complete the Equation',
                description: 'Fill in the missing number to complete the addition equation.',
                sample: '8 + __ = 15',
            },
            {
                id: 5,
                title: 'Adding Three Numbers',
                description: 'Practice adding three numbers together.',
                sample: '4 + 6 + 5 = 15',
            },
        ],
    },
    {
        id: 2,
        title: 'Subtraction Showdown',
        description: 'Strengthen your subtraction skills with fun and interactive problems.',
        gradient: 'from-[#EC4899] to-[#FBBF24]',
        textColor: 'text-[#FBBF24]',
        items: [
            {
                id: 0,
                title: 'Custom Game',
                description: 'Create your own set of subtraction challenges.',
                sample: 'Design your own subtraction problems and difficulty levels.',
            },
            {
                id: 6,
                title: 'Subtracting Multiples of Ten',
                description: 'Practice subtracting multiples of ten.',
                sample: '90 - 30 = 60',
            },
            {
                id: 7,
                title: 'Basic Subtraction',
                description: 'Subtract two single-digit or double-digit numbers.',
                sample: '12 - 5 = 7',
            },
            {
                id: 8,
                title: 'Subtraction Sentences',
                description: 'Solve word problems related to subtraction.',
                sample: 'Lisa has 8 cookies. She eats 3. How many are left?',
            },
            {
                id: 9,
                title: 'Complete the Equation',
                description: 'Fill in the missing number to complete the subtraction equation.',
                sample: '20 - __ = 12',
            },
            {
                id: 10,
                title: 'Subtracting Doubles',
                description: 'Practice subtracting numbers that are the same.',
                sample: '6 - 3 = 3',
            },
        ],
    },
    {
        id: 3,
        title: 'Multiplication Mania',
        description: 'Boost your multiplication skills with tables, equations, and word problems.',
        gradient: 'from-[#EC4899] to-[#8B5CF6]',
        textColor: 'text-[#8B5CF6]',
        items: [
            {
                id: 0,
                title: 'Custom Game',
                description: 'Create your own set of multiplication challenges.',
                sample: 'Design your own multiplication problems and difficulty levels.',
            },
            {
                id: 11,
                title: 'Multiplication Equations',
                description: 'Solve basic multiplication equations.',
                sample: '3 × 4 = 12',
            },
            {
                id: 12,
                title: 'Multiplication Tables',
                description: 'Memorize and practice multiplication tables.',
                sample: '5 × 6 = 30',
            },
            {
                id: 13,
                title: 'Multiplication Word Problems',
                description: 'Solve real-life multiplication scenarios.',
                sample: 'Each box has 4 cupcakes. If there are 6 boxes, how many cupcakes are there in total?',
            },
            {
                id: 14,
                title: 'Complete the Equation',
                description: 'Fill in the missing number in the multiplication equation.',
                sample: '__ × 7 = 21',
            },
            {
                id: 15,
                title: 'Multiplication Mystery',
                description: 'Solve tricky multiplication puzzles.',
                sample: 'If 3 × X = 18, what is X?',
            },
        ],
    },
    {
        id: 4,
        title: 'Mixed Math Challenges',
        description: 'Practice different types of math problems, including patterns and comparisons.',
        gradient: 'from-[#34D399] to-[#6366F1]',
        textColor: 'text-[#6366F1]',
        items: [
            {
                id: 0,
                title: 'Custom Game',
                description: 'Create your own set of mixed math challenges.',
                sample: 'Design your own mixed math problems and difficulty levels.',
            },
            {
                id: 16,
                title: 'Find the Missing Number',
                description: 'Determine the missing number in a sequence.',
                sample: '2, 4, __, 8, 10',
            },
            {
                id: 17,
                title: 'True or False Equations',
                description: 'Decide if an equation is correct or incorrect.',
                sample: '6 + 3 = 9 (True or False?)',
            },
            {
                id: 18,
                title: 'Identify the Correct Math Sign',
                description: 'Choose the correct sign (> , < , =) to compare numbers.',
                sample: '7 __ 5',
            },
            {
                id: 19,
                title: 'Number Patterns',
                description: 'Identify the pattern in a number sequence.',
                sample: '3, 6, 9, 12, __, 18',
            },
            {
                id: 20,
                title: 'Comparing Numbers',
                description: 'Compare numbers using greater than, less than, or equal signs.',
                sample: '15 > 12 (True or False?)',
            },
        ],
    },
];

export default function Dashboard() {
    const { auth } = usePage().props;
    const userType = auth?.user?.user_type;
    const [studentsData, setStudentsData] = useState([]);

    useEffect(() => {
        const endpoint = userType === "Parent" ? "/parent-student-results" : "/student-results";

        axios.get(endpoint)
            .then(response => {
                setStudentsData(response.data.results);
            })
            .catch(error => {
                console.error("Error fetching student results:", error);
            });
    }, [userType]);
    console.log("Students Data:", studentsData);
    

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
