# Bilmece App - Uygulama Analiz Dokumani

## 1. Hedef Kitle Analizi

### Birincil Hedef Kitle
- **Yas Araligi:** 4-12 yas arasi cocuklar
- **Segmentler:**
  - **4-6 Yas (Okul Oncesi):** Henuz okuma yazma ogrenmekte olan, gorsel ve sesli iceriklerle etkilesim kuran cocuklar. Bilmeceler kisa, basit ve gorsel destekli olmali.
  - **7-9 Yas (Ilkokul):** Okuma yazma bilen, mantik kurma becerileri gelisen cocuklar. Bilmeceler biraz daha karmasik ve dusundurtucu olabilir.
  - **10-12 Yas (Ortaokul Baslangici):** Soyut dusunme yetenekleri gelisen, geleneksel Turk bilmecelerini anlayabilen cocuklar. Daha zor ve kelime oyunlu bilmeceler uygun.

### Ikincil Hedef Kitle
- **Ebeveynler:** Cocuklariyla birlikte oynayabilecek, egitici icerik arayan anneler ve babalar (25-45 yas)
- **Ogretmenler:** Sinif ici etkinliklerde kullanabilecek okul oncesi ve ilkokul ogretmenleri

### Kullanim Senaryolari
- Evde bos zamanlarda eglence
- Uzun yolculuklarda zaman gecirme
- Okul oncesi/ilkokul egitim destegi
- Aile ici etkilesim ve birlikte oynama

---

## 2. Ekran Akisi (User Flow)

```
[Splash Screen]
    |
    v
[Ana Ekran / Home]
    |
    +---> [Yas Grubu Secimi] ---> [Zorluk Secimi] ---> [Bilmece Ekrani]
    |                                                        |
    |                                                        +---> [Dogru Cevap Kutlamasi]
    |                                                        +---> [Yanlis Cevap / Tekrar Dene]
    |                                                        +---> [Ipucu Goster]
    |
    +---> [Kategori Secimi] ---> [Bilmece Listesi] ---> [Bilmece Ekrani]
    |
    +---> [Profilim / Istatistikler]
    |       +---> [Rozetlerim]
    |       +---> [Seviye Bilgisi]
    |       +---> [Istatistikler]
    |
    +---> [Gunun Bilmecesi]
    |
    +---> [Ayarlar]
            +---> [Ses Ayarlari]
            +---> [Bildirim Ayarlari]
            +---> [Ebeveyn Kontrol Paneli]
```

---

## 3. Ekran Detaylari

### 3.1 Splash Screen
- Uygulama logosu ve animasyonlu giris
- Yukleme suresi: maksimum 2-3 saniye
- Eglenceli bir bilmece karakteri (maskot) animasyonu

### 3.2 Ana Ekran (Home)
- **Icerik:**
  - Renkli ve buyuk butonlar ile yas grubu secimi (4-6, 7-9, 10-12)
  - "Gunun Bilmecesi" karti (her gun degisen ozel bilmece)
  - Kullanicinin seviyesi ve puan gostergesi (ust bar)
  - Kategori secim alani (hayvanlar, doga, yiyecek vb.)
  - Son oynanan bilmecelere hizli erisim
- **Tasarim:** Canli renkler, buyuk fontlar, cocuk dostu illustrasyonlar

### 3.3 Yas Grubu Secimi
- Uc buyuk, renkli kart:
  - 4-6 Yas: Bebek/okul oncesi gorseli
  - 7-9 Yas: Ilkokul ogrenci gorseli
  - 10-12 Yas: Buyuk cocuk gorseli
- Her kart farkli renk temasinda

### 3.4 Zorluk Secimi
- Yildiz sistemiyle gosterim:
  - Kolay (1 yildiz - Yesil)
  - Orta (2 yildiz - Turuncu)
  - Zor (3 yildiz - Kirmizi)
- Her seviyede kac bilmece oldugu gosterilir
- Kilitli/acik bilmece sayisi

### 3.5 Bilmece Ekrani (Ana Oyun Ekrani)
- **Icerik:**
  - Bilmece metni (buyuk, okunak font)
  - Bilmeceyle ilgili illustrasyon/animasyon
  - "Ipucu" butonu (sinirsiz degil, puan karsiliginda)
  - Cevap girisi alani (metin girisi veya coktan secmeli)
  - 4-6 yas icin: 3-4 secenekli gorsel cevap (emoji/resim)
  - 7-9 yas icin: 4 secenekli metin cevap
  - 10-12 yas icin: Serbest metin girisi + ipucu sistemi
  - Sure sayaci (opsiyonel, zorluk seviyesine gore)
  - "Pas Gec" butonu
  - Ilerleme cubugu (kac bilmece kaldi)
- **Animasyonlar:** Soru gelirken kayma efekti, ipucu acilirken parlama

