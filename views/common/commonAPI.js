export async function getBasicUserInfo(token) {
  // This endpoint returns the e-mail used to login
  const res = await fetch("/users/me", {
    method: "GET",
    headers: {
      Authorization: `BEARER ${token}`,
      "Content-Type": "application/json",
    },
  });

  // If anything goes wrong, redirect the user to the login page
  if (!res.ok) {
    localStorage.removeItem("accessToken");
    window.location.href = "/auth/login";
    return null;
  }

  return res.json();
}

export async function getDetailedUserInfo(token, userData) {
  // This endpoint fetches the entry in the users table with this e-mail
  const res = await fetch(`/users/${userData.email}`, {
    method: "GET",
    headers: {
      Authorization: `BEARER ${token}`,
      "Content-Type": "application/json",
    },
  });

  // If anything goes wrong, redirect the user to the login page
  if (!res.ok) {
    localStorage.removeItem("accessToken");
    window.location.href = "/auth/login";
    return null;
  }

  return res.json();
}
