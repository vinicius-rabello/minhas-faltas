export async function getUserAttendance(userId) {
  const res = await fetch(`/events/user/${userId}/attendance`);
  return res.json();
}
