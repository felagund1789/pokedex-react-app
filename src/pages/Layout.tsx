import { Outlet } from "react-router-dom";
import Header from "../components/header/Header";
import "../App.css";

function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
