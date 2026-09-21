import React from "react";

type Color = "gray" | "green" | "blue" | "amber" | "red";

const colors: Record<Color, string> = {
  gray: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300",
  green: "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  red: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400",
};

export default function Badge({
  children,
  color = "gray",
}: {
  children: React.ReactNode;
  color?: Color;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${colors[color]}`}
    >
      {children}
    </span>
  );
}
