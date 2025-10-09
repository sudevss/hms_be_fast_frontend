import { Tab, Tabs } from "@mui/material";
import PropTypes from "prop-types";

function EnhancedTabs({
  tabTitles,
  tabsGroupTitle,
  selectedTabIndex,
  tabIndexUpdateHandler,
  TabsComponentProps,
  TabComponentProps,
}) {
  const handleChangeTab = (_e, newValue) => {
    tabIndexUpdateHandler(newValue);
  };

  function getDefaultA11yTabProps(index) {
    return {
      id: `${tabsGroupTitle}-tabId-${index}`,
      "aria-controls": `${tabsGroupTitle}-tabPanelId-${index}`,
    };
  }

  const { sx: sxTabsComponentProps, ...restTabsComponentProps } =
    TabsComponentProps;
  const {
    sx: sxTabComponentProps,
    a11yTabProps = {},
    ...restTabComponentProps
  } = TabComponentProps;

  return (
    <Tabs
      {...restTabsComponentProps}
      value={selectedTabIndex}
      onChange={handleChangeTab}
      aria-label={`${tabsGroupTitle} Tabs`}
      selectionFollowsFocus
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      sx={{
        "& .MuiTabScrollButton-root.Mui-disabled": {
          display: "none",
        },
        ...(tabTitles.length === 1 && {
          "& .MuiTabs-indicator": {
            background: "transparent",
          },
          // "& .MuiButtonBase-root": {
          //   cursor: "default",
          // },
        }),
        ...sxTabsComponentProps,
      }}
    >
      {tabTitles.map((title, index) => (
        <Tab
          {...restTabComponentProps}
          {...getDefaultA11yTabProps(index)}
          {...a11yTabProps}
          label={title}
          key={title}
          sx={{ ...sxTabComponentProps }}
          disabled={tabTitles.length === 1}
        />
      ))}
    </Tabs>
  );
}

export default EnhancedTabs;

EnhancedTabs.propTypes = {
  tabTitles: PropTypes.arrayOf(PropTypes.string).isRequired,
  tabsGroupTitle: PropTypes.string.isRequired,
  selectedTabIndex: PropTypes.number.isRequired,
  tabIndexUpdateHandler: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  TabsComponentProps: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  TabComponentProps: PropTypes.object,
};
EnhancedTabs.defaultProps = {
  TabsComponentProps: {},
  TabComponentProps: {},
};
