import { createContext, ReactNode, useState } from "react";
import { IGlobalContext } from "../types/global-context";

const GlobalContext = createContext({} as IGlobalContext);

const GlobalContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, _setUser] = useState<IGlobalContext["user"]>(
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user") as string)
      : {}
  );

  const out: IGlobalContext = {
    api: {
      setUser: (roll_number: string | null, name: string | null) => {
        if (roll_number == null && name == null) {
          localStorage.removeItem("user");
          _setUser({
            roll_number: null,
            name: null,
          });
        }
        const ud = {
          name,
          roll_number,
        };
        localStorage.setItem("user", JSON.stringify(ud));
        _setUser(ud);
        return;
      },
    },
    user,
  };
  return (
    <GlobalContext.Provider value={out}>{children}</GlobalContext.Provider>
  );
};

export { GlobalContext, GlobalContextProvider };
