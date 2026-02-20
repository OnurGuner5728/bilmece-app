# Bilmece Dunyasi - Dagitim Rehberi

Bu belge, Bilmece Dunyasi uygulamasini test cihazlarina ve uygulama magazalarina (Google Play / App Store) dagitmak icin gereken adimlari aciklar.

---

## Onkosuullar

- **Node.js** v18 veya uzeri yuklu olmali
- **Expo hesabi**: [expo.dev](https://expo.dev) uzerinden ucretsiz hesap olusturun
- **EAS CLI**: Asagidaki komutla yukleyin:

```bash
npm install -g eas-cli
```

- **Google Play Console hesabi** (Android icin) - tek seferlik 25$ ucret
- **Apple Developer hesabi** (iOS icin) - yillik 99$ ucret

---

## 1. AdMob Hesabi Kurma

AdMob reklam geliri icin zorunlu adimlari asagida bulabilirsiniz:

### 1.1 Hesap Olusturma
1. [admob.google.com](https://admob.google.com) adresine gidin
2. Google hesabinizla giris yapin veya yeni hesap olusturun
3. Odeme bilgilerinizi girin (reklam geliri icin zorunlu)

### 1.2 Android Uygulamasini Ekleme
1. Sol menuden **Uygulamalar > Uygulama Ekle** secin
2. Platform: **Android** secin
3. "Uygulamaniz bir uygulama magazasinda yayinlandi mi?": **Hayir** secin (ilk seferde)
4. Uygulama adi: `Bilmece Dunyasi` girin
5. **Uygulama ID'si** (App ID) olusturulacak (ornek: `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`)
6. Bu ID'yi kopyalayin ve `app.json` dosyasinda su alana yapisitirin:
   ```json
   ["react-native-google-mobile-ads", {
     "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY",
     ...
   }]
   ```

### 1.3 iOS Uygulamasini Ekleme
1. Ayni adimlari tekrarlayin, platform olarak **iOS** secin
2. Uygulama adi: `Bilmece Dunyasi` girin
3. Olusturulan iOS App ID'sini kopyalayin ve `app.json` dosyasinda su alana yapisitirin:
   ```json
   ["react-native-google-mobile-ads", {
     ...
     "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ"
   }]
   ```

### 1.4 Reklam Birimi Olusturma
1. Eklediginiz uygulamaya tiklayin
2. **Reklam birimleri > Reklam birimi olustur** secin
3. Reklam turu: **Banner** secin
4. Reklam birimi adini girin (ornek: `bilmece-banner`)
5. Olusturulan reklam birimi ID'sini kopyalayin (ornek: `ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY`)
6. Bu ID'yi `src/components/AdBanner.tsx` dosyasindaki ilgili alana yapisitirin
7. Ayni islemi iOS icin de tekrarlayin

### 1.5 COPPA Ayarlari (Cocuklara Yonelik)
- AdMob panelinde uygulamayi **cocuklara yonelik** olarak isaretleyin
- Reklamlarda kisisellestirilmis hedefleme kullanilamaz
- Uygulama kodunda `requestNonPersonalizedAdsOnly: true` ayari zaten aktiftir

> **Not**: `app.json` dosyasinda su anda AdMob **test ID'leri** kullanilmaktadir (`ca-app-pub-3940256099942544~...`). Magazaya gondermeden once bunlari kendi gercek ID'lerinizle degistirmeniz **zorunludur**.

---

## 2. EAS Kurulumu

```bash
# EAS CLI'yi yukleyin (henuz yuklemediyseniz)
npm install -g eas-cli

# Expo hesabiniza giris yapin
eas login

# Projeyi EAS ile iliskilendirin (proje ID'si olusturur)
eas init
```

`eas init` komutu calistiktan sonra, `app.json` icindeki `extra.eas.projectId` degeri otomatik olarak guncellenecektir.

---

## 3. Yer Tutucu Degerlerin Degistirilmesi

### app.json

| Alan | Mevcut Deger | Aciklama |
|------|-------------|----------|
| `extra.eas.projectId` | `"4c4cf7c8-..."` | `eas init` komutu ile otomatik dolar |
| `plugins > react-native-google-mobile-ads > androidAppId` | Test ID | AdMob Android uygulama ID'niz |
| `plugins > react-native-google-mobile-ads > iosAppId` | Test ID | AdMob iOS uygulama ID'niz |

### eas.json

`submit.production` bolumundeki degerleri guncelleyin:

| Alan | Mevcut Deger | Aciklama |
|------|-------------|----------|
| `android.serviceAccountKeyPath` | `"./google-services.json"` | Google Play Console servis hesabi anahtar dosyasi |
| `ios.appleId` | `"your-apple-id@email.com"` | Apple ID e-posta adresiniz |
| `ios.ascAppId` | `"your-asc-app-id"` | App Store Connect uygulama ID'si |
| `ios.appleTeamId` | `"your-team-id"` | Apple Developer takim ID'niz |

---

## 4. EAS Build & Submit Adimlari

### 4.1 Ilk Kez Yapilacaklar

```bash
# EAS CLI yukle
npm install -g eas-cli

# Giris yap
eas login

# Imzalama anahtarlarini olustur/yonet
# Android: Keystore otomatik olusturulur (EAS tarafindan yonetilir)
# iOS: Apple Developer hesap bilgileri istenir
eas credentials
```

### 4.2 Google Play Store

#### Uygulama Olusturma
1. [play.google.com/console](https://play.google.com/console) adresine gidin
2. **Uygulama olustur** butonuna tiklayin
3. Uygulama adi: `Bilmece Dunyasi`
4. Dil: Turkce
5. Uygulama veya oyun: **Uygulama**
6. Ucretsiz veya ucretli: **Ucretsiz**
7. Beyanlari onaylayin ve olusturun

#### Servis Hesabi Anahtari Olusturma
1. Play Console > **Ayarlar > API erisimi** bolumune gidin
2. **Yeni servis hesabi olustur** secin (Google Cloud Console'a yonlendirilirsiniz)
3. JSON anahtar dosyasini indirin
4. Dosyayi projenin kokune `google-services.json` olarak kaydedin
5. **google-services.json dosyasini .gitignore'a eklemeyi unutmayin!**

#### Build ve Submit
```bash
# Production build (AAB dosyasi olusturur)
eas build --profile production --platform android

# Build tamamlaninca magazaya gonder
eas submit --platform android
```

### 4.3 Apple App Store

#### Uygulama Olusturma
1. [developer.apple.com](https://developer.apple.com) adresinden Apple Developer Program'a katilin (yillik 99$)
2. [appstoreconnect.apple.com](https://appstoreconnect.apple.com) adresine gidin
3. **Uygulamalarim > +** ile yeni uygulama olusturun
4. Bundle ID: `com.bilmecedunyasi.app`

#### eas.json Bilgilerini Doldurma
`eas.json` dosyasindaki su alanlari gercek degerlerle guncelleyin:
```json
"ios": {
  "appleId": "sizin-apple-id@email.com",
  "ascAppId": "App Store Connect'ten alinan uygulama ID'si",
  "appleTeamId": "developer.apple.com > Membership'ten alinan Team ID"
}
```

#### Build ve Submit
```bash
# Production build (IPA dosyasi olusturur)
eas build --profile production --platform ios

# Build tamamlaninca App Store'a gonder
eas submit --platform ios
```

---

## 5. Test Icin Derleme (Preview)

### Android (APK dosyasi olusturur)

```bash
eas build --profile preview --platform android
```

veya kisayol:

```bash
npm run build:preview
```

Derleme tamamlandiginda, `.apk` dosyasini indirip Android telefonunuza yukleyebilirsiniz.

### iOS

```bash
eas build --profile preview --platform ios
```

iOS icin cihazlarinizi onceden kaydetmeniz gerekir:

```bash
eas device:create
```

---

## 6. Ekran Goruntuleri Gereksinimleri

Magazalara gonderim icin ekran goruntuleri hazirlayiniz:

### Google Play Store
- **Minimum**: 2 ekran goruntusu
- **Telefon boyutu**: 1080x1920 px veya 1242x2208 px (dikey)
- **Ozellik gorseli** (Feature Graphic): 1024x500 px (zorunlu)
- Format: JPEG veya 24-bit PNG, alfa kanali olmadan
- Maksimum 8 adet ekran goruntusu

### Apple App Store
- **6.7 inc ekran** (iPhone 15 Pro Max): 1290x2796 px (zorunlu)
- **6.5 inc ekran** (iPhone 14 Plus): 1284x2778 px
- **5.5 inc ekran** (iPhone 8 Plus): 1242x2208 px
- **12.9 inc iPad** (iPad Pro): 2048x2732 px (iPad destegi varsa zorunlu)
- Format: JPEG veya PNG
- Her boyut icin minimum 1, maksimum 10 adet

> **Ipucu**: Ekran goruntuleri icin uygulamayi simulatorde veya emulat0rde calistirip ekran goruntusu alin. [screenshots.pro](https://screenshots.pro) veya [mockuphone.com](https://mockuphone.com) gibi araclarla cihaz cerceveli goruntuler olusturabilirsiniz.

---

## 7. Magaza Listesi Icin Gerekenler

Her iki magaza icin asagidaki bilgileri hazirlayiniz:

### Zorunlu
- **Uygulama adi**: Bilmece Dunyasi
- **Kisa aciklama**: Cocuklar icin eglenceli bilmece uygulamasi
- **Uzun aciklama**: Uygulamanin ozelliklerini anlatan detayli metin
- **Gizlilik politikasi URL'si**: Bir gizlilik politikasi sayfasi olusturup URL'sini belirtin (ZORUNLU)
- **Ekran goruntuleri**: Yukaridaki boyutlarda hazirlanmis gorseller
- **Yas siniflandirmasi**: 4+ (iOS) / Everyone (Android)

### Onerilen
- **Ozellik gorseli** (Google Play): 1024x500 piksel
- **Tanitim videosu**: Kisa bir tanitim videosu
- **Tablet ekran goruntuleri** (varsa)

---

## 8. COPPA Uyumlulugu (Cocuklara Yonelik Uygulama)

Bu uygulama cocuklara yonelik oldugundan, asagidaki COPPA gereksinimlerine dikkat edin:

### AdMob Ayarlari
- AdMob panelinde uygulamayi **cocuklara yonelik** olarak isaretleyin
- Reklamlarda kisisellestirilmis hedefleme kullanilamaz
- Uygulama kodunda `requestNonPersonalizedAdsOnly: true` ayari kullanilmaktadir

### iOS Gizlilik
- `app.json` icinde `NSUserTrackingUsageDescription` tanimlanmistir
- App Store Connect'te yas siniflandirmasini **4+** olarak ayarlayin
- Gizlilik bildirimi bolumunde veri toplama durumunuzu dogru sekilde belirtin

### Google Play Console
- Icerik derecelendirmesi anketini doldurun
- **Hedef kitle ve icerik** bolumunde cocuk yas gruplarini secin
- Aile politikasi gereksinimlerini karsilayin

---

## 9. Versiyon Yukseltme

Sonraki surumler icin:

1. `app.json` icindeki `version` degerini guncelle (ornek: `1.0.0` -> `1.1.0`)
2. `eas.json`'da `autoIncrement: true` oldugu icin `versionCode` (Android) ve `buildNumber` (iOS) otomatik artar
3. Build ve submit komutlarini tekrar calistirin

---

## Hizli Baslangic Kontrol Listesi

- [ ] `npm install` ile bagimliliklari yukle
- [ ] `eas login` ile giris yap
- [ ] `eas init` ile proje ID'sini olustur (zaten yapildi)
- [ ] AdMob hesabi olustur ve uygulama ekle
- [ ] AdMob Android App ID'yi al ve `app.json`'a yaz
- [ ] AdMob iOS App ID'yi al ve `app.json`'a yaz
- [ ] Reklam birimi (Banner) olustur ve ID'yi `AdBanner.tsx`'e yaz
- [ ] `eas.json` icindeki Apple bilgilerini guncelle (appleId, ascAppId, appleTeamId)
- [ ] `google-services.json` dosyasini ekle (Android gonderimi icin)
- [ ] `npx tsc --noEmit` ile tip hatalarini kontrol et
- [ ] `eas build --profile preview --platform android` ile test APK'si olustur
- [ ] APK'yi telefona yukle ve test et
- [ ] Gizlilik politikasi sayfasi olustur
- [ ] Magaza icin ekran goruntuleri hazirla (boyutlara dikkat!)
- [ ] `eas build --profile production --platform android` ile Android build
- [ ] `eas submit --platform android` ile Google Play'e gonder
- [ ] `eas build --profile production --platform ios` ile iOS build
- [ ] `eas submit --platform ios` ile App Store'a gonder
