import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import axios from 'axios'; // ✅ make sure axios is imported

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [otpProcessing, setOtpProcessing] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpVerificationError, setOtpVerificationError] = useState('');
    const [emailDisabled, setEmailDisabled] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        username: '',
        password: '',
        password_confirmation: '',
        user_type: 'Student',
        student_id: '',
    });

    useEffect(() => {
        let timer;
        if (resendCountdown > 0) {
            timer = setInterval(() => {
                setResendCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCountdown]);

    const sendOtp = async () => {
        if (!data.email) {
            setOtpError('Please enter your email first.');
            return;
        }
        setOtpError('');
        setOtpProcessing(true);
        try {
            const response = await axios.post(route('send-otp'), { email: data.email });

            setOtpSent(true);
            setResendCountdown(120);
            setOtpVerified(false);

            setEmailDisabled(true);
        } catch (error) {
            if (error.response && error.response.data.error) {
                setOtpError(error.response.data.error);
            } else {
                setOtpError('Failed to send OTP. Please check the email address.');
            }
        } finally {
            setOtpProcessing(false);
        }
    };

    const verifyOtp = async () => {
        if (otp.trim() === '') {
            setOtpVerificationError('Please enter the OTP sent to your email.');
            return;
        }
        setOtpProcessing(true);
        try {
            const response = await axios.post(route('verify-otp'), {
                email: data.email,
                otp,
            });

            if (response.data.message === 'OTP verified successfully.') {
                setOtpVerified(true);
                setOtpVerificationError('');
            } else {
                setOtpVerified(false);
                setOtpVerificationError('Invalid OTP. Please try again.');
            }
        } catch (error) {
            setOtpVerificationError('Verification failed. Please try again.');
        } finally {
            setOtpProcessing(false);
        }
    };

    const submit = async (e) => {
        e.preventDefault();

        if (data.user_type === 'Parent' && !otpVerified) {
            setOtpError('Please verify the OTP before registering.');
            return;
        }

        post(route('register'), {
            data: { ...data, otp },
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const togglePasswordVisibilityConfirm = () => {
        setShowPasswordConfirm(!showPasswordConfirm);
    };

    return (
        <GuestLayout size={'2xl'}>
            <Head title="Register" />

            <form onSubmit={submit}>
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-5">
                        <label className="flex justify-center items-center border border-dashed border-gray-400 bg-gray-100 rounded-2xl relative transition-all duration-200 peer-checked:ring-4 peer-checked:ring-primary peer-checked:border-primary">
                            <input
                                type="radio"
                                name="user_type"
                                value="Student"
                                className="hidden peer"
                                checked={data.user_type === 'Student'}
                                onChange={(e) => setData('user_type', e.target.value)}
                            />
                            <img
                                src="/images/assets/avatar/student.svg"
                                alt=""
                                className="absolute bottom-0 left-0 w-24 h-24"
                            />
                            <h1 className="text-2xl py-3 ml-9 font-bold text-gray-500 peer-checked:text-primary">
                                Student
                            </h1>
                        </label>
                        <label className="flex justify-center items-center border border-dashed border-gray-400 bg-gray-100 rounded-2xl relative transition-all duration-200 peer-checked:ring-4 peer-checked:ring-primary peer-checked:border-primary">
                            <input
                                type="radio"
                                name="user_type"
                                value="Parent"
                                className="hidden peer"
                                checked={data.user_type === 'Parent'}
                                onChange={(e) => setData('user_type', e.target.value)}
                            />

                            <img
                                src="/images/assets/avatar/parent.svg"
                                alt=""
                                className="absolute bottom-0 left-0 w-24 h-24"
                            />
                            <h1 className="text-2xl py-3 ml-9 font-bold text-gray-500 peer-checked:text-primary">
                                Parent
                            </h1>
                        </label>
                        <label className="flex justify-center items-center border border-dashed border-gray-400 bg-gray-100 rounded-2xl relative transition-all duration-200 peer-checked:ring-4 peer-checked:ring-primary peer-checked:border-primary">
                            <input
                                type="radio"
                                name="user_type"
                                value="Teacher"
                                className="hidden peer"
                                checked={data.user_type === 'Teacher'}
                                onChange={(e) => setData('user_type', e.target.value)}
                            />

                            <img
                                src="/images/assets/avatar/teacher.svg"
                                alt=""
                                className="absolute bottom-0 left-0 w-24 h-24"
                            />
                            <h1 className="text-2xl py-3 ml-9 font-bold text-gray-500 peer-checked:text-primary">
                                Teacher
                            </h1>
                        </label>
                    </div>

                    <div>
                        <InputLabel htmlFor="name" value="Name" />
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>
                    {data.user_type === 'Student' && (
                        <div className="mt-4">
                            <InputLabel htmlFor="student_id" value="Student ID" />
                            <TextInput
                                id="student_id"
                                type="text"
                                name="student_id"
                                value={data.student_id || ''}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('student_id', e.target.value)}
                                required
                            />
                            <InputError message={errors.student_id} className="mt-2" />
                        </div>
                    )}
                    <div className="mt-4">
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            disabled={emailDisabled}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="username" value="Username" />
                        <TextInput
                            id="username"
                            type="text"
                            name="username"
                            value={data.username}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            onChange={(e) => setData('username', e.target.value)}
                            required
                        />
                        <InputError message={errors.username} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="password" value="Password" />
                        <div className="relative flex items-center justify-center">
                            <TextInput
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <div
                                className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </div>
                        </div>
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                        <div className="relative flex items-center justify-center">
                            <TextInput
                                id="password_confirmation"
                                type={showPasswordConfirm ? 'text' : 'password'}
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            <div
                                className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                onClick={togglePasswordVisibilityConfirm}
                            >
                                {showPasswordConfirm ? <FaEyeSlash /> : <FaEye />}
                            </div>
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    {data.user_type === 'Parent' && (
                        <div className="mt-4">
                            <div className="flex items-center gap-2">
                                <PrimaryButton
                                    type="button"
                                    onClick={sendOtp}
                                    disabled={otpProcessing || resendCountdown > 0}
                                >
                                    {otpSent ? 'Resend OTP' : 'Send OTP'}
                                </PrimaryButton>
                                {otpProcessing && <span className="text-sm text-gray-500">Processing...</span>}
                                {resendCountdown > 0 && (
                                    <span className="text-sm text-gray-500">
                                        Resend in {resendCountdown}s
                                    </span>
                                )}
                            </div>

                            {otpSent && (
                                <div className="mt-2">
                                    <InputLabel htmlFor="otp" value="Enter OTP" />
                                    <TextInput
                                        id="otp"
                                        type="text"
                                        name="otp"
                                        value={otp}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                    />
                                    <PrimaryButton
                                        type="button"
                                        className="mt-2"
                                        onClick={verifyOtp}
                                        disabled={otpProcessing}
                                    >
                                        Verify OTP
                                    </PrimaryButton>
                                    {otpVerified && (
                                        <span className="text-green-500 ml-2">✅ Verified</span>
                                    )}
                                </div>
                            )}
                            {otpError && <InputError message={otpError} className="mt-2" />}
                            {otpVerificationError && <InputError message={otpVerificationError} className="mt-2" />}
                        </div>
                    )}
                </div>

                <div className="mt-10 flex flex-col items-center justify-center bg-primary-100">
                    <PrimaryButton disabled={processing || (data.user_type === 'Parent' && !otpVerified)}>
                        Register
                    </PrimaryButton>
                    <span className="mt-5">
                        <Link
                            href={route('login')}
                            className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Already registered?
                        </Link>
                    </span>
                </div>
            </form>
        </GuestLayout>
    );
}
