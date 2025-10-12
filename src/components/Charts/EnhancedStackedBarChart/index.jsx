import { useTheme } from "@mui/material";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import PropTypes from "prop-types";

function CustomLabel(props) {
  const { x, y, height, value } = props;

  return (
    <text
      x={x - 3}
      y={y + height / 2}
      fill="#2B1B49"
      textAnchor="end"
      dominantBaseline="middle"
      fontSize={10}
      fontWeight={500}
    >
      {value}
    </text>
  );
}

CustomLabel.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const getRadius = (currentIndex, length) => {
  if (currentIndex === 0) return [0, 0, 2, 2];
  if (currentIndex === length - 1) return [2, 2, 0, 0];

  return undefined;
};

export default function EnhancedStackedBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart
        barSize={20}
        data={data || []}
        margin={{
          top: 5,
          // right: 30,
          // left: 20,
          bottom: 5,
        }}
        barCategoryGap="10%"
        barGap={1}
      >
        {/* <CartesianGrid /> */}
        <XAxis dataKey="time_slot" interval={0} />
        <YAxis />
        <Tooltip />
        <Bar
          dataKey="booking_count"
          fill="#115E59"
          radius={[5, 5, 0, 0]}
          // label={{ position: "top" }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

EnhancedStackedBarChart.propTypes = {
  title: PropTypes.string.isRequired,
  barSize: PropTypes.number,
  showYAxis: PropTypes.bool,
  // Array of Object with the following properties name is mandatory, also rest of the bar chart properties
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      // key1: PropTypes.string.isRequired,
      // key2: PropTypes.string.isRequired,
    })
  ).isRequired,
  legends: PropTypes.shape({
    // key: PropTypes.string.isRequired,
  }).isRequired,
};
EnhancedStackedBarChart.defaultProps = {
  barSize: 16,
  showYAxis: true,
};
