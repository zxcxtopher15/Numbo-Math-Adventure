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
import axios from 'axios';

import { StudentDashboard } from '@/Components/Dashboard/StudentDashboard';
import { TeacherDashboard } from '@/Components/Dashboard/TeacherDashboard';
import { ParentDashboard } from '@/Components/Dashboard/ParentDashboard';
import { useState, useEffect } from 'react';

// const data = [
//     {
//         id: 1,
//         title: 'Addition Challenge',
//         description:
//             'Engage in various fun exercises designed to strengthen your addition skills, from simple sums to more complex problems.',
//         gradient: 'from-[#CDDA1E] to-[#50DE65]',
//         textColor: 'text-[#50DE65]',
//         items: [
//             {
//                 id: 0,
//                 title: 'Custom Game',
//                 description:
//                     'Design your own addition challenges by selecting the difficulty level and types of problems.',
//                 sample: 'Create a set of addition problems like "15 + 12" or "3 + 7".',
//             },
//             {
//                 id: 1,
//                 title: 'Add Tens',
//                 description: 'Practice adding multiples of ten to quickly build up your mental math skills.',
//                 sample: '30 + 40 = 70',
//             },
//             {
//                 id: 2,
//                 title: 'Add Two Numbers',
//                 description:
//                     'Add two single-digit or double-digit numbers together to improve your basic addition skills.',
//                 sample: '6 + 8 = 14',
//             },
//             {
//                 id: 3,
//                 title: 'Addition Sentences',
//                 description: 'Solve real-life word problems that involve addition.',
//                 sample: 'I have 5 pencils, and I buy 3 more. How many pencils do I have now?',
//             },
//             {
//                 id: 4,
//                 title: 'Complete the Equations (+)',
//                 description:
//                     'Fill in the missing number to complete the addition equation and practice problem-solving.',
//                 sample: '12 + __ = 20',
//             },
//             {
//                 id: 5,
//                 title: 'Add Three Numbers',
//                 description: 'Practice adding three numbers together to boost your addition fluency.',
//                 sample: '5 + 3 + 4 = 12',
//             },
//         ],
//     },
//     {
//         id: 2,
//         title: 'Subtraction Showdown',
//         description:
//             'Sharpen your subtraction skills with challenging exercises ranging from simple subtractions to word problems.',
//         gradient: 'from-[#EC4899] to-[#FBBF24]',
//         textColor: 'text-[#FBBF24]',
//         items: [
//             {
//                 id: 0,
//                 title: 'Custom Game',
//                 description:
//                     'Create your own subtraction challenges by selecting the difficulty level and types of problems.',
//                 sample: 'Design your subtraction problems like "20 - 5" or "45 - 30".',
//             },
//             {
//                 id: 6,
//                 title: 'Subtract Tens',
//                 description: 'Practice subtracting multiples of ten to strengthen your mental math for larger numbers.',
//                 sample: '80 - 40 = 40',
//             },
//             {
//                 id: 7,
//                 title: 'Subtract Two Numbers',
//                 description: 'Practice subtracting two numbers, whether they are single-digit or double-digit numbers.',
//                 sample: '18 - 9 = 9',
//             },
//             {
//                 id: 8,
//                 title: 'Subtraction Sentences',
//                 description: 'Solve real-world subtraction problems involving everyday scenarios.',
//                 sample: 'Emma has 10 candies, and she gives 3 to her friend. How many candies does she have left?',
//             },
//             {
//                 id: 9,
//                 title: 'Complete the Equations (-)',
//                 description:
//                     'Fill in the missing number to complete subtraction equations and practice your problem-solving skills.',
//                 sample: '15 - __ = 7',
//             },
//             {
//                 id: 10,
//                 title: 'Subtract Doubles',
//                 description:
//                     'Learn to subtract numbers that are the same, focusing on simple and repetitive subtraction tasks.',
//                 sample: '10 - 5 = 5',
//             },
//         ],
//     },
//     {
//         id: 3,
//         title: 'Multiplication Mania',
//         description:
//             'Enhance your multiplication skills with fun exercises, from solving equations to applying multiplication in real-world problems.',
//         gradient: 'from-[#EC4899] to-[#8B5CF6]',
//         textColor: 'text-[#8B5CF6]',
//         items: [
//             {
//                 id: 0,
//                 title: 'Custom Game',
//                 description:
//                     'Create your own multiplication challenges by selecting difficulty levels and types of multiplication problems.',
//                 sample: 'Design multiplication problems like "8 × 7" or "4 × 9".',
//             },
//             {
//                 id: 11,
//                 title: 'Multiplication Equation',
//                 description: 'Solve basic multiplication equations to build fluency with times tables.',
//                 sample: '6 × 5 = 30',
//             },
//             {
//                 id: 12,
//                 title: 'Multiplication Table',
//                 description:
//                     'Memorize and practice multiplication tables to increase speed and accuracy in solving problems.',
//                 sample: '4 × 6 = 24',
//             },
//             {
//                 id: 13,
//                 title: 'Multiplication Word Problem',
//                 description: 'Apply multiplication in real-life scenarios by solving word problems.',
//                 sample: 'Each bag contains 5 marbles. How many marbles are in 7 bags?',
//             },
//             {
//                 id: 14,
//                 title: 'Complete The Equation (x)',
//                 description: 'Fill in the missing number in a multiplication equation to practice problem-solving.',
//                 sample: '__ × 6 = 36',
//             },
//             {
//                 id: 15,
//                 title: 'Multiplication Mystery',
//                 description: 'Solve tricky multiplication puzzles that challenge your understanding of multiplication.',
//                 sample: 'If 4 × X = 16, what is X?',
//             },
//         ],
//     },
//     {
//         id: 4,
//         title: 'Mixed Math Challenges',
//         description:
//             'Tackle a variety of math problems, including number patterns, true/false equations, and comparisons between numbers.',
//         gradient: 'from-[#34D399] to-[#6366F1]',
//         textColor: 'text-[#6366F1]',
//         items: [
//             {
//                 id: 0,
//                 title: 'Custom Game',
//                 description:
//                     'Create your own set of mixed math challenges by selecting difficulty levels and types of problems.',
//                 sample: 'Design mixed math problems like "3 × 4" or "8 + 7".',
//             },
//             {
//                 id: 16,
//                 title: 'Missing Number',
//                 description:
//                     'Identify the missing number in a sequence or equation to test your number pattern recognition.',
//                 sample: '2, 4, __, 8, 10',
//             },
//             {
//                 id: 17,
//                 title: 'True or False Equations',
//                 description:
//                     'Determine whether an equation is true or false based on your understanding of basic operations.',
//                 sample: '5 + 3 = 8 (True or False?)',
//             },
//             {
//                 id: 18,
//                 title: 'True Number Sign',
//                 description: 'Choose the correct sign (> , < , =) to compare numbers and practice inequality skills.',
//                 sample: '9 __ 7',
//             },
//             {
//                 id: 19,
//                 title: 'Number Pattern',
//                 description: 'Identify and complete number patterns to enhance your sequencing skills.',
//                 sample: '1, 3, 5, 7, __, 11',
//             },
//             {
//                 id: 20,
//                 title: 'Comparing Numbers: (< = >)',
//                 description:
//                     'Compare numbers using greater than, less than, or equal signs to test your understanding of number relationships.',
//                 sample: '14 > 10 (True or False?)',
//             },
//         ],
//     },
// ];

export default function Dashboard() {
    const { auth, data } = usePage().props;
    const userType = auth?.user?.user_type;
    const [studentsData, setStudentsData] = useState([]);

    useEffect(() => {
        const endpoint = userType === 'Parent' ? '/parent-student-results' : '/student-results';

        axios
            .get(endpoint)
            .then((response) => {
                setStudentsData(response.data.results);
            })
            .catch((error) => {
                console.error('Error fetching student results:', error);
            });
    }, [userType]);
    console.log('Students Data:', studentsData);

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
                        {userType !== 'Parent' && userType !== 'Administrator' && (
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
            ) : userType === 'Administrator' ? (
                <ParentDashboard data={studentsData} />
            ) : (
                <ParentDashboard data={studentsData} />
            )}
        </AuthenticatedLayout>
    );
}