### 3.6 Dogru Cevap Kutlama Ekrani
- Konfeti animasyonu
- Cevap emojisi ve gorseli buyuk gosterim
- Kazanilan puan gosterimi (+10, +20, +30 zorluga gore)
- "Sonraki Bilmece" butonu
- Eglenceli ses efektleri

### 3.7 Yanlis Cevap Ekrani
- Yumusak bir "tekrar dene" mesaji (cocuklari kirmadan)
- Kalan deneme hakki gosterimi
- Ipucu kullanma onerisi
- "Cevabi Goster" secenegi (puan kazanilmaz)

### 3.8 Profil / Istatistikler Ekrani
- Toplam puan ve seviye
- Cozulen bilmece sayisi
- Kazanilan rozetler galerisi
- Kategori bazli basari grafigi
- Gunluk/haftalik/aylik aktivite grafigi

### 3.9 Ayarlar Ekrani
- Ses ve muzik acma/kapama
- Bildirim tercihleri (gunun bilmecesi hatirlatmasi)
- Ebeveyn kontrol paneli (PIN korumalı):
  - Reklam kaldirma satin alma
  - Kullanim suresi sinirlamasi
  - Yas grubu kilitleme

---

## 4. Reklam Stratejisi

### 4.1 Banner Reklamlar
- **Yerlesim:** Ana ekran alt kismi (sabit banner)
- **Boyut:** Adaptive Banner (320x50 veya 320x100)
- **Gosterim Kurallari:**
  - Bilmece cozme ekraninda banner GOSTERILMEZ (cocugun dikkatini dagitmamak icin)
  - Sadece gecis ekranlarinda ve ana ekranda gosterilir
  - 4-6 yas grubunda banner reklam minimumda tutulur

### 4.2 Interstitial Reklamlar
- **Gosterim Zamanlari:**
  - Her 5 bilmecede bir (bilmeceler arasi geciste)
  - Zorluk seviyesi degistirirken
  - Kategori degistirirken
- **Kurallar:**
  - Bir oturumda maksimum 3 interstitial
  - Bilmece cozme aninda ASLA gosterilmez
  - Kutlama animasyonu BITTIKTEN SONRA gosterilir
  - Minimum 60 saniye aralikla gosterilir
  - Kapatma butonu 5 saniye sonra gorunur (Google politikasi geregi)

### 4.3 Odullu Video Reklamlar (Rewarded Ads)
- **Kullanim Alanlari:**
  - Ekstra ipucu kazanmak icin (1 video = 2 ipucu)
  - Ekstra can/deneme hakki icin
  - Ozel rozet acmak icin
  - Gunluk bonus puan kazanmak icin
- **Avantaj:** Kullanici gonullu izler, deneyimi bozmaz

### 4.4 Cocuk Guvenligi (COPPA Uyumlulugu)
- Google AdMob "cocuklara yonelik icerik" etiketi aktif olmali
- Kisisellestirilmis reklam KAPATILMALI
- Reklam icerik filtreleme: sadece cocuk dostu reklamlar
- GDPR ve KVKK uyumlulugu saglanmali

---

## 5. Gamification (Oyunlastirma) Onerileri

### 5.1 Puan Sistemi
| Aksiyon | Puan |
|---------|------|
| Kolay bilmece dogru cevap | +10 puan |
| Orta bilmece dogru cevap | +20 puan |
| Zor bilmece dogru cevap | +30 puan |
| Ipucu kullanmadan dogru cevap | +5 bonus |
| Ilk denemede dogru cevap | +10 bonus |
| Gunun bilmecesini cozme | +15 bonus |
| 5 bilmece ust uste dogru | +25 combo bonus |
| Gunluk giris bonusu | +5 puan |
| 7 gun ust uste giris | +50 bonus |

### 5.2 Seviye Sistemi
| Seviye | Gerekli Puan | Unvan |
|--------|-------------|-------|
| 1 | 0 | Bilmece Meraklisi |
| 2 | 100 | Bilmece Avcisi |
| 3 | 300 | Bilmece Cozucusu |
| 4 | 600 | Bilmece Ustasi |
| 5 | 1000 | Bilmece Kahramani |
| 6 | 1500 | Bilmece Dahisi |
| 7 | 2200 | Bilmece Profesoru |
| 8 | 3000 | Bilmece Efsanesi |
| 9 | 4000 | Bilmece Krali/Kralicesi |
| 10 | 5500 | Bilmece Imparatoru |

