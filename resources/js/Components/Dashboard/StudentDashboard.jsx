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

export function StudentDashboard(result) {
    let data = result.data;

    return (
        <div className="py-12">
            <div className="mx-auto max-w-[100rem] sm:px-6 lg:px-8">
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
        </div>
    );
}
