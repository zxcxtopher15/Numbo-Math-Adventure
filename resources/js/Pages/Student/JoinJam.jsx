import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { Head } from '@inertiajs/react';
import { useRef } from 'react';

const JoinJam = () => {
    const { auth } = usePage().props;
    const studentId = auth?.user.id;
    const studentName = auth?.user.name;

    const [jamCode, setJamCode] = useState(sessionStorage.getItem('jamCode') || '');
    const [status, setStatus] = useState('');
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(false);
    const hasReloaded = useRef(false);

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

        const apiUrl = `${baseUrl}/math-jams/join`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
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
                    text: data.message || 'Failed to join the Math Jam',
                });
            }
        } catch (err) {
            console.error('Error joining the Math Jam:', err);
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
        if (!studentId) return;

        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
        if (!baseUrl) return;

        const apiUrl = `${baseUrl}/math-jams/disconnect`;

        try {
            await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
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
                    `/math-jams/check-status?student_id=${studentId}&math_jam_code=${jamCode}`
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
                console.error("Error checking status:", err);
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

        const handleBeforeUnload = (event) => {
            handleDisconnect();
        };

        const handleNetworkChange = () => {
            if (navigator.onLine === false) {
                handleDisconnect();
            }
        };

        document.addEventListener('contextmenu', disableRightClick);
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('offline', handleNetworkChange);
        window.addEventListener('keydown', disableReload);

        return () => {
            document.removeEventListener('contextmenu', disableRightClick);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('offline', handleNetworkChange);
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

        const apiUrl = `${baseUrl}/math-jams/reconnect`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
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
                Swal.fire({
                    icon: 'success',
                    title: 'Reconnected!',
                    text: 'You have successfully rejoined the Math Jam.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Reconnect Failed',
                    text: data.message || 'Failed to reconnect to the Math Jam.',
                }).then(() => {
                    if (data.message.includes("Cancelled") || data.message.includes("Ended")) {
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
        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute("content");

        if (!jamCode) return;

        const sseUrl = `${baseUrl}/math-jams/jam-stream-updates?math_jam_code=${jamCode}`;

        let eventSource;

        const connectSSE = () => {
            eventSource = new EventSource(sseUrl);

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data && (data.status === "waiting" || data.status === "started")) {
                    // console.log(data);
                } else {
                    if (!hasReloaded.current) {
                        hasReloaded.current = true;
                        window.location.reload();
                        sessionStorage.removeItem('jamCode');
                        setJamCode('');
                    }
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

        return () => {
            eventSource?.close();
        };
    }, [jamCode]);

    return (
        <>
            <Head title="Math Jam" />
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="bg-white shadow-lg rounded-lg p-6 w-[400px]">
                    <h2 className="text-xl font-semibold text-center mb-4">Join a Math Jam</h2>
                    <p className="text-center text-gray-700 mb-4">
                        Welcome, <span className="font-semibold">{studentName}</span>!
                    </p>

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
                                    Math Jam Code
                                </label>
                                <input
                                    type="text"
                                    id="jamCode"
                                    value={jamCode}
                                    onChange={(e) => setJamCode(e.target.value)}
                                    className="w-full mt-1 p-2 border rounded"
                                    placeholder="Enter Math Jam Code"
                                />
                            </div>

                            <div className="flex justify-center mb-4">
                                <button
                                    onClick={handleJoinJam}
                                    className="w-full bg-blue-500 text-white py-2 px-4 rounded"
                                    disabled={loading}
                                >
                                    {loading ? 'Joining...' : 'Join Jam'}
                                </button>
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
        </>
    );
};

export default JoinJam;
