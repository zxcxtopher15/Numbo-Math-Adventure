import { useState, useEffect } from 'react';
import React from "react";
import { Board_Journey } from '@/Components/Board_Journey';
import { PageCountDown } from '@/Components/PageCountDown';

export default function BoardContainer_Journey({ questions }) {
    const [showCountdown, setShowCountdown] = useState(true);
    const [categoryTitle, setCategoryTitle] = useState('');
    const [existingJam, setExistingJam] = useState(null);

    useEffect(() => {
        setCategoryTitle(localStorage.getItem("category") || "Default Title");

        const storedJam = localStorage.getItem("existingJam");
        if (storedJam) {
            const parsedJam = JSON.parse(storedJam);
            setExistingJam(parsedJam);
            updateAnswers(parsedJam);
            if (parsedJam.status === "disconnected") {
                window.location.href = '/math-journey';
            }
        }
    }, []);

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

        const beforeUnloadHandler = (event) => {
            handleDisconnect();
        };

        const offlineHandler = () => {
            handleDisconnect();
            Swal.fire({
                icon: 'error',
                title: 'Connection Lost',
                text: 'You have been disconnected due to a lost internet connection.',
                confirmButtonColor: '#d33',
                allowOutsideClick: false,
            });
        };

        window.addEventListener('offline', offlineHandler);
        window.addEventListener('beforeunload', beforeUnloadHandler);
        document.addEventListener('contextmenu', disableRightClick);
        window.addEventListener('keydown', disableReload);

        return () => {
            window.removeEventListener('beforeunload', beforeUnloadHandler);
            window.removeEventListener('offline', offlineHandler);
            document.removeEventListener('contextmenu', disableRightClick);
            window.removeEventListener('keydown', disableReload);
        };
    }, []);

    const handleDisconnect = async () => {
        const existingJam = localStorage.getItem('existingJam');

        if (!existingJam) return;

        const parsedJam = JSON.parse(existingJam);
        if (!parsedJam || !parsedJam.math_jam_id) return;

        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content');
        if (!baseUrl) return;

        const apiUrl = `${baseUrl}/math-journey/disconnect_jam`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
                body: JSON.stringify({
                    math_jam_id: parsedJam.math_jam_id,
                }),
            });

            if (!response.ok) {
                console.error('Failed to disconnect:', response.status);
                return;
            }

            const data = await response.json();

            if (data?.jam) {
                localStorage.setItem('existingJam', JSON.stringify(data.jam));
            } else {
                console.warn('No valid jam data in response');
                localStorage.removeItem('existingJam');
            }
        } catch (err) {
            console.error('Error during disconnect:', err);
        }
    };

    const updateAnswers = async (jam) => {
        const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute("content");
        const apiUrl1 = `${baseUrl}/math-journey/update_answers`;

        try {
            const response = await axios.post(apiUrl1, {
                math_jam_code: jam.math_jam_code,
                has_answer: 0,
            }, {
                headers: {
                    "Content-Type": "application/json",
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
            });

            console.log("Has Answer updated:", response.data);
        } catch (err) {
            console.error("Error during update:", err.response?.data || err.message);
        }
    };

    const handleCountdownComplete = () => {
        setShowCountdown(false);
    };

    return (
        <div className="overflow-hidden h-dvh lg:p-3 p-2 bg-gradient-to-br from-teal-400 to-yellow-200 box-border">
            {showCountdown ? <PageCountDown onComplete={handleCountdownComplete} /> : <Board_Journey data={questions} />}
        </div>
    );
}
