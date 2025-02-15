import React, { useState, useEffect } from 'react';
import TextInput from '@/components/TextInput';
import PrimaryButton from '@/components/PrimaryButton';
import InputLabel from '@/components/InputLabel';
import { usePage, Link } from '@inertiajs/react';
import BoardOverlay from '@/Components/BoardOverlay';
import Checkbox from '@/Components/Checkbox';
import SelectInput from '@/Components/SelectInput';
import { SvgAsset } from '@/Components/SvgAsset';
import StudentList from '@/Components/StudentList';
import Swal from 'sweetalert2';
import LoadingScreen from '@/Components/LoadingScreen';

const CreateJam = () => {
    const { auth } = usePage().props;
    const [numQuestions, setNumQuestions] = useState(5);
    const [timeLimit, setTimeLimit] = useState(30);
    const [category, setCategory] = useState('math');
    const [showScores, setShowScores] = useState(true);
    const [existingJam, setExistingJam] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExistingJam = async () => {
            const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
            if (!baseUrl) {
                console.error('Base URL not found.');
                return;
            }

            const apiUrl = `${baseUrl}/math-jams/check-existing?teacher_id=${auth.user.id}`;

            try {
                const response = await fetch(apiUrl);
                const data = await response.json();

                if (response.ok && data.jam) {
                    setExistingJam(data.jam);
                } else {
                    setExistingJam(null);
                }
            } catch (error) {
                console.error('Error fetching existing jam:', error);
            } finally {
                setTimeout(() => {
                    setLoading(false);
                }, 2000); //
            }
        };

        fetchExistingJam();
    }, [auth.user.id]);

    // useEffect(() => {
    //   const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute("content");
    //   const sseUrl = `${baseUrl}/math-jams/stream-updates?teacher_id=${auth.user.id}`;

    //   let eventSource;

    //   const connectSSE = () => {
    //     eventSource = new EventSource(sseUrl);

    //     eventSource.onmessage = (event) => {
    //       const data = JSON.parse(event.data);

    //       if (data && (data.status === "waiting" || data.status === "started")) {
    //         setExistingJam(data);
    //       } else {
    //         setExistingJam(null);
    //       }
    //     };

    //     eventSource.onerror = (error) => {
    //       // console.error("SSE Error:", error);
    //       eventSource.close();
    //       setTimeout(() => {
    //         // console.log("Reconnecting SSE...");
    //         connectSSE();
    //       }, 1000);
    //     };
    //   };

    //   connectSSE();

    //   return () => {
    //     eventSource?.close();
    //   };
    // }, [auth.user.id]);

    const handleCreateJam = async () => {
        if (existingJam) {
            alert('You already have an ongoing Math Jam. Please finish it before creating a new one.');
            return;
        }

        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
        if (!baseUrl) {
            console.error('Base URL not found.');
            alert('Base URL not found.');
            return;
        }

        const apiUrl = `${baseUrl}/math-jams/create`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({
                    teacher_id: auth.user.id,
                    num_questions: parseInt(numQuestions, 10),
                    time_limit: parseInt(timeLimit, 10),
                    category,
                    show_scores: showScores ? 1 : 0,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Math Jam created successfully!',
                });
                setExistingJam(data.jam);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to create Math Jam',
                    text: data.message || 'An unknown error occurred',
                });
                console.error('Error details:', data);
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'An error occurred while creating the jam',
                text: 'Please try again later',
            });
        }
    };

    const handleCancelJam = async () => {
        const confirmed = await Swal.fire({
            title: 'Are you sure?',
            text: 'Are you sure you want to cancel this Math Jam?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, cancel it!',
        });

        if (confirmed.isConfirmed) {
            const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
            if (!baseUrl) {
                console.error('Base URL not found.');
                return;
            }

            const apiUrl = `${baseUrl}/math-jams/cancel`;

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    },
                    body: JSON.stringify({
                        jam_id: existingJam.id,
                    }),
                });

                const data = await response.json();
                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Math Jam cancelled',
                        text: 'The Math Jam has been cancelled successfully.',
                    });
                    setExistingJam(null);
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Failed to cancel the Math Jam',
                        text: data.message || 'An unknown error occurred',
                    });
                    console.error('Error details:', data);
                }
            } catch (error) {
                console.error('Fetch Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'An error occurred while cancelling the jam',
                    text: 'Please try again later',
                });
            }
        }
    };

    const waitingList = [
        {
            id: 1,
            name: 'John Doe',
            user_type: 'Student',
            score: 80,
        },
        {
            id: 2,
            name: 'Jane Doe',
            user_type: 'Student',
            score: 70,
        },
        {
            id: 3,
            name: 'Bob Smith',
            user_type: 'Teacher',
            score: 90,
        },
        {
            id: 4,
            name: 'Alice Johnson',
            user_type: 'Parent',
            score: 60,
        },
        {
            id: 5,
            name: 'Samantha Lee',
            user_type: 'Student',
            score: 50,
        },
        {
            id: 6,
            name: 'Emily Brown',
            user_type: 'Teacher',
            score: 40,
        },
        {
            id: 7,
            name: 'Michael Davis',
            user_type: 'Parent',
            score: 30,
        },
        {
            id: 8,
            name: 'Sarah Taylor',
            user_type: 'Student',
            score: 20,
        },
        {
            id: 9,
            name: 'Tom Harris',
            user_type: 'Teacher',
            score: 10,
        },
    ];

    return (
        <BoardOverlay>
            <div className="w-full h-full bg-white rounded-3xl sm:p-8 p-2 flex flex-col justify-center relative overflow-hidden box-border">
                <img
                    className="hidden sm:block sm:absolute top-0 -right-16 h-full opacity-20"
                    src="/images/assets/shapes/shape-tricolor.svg"
                    alt=""
                />
                <img
                    className="hidden sm:block sm:absolute top-0 -right-20 h-full opacity-100"
                    src="/images/assets/shapes/shape-tricolor.svg"
                    alt=""
                />
                <SvgAsset
                    movement="sm"
                    value="/images/assets/background/students_jam.svg"
                    className=" hidden sm:block sm:absolute top-0 right-40 h-full z-0"
                />

                {/* Main Content */}
                <div className="relative z-1 h-full">
                    {loading ? (
                        <LoadingScreen time={2000} text="Checking for existing session..." />
                    ) : (
                        <>
                            <div className="bg-gray-200  rounded-3xl max-w-[400px] h-full flex flex-col justify-between overflow-hidden">
                                <div className="sm:p-6 sm:pr-8 p-4 pt-9 h-full ">
                                    <h2 className="text-xl text-primary font-semibold text-start mb-8">
                                        {existingJam ? 'Ongoing Math Session' : 'Create a Live Session'}
                                    </h2>
                                    {existingJam ? (
                                        <>
                                            <div className="mb-4 p-4 bg-blue-100 text-gray-600 rounded-3xl flex flex-col gap-2">
                                                <p className="font-semibold">
                                                    Code:{' '}
                                                    <span className="font-normal">{existingJam.math_jam_code}</span>
                                                </p>
                                                <p className="font-semibold">
                                                    Questions:{' '}
                                                    <span className="font-normal">{existingJam.num_questions}</span>
                                                </p>
                                                <p className="font-semibold">
                                                    Time Limit:{' '}
                                                    <span className="font-normal">{existingJam.time_limit} sec</span>
                                                </p>
                                                <p className="font-semibold">
                                                    Category:{' '}
                                                    <span className="font-normal">{existingJam.category}</span>
                                                </p>
                                                <p className="font-semibold">
                                                    Status: <span className="font-normal">{existingJam.status}</span>
                                                </p>
                                            </div>
                                            <div className="h-full">
                                                <StudentList data={waitingList} />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="mb-4">
                                                <InputLabel value="Number of Questions" />
                                                <TextInput
                                                    type="number"
                                                    className="w-full"
                                                    value={numQuestions}
                                                    onChange={(e) => setNumQuestions(e.target.value)}
                                                />
                                            </div>

                                            {/* Time Limit */}
                                            <div className="mb-4">
                                                <InputLabel value="Time Limit per Question (in seconds)" />
                                                <TextInput
                                                    type="number"
                                                    className="w-full"
                                                    value={timeLimit}
                                                    onChange={(e) => setTimeLimit(e.target.value)}
                                                />
                                            </div>

                                            {/* Category Selection */}
                                            <div className="mb-7">
                                                <InputLabel value="Question Category" />
                                                <SelectInput
                                                    className="custom-class"
                                                    isFocused={true}
                                                    placeholder="Select an option"
                                                    value={category}
                                                    onChange={(e) => setCategory(e.target.value)}
                                                >
                                                    <option value="math">Math</option>
                                                    <option value="science">Science</option>
                                                    <option value="history">History</option>
                                                </SelectInput>
                                            </div>

                                            {/* Show Scores Checkbox */}
                                            <div className="flex items-center space-x-2 mb-4 px-4">
                                                <Checkbox
                                                    type="checkbox"
                                                    checked={showScores}
                                                    onChange={() => setShowScores(!showScores)}
                                                />
                                                <span className="ms-2 text-sm text-gray-600">
                                                    Show Scores to Students
                                                </span>
                                            </div>
                                        </>
                                    )}

                                    {/* Number of Questions */}
                                </div>
                                <div className="flex justify-between items-center sm:px-8 px-3 pb-8 ">
                                    {existingJam ? (
                                        <>
                                            <PrimaryButton
                                                onClick={handleCancelJam}
                                                className="w-max  px-5  bg-red-500 hover:bg-red-600"
                                            >
                                                Cancel
                                            </PrimaryButton>

                                            <PrimaryButton className="w-max px-5">Start</PrimaryButton>
                                        </>
                                    ) : (
                                        <>
                                            <Link href={'/dashboard'}>
                                                <PrimaryButton className="bg-danger w-fit px-5">Go Back</PrimaryButton>
                                            </Link>
                                            <PrimaryButton onClick={handleCreateJam} className="w-max px-5">
                                                Create
                                            </PrimaryButton>
                                        </>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </BoardOverlay>
    );
};

export default CreateJam;
