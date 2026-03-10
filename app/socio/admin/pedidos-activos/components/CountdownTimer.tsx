"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  /** Tiempo total en minutos */
  tiempoMinutos: number;
  /** Fecha/hora de inicio en formato ISO8601 */
  fechaInicio: string;
  /** Tamaño del círculo en px */
  size?: number;
}

export default function CountdownTimer({
  tiempoMinutos,
  fechaInicio,
  size = 48,
}: CountdownTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  const totalSeconds = tiempoMinutos * 60;

  useEffect(() => {
    const calcRemaining = () => {
      const start = new Date(fechaInicio).getTime();
      const end = start + totalSeconds * 1000;
      const now = Date.now();
      return Math.floor((end - now) / 1000);
    };

    setSecondsRemaining(calcRemaining());

    const interval = setInterval(() => {
      setSecondsRemaining(calcRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [fechaInicio, totalSeconds]);

  const isOvertime = secondsRemaining < 0;
  const absSeconds = Math.abs(secondsRemaining);
  const displayMinutes = Math.floor(absSeconds / 60);
  const displaySeconds = absSeconds % 60;

  // Progress: 1 = full, 0 = done
  const progress = isOvertime ? 0 : Math.max(0, secondsRemaining / totalSeconds);

  // Color based on remaining time
  let strokeColor = "#22c55e"; // green
  let textColor = "text-green-700";
  let bgColor = "bg-green-50";
  if (isOvertime) {
    strokeColor = "#ef4444"; // red
    textColor = "text-red-700";
    bgColor = "bg-red-50";
  } else if (progress < 0.25) {
    strokeColor = "#ef4444"; // red
    textColor = "text-red-700";
    bgColor = "bg-red-50";
  } else if (progress < 0.5) {
    strokeColor = "#f59e0b"; // amber
    textColor = "text-amber-700";
    bgColor = "bg-amber-50";
  }

  // SVG circle
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const timeText = `${isOvertime ? "+" : ""}${displayMinutes}:${String(displaySeconds).padStart(2, "0")}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full ${bgColor} ${isOvertime ? "animate-pulse" : ""}`}
      style={{ width: size, height: size }}
      title={isOvertime ? `Tiempo excedido por ${displayMinutes}m ${displaySeconds}s` : `Faltan ${displayMinutes}m ${displaySeconds}s`}
    >
      <svg
        width={size}
        height={size}
        className="absolute -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <span className={`text-[10px] font-bold ${textColor} z-10 tabular-nums`}>
        {timeText}
      </span>
    </div>
  );
}
