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

  // sample result: "Wednesday, December 24, 2025 at 4:14 PM"
}

// formatCustomDate1

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
  if (!utcString) return "";

  // If the input is already in HH:mm:ss format, just return it
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(utcString)) {
    return utcString;
  }

  // 1. Create a Date object from the string.
  const date = new Date(utcString);
  if (isNaN(date.getTime())) {
    // If it's not a valid date, maybe it's just a time like "08:30:00.123" or similar
    const match = utcString.match(/^(\d{2}):(\d{2}):(\d{2})/);
    if (match) {
      return `${match[1]}:${match[2]}:${match[3]}`;
    }
    return utcString;
  }

  // 2. Helper function to ensure single-digit numbers are padded with a leading zero.
  const pad = (num: number): string => num.toString().padStart(2, "0");

  // 3. Get the UTC hours, minutes, and seconds.
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();

  // 4. Format and concatenate the parts.
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Safely parses any time/date representation from database into a valid Date object.
 * Returns null if parsing fails.
 */
export function parseDateTimeSafe(timeStr: string | null): Date | null {
  if (!timeStr) return null;
  try {
    // If it's a full ISO or timestamp format
    if (timeStr.includes("T") || timeStr.includes("-")) {
      const d = new Date(timeStr);
      if (!isNaN(d.getTime())) return d;
    }

    // Try prepending dummy date for TIME strings like "08:30:00"
    const dummyDate = new Date(`2000-01-01T${timeStr}`);
    if (!isNaN(dummyDate.getTime())) return dummyDate;

    const dummyDateSpace = new Date(`2000-01-01 ${timeStr}`);
    if (!isNaN(dummyDateSpace.getTime())) return dummyDateSpace;

    const d = new Date(timeStr);
    if (!isNaN(d.getTime())) return d;

    return null;
  } catch (error) {
    console.error("Error parsing date safely:", error);
    return null;
  }
}

/**
 * Formats a timestamp or time-only string to a 12-hour AM/PM string (e.g. "08:30 AM").
 */
export function formatTo12HourTime(timeStr: string | null): string {
  const d = parseDateTimeSafe(timeStr);
  if (!d) return "--:--";
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Formats a timestamp or time-only string to standard local time string.
 */
export function formatToLocalTimeString(timeStr: string | null): string {
  const d = parseDateTimeSafe(timeStr);
  if (!d) return "N/A";
  return d.toLocaleTimeString();
}

/**
 * Formats a timestamp or time-only string to standard local date string.
 */
export function formatToLocalDateString(timeStr: string | null): string {
  const d = parseDateTimeSafe(timeStr);
  if (!d) return "N/A";
  return d.toLocaleDateString();
}

/**
 * Formats a timestamp or time-only string to HTML datetime-local format (YYYY-MM-DDTHH:mm).
 */
export function formatToDatetimeLocal(timeStr: string | null): string {
  const d = parseDateTimeSafe(timeStr);
  if (!d) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

