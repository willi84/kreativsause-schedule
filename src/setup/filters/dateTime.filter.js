const dateTimeFilter = (timestamp) => {
    const date = new Date(timestamp * 1000);

    // Get date components
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-indexed
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // Format components as a German date string
    return  `${day}.${month}.${year}, ${hours}:${minutes}:${seconds}`;
}
exports.dateTimeFilter = dateTimeFilter;