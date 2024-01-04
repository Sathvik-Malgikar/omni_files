import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home.tsx";
import Search from "./Search.tsx";
import Share from "./Share.tsx";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";

function App() {
  return (
    <div>
      <Header />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Search" element={<Search />} />
          <Route path="/Share" element={<Share />} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </div>
  );
}

export default App;
