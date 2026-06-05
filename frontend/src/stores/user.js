import { defineStore } from "pinia";
import jwt_decode from "jwt-decode";

export const useUserStore = defineStore({
  id: "user",
  state: () => ({
    token: localStorage.getItem("token") || null,
  }),
  getters: {
    getToken: (state) => state.token,
    // Safely decode the JWT — returns null if token is missing or invalid
    getUser: (state) => {
      if (!state.token) return null;
      try {
        return jwt_decode(state.token);
      } catch (e) {
        console.warn("Invalid JWT token, clearing...");
        localStorage.removeItem("token");
        return null;
      }
    },
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    setToken(token) {
      this.token = token;
      localStorage.setItem("token", token);
    },
    removeToken() {
      this.token = null;
      localStorage.removeItem("token");
    },
  },
});
