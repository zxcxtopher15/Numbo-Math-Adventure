import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { SvgAsset } from '@/Components/SvgAsset';

export default function GuestLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col items-center pt-6 sm:justify-center sm:pt-0 bg-gradient-to-r from-teal-400 to-yellow-200 1  relative overflow-hidden">
      {/* Svg UI designs */}
      <SvgAsset value="1" className="bottom-0 left-0 w-96" />
      <SvgAsset value="2" className="bottom-10 right-10 w-36 blur-none" />
      <SvgAsset value="3" className="bottom-30 right-40 w-48" />
      <SvgAsset value="4" className="top-10 left-40 w-48" />

      <div className="mt-6 w-full relative overflow-hidden bg-white px-6 py-4 sm:max-w-md sm:rounded-3xl">
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
