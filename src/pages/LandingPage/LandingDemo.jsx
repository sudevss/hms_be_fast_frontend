import React, { useRef, useState } from "react";
import { Box, Container, Typography, Stack, useTheme, useMediaQuery } from "@mui/material";
import { Play } from "lucide-react";
import demoVideo from "@/assets/HMS Demo Video.mp4";

const LandingDemo = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef(null);

  return (
    <Box id="product-walkthrough" sx={{ bgcolor: "white", py: { xs: 8, md: 16 } }}>
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            background: "linear-gradient(135deg, #115E59 0%, #134e4a 100%)", 
            borderRadius: { xs: "24px", md: "48px" }, 
            p: { xs: 6, md: 10 },
            color: "white",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(17, 94, 89, 0.4)"
          }}
        >
          {/* Decorative Elements */}
          <Box 
            sx={{ 
              position: "absolute", 
              top: -50, 
              left: -50, 
              width: 200, 
              height: 200, 
              borderRadius: "50%", 
              bgcolor: "rgba(255,255,255,0.05)" 
            }} 
          />
          <Box 
            sx={{ 
              position: "absolute", 
              bottom: -80, 
              right: -80, 
              width: 300, 
              height: 300, 
              borderRadius: "50%", 
              bgcolor: "rgba(255,255,255,0.05)" 
            }} 
          />

          <Stack spacing={3} alignItems="center" sx={{ position: "relative", zIndex: 1, mb: 8 }}>
            <Typography 
              variant="overline" 
              fontWeight={700} 
              sx={{ opacity: 0.8, letterSpacing: 2 }}
            >
              WITNESS THE EFFICIENCY
            </Typography>
            <Typography 
              variant="h3" 
              fontWeight={800} 
              sx={{ fontSize: { xs: "2rem", md: "3rem" } }}
            >
              See Our Platform in Action
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ maxWidth: 600, mx: "auto", opacity: 0.9, fontWeight: 400 }}
            >
              Take a guided tour through our most popular features and see how 
              HFlow can transform your daily medical practice.
            </Typography>
          </Stack>
          
          <Box sx={{ position: "relative", width: "100%", maxWidth: "900px", mx: "auto" }}>
            <Box
              component="video"
              src={demoVideo}
              playsInline
              ref={videoRef}
              sx={{
                width: "100%",
                aspectRatio: "16/9",
                bgcolor: "rgba(255,255,255,0.1)",
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.2)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                outline: "none",
              }}
              controls={showControls}
            />
            {!showControls && (
              <Box
                onClick={() => {
                  setShowControls(true);
                  const node = videoRef.current;
                  if (node) {
                    try {
                      node.play();
                    } catch {}
                  }
                }}
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  bgcolor: "rgba(0,0,0,0.25)",
                  borderRadius: "24px",
                }}
              >
                <Box
                  sx={{
                    width: { xs: 70, md: 100 },
                    height: { xs: 70, md: 100 },
                    bgcolor: "white",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
                  }}
                >
                  <Play className="text-teal-600 ml-1" fill="currentColor" size={isMobile ? 32 : 48} />
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingDemo;
