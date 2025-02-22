import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { SvgAsset } from '@/Components/SvgAsset';
import Avatar from '@/Components/Avatar';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/Components/ui/dialog';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Swal from 'sweetalert2';
const students = [
    {
        id: 1,
        name: 'John Doe',
    },
    {
        id: 2,
        name: 'Jane Smith',
    },
    {
        id: 3,
        name: 'Bob Johnson',
    },
];
const AddStudent = () => {
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');

    const handleEmail = async () => {
        setShowEmailModal(false); // Close the email modal first

        await Swal.fire({
            title: 'Invitation Sent!',
            text: 'The student will receive an invitation in their email.',
            icon: 'success',
            confirmButtonText: 'Confirm',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'bg-pink-600 hover:bg-pink-700 text-white font-semibold py-4 px-9 rounded-2xl uppercase',
            },
        });

        setShowOtpModal(true); // Open the OTP modal after SweetAlert is closed
    };

    const handleOtp = () => {
        Swal.fire({
            title: 'OTP Verified!',
            text: "The student's email has been successfully verified.",
            icon: 'success',
            confirmButtonText: 'Okay',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'bg-pink-600 hover:bg-pink-700 text-white font-semibold py-4 px-9 rounded-2xl uppercase',
            },
        });

        setEmail('');
        setOtp('');
        setShowOtpModal(false);
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Modules</h2>}>
            <Head title="Manage Students" />
            <div className="pt-12 sm:px-6 lg:px-11 max-w-[100rem] mx-auto mb-5">
                <div className="grid lg:grid-cols-2 gap-4 bg-gradient-to-tl from-[#FF69B4] to-[#ffea96] rounded-2xl min-h-96">
                    <div className="w-full relative">
                        <SvgAsset
                            movement="sm"
                            value="/images/assets/background/add_student.svg"
                            className="sm:h-[45rem] absolute sm:-top-40 top-0 left-0 z-0"
                            draggable={false}
                        />
                    </div>
                    <div className="flex flex-col items-center justify-center relative z-[1] text-center">
                        <div className="bg-white p-5 mx-7 rounded-2xl">
                            <h1 className="sm:text-4xl text-base font-bold mb-4 text-pink-800">
                                Help Your Child Unlock Their Math Potential!
                            </h1>
                            <p className="sm:text-lg text-xs text-center max-w-md mx-auto px-4 text-gray-600 font-medium">
                                Track your student's math journey from their first steps to their highest achievements.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-12 sm:px-6 lg:px-11 max-w-[100rem] mx-auto">
                <div className="bg-gray-100 w-full p-8 mb-5 rounded-2xl">
                    <h3 className="font-semibold text-2xl text-pink-800 mb-5">Manage Students</h3>
                    <div className="rounded-2xl grid grid-cols-2 gap-4">
                        {students.length > 0 ? (
                            students.map((student) => (
                                <div key={student.id} className="bg-white p-5 rounded-xl text-gray-700">
                                    <div className="flex items-center gap-3">
                                        <Avatar name={student.name} />
                                        <h3 className="font-semibold">{student.name}</h3>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-2xl flex items-center justify-center min-h-[5rem] text-gray-600 border border-gray-300 border-dashed gap-3  ">
                                <Plus className="p-1 text-pink-500 bg-white rounded-full" />
                                <h3 className="font-semibold">No students added yet.</h3>
                            </div>
                        )}

                        <div
                            className="bg-gradient-to-tl from-[#FF69B4] to-[#ffea96] rounded-2xl flex items-center justify-center min-h-[5rem] text-white gap-3 hover:cursor-pointer hover:scale-105 transition"
                            onClick={() => setShowEmailModal(true)}
                        >
                            <Plus className="p-1 text-pink-500 bg-white rounded-full" />
                            <h3 className="font-semibold">Manage New Student</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Email Dialog */}
            <Dialog open={showEmailModal} onOpenChange={() => setShowEmailModal(false)}>
                <DialogContent className="p-5 max-w-md mx-auto">
                    <DialogTitle className="font-semibold text-2xl text-pink-700">Add New Student</DialogTitle>
                    <DialogDescription className="text-sm text-gray-600">
                        Please enter the email address of the student you want to manage.
                    </DialogDescription>
                    <TextInput
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Student Email"
                        className="mt-4"
                    />
                    <div className="flex justify-end items-center w-full">
                        <PrimaryButton className="mt-4 w-max bg-pink-500" onClick={handleEmail}>
                            Send OTP
                        </PrimaryButton>
                    </div>
                </DialogContent>
            </Dialog>

            {/* OTP Dialog */}
            <Dialog open={showOtpModal} onOpenChange={() => setShowOtpModal(false)}>
                <DialogContent className="p-5 max-w-md mx-auto">
                    <DialogTitle className="font-semibold text-2xl text-pink-700">Verify One-Time-Pin</DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 mt-4">
                        Enter the OTP sent to the student's email.
                    </DialogDescription>
                    <TextInput
                        type="text"
                        name="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                        className="mt-4"
                    />
                    <div className="flex justify-end items-center w-full">
                        <PrimaryButton className="mt-4 w-max  bg-pink-500" onClick={handleOtp}>
                            Verify OTP
                        </PrimaryButton>
                    </div>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
};

export default AddStudent;
