// src/utils/logoutUser.js
import Cookies from "js-cookie";
import api from "./api"; // 🔄 use the custom axios instance

const logoutUser = async () => {
  const refreshToken = Cookies.get("refreshToken");

  try {
    if (refreshToken) {
      await api.post("/logout/", { refresh: refreshToken }); // 🔄 use `api`
    }
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
  }
};

export default logoutUser;