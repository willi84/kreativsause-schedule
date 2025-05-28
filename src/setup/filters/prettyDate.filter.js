

const prettyDateFilter = (dateString) => {
    const date = new Date(dateString);
    const regex = /^(?<day>\w+?)\s(?<month>\w+?)\s(?<date>\w+?) (?<year>\d+?)$/;
    const matched = date.toDateString().match(regex);

    if (matched) {
      const { month, year } = matched.groups;
      return `${month} ${year}`;
    }

    return dateString;
  }

exports.prettyDateFilter = prettyDateFilter;