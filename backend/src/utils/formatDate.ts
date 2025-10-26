export function formatDateToYYYYMMDD(date: Date): string {
 

  // Get the year, padded to 4 digits
  const year = date.getFullYear();

  // Get the month (0-11) and add 1, then pad to 2 digits
  // The slice(-2) ensures '9' becomes '09'
  const month = ("0" + (date.getMonth() + 1)).slice(-2);

  // Get the day of the month (1-31) and pad to 2 digits
  const day = ("0" + date.getDate()).slice(-2);

  console.log(`${year}-${month}-${day}`);

  return `${year}-${month}-${day}`; // result sample "2025-10-09"
}
