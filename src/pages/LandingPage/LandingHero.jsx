import React from "react";
import { Box, Button, Container, Typography, Grid, Stack, useTheme, useMediaQuery } from "@mui/material";
import { Play, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingHero = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box 
      sx={{ 
        position: "relative",
        background: "linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)",
        overflow: "hidden",
        pt: { xs: 6, md: 10 },
        pb: { xs: 8, md: 12 }
      }}
    >
      {/* Abstract Background Shapes */}
      <Box 
        sx={{ 
          position: "absolute", 
          top: "-10%", 
          right: "-5%", 
          width: "40%", 
          height: "60%", 
          bgcolor: "primary.light", 
          borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
          opacity: 0.2,
          filter: "blur(80px)",
          zIndex: 0
        }} 
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={6} alignItems="center" textAlign="center">
          <Box>
            <Typography 
              variant="subtitle2" 
              color="primary.main" 
              fontWeight={700}
              sx={{ 
                display: "inline-block",
                bgcolor: "rgba(17, 94, 89, 0.08)",
                px: 2,
                py: 0.5,
                borderRadius: "20px",
                mb: 2,
                letterSpacing: 1
              }}
            >
              NEXT-GEN HMS SOLUTION
            </Typography>
            <Typography 
              variant="h1" 
              fontWeight={900} 
              gutterBottom
              sx={{ 
                fontSize: { xs: "2.8rem", md: "4rem" },
                lineHeight: 1.1,
                color: "#0f172a",
                mb: 3
              }}
            >
              Experience the Future of <br />
              <span style={{ 
                background: "linear-gradient(90deg, #115E59 0%, #2dd4bf 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                Healthcare Management
              </span>
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                fontWeight: 400, 
                maxWidth: "800px",
                mx: "auto",
                fontSize: { xs: "1rem", md: "1.2rem" },
                lineHeight: 1.6
              }}
            >
              Streamline every aspect of your hospital operations with our intuitive, 
              secure, and powerful management system. Built for modern clinics and hospitals.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate("/login")}
              endIcon={<ArrowRight size={20} />}
              sx={{ 
                borderRadius: "12px", 
                px: 4, 
                py: 2,
                fontSize: "1rem",
                fontWeight: 600,
                boxShadow: "0 10px 15px -3px rgba(17, 94, 89, 0.3)"
              }}
            >
              Get Started Now
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              startIcon={<Play size={20} />}
              onClick={() => {
                const el = document.getElementById("product-walkthrough");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              sx={{ 
                borderRadius: "12px", 
                px: 4, 
                py: 2,
                fontSize: "1rem",
                fontWeight: 600,
                borderWidth: "2px",
                "&:hover": {
                  borderWidth: "2px"
                }
              }}
            >
              Watch Demo
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default LandingHero;
