import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';

import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Home from "./Home.tsx";
import Search from "./Search.tsx";
import Share from "./Share.tsx";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";
import { Helmet } from 'react-helmet';

function App() {
  // const location = useLocation();
  // const navigate = useNavigate();
  // useEffect(() => {
    
  //   if(location.pathname=="/Search" && location.state==null){
  //     alert("please login first!")
  //     navigate("/")
  //   }
    
  // }, [location]);
  return (
    <div>
      <Helmet>
        <title>Omni-Files</title>
      </Helmet>
      <Header />
      <BrowserRouter  >
        <Routes>
          <Route path="/" index element={<Home />} />
          <Route path="/Search" element={<Search />} />
          <Route path="/Share" element={<Share />} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </div>
  );
}

export default App;
