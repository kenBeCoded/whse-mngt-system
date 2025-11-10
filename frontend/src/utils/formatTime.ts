// formatTime.ts
export function formatTimeFromTimestamp(timestamp: string | null): string {
  if (!timestamp) return "--:--";
  
  try {
    const date = new Date(timestamp);
    // Check if valid date
    if (isNaN(date.getTime())) return "--:--";
    
    // Format as HH:MM (24-hour format)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return "--:--";
  }
}

export function removeSecondsSlice(timeString: string): string {
  return timeString.slice(0, 5);
}