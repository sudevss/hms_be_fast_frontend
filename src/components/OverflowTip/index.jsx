import { Box, Tooltip } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

const formatText = (text) => {
  if (text.includes(".")) {
    return text.split(". ").join(".<br />");
  }

  return text;
};

function OverflowTip({ title, children }) {
  const [hoverStatus, setHover] = useState(false);
  const textElementRef = useRef();

  const compareSize = () => {
    const compare =
      textElementRef.current.scrollWidth > textElementRef.current.clientWidth;
    setHover(compare);
  };

  useEffect(() => {
    compareSize();
    window.addEventListener("resize", compareSize);

    return () => {
      window.removeEventListener("resize", compareSize);
    };
  }, []);

  return (
    <Tooltip
      title={
        <span
          style={{
            whiteSpace: "pre-line",
            fontSize: "14px",
            lineHeight: "1.5",

            display: "block",
          }}
          dangerouslySetInnerHTML={{ __html: formatText(title || "") }}
        />
      }
      interactive
      disableHoverListener={!hoverStatus}
      arrow
      placement="bottom"
    >
      <Box
        ref={textElementRef}
        id="toottip_wrap"
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          width: "inherit",
          fontSize: "inherit",
          fontWidth: "inherit",
          fontWeight: "inherit",
        }}
      >
        {children}
      </Box>
    </Tooltip>
  );
}

OverflowTip.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default OverflowTip;
