export default function ProgressRing({
  percent = 0,
  size = 110,
  strokeWidth = 11,
  label = "เสร็จสิ้น",
  tone = "blue",
}) {
  const value = Math.max(0, Math.min(100, Number(percent) || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const toneColors = {
    blue: "#3474dc",
    green: "#20a978",
    orange: "#e69a22",
    red: "#e5484d",
    purple: "#7654d6",
  };

  const color = toneColors[tone] || toneColors.blue;

  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#eef2f9"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>

      <div className="progress-ring-text">
        <strong>{value}%</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
