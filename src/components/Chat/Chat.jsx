import React, { useEffect, useState } from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Sidebar from "../Sidebar.tsx";
import Header from "../Header.tsx";
import MyMessages from "../MyMessages.tsx";
import { ToastContainer, toast } from "react-toastify";
import { Helmet } from "react-helmet";
import TopSideBar from "../TopSideBar/TopSideBar";
import SideBar from "../SideBar/SideBar";

export default function Chat() {
  const title = "Чат со студентами";
  const [isOpenSideBar, setIsOpenSideBar] = useState(true);

  const toggleSideBar = (boolValue) => {
    setIsOpenSideBar(boolValue);
  };

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <ToastContainer />
      <Helmet>
        <title>{title}</title>
      </Helmet>
      {isOpenSideBar && <SideBar title={title} />}
      <div className="mainInfo">
        
          <Box sx={{ display: "flex", height: "100%" }}>
            <Header />
            <Box component="main" className="MainContent" sx={{ flex: 1 }}>
              <MyMessages />
            </Box>
          </Box>
      </div>
    </CssVarsProvider>
  );
}
