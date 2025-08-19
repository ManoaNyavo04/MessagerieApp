// listeNavigationSlice.ts
import { createSlice } from '@reduxjs/toolkit';

interface NavigationState {
  navigations: { title: string, link: string }[];
}

const initialState: NavigationState = {
  navigations: [],
};

const navigationSlice = createSlice({
  name: 'navigations',
  initialState,
  reducers: {
    addNavigation: (state, action) => {
      const { title, link } = action.payload;
      const exists = state.navigations.find(nav => nav.link === link);
      if (!exists) {
        state.navigations.push({ title, link });
      }
    },
    prevNavigations: (state, action) => {
      const title = action.payload;
      const index = state.navigations.findIndex(nav => nav.title === title);
      if (index !== -1) {
        state.navigations = state.navigations.slice(0, index + 1);
      }
    },
    resetNavigations: (state) => {
      state.navigations = [];
    }
  },
});

export const { addNavigation, prevNavigations, resetNavigations } = navigationSlice.actions;
export default navigationSlice.reducer;
