import React, { useState } from "react";
import {
  Heart,
  LayoutGrid,
  Calendar,
  Users,
  Stethoscope,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Receipt,
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

const Sidebar = ({ mobileOpen, onClose, onCollapse }) => {
  const queryClient = useQueryClient();
  const userObj = userLoginDetails();
  const navigate = useNavigate();
  const location = useLocation();

  // Collapse state
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    onCollapse?.(newState);
  };

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
    { icon: <Receipt size={18} />, label: "Billing", path: "/billing" },
  ];

  const bottomItems = [
    { icon: <Settings size={18} />, label: "Settings", path: "/settings" },
    { icon: <LogOut size={18} />, label: "Logout", action: handleLogout },
  ];

  const drawerContent = (
    <Box
      className="flex flex-col h-full bg-black text-white rounded-r-2xl relative"
      sx={{
        width: collapsed ? 60 : 220,
        p: 2,
        transition: "width 0.3s ease",
        alignItems: collapsed ? "center" : "flex-start",
      }}
    >
      {/* Header Section */}
      <Box className="flex items-center justify-between mb-8"
          sx={{
            justifyContent: "space-between",
            width: "100%",
        }}
      >
      {/* Logo + Title */}
      <Box className="flex items-center gap-2">
      <Heart className="text-teal-400" size={20} />
      {!collapsed && <span className="text-lg font-bold tracking-wide">HFlow</span>}
      </Box>

      {/* Right Side Buttons */}
      <Box className="flex items-center gap-1">
      {/* Collapse Toggle */}
      <IconButton
          onClick={toggleCollapse}
          sx={{
          color: "#14b8a6",
          transition: "all 0.3s ease",
        }}
      >
      {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </IconButton>

      {/* Close Button (mobile only) */}
      {!collapsed && (
        <IconButton
          onClick={onClose}
          sx={{ display: { xs: "block", md: "none" }, color: "#fff" }}
        >
          <CloseIcon />
        </IconButton>
      )}
    </Box>
  </Box>

      {/* Navigation */}
      <List className="flex-1 w-full">
        {navItems.map(({ icon, label, path }) => (
          <ListItem key={label} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              component={Link}
              to={path}
              onClick={onClose}
              sx={{
                borderRadius: 2,
                color: location.pathname === path ? "#14b8a6" : "#fff",
                backgroundColor:
                  location.pathname === path ? "rgba(20,184,166,0.2)" : "transparent",
                justifyContent: collapsed ? "center" : "flex-start",
                px: collapsed ? 1.5 : 2,
                "&:hover": {
                  backgroundColor: "rgba(20,184,166,0.4)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "inherit",
                  minWidth: collapsed ? "auto" : 32,
                  mr: collapsed ? 0 : 1,
                  justifyContent: "center",
                }}
              >
                {icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", my: 2, width: "100%" }} />

      {/* Bottom Actions */}
      <List sx={{ width: "100%" }}>
        {bottomItems.map(({ icon, label, path, action }) => (
          <ListItem key={label} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              component={path ? Link : "button"}
              to={path}
              onClick={action || onClose}
              sx={{
                borderRadius: 2,
                color: "#fff",
                justifyContent: collapsed ? "center" : "flex-start",
                px: collapsed ? 1.5 : 2,
                "&:hover": { backgroundColor: "rgba(20,184,166,0.4)" },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "inherit",
                  minWidth: collapsed ? "auto" : 32,
                  mr: collapsed ? 0 : 1,
                  justifyContent: "center",
                }}
              >
                {icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box component="nav" aria-label="sidebar navigation">
      {/* Desktop Sidebar */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: collapsed ? 60 : 220,
            backgroundColor: "#000",
            color: "#fff",
            borderRight: "none",
            transition: "width 0.3s ease",
            overflowX: "hidden",
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
  );
};

export default Sidebar;
