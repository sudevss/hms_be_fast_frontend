import { getCompactNumber, isNumber } from "@utils/commonUtils";
import { getShortMonthAndYear } from "@utils/date";

export const TrendLineCardMinWidth = 527;
export const TrendLineCardMinHeight = 324;

export const getYAxisDomain = ([dataMin, dataMax]) => {
  // console.log({ dataMin, dataMax });

  // if (dataMin < 0 && dataMax > 0) setIsMixedDataRange(true);

  if (dataMin >= 0 && dataMax <= 1) {
    return [0, 1];
  }

  if (dataMin >= 0 && dataMax >= 0) {
    return [0, dataMax];
  }

  if (dataMin <= 0 && dataMax <= 0) {
    return [dataMin, 0];
  }

  return [dataMin, dataMax];
};

export const getTrendlineLegendPayloadByRagValues = (
  ragStatuses,
  legendLabels = {
    GREEN: "Target Met",
    RED: "Target At Risk",
    AMBER: "Target Not Met",
    NA: "Trend Bar",
  }
) => {
  const result = [];
  const upperCaseRagStatuses = ragStatuses.map((ragStatus) =>
    ragStatus.toUpperCase()
  );

  if (
    upperCaseRagStatuses.includes("GREEN") ||
    upperCaseRagStatuses.includes("AMBER") ||
    upperCaseRagStatuses.includes("RED")
  ) {
    result.push({
      value: "Trend Line",
      type: "line",
      color: "primary.main",
      paletteColor: "primary",
    });
  }

  if (upperCaseRagStatuses.includes("GREEN")) {
    result.push({
      value: legendLabels?.GREEN || "Target Met",
      type: "circle",
      color: "success.trendLineLight",
      paletteColor: "success",
    });
  }

  if (upperCaseRagStatuses.includes("AMBER")) {
    result.push({
      value: legendLabels?.AMBER || "Target Not Met",
      type: "circle",
      color: "warning.trendLineLight",
      paletteColor: "warning",
    });
  }

  if (upperCaseRagStatuses.includes("RED")) {
    result.push({
      value: legendLabels?.RED || "Target At Risk",
      type: "circle",
      color: "error.trendLineLight",
      paletteColor: "error",
    });
  }

  if (upperCaseRagStatuses.includes("NA")) {
    result.push({
      value: legendLabels?.NA || "Trend Bar",
      type: "circle",
      color: "primary.trendLineLight",
      paletteColor: "primary",
    });
  }

  return result;
};

export const getXAxisTickFormatter =
  (isDateValue = false) =>
  (tickValue) => {
    if (isDateValue) return getShortMonthAndYear(new Date(tickValue));

    return tickValue;
  };

export const getYAxisTickFormatter =
  (showCompactNumber = false) =>
  (tickValue) => {
    if (isNumber(tickValue) && showCompactNumber)
      return getCompactNumber(tickValue);

    return tickValue;
  };
