# Son Işık — 3D Android Game

Son Işık, tamamen çevrimdışı çalışan, yatay ekran odaklı bir 3D aksiyon/keşif oyunudur. Expo GL üzerinden doğrudan OpenGL ES/WebGL komutları kullanır; çalışma anında harici 3D model paketi veya internet servisi gerektirmez.

## Oynanış
- Beş yüzen adayı sırayla keşfet.
- Adadaki tüm ışık parçalarını topla.
- Gölge yaratıklarından kaç veya `DARBE` yeteneğiyle yakındaki gölgeleri geri itip sersemlet.
- Işıklar tamamlanınca aktif olan fenere ulaş ve adayı yeniden yak.
- Açılan bölümler ve yıldızlar cihazda saklanır.

## Kontroller
- Sol D-pad: hareket.
- Sağ `DARBE`: 35 enerji harcar, yakındaki düşmanları iter ve kısa süre sersemletir.
- Enerji zamanla otomatik yenilenir.

## Android
`.github/workflows/build-son-isik-apk.yml` workflow'u release APK üretir ve `Son-Isik-3D-APK` artifact'ı olarak yayınlar.
