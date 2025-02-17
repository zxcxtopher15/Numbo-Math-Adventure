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


export default function Questions() {
    const { auth } = usePage().props;
    const userType = auth?.user?.user_type;

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Questions</h2>}>
            <Head title="Questions" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="p-4 space-y-4">
                        <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4 ">
                            
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
