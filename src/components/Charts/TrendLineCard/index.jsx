import { downloadReportData } from "@/apis/hms";
import { EXPORT_OPTIONS, ExportCard } from "@components/Modals/ExportCard";
import { MENU_ACTIONS } from "@components/Tiles/AnalyticsCard/AnalyticsCardHeader";
import { useDashboardContext } from "@contexts/DashboardContext";
import { useHmsSiteMapContext } from "@contexts/HmsSiteMapContext";
import { DASHBOARD_VIEWS } from "@data/common";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Box,
  Card,
  Collapse,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import {
  getDurationString,
  getFormattedDateList,
  getMoreInfoActionAllowed,
  getThemePaletteColorFromRagValue,
  getViewMoreActionAllowed,
  getViewMoreRoutePath,
  isNumber,
} from "@utils/commonUtils";
import {
  downloadAsImage,
  downloadAsPDF,
  downloadBlobFile,
  getFormattedFilename,
} from "@utils/filedownload";
import PropTypes from "prop-types";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Bar,
  ComposedChart,
  Legend,
  Line,
  Tooltip as ReChartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import CustomLegend from "./CustomLegend";
import CustomTooltip from "./CustomTooltip";
import "./index.scss";
import {
  getTrendlineLegendPayloadByRagValues,
  getYAxisDomain,
  TrendLineCardMinHeight,
  TrendLineCardMinWidth,
} from "./trendline.util";
import TrendLineCardHeader from "./TrendLineCardHeader";

const cardSxProps = {
  "& .MuiCardHeader-root": {
    p: 2,
    pb: 0,
  },
  border: `1px solid #E3E3E3`,
  borderRadius: "8px",
  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.05)",
  transition: "all 0.5s ease-in-out",
  "&:hover": {
    transform: "scale(1.01)",
    boxShadow: (theme) => `0 0 6px 2px ${theme.palette.primary.main}`,
  },
  height: "100%",
};

export default function TrendLineCard({
  cardTitle,
  subTitle,
  showLineChart,
  chartPayload,
  hasDataNotFound,
  barSize,
  tickFormatterXAxis,
  tickFormatterYAxis,
  minWidth,
  minHeight,
  tabKey,
  towerKey,
  subTower,
  isResponsiveWidth,
  toolTipOffsetY,
  toolTipOffsetX,
  legendLabels,
  allowExports,
  mtbKey,
  onCardTitleClick,
}) {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [activeBarLegendColor, setActiveBarLegendColor] = useState("");
  const [barGraphPositionData, setBarGraphPositionData] = useState({
    x: 200,
    y: 10,
  });
  const cardRef = useRef(null);
  const theme = useTheme();
  const [show, setShow] = useState(false);
  const [, setSearchParams] = useSearchParams();
  const { dashboardKey, tabIndex } = useParams();
  const navigate = useNavigate();
  const { dashboardView, dashboardDurationFilter, dashboardCommentaryFilter } =
    useDashboardContext();
  const { filterType, filterMonths, orgCode } = dashboardDurationFilter;
  const [activeBarIndex, setActiveBarIndex] = useState(-1);
  const [cardWidth, setCardWidth] = useState(minWidth);
  const { tabsByOrgCode } = useHmsSiteMapContext();

  // const [isMixedDataRange, setIsMixedDataRange] = useState(false);

  // const ticks = useMemo(
  //   () => [...new Set(chartPayload.map((item) => item.actualValue))],
  //   [chartPayload]
  // );
  // const DASHBOARD_LIST =
  //   orgCode?.toLowerCase() === "Org1"?.toLowerCase()
  //     ? DASHBOARD_LIST_LEGACY
  //     : DASHBOARD_LIST_LATEST;
  const DASHBOARD_LIST = tabsByOrgCode[orgCode.toUpperCase()];

  const currentDashboard = DASHBOARD_LIST.find(
    (item) => item.key === dashboardKey
  );

  useEffect(() => {
    setShow(true);
  }, []);

  useLayoutEffect(() => {
    // const handleResize = throttle(() => {
    //   console.log("resize handle", cardRef.current?.clientWidth);
    //   if (
    //     isResponsiveWidth &&
    //     cardRef.current?.clientWidth &&
    //     cardRef.current.clientWidth > minWidth
    //   )
    //     setCardWidth(cardRef.current.clientWidth);
    // }, 500);
    const timerId = setInterval(() => {
      if (
        isResponsiveWidth &&
        cardRef.current?.clientWidth &&
        cardRef.current.clientWidth > minWidth
      )
        setCardWidth(cardRef.current.clientWidth);
    }, 50);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  const viewMoreClickHandler = (cardTitle_) => {
    setSearchParams({ viewMore: cardTitle_ });
  };

  const menuItemClickHandler = (value, cardTitle_) => {
    if (value === MENU_ACTIONS.EXPORT) setShowExportDialog(true);
    else if (value === MENU_ACTIONS.MORE_INFO) {
      const path = getViewMoreRoutePath(cardTitle_?.toLowerCase());

      if (path) navigate(path);
    }
  };

  const formatedFileName = `${currentDashboard?.title}_${tabKey}_${
    subTower ?? ""
  }_${cardTitle} Report(${getDurationString(filterType, filterMonths)})`;

  const logFileDownloadStatus = (status) =>
    console.log("Export Card Data as XLS Status:", status);

  const mutateDownloadExcelFile = useMutation({
    mutationFn: () =>
      downloadReportData({
        pageName: currentDashboard?.title,
        tilesType: DASHBOARD_VIEWS[dashboardView],
        tilesName: cardTitle,
        tower: currentDashboard?.title === "Executive Summary" ? "" : tabKey,
        towerKey,
        subTower,
        calendarPeriod: filterType,
        date: getFormattedDateList(filterType, filterMonths),
        region: "India",
        orgCode,
      }),
    onSuccess: (data) => {
      downloadBlobFile(
        data,
        getFormattedFilename(formatedFileName, "xlsx", true)
      );
      setTimeout(logFileDownloadStatus, 1000, "success");
    },
    onError: (error) => {
      console.error(error);
      setTimeout(logFileDownloadStatus, 0, "error");
    },
  });

  const legendPayload = useMemo(
    () =>
      getTrendlineLegendPayloadByRagValues(
        [
          ...new Set(
            chartPayload
              .filter(({ actualValue }) => isNumber(actualValue))
              .map((item) => item.status)
          ),
        ],
        legendLabels
      ),
    [chartPayload]
  );

  const menuActionItems = [];

  if (!hasDataNotFound && allowExports) {
    menuActionItems.push(MENU_ACTIONS.EXPORT);
    if (
      getMoreInfoActionAllowed(
        currentDashboard?.title,
        currentDashboard?.tabList[tabIndex],
        cardTitle
      )
    )
      menuActionItems.push(MENU_ACTIONS.MORE_INFO);
  }

  const newPayload = chartPayload
    .map((item, i) => {
      const colorPalette = getThemePaletteColorFromRagValue(
        isNumber(item.actualValue) ? item.status : ""
      );

      const opacityFlag =
        activeBarLegendColor && colorPalette !== activeBarLegendColor;
      const colorFlag =
        i === activeBarIndex || colorPalette === activeBarLegendColor;
      const barOpacity = opacityFlag ? 0.1 : 0.9;
      const colorName = colorFlag ? "main" : "trendLineLight";

      return {
        ...item,
        fill: theme.palette[colorPalette][colorName],
        opacity: barOpacity,
      };
    })
    .filter((item) => isNumber(item.actualValue) || isNumber(item.targetValue));

  const handleBarMouseEnter = ({ ...rest }, index) => {
    const x = rest.x - 60 + toolTipOffsetX;
    // let y = 0;

    // if (rest.height > 0) y = -rest.height + 135;
    // else y = rest.background.height - 112;

    let y = 0;
    const yOffset = 2 + toolTipOffsetY;

    if (rest.height > 0) y = rest.y + yOffset;
    // else if (isMixedDataRange)
    //   y = rest.background.height - rest.y + rest.height + 2;
    // else y = rest.background.height - 108;
    else y = rest.y + rest.height + yOffset;

    setBarGraphPositionData(() => ({
      x,
      y,
    }));
    setActiveBarIndex(index);
  };

  const handleBarMouseLeave = () => {
    console.log("handleBarMouseLeave");
    setActiveBarIndex(-1);
  };

  const CollapseStyleProps = {
    // width: "100%",
    width: cardWidth,
    height: minHeight,
  };

  const bgcolor =
    dashboardCommentaryFilter?.mtbKey?.toLowerCase() === mtbKey?.toLowerCase()
      ? "primary.light"
      : "none";

  return (
    <>
      <Collapse
        in={show}
        timeout={100}
        easing="ease-in-out"
        ref={cardRef}
        sx={{
          transitionDelay: Math.random() * 500,
          "& .MuiCollapse-root": CollapseStyleProps,
          "& .MuiCollapse-wrapper": CollapseStyleProps,
          "& .MuiCollapse-wrapperInner": CollapseStyleProps,
          p: "2px",
        }}
        orientation="horizontal"
      >
        <Box width="calc(100% - 2px)" height="100%">
          <Card elevation={1} sx={{ ...cardSxProps, bgcolor }} tabIndex={0}>
            <Stack
              justifyContent="space-between"
              height="100%"
              width={cardWidth}
            >
              <TrendLineCardHeader
                cardTitle={cardTitle}
                mtbKey={mtbKey}
                subTitle={subTitle}
                onMenuItemClick={menuItemClickHandler}
                onViewMoreClick={
                  getViewMoreActionAllowed(
                    currentDashboard?.title,
                    currentDashboard?.tabList[tabIndex],
                    cardTitle
                  )
                    ? viewMoreClickHandler
                    : undefined
                }
                menuActionItems={menuActionItems}
                onCardTitleClick={onCardTitleClick}
              />
              {hasDataNotFound ? (
                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  // mt={-6}
                  flex="1 1 100px"
                >
                  <WarningAmberIcon color="warning" />
                  <Typography
                    component="span"
                    variant="h3"
                    color="hms.main"
                    fontWeight="500"
                    fontSize="20px"
                    pl={1}
                  >
                    No Trend Data Available
                  </Typography>
                </Stack>
              ) : (
                <Box
                  sx={{ cursor: "pointer" }}
                  onClick={() =>
                    onCardTitleClick(
                      dashboardCommentaryFilter?.mtbKey?.toLowerCase() ===
                        mtbKey?.toLowerCase()
                        ? { metricName: "", mtbKey: "" }
                        : { metricName: cardTitle, mtbKey }
                    )
                  }
                >
                  <ComposedChart
                    width={cardWidth - 45}
                    height={minHeight - 114}
                    data={newPayload}
                    margin={{
                      top: 20,
                      right: 8,
                      bottom: 4,
                      left: 0,
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <XAxis
                      dataKey="xAxisName"
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fontSize: 10,
                        fontWeight: 500,
                        fill: theme.palette.hms.main,
                      }}
                      interval={0}
                      type="category"
                      tickFormatter={tickFormatterXAxis}
                      tickMargin={10}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fontSize: 10,
                        fontWeight: 500,
                        fill: theme.palette.hms.main,
                        // dx: 10,
                        // dy: 10,
                      }}
                      interval="preserveStartEnd"
                      // domain={["dataMin - 10", "dataMax"]}
                      domain={getYAxisDomain}
                      tickCount={12}
                      type="number"
                      tickFormatter={tickFormatterYAxis}
                      // ticks={ticks}
                      minTickGap={5}
                      // allowDecimals
                    />
                    <ReChartsTooltip
                      wrapperStyle={{
                        backgroundColor: "#fff",
                        border: `1px solid ${theme.palette.primary.main}`,
                        // border: `inset 0px 0px 5px 1px ${theme.palette.primary.main}`,

                        borderRadius: "8px",
                        outline: "none",
                        width: "130px",
                        height: "100px",
                        padding: "4px",
                        position: "fixed",
                      }}
                      contentStyle={{
                        padding: "12px",
                        border: "none",
                        maxWidth: "100%",
                        maxHeight: "100%",
                      }}
                      cursor={false}
                      position={barGraphPositionData}
                      // coordinate={{ x: 50, y: 50 }}
                      content={CustomTooltip}
                      // active
                    />

                    {showLineChart && (
                      <Line
                        type="monotone"
                        dataKey="targetValue"
                        stroke={theme.palette.primary.main}
                        strokeWidth={2}
                        dot={false}
                        legendType="plainline"
                        activeDot={false}
                        label={{
                          position: "insideBottomRight",
                          fontWeight: 500,
                          fontSize: 12,
                          fill: theme.palette.primary.main,
                          // fill: "black",
                          // fill: theme.palette.grey.main,
                          offset: 8,
                          formatter: (value) =>
                            isNumber(value) ? `${value}` : "",
                          angle: 0,
                        }}
                        isAnimationActive={false}
                      />
                    )}
                    {/* <Bar
                      dataKey="actualValue"
                      barSize={barSize}
                      radius={[2, 2, 2, 2]}
                      legendType="circle"
                      onMouseOver={handleMouseOver}
                      // minPointSize={10}
                    >
                      {chartPayload.map((entry) => (
                        <Cell
                          key={`cell-${entry.xAxisName}`}
                          fill={
                            theme.palette[
                              getThemePaletteColorFromRagValue(entry.status)
                            ][
                              activeBarLegendColor ===
                              getThemePaletteColorFromRagValue(entry.status)
                                ? "main"
                                : "trendLineLight"
                            ]
                          }
                          style={{
                            opacity:
                              activeBarLegendColor ===
                              getThemePaletteColorFromRagValue(entry.status)
                                ? "0.8"
                                : "1",
                          }}
                        />
                      ))}
                    </Bar> */}

                    <Bar
                      dataKey="actualValue"
                      barSize={barSize}
                      radius={[2, 2, 2, 2]}
                      legendType="circle"
                      onMouseEnter={handleBarMouseEnter}
                      onMouseLeave={handleBarMouseLeave}
                      minPointSize={10}
                      // label={{
                      //   position: "top",
                      //   fill: theme.palette.hms.main,
                      //   fontSize: 16,
                      // }}
                      // fillOpacity={opacity}
                      label={{
                        position: "insideEnd",
                        fontWeight: 500,
                        fontSize: 12,
                        // fill: theme.palette.hms.main,
                        fill: "black",
                        // offset: -20,
                        formatter: (value) =>
                          isNumber(value) ? `${value}` : "",
                        // angle: -16,
                        angle: 270,
                      }}
                      isAnimationActive={false}
                    />

                    <Legend
                      payload={legendPayload}
                      onMouseEnter={(color) => {
                        setActiveBarLegendColor(color);
                      }}
                      onMouseLeave={() => setActiveBarLegendColor("")}
                      content={CustomLegend}
                    />
                  </ComposedChart>
                </Box>
              )}
            </Stack>
          </Card>
        </Box>
      </Collapse>
      <ExportCard
        showDialog={showExportDialog}
        submitHandler={(selectedOption) => {
          setShowExportDialog(false);

          if (selectedOption === EXPORT_OPTIONS.JPG) {
            downloadAsImage(cardRef, formatedFileName, "jpg", true);
          } else if (selectedOption === EXPORT_OPTIONS.PDF) {
            downloadAsPDF(cardRef, formatedFileName, "pdf", true, (status) =>
              console.log(status)
            );
          } else if (selectedOption === EXPORT_OPTIONS.XLS) {
            // handleFileDownload((status) =>
            //   console.log("Card Export as XLS Status:", status)
            // );
            mutateDownloadExcelFile.mutate();
          }
        }}
        closeHandler={() => setShowExportDialog(false)}
      />
    </>
  );
}

TrendLineCard.propTypes = {
  cardTitle: PropTypes.string.isRequired,
  subTitle: PropTypes.node,
  showLineChart: PropTypes.bool,
  chartPayload: PropTypes.arrayOf(
    PropTypes.shape({
      xAxisName: PropTypes.string,
      targetValue: PropTypes.number,
      actualValue: PropTypes.number,
      status: PropTypes.string,
      price: PropTypes.string,
      format: PropTypes.string,
    })
  ).isRequired,
  onCardTitleClick: PropTypes.func,
  mtbKey: PropTypes.string,
  hasDataNotFound: PropTypes.bool,
  barSize: PropTypes.number,
  tickFormatterXAxis: PropTypes.func.isRequired,
  tickFormatterYAxis: PropTypes.func.isRequired,
  minWidth: PropTypes.number,
  minHeight: PropTypes.number,
  tabKey: PropTypes.string.isRequired,
  towerKey: PropTypes.string,
  subTower: PropTypes.string,
  isResponsiveWidth: PropTypes.bool,
  toolTipOffsetY: PropTypes.number,
  toolTipOffsetX: PropTypes.number,
  legendLabels: PropTypes.shape({
    AMBER: PropTypes.string,
    RED: PropTypes.string,
    GREEN: PropTypes.string,
    NA: PropTypes.string,
  }),
  allowExports: PropTypes.bool,
};
TrendLineCard.defaultProps = {
  subTitle: undefined,
  showLineChart: false,
  hasDataNotFound: false,
  barSize: 12,
  minWidth: TrendLineCardMinWidth,
  minHeight: TrendLineCardMinHeight,
  subTower: "",
  isResponsiveWidth: false,
  toolTipOffsetY: 0,
  toolTipOffsetX: 0,
  legendLabels: {},
  towerKey: undefined,
  allowExports: true,
  mtbKey: "",
  onCardTitleClick: undefined,
};
