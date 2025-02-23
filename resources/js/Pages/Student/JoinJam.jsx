import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { Head } from '@inertiajs/react';
import { useRef } from 'react';
import BoardOverlay from '@/Components/BoardOverlay';
import { SvgAsset } from '@/Components/SvgAsset';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Avatar from '@/Components/Avatar';
import { Link } from '@inertiajs/react';
import LoadingScreen from '@/Components/LoadingScreen';

const JoinJam = () => {
    const { auth } = usePage().props;
    const studentId = auth?.user.id;
    const studentName = auth?.user.name;
    const studentImg = '';

    const [jamCode, setJamCode] = useState(sessionStorage.getItem('jamCode') || '');
    const [status, setStatus] = useState('');
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(false);
    const hasReloaded = useRef(false);
    const [existingJam, setExistingJam] = useState(null);

    useEffect(() => {
        const storedJam = localStorage.getItem('existingJam');
        if (storedJam) {
            const parsedJam = JSON.parse(storedJam);
            setExistingJam(parsedJam);
            if (parsedJam.status === "disconnected" && status == "joined") {
                showDisconnectedSwal();
            }
        }
    }, [status]);

    useEffect(() => {
        sessionStorage.setItem('jamCode', jamCode);
    }, [jamCode]);

    const handleJoinJam = async () => {
        if (!studentId) {
            Swal.fire({
                icon: 'error',
                title: 'Authentication Error',
                text: 'Student not authenticated.',
            });
            return;
        }

        setLoading(true);
        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
        if (!baseUrl) {
            Swal.fire({
                icon: 'error',
                title: 'Base URL Error',
                text: 'Base URL not found.',
            });
            return;
        }

        const apiUrl = `${baseUrl}/math-journey/join`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}',
                },
                body: JSON.stringify({
                    student_id: studentId,
                    math_jam_code: jamCode,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.message) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Join Jam Failed',
                        text: data.message,
                    });
                }

                setStatus(data.status);
                setScore(data.score);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Join Jam Failed',
                    text: data.message || 'Failed to join the Math Journey',
                });
            }
        } catch (err) {
            console.error('Error joining the Math Journey:', err);
            Swal.fire({
                icon: 'error',
                title: 'An error occurred',
                text: 'Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!studentId || !jamCode) return;

        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
        if (!baseUrl) return;

        const apiUrl = `${baseUrl}/math-journey/disconnect`;

        try {
            await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}',
                },
                body: JSON.stringify({
                    student_id: studentId,
                    math_jam_code: jamCode,
                }),
            });
        } catch (err) {
            console.error('Error during disconnect:', err);
        }
    };

    useEffect(() => {
        if (!studentId) return;

        const checkStatus = async () => {
            if (!studentId) return;

            try {
                const response = await fetch(
                    `/math-journey/check-status?student_id=${studentId}&math_jam_code=${jamCode}`,
                );
                const data = await response.json();

                if (data.error) {
                    sessionStorage.removeItem('jamCode');
                    setJamCode('');
                    return;
                }

                setStatus(data.status);
                setScore(data.score);
                setJamCode(data.math_jam_code);
            } catch (err) {
                console.error('Error checking status:', err);
            }
        };

        checkStatus();

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
    }, [studentId]);

    const handleReconnect = async () => {
        if (!studentId || !jamCode) {
            Swal.fire({
                icon: 'error',
                title: 'Reconnect Failed',
                text: 'Student ID or Jam Code is missing.',
            });
            return;
        }

        setLoading(true);
        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
        if (!baseUrl) {
            Swal.fire({
                icon: 'error',
                title: 'Base URL Error',
                text: 'Base URL not found.',
            });
            return;
        }

        const apiUrl = `${baseUrl}/math-journey/reconnect`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}',
                },
                body: JSON.stringify({
                    student_id: studentId,
                    math_jam_code: jamCode,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus(data.status);
                setScore(data.score);
                localStorage.setItem('existingJam', JSON.stringify(data.jam));
                Swal.fire({
                    icon: 'success',
                    title: 'Reconnected!',
                    text: 'You have successfully rejoined the Math Journey.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Reconnect Failed',
                    text: data.message || 'Failed to reconnect to the Math Journey.',
                }).then(() => {
                    if (data.message.includes('Cancelled') || data.message.includes('Ended')) {
                        location.reload();
                    }
                });
            }
        } catch (err) {
            console.error('Error reconnecting:', err);
            Swal.fire({
                icon: 'error',
                title: 'An error occurred',
                text: 'Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');

        if (!jamCode || !studentId) return;

        const sseUrl = `${baseUrl}/math-journey/jam-stream-updates?math_jam_code=${jamCode}`;
        let eventSource;

        const connectSSE = () => {
            eventSource = new EventSource(sseUrl);

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                localStorage.setItem('existingJam', JSON.stringify(data));

                if (data && data.status === 'started') {
                    localStorage.removeItem('disconnectedParticipant');
                    localStorage.setItem('existingJam', JSON.stringify(data));

                    setTimeout(() => {
                        window.location.href = '/math-journey/play';
                    }, 100);
                } else if (data.status === 'cancelled' || data.status === 'ended') {
                    eventSource.close();

                    Swal.fire({
                        icon: data.status === 'cancelled' ? 'error' : 'info',
                        title: data.status === 'cancelled' ? 'Math Journey Cancelled' : 'Math Journey Ended',
                        text: data.status === 'cancelled'
                            ? 'The Math Journey session has been cancelled.'
                            : 'The Math Journey session has ended. Thank you for participating!',
                        confirmButtonColor: '#d33',
                        allowOutsideClick: false,
                    }).then(() => {
                        if (!hasReloaded.current) {
                            hasReloaded.current = true;
                            handleDisconnect();
                            window.location.reload();
                        }
                    });

                    return;
                }
            };

            eventSource.onerror = () => {
                eventSource.close();
                setTimeout(() => {
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
    }, [jamCode, studentId]);

    const showDisconnectedSwal = () => {
        Swal.fire({
            title: 'Waiting for Host to Reconnect...',
            text: 'Please wait while we attempt to reconnect.',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: true,
            confirmButtonText: 'Exit Game',
            confirmButtonColor: '#d33',
            didOpen: () => {
                Swal.showLoading();
            }
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '/math-journey-join';
            }
        });
    };

    return (
        <>
            <Head title="Math Journey" />
            <BoardOverlay>
                {loading ? <LoadingScreen time={2000} text="Loading..." /> : null}
                <div className="w-full h-full  bg-white rounded-3xl sm:p-8 p-2 flex flex-col justify-center relative overflow-hidden box-border">
                    <img
                        className="hidden sm:block sm:absolute top-0 -right-16 h-full opacity-20"
                        src="/images/assets/shapes/shape-tricolor.svg"
                        alt=""
                    />
                    <img
                        className="hidden sm:block sm:absolute top-0 -right-20 h-full opacity-100"
                        src="/images/assets/shapes/shape-tricolor.svg"
                        alt=""
                        draggable={false}
                    />

                    <SvgAsset
                        movement="sm"
                        value="/images/assets/background/students_jam.svg"
                        className=" hidden sm:block sm:absolute top-0 right-40 h-full z-0 "
                        draggable={false}
                    />
                    <div className="bg-gray-200 p-6 rounded-3xl max-w-[400px] h-max flex flex-col justify-between overflow-hidden relative z-10">
                        <h2 className="text-primary text-xl font-semibold  mb-4">Join Math Journey</h2>

                        <div className="bg-white flex items-center justify-start gap-4 p-3 rounded-3xl mb-8">
                            {studentImg ? <Avatar image={studentImg} /> : <Avatar name={studentName} />}
                            <span>
                                <h4 className="font-bold text-primary">Welcome</h4>
                                <h3 className="font-semibold text-2xl capitalize text-gray-500">{studentName}</h3>
                            </span>
                        </div>

                        {status === 'disconnected' ? (
                            <div className="bg-red-100 p-4 rounded mb-4">
                                <h3 className="font-semibold text-red-700">You were disconnected!</h3>
                                <p>Would you like to reconnect?</p>
                                <button
                                    onClick={handleReconnect}
                                    className="w-full bg-green-500 text-white py-2 px-4 rounded mt-2"
                                    disabled={loading}
                                >
                                    {loading ? 'Reconnecting...' : 'Reconnect'}
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4">
                                    <label htmlFor="jamCode" className="block text-sm font-medium text-gray-700">
                                        Math Journey Code
                                    </label>
                                    <TextInput
                                        type="text"
                                        id="jamCode"
                                        value={jamCode}
                                        onChange={(e) => setJamCode(e.target.value)}
                                        className="w-full mt-1 p-2 border rounded"
                                        placeholder="Enter Math Journey Code"
                                    />
                                </div>

                                <div className="flex justify-between my-7">
                                    <Link href="/dashboard">
                                        {' '}
                                        <PrimaryButton className="w-fit px-4 bg-danger">Go Back</PrimaryButton>
                                    </Link>

                                    <PrimaryButton onClick={handleJoinJam} className="w-fit" disabled={loading}>
                                        {loading ? 'Joining...' : 'Join '}
                                    </PrimaryButton>
                                </div>

                                {status && (
                                    <div className="bg-yellow-100 p-4 rounded mb-4">
                                        <h3 className="font-semibold">
                                            Status: {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </h3>
                                        <p>Score: {score}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </BoardOverlay>
        </>
    );
};

export default JoinJam;
