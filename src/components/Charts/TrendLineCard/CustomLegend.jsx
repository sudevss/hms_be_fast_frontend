import { useTheme } from "@mui/material";
import PropTypes from "prop-types";

/**
 * Returns the property value from the given joined keys in the target object.
 * @param {string} joinedKeys string of joined keys
 * @param {object} targetObject target object to search
 * @returns any
 */
const getThemeColor = (joinedKeys, targetObject) =>
  joinedKeys.split(".").reduce((acc, curr) => acc && acc[curr], targetObject);

export default function CustomLegend(props) {
  const { payload, onMouseEnter, onMouseLeave } = props;

  const { palette } = useTheme();

  return (
    <ul
      style={{
        display: "flex",
        listStyleType: "none",
        marginLeft: 100,
        padding: 0,
        justifyContent: "flex-start",
      }}
    >
      {payload.map((entry) => (
        <li
          key={`item-${entry.value}`}
          style={{
            display: "flex",
            alignItems: "center",
            marginRight: 8,
            cursor: entry.type === "line" ? "default" : "pointer",
          }}
          onMouseEnter={() => {
            if (entry.type === "line") return;

            onMouseEnter(entry.paletteColor);
          }}
          onMouseLeave={onMouseLeave}
        >
          {entry.type === "line" && (
            <svg width={24} height={16}>
              <line
                x1={0}
                y1={8}
                x2={24}
                y2={8}
                stroke={getThemeColor(entry.color, palette)}
                strokeWidth={2}
              />
            </svg>
          )}
          {entry.type === "circle" && (
            <svg width={16} height={16}>
              <circle
                cx={8}
                cy={8}
                r={8}
                fill={getThemeColor(entry.color, palette)}
              />
            </svg>
          )}
          <span
            style={{
              fontSize: 10,
              marginLeft: 8,
              fontWeight: 500,
              color: palette.text.subTitle,
            }}
          >
            {entry.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

CustomLegend.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  payload: PropTypes.arrayOf(PropTypes.object),
  onMouseEnter: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
};

CustomLegend.defaultProps = {
  payload: [],
};
