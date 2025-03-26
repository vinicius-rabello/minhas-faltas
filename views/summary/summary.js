import { getUserInfo } from "../common/auth.js";
import { displayUserNameSummary, loadAttendanceSummary } from "./summaryInit.js";

document.addEventListener("DOMContentLoaded", async () => {
  const user = await getUserInfo();
  displayUserNameSummary(user);
  loadAttendanceSummary(user);
});