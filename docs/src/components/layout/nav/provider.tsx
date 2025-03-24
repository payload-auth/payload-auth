"use client";

import { createContext, useContext, useState } from "react";

interface NavbarContextProps {
  isOpen: boolean;
  toggleNavbar: () => void;
  isDocsOpen: boolean;
  toggleDocsNavbar: () => void;
}

const NavbarContext = createContext<NavbarContextProps | undefined>(undefined);

export const NavbarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };
  const toggleDocsNavbar = () => {
    setIsDocsOpen((prevIsOpen) => !prevIsOpen);
  };
  return (
    <NavbarContext.Provider
      value={{ isOpen, toggleNavbar, isDocsOpen, toggleDocsNavbar }}
    >
      {children}
    </NavbarContext.Provider>
  );
};

export const useNavbar = (): NavbarContextProps => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error("useNavbar must be used within a NavbarProvider");
  }
  return context;
};


