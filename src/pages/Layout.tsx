import { AnimatePresence } from "framer-motion";
import { Outlet } from "react-router-dom";
import Header from "../components/header/Header";
import "../App.css";

function Layout() {
  return (
    <>
      <Header />
      <main>
        <AnimatePresence>
          <Outlet />
        </AnimatePresence>
      </main>
    </>
  );
}

export default Layout;
