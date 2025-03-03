import { BrowserRouter, Route } from "react-router-dom";
import { Routes } from "react-router"
import Main from "../pages/Main";
import Layout from "../layouts";
import BreakoutGame from "../pages/BreakoutGame";
import Login from "../pages/Login";


const Routing = () => {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Layout />}>
          <Route index element={<Main />} />
          <Route path="about" element={<BreakoutGame />} />
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Routing;