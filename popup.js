const STORAGE_KEYS = {
  REQUIRED_ADJUSTMENTS: "requiredAdjustments",
  ACTUAL_ADJUSTMENTS: "actualAdjustments",
};

async function loadAdjustments() {
  try {
    if (!chrome?.storage?.local) {
      return { requiredAdjustments: [], actualAdjustments: [] };
    }

    const result = await chrome.storage.local.get([
      STORAGE_KEYS.REQUIRED_ADJUSTMENTS,
      STORAGE_KEYS.ACTUAL_ADJUSTMENTS,
    ]);

    return {
      requiredAdjustments: result[STORAGE_KEYS.REQUIRED_ADJUSTMENTS] || [],
      actualAdjustments: result[STORAGE_KEYS.ACTUAL_ADJUSTMENTS] || [],
    };
  } catch (error) {
    console.error("Storage error:", error);
    return { requiredAdjustments: [], actualAdjustments: [] };
  }
}

function renderAdjustments(type, adjustments) {
  const container = document.getElementById(`${type}-adjustments`);

  if (adjustments.length === 0) {
    container.innerHTML = '<div class="no-adjustments">Нет корректировок</div>';
    return;
  }

  container.innerHTML = adjustments
    .map(
      (adjustment, index) => `
      <div class="adjustment-item">
        <div class="adjustment-value">${adjustment.value > 0 ? "+" : ""}${adjustment.value}</div>
        <div class="adjustment-comment">${adjustment.comment || "Без комментария"}</div>
        <button class="remove-btn" data-type="${type}" data-index="${index}">×</button>
      </div>
    `
    )
    .join("");

  container.querySelectorAll(".remove-btn").forEach((button) => {
    button.addEventListener("click", async function () {
      const buttonType = this.getAttribute("data-type");
      const buttonIndex = parseInt(this.getAttribute("data-index"));
      await removeAdjustment(buttonType, buttonIndex);
    });
  });
}

async function addAdjustment(type) {
  const valueInput = document.getElementById(`new-${type}-value`);
  const commentInput = document.getElementById(`new-${type}-comment`);

  const value = parseFloat(valueInput.value);
  const comment = commentInput.value.trim();

  if (isNaN(value)) {
    alert("Введите корректное число");
    return;
  }

  try {
    const storageKey =
      type === "required"
        ? STORAGE_KEYS.REQUIRED_ADJUSTMENTS
        : STORAGE_KEYS.ACTUAL_ADJUSTMENTS;
    const result = await chrome.storage.local.get([storageKey]);
    const adjustments = result[storageKey] || [];

    adjustments.push({
      value: value,
      comment: comment,
      timestamp: Date.now(),
    });

    await chrome.storage.local.set({ [storageKey]: adjustments });

    valueInput.value = "";
    commentInput.value = "";
    await refreshUI();
  } catch (error) {
    alert("Ошибка при сохранении: " + error.message);
  }
}

async function removeAdjustment(type, index) {
  try {
    const storageKey =
      type === "required"
        ? STORAGE_KEYS.REQUIRED_ADJUSTMENTS
        : STORAGE_KEYS.ACTUAL_ADJUSTMENTS;
    const result = await chrome.storage.local.get([storageKey]);
    const adjustments = result[storageKey] || [];

    adjustments.splice(index, 1);
    await chrome.storage.local.set({ [storageKey]: adjustments });
    await refreshUI();
  } catch (error) {
    alert("Ошибка при удалении: " + error.message);
  }
}

async function refreshUI() {
  const { requiredAdjustments, actualAdjustments } = await loadAdjustments();
  renderAdjustments("required", requiredAdjustments);
  renderAdjustments("actual", actualAdjustments);
}

document.addEventListener("DOMContentLoaded", async function () {
  await refreshUI();

  document.querySelectorAll(".add-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const type = this.getAttribute("data-type");
      addAdjustment(type);
    });
  });
});
