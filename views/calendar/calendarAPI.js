
export async function getUserAttendance(userId) {
    const res = await fetch(`/events/${userId}/attendance`);
    return res.json();
  }