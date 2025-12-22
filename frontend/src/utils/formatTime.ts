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

export function formatDateToYYYYMMDD(date: Date): string {
  // Get the year, padded to 4 digits
  const year = date.getFullYear();

  // Get the month (0-11) and add 1, then pad to 2 digits
  // The slice(-2) ensures '9' becomes '09'
  const month = ("0" + (date.getMonth() + 1)).slice(-2);

  // Get the day of the month (1-31) and pad to 2 digits
  const day = ("0" + date.getDate()).slice(-2);

  return `${year}-${month}-${day}`; // result sample "2025-10-09"
}

export function formatUtcStringToHHmmss(utcString: string): string {
  // 1. Create a Date object from the string.
  const date = new Date(utcString);

  // 2. Helper function to ensure single-digit numbers are padded with a leading zero.
  // We use .padStart(2, '0') for this.
  const pad = (num: number): string => num.toString().padStart(2, "0");

  // 3. Get the UTC hours, minutes, and seconds.
  // Using UTC methods ensures the output is always 12:34:33 for the sample input.
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();

  // 4. Format and concatenate the parts.
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
