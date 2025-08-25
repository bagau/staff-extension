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

const LANGUAGE_CONFIG = {
  DEFAULT_LANGUAGE: "EN",
  CURRENT_LANGUAGE: "RU",
};

const CONSTANTS = {
  WORK_HOURS_PER_DAY: 8,
  MIN_CELLS_COUNT: 4,
  TIME_REGEX: /(\d{1,2}):(\d{2})/,
  TABLE_COLUMNS: {
    INTERVALS: 1,
    HOURS: 3,
  },
  SELECTORS: {
    STAFF_DIFFERENCE: "staff-difference",
    TIME_TABLE: ".time-tracker-table tbody",
  },
  CSS_CLASSES: {
    SUCCESS: "text-success",
    DANGER: "text-danger",
  },
  STORAGE_KEYS: {
    REQUIRED_ADJUSTMENTS: "requiredAdjustments",
    ACTUAL_ADJUSTMENTS: "actualAdjustments",
  },
};

function getText(key) {
  const language = LANGUAGE_CONFIG.CURRENT_LANGUAGE;
  const dictionary =
    DICTIONARY[language] || DICTIONARY[LANGUAGE_CONFIG.DEFAULT_LANGUAGE];
  return dictionary[key] || key;
}

async function loadAdjustments() {
  try {
    if (!chrome || !chrome.storage || !chrome.storage.local) {
      return { requiredAdjustments: [], actualAdjustments: [] };
    }

    const result = await chrome.storage.local.get([
      CONSTANTS.STORAGE_KEYS.REQUIRED_ADJUSTMENTS,
      CONSTANTS.STORAGE_KEYS.ACTUAL_ADJUSTMENTS,
    ]);

    return {
      requiredAdjustments:
        result[CONSTANTS.STORAGE_KEYS.REQUIRED_ADJUSTMENTS] || [],
      actualAdjustments:
        result[CONSTANTS.STORAGE_KEYS.ACTUAL_ADJUSTMENTS] || [],
    };
  } catch (error) {
    console.error("Error loading adjustments:", error);
    return { requiredAdjustments: [], actualAdjustments: [] };
  }
}

function calculateTotalAdjustment(adjustments) {
  return adjustments.reduce((total, adj) => total + adj.value, 0);
}

function showStaffDifference() {
  const element = document.getElementById(CONSTANTS.SELECTORS.STAFF_DIFFERENCE);

  if (element) {
    element.style.display = "block";
  } else {
    console.log(getText("ELEMENT_NOT_FOUND"));
  }
}

showStaffDifference();

function formatTime(totalHours) {
  let hours = Math.floor(totalHours);
  let minutes = Math.round((totalHours % 1) * 60);

  // Handle overflow when minutes round to 60
  if (minutes >= 60) {
    hours += 1;
    minutes = 0;
  }

  return `${hours}:${String(minutes).padStart(2, "0")}`;
}

function parseWorkingTimeData(timeTable) {
  const rows = timeTable.querySelectorAll("tr");
  let workedDays = 0;
  let totalWorkedHours = 0;

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");

    if (cells.length >= CONSTANTS.MIN_CELLS_COUNT) {
      const intervalsCell = cells[CONSTANTS.TABLE_COLUMNS.INTERVALS];
      const totalHoursCell = cells[CONSTANTS.TABLE_COLUMNS.HOURS];

      const hasIntervals =
        intervalsCell && intervalsCell.textContent.trim() !== "";
      const hoursText = totalHoursCell.textContent.trim();
      const hasWorkedHours = hoursText && hoursText !== " ";

      if (hasIntervals || hasWorkedHours) {
        workedDays++;

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

function calculateWorkStatistics(rawData, adjustments) {
  const { workedDays, totalWorkedHours } = rawData;
  const { requiredAdjustment, actualAdjustment } = adjustments;

  const expectedHours = Math.max(
    0,
    workedDays * CONSTANTS.WORK_HOURS_PER_DAY + requiredAdjustment
  );
  const actualHours = Math.max(0, totalWorkedHours + actualAdjustment);

  const percentage =
    expectedHours === 0 ? 0 : ((actualHours / expectedHours) * 100).toFixed(1);

  const timeDifference = actualHours - expectedHours;
  const isAhead = timeDifference >= 0;
  const diffFormatted = formatTime(Math.abs(timeDifference));

  const statusText = isAhead
    ? `${getText("AHEAD_PREFIX")} ${diffFormatted}`
    : `${getText("BEHIND_PREFIX")} ${diffFormatted}`;

  return {
    workedDays,
    expectedHours: formatTime(expectedHours),
    actualHours: formatTime(actualHours),
    percentage,
    statusText,
    isAhead,
  };
}

function renderWorkReport(stats) {
  const colorClass = stats.isAhead
    ? CONSTANTS.CSS_CLASSES.SUCCESS
    : CONSTANTS.CSS_CLASSES.DANGER;

  const reportText = `
    <br><strong>${getText("WORK_TIME_LABEL")}</strong> ${stats.workedDays} ${getText("DAYS_WORKED_SUFFIX")}${getText("SEPARATOR")}${getText("PLAN_PREFIX")} ${stats.expectedHours}${getText("HOURS_SUFFIX")}<br>
    <strong>${getText("PROGRESS_LABEL")}</strong> <span class="${colorClass}">${stats.actualHours}${getText("HOURS_SUFFIX")} ${getText("ACTUAL_SUFFIX")}${getText("BULLET")}${stats.percentage}${getText("PERCENT_SUFFIX")}</span>${getText("BULLET")}<strong class="${colorClass}">${stats.statusText}</strong>
  `;

  const staffDifferenceElement = document.getElementById(
    CONSTANTS.SELECTORS.STAFF_DIFFERENCE
  );
  if (staffDifferenceElement) {
    staffDifferenceElement.innerHTML += reportText;
  }
}

async function analyzeWorkingTime() {
  const timeTable = document.querySelector(CONSTANTS.SELECTORS.TIME_TABLE);

  if (!timeTable) {
    console.log(getText("TABLE_NOT_FOUND"));
    return;
  }

  const rawData = parseWorkingTimeData(timeTable);
  const { requiredAdjustments, actualAdjustments } = await loadAdjustments();

  const adjustments = {
    requiredAdjustment: calculateTotalAdjustment(requiredAdjustments),
    actualAdjustment: calculateTotalAdjustment(actualAdjustments),
  };

  const stats = calculateWorkStatistics(rawData, adjustments);
  renderWorkReport(stats);
}

analyzeWorkingTime();
