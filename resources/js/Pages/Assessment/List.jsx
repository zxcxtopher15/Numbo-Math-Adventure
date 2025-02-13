import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { Info } from 'lucide-react';
import { FaPlay } from 'react-icons/fa';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/Components/ui/popover';
import PrimaryButton from '@/Components/PrimaryButton';

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
        sample:
          'I have 5 dogs and I gave 2 away. How many dogs do I have left?',
      },
    ],
  },
  {
    id: 3,
    title: 'Sample 3',
    description: 'This is sample 3',
    gradient: 'from-[#34D399] to-[#8BC34A]',
    textColor: 'text-[#8BC34A]',
    items: [
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
    gradient: 'from-[#8B5CF6] to-[#4A56E2]',
    textColor: 'text-[#4A56E2]',
    items: [
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

export default function List() {
  const { auth } = usePage().props;
  const userType = auth?.user?.user_type;

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          List
        </h2>
      }
    >
      <Head title="List" />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              {userType === 'Teacher' && <p>Welcome, Teacher!</p>}
              {userType === 'Student' && <p>Welcome, Student!</p>}
              {userType === 'Parent' && <p>Welcome, Parent!</p>}
              {!['Teacher', 'Student', 'Parent'].includes(userType) && (
                <p>You're logged in!</p>
              )}
            </div>
          </div>
          <div className="p-4 space-y-4">Test</div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
