import { Outlet, ScrollRestoration } from "react-router-dom";
import "../App.css";

function Layout() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  );
}

export default Layout;