### 5.3 Rozet Sistemi
| Rozet | Kosul | Emoji |
|-------|-------|-------|
| Ilk Adim | Ilk bilmeceyi coz | 🎯 |
| Hayvan Dostu | 10 hayvan bilmecesi coz | 🐾 |
| Doga Kasifi | 10 doga bilmecesi coz | 🌿 |
| Gurme | 10 yiyecek bilmecesi coz | 🍽️ |
| Hizli Dusunur | 5 bilmeceyi 10 sn altinda coz | ⚡ |
| Ipucu Yok | 10 bilmeceyi ipucusuz coz | 🧠 |
| Combo Ustasi | 10 bilmece ust uste dogru | 🔥 |
| Gunluk Sampiyonu | 7 gun ust uste oyna | 📅 |
| Kategori Krali | Bir kategorideki tum bilmeceleri coz | 👑 |
| Bilmece Koleksiyoncusu | 50 bilmece coz | 📚 |
| Tum Yildizlar | Tum zor bilmeceleri coz | ⭐ |
| Mevsim Uzman | Tum mevsim bilmecelerini coz | 🍂 |
| Super Beyin | Seviye 10'a ulas | 🏆 |

### 5.4 Streak (Seri) Sistemi
- Gunluk giris serisi takibi
- Ust uste dogru cevap serisi
- Seri kirildığinda motivasyon mesaji
- Seri rekoru gosterimi

### 5.5 Haftalik Yarismalar
- Her hafta ozel bir tema (ornegin: "Hayvanlar Haftasi")
- Haftalik liderlik tablosu
- Ozel rozetler

---

## 6. Monetizasyon Stratejisi

### 6.1 Freemium Model (Ana Strateji)
- **Ucretsiz Versiyon:**
  - Tum yas gruplari ve zorluk seviyeleri erisim
  - Reklam destekli (banner + interstitial)
  - Gunluk 20 bilmece siniri
  - Gunluk 3 ipucu hakki
  - Temel rozetler

- **Premium Versiyon (Tek Seferlik Satin Alma):**
  - Fiyat: 79.99 TL (tek seferlik)
  - Reklamsiz deneyim
  - Sinirsiz bilmece
  - Sinirsiz ipucu
  - Ozel premium rozetler
  - Ozel temalar ve karakterler
  - Yeni bilmece paketlerine erken erisim

### 6.2 Uygulama Ici Satin Almalar (IAP)
| Urun | Fiyat | Icerik |
|------|-------|--------|
| Ipucu Paketi (10) | 14.99 TL | 10 adet ipucu |
| Ipucu Paketi (30) | 34.99 TL | 30 adet ipucu |
| Reklam Kaldirma | 49.99 TL | Kalici reklamsiz deneyim |
| Tema Paketi | 19.99 TL | Ozel gorsel tema |
| Bilmece Paketi | 24.99 TL | 30 yeni bilmece |

### 6.3 Abonelik Modeli (Alternatif)
- **Aylik:** 29.99 TL
- **Yillik:** 179.99 TL (aylik 15 TL)
- **Icerik:**
  - Reklamsiz
  - Her ay 20 yeni bilmece
  - Ozel sezonluk icerikler
  - Premium rozetler
  - Aile hesabi (3 profil)

### 6.4 Gelir Tahmini ve Oncelik Sirasi
1. **Reklam Gelirleri** (Ana gelir kaynagi - %60)
   - Banner + Interstitial + Rewarded Video
   - Tahmini eCPM: $1-3 (Turkiye pazari)
2. **Tek Seferlik Premium** (%25)
   - Ebeveynlerin reklam kaldirmak icin odeme yapma egilimi yuksek
3. **IAP - Ipucu/Tema Paketleri** (%15)
   - Dusuk fiyatli, durtusal satin almalar

### 6.5 Buyume Stratejisi
- **ASO (App Store Optimization):** "bilmece", "cocuk oyunu", "egitici oyun" anahtar kelimeleri
- **Sosyal Medya:** Instagram ve TikTok'ta kisa bilmece videolari
- **Ogretmen Isbirligi:** Okullarda tanitim, egitim platformlarinda yer alma
- **Referans Sistemi:** Arkadas davet et, 5 ipucu kazan
- **Mevsimsel Icerik:** Ramazan bilmeceleri, 23 Nisan ozel bilmeceleri, yaz tatili temalari

---

## 7. Teknik Notlar

### Teknoloji Secimi
- **Framework:** React Native (cross-platform)
- **State Management:** Zustand veya Redux Toolkit
- **Backend:** Firebase (Auth, Firestore, Analytics)
- **Reklam:** Google AdMob (cocuk icerigi uyumlu)
- **Bildirim:** Firebase Cloud Messaging
- **Analytics:** Firebase Analytics + Mixpanel

### Performans Hedefleri
- Uygulama acilis suresi: < 2 saniye
- Ekran gecis suresi: < 300ms
- Uygulama boyutu: < 50MB
- Offline calisabilirlik (bilmeceler yerel olarak saklanir)
- Minimum desteklenen surum: Android 7.0+ / iOS 14+
