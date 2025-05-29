// Internationalization dictionary
const DICTIONARY = {
  EN: {
    ELEMENT_NOT_FOUND: "Element staff-difference not found",
    TABLE_NOT_FOUND: "Time table not found",
    WORK_TIME_LABEL: "📊 Work Time:",
    PROGRESS_LABEL: "🎯 Progress:",
    DAYS_WORKED_SUFFIX: "days worked",
    PLAN_PREFIX: "plan",
    HOURS_SUFFIX: "h",
    ACTUAL_SUFFIX: "actual",
    AHEAD_PREFIX: "ahead by",
    BEHIND_PREFIX: "behind by",
    SEPARATOR: " | ",
    BULLET: " • ",
    PERCENT_SUFFIX: "%",
  },
  RU: {
    ELEMENT_NOT_FOUND: "Элемент staff-difference не найден",
    TABLE_NOT_FOUND: "Таблица времени не найдена",
    WORK_TIME_LABEL: "📊 Рабочее время:",
    PROGRESS_LABEL: "🎯 Прогресс:",
    DAYS_WORKED_SUFFIX: "дней работы",
    PLAN_PREFIX: "план",
    HOURS_SUFFIX: "ч",
    ACTUAL_SUFFIX: "факт",
    AHEAD_PREFIX: "опережение на",
    BEHIND_PREFIX: "отставание на",
    SEPARATOR: " | ",
    BULLET: " • ",
    PERCENT_SUFFIX: "%",
  },
};

// Language configuration
const LANGUAGE_CONFIG = {
  DEFAULT_LANGUAGE: "EN",
  CURRENT_LANGUAGE: "EN", // Can be changed dynamically
};

// Application constants
const CONSTANTS = {
  WORK_HOURS_PER_DAY: 8,
  MIN_CELLS_COUNT: 4,
  TIME_REGEX: /(\d{1,2}):(\d{2})/,
  SELECTORS: {
    STAFF_DIFFERENCE: "staff-difference",
    TIME_TABLE: ".time-tracker-table tbody",
    TODAY_ROW: "tr.today",
  },
  CSS_CLASSES: {
    SUCCESS: "text-success",
    DANGER: "text-danger",
  },
};

// Function to get localized text
function getText(key) {
  const language = LANGUAGE_CONFIG.CURRENT_LANGUAGE;
  const dictionary = DICTIONARY[language] || DICTIONARY[LANGUAGE_CONFIG.DEFAULT_LANGUAGE];
  return dictionary[key] || key;
}

// Function to change language
function setLanguage(languageCode) {
  if (DICTIONARY[languageCode]) {
    LANGUAGE_CONFIG.CURRENT_LANGUAGE = languageCode;
    console.log(`Language changed to: ${languageCode}`);
  } else {
    console.warn(`Language ${languageCode} not supported, using default: ${LANGUAGE_CONFIG.DEFAULT_LANGUAGE}`);
  }
}

// Function to display staff-difference element
function showStaffDifference() {
  const element = document.getElementById(CONSTANTS.SELECTORS.STAFF_DIFFERENCE);

  if (element) {
    element.style.display = "block";
  } else {
    console.log(getText("ELEMENT_NOT_FOUND"));
  }
}

showStaffDifference();

// Utility function for formatting time to hours:minutes
function formatTime(totalHours) {
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours % 1) * 60);
  return `${hours}:${String(minutes).padStart(2, "0")}`;
}

// Function for parsing working time data from table
function parseWorkingTimeData(timeTable) {
  const rows = timeTable.querySelectorAll("tr");
  let workedDays = 0;
  let totalWorkedHours = 0;

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");

    if (cells.length >= CONSTANTS.MIN_CELLS_COUNT) {
      const intervalsCell = cells[1]; // Time intervals
      const totalHoursCell = cells[3]; // Total time per day

      // Check for working intervals or worked time
      const hasIntervals =
        intervalsCell && intervalsCell.textContent.trim() !== "";
      const hoursText = totalHoursCell.textContent.trim();
      const hasWorkedHours = hoursText !== "" && hoursText !== " ";

      // If there are intervals or worked time - count as working day
      if (hasIntervals || hasWorkedHours) {
        workedDays++;

        // Parse worked hours (format "05:53")
        const timeMatch = hoursText.match(CONSTANTS.TIME_REGEX);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          totalWorkedHours += hours + minutes / 60;
        }
      }
    }
  });

  return { workedDays, totalWorkedHours };
}

// Function for calculating work time statistics
function calculateWorkStatistics(workedDays, totalWorkedHours) {
  const expectedHours = workedDays * CONSTANTS.WORK_HOURS_PER_DAY;
  const percentage =
    expectedHours > 0
      ? ((totalWorkedHours / expectedHours) * 100).toFixed(1)
      : 0;

  const workedHoursFormatted = formatTime(totalWorkedHours);
  const colorClass =
    parseFloat(percentage) >= 100
      ? CONSTANTS.CSS_CLASSES.SUCCESS
      : CONSTANTS.CSS_CLASSES.DANGER;

  return {
    expectedHours,
    percentage,
    workedHoursFormatted,
    colorClass,
  };
}

// Function for creating and displaying work time report
function renderWorkReport(
  workedDays,
  expectedHours,
  workedHoursFormatted,
  percentage,
  colorClass,
  totalWorkedHours
) {
  // Calculate ahead/behind status
  const { statusText, statusClass } = calculateProgressStatus(
    totalWorkedHours,
    expectedHours
  );

  const reportText = `
    <br><strong>${getText("WORK_TIME_LABEL")}</strong> ${workedDays} ${getText("DAYS_WORKED_SUFFIX")}${getText("SEPARATOR")}${getText("PLAN_PREFIX")} ${expectedHours}${getText("HOURS_SUFFIX")}<br>
    <strong>${getText("PROGRESS_LABEL")}</strong> <span class="${colorClass}">${workedHoursFormatted}${getText("HOURS_SUFFIX")} ${getText("ACTUAL_SUFFIX")}${getText("BULLET")}${percentage}${getText("PERCENT_SUFFIX")}</span>${getText("BULLET")}<strong class="${statusClass}">${statusText}</strong>
  `;

  const staffDifferenceElement = document.getElementById(
    CONSTANTS.SELECTORS.STAFF_DIFFERENCE
  );
  if (staffDifferenceElement) {
    staffDifferenceElement.innerHTML += reportText;
  }
}

// Function for calculating ahead/behind status
function calculateProgressStatus(totalWorkedHours, expectedHours) {
  const timeDifference = totalWorkedHours - expectedHours;
  const isAhead = timeDifference >= 0;
  const diffFormatted = formatTime(Math.abs(timeDifference));

  const statusText = isAhead
    ? `${getText("AHEAD_PREFIX")} ${diffFormatted}`
    : `${getText("BEHIND_PREFIX")} ${diffFormatted}`;
  const statusClass = isAhead
    ? CONSTANTS.CSS_CLASSES.SUCCESS
    : CONSTANTS.CSS_CLASSES.DANGER;

  return { statusText, statusClass };
}

// Function for analyzing working time
function analyzeWorkingTime() {
  // Find the working time table
  const timeTable = document.querySelector(CONSTANTS.SELECTORS.TIME_TABLE);

  if (!timeTable) {
    console.log(getText("TABLE_NOT_FOUND"));
    return;
  }

  // Parse data from table
  const { workedDays, totalWorkedHours } = parseWorkingTimeData(timeTable);

  // Calculate statistics
  const { expectedHours, percentage, workedHoursFormatted, colorClass } =
    calculateWorkStatistics(workedDays, totalWorkedHours);

  // Display report
  renderWorkReport(
    workedDays,
    expectedHours,
    workedHoursFormatted,
    percentage,
    colorClass,
    totalWorkedHours
  );
}

analyzeWorkingTime();
