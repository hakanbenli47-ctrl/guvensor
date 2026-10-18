# YKS Akademi 2027

Akdeniz Üniversitesi Psikoloji (EA) hedefi için sıfırdan oluşturulan Next.js 16 + React 19 tabanlı kişisel öğrenme uygulaması.

## Kurulum

```bash
npm install
npm run dev
```

Varsayılan adres: http://localhost:3000

## İçerik ve program

- 14 ders, 196 konu: TYT (Matematik, Geometri, Türkçe, Tarih, Coğrafya, Felsefe, Din, Fizik, Kimya, Biyoloji) ve AYT (Matematik, Edebiyat, Tarih-1, Coğrafya-1).
- Her konu için kısa açıklama, temel kurallar, çözümlü örnek, 12 soruluk konu testi.
- Matematikte sayı varyasyonları üreten algoritmik özgün testler; diğer derslerde bilgi ve tanım ölçen otomatik seçenekli sorular.
- TYT 120 soru, AYT EA 80 soru ve haftalık mini 30 soruluk test modu.
- 19 Ekim 2026 – 20 Haziran 2027 için 35 haftalık, haftada 6 gün × günde 4 adet 45 dakikalık çalışma oturumu.
- Çarşamba/hafta sonu eksik tekrarları; yanıt, süre, doğruluk, konu yeterliği ve net kayıtları.
- Tarayıcıdaki localStorage ile kalıcı ilerleme; JSON dışa aktarma / içe aktarma.
- Mobil uyumlu panel ve PDF olarak yazdırılabilir konu anlatımı.

## İçerik güvenilirliği ve sınırlar

Bu, uygulama içine tek seferde konulmuş **başlangıç düzeyinde kapsamlı konu kataloğu ve çalışan test sistemi**dir. Her konu için en ince ayrıntıyı kapsayan editöryal kitap içeriği, yüzlerce ayrı el yazımı soru veya resmî soru bankası bulunduğu anlamına **gelmez**. Konu açıklamaları özet niteliğindedir; öğretici kaynakla desteklenmelidir. Testler gerçek çıkmış ÖSYM soruları değildir. Sayısal sorularda şablonlara dayalı özgün varyasyonlar üretilir; sözel sorularda örnek soru ve kavramsal tanım eşleştirme kullanılır. Karmaşık geometri şekilleri ve görsel soru desteği bulunmaz. Her bir soru ve cevabın pedagojik editör denetimi yapılmadan resmî sınav eşdeğerliği iddiası taşınmaz.

Uygulama Supabase veya ücretli sunucu hizmetine ihtiyaç duymaz. Veriler sadece kullanılan tarayıcıda kaydedilir; kullanıcı hesabı ve cihazlar arası senkronizasyon **yoktur**. Verileri korumak için Ayarlar menüsünden JSON yedeği alın.

2027 sınav tarihi ve müfredat resmî olarak kesinleştiğinde 35 haftalık plan son tarihe göre gözden geçirilmelidir.

## ÖSYM kaynakları

- https://www.osym.gov.tr/
- https://www.osym.gov.tr/Sayfa/SinavTakvimi/tr-TR

## Teknik

- `lib/curriculum.ts`: konu kataloğu
- `lib/study.ts`: soru oluşturma, günlük plan, eksik analizi, deneme motoru
- `app/page.tsx`: ders, test, deneme, analiz, yedekleme ekranları
- `app/globals.css`: responsive tema

Herhangi bir telifli soru PDF'i depoya eklenmedi.
