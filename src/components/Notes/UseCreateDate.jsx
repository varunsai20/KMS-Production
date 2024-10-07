const useCreateDate = () => {
    const dateObj = new Date();
  
    // Array of month names
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
  
    // Get month name, day, year, hour, and minute
    const monthName = monthNames[dateObj.getMonth()];
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, "0"); // Ensure 2-digit format
    const minutes = String(dateObj.getMinutes()).padStart(2, "0"); // Ensure 2-digit format
  
    // Construct the final date string
    const date = `${monthName} ${day}, ${year} [${hours}:${minutes}]`;
  
    return date;
  };
  
  export default useCreateDate;