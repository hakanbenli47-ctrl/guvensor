export type Track = "TYT" | "AYT";
export type CourseId = "tyt-mat"|"tyt-geo"|"tyt-turkce"|"tyt-tarih"|"tyt-cografya"|"tyt-felsefe"|"tyt-din"|"tyt-fizik"|"tyt-kimya"|"tyt-biyoloji"|"ayt-mat"|"ayt-edebiyat"|"ayt-tarih"|"ayt-cografya";
export interface Course { id: CourseId; label: string; track: Track; color: string; }
export interface Topic { id: string; courseId: CourseId; title: string; summary: string; principles: string[]; worked: string; solution: string; index: number; }
export const COURSES: Course[] = [
 {id:"tyt-mat",label:"TYT Matematik",track:"TYT",color:"#6366f1"},
 {id:"tyt-geo",label:"TYT Geometri",track:"TYT",color:"#8b5cf6"},
 {id:"tyt-turkce",label:"TYT Türkçe",track:"TYT",color:"#e87945"},
 {id:"tyt-tarih",label:"TYT Tarih",track:"TYT",color:"#c68c3c"},
 {id:"tyt-cografya",label:"TYT Coğrafya",track:"TYT",color:"#25a78e"},
 {id:"tyt-felsefe",label:"TYT Felsefe",track:"TYT",color:"#6f8cbf"},
 {id:"tyt-din",label:"TYT Din Kültürü",track:"TYT",color:"#ab8b3c"},
 {id:"tyt-fizik",label:"TYT Fizik",track:"TYT",color:"#389ad4"},
 {id:"tyt-kimya",label:"TYT Kimya",track:"TYT",color:"#ad70bc"},
 {id:"tyt-biyoloji",label:"TYT Biyoloji",track:"TYT",color:"#63a36b"},
 {id:"ayt-mat",label:"AYT Matematik",track:"AYT",color:"#615de0"},
 {id:"ayt-edebiyat",label:"AYT Edebiyat",track:"AYT",color:"#dc8059"},
 {id:"ayt-tarih",label:"AYT Tarih-1",track:"AYT",color:"#ac793d"},
 {id:"ayt-cografya",label:"AYT Coğrafya-1",track:"AYT",color:"#25a78e"}
];
// Her satır: konu | özgün öğretici açıklama | hatırlanacak kural | çözümlü örnek | çözüm.
// ÖSYM soruları kopyalanmaz; bu içerik uygulamaya gömülü özgün eğitim materyalidir.
const RAW: Record<CourseId,string> = {
"tyt-mat": `
Temel kavramlar|Doğal, tam, rasyonel ve gerçek sayıları ayırt et. İşlem önceliğinde önce parantez, üs, çarpma-bölme ve toplama-çıkarma gelir.|Negatif×negatif pozitiftir; 0 ne pozitif ne negatiftir.|-3+2×5 kaçtır?|Çarpma önce yapılır: -3+10=7.
Sayı basamakları|Bir sayının değeri, her rakamın bulunduğu basamağın 10'un kuvvetiyle çarpılmasıdır.|abc üç basamaklı sayısı 100a+10b+c biçimindedir.|3a5 sayısında a=4 ise sayı kaçtır?|300+40+5=345.
Bölme ve bölünebilme|Bölmede bölünen=bölen×bölüm+kalan. Kalan 0 ile bölenin bir eksiği arasındadır.|3 ile bölünmede rakamlar toplamı; 4 ile bölünmede son iki basamak kontrol edilir.|432 sayısı 9'a tam bölünür mü?|4+3+2=9; evet.
EBOB ve EKOK|EBOB ortak bölenlerin en büyüğü, EKOK ortak katların en küçüğüdür.|Pozitif a,b için EBOB(a,b)×EKOK(a,b)=a×b.|12 ve 18 sayılarının EBOB'u kaçtır?|Ortak bölenlerin en büyüğü 6'dır.
Rasyonel sayılar|Pay ve paydadan oluşan a/b ifadesinde payda sıfır olamaz. Kesirleri toplarken önce payda eşitlenir.|Kesir bölme işlemi ikinci kesrin ters çevrilip çarpılmasıdır.|1/2 + 1/3 kaçtır?|Ortak payda 6: 3/6+2/6=5/6.
Basit eşitsizlikler|Eşitsizlikte her iki tarafa aynı sayı eklenebilir; negatif sayı ile çarpınca yön değişir.|-2x>6 ise x<-3 olur.|3x+2<11 eşitsizliği için x kaçtan küçüktür?|3x<9; x<3.
Mutlak değer|Mutlak değer sayı doğrusunda sıfıra olan uzaklıktır, sonuç negatif olamaz.|Mutlak değeri a olan iki sayı a ve -a olabilir, a>0.|Mutlak değeri 7 olan negatif sayı?| -7.
Üslü sayılar|Aynı tabanlı üslü sayıların çarpımında üsler toplanır, bölümünde çıkarılır.|a^0=1 (a≠0), a^-n=1/a^n.|2³×2² kaçtır?|2⁵=32.
Köklü sayılar|Karekök, kendisiyle çarpımı sayıyı veren negatif olmayan değerdir.|√(ab)=√a×√b (a,b≥0).|√50 nasıl sadeleşir?|√(25×2)=5√2.
Çarpanlara ayırma|Ortak çarpan parantezine alma ve özdeşliklerle ifadeler çarpanlara ayrılır.|a²-b²=(a-b)(a+b).|x²-9 ifadesini ayır.|(x-3)(x+3).
Denklem çözme|Birinci dereceden denklemde bilinmeyen bir tarafa, sayılar diğer tarafa toplanır.|Eşitliğin iki tarafına aynı işlem uygulanır.|3x+5=26 ise x?|3x=21, x=7.
Oran ve orantı|Oran iki çokluğun bölümü, orantı iki oranın eşitliğidir.|a/b=c/d ise ad=bc.|3 kalem 24 TL ise 5 kalem?|Birim fiyat 8 TL; 5×8=40 TL.
Sayı problemleri|Metindeki bilinmeyeni x seç; verilen ilişkileri denkleme dönüştür ve sonucu kontrol et.|Ardışık iki tam sayı x ve x+1'dir.|İki ardışık sayının toplamı 25, büyük olan?|x+(x+1)=25; x=12, büyük 13.
Kesir problemleri|Bir bütünün a/b kadarı için bütün miktarı a/b ile çarp; kalan kısmı ayrı hesapla.|Bir miktarın 1/4'ü kullanılırsa 3/4'ü kalır.|80 sayfanın 1/4'ü kaçtır?|80÷4=20.
Yaş problemleri|Yaş farkı yıllar geçse de değişmez; herkes aynı miktarda yaşlanır.|n yıl sonraki yaş x+n'dir.|Ali 12, Ayşe 18 yaşında; 5 yıl sonra yaş farkları?|18-12=6 yaş.
Yüzde problemleri|%p, p/100 demektir. Artış ve azalış sırasıyla 1+p/100 ve 1-p/100 ile hesaplanır.|Peş peşe iki indirim yüzdeleri doğrudan toplanmaz.|200 TL'nin %15'i kaçtır?|200×15/100=30 TL.
Kâr zarar ve indirim|Kâr=satış-alış; kâr oranı alış fiyatına göre hesaplanır.|%20 kâr için satış=alış×1,20.|100 TL'ye alınan mal 125 TL'ye satılırsa kâr oranı?|25/100=%25.
Karışım problemleri|Karışımdaki saf madde miktarı her bileşenin miktar×oran toplamıdır.|Eklenen saf su çözünmüş madde miktarını değiştirmez.|20 L %30 tuzlu suda kaç L tuz vardır?|20×0,30=6 L.
Hareket problemleri|Yol=hız×zaman. Birimleri aynı cinse çevirmeden işlem yapma.|Karşılıklı harekette bağıl hız hızların toplamıdır.|60 km/sa hızla 3 saat gidilen yol?|60×3=180 km.
İşçi ve havuz problemleri|Birim zamanda yapılan iş hızını kullan. Birlikte çalışma hızları toplanır.|6 saatte biten işin saatlik oranı 1/6'dır.|Biri 6, diğeri 3 saatte işi bitiriyor; birlikte?|1/6+1/3=1/2, 2 saat.
Grafik ve tablo yorumlama|Önce eksen, birim ve ölçeği oku; veriyi yorumlarken grafikte olmayan sonuca gitme.|Grafik eğimi değişim oranını gösterebilir.|Satış 20'den 30'a yükselirse artış yüzdesi?|10/20=%50.
Kümeler|Bir küme farklı elemanların topluluğudur. Birleşim en az birinde, kesişim ikisinde olanlardır.|n(A∪B)=n(A)+n(B)-n(A∩B).|A={1,2}, B={2,3}; A∩B?|{2}.
Mantık|Önermenin doğruluk değeri vardır. Ve bağlacı iki önerme doğruysa doğru, veya en az biri doğruysa doğrudur.|p⇒q yalnız p doğru, q yanlışken yanlıştır.|p doğru q yanlışsa p∧q?|Yanlış.
Permütasyon|Sıralama önemliyse permütasyon kullanılır. n farklı nesnenin sırası n! biçimde değişir.|P(n,r)=n!/(n-r)!.|3 farklı kitap kaç sırayla dizilir?|3!=6.
Kombinasyon|Seçimde sıra önemsizse kombinasyon kullanılır.|C(n,r)=n!/[r!(n-r)!].|4 kişiden 2 kişi seçme kaç yol?|C(4,2)=6.
Olasılık|Eş olasılıklı örnek uzayda olasılık=istenen durum/toplam durum.|Olasılıklar 0 ile 1 arasındadır.|Adil zarın çift gelme olasılığı?|3/6=1/2.
Veri ve istatistik|Aritmetik ortalama toplamın veri sayısına bölümüdür; medyan sıralı ortadaki değerdir.|Aykırı değerler ortalamayı etkileyebilir.|2,4,9 sayılarının ortalaması?|15/3=5.
`,
"tyt-geo": `
Doğruda açılar|Bir doğru açı 180°, tam açı 360°'dir; ters açılar eşittir.|Komşu bütünler açılar toplamı 180°'dir.|130° ile bütünler açı?|180-130=50°.
Üçgende açılar|Üçgenin iç açılar toplamı 180°, dış açılar toplamı 360°'dir.|Dış açı kendisine komşu olmayan iki iç açının toplamıdır.|İki açı 50° ve 60°; üçüncü?|180-110=70°.
Özel üçgenler|Eşkenarda üç kenar eşit ve her açı 60°'dir. İkizkenarda taban açıları eşittir.|3-4-5 üçgeni dik üçgendir.|Dik üçgende dik kenarlar 3 ve 4; hipotenüs?|√(9+16)=5.
Üçgende alan|Üçgen alanı taban uzunluğu×yükseklik/2'dir.|Yükseklik seçilen tabana dik olmalıdır.|Taban 10, yükseklik 6 ise alan?|10×6/2=30.
Üçgende benzerlik|Açıları eşit üçgenler benzerdir; eşleşen kenarların oranı sabittir.|Çevre oranı k ise alan oranı k² olur.|Kenar oranı 2 olan benzer üçgenlerin alan oranı?|2²=4.
Açıortay ve kenarortay|Açıortay açıyı iki eşit açıya, kenarortay karşı kenarı iki eşit parçaya böler.|Kenarortaylar ağırlık merkezinde 2:1 oranıyla bölünür.|Kenarortay 9 cm, köşeden ağırlık merkezine uzaklık?|9×2/3=6 cm.
Dörtgenler|Dörtgen iç açılar toplamı 360°'dir. Paralelkenar karşı kenarları eşit ve paraleldir.|Dikdörtgende tüm açılar 90°'dir.|Dikdörtgenin kenarları 4 ve 7, alan?|4×7=28.
Çokgenler|n kenarlı konveks çokgende iç açılar toplamı (n-2)×180°'dir.|Düzgün n-gende bir dış açı 360°/n.|Düzgün altıgende bir dış açı?|360/6=60°.
Çemberde açı|Merkez açı gördüğü yayın ölçüsüne, çevre açı gördüğü yayın yarısına eşittir.|Aynı yayı gören çevre açılar eşittir.|80° yayı gören çevre açı?|40°.
Dairede alan|Daire alanı πr², çevresi 2πr'dir.|Çap yarıçapın iki katıdır.|r=3 olan dairenin alanı?|9π.
Katı cisimler|Prizma hacmi taban alanı×yükseklik, silindir hacmi πr²h'dir.|Küp hacmi a³'tür.|Ayrıtı 4 olan küpün hacmi?|4³=64.
Analitik geometri|Koordinat düzleminde iki nokta arası uzaklık Pisagor ile bulunur.|Orta nokta ((x1+x2)/2,(y1+y2)/2).|(0,0) ile (3,4) arası uzaklık?|√(3²+4²)=5.
`,
"tyt-turkce": `
Sözcükte anlam|Sözcükler gerçek, mecaz veya terim anlamda kullanılabilir. Anlamı bağlamdan çıkar.|Bir kelimenin sözlük anlamı her cümlede geçerli olmayabilir.|“Keskin zekâ” ifadesinde keskin hangi anlamda?|Mecaz anlam.
Cümlede anlam|Neden-sonuç gerekçe, amaç-sonuç hedef bildirir; koşul bir şart ortaya koyar.|“İçin” sözcüğü bağlama göre amaç veya neden bildirebilir.|“Başarmak için çalıştı” hangi ilişkidir?|Amaç-sonuç.
Paragrafta konu|Konu, metnin üzerinde durduğu genel olay ya da düşüncedir.|Konu sorusuna 'ne anlatılıyor?' diye yaklaş.|Kitap okumanın yararlarını anlatan metnin konusu?|Kitap okumanın yararları.
Paragrafta ana düşünce|Ana düşünce yazarın okura ulaştırmak istediği temel yargıdır.|Metnin bütünüyle desteklenmeyen yargıyı ele.|Kitap okumanın empatiyi geliştirdiği metnin ana yargısı?|Okumak empatiyi geliştirir.
Paragrafta yardımcı düşünce|Yan düşünceler temel fikri örnek, tanım veya nedenlerle destekler.|“Değinilmemiştir” sorusunda metin dışında çıkarım yapma.|Bir metinde yalnız yaz mevsimi anlatılırsa kıştan söz edildi mi?|Hayır.
Paragrafın yapısı|Giriş konuya açılır, gelişme açıklar, sonuç toparlar; bağlaçlar ilişki kurar.|“Oysa, bununla birlikte” karşıtlık gösterebilir.|“Sonuç olarak” genellikle hangi bölümde?|Sonuç.
Anlatım biçimleri|Açıklama bilgi verir, tartışma karşı görüşe karşı savunur, öyküleme olay, betimleme tasvir içerir.|Betimlemede duyusal ayrıntılar önemli ipucudur.|Bir mekânın renk ve kokularını tarif eden anlatım?|Betimleme.
Düşünceyi geliştirme yolları|Örnekleme somutlaştırır; tanık gösterme alıntı, sayısal veri ölçüm, karşılaştırma fark gösterir.|Tanık gösterme için sözü aktarılan kişinin düşüncesi gerekir.|“Yüz öğrencinin 70'i” hangi yöntem?|Sayısal veriler.
Ses bilgisi|Ünlü düşmesi, türemesi, daralması ve ünsüz yumuşaması ses olaylarıdır.|Kitap+ı→kitabı ünsüz yumuşamasına örnektir.|Burun+u→burnu hangi olay?|Ünlü düşmesi.
Yazım kuralları|Özel adlar ve cümle başı büyük harfle yazılır; de/da bağlacı ayrı yazılır.|Bağlaç olan ki ayrı, ilgi eki -ki bitişik yazılır.|“Ben de geliyorum” ifadesindeki de?|Ayrı yazılır.
Noktalama işaretleri|Nokta bitmiş yargı, virgül eş görevli ögeleri ayırır; iki nokta açıklama başlatabilir.|Soru anlamı taşıyan cümlelerin sonunda soru işareti kullanılır.|“Nereye gidiyorsun” sonuna ne gelir?|Soru işareti.
Sözcük türleri|İsim varlığı, sıfat ismi, zarf fiil/sıfatı niteler; zamir ismin yerini tutar.|Bir sözcüğün türü cümledeki görevine göre belirlenir.|“Güzel kitap”ta güzelin türü?|Sıfat.
Fiiller ve kipler|Fiil iş, oluş veya hareket bildirir; zaman/haber ve dilek kipleri bulunur.|“Gelecek” gelecek zaman eki taşır.|“Okumalıyım” hangi kip?|Gereklilik.
Fiilimsi|İsim-fiil (-ma,-ış,-mak), sıfat-fiil ve zarf-fiil ekleriyle türeyen fiil biçimleridir.|Fiilimsiler kip ve kişi çekimi almış yüklem değildir.|“Yüzmek yararlıdır”da yüzmek?|İsim-fiil.
Cümlenin ögeleri|Yüklem temel yargıyı, özne işi yapanı; nesne işten etkileneni belirtir.|Yüklemi bulduktan sonra diğer ögeleri sorgula.|“Ayşe kitabı okudu.” özne?|Ayşe.
Cümle türleri|Yüklemin türü, yeri, anlamı ve yapı bakımından sınıflandırma yapılır.|Yüklemi fiil olan cümle fiil cümlesidir.|“Hava soğudu.” hangi tür?|Fiil cümlesi.
Anlatım bozukluğu|Gereksiz sözcük, çelişki, özne-yüklem uyumsuzluğu veya anlam belirsizliği bozukluk yaratır.|Anlam ve yapı hatalarını ayrı denetle.|“Geri iade etti”de hata nedir?|Gereksiz sözcük kullanımı.
`,
"tyt-tarih": `
Tarih bilimi ve zaman|Tarih, insan topluluklarının geçmişteki faaliyetlerini yer ve zaman göstererek kaynaklarla inceler.|Birincil kaynak olayın dönemine aittir.|Eski bir ferman hangi kaynak türü?|Birincil yazılı kaynak.
İlk uygarlıklar|Mezopotamya'da Sümer, Akad ve Babil; Anadolu'da Hitit, Frig, Lidya gibi uygarlıklar gelişti.|Sümerler çivi yazısını kullandı.|Parayı kullanan ilk Anadolu uygarlığı?|Lidyalılar.
İlk Türk devletleri|Asya Hun, Göktürk ve Uygur devletleri Türk tarihi açısından önemlidir.|Göktürk adı devlet adı olarak Türk sözcüğünü kullandı.|Yerleşik yaşamla öne çıkan ilk Türk topluluklarından biri?|Uygurlar.
İslam tarihi|Hicret 622'de Mekke'den Medine'ye göçtür; İslam takviminin başlangıcıdır.|Dört Halife dönemi Hz. Muhammed'in vefatından sonra başladı.|Hicret hangi yılda?|622.
Türklerin İslamiyet'i kabulü|Talas Savaşı 751'de Abbasiler ve Çin arasında gerçekleşti; Türklerle Müslümanların ilişkileri arttı.|Karahanlılar ilk Müslüman Türk devletlerindendir.|Talas Savaşı hangi yılda?|751.
Büyük Selçuklu|1040 Dandanakan zaferi Büyük Selçuklu'nun kuruluşunu sağlamlaştırdı; 1071 Malazgirt Anadolu'da Türk yerleşimini hızlandırdı.|Nizamiye Medreseleri eğitimde önemliydi.|Malazgirt Savaşı kaçta?|1071.
Osmanlı kuruluş ve yükseliş|Osmanlı Beyliği 13. yüzyıl sonlarında kuruldu; 1453 İstanbul'un fethiyle Bizans sona erdi.|Orhan Bey döneminde ilk düzenli yaya-müsellem birlikleri kuruldu.|İstanbul'un fethi hangi yıl?|1453.
Osmanlı kültür ve kurumları|Divan yönetim, tımar toprak ve askerî hizmet ilişkisi, vakıf sosyal dayanışma kurumudur.|Devşirme sistemi bazı kapıkulu asker ve görevlilerin yetişmesini sağladı.|Tımar sistemi hangi alana ilişkindir?|Toprak ve askerî düzen.
Osmanlı yenileşme|Tanzimat Fermanı 1839, Islahat Fermanı 1856; I. Meşrutiyet 1876'da ilan edildi.|Kanun-ı Esasi ilk Osmanlı anayasasıdır.|Tanzimat Fermanı hangi yılda?|1839.
Milli Mücadele|19 Mayıs 1919 Samsun, 23 Nisan 1920 TBMM'nin açılışı, 29 Ekim 1923 Cumhuriyetin ilanıdır.|Misak-ı Millî bağımsızlık hedeflerini ifade eder.|TBMM hangi tarihte açıldı?|23 Nisan 1920.
Atatürk ilke ve inkılapları|Cumhuriyetçilik milli egemenlik, laiklik din ve devlet işlerinin ayrılığı, halkçılık eşit yurttaşlık ilkesidir.|Harf inkılabı 1928'de yapıldı.|Harf inkılabı hangi yıl?|1928.
`,
"tyt-cografya": `
Doğa ve insan|Coğrafya doğal ortam ile insan faaliyetlerinin karşılıklı etkileşimini inceler.|Fiziki coğrafya iklim, yer şekilleri ve suları inceler.|Yer şekillerini inceleyen ana alan?|Fiziki coğrafya.
Coğrafi konum|Mutlak konum enlem ve boylamla; göreceli konum çevreyle ilişkilerle açıklanır.|Türkiye yaklaşık 36°–42° kuzey enlemlerindedir.|Enlem hangi konum çeşididir?|Mutlak konum.
Harita bilgisi|Ölçek harita uzaklığının gerçek uzaklığa oranıdır; payda büyüdükçe ayrıntı azalır.|1/100000 ölçekte 1 cm, 1 km'dir.|1/100000 ölçekte 2 cm kaç km?|2 km.
Dünya'nın hareketleri|Günlük dönüş gece gündüzü, yıllık dolanım ve eksen eğikliği mevsimleri etkiler.|Mevsimler Dünya'nın Güneş'e uzaklığından kaynaklanmaz.|Gece gündüzün temel nedeni?|Dünya'nın ekseni etrafında dönüşü.
İklim elemanları|Sıcaklık, basınç, rüzgâr, nem ve yağış hava olayları ve iklimi belirler.|İklim uzun yılların ortalamasını anlatır.|Bugün yağmur yağması iklim mi hava durumu mu?|Hava durumu.
Türkiye'nin iklimi|Akdeniz ikliminde yaz kurak, kış yağışlı; Karadeniz'de yıl boyu yağış görece yaygındır.|Karasallık sıcaklık farklarını artırabilir.|Yaz kuraklığı hangi iklimin belirgin özelliği?|Akdeniz iklimi.
Yer şekilleri|Dağ, ova, plato ve vadiler iç ve dış kuvvetlerle şekillenir.|Akarsular aşındırma ve biriktirme yapar.|Delta hangi süreçle oluşur?|Akarsu biriktirmesi.
Nüfus ve göç|Nüfus dağılışını iklim, su, ekonomik faaliyetler ve ulaşım etkiler.|Göç itici ve çekici etkenlerle gerçekleşir.|İş aramak için kente taşınma?|Ekonomik göç.
Ekonomik faaliyetler|Tarım birincil, sanayi ikincil, hizmet üçüncül ekonomik faaliyettir.|Turizm hizmet sektörüne girer.|Fabrikada üretim hangi sektör?|İkincil.
Afetler ve çevre|Deprem, sel, heyelan gibi afetlerin riski doğal süreçler ve insan faaliyetleriyle artabilir.|Afete hazırlık zarar azaltır.|Eğimli ve yağışlı yamaçta yaygın risk?|Heyelan.
`,
"tyt-felsefe": `
Felsefeye giriş|Felsefe gerekçelendirilmiş, sorgulayıcı ve eleştirel düşünmedir.|Dogmatizmden farklı olarak iddiaları tartışmaya açar.|Felsefi düşünceyi ayıran özellik?|Sorgulayıcılık.
Bilgi felsefesi|Epistemoloji bilginin kaynağını, doğruluğunu ve sınırlarını araştırır.|Rasyonalizm aklı, empirizm deneyimi öne çıkarır.|Deneyimi esas alan yaklaşım?|Empirizm.
Varlık felsefesi|Ontoloji var olanın niteliğini ve varlığın temelini sorgular.|İdealizm düşünceyi, materyalizm maddeyi temel alır.|Varlığı inceleyen dal?|Ontoloji.
Ahlak felsefesi|Etik iyi, kötü, özgürlük, sorumluluk ve erdem kavramlarını inceler.|Eylemin niyeti ve sonucu farklı etik yaklaşımlarda ayrışır.|İyi ve kötüyü inceleyen dal?|Etik.
Sanat felsefesi|Estetik güzeli ve sanat eserinin değerini araştırır.|Sanatsal değerle salt yarar aynı şey değildir.|Güzeli araştıran dal?|Estetik.
Siyaset felsefesi|Adalet, hak, özgürlük, devlet ve iktidarın meşruiyeti sorgulanır.|Ütopya ideal toplum tasarımıdır.|Adalet ve devlet ilişkisi hangi dal?|Siyaset felsefesi.
Din felsefesi|İnanç, Tanrı'nın varlığı, vahiy ve akıl ilişkisi felsefi açıdan incelenir.|Felsefi yaklaşım kavramları akıl yürütmeyle ele alır.|İnancı akılla sorgulayan alan?|Din felsefesi.
`,
"tyt-din": `
Bilgi ve inanç|İslam düşüncesinde akıl, vahiy ve doğru bilgi önemlidir.|İman ile bilgi birbirini ilgilendirse de aynı kavram değildir.|İslam'ın kutsal kitabı nedir?|Kur'an-ı Kerim.
İbadet ve ahlak|İbadet sorumluluk ve bağlılık, ahlak insan davranışlarına ilişkin ilkeler içerir.|Zekât toplumsal dayanışmayla ilgilidir.|Maddi paylaşma ibadeti?|Zekât.
Hz. Muhammed'in hayatı|Hz. Muhammed 610'da ilk vahyi aldı; 622'de Hicret gerçekleşti.|Medine döneminde toplumsal düzenlemeler öne çıkar.|Hicretin yılı nedir?|622.
Kur'an ve yorumu|Kur'an sure ve ayetlerden oluşur; tefsir açıklama ve yorumlama ilmidir.|Meal ve tefsir aynı değildir.|Ayetleri ayrıntılı açıklama ilmi?|Tefsir.
İslam düşüncesinde yorumlar|Mezhepler tarihsel farklı yorumları yansıtır; temel ibadet ve inanç konuları ortak olabilir.|Farklı yorumları bağlamında değerlendirmek gerekir.|Fıkıh neyle ilgilenir?|Dini uygulama ve hükümlerle.
Din ve sosyal hayat|Adalet, hak gözetme, yardımlaşma ve dürüstlük toplumsal ilişkilerde vurgulanır.|Kul hakkı başkasının hakkına saygıyla ilişkilidir.|Bir başkasının hakkını koruma ilkesi?|Kul hakkına saygı.
`,
"tyt-fizik": `
Fizik bilimine giriş|Fizik madde, enerji, hareket ve etkileşimleri inceler.|Temel SI birimleri arasında metre, saniye, kilogram vardır.|Uzunluğun SI birimi?|Metre.
Madde ve özellikleri|Yoğunluk kütle/hacimdir, maddenin ayırt edici özelliklerinden biridir.|d=m/V.|200 g kütle 100 cm³ hacim, yoğunluk?|2 g/cm³.
Hareket|Sürat alınan yolun zamana, hız yer değiştirmenin zamana oranıdır.|Düzgün doğrusal harekette hız sabittir.|100 m'yi 20 s'de alanın ortalama sürati?|5 m/s.
Kuvvet ve denge|Kuvvet hareketi değiştirebilir; net kuvvet sıfırsa ivme sıfır olabilir.|F=ma.|2 kg cisme 3 m/s² ivme veren kuvvet?|6 N.
İş enerji ve güç|Fizikte iş, kuvvetin yer değiştirme yönündeki bileşeni ile yolun çarpımıdır.|Güç=iş/zaman.|20 J iş 4 s'de yapılırsa güç?|5 W.
Isı ve sıcaklık|Sıcaklık taneciklerin ortalama kinetik enerjisiyle ilgilidir; ısı enerji aktarımıdır.|Q=m c ΔT.|Isı alan cismin sıcaklığı her zaman artar mı?|Hayır, hâl değişimi olabilir.
Basınç|Katılarda basınç F/A, sıvıda derinlikle artan hidrostatik basınç ρgh ile bulunur.|Yüzey alanı azalırsa aynı kuvvetin basıncı artar.|10 N, 2 m² yüzeyde basınç?|5 Pa.
Kaldırma kuvveti|Akışkanın kaldırma kuvveti taşırılan sıvının ağırlığına eşittir.|F_k=ρ_sıvı g V_batan.|Cisim neden suda yüzer?|Kaldırma kuvveti ağırlığı dengelediğinde.
Elektrik yükleri|Aynı tür yükler iter, zıt yükler çeker; toplam yük korunur.|Elektron negatif yüklüdür.|İki pozitif yük birbirini?|İter.
Elektrik akımı ve devre|Akım yük akışıdır; Ohm kanunu V=IR direnç, akım ve gerilimi bağlar.|Seri devrede akım aynıdır.|12 V ve 4 Ω dirençte akım?|3 A.
Optik|Yansıma açısı gelme açısına eşittir; kırılma ortam değişiminde ışığın yön değiştirmesidir.|Düzlem aynada görüntü sanal ve düzdür.|Gelme açısı 30° ise yansıma açısı?|30°.
Dalgalar|Dalga enerji taşır; periyot ve frekans ters orantılıdır.|v=fλ, f=1/T.|f=5 Hz, λ=2 m ise hız?|10 m/s.
`,
"tyt-kimya": `
Kimya bilimi|Kimya maddenin yapısını, değişimlerini ve etkileşimlerini inceler.|Fiziksel değişimde yeni madde oluşmaz.|Buzun erimesi hangi değişim?|Fiziksel.
Atom yapısı|Proton pozitif, elektron negatif, nötron yüksüzdür.|Atom numarası proton sayısıdır.|11 protonlu elementin atom numarası?|11.
Periyodik sistem|Elementler artan atom numarasına göre sıralanır; aynı grup benzer özellik gösterebilir.|Periyot yatay, grup dikey sütundur.|Periyodik tablonun yatay sırası?|Periyot.
Kimyasal türler arası etkileşim|İyonik bağ elektron alışverişi, kovalent bağ elektron ortaklaşması ile ilişkilidir.|Zayıf etkileşimler hidrojen bağı gibi türleri içerir.|NaCl'de baskın bağ türü?|İyonik.
Maddenin hâlleri|Katı, sıvı ve gaz tanecik düzeni ve hareketi bakımından farklıdır.|Buharlaşma her sıcaklıkta olabilir.|Sıvının gaza geçişi?|Buharlaşma/kaynama.
Kimyanın temel kanunları|Kütlenin korunumu ve sabit oranlar kimyasal tepkimeleri açıklar.|Kapalı sistemde toplam kütle korunur.|10 g ve 5 g tamamen tepkimeye girerse ürün toplam kütlesi?|15 g.
Mol kavramı|Mol tanecik sayısını, kütleyi ve hacmi bağlayan ölçü birimidir.|1 mol 6,02×10²³ taneciktir.|2 mol kaç Avogadro sayısı tanecik?|2×6,02×10²³.
Kimyasal tepkimeler|Tepkime denklemleri atom türü ve sayısı korunarak denkleştirilir.|Girenden ürüne atom kaybolmaz.|H₂+O₂→H₂O denklemi nasıl dengelenir?|2H₂+O₂→2H₂O.
Karışımlar|Homojen karışım çözelti, heterojen karışımda farklı fazlar görülebilir.|Damıtma kaynama noktası farkına dayanır.|Tuzlu su hangi karışım türü?|Homojen.
Asit baz ve tuz|Asitler sulu ortamda H⁺, bazlar OH⁻ oluşumuyla ilişkilendirilebilir.|25°C'de pH 7 nötrdür.|pH=3 olan çözelti?|Asidik.
Kimya her yerde|Temizlik maddeleri, polimerler, ilaçlar ve gıda bileşenleri günlük kimya uygulamalarıdır.|Kimyasallar etikete uygun kullanılmalıdır.|Plastiklerin temel büyük molekül yapısı?|Polimer.
`,
"tyt-biyoloji": `
Canlıların ortak özellikleri|Canlılarda hücresel yapı, metabolizma, homeostazi ve üreme gibi özellikler bulunur.|Virüsler hücresel yapıya sahip değildir.|Hücrenin iç dengesini sürdürmesi?|Homeostazi.
Organik bileşikler|Karbonhidratlar, yağlar, proteinler ve nükleik asitler canlı yapısında işlev görür.|Enzimlerin çoğu protein yapılıdır.|DNA hangi organik bileşik grubu?|Nükleik asit.
Hücre ve organeller|Hücre zarı seçici geçirgendir; mitokondri enerji dönüşümünde rol alır.|Ribozom protein sentezler.|Protein sentezinin gerçekleştiği organel?|Ribozom.
Hücre zarından geçiş|Difüzyon yoğunluktan aza, osmoz suyun seçici geçirgen zardan hareketidir.|Aktif taşıma enerji gerektirir.|Suyun geçişi hangi süreç?|Osmoz.
Canlıların sınıflandırılması|Sınıflandırma akrabalık ve ortak özelliklere göre yapılır.|Tür temel sınıflandırma basamağıdır.|Sınıflandırmada en özel basamak?|Tür.
Hücre bölünmeleri|Mitoz büyüme ve onarımda, mayoz eşey hücresi oluşumunda önemlidir.|Mayoz kromozom sayısını yarıya indirir.|2n=46 hücrede mayoz sonu n kaç?|23.
Kalıtımın temel ilkeleri|Genetik bilgi DNA'da, aleller genin alternatif biçimleridir.|Baskın alel heterozigotta fenotipi etkileyebilir.|Aa genotipi nasıl adlandırılır?|Heterozigot.
Ekosistem ekolojisi|Üreticiler ışık/kimyasal enerji kullanır, tüketiciler organik besinle beslenir.|Enerji trofik düzeyler boyunca azalır.|Besin zincirinin başlangıcında genellikle kim vardır?|Üreticiler.
Çevre sorunları|İklim değişikliği, habitat kaybı ve kirlilik biyolojik çeşitliliği tehdit eder.|Geri dönüşüm tek başına tüm çevre sorunlarını çözmez.|Türlerin yaşam alanı kaybı?|Habitat kaybı.
`,
"ayt-mat": `
Temel kümeler ve mantık|Küme işlemleri ve önermelerin doğruluk tabloları daha ileri matematiksel akıl yürütmenin temelidir.|De Morgan: (A∪B)'=A'∩B'.|A={1,2},B={2,3}; birleşim?|{1,2,3}.
Fonksiyonlar|Her x değerine tanım kümesinde tek bir y değeri atanır. Tanım ve değer kümesi ayrılmalıdır.|Bileşke (f∘g)(x)=f(g(x)).|f(x)=2x+1, f(3)=?|7.
Polinomlar|Değişkenin negatif olmayan tam sayı kuvvetlerinden oluşan ifadeler polinomdur.|P(a), P(x)'in x-a ile bölümünden kalandır.|P(x)=x²+2, P(3)=?|11.
İkinci dereceden denklemler|ax²+bx+c=0 (a≠0) denkleminin kökleri diskriminant ile incelenir.|Δ=b²-4ac.|x²-5x+6=0 kökleri?|2 ve 3.
Parabol|y=ax²+bx+c grafiği paraboldür; a'nın işareti kolların yönünü belirler.|Tepe noktasının x'i -b/(2a)'dır.|y=x²-4x+1 tepe noktasının x'i?|2.
Eşitsizlik sistemleri|Çarpanların işaretleri kök noktaları arasında değerlendirilerek çözüm kümesi bulunur.|İşaret tablosunda kritik noktaları sırala.|(x-2)(x+1)>0 çözümü?|x<-1 veya x>2.
Trigonometri temel oranlar|Dik üçgende sin=karşı/hipotenüs, cos=komşu/hipotenüs, tan=karşı/komşu.|sin²x+cos²x=1.|sin30° değeri?|1/2.
Trigonometri birim çember|Birim çemberde x=cosθ ve y=sinθ; açı bölgesi işaretleri belirler.|180°=π radyan.|90° kaç radyan?|π/2.
Trigonometri denklemleri|Trigonometrik fonksiyonların periyotları çözüme eklenir.|sin(x+2π)=sin x.|sin x=0 için temel çözüm?|x=kπ, k tam sayı.
Logaritma|a^x=b eşitliği log_a b=x biçiminde yazılır; a>0, a≠1, b>0.|log_a(xy)=log_a x+log_a y.|log₂8=?|3.
Üstel fonksiyon|f(x)=a^x, a>0 ve a≠1; taban 1'den büyükse artandır.|a^0=1.|2^x=16 ise x?|4.
Diziler|Sıralı terimlerin kurala göre oluşturduğu yapıdır. Aritmetik dizide sabit fark bulunur.|a_n=a_1+(n-1)d.|3,7,11,... dizisinin 5. terimi?|19.
Binom açılımı|(a+b)^n açılımında katsayılar kombinasyonlarla hesaplanır.|(a+b)²=a²+2ab+b².|(x+2)²=?|x²+4x+4.
Permütasyon ve kombinasyon|Sıralama varsa permütasyon, sadece seçim varsa kombinasyon uygundur.|C(n,r)=C(n,n-r).|5 kişiden 2 kişi seçimi?|10.
Olasılık koşullu|P(A koşullu B)=P(A∩B)/P(B), B gerçekleştiğinde A olasılığıdır.|Bağımsız olaylar için P(A∩B)=P(A)P(B).|Adil para iki kez atıldığında iki tura olasılığı?|1/4.
Karmaşık sayılar|i²=-1 kabul edilerek z=a+bi biçimindeki sayılar tanımlanır.|Eşlenik a-bi'dir.|(2+i)+(3-2i)=?|5-i.
Limit kavramı|Limit, fonksiyon değerlerinin bir noktaya yaklaşırken yöneldiği değeri ifade eder.|Sağ ve sol limit eşitse iki taraflı limit vardır.|lim x→2 (3x+1)=?|7.
Süreklilik|f(a) tanımlı, limit var ve limite eşitse f a'da süreklidir.|Süreklilik türevlenebilirlik için gerekli fakat tek başına yeterli değildir.|f(x)=x² fonksiyonu x=2'de sürekli midir?|Evet.
Türev tanımı|Türev anlık değişim oranı, eğrinin teğet eğimidir.|d(x^n)/dx=n x^(n-1).|f(x)=x³ ise f'(x)=?|3x².
Türev uygulamaları|Kritik noktalar f'(x)=0 veya türevin tanımsız olduğu noktalardır.|f'>0 artan, f'<0 azalan aralık gösterir.|f(x)=x²-4x'in minimumu x kaçta?|x=2.
İntegral kavramı|Belirsiz integral türevin tersidir; sabit C eklenir.|∫x^n dx=x^(n+1)/(n+1)+C (n≠-1).|∫2x dx=?|x²+C.
Belirli integral|Belirli integral, yönlü alan/akümülasyonu ölçer; temel teoremle hesaplanır.|∫_a^b f(x)dx=F(b)-F(a).|∫0'dan 2'ye 2x dx?|4.
Analitik doğru|İki noktanın eğimi (y2-y1)/(x2-x1); doğru y=mx+n ile yazılır.|Dik doğruların eğim çarpımı -1 (tanımlılarsa).|(0,1) ve (2,5) arasındaki eğim?|2.
Analitik çember|Merkezi (a,b), yarıçapı r çemberin denklemi (x-a)²+(y-b)²=r².|Merkez (0,0) için x²+y²=r².|x²+y²=25 çemberinin yarıçapı?|5.
Uzay geometri|Noktalar, doğrular, düzlemler ve katı cisimlerde uzunluk/açı ilişkileri incelenir.|Dikdörtgenler prizması hacmi abc'dir.|2×3×4 prizmanın hacmi?|24.
`,
"ayt-edebiyat": `
Edebiyat ve güzel sanatlar|Edebiyat dili estetik amaçla kullanır; nazım ve nesir temel anlatım biçimleridir.|İçerik ve biçim birlikte incelenir.|Dizelerle yazılmış anlatım?|Nazım.
Şiir bilgisi|Ölçü, uyak, redif, nazım birimi ve söz sanatları şiirin yapısına katkı sağlar.|Redif aynı görevli ek veya sözcük tekrarından oluşur.|Dört dizelik nazım birimi?|Dörtlük.
Edebî sanatlar|Teşbih benzetme, teşhis kişileştirme, intak konuşturmadır.|Abartma mübalağa olarak da adlandırılır.|“Rüzgâr ağladı” hangi sanat?|Teşhis.
İslamiyet öncesi Türk edebiyatı|Koşuk, sagu ve sav sözlü edebiyatta; destanlar toplumsal hafızada yer alır.|Sagu ölen kişinin ardından söylenir.|Ölüm üzerine söylenen şiir?|Sagu.
Geçiş dönemi eserleri|Kutadgu Bilig Yusuf Has Hacib, Divânu Lugâti't-Türk Kaşgarlı Mahmud tarafından yazıldı.|Atabetü'l-Hakayık Edip Ahmet Yükneki'nindir.|Kutadgu Bilig'in yazarı?|Yusuf Has Hacib.
Halk edebiyatı|Anonim, âşık ve tekke edebiyatı olarak incelenir; hece ölçüsü yaygındır.|Koşma âşık edebiyatında sık kullanılan nazım biçimidir.|Karacaoğlan hangi geleneğin şairi?|Âşık edebiyatı.
Divan edebiyatı|Aruz ölçüsü ve mazmunlar yaygındır; gazel, kaside, mesnevi gibi biçimler kullanılır.|Beyit iki dizedir.|Fuzûlî hangi edebiyat geleneğinde?|Divan edebiyatı.
Tanzimat 1. dönem|Sanat toplum içindir anlayışı ve hak, adalet, hürriyet temaları öne çıkar.|Şinasi, Namık Kemal, Ziya Paşa önemli isimlerdir.|İntibah romanının yazarı?|Namık Kemal.
Tanzimat 2. dönem|Bireysel konular ve sanat kaygısı ağır basar; dil ve biçim tartışmaları sürer.|Recaizade Mahmut Ekrem, Abdülhak Hamit Tarhan önemlidir.|Araba Sevdası kimin?|Recaizade Mahmut Ekrem.
Servetifünun|Ağır dil, bireysel temalar ve Batılı edebî biçimler öne çıkar.|Tevfik Fikret, Cenap Şahabettin, Halit Ziya önemli isimlerdir.|Aşk-ı Memnu'nun yazarı?|Halit Ziya Uşaklıgil.
Fecriati|1909'da ortaya çıkan topluluk “Sanat şahsi ve muhteremdir” görüşünü savundu.|Ahmet Haşim bu toplulukla ilişkilidir.|Fecriati'nin sanat anlayışı sözü?|Sanat şahsi ve muhteremdir.
Milli Edebiyat|Sade dil, millî konular, hece ölçüsü ve Anadolu'ya yöneliş belirgindir.|Ömer Seyfettin, Ziya Gökalp, Ali Canip Yöntem etkili oldu.|Yeni Lisan hareketinin önemli ismi?|Ömer Seyfettin.
Cumhuriyet şiiri|Beş Hececiler, Garip, İkinci Yeni, toplumcu şiir gibi farklı anlayışlar vardır.|Garip akımında Orhan Veli, Oktay Rifat, Melih Cevdet yer alır.|Garip akımının temsilcisi?|Orhan Veli Kanık.
Cumhuriyet romanı|Köy, toplum, birey, modernleşme gibi temalar farklı tekniklerle işlenmiştir.|Yaşar Kemal'in İnce Memed eseri romandır.|İnce Memed'in yazarı?|Yaşar Kemal.
Cumhuriyet hikâyesi|Olay ve durum hikâyesi çizgisi sürer; toplumsal ve bireysel temalar görülür.|Sait Faik Abasıyanık durum hikâyesiyle anılır.|Semaver kitabının yazarı?|Sait Faik Abasıyanık.
Cumhuriyet tiyatrosu|Cumhuriyet döneminde toplumsal meseleler ve bireysel çatışmalar sahnelenir.|Haldun Taner epik tiyatro çalışmalarıyla bilinir.|Keşanlı Ali Destanı kimin?|Haldun Taner.
Edebî akımlar|Klasisizm aklı ve kuralları, romantizm duyguyu, realizm gözlemi önceler.|Natüralizm bilimsel determinizm etkisi taşır.|Gerçekçiliği temel alan akım?|Realizm.
Roman türü|Olay örgüsü, kişi, mekân, zaman ve anlatıcı romanın temel unsurlarıdır.|İlahi bakış açısı kişilerin iç dünyasını da bilebilir.|Anlatıcının her şeyi bildiği bakış açısı?|İlahi bakış açısı.
Hikâye türü|Olay hikâyesi düğüm ve çözüm, durum hikâyesi kesit ve izlenim ağırlıklıdır.|Maupassant olay, Çehov durum hikâyesiyle anılır.|Çehov tarzı hikâye?|Durum hikâyesi.
Tiyatro türü|Dram, trajedi ve komedi sahne için yazılan metin türlerindendir.|Diyalog karşılıklı konuşma, monolog kişinin kendi konuşmasıdır.|Karşılıklı konuşma adı?|Diyalog.
Öğretici metinler|Makale kanıtlama, deneme kişisel görüş, eleştiri değerlendirme içerir.|Makale nesnel verilerden yararlanır.|Yazarın görüşlerini serbestçe aktardığı tür?|Deneme.
Sözlü anlatım türleri|Söylev, münazara, panel, açık oturum gibi türlerin işlevleri farklıdır.|Münazara karşıt tezlerin savunulmasıdır.|Karşıt görüşlerin kurallı savunulması?|Münazara.
`,
"ayt-tarih": `
Tarih ve kaynaklar|Tarihsel bilgiyi kaynak, kronoloji ve neden-sonuç ilişkisiyle değerlendir.|Kaynak eleştirisi güvenilirlik için gereklidir.|Olayın gerçekleştiği dönemin belgesi?|Birincil kaynak.
İlk Çağ uygarlıkları|Mezopotamya, Mısır, Anadolu ve Akdeniz uygarlıkları farklı siyasi yapılar geliştirdi.|Yazı tarih devirlerini başlatan eşik kabul edilir.|Çivi yazısını kullanan uygarlık?|Sümerler.
Orta Asya Türk tarihi|Kut anlayışı, kurultay ve töre Türk devlet geleneğinin kavramlarıdır.|Töre yazısız hukuk kurallarıdır.|Hükümdarlık yetkisinin kutsallığı inancı?|Kut.
Türk İslam devletleri|Karahanlı, Gazneli ve Büyük Selçuklu dönemlerinde siyasi ve kültürel yapılar gelişti.|Nizamiye medreseleri Selçuklu eğitim kurumlarıdır.|Nizamiye Medreselerinin banisi?|Nizamülmülk.
Selçuklu ve Anadolu|Malazgirt 1071 sonrası Anadolu'da Türk siyasi örgütlenmeleri hızlandı.|Türkiye Selçukluları ticaret yollarını geliştirdi.|Malazgirt zaferinin komutanı?|Alp Arslan.
Osmanlı kuruluş ve siyaset|Osmanlı kuruluşunda uç bölgesi ve gaza anlayışı etkili oldu; beylikten devlete geçiş gerçekleşti.|Orhan Gazi döneminde Bursa alındı.|Bursa'yı alan Osmanlı hükümdarı?|Orhan Gazi.
Osmanlı medeniyeti|Merkez teşkilatı, tımar, devşirme, ilmiye ve vakıflar farklı işlevler gördü.|Divan-ı Hümayun yönetim ve danışma kurumuydu.|Vakıf hangi alanla ilgilidir?|Kamu yararı ve hayır hizmetleri.
17. yüzyıl Osmanlı|Siyasi ve askerî sorunlara karşı ıslahat girişimleri geliştirildi.|Köprülü ailesi sadrazamları etkili oldu.|Bu dönemin önemli sadrazam ailesi?|Köprülüler.
18. yüzyıl değişim|Lale Devri ve Batı ile diplomatik temaslar yeniliklerin parçasıydı.|1727'de İbrahim Müteferrika matbaası kuruldu.|İlk Türk matbaasıyla anılan isim?|İbrahim Müteferrika.
19. yüzyıl reformları|Tanzimat, Islahat ve Meşrutiyet hareketleri yönetim yapısını değiştirdi.|1876 Kanun-ı Esasi ilk anayasadır.|İlk Osmanlı anayasası adı?|Kanun-ı Esasi.
20. yüzyıl savaşları|Trablusgarp, Balkan ve I. Dünya Savaşı siyasi sınırları etkiledi.|Osmanlı I. Dünya Savaşı'na 1914'te girdi.|Osmanlı'nın I. Dünya Savaşı'na girdiği yıl?|1914.
Kurtuluş Savaşı|Kongreler, TBMM, cephe mücadeleleri ve Lozan süreci bağımsızlığın inşasında belirleyicidir.|Mudanya Ateşkesi 1922'de imzalandı.|Lozan Barış Antlaşması yılı?|1923.
Cumhuriyet dönemi|İnkılaplar hukuk, eğitim, sosyal yaşam ve siyasi alanda reformlar getirdi.|Tevhid-i Tedrisat 1924'te kabul edildi.|Tevhid-i Tedrisat hangi yılda?|1924.
Atatürk dönemi dış politika|Musul, Hatay, Balkan Antantı, Sadabat Paktı gibi konular döneme damga vurdu.|Hatay 1939'da Türkiye'ye katıldı.|Hatay hangi yıl katıldı?|1939.
Çağdaş dünya|Soğuk Savaş, çok kutupluluk, küreselleşme ve uluslararası kurumlar incelenir.|BM 1945'te kurulmuştur.|Birleşmiş Milletlerin kuruluş yılı?|1945.
`,
"ayt-cografya": `
Ekosistem ve biyoçeşitlilik|Türlerin dağılışını iklim, yükselti, toprak ve insan etkisi belirler.|Ekoton farklı ekosistemlerin geçiş alanıdır.|Tür zenginliğini ifade eden kavram?|Biyoçeşitlilik.
Nüfus politikaları|Ülkeler nüfus artışını teşvik edebilir veya sınırlamaya çalışabilir.|Yaşlı nüfus oranı demografik yapıyı etkiler.|Doğum oranını artırmaya yönelik politika?|Nüfus artırıcı politika.
Yerleşmelerin işlevleri|Şehirler sanayi, ticaret, turizm, liman veya yönetim işlevleriyle uzmanlaşabilir.|Hinterlant etki alanıdır.|Liman kentinin ekonomik olarak bağlandığı çevre?|Hinterlant.
Türkiye'de tarım|Tarım ürünlerinin bölgesel dağılımında iklim, toprak, sulama ve pazar etkilidir.|Çay nemli Karadeniz iklimiyle ilişkilidir.|Türkiye'de çay hangi bölgede yoğunlaşır?|Doğu Karadeniz.
Türkiye'de sanayi|Sanayi kuruluş yerinde ham madde, enerji, ulaşım, sermaye ve iş gücü belirleyicidir.|Pazara yakınlık bazı sektörlerde önemlidir.|Sanayi için ulaştırma ağının önemi?|Dağıtımı kolaylaştırmak.
Enerji kaynakları|Fosil yakıtlar yenilenemez, güneş ve rüzgâr yenilenebilir kaynaklardır.|Kaynakların çevresel etkileri farklıdır.|Rüzgâr hangi kaynak grubundadır?|Yenilenebilir enerji.
Ulaşım ve ticaret|Ulaşım ağları merkezlerin ekonomik etkileşimini ve maliyetleri etkiler.|Boğazlar küresel deniz ulaşımında önemlidir.|Türkiye'deki iki büyük boğaz?|İstanbul ve Çanakkale.
Turizm|Turizm doğal ve kültürel çekiciliklere dayanır; mevsimsellik etkilidir.|Sürdürülebilirlik doğal ve kültürel mirası korumayı amaçlar.|Kapadokya ağırlıkla hangi turizm türü?|Kültür/doğa turizmi.
Küresel ticaret|Ülkeler doğal kaynak, teknoloji ve pazar koşullarına göre uzmanlaşabilir.|İthalat dışarıdan mal alımı, ihracat dışarıya satıştır.|Bir ülkenin başka ülkeye mal satması?|İhracat.
Kalkınma göstergeleri|Gelir, eğitim, sağlık ve yaşam beklentisi kalkınmanın çok boyutlu göstergeleridir.|Kişi başına gelir tek başına yeterli değildir.|Sağlık ve eğitim içeren kalkınma göstergesi?|İnsani Gelişme Endeksi.
Çevre sorunları|İklim değişikliği, kirlilik ve kaynak tükenmesi küresel işbirliği gerektirir.|Sürdürülebilir kalkınma gelecek kuşakları da gözetir.|Gelecek nesilleri gözeten yaklaşım?|Sürdürülebilir kalkınma.
Doğal afet yönetimi|Afet öncesi risk azaltma, hazırlık, müdahale ve iyileştirme aşamaları bulunur.|Risk sadece tehlikeye değil kırılganlığa da bağlıdır.|Afet öncesinde yapılması gereken temel çalışma?|Risk azaltma.
`
};
export const TOPICS: Topic[] = (Object.keys(RAW) as CourseId[]).flatMap(courseId => RAW[courseId].trim().split("\n").filter(Boolean).map((line,index)=>{
 const [title,summary,principle,worked,solution]=line.split("|");
 return {id:courseId+"-"+index,courseId,title,summary,principles:[principle,summary.split(".")[0].trim()+".","Soruda verilenleri ve isteneni ayrı belirle; örneği çözdükten sonra çözümü kapatarak tekrar dene."],worked,solution,index};
}));
export const topicsByCourse=(courseId:CourseId)=>TOPICS.filter(t=>t.courseId===courseId);
export const getTopic=(id:string)=>TOPICS.find(t=>t.id===id);
export const getCourse=(id:CourseId)=>COURSES.find(c=>c.id===id)!;
export const SUBJECT_COUNTS=COURSES.map(course=>({...course,count:topicsByCourse(course.id).length}));
