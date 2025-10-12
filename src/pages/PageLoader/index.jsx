// import { NavbarHeight } from "@data/navigation";
import { Backdrop, CircularProgress } from "@mui/material";
import PropTypes from "prop-types";

const NavbarHeight = 48;

function PageLoader({ show }) {
  return (
    <Backdrop
      open={show}
      // sx={{
      //   zIndex: 9999, // ensures that the backdrop is above other elements
      //   backgroundColor: "rgba(255, 255, 255, 0.3)", // sets a slightly transparent white background
      // }}
      sx={{
        zIndex: 1999, // ensures that the backdrop is above other elements
        backgroundColor: "rgba(255, 255, 255, 0.3)", // sets a slightly transparent white background
        marginTop: `${NavbarHeight}px`,
        height: `calc(100vh - ${NavbarHeight}px)`,
      }}
    >
      <CircularProgress color="hms" />
    </Backdrop>
  );
}

export default PageLoader;

PageLoader.propTypes = {
  show: PropTypes.bool,
};
PageLoader.defaultProps = {
  show: true,
};
