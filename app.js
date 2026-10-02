"use strict";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const TAHMIN_URL = "https://api.open-meteo.com/v1/forecast";
const SON_KONUM_ANAHTARI = "hava-durumu:son-konum";

const VARSAYILAN_KONUM = {
  ad: "İstanbul",
  bolge: "İstanbul",
  ulke: "Türkiye",
  lat: 41.01384,
  lon: 28.94966,
};

// WMO hava durumu kodları: [açıklama, gündüz ikonu, gece ikonu (isteğe bağlı)]
const HAVA_KODLARI = {
  0: ["Açık", "☀️", "🌙"],
  1: ["Çoğunlukla açık", "🌤️", "🌙"],
  2: ["Parçalı bulutlu", "⛅", "☁️"],
  3: ["Kapalı", "☁️"],
  45: ["Sisli", "🌫️"],
  48: ["Kırağılı sis", "🌫️"],
  51: ["Hafif çisenti", "🌦️"],
  53: ["Çisenti", "🌦️"],
  55: ["Yoğun çisenti", "🌧️"],
  56: ["Dondurucu çisenti", "🌧️"],
  57: ["Yoğun dondurucu çisenti", "🌧️"],
  61: ["Hafif yağmur", "🌦️"],
  63: ["Yağmur", "🌧️"],
  65: ["Şiddetli yağmur", "🌧️"],
  66: ["Dondurucu yağmur", "🌧️"],
  67: ["Şiddetli dondurucu yağmur", "🌧️"],
  71: ["Hafif kar", "🌨️"],
  73: ["Kar", "❄️"],
  75: ["Yoğun kar", "❄️"],
  77: ["Kar taneleri", "🌨️"],
  80: ["Hafif sağanak", "🌦️"],
  81: ["Sağanak", "🌧️"],
  82: ["Şiddetli sağanak", "⛈️"],
  85: ["Kar sağanağı", "🌨️"],
  86: ["Yoğun kar sağanağı", "❄️"],
  95: ["Gök gürültülü fırtına", "⛈️"],
  96: ["Dolulu fırtına", "⛈️"],
  99: ["Şiddetli dolulu fırtına", "⛈️"],
};

const $ = (id) => document.getElementById(id);

const ogeler = {
  form: $("arama-formu"),
  girdi: $("sehir-girdisi"),
  konumButonu: $("konum-butonu"),
  oneriler: $("oneriler"),
  durum: $("durum-mesaji"),
  icerik: $("hava-icerik"),
};

// Hızlı art arda aramalarda eski cevabın yenisinin üzerine yazmasını önler
let sonIstekNo = 0;

function havaBilgisi(kod, gunduzMu = true) {
  const [aciklama, gunduzIkonu, geceIkonu] = HAVA_KODLARI[kod] ?? ["Bilinmiyor", "❔"];
  return { aciklama, ikon: !gunduzMu && geceIkonu ? geceIkonu : gunduzIkonu };
}

function durumGoster(mesaj, hataMi = false) {
  ogeler.durum.textContent = mesaj;
  ogeler.durum.classList.toggle("hata", hataMi);
}

async function jsonGetir(url) {
  const cevap = await fetch(url);
  if (!cevap.ok) {
    throw new Error(`Sunucu hatası (${cevap.status})`);
  }
  return cevap.json();
}

async function sehirAra(ad) {
  const parametreler = new URLSearchParams({ name: ad, count: 5, language: "tr", format: "json" });
  const veri = await jsonGetir(`${GEOCODING_URL}?${parametreler}`);
  return (veri.results ?? []).map((s) => ({
    ad: s.name,
    bolge: s.admin1 ?? "",
    ulke: s.country ?? "",
    lat: s.latitude,
    lon: s.longitude,
  }));
}

async function tahminGetir(lat, lon) {
  const parametreler = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m",
    hourly: "temperature_2m,weather_code,is_day,precipitation_probability",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
    timezone: "auto",
    forecast_days: 7,
  });
  return jsonGetir(`${TAHMIN_URL}?${parametreler}`);
}

function konumEtiketi(konum) {
  return [konum.ad, konum.bolge !== konum.ad ? konum.bolge : "", konum.ulke]
    .filter(Boolean)
    .join(", ");
}

async function konumuGoster(konum) {
  const istekNo = ++sonIstekNo;
  onerileriGizle();
  durumGoster("Hava durumu yükleniyor...");

  try {
    const veri = await tahminGetir(konum.lat, konum.lon);
    if (istekNo !== sonIstekNo) return;

    ciz(konum, veri);
    durumGoster("");
    try {
      localStorage.setItem(SON_KONUM_ANAHTARI, JSON.stringify(konum));
    } catch {
      // Tarayıcı depolamaya izin vermiyorsa sorun değil
    }
  } catch (hata) {
    if (istekNo !== sonIstekNo) return;
    durumGoster(`Hava durumu alınamadı: ${hata.message}`, true);
  }
}

// API saatleri konumun yerel saatiyle gelir ("2026-10-02T17:00"); saat kısmını doğrudan alırız
const saatKismi = (zaman) => zaman.slice(11, 16);

