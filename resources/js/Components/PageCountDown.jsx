'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useState } from 'react';

export function PageCountDown({ onComplete }) {
    const [count, setCount] = useState(4);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    useEffect(() => {
        if (count > 0) {
            const timer = setTimeout(() => setCount((prev) => prev - 1), 1000);
            return () => clearTimeout(timer);
        } else if (count === 0) {
            setTimeout(() => onComplete?.(), 500); // Ensure 'Go!!' is visible before completing
        }
    }, [count, onComplete]);

    useEffect(() => {
        const move = () => {
            setX(Math.sin(Date.now() * 0.003) * 10);
            setY(Math.cos(Date.now() * 0.003) * 10);
        };
        const interval = setInterval(move, 30);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full bg-white rounded-3xl flex justify-center items-center relative select-none">
            <AnimatePresence mode="wait">
                {count > 1 && (
                    <>
                        <motion.div
                            key={count}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, x, y }}
                            exit={{ scale: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-[10rem] font-semibold text-success absolute"
                        >
                            {count - 1}
                        </motion.div>
                    </>
                )}
                {count === 1 && (
                    <motion.div
                        key="go"
                        initial={{ scale: 0 }}
                        animate={{ scale: 2, x, y }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.4 }}
                        className="text-[10rem] font-semibold text-success absolute"
                    >
                        Go!!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
