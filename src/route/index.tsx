import { BrowserRouter, Route } from "react-router-dom";
import { Routes } from "react-router"
import Main from "../pages/Main";
import Layout from "../layouts";
import BreakoutGame from "../pages/BreakoutGame";
import BreakoutG from "../pages/BreakoutG";
import JumpGame from "../pages/JumpGame";
import Login from "../pages/Login";


const Routing = () => {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Layout />}>
          <Route index element={<Main />} />
          <Route path="game" element={<BreakoutG />} />
          <Route path="game1" element={<JumpGame />} />
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Routing;