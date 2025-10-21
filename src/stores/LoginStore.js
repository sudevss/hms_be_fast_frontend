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
      clearSession: () => set({ user: null, token: null }),
      onReset: () => set(() => initialState),
      login: (obj) => set((state) => ({ ...initialState, ...obj })),
      setUserDetails: (obj) => set((state) => {
        return { ...state, ...obj };
      }),
      onReset: () => set({ user: null, token: null }),
    }),
    {
      name: "auth",
      getStorage: () => sessionStorage,
    }
  )
);


export function logOut() {
  const { clearSession } = userLoginDetails.getState();


  // 1️⃣ Clear Zustand state
  clearSession();

  // 2️⃣ Clear persisted sessionStorage
  userLoginDetails.persist.clearStorage();

  // 3️⃣ Clear all React Query cached data

}
