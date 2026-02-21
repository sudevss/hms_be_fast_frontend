import React, { useMemo } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useQuery } from "@tanstack/react-query";
import { getFacilityLogo } from "../../serviceApis";

const EXPANDED_WIDTH = "185px";
const COLLAPSED_WIDTH = "60px";
const Header = ({ onMenuClick, isSidebarCollapsed = false }) => {
  
  const { data: logoBlob, isError, isLoading } = useQuery({
    queryKey: ["facilityLogo"],
    queryFn: () => getFacilityLogo(),
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoUrl = useMemo(() => {
      if (logoBlob && logoBlob.size > 0) {
          return URL.createObjectURL(logoBlob);
      }
      return null;
  }, [logoBlob]);

  return (
    <Box
      component="header"
      className="flex items-center justify-between px-4 bg-white border-b shadow-sm"
      sx={{
        position: "fixed",
        top: 0,
        left: { xs: 0, md: isSidebarCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH },
        width: { xs: "100%", md: `calc(100% - ${isSidebarCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH})` },
        right: 0,
        height: { xs: "2rem", sm: "64px", md: "3.5rem" },
        zIndex: 1100,
        borderColor: "#E0E0E0",
        transition: "all 0.3s ease-in-out",
      }}
    >
      {/* Left: Menu Button for Mobile */}
      <IconButton
        onClick={onMenuClick}
        sx={{
          display: { xs: "flex", md: "none" },
          color: "#115E59",
        }}
        aria-label="open sidebar"
      >
        <MenuIcon />
      </IconButton>

      {/* Center: Title */}
      {isLoading || (logoUrl && !isError) ? (
         <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            {logoUrl && (
                <Box 
                    component="img"
                    src={logoUrl} 
                    alt="Logo" 
                    sx={{ 
                        maxHeight: { xs: "30px", sm: "60px", md: "54px" }, 
                        maxWidth: "100%",
                        objectFit: "contain",
                        display: "block"
                    }} 
                />
            )}
         </Box>
      ) : (
        <Typography
            variant="h6"
            sx={{
            fontWeight: 800,
            fontSize: { xs: "18px", sm: "22px", md: "26px" },
            color: "#115E59",
            textAlign: "center",
            flexGrow: 1,
            }}
        >
            Apple Medical Center
        </Typography>
      )}

      {/* Right: Placeholder for future buttons (profile, settings, etc.) */}
      <Box
        sx={{
          width: "40px",
          display: { xs: "none", md: "block" },
        }}
      />
    </Box>
  );
};

export default Header;
