import { CurrentUserContext } from "@/providers/CurrentUserProvider";
import { useContext } from "react";

export const useCurrentUser = () => {
  const context = useContext(CurrentUserContext);

  if (!context) {
    throw new Error("useCurrentUser must be used within CurrentUserProvider");
  }

  return context;
};
