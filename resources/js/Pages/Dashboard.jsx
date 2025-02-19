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
import ShapeGenerator from '@/Components/ShapeGenerator';
import Checkbox from '@/Components/Checkbox';

// This is sample data with dynamic colors.
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
                title: 'Complete The Equations',
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

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Dashboard</h2>}>
            <Head title="Dashboard" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="p-4 space-y-4">
                        <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4 ">
                            {data.map((sample) => (
                                <div
                                    key={sample.id}
                                    className={`p-6 bg-gradient-to-tl ${sample.gradient} text-white rounded-3xl shadow-md relative min-h-72`}
                                >
                                    <div className="w-8 h-8 top-7 right-5 absolute">
                                        <Popover>
                                            <PopoverTrigger>
                                                <div className="hover:text-green-200 hover:cursor-pointer hover:scale-110">
                                                    <Info
                                                        className={`w-6 h-6 bg-white ${sample.textColor} rounded-full`}
                                                    />
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
                                                                    <h2 className="text-lg font-semibold">
                                                                        {item.title}
                                                                    </h2>
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
                                                                        <div
                                                                            key={item2.id}
                                                                            className="flex items-center"
                                                                        >
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
                                                                            console.log(selectedItemsTitles);
                                                                        }}
                                                                    >
                                                                        {' '}
                                                                        Start
                                                                    </PrimaryButton>
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
                                                                    <h2 className="font-semibold">{item.title}</h2>
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
                                                                    <PrimaryButton>Play</PrimaryButton>
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
            </div>
        </AuthenticatedLayout>
    );
}
