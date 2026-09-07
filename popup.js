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
        else if (key === "haas") label.textContent = val + " ms";
        else if (["bass", "mid", "treble", "clarity", "presence"].includes(key)) label.textContent = val + " dB";
        else label.textContent = Math.round(val) + "%";
      }

      sendState(key, val);
    });
  });

  // Mode Buttons
  document.querySelectorAll(".mode").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
      const mode = btn.dataset.mode;
      const isActive = btn.classList.contains("active");
      const val = isActive ? 100 : 0;
      
      const slider = document.getElementById(mode);
      if (slider) {
        slider.value = val;
        slider.dispatchEvent(new Event("input"));
      } else {
        sendState(mode, val);
      }
    });
  });

  // Switch Control
  const autoPan = document.getElementById("autoPan");
  if (autoPan) {
    autoPan.addEventListener("click", () => {
      autoPan.classList.toggle("on");
      sendState("autoPan", autoPan.classList.contains("on"));
    });
  }
});