function ciz(konum, veri) {
  const g = veri.current;
  const bugun = veri.daily;
  const { aciklama, ikon } = havaBilgisi(g.weather_code, g.is_day === 1);

  $("sehir-adi").textContent = konumEtiketi(konum);
  $("tarih").textContent = new Intl.DateTimeFormat("tr-TR", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  }).format(new Date(g.time));
  $("hava-ikonu").textContent = ikon;
  $("sicaklik").textContent = `${Math.round(g.temperature_2m)}°`;
  $("hava-aciklama").textContent = aciklama;
  $("hissedilen").textContent = `${Math.round(g.apparent_temperature)}°C`;
  $("nem").textContent = `%${g.relative_humidity_2m}`;
  $("ruzgar").textContent = `${Math.round(g.wind_speed_10m)} km/s`;
  $("gun-dogumu").textContent = saatKismi(bugun.sunrise[0]);
  $("gun-batimi").textContent = saatKismi(bugun.sunset[0]);
  $("yagis").textContent = `%${bugun.precipitation_probability_max[0] ?? 0}`;

  document.body.classList.toggle("gece", g.is_day === 0);
  document.body.classList.toggle("yagmurlu", g.weather_code >= 51);

  saatlikCiz(veri);
  gunlukCiz(veri);
  ogeler.icerik.hidden = false;
}

function saatlikCiz(veri) {
  const s = veri.hourly;
  const simdikiSaat = `${veri.current.time.slice(0, 13)}:00`;
  const baslangic = Math.max(0, s.time.findIndex((zaman) => zaman >= simdikiSaat));
  const kutu = $("saatlik");
  kutu.replaceChildren();

  for (let i = baslangic; i < Math.min(baslangic + 24, s.time.length); i++) {
    const { ikon, aciklama } = havaBilgisi(s.weather_code[i], s.is_day[i] === 1);
    const saat = document.createElement("div");
    saat.className = "saat";
    saat.title = aciklama;
    saat.append(
      metinOgesi("span", i === baslangic ? "Şimdi" : saatKismi(s.time[i]), "soluk"),
      metinOgesi("span", ikon, "ikon"),
      metinOgesi("strong", `${Math.round(s.temperature_2m[i])}°`),
    );
    kutu.append(saat);
  }
}

function gunlukCiz(veri) {
  const d = veri.daily;
  const gunAdi = new Intl.DateTimeFormat("tr-TR", { weekday: "long" });
  const liste = $("gunluk");
  liste.replaceChildren();

  d.time.forEach((tarih, i) => {
    const { ikon, aciklama } = havaBilgisi(d.weather_code[i]);
    const satir = document.createElement("li");
    satir.className = "gun";
    satir.title = aciklama;

    const minMax = metinOgesi("span", `${Math.round(d.temperature_2m_max[i])}°`, "min-max");
    minMax.append(metinOgesi("span", `${Math.round(d.temperature_2m_min[i])}°`, "min"));

    satir.append(
      metinOgesi("span", i === 0 ? "Bugün" : gunAdi.format(new Date(`${tarih}T12:00`))),
      metinOgesi("span", ikon, "ikon"),
      metinOgesi("span", `☔ %${d.precipitation_probability_max[i] ?? 0}`, "yagis-orani"),
      minMax,
    );
    liste.append(satir);
  });
}

function metinOgesi(etiket, metin, sinif) {
  const oge = document.createElement(etiket);
  oge.textContent = metin;
  if (sinif) oge.className = sinif;
  return oge;
}

function onerileriGoster(sehirler) {
  ogeler.oneriler.replaceChildren(
    ...sehirler.map((sehir) => {
      const buton = document.createElement("button");
      buton.type = "button";
      buton.append(sehir.ad + " ", metinOgesi("small", [sehir.bolge, sehir.ulke].filter(Boolean).join(", ")));
      buton.addEventListener("click", () => {
        ogeler.girdi.value = sehir.ad;
        konumuGoster(sehir);
      });
      const li = document.createElement("li");
      li.append(buton);
      return li;
    }),
  );
  ogeler.oneriler.hidden = false;
  ogeler.oneriler.querySelector("button")?.focus();
}

function onerileriGizle() {
  ogeler.oneriler.hidden = true;
}

ogeler.form.addEventListener("submit", async (olay) => {
  olay.preventDefault();
  const aranan = ogeler.girdi.value.trim();
  if (!aranan) return;

  durumGoster("Şehir aranıyor...");
  try {
    const sehirler = await sehirAra(aranan);
    if (sehirler.length === 0) {
      durumGoster(`"${aranan}" adında bir yer bulunamadı.`, true);
    } else if (sehirler.length === 1) {
      konumuGoster(sehirler[0]);
    } else {
      durumGoster("Birden fazla sonuç bulundu, birini seç:");
      onerileriGoster(sehirler);
    }
  } catch (hata) {
    durumGoster(`Arama yapılamadı: ${hata.message}`, true);
  }
});

ogeler.konumButonu.addEventListener("click", () => {
  if (!("geolocation" in navigator)) {
    durumGoster("Tarayıcın konum özelliğini desteklemiyor.", true);
    return;
  }
  durumGoster("Konumun alınıyor...");
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => konumuGoster({
      ad: "Bulunduğun konum",
      bolge: "",
      ulke: "",
      lat: coords.latitude,
      lon: coords.longitude,
    }),
    () => durumGoster("Konum izni verilmedi veya konum alınamadı.", true),
  );
});

document.addEventListener("keydown", (olay) => {
  if (olay.key === "Escape") onerileriGizle();
});

document.addEventListener("click", (olay) => {
  if (!ogeler.oneriler.contains(olay.target) && olay.target !== ogeler.girdi) {
    onerileriGizle();
  }
});

function sonKonumuOku() {
  try {
    const kayit = localStorage.getItem(SON_KONUM_ANAHTARI);
    return kayit ? JSON.parse(kayit) : null;
  } catch {
    return null;
  }
}

konumuGoster(sonKonumuOku() ?? VARSAYILAN_KONUM);
