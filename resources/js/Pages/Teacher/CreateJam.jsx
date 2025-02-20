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
import { Head } from '@inertiajs/react';
import Categories from '@/Components/Categories';
import BoardContainer_Journey from '../Jam/BoardContainer_Journey';

const CreateJam = () => {
    const { auth } = usePage().props;
    const [numQuestions, setNumQuestions] = useState(5);
    const [timeLimit, setTimeLimit] = useState(30);
    const [category, setCategory] = useState('');
    const [journeyFor, setJourneyFor] = useState('');
    const [showScores, setShowScores] = useState(true);
    const [existingJam, setExistingJam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [participants, setParticipants] = useState([]);
    const hasJoinedParticipants = participants.some(participant => participant.status === "joined");

    useEffect(() => {
        const fetchExistingJam = async () => {
            const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
            if (!baseUrl) {
                console.error('Base URL not found.');
                return;
            }

            const apiUrl = `${baseUrl}/math-journey/check-existing?teacher_id=${auth.user.id}`;

            try {
                const response = await fetch(apiUrl);
                const data = await response.json();

                if ((response.ok && data.jam) || data.redirect) {
                    setExistingJam(data.jam);
                    localStorage.setItem('existingJam', JSON.stringify(data.jam));

                    if (data.redirect) {
                        window.location.href = data.redirect;
                    }
                } else {
                    setExistingJam(null);
                    localStorage.removeItem('existingJam');
                }
            } catch (error) {
                console.error('Error fetching existing jam:', error);
            } finally {
                setTimeout(() => {
                    setLoading(false);
                }, 2000);
            }
        };

        fetchExistingJam();
    }, [auth.user.id]);

    useEffect(() => {
        const disableRightClick = (event) => {
            event.preventDefault();
        };

        const disableReload = (event) => {
            if (event.key === 'F5' || (event.ctrlKey && event.key === 'r') || (event.ctrlKey && event.key === 'R')) {
                event.preventDefault();
                Swal.fire({
                    icon: 'warning',
                    title: 'Action Blocked',
                    text: 'Page reload is disabled on this section.',
                });
            }
        };

        document.addEventListener('contextmenu', disableRightClick);
        window.addEventListener('keydown', disableReload);

        return () => {
            document.removeEventListener('contextmenu', disableRightClick);
            window.removeEventListener('keydown', disableReload);
        };
    }, []);

    useEffect(() => {
        if (existingJam) {
            localStorage.setItem('existingJam', JSON.stringify(existingJam));
        }
    }, [existingJam]);

    useEffect(() => {
        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
        const sseUrl = `${baseUrl}/math-journey/stream-participants?teacher_id=${auth.user.id}`;

        let eventSource;

        const connectSSE = () => {
            eventSource = new EventSource(sseUrl);

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setParticipants(data);
            };

            eventSource.onerror = (error) => {
                // console.error("SSE Error:", error);
                eventSource.close();
                setTimeout(() => {
                    // console.log("Reconnecting SSE...");
                    connectSSE();
                }, 1000);
            };
        };

        connectSSE();

        const beforeUnloadHandler = (event) => {
            handleDisconnect();
        };

        window.addEventListener('beforeunload', beforeUnloadHandler);

        const offlineHandler = () => {
            handleDisconnect();
            Swal.fire({
                icon: 'error',
                title: 'Connection Lost',
                text: 'You have been disconnected due to a lost internet connection.',
                confirmButtonColor: '#d33',
                allowOutsideClick: false,
            }).then(() => {
                window.location.reload();
            });
        };

        window.addEventListener('offline', offlineHandler);

        return () => {
            eventSource?.close();
            window.removeEventListener('beforeunload', beforeUnloadHandler);
            window.removeEventListener('offline', offlineHandler);
        };
    }, [auth.user.id]);

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0,
                v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    const handleCreateJam = async () => {
        if (existingJam) {
            alert('You already have an ongoing Math Journey. Please finish it before creating a new one.');
            return;
        }

        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
        if (!baseUrl) {
            console.error('Base URL not found.');
            alert('Base URL not found.');
            return;
        }

        const apiUrl = `${baseUrl}/math-journey/create`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}',
                },
                body: JSON.stringify({
                    math_jam_id: generateUUID(),
                    teacher_id: auth.user.id,
                    num_questions: parseInt(numQuestions, 10),
                    time_limit: parseInt(timeLimit, 10),
                    math_journey_for: journeyFor,
                    category,
                    show_scores: showScores ? 1 : 0,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Math Journey created successfully!',
                }).then(() => {
                    setExistingJam(data.jam);
                    localStorage.setItem('existingJam', JSON.stringify(data.jam));
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to create Math Journey',
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
            text: 'Are you sure you want to cancel this Math Journey?',
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

            const apiUrl = `${baseUrl}/math-journey/cancel`;

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}',
                    },
                    body: JSON.stringify({
                        jam_id: existingJam.id,
                    }),
                });

                const data = await response.json();
                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Math Journey cancelled',
                        text: 'The Math Journey has been cancelled successfully.',
                    });
                    setExistingJam(null);
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Failed to cancel the Math Journey',
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

    const handleDisconnect = async () => {
        const existingJam = JSON.parse(localStorage.getItem('existingJam'));

        if (!existingJam || !existingJam.math_jam_id) return;

        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
        if (!baseUrl) return;

        const apiUrl = `${baseUrl}/math-journey/disconnect_jam`;

        try {
            await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}',
                },
                body: JSON.stringify({
                    math_jam_id: existingJam.math_jam_id,
                }),
            });
        } catch (err) {
            console.error('Error during disconnect:', err);
        }
    };

    const handleStart = async () => {
        if (!existingJam) return;

        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
        if (!baseUrl) {
            console.error('Base URL not found.');
            return;
        }

        const apiUrl = `${baseUrl}/math-journey/update-status`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    math_jam_id: existingJam.math_jam_id,
                    status: 'started',
                }),
            });

            if (response.ok) {
                // console.log('Math Jam status updated to start');
            } else {
                console.error('Failed to update Math Jam status');
            }
        } catch (error) {
            console.error('Error updating Math Jam status:', error);
        }
    };

    const waitingList = participants
        .filter((participant) => participant.status === 'joined')
        .map((participant) => ({
            id: participant.id,
            name: participant.name,
            user_type: 'Student',
            score: participant.score,
        }));

    return (
        <>
            <Head title="Math Journey" />
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
                    {/* <SvgAsset
                        movement="sm"
                        value="/images/assets/background/students_jam.svg"
                        className=" hidden sm:block sm:absolute top-0 right-40 h-full z-0"
                    /> */}

                    {/* Main Content */}
                    <div className=" z-1 h-full">
                        {loading ? (
                            <LoadingScreen time={2000} text="Checking for existing session..." />
                        ) : (
                            <>
                                <div className=" bg-gray-200 p-4 rounded-3xl max-w-[400px] h-full overflow-y-auto">
                                    <div className="h-full flex flex-col">
                                        <div className=" h-full flex flex-col">
                                            <h2 className="text-xl text-primary font-semibold text-start mb-8">
                                                {existingJam ? 'Ongoing Math Session' : 'Create a Live Session'}
                                            </h2>
                                            {existingJam ? (
                                                <>
                                                    <div className="mb-4 p-4 bg-blue-100 text-gray-600 rounded-3xl h-max flex flex-col gap-2">
                                                        <p className="font-semibold">
                                                            Code:{' '}
                                                            <span className="font-normal">
                                                                {existingJam.math_jam_code}
                                                            </span>
                                                        </p>
                                                        <p className="font-semibold">
                                                            Questions:{' '}
                                                            <span className="font-normal">
                                                                {existingJam.num_questions}
                                                            </span>
                                                        </p>
                                                        <p className="font-semibold">
                                                            Time Limit:{' '}
                                                            <span className="font-normal">
                                                                {existingJam.time_limit} sec
                                                            </span>
                                                        </p>
                                                        <p className="font-semibold">
                                                            Math Journey For:{' '}
                                                            <span className="font-normal">{existingJam.math_journey_for}</span>
                                                        </p>
                                                        <p className="font-semibold">
                                                            Category:{' '}
                                                            <span className="font-normal">{existingJam.category}</span>
                                                        </p>
                                                        <p className="font-semibold">
                                                            Status:{' '}
                                                            <span className="font-normal">
                                                                {existingJam.status.charAt(0).toUpperCase() + existingJam.status.slice(1)}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div className="bg-white flex-1 m-1 mb-5 rounded-3xl overflow-y-auto">
                                                        <StudentList data={waitingList} />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="">
                                                    <div className="mb-4">
                                                        <InputLabel value="Number of Questions" />
                                                        <TextInput
                                                            type="number"
                                                            className="w-full"
                                                            value={numQuestions}
                                                            min={1}
                                                            max={60}
                                                            onChange={(e) => {
                                                                const value = Math.min(60, Number(e.target.value));
                                                                setNumQuestions(value);
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Time Limit */}
                                                    <div className="mb-4">
                                                        <InputLabel value="Time Limit per Question (in seconds)" />
                                                        <TextInput
                                                            type="number"
                                                            className="w-full"
                                                            value={timeLimit}
                                                            min={1}
                                                            max={600}
                                                            onChange={(e) => {
                                                                const value = Math.min(600, Number(e.target.value));
                                                                setTimeLimit(value);
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="mb-7">
                                                        <InputLabel value="Math Journey For:" />
                                                        <SelectInput
                                                            className="custom-class"
                                                            isFocused={true}
                                                            placeholder="Select an option"
                                                            value={journeyFor}
                                                            onChange={(e) => setJourneyFor(e.target.value)}
                                                        >
                                                            <option value="Assignment">Assignment</option>
                                                            <option value="Pre-Assessment">Pre-Assessment</option>
                                                            <option value="Post-Assessment">Post-Assessment</option>
                                                            <option value="Quiz">Quiz</option>
                                                        </SelectInput>
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
                                                            {Object.entries(Categories).map(([type, options]) => (
                                                                <optgroup key={type} label={type}>
                                                                    {options.map((cat) => (
                                                                        <option key={cat} value={cat}>
                                                                            {cat}
                                                                        </option>
                                                                    ))}
                                                                </optgroup>
                                                            ))}
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
                                                </div>
                                            )}
                                        </div>
                                        {/* Number of Questions */}
                                        <div className="flex justify-between items-center sm:px-8 px-3 pb-3 ">
                                            {existingJam ? (
                                                <>
                                                    <PrimaryButton
                                                        onClick={handleCancelJam}
                                                        className="w-max  px-5  bg-red-500 hover:bg-red-600"
                                                    >
                                                        Cancel
                                                    </PrimaryButton>

                                                    {hasJoinedParticipants ? (
                                                        <Link
                                                            href="/math-journey/watch"
                                                            onClick={(e) => {
                                                                handleStart();
                                                                if (existingJam) {
                                                                    localStorage.setItem("category", existingJam.category);
                                                                    localStorage.setItem("existingJam", JSON.stringify(existingJam));
                                                                }
                                                            }}
                                                        >
                                                            <PrimaryButton className="w-max px-5">Start</PrimaryButton>
                                                        </Link>
                                                    ) : (
                                                        <PrimaryButton className="w-max px-5 opacity-50 cursor-not-allowed" disabled>
                                                            Start
                                                        </PrimaryButton>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <Link href={'/dashboard'}>
                                                        <PrimaryButton className="bg-danger w-fit px-5">
                                                            Go Back
                                                        </PrimaryButton>
                                                    </Link>
                                                    <PrimaryButton onClick={handleCreateJam} className="w-max px-5">
                                                        Create
                                                    </PrimaryButton>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </BoardOverlay>
        </>
    );
};

export default CreateJam;
