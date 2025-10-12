import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
  Tooltip,
} from "recharts";
import { useState } from "react";
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const CustomLegend = ({ data }) => (
  <div className="w-[180px] space-y-2 text-sm font-medium text-gray-700 ml-2">
    {data.map((entry, index) => (
      <div key={`item-${index}`} className="flex w-[180px] items-center gap-2">
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: COLORS[index % COLORS.length] }}
        />
        {entry.name} - {entry.value}
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
    percent,
    value,
    payload,
  } = props;

  const {
    payload: { color },
  } = payload;

  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (innerRadius + 20) * cos;
  const sy = cy + (innerRadius + 20) * sin;
  const mx = cx + (outerRadius + 15) * cos;
  const my = cy + (outerRadius + 15) * sin;
  const ex = sx;
  const ey = sy;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text
        x="50%"
        y="16"
        textAnchor="middle"
        fill="#231E33"
        fontSize="16"
        fontWeight="600"
      >
        {payload.title}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={color}
      />
      <path d={`M${sx},${sy}L${mx},${my}`} stroke="#AAA" fill="none" />
      <circle cx={ex} cy={ey} r={3} fill="#AAA" stroke="none" />
      <text
        x={mx + (cos >= 0 ? 1 : -1) * 5}
        y={my}
        textAnchor={textAnchor}
        fill="#2B1B49"
        fontSize={12}
        fontWeight="500"
      >{`${(percent * 100).toFixed(1)}% (${value})`}</text>

      <text
        x="50%"
        y="90%"
        dy={8}
        textAnchor="middle"
        fill="#231E33"
        fontSize="12"
        fontWeight="500"
      >
        {payload.name}
        {/* <tspan dx={4} fontWeight="600">
          100%
        </tspan> */}
      </text>
    </g>
  );
};

const EnhancedPieChart = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <div className="flex items-center gap-6">
      <CustomLegend data={data} />
      <ResponsiveContainer width={300} height={190}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={56}
            activeShape={renderActiveShape}
            dataKey="value"
            onMouseEnter={onPieEnter}
            label
            // label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnhancedPieChart;
