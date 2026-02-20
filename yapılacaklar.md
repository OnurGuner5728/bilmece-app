  Senin Yapman Gereken 5 Adım

  1. AdMob ID'lerini Gir (Zorunlu)

  1. https://admob.google.com → Android + iOS uygulama ekle
  2. app.json → androidAppId ve iosAppId gerçek ID'lerle değiştir
  3. Banner + Interstitial reklam birimi oluştur → Unit ID'leri şuraya yaz:
    - src/components/AdBanner.tsx → TODO satırı
    - app/game.tsx → TODO satırı
    - app/category.tsx → TODO satırı

  2. EAS Credentials (Zorunlu, bir kez)

  npm install -g eas-cli
  eas login
  eas credentials

  3. Google Play'e Yükle

  1. https://play.google.com/console → uygulama oluştur
  2. Privacy policy: https://onurguner5728.github.io/bilmecelerce/privacy-policy.html
  3. assets/screenshots/*.png → 4 ekran görüntüsü yükle
  4. Servis hesabı JSON → eas.json'da serviceAccountKeyPath'e yaz
  eas build --profile production --platform android
  eas submit --platform android

  4. App Store'a Yükle (isteğe bağlı, $99/yıl)

  # eas.json → appleId, ascAppId, appleTeamId doldur
  eas build --profile production --platform ios
  eas submit --platform ios

  5. Store Linkleri Ekle (yayından sonra, 2 dk)

  cd C:/Users/guner/bilmece-site
  # index.html'deki href="#" butonlarını gerçek linklerle güncelle
  git add . && git commit -m "Store links" && git push