import React from "react";
import { Box, Container, Typography, Grid, Card, CardContent, Stack, useTheme, useMediaQuery } from "@mui/material";
import { 
  Calendar, 
  CreditCard, 
  Receipt, 
  Stethoscope, 
  Clock, 
  FileText 
} from "lucide-react";

const solutionsList = [
  {
    title: "Appointment Booking",
    description: "Streamlined scheduling system for patients and staff. Manage slots, cancellations, and real-time availability.",
    icon: <Calendar className="w-10 h-10 text-teal-600" />,
  },
  {
    title: "Doctor Information",
    description: "Detailed profiles and scheduling for all medical staff. Track specialty, qualifications, and working hours.",
    icon: <Stethoscope className="w-10 h-10 text-teal-600" />,
  },
  {
    title: "Billing Management",
    description: "Comprehensive billing system for services, prescriptions, and lab tests. Automated invoice generation.",
    icon: <Receipt className="w-10 h-10 text-teal-600" />,
  },
  {
    title: "Secure Payments",
    description: "Integrated payment gateways for quick and secure transactions. Support for multiple payment methods.",
    icon: <CreditCard className="w-10 h-10 text-teal-600" />,
  },
  {
    title: "Shift Scheduling",
    description: "Efficiently manage doctor and staff shifts. Prevent overlaps and ensure 24/7 medical coverage.",
    icon: <Clock className="w-10 h-10 text-teal-600" />,
  },
  {
    title: "Patient Records",
    description: "Digitized health records with history tracking. Instant access to diagnosis and previous treatments.",
    icon: <FileText className="w-10 h-10 text-teal-600" />,
  },
];

const LandingSolutions = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box 
      id="solutions" 
      sx={{ 
        py: { xs: 10, md: 15 }, 
        bgcolor: "white",
        position: "relative",
        overflow: "hidden",
        scrollMarginTop: "80px"
      }}
    >
      {/* Decorative background blur */}
      <Box 
        sx={{ 
          position: "absolute", 
          top: "20%", 
          left: "-10%", 
          width: "40%", 
          height: "40%", 
          bgcolor: "primary.light", 
          borderRadius: "50%", 
          opacity: 0.1, 
          filter: "blur(100px)",
          zIndex: 0
        }} 
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={2} alignItems="center" textAlign="center" mb={10}>
          <Typography 
            variant="overline" 
            color="primary.main" 
            fontWeight={700} 
            letterSpacing={2}
          >
            SOLUTIONS FOR MODERN HEALTHCARE
          </Typography>
          <Typography 
            variant="h2" 
            fontWeight={800} 
            sx={{ fontSize: { xs: "2.5rem", md: "3.5rem" }, color: "#0f172a" }}
          >
            Everything You Need to Manage <br /> 
            <span style={{ color: theme.palette.primary.main }}>Your Hospital Efficiently</span>
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ maxWidth: "700px", fontWeight: 400 }}
          >
            A complete suite of tools designed to streamline workflows, enhance patient care, 
            and simplify administrative tasks for medical professionals.
          </Typography>
        </Stack>

        <Grid container spacing={4} justifyContent="center">
          {solutionsList.map((solution, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                elevation={0}
                sx={{ 
                  height: "100%", 
                  p: 2, 
                  borderRadius: "24px", 
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05)",
                    borderColor: "primary.main"
                  }
                }}
              >
                <CardContent sx={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Box 
                    sx={{ 
                      mb: 3, 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      width: 64,
                      height: 64,
                      borderRadius: "16px",
                      bgcolor: "rgba(17, 94, 89, 0.05)",
                      color: "primary.main"
                    }}
                  >
                    {solution.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: "#1e293b" }}>
                    {solution.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {solution.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingSolutions;
