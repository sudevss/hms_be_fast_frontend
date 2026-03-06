import React from "react";
import { Box, Container, Typography, Grid, Stack, IconButton, Divider, useTheme } from "@mui/material";
import { Heart, Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react";

const LandingFooter = () => {
  const theme = useTheme();

  return (
    <Box 
      sx={{ 
        bgcolor: "#0f172a", 
        color: "white", 
        pt: { xs: 8, md: 12 }, 
        pb: 4,
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Decorative gradient blur */}
      <Box 
        sx={{ 
          position: "absolute", 
          bottom: "-10%", 
          right: "-5%", 
          width: "30%", 
          height: "30%", 
          bgcolor: "primary.main", 
          borderRadius: "50%", 
          opacity: 0.1, 
          filter: "blur(100px)",
          zIndex: 0
        }} 
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={8} justifyContent="center" textAlign="center">
          <Grid item xs={12} md={8}>
            <Stack spacing={4} alignItems="center">
              {/* Brand Section */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box 
                  sx={{ 
                    bgcolor: "primary.main", 
                    p: 1, 
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 16px -4px rgba(17, 94, 89, 0.4)"
                  }}
                >
                  <Heart color="white" size={24} fill="white" />
                </Box>
                <Typography variant="h4" fontWeight={800} letterSpacing={-1}>
                  HFlow
                </Typography>
              </Box>

              <Typography 
                variant="h6" 
                sx={{ 
                  color: "#94a3b8", 
                  lineHeight: 1.8, 
                  maxWidth: 600,
                  fontWeight: 400
                }}
              >
                Empowering healthcare providers with cutting-edge technology for better 
                patient outcomes and efficient operations. Trusted by medical institutions worldwide.
              </Typography>

              {/* Contact Information */}
              <Stack 
                direction={{ xs: "column", sm: "row" }} 
                spacing={{ xs: 3, sm: 6 }} 
                divider={<Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.1)", display: { xs: "none", sm: "block" } }} />}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Mail size={18} className="text-teal-500" />
                  <Typography variant="body2" sx={{ color: "#cbd5e1", fontWeight: 500 }}>
                    info@intuismartsolutions.com
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Phone size={18} className="text-teal-500" />
                  <Typography variant="body2" sx={{ color: "#cbd5e1", fontWeight: 500 }}>
                    +91 88484 51355
                  </Typography>
                </Stack>
              </Stack>

              {/* Social Media Links */}
              <Stack direction="row" spacing={2}>
                {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                  <IconButton 
                    key={i} 
                    size="medium" 
                    sx={{ 
                      color: "#94a3b8", 
                      bgcolor: "rgba(255,255,255,0.05)",
                      "&:hover": { 
                        color: "white", 
                        bgcolor: "primary.main",
                        transform: "translateY(-4px)" 
                      },
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                  >
                    <Icon size={20} />
                  </IconButton>
                ))}
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: { xs: 6, md: 8 }, borderColor: "rgba(255,255,255,0.05)" }} />

        {/* Bottom Bar */}
        <Box 
          sx={{ 
            display: "flex", 
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between", 
            alignItems: "center",
            gap: 2,
            textAlign: "center"
          }}
        >
          <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
            © 2026 IntuiSmart Solutions — All rights reserved.
          </Typography>
          <Stack direction="row" spacing={3}>
            {["Privacy Policy", "Terms of Service", "Support"].map((item) => (
              <Typography 
                key={item} 
                variant="caption" 
                sx={{ 
                  color: "#64748b", 
                  cursor: "pointer", 
                  "&:hover": { color: "white" },
                  fontWeight: 600
                }}
              >
                {item}
              </Typography>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingFooter;
