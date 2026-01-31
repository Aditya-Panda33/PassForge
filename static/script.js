/* =========================
   Navigation
========================= */
function showPage(id) {
  document.querySelectorAll(".page").forEach(p =>
    p.classList.remove("active")
  );
  document.getElementById(id)?.classList.add("active");
}

/* =========================
   Glitch Effect
========================= */
function glitchText(el) {
  const text = el.innerText;
  let i = 0;
  const interval = setInterval(() => {
    el.innerText =
      text.substring(0, i) +
      String.fromCharCode(33 + Math.random() * 94);
    i++;
    if (i > text.length) {
      el.innerText = text;
      clearInterval(interval);
    }
  }, 40);
}

document.querySelectorAll(".glitch").forEach(h =>
  h.addEventListener("mouseenter", () => glitchText(h))
);

/* =========================
   Analyzer (ML Based)
========================= */
const pwd = document.getElementById("password");
const meter = document.getElementById("meter-bar");
const strengthText = document.getElementById("strength-text");
const crackTime = document.getElementById("crack-time");
const exposure = document.getElementById("exposure-warning");

const rules = {
  length: document.getElementById("rule-length"),
  upper: document.getElementById("rule-upper"),
  number: document.getElementById("rule-number"),
  special: document.getElementById("rule-special")
};

const leaked = ["password", "123", "admin", "qwerty"];

pwd?.addEventListener("input", async () => {
  const p = pwd.value;
  if (p.length === 0) return;

  /* UI rule hints (still useful for users) */
  rules.length.style.opacity = p.length >= 8 ? 1 : 0.4;
  rules.upper.style.opacity = /[A-Z]/.test(p) ? 1 : 0.4;
  rules.number.style.opacity = /\d/.test(p) ? 1 : 0.4;
  rules.special.style.opacity = /[^A-Za-z0-9]/.test(p) ? 1 : 0.4;

  if (leaked.some(x => p.toLowerCase().includes(x))) {
    exposure.textContent = "⚠ Pattern found in leaked passwords";
  } else {
    exposure.textContent = "";
  }

  /* Call ML backend */
  try {
    const res = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: p })
    });

    const data = await res.json();
    const score = data.strength; // 0 or 1

    if (score === 0) {
      meter.style.width = "30%";
      meter.style.background = "red";
      strengthText.textContent = "Weak Password";
      crackTime.textContent = "Cracked in seconds";
    } else {
      meter.style.width = "100%";
      meter.style.background = "lime";
      strengthText.textContent = "Strong Password";
      crackTime.textContent = "Years to crack";
    }

  } catch (err) {
    console.error("Server error:", err);
    strengthText.textContent = "Server not responding";
  }
});

/* =========================
   Toggle password
========================= */
function togglePwd() {
  pwd.type = pwd.type === "password" ? "text" : "password";
}

/* =========================
   Generator
========================= */
const slider = document.getElementById("length");
const lenValue = document.getElementById("lenValue");

slider.oninput = () => lenValue.textContent = slider.value;

function generatePassword() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  let pass = "";

  for (let i = 0; i < slider.value; i++)
    pass += chars[Math.floor(Math.random() * chars.length)];

  document.getElementById("generated-password").textContent = pass;

  /* auto test generated password */
  pwd.value = pass;
  pwd.dispatchEvent(new Event("input"));
}

function copyPassword() {
  const p = document.getElementById("generated-password").textContent;
  if (!p) return alert("Generate first!");
  navigator.clipboard.writeText(p);
  alert("Password Copied");
}
