export async function fetchAttendanceSummary(userId) {
    const res = await fetch(`/events/user/${userId}/summary`);
    return res.json();
  }