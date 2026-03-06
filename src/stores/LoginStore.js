import { useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";

import { persist } from "zustand/middleware";

const userDetails = {
  user_id: "",
  UserName: "",
  Role: "",
  facility_id: "",
};

const facilityDetails = {
  facility_id: "",
  FacilityName: "",
  FacilityAddress: "",
  TaxNumber: "",
};

const initialState = {
    access_token: "",
    token_type: "",
    expires_in: 0,
  ...userDetails,
  ...facilityDetails,
};

export const userLoginDetails = create()(
  persist(
    (set) => ({
      ...initialState,
      onReset: () => set(() => ({ ...initialState })),
      login: (obj) => set(() => ({ ...initialState, ...obj })),
      setUserDetails: (obj) => set((state) => ({ ...state, ...obj })),
    }),
    {
      name: "auth",
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          if (!str) return null;
          return JSON.parse(str);
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);

export function logOut() {
  // 1️⃣ Reset Zustand state
  userLoginDetails.getState().onReset();

  // 2️⃣ Clear persisted storage
  userLoginDetails.persist.clearStorage();

  // 3️⃣ Clear all session/local storage for good measure
  sessionStorage.clear();
  localStorage.clear();
}
