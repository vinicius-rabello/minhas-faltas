export async function fetchEventsByDate(date) {
    const res = await fetch(`/events/${date}`);
    return res.json();
};