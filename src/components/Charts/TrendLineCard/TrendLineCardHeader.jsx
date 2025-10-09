import { FlexContainer } from "@components/Flex";
import { ForwardHookIcon } from "@components/SVGs/Misc";
import { useDashboardContext } from "@contexts/DashboardContext";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import PropTypes from "prop-types";
import { useState } from "react";

const titleSxProps = {
  // maxWidth: 400,
  color: "text.title",
  fontWeight: "600",
  textTransform: "capitalize",
  fontSize: "18px",
  display: "inline-block",
  lineHeight: 1.2,
};
const subTitleSxProps = {
  maxWidth: 250,
  color: "text.subTitle",
  fontWeight: "500",
  fontSize: "14px",
  display: "block",
  lineHeight: 1,
};

const EllipsisSxProps = {
  display: "inline-block",
  lineHeight: 1,
  fontWeight: "900",
  color: "primary.main",
  borderBottom: (theme) => `2px solid ${theme.palette.primary.main}`,
  letterSpacing: "2px",
  marginLeft: "4px",
  paddingLeft: "2px",
  cursor: "pointer",
};

export default function TrendLineCardHeader({
  cardTitle,
  subTitle,
  onMenuItemClick,
  onViewMoreClick,
  menuActionItems,
  onCardTitleClick,
  mtbKey,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const showActionMenu = Boolean(anchorEl);

  const { dashboardCommentaryFilter } = useDashboardContext();

  const handleCardActionBtnClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const hideMenuOptions = () => {
    setAnchorEl(null);
  };

  let LetterCount = 48;

  LetterCount -= typeof onViewMoreClick === "function" ? 12 : 0;

  const showTooltip = cardTitle.length > LetterCount;

  return (
    <CardHeader
      action={
        <Box>
          <FlexContainer
            alignSelf="flex-start"
            justifyContent="center"
            alignItems="center"
          >
            {typeof onViewMoreClick === "function" && (
              <Typography
                color="text.primary"
                fontSize="16px"
                fontWeight={500}
                lineHeight={1}
                sx={{ cursor: "pointer" }}
                onClick={() => onViewMoreClick(cardTitle)}
              >
                <ForwardHookIcon mb="-3px" />
                <Box
                  component="span"
                  pl="3px"
                  pt="6px"
                  pr={2}
                  display="inline-block"
                  sx={{
                    textDecoration: "underline",
                    textUnderlineOffset: "2px",
                  }}
                >
                  View more
                </Box>
              </Typography>
            )}
            {menuActionItems.length > 0 ? (
              <IconButton
                id={`${cardTitle}-actions`}
                aria-label={`${cardTitle}-actions`}
                aria-controls={
                  showActionMenu ? `${cardTitle}-actions-menu` : undefined
                }
                aria-haspopup="true"
                aria-expanded={showActionMenu ? "true" : undefined}
                onClick={handleCardActionBtnClick}
                sx={{ px: 0 }}
              >
                <MoreVertIcon />
              </IconButton>
            ) : undefined}
          </FlexContainer>

          {menuActionItems.length > 0 ? (
            <Menu
              id={`${cardTitle}-actions-menu`}
              aria-labelledby={`${cardTitle}-actions`}
              anchorEl={anchorEl}
              open={showActionMenu}
              onClose={hideMenuOptions}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
            >
              {menuActionItems.map((actionName, i) => (
                <MenuItem
                  autoFocus={i === 0}
                  sx={{ px: 3 }}
                  onClick={() => {
                    hideMenuOptions();
                    if (typeof onMenuItemClick === "function")
                      onMenuItemClick(actionName, cardTitle);
                  }}
                  key={actionName}
                >
                  {actionName}
                </MenuItem>
              ))}
            </Menu>
          ) : undefined}
        </Box>
      }
      title={
        <Typography
          variant="h6"
          sx={{ ...titleSxProps, cursor: "pointer" }}
          component="span"
          onClick={() =>
            onCardTitleClick(
              dashboardCommentaryFilter?.mtbKey?.toLowerCase() ===
                mtbKey?.toLowerCase()
                ? { metricName: "", mtbKey: "" }
                : { metricName: cardTitle, mtbKey }
            )
          }
        >
          {showTooltip ? cardTitle.slice(0, LetterCount) : cardTitle}
          {showTooltip && (
            <Tooltip
              title={cardTitle}
              placement="bottom"
              arrow
              enterDelay={100}
            >
              <Typography sx={EllipsisSxProps} component="span">
                ...
              </Typography>
            </Tooltip>
          )}
        </Typography>
      }
      subheader={
        subTitle ? (
          <Typography
            variant="subtitle1"
            sx={subTitleSxProps}
            component="span"
            noWrap
          >
            {subTitle}
          </Typography>
        ) : null
      }
      disableTypography
      sx={{
        px: 0,
      }}
    />
  );
}

TrendLineCardHeader.propTypes = {
  cardTitle: PropTypes.string.isRequired,
  subTitle: PropTypes.string,
  onMenuItemClick: PropTypes.func,
  onViewMoreClick: PropTypes.func,
  menuActionItems: PropTypes.arrayOf(PropTypes.string),
  onCardTitleClick: PropTypes.func.isRequired,
  mtbKey: PropTypes.string,
};
TrendLineCardHeader.defaultProps = {
  subTitle: undefined,
  onMenuItemClick: undefined,
  onViewMoreClick: undefined,
  menuActionItems: [],
  mtbKey: "",
};
