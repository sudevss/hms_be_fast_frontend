import TextVariantButton from "@components/TextVariantButton";
import { Box, Button } from "@mui/material";
import { useState } from "react";
import { useRouteError } from "react-router-dom";
import PropTypes from "prop-types";
import SpanElement from "@components/SpanElement";

function ErrorFallback({ errorProp }) {
  const error = useRouteError();
  const [showStackTrace, setShowStackTrace] = useState(false);

  const message = errorProp?.message || error?.message;
  const stack = errorProp?.stack || error?.stack;

  return (
    <Box
      role="alert"
      display="flex"
      p={4}
      flexDirection="column"
      color="primary.dark"
      alignItems="flex-start"
    >
      <Box color="inherit" fontWeight={500} fontSize={errorProp ? 18 : 22}>
        Something went wrong.
        {errorProp && (
          <SpanElement lineHeight={1.2}>
            Error occured while rendering the component.
          </SpanElement>
        )}
        {!errorProp && (
          <TextVariantButton
            onClick={() => setShowStackTrace((flag) => !flag)}
            label={!showStackTrace ? "Show more" : "Show less"}
            textDecoration="underline"
            textTransform="unset"
          />
        )}
      </Box>
      {showStackTrace && !errorProp && <Box fontSize={16}>{message}</Box>}
      {showStackTrace && !errorProp && (
        <pre style={{ margin: 0, fontSize: 16 }}>{stack}</pre>
      )}
      <br />
      {!errorProp && (
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Try again
        </Button>
      )}
    </Box>
  );
}
ErrorFallback.propTypes = {
  errorProp: PropTypes.shape({
    message: PropTypes.string,
    stack: PropTypes.string,
  }),
};
ErrorFallback.defaultProps = { errorProp: null };
export default ErrorFallback;
