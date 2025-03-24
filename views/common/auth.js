import { getBasicUserInfo, getDetailedUserInfo } from "./commonAPI.js";

// Method that gets data on the current user
export async function getUserInfo() {
  // Get token from local storage
  const token = localStorage.getItem("accessToken");

  // If there's no token, redirect user to the login page
  if (!token) {
    window.location.href = "/auth/login";
    return null;
  }

  // Get data on current user
  try {
    const userData = await getBasicUserInfo(token);
    const userProfile = await getDetailedUserInfo(token, userData);
    return Array.isArray(userProfile) ? userProfile[0] : userProfile;
  } catch (error) {
    // If there's any error on fetching the users data, redirect them to the login page
    console.error("Error fetching user data:", error);
    localStorage.removeItem("accessToken");
    window.location.href = "/auth/login";
    return null;
  }
}
