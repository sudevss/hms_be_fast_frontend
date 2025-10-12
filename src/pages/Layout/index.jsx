import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./SideBar";

import { Outlet } from "react-router-dom";

const Layout = () => (
  <div className="flex h-screen">
    {/* Sidebar */}
    <Sidebar />

    {/* Main Content */}
    <div className="flex flex-col flex-1 ml-52">
      {/* Fixed Header */}
      <Header />

      {/* Content Area with fixed height for Outlet */}
      <div className="pt-12 pb-1 px-4 flex-1 overflow-hidden">
        <div className="h-[calc(100vh-2rem-4rem)] overflow-hidden">
          <Outlet />
        </div>
      </div>
      <Footer />

      {/* Fixed Footer */}
    </div>
  </div>
);

export default Layout;
