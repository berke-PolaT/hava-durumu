# ⛅ Hava Durumu Uygulaması

Şehir adıyla arama yapıp anlık hava durumunu, 24 saatlik ve 7 günlük tahmini gösteren bir web uygulaması. Saf **HTML, CSS ve JavaScript** ile, hiçbir kütüphane kullanılmadan yazıldı.

### 🔗 [Canlı Demo](https://berke-polat.github.io/hava-durumu/)

## ✨ Özellikler

- 🔎 **Şehir arama**: Aynı isimde birden fazla yer varsa seçim listesi gösterir
- 📍 **Konumumu kullan**: Tarayıcının konum özelliğiyle bulunduğun yerin hava durumu
- 🌡️ **Anlık durum**: Sıcaklık, hissedilen sıcaklık, nem, rüzgâr, gün doğumu ve batımı, yağış ihtimali
- 🕐 **24 saatlik tahmin**: Yatay kaydırılabilir saatlik görünüm
- 📅 **7 günlük tahmin**: Günlük en yüksek ve en düşük sıcaklık, yağış ihtimali
- 🌙 **Dinamik tema**: Gece, gündüz ve yağmurlu havaya göre değişen arka plan
- 💾 **Son konumu hatırlama**: `localStorage` ile sayfa yeniden açıldığında son bakılan şehir yüklenir
- 📱 **Mobil uyumlu** tasarım
- 🔑 **API anahtarı gerektirmez**

## 🛠️ Kullanılan Teknolojiler

| Teknoloji | Kullanım |
|---|---|
| HTML5 | Anlamsal (semantic) sayfa yapısı |
| CSS3 | Flexbox, Grid, CSS değişkenleri, `backdrop-filter`, animasyonlar, media query |
| JavaScript (ES2020+) | `fetch`, `async/await`, DOM işlemleri, `Intl.DateTimeFormat` |
| [Open-Meteo API](https://open-meteo.com/) | Hava durumu ve şehir arama (geocoding) verileri |

## 🚀 Yerelde Çalıştırma

Herhangi bir kurulum gerekmez. Projeyi indirip bir yerel sunucuyla açman yeterli:

```bash
git clone https://github.com/berke-PolaT/hava-durumu.git
cd hava-durumu
python -m http.server 8000
```

Ardından tarayıcıda `http://localhost:8000` adresini aç.

## 🏗️ Proje Yapısı

```
hava-durumu/
├── index.html   # Sayfa iskeleti
├── style.css    # Tasarım ve tema
└── app.js       # API istekleri ve arayüz güncellemeleri
```

## ⚙️ Nasıl Çalışıyor?

1. Kullanıcının yazdığı şehir adı **Geocoding API**'ye gönderilir ve enlem/boylam bilgisi alınır.
2. Bu koordinatlarla **Forecast API**'den anlık, saatlik ve günlük veriler tek istekte çekilir.
3. API'nin döndürdüğü [WMO hava durumu kodları](https://open-meteo.com/en/docs) Türkçe açıklamalara ve emojilere çevrilir.
4. Arayüz, `innerHTML` yerine güvenli DOM metotlarıyla (`textContent`, `createElement`) oluşturulur.
5. Art arda hızlı aramalarda eski cevabın yenisini ezmemesi için her isteğe bir numara verilir.

## 📚 Bu Projede Öğrendiklerim

- REST API'lerle çalışma ve JSON verisini işleme
- `async/await` ile asenkron programlama ve hata yönetimi
- DOM manipülasyonu ve olay dinleyicileri (event listeners)
- XSS'e karşı güvenli DOM oluşturma
- Responsive tasarım ve CSS Grid/Flexbox
- `localStorage` ve Geolocation API kullanımı
- GitHub Pages ile yayınlama

## 📄 Lisans

[MIT](LICENSE)

Hava durumu verileri [Open-Meteo](https://open-meteo.com/) tarafından [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) lisansıyla sağlanmaktadır.
