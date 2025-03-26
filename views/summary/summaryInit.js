import { getUserInfo } from "../common/auth.js";

export async function displayUserNameSummary() {
  const welcomeMessage = document.getElementById("welcome");
  const user = await getUserInfo();

  if (user) {
    welcomeMessage.textContent = `Resumo de ${user.username}`;
  }
}