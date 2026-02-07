let timings = {};
let nextPrayerTime = null;

async function getPrayerTimes(lat, lon) {
  const res = await fetch(
    `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=4`
  );
  const data = await res.json();
  return data.data;
}

function getNextPrayer(t) {
  const now = new Date();

  for (const [name, time] of Object.entries(t)) {
    if (name === "Sunrise") continue;

    const [h, m] = time.split(":");
    const d = new Date();
    d.setHours(h, m, 0);

    if (d > now) {
      return { name, time, date: d };
    }
  }

  // إذا خلص اليوم
  const fajr = t["Fajr"].split(":");
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(fajr[0], fajr[1], 0);

  return { name: "Fajr", time: t["Fajr"], date: d };
}

function startCountdown() {
  setInterval(() => {
    if (!nextPrayerTime) return;

    const now = new Date();
    const diff = nextPrayerTime - now;

    if (diff <= 0) {
      document.getElementById("countdown").innerText = "دخل الوقت";
      return;
    }

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    document.getElementById("countdown").innerText =
      `${h}س ${m}د ${s}ث`;
  }, 1000);
}

function buildTable(t) {
  let html = "<table>";
  for (const [name, time] of Object.entries(t)) {
    html += `<tr><td>${name}</td><td>${time}</td></tr>`;
  }
  html += "</table>";
  document.getElementById("table").innerHTML = html;
}

async function init() {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    const data = await getPrayerTimes(lat, lon);

    document.getElementById("city").innerText =
      data.meta.timezone;

    timings = data.timings;

    const next = getNextPrayer(timings);

    document.getElementById("nextPrayer").innerText = next.name;
    document.getElementById("nextTime").innerText = next.time;

    nextPrayerTime = next.date;

    buildTable(timings);
    startCountdown();
  });
}

function reload() {
  location.reload();
}

init();