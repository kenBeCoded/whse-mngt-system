// formatTime.ts
export function formatTimeFromTimestamp(timestamp: string | null): string {
  if (!timestamp) return "--:--";

  try {
    const date = new Date(timestamp);
    // Check if valid date
    if (isNaN(date.getTime())) return "--:--";

    // Format as HH:MM (24-hour format)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return "--:--";
  }
}

export function removeSecondsSlice(timeString: string): string {
  return timeString.slice(0, 5);
}

export function formatCustomDate1(dateString: string | Date): string {
  // Convert the input (string or Date) into a Date object
  const date = new Date(dateString);

  // Define the desired date formatting options
  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    weekday: "long", // "Sunday"
    year: "numeric", // "2023"
    month: "long", // "December"
    day: "2-digit", // "03"
  };

  // Define the desired time formatting options
  const timeFormatOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // "9"
    minute: "2-digit", // "00"
    hour12: true, // "AM" or "PM"
  };

  // 1. Get the formatted date part (e.g., "Sunday, December 03, 2023")
  const formattedDate = date.toLocaleDateString("en-US", dateFormatOptions);

  // 2. Get the formatted time part (e.g., "9:00 AM")
  const formattedTime = date.toLocaleTimeString("en-US", timeFormatOptions);

  // 3. Combine them with "at"
  return `${formattedDate} at ${formattedTime}`;
}
