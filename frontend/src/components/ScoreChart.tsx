import type React from "react";
import Plot from "react-plotly.js";

interface ScoreChartProps {
  scores: {
    [key: string]: number;
  };
}

const ScoreChart: React.FC<ScoreChartProps> = ({ scores }) => {
  const categories = Object.keys(scores);
  const scoreValues = Object.values(scores);

  const layout = {
    title: { text: "🏆 Essay Scoring Breakdown" },
    xaxis: { title: { text: "Evaluation Category" } },
    yaxis: { title: { text: "Score" }, range: [0, 2.5] },
    plot_bgcolor: "rgba(0,0,0,0)",
    paper_bgcolor: "rgba(0,0,0,0)",
    font: { size: 14 },
  };

  return (
    <Plot
      data={[
        {
          x: categories,
          y: scoreValues,
          type: "bar",
          text: scoreValues.map(String),
          textposition: "auto",
          marker: {
            color: scoreValues,
            colorscale: "Blues",
            cmin: 0,
            cmax: 2.5,
          },
        },
      ]}
      layout={layout}
      style={{ width: "100%", height: "400px" }}
    />
  );
};

export default ScoreChart;
