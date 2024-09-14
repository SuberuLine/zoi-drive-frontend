import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useUserStore = create(
    persist(
      (set, get) => ({
        userInfo: null,
        checkinToday: false,
        todaysReward: 0,
        setCheckinToday: (checkinToday) => set({ checkinToday }),
        setTodaysReward: (todaysReward) => set({ todaysReward }),
        setUserInfo: (info) => set({ userInfo: info }),
        getUserDetail: () => get().userInfo?.userDetail || null,
        getUserCheckin: () => get().userInfo?.userCheckin || null,
        getUserAvatar: () => get().userInfo?.avatar || null,
        isChecked: () => {
          const lastCheckin = get().userInfo?.userCheckin?.lastCheckin;
          if (!lastCheckin) return false;
          const lastCheckinDate = new Date(lastCheckin);
          const today = new Date();
          return lastCheckinDate.getFullYear() === today.getFullYear() &&
                  lastCheckinDate.getMonth() === today.getMonth() &&
                  lastCheckinDate.getDate() === today.getDate();
        },
      }),
      {
        name: 'user-storage', 
        storage: createJSONStorage(() => localStorage),
      }
    )
  );

export default useUserStore;