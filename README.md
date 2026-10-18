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
- Supabase Auth ile e-posta/şifre girişi ve kalıcı oturum; RLS korumalı bulut ilerlemesi; JSON dışa aktarma / içe aktarma.
- İlk girişte 36 özgün soruluk TYT/AYT seviye belirleme, kişiye özel zayıf konu analizi.
- Ayrıntılı anlatımı hazırlanan 15 ana konuda adım adım alt dersler; diğer konular için temel özetler.
- Özgün, elle yazılmış soru bankasının hazır olan konularda öncelikli kullanımı.
- Çözüm sonunda yanlış ve boş soruları açıklamalı inceleme, konu pekiştirmeye yönlendirme.
- İsteğe bağlı günlük başlama saati; 4x45 dakikalık çalışma ve ara molaları.
- **Telafi merkezi:** Bir önceki günden kalan plan oturumları yeni günün programından silinmez; tarihlerine göre telafi kuyruğunda listelenir ve tamamlanana kadar kalır. Telafi, günlük programa ek çalışmadır; program tarihlerini kendiliğinden ötelemez.
- **Kaldığın yerden devam:** Anlatım bölümlerinde “Bu bölümü okudum”, oturumda “Kaydet ve ara ver” seçenekleri; cevap ve konu ilerlemesinin bulut kaydı ve bir sonraki girişte devam kartı. Birden fazla eşzamanlı yarım oturum desteklenmez: yeni oturum başlatma eski yarım oturum için onay ister.
- Mobil uyumlu panel ve PDF olarak yazdırılabilir konu anlatımı.

## İçerik güvenilirliği ve sınırlar

Bu, uygulama içine tek seferde konulmuş **başlangıç düzeyinde kapsamlı konu kataloğu ve çalışan test sistemi**dir. Her konu için en ince ayrıntıyı kapsayan editöryal kitap içeriği, yüzlerce ayrı el yazımı soru veya resmî soru bankası bulunduğu anlamına **gelmez**. Konu açıklamaları özet niteliğindedir; öğretici kaynakla desteklenmelidir. Testler gerçek çıkmış ÖSYM soruları değildir. Sayısal sorularda şablonlara dayalı özgün varyasyonlar üretilir; sözel sorularda örnek soru ve kavramsal tanım eşleştirme kullanılır. Karmaşık geometri şekilleri ve görsel soru desteği bulunmaz. Her bir soru ve cevabın pedagojik editör denetimi yapılmadan resmî sınav eşdeğerliği iddiası taşınmaz.

Uygulama Supabase Auth ve `study_progress` veritabanı gerektirir. Şifreler uygulama koduna gömülmez; Supabase Auth tarafından yönetilir. Giriş sonrasında test ve ders kayıtları hesaba özgü, RLS korumalı veritabanında tutulur. Aynı anda iki cihazda çalışma sonucu ortaya çıkabilecek çakışmalar için son kaydı yazan cihazın ilerlemesi esas alınır. Verileri korumak için Ayarlar menüsünden JSON yedeği alın.

2027 sınav tarihi ve müfredat resmî olarak kesinleştiğinde 35 haftalık plan son tarihe göre gözden geçirilmelidir.

## ÖSYM kaynakları

- https://www.osym.gov.tr/
- https://www.osym.gov.tr/Sayfa/SinavTakvimi/tr-TR

## Teknik

- `lib/cloud.ts` ve `components/AccountGate.tsx`: parola korumalı giriş / çıkış / yenileme
- `supabase/schema.sql`: güvenli kullanıcı ilerleme kayıtları (Supabase'de etkin)
- `docs/cloud-setup.md`: production kurulum ve e-posta doğrulama URL ayarları
- `lib/curated-bank.ts`: özgün soru bankası
- `lib/deep-lessons.ts`: ayrıntılı konu alt dersleri
- `lib/placement.ts`: TYT/AYT başlangıç seviye tespiti
- `lib/curriculum.ts`: konu kataloğu
- `lib/study.ts`: soru oluşturma, günlük plan, eksik analizi, deneme motoru
- `app/page.tsx`: ders, test, deneme, analiz, yedekleme ekranları
- `app/globals.css`: responsive tema

Herhangi bir telifli soru PDF'i depoya eklenmedi.
