import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
  Tooltip,
} from "recharts";
import { useState } from "react";
import { useTheme } from "@mui/material/styles";

/**
 * Carelon HMS Enhanced Pie Chart
 * ------------------------------------------
 * Responsive, dark-mode aware, and branded chart.
 */

const CustomLegend = ({ data, colors }) => (
  <div className="flex flex-col w-[180px] space-y-2 text-sm font-medium ml-2">
    {data.map((entry, index) => (
      <div
        key={`legend-${index}`}
        className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
      >
        <span
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: colors[index % colors.length] }}
        />
        <span className="truncate">
          {entry.name} - <span className="font-semibold">{entry.value}</span>
        </span>
      </div>
    ))}
  </div>
);

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    percent,
    value,
    payload,
  } = props;

  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (innerRadius + 20) * cos;
  const sy = cy + (innerRadius + 20) * sin;
  const mx = cx + (outerRadius + 15) * cos;
  const my = cy + (outerRadius + 15) * sin;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      {/* Title */}
      {/* <text
        x="50%"
        y="14"
        textAnchor="middle"
        fill="#231E33"
        fontSize="16"
        fontWeight="600"
      >
        {payload?.title || "Details"}
      </text> */}

      {/* Active Sector */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />

      {/* Connector Line */}
      <path d={`M${sx},${sy}L${mx},${my}`} stroke="#AAA" fill="none" />
      <circle cx={mx} cy={my} r={3} fill="#AAA" stroke="none" />

      {/* Percentage + Value */}
      <text
        x={mx + (cos >= 0 ? 1 : -1) * 8}
        y={my}
        textAnchor={textAnchor}
        fill="#2B1B49"
        fontSize={12}
        fontWeight="500"
      >
        {`${(percent * 100).toFixed(1)}% (${value})`}
      </text>

      {/* Footer Label */}
      {/* <text
        x="50%"
        y="92%"
        dy={8}
        textAnchor="middle"
        fill="#231E33"
        fontSize="12"
        fontWeight="500"
      >
        {payload?.name}
      </text> */}
    </g>
  );
};

const EnhancedPieChart = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const theme = useTheme();

  // Carelon brand colors, theme-aware
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  const onPieEnter = (_, index) => setActiveIndex(index);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 w-full">
      {/* Legend Section */}
      <CustomLegend data={data} colors={COLORS} />

      {/* Chart Section */}
      <div className="w-full max-w-[320px] h-[20vh]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={60}
              activeShape={renderActiveShape}
              activeIndex={activeIndex}
              dataKey="value"
              onMouseEnter={onPieEnter}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.primary.main}`,
                borderRadius: 8,
                fontSize: 14,
                color: theme.palette.text.primary,
              }}
              cursor={{ fill: "transparent" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EnhancedPieChart;
