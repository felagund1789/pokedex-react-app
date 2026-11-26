import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/pokemon", label: "Pokémon" },
  { to: "/types", label: "Types" },
  { to: "/egg-groups", label: "Egg Groups" },
  { to: "/moves", label: "Moves" },
  { to: "/items", label: "Items" },
];

const NavigationMenu = () => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        className="navigation-toggle"
        type="button"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-controls="main-navigation"
        onClick={() => setOpen((current) => !current)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>
      {createPortal(<>
        {open && <div className="navigation-backdrop" aria-hidden="true" onClick={() => {
          setOpen(false);
          buttonRef.current?.focus();
        }} />}
        <nav id="main-navigation" className="navigation-sidebar" aria-label="Main navigation" hidden={!open}>
          <div className="navigation-sidebar__heading">
            <span>Navigation</span>
            <button type="button" aria-label="Close navigation menu" onClick={() => {
              setOpen(false);
              buttonRef.current?.focus();
            }}>
              &times;
            </button>
          </div>
          {links.map(({ to, label }) => {
            const active = location.pathname === to || location.pathname.startsWith(`${to}/`) ||
              (to === "/pokemon" && location.pathname === "/") ||
              (to === "/types" && location.pathname.startsWith("/type/"));
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? "page" : undefined}
                className={active ? "active" : undefined}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </>, document.body)}
    </>
  );
};

export default NavigationMenu;
