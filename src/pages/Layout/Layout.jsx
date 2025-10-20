import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./SideBar";

import { Outlet } from "react-router-dom";
import { userLoginDetails } from "@/stores/LoginStore";

const Layout = () => {

    const userObj = userLoginDetails.getState();
    const { access_token, token_type } = userObj || {};
    

  return (
  <div className="flex h-screen">
    {/* Sidebar */}
    {access_token &&
    <Sidebar />}

    {/* Main Content */}
    <div className="flex flex-col flex-1 ml-52" style={{marginLeft: "7rem"}}>
      {/* Fixed Header */}
       {access_token &&
      <Header />
       }
      {/* Content Area with fixed height for Outlet */}
      <div className="pt-12 pb-1 px-4 flex-1 overflow-hidden">
        <div className="h-[calc(100vh-2rem-4rem)] overflow-hidden">
          <Outlet />
        </div>
      </div>
      <Footer />

      {/* Fixed Footer */}
    </div>
  </div>)
}

export default Layout;
