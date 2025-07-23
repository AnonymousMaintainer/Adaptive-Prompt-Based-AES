"use client";

import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const dummyData = [
  { score: 1, count: 2 },
  { score: 2, count: 3 },
  { score: 3, count: 5 },
  { score: 4, count: 8 },
  { score: 5, count: 12 },
  { score: 6, count: 15 },
  { score: 7, count: 20 },
  { score: 8, count: 18 },
  { score: 9, count: 10 },
  { score: 10, count: 7 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-2 border border-accent rounded shadow-sm">
        <p className="text-card-foreground font-medium">Score {label}</p>
        <p className="text-card-foreground">{payload[0].value} students</p>
      </div>
    );
  }
  return null;
};

interface ScoreDistributionChartProps {
  scoreDistribution: number[];
}

export default function ScoreDistributionChart({
  scoreDistribution,
}: ScoreDistributionChartProps) {
  const mappedScore = scoreDistribution.map((score, index) => {
    return {
      score: index + 1,
      count: score,
    };
  });
  return (
    <motion.div
      className="bg-card p-6 rounded-lg shadow-md border items-center hover:border-card-foreground transition-colors group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <h3 className="text-lg font-semibold text-card-foreground mb-6">
        Score Distribution (1-10)
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={mappedScore ?? dummyData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="primaryToAccent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary))" />
            <XAxis
              dataKey="score"
              tick={{ fill: "hsl(var(--foreground))" }}
              axisLine={{ stroke: "hsl(var(--foreground))" }}
            />
            <YAxis
              tick={{ fill: "hsl(var(--foreground))" }}
              axisLine={{ stroke: "hsl(var(--foreground))" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              fill="url(#primaryToAccent)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
