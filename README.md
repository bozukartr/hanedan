# HANEDAN

30 Eylül 1520 sabahı Topkapı Sarayı’nda Sultan Süleyman’ı yönet. Divan Meydanı, Kubbealtı, Matbah-ı Âmire ve Hasbahçe birbirine yürünebilir geçitlerle bağlıdır. Saray düzeni ve kişilerin günlük işleri oyun için yorumlanmıştır.

## Yerelde oyna

Proje kökünde `python3 -m http.server 8080 --directory dist` çalıştır, ardından tarayıcıda `http://localhost:8080` aç. Python 3 yeterlidir. Oyun ES modüllerini HTTP üzerinden yükler. Paket kurulumu gerekmez.

## Kontroller

| Girdi | İşlev |
| --- | --- |
| WASD veya yön tuşları | Hareket |
| Shift + hareket | Koş |
| Tıkla veya dokun | Zemine yürü, görevliye yaklaş, geçide git |
| E | Yakındaki görevliyle konuş veya kapıdan geç |
| F | Ferman ver |
| M | Saray planını aç |
| J | Vekayinâmeyi aç |
| Boşluk | Duraklat veya sürdür |
| Esc | Pencereyi kapat veya oyunu duraklat |

Saray görevlilerini maiyetine alabilir, görevlerine gönderebilir ve ihsanda bulunabilirsin. Fermanlar görevlilerin rotalarını, sarayın görünümünü veya hazineyi değiştirir. Görevliler geçitleri kullanarak yürür. Akşam meydan görevlileri Kubbealtı’na çekilir. Hazineye gece yarısında tahsisat gelir. İlerleme aynı tarayıcıda ve aynı site adresinde otomatik kaydedilir.

## Kaynak düzeni

| Dosya | Sorumluluk |
| --- | --- |
| dist/src/data.js | Bölgeler, geçitler, engeller, günlük rotalar ve ferman tanımları |
| dist/src/navigation.js | Yürüme alanları, engelleri dolaşan rota araması ve hareket |
| dist/src/simulation.js | Dünya saati, emirler, maiyet, NPC davranışı, kayıt ve olaylar |
| dist/src/art.js | Canvas 2D mimari, bitki, su, kıyafet ve portre çizim komutları |
| dist/src/render.js | Bölge çizimi, önbellek, derinlik sırası, ışık ve animasyon |
| dist/src/main.js | Giriş, oyun döngüsü, defterler, ses ve kullanıcı arayüzü |
| test/palace.test.js | Başsız simülasyon ve rota testleri |

Saray, karakterler, portreler ve harita kodla çizilir. Oyun harici resim, yazı tipi veya ağ servisi yüklemez.

## Sistemi genişletme

Bir modülü `game.register(ad, { tick, event })` ile simülasyona bağla. `tick(dt, game)` dünya çalışırken geçen saniyeyi alır. `event(tür, veri, game)` ferman ve kayıt olaylarını dinler. Örneğin yeni bir ekonomi modülü, `decree` olayında emir kimliğini okuyup iaşe talebi oluşturabilir. Yeni durum alanlarını `fresh()` içine ekle ve `restore()` içinde önceki kayıtlar için varsayılan değer tanımla. Kullanıcıya gösterilecek olayları `game.log(metin)` ile vekayinâmeye ekle.

Ekonomi, diplomasi, savaş, hanedan ve veraset bu arayüz üzerinden genişletilebilir. Bu prototipte hazine, günlük tahsisat, itibar ve huzur işler. Kapsamlı devlet sistemleri ileriki sürümlerin kapsamındadır.

## Testler

Node.js 20 veya yenisiyle proje kökünde `npm test` çalıştır. Testler geçitleri, çarpışmayı, günlük rotaları, fermanların maliyetini ve NPC hareketini, kayıt yüklemeyi ve sistem olaylarını kontrol eder.
