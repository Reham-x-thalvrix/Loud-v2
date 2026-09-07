document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll("input[type=range]");

  function sendState(key, value) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "THALVRIX_UPDATE", key, value });
      }
    });
  }

  inputs.forEach(input => {
    input.addEventListener("input", (e) => {
      const key = e.target.id;
      const val = Number(e.target.value);
      const label = document.getElementById(`val-${key}`);

      if (label) {
        if (key === "input") label.textContent = val.toFixed(2) + "x";
        else if (key === "output") label.textContent = Math.round(val * 100) + "%";
        else label.textContent = val + " dB";
      }

      sendState(key, val);
    });
  });

  document.querySelectorAll(".mode").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
      const mode = btn.dataset.mode;
      const isActive = btn.classList.contains("active");
      sendState(mode, isActive ? 100 : 0);
    });
  });
});
