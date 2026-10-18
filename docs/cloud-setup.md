# Şifreli giriş ve bulut senkronizasyonu

Supabase projesi **YKS Akademi 2027** (ref: `urrfjzrbnpwylejyowls`, `eu-central-1`) açıldı, `study_progress` tablosu ve kullanıcı bazlı RLS kuralları 18 Ekim 2026'da migration ile etkinleştirildi. Vercel `guvensor` projesinde URL, anon ve publishable key değişkenleri production + preview için ayarlandı. Değişkenlerin değerlerini GitHub'a koyma.

**Kalan zorunlu manuel işlem:** Supabase Authentication > URL Configuration kısmında Site URL = `https://guvensor.vercel.app` ve Redirect URLs listesinde `https://guvensor.vercel.app/**` bulunmalıdır. Yönetim bağlantısı bu işlem için yeterli yetkiyi sunmadığından mevcut ayarın otomatik değiştirildiği iddia edilmemelidir. Auth e-posta şablonlarını ve SMTP durumunu da kontrol et.

## 1. Supabase

- Yeni / mevcut Supabase projesinde **Authentication > Providers > Email** alanında e-posta/şifre yöntemi etkin olmalı. E-posta doğrulamasını açık tut.
- Veritabanı şeması **oluşturuldu ve RLS doğrulandı.** Yeniden çalıştırmak normalde gerekmez. Şema kaynak kodu `supabase/schema.sql` dosyasındadır.
- **Authentication > URL Configuration** alanında Site URL'yi, Vercel alan adını ve Redirect URLs listesine `https://guvensor.vercel.app/**` adresini ekle. Önizleme adresleri için ayrıca izin ver.
- Gerçek e-posta gönderimi için production SMTP ayarlarını kontrol et. Supabase'in geliştirme sınırlamalarına takılmamak için uygun SMTP gerekir.
- Parola kurtarma bağlantısından gelen kullanıcı yeni parola belirlemek için uygulamanın kurtarma ekranına yönlendirilir.

## 2. Vercel

Vercel projesi `guvensor` altında **Settings > Environment Variables**:

| İsim | Değer |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL (`https://…supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable/anon key |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Alternatif publishable key. Varsa anon key yerine bu kullanılır. |

Her iki anahtar değişkenini eklemek zorunlu değildir: URL + **iki anahtardan biri** yeterlidir. Değişkenleri Production ve Preview ortamlarına ekle. 18 Ekim 2026'da değişkenler yeni proje için yenilendi; bundan sonra alınacak yeni bir deploy bunları kullanır. **Kesinlikle service_role veya secret key kullanma.**

## 3. Davranış

- Şifreli hesap oluşturma / giriş / şifremi unuttum.
- E-posta doğrulaması etkinse yeni kullanıcıya doğrulama e-postası gelir.
- Supabase Auth oturumu varsayılan tarayıcı depolamasında korunur, erişim belirteçleri yenilenir. Çıkış yapılmadığı sürece geçerli oturumla tekrar parola sorulmaz. Tarayıcı verilerinin silinmesi, hesap güvenliğinin değişmesi veya oturumun iptali yeniden giriş gerektirebilir.
- `study_progress` JSONB satırı: bütün sorular, denemeler, dakika kayıtları, tamamlanan oturumlar ve yarım kalan soru durumu.
- Başka cihazda aynı hesapla giriş yapınca o kullanıcıya ait satır yüklenir. İki cihazda **aynı anda** bağımsız çalışılırsa son kaydeden cihazın verisi diğerini ezebilir; eş zamanlı düzenleme/multi-device conflict merge henüz yoktur.
- Eski yerel ilerleme varsa yalnızca **bulutta yeni hesap kaydı yokken**, kullanıcıdan izin alınarak aktarılır.
- Ayarlar ekranında JSON yedeği indir/yükle, parola korumalı oturumdan çıkış ve ilerleme sıfırlama bulunur.

## 4. Güvenlik sınırları

Her kullanıcı kendi satırını SELECT/INSERT/UPDATE/DELETE edebilir. Anon kullanıcı doğrudan tabloya erişemez. Supabase Auth ve RLS ile veri ayrımı sağlanır. Gerçek güvenlik testi için iki ayrı test hesabıyla birbirinin kaydına erişilemediğini doğrula. Gerçek Supabase projesi ve tablo oluşturulmuştur. SQL güvenlik kontrollerinde `anon` için okuma yetkisi olmadığı ve 4 adet kullanıcı bazlı RLS kuralı bulunduğu görülmüştür. Gerçek giriş ve cihazlar arası akışın testi, kullanıcı tarafından doğrulanmış iki test hesabıyla yapılmalıdır.

## 5. Eğitim içeriği

Mevcut arşiv 14 ders/196 konu için temel açıklama ve test akışı sağlar. Soruların çoğu formül/durum varyasyonu olup 8 aylık derin müfredat ve yayın izni alınmış orijinal çıkmış soruların tamamı **henüz mevcut değildir**. Her ünite için detaylı anlatımlar, kavram haritası ve editör tarafından kontrol edilen soruların eklenmesi ayrı bir kapsamdır.
