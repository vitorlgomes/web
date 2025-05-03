import React from "react";
import { State } from "./layout";

export const Context = React.createContext<State>({
  isOpen: false,
});
