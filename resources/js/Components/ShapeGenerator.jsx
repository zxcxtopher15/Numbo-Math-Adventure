const ShapeGenerator = (sides, size = 100, fill = "blue", stroke = "black") => {
    if (sides < 3) return null; // Minimum sides for a polygon is 3

    const radius = size / 2 - 5; // Keep shape within SVG bounds
    const centerX = size / 2;
    const centerY = size / 2;
    const angleOffset = -Math.PI / 2; // Start at the top
    const angleStep = (2 * Math.PI) / sides;

    const points = Array.from({ length: sides }, (_, i) => {
        const x = centerX + radius * Math.cos(angleOffset + i * angleStep);
        const y = centerY + radius * Math.sin(angleOffset + i * angleStep);
        return `${x},${y}`;
    }).join(" ");

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <polygon points={points} fill={fill} stroke={stroke} strokeWidth="2" />
        </svg>
    );
};

export default ShapeGenerator;
