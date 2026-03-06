import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Stack, useMediaQuery, useTheme, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

const LandingNavbar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isScrolled, setIsScrolled] = useState(false);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Box 
      component="nav" 
      sx={{ 
        py: isScrolled ? 1.5 : 2.5, 
        position: "sticky",
        top: 0,
        bgcolor: isScrolled ? "rgba(15, 23, 42, 0.95)" : "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(12px)",
        zIndex: 1000,
        transition: "all 0.3s ease",
        borderBottom: isScrolled ? "1px solid rgba(255, 255, 255, 0.1)" : "none"
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Logo */}
          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 1.5,
              cursor: "pointer"
            }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <Box 
              sx={{ 
                bgcolor: "primary.main", 
                p: 1, 
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 6px -1px rgba(17, 94, 89, 0.2)"
              }}
            >
              <Heart color="white" size={20} fill="white" />
            </Box>
            <Typography 
              variant="h5" 
              fontWeight={800} 
              color="white"
              sx={{ letterSpacing: -0.5 }}
            >
              HFlow
            </Typography>
          </Box>

          {/* Navigation Links */}
          <Stack direction="row" spacing={4} alignItems="center">
            {!isMobile && (
              <Stack direction="row" spacing={4}>
                {["Solutions"].map((item) => (
                  <Button 
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    sx={{ 
                      textTransform: "none",
                      color: "rgba(255, 255, 255, 0.8)",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      minWidth: "auto",
                      p: 0,
                      "&:hover": { 
                        color: "white",
                        bgcolor: "transparent"
                      },
                      transition: "color 0.2s"
                    }}
                  >
                    {item}
                  </Button>
                ))}
              </Stack>
            )}
            
            <Button 
              variant="contained" 
              onClick={() => navigate("/login")}
              sx={{ 
                borderRadius: "10px", 
                px: 3, 
                py: 1,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.9rem",
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(17, 94, 89, 0.2)"
                }
              }}
            >
              Portal Login
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingNavbar;
