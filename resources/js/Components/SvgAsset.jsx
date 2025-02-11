import { motion } from 'framer-motion';

export const SvgAsset = ({ value, className = '', ...props }) => {
  if (!value) return null; // Handle missing value gracefully

  // Generate random values for the movement
  const randomX = Math.random() * 15 - 7.5; // Random value between -7.5 and 7.5
  const randomY = Math.random() * 15 - 7.5; // Random value between -7.5 and 7.5
  const randomZ = Math.random() * 30 - 15; // Random value between -15 and 15
  const randomDuration = Math.random() * 5 + 3; // Random duration between 3 and 8 seconds

  return (
    <motion.img
      src={`/images/assets/shapes/${value}.svg`}
      alt={`svg-${value}`}
      className={`absolute ` + className}
      {...props}
      animate={{
        scale: [1, 1.02, 1],
        x: [0, randomX, -randomX, 0],
        y: [0, randomY, -randomY, 0],
        rotateZ: [0, randomZ, -randomZ, 0],
      }}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};
