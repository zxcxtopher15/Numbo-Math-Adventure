import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { SvgAsset } from '@/Components/SvgAsset';

export default function GuestLayout({ children, size }) {
    return (
        <div className="flex min-h-screen flex-col items-center pt-6 sm:justify-center lg:py-5 sm:pt-0 p-2  bg-gradient-to-r from-teal-400 to-yellow-200 1  relative overflow-hidden">
            {/* Svg UI designs */}
            <SvgAsset value="/images/assets/shapes/1.svg" className="bottom-0 left-0 w-96" />
            <SvgAsset value="/images/assets/shapes/2.svg" className="bottom-10 right-10 w-36 blur-none" />
            <SvgAsset value="/images/assets/shapes/3.svg" className="bottom-30 right-40 w-56" />
            <SvgAsset value="/images/assets/shapes/4.svg" className="top-10 left-40 w-48" />

            <div
                className={`w-full relative overflow-hidden bg-white px-6 py-4 pb-16 sm:max-w-${size ?? 'lg'} rounded-3xl`}
            >
                <div className="flex justify-center items-center my-10">
                    <Link href="/">
                        <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                    </Link>
                </div>
                {children}
            </div>
        </div>
    );
}
