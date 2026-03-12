import { createContext, useContext, useState, ReactNode } from "react";

interface PrivateModeContextType {
  isPrivate: boolean;
  togglePrivateMode: () => void;
}

const PrivateModeContext = createContext<PrivateModeContextType | undefined>(undefined);

export function PrivateModeProvider({ children }: { children: ReactNode }) {
  const [isPrivate, setIsPrivate] = useState(false);
  const togglePrivateMode = () => setIsPrivate((prev) => !prev);

  return (
    <PrivateModeContext.Provider value={{ isPrivate, togglePrivateMode }}>
      {children}
    </PrivateModeContext.Provider>
  );
}

export function usePrivateMode() {
  const context = useContext(PrivateModeContext);
  if (context === undefined) {
    throw new Error("usePrivateMode must be used within a PrivateModeProvider");
  }
  return context;
}
