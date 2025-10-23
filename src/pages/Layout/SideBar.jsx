import React from "react";
import {
  Heart,
  LayoutGrid,
  Calendar,
  Users,
  Stethoscope,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logOut, userLoginDetails } from "@/stores/LoginStore";
import { useQueryClient } from "@tanstack/react-query";
import CloseIcon from "@mui/icons-material/Close";

const Sidebar = ({ mobileOpen, onClose }) => {
  const queryClient = useQueryClient();
  const userObj = userLoginDetails();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    userObj?.onReset();
    logOut();
    queryClient.clear();
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  // Sidebar navigation items
  const navItems = [
    { icon: <LayoutGrid size={18} />, label: "Dashboard", path: "/dashboard" },
    { icon: <Calendar size={18} />, label: "Appointments", path: "/appointments" },
    { icon: <Users size={18} />, label: "Patients", path: "/patients" },
    { icon: <Stethoscope size={18} />, label: "Doctors", path: "/doctors" },
  ];

  const bottomItems = [
    { icon: <Settings size={18} />, label: "Settings", path: "/settings" },
    { icon: <LogOut size={18} />, label: "Logout", action: handleLogout },
  ];

  const drawerContent = (
    <Box
      className="flex flex-col h-full bg-black text-white rounded-r-2xl"
      sx={{ width: 220, p: 2 }}
    >
      {/* Header Section */}
      <Box className="flex items-center justify-between mb-8">
        <Box className="flex items-center gap-2">
          <Heart className="text-teal-400" size={20} />
          <span className="text-lg font-bold tracking-wide">HMS</span>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ display: { xs: "block", md: "none" }, color: "#fff" }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Navigation */}
      <List className="flex-1">
        {navItems.map(({ icon, label, path }) => (
          <ListItem key={label} disablePadding>
            <ListItemButton
              component={Link}
              to={path}
              onClick={onClose}
              sx={{
                borderRadius: 2,
                color: location.pathname === path ? "#14b8a6" : "#fff",
                backgroundColor:
                  location.pathname === path ? "rgba(20,184,166,0.2)" : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(20,184,166,0.4)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 32 }}>
                {icon}
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", my: 2 }} />

      {/* Bottom Actions */}
      <List>
        {bottomItems.map(({ icon, label, path, action }) => (
          <ListItem key={label} disablePadding>
            <ListItemButton
              component={path ? Link : "button"}
              to={path}
              onClick={action || onClose}
              sx={{
                borderRadius: 2,
                color: "#fff",
                "&:hover": { backgroundColor: "rgba(20,184,166,0.4)" },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 32 }}>
                {icon}
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Box
        component="nav"
        sx={{
          // width: { md: 220 },
          flexShrink: { md: 0 },
        }}
        aria-label="sidebar navigation"
      >
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: 220,
              backgroundColor: "#000",
              color: "#fff",
              borderRight: "none",
              boxShadow: "2px 0px 6px rgba(0,0,0,0.2)",
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: 220,
              backgroundColor: "#000",
              color: "#fff",
              borderRight: "none",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>
    </>
  );
};

export default Sidebar;
