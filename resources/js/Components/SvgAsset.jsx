import { motion } from 'framer-motion';

export const SvgAsset = ({ value, className = '', movement = 'md', ...props }) => {
    if (!value) return null; // Handle missing value gracefully

    const movementVariants = {
        sm: {
            scale: [1, 1.01, 1],
            x: [0, 1, -1, 0],
            y: [0, 1, -1, 0],
            rotateZ: [0, 1, 0, 0],
        },
        md: {
            scale: [1, 1.01, 1],
            x: [0, 3, -2, 0],
            y: [0, 2, -2, 0],
            rotateZ: [0, 10, -10, 0],
        },
        lg: {
            scale: [1, 1.02, 1],
            x: [0, 8, -8, 0],
            y: [0, 8, -8, 0],
            rotateZ: [0, 15, -15, 0],
        },
    };

    const randomDuration = Math.random() * 2 + 2; // Random duration between 2 and 4 seconds

    return (
        <motion.img
            src={`${value}`}
            alt={`svg-${value}`}
            className={`absolute ` + className}
            {...props}
            animate={movementVariants[movement]}
            transition={{
                duration: randomDuration,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
        />
    );
};
