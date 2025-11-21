import { useTheme } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import PropTypes from "prop-types";

/**
 * intuismart HMS - Enhanced Stacked Bar Chart
 * -------------------------------------------
 * Fully responsive, intuismart-branded, theme-aware chart
 * Supports dark/light mode, customizable props, and tooltips
 */

const EnhancedStackedBarChart = ({
  data,
  xKey = "time_slot",
  yKey = "booking_count",
  showGrid = false,
  showYAxis = true,
  barSize = 18,
  title,
}) => {
  const theme = useTheme();

  // Themed colors
  const primaryColor = theme.palette.primary.main;
  const backgroundColor =
    theme.palette.mode === "dark"
      ? theme.palette.background.paper
      : theme.palette.background.default;
  const textColor =
    theme.palette.mode === "dark"
      ? theme.palette.text.primary
      : theme.palette.text.secondary;

  return (
    <div className="w-full h-[25vh] md:h-[25vh] bg-transparent">
      <h3 className="text-sm md:text-base font-semibold text-primary mb-2">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data || []}
          margin={{
            top: 20,
            right: 10,
            left: 0,
            bottom: 24,
          }}
          barCategoryGap="15%"
          barGap={2}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)"
              }
            />
          )}

          <XAxis
            dataKey={xKey}
            axisLine={false}
            tickLine={false}
            tick={{
              fill: textColor,
              fontSize: 12,
              fontWeight: 500,
            }}
          />
          {showYAxis && (
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: textColor,
                fontSize: 12,
                fontWeight: 500,
              }}
            />
          )}

          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.05)" }}
            contentStyle={{
              backgroundColor: backgroundColor,
              border: `1px solid ${primaryColor}`,
              borderRadius: "8px",
              fontSize: "13px",
              color: textColor,
              boxShadow:
                "0px 1px 5px rgba(80,9,181,0.1), 0px 8px 24px rgba(43,27,73,0.15)",
            }}
          />

          <Bar
            dataKey={yKey}
            fill={primaryColor}
            radius={[6, 6, 0, 0]}
            barSize={barSize}
          >
            {/* Value Labels inside bars */}
            <LabelList
              dataKey={yKey}
              position="top"
              fill={textColor}
              fontSize={11}
              fontWeight={500}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ✅ PropTypes */
EnhancedStackedBarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      time_slot: PropTypes.string,
      booking_count: PropTypes.number,
    })
  ).isRequired,
  xKey: PropTypes.string,
  yKey: PropTypes.string,
  showGrid: PropTypes.bool,
  showYAxis: PropTypes.bool,
  barSize: PropTypes.number,
  title: PropTypes.string,
};

/* ✅ Default Props */
EnhancedStackedBarChart.defaultProps = {
  xKey: "time_slot",
  yKey: "booking_count",
  showGrid: false,
  showYAxis: true,
  barSize: 18,
  title: "",
};

export default EnhancedStackedBarChart;
