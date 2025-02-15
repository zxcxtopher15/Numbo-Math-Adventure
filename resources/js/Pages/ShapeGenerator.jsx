import { useState } from "react";

const ShapeGenerator = () => {
  const [sides, setSides] = useState(3); // Default: Triangle

  const generatePolygonPoints = (sides, radius = 40, centerX = 50, centerY = 50) => {
    const points = [];
    const angleOffset = -Math.PI / 2; // Start at the top
    const angleStep = (2 * Math.PI) / sides;

    for (let i = 0; i < sides; i++) {
      const x = centerX + radius * Math.cos(angleOffset + i * angleStep);
      const y = centerY + radius * Math.sin(angleOffset + i * angleStep);
      points.push(`${x},${y}`);
    }

    return points.join(" ");
  };

  return (
    <div className="flex flex-col items-center p-4">
      <label className="mb-2">Enter Number of Sides:</label>
      <input
        type="number"
        min="3"
        max="10"
        value={sides}
        onChange={(e) => setSides(Math.max(3, Math.min(10, Number(e.target.value))))}
        className="border p-2 rounded"
      />

      <svg width="120" height="120" viewBox="0 0 100 100">
        <polygon points={generatePolygonPoints(sides)} fill="blue" stroke="black" strokeWidth="2" />
      </svg>
    </div>
  );
};

export default ShapeGenerator;
