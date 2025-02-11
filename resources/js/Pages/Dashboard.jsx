import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { Info } from 'lucide-react';
import { FaPlay } from 'react-icons/fa';
// This is sample data.
const data = [
  {
    id: 1,
    title: 'Sample 1',
    description: 'This is sample 1',
    items: [
      { id: 1, title: 'Item 1', description: 'This is item 1' },
      { id: 2, title: 'Item 2', description: 'This is item 2' },
      { id: 3, title: 'Item 3', description: 'This is item 3' },
      { id: 7, title: 'Item 7', description: 'This is item 7' },
      { id: 8, title: 'Item 8', description: 'This is item 8' },
    ],
  },
  {
    id: 2,
    title: 'Sample 2',
    description: 'This is sample 2',
    items: [
      { id: 4, title: 'Item 4', description: 'This is item 4' },
      { id: 5, title: 'Item 5', description: 'This is item 5' },
      { id: 6, title: 'Item 6', description: 'This is item 6' },
    ],
  },
  {
    id: 3,
    title: 'Sample 3',
    description: 'This is sample 3',
    items: [
      { id: 7, title: 'Item 7', description: 'This is item 7' },
      { id: 8, title: 'Item 8', description: 'This is item 8' },
      { id: 9, title: 'Item 9', description: 'This is item 9' },
    ],
  },
  {
    id: 4,
    title: 'Sample 4',
    description: 'This is sample 4',
    items: [
      { id: 10, title: 'Item 10', description: 'This is item 10' },
      { id: 11, title: 'Item 11', description: 'This is item 11' },
      { id: 12, title: 'Item 12', description: 'This is item 12' },
    ],
  },
];
export default function Dashboard() {
  const { auth } = usePage().props;
  const userType = auth?.user?.user_type;

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Dashboard
        </h2>
      }
    >
      <Head title="Dashboard" />

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
          <div className="p-4 space-y-4 bg-slate-300">
            <div className="grid lg:grid-cols-2 sm:grid-cols-1  gap-4">
              {data.map((sample) => (
                <div
                  key={sample.id}
                  className="p-6 bg-gradient-to-tl from-[#CDDA1E] to-[#50DE65] text-white rounded-3xl shadow-md relative"
                >
                  <div className="w-8 h-8 top-7 right-5  text-white absolute hover:text-green-200 hover:cursor-pointer hover:scale-110">
                    <Info className="w-6 h-6 bg-white text-green-500 rounded-full  " />
                  </div>
                  <div className="mt-1  text-3xl  font-semibold ">
                    {sample.title}
                  </div>
                  {sample.description}

                  <div className="grid grid-cols-2 gap-1">
                    {sample.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-white text-green-600 rounded-3xl shadow-md"
                      >
                        <div className="flex items-center justify-between px-3">
                          <h2 className="font-semibold">{item.title} </h2>
                          <FaPlay className="w-5 h-5" />
                        </div>
                      </div>
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
