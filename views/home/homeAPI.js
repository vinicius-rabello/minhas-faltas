export async function fetchEventsByDate(date, userId) {
  const res = await fetch(`/events/date/${date}/user/${userId}`);
  return res.json();
}

export async function postSubject(subject) {
  const res = await fetch("/subjects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subject),
  });

  return res.json();
}

export async function createEventsFromSubjectId(subjectId) {
  const res = await fetch(`/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subjectId }),
  });

  if (!res.ok) {
    throw new Error(`Failed to create events: ${res.statusText}`);
  }

  return res;
}
