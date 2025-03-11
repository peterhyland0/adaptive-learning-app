import React, { createContext, useState } from "react";

/**
 * This manages application-wide state tracking.
 */
export const SessionContext = createContext(undefined, undefined);

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState({ token: null }); // Initialize session with a token state

  const updateSession = (newSession) => {
    setSession(newSession);
  };

  return (
    <SessionContext.Provider value={{ session, setSession: updateSession }}>
      {children}
    </SessionContext.Provider>
  );
};
