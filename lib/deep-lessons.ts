export interface LessonPart {
 title:string;
 explanation:string;
 formula?:string;
 example:{question:string;steps:string[];answer:string};
 mistake:string;
}
export interface DeepLesson {
 outcomes:string[];
 sections:LessonPart[];
 recap:string[];
 practicePlan:string;
}
const part=(title:string,explanation:string,question:string,steps:string[],answer:string,mistake:string,formula?:string):LessonPart=>({title,explanation,example:{question,steps,answer},mistake,formula});
export const DEEP_LESSONS:Record<string,DeepLesson>={
"tyt-mat-0":{
 outcomes:["Doğal, tam, rasyonel ve gerçek sayıları ayırt etmek","İşlem önceliğini hata yapmadan uygulamak","Negatif sayılarla dört işlem yapmak","Tek-çift sayı kurallarını problemde kullanmak"],
 sections:[
 part("Sayı kümelerinin mantığı","Saymak için kullandığın 0,1,2,... doğal sayılardır. Negatif sayıları da ekleyince tam sayılar oluşur. Kesir olarak yazılabilen sayılar rasyoneldir. √2 gibi iki tam sayının oranı olarak ifade edilemeyenler irrasyoneldir. Rasyonel ve irrasyonel sayıların tümü gerçek sayıları oluşturur.","-4, 0, 3/5, √9 sayılarından hangileri tam sayıdır?",["-4 ve 0 zaten tam sayıdır.","3/5 tam sayı değildir.","√9=3 olduğundan o da tam sayıdır."],"-4, 0, √9","Her köklü sayıyı irrasyonel sanmak yanlıştır: √9=3."),
 part("Negatif sayılar ve işaretler","Sayı doğrusunda sağa gidildikçe değer büyür: -2, -5'ten büyüktür. Aynı işaretli sayıların çarpımı pozitif, ters işaretlilerin çarpımı negatiftir. Çıkarmayı toplama biçiminde yazmak hataları azaltır: a-b=a+(-b).","(-6)-(-4)+(-2) sonucu kaçtır?",["İkinci eksi, negatif sayı çıkarıldığı için artıya döner: -6+4-2.","Önce -6+4=-2.","Sonra -2-2=-4."],"-4","-6 sayısının -4'ten küçük olduğunu unutma. Negatif sayıda rakamın büyüklüğü sayı değerini büyütmez."),
 part("İşlem önceliği","Bir ifadede önce parantez, sonra üs ve kök, ardından soldan sağa çarpma ve bölme, en sonunda soldan sağa toplama ve çıkarma yapılır. Aynı öncelikte iki işlem olduğunda soldan sağa ilerle.","18-3×(2+4)÷2 kaçtır?",["Parantez: 2+4=6.","Çarpma ve bölme soldan sağa: 3×6=18, 18÷2=9.","18-9=9."],"9","Çarpma işlemi bölmeye her zaman öncelikli değildir; ikisi aynı düzeydedir."),
 part("Tek-çift sayı ve ardışıklık","2k çift, 2k+1 tek sayıdır (k tam sayı). İki çiftin toplamı çift, iki tekin toplamı çift, tek+çift tek sayıdır. Ardışık iki tamsayının biri tektir, biri çifttir.","Ardışık üç tam sayının toplamı 51 ise ortadaki sayı nedir?",["Sayıları x-1, x, x+1 olarak yaz.","Toplam 3x=51 olur.","x=17."],"17","Ardışık sayılar her zaman 1 artar; ardışık çift sayılar 2 artar.")
 ],
 recap:["0 çift sayıdır.","Negatif sayıların sıralanmasında sayı doğrusuna bak.","İşlem önceliğini ezbere değil adım adım uygula.","Soru çözerken her işlem satırını ayrı tut."],
 practicePlan:"15 kolay işlem önceliği, 10 negatif sayı ve 10 tek-çift sorusu çöz; %80 üstüne çıkmadan temel kavramları bitmiş sayma."
},
"tyt-mat-4":{
 outcomes:["Kesir ve rasyonel sayı kavramını anlamak","Payda eşitlemek","Kesirlerle dört işlem ve karşılaştırma yapmak","Kesir sorularını problemle ilişkilendirmek"],
 sections:[
 part("Kesir neyi anlatır?","a/b biçiminde b sıfır olmayan bir tam sayıdır. Pay bütünden alınan parçayı, payda bütünün kaç eş parça olduğunu ifade eder. Kesir aynı sayıyla genişletilirse değeri değişmez. Negatif işaret paya, paydaya ya da kesrin önüne yazılabilir.","12/18 kesrini sadeleştir.",["Pay ve payda 6 ile bölünebilir.","12÷6=2; 18÷6=3."],"2/3","Pay ve paydayı farklı sayılara bölmek değeri değiştirir."),
 part("Toplama ve çıkarma","Paydaları aynı yapmadan payları toplayamazsın. Önce ortak paydayı belirle, eksik çarpanı hem paya hem paydaya uygula. Çarpma işleminde ise ortak payda gerekmez.","3/4 - 1/6 kaçtır?",["12 ortak paydadır.","3/4=9/12 ve 1/6=2/12.","9/12-2/12=7/12."],"7/12","3/4-1/6 işlemini 2/-2 gibi pay-payda ayrı çıkarmak yanlıştır."),
 part("Çarpma, bölme ve tam sayılı kesirler","Kesirleri çarparken pay×pay ve payda×payda yapılır. Bölmede ikinci kesir ters çevrilir ve çarpılır. İşlem başında çapraz sadeleştirme hız kazandırır.","(3/5)÷(9/10) kaçtır?",["İkinci kesri ters çevir: 3/5 × 10/9.","30/45 sadeleşir."],"2/3","Bölmede her iki kesri ters çevirmek yanlıştır."),
 part("Kesir sıralama ve problemlere geçiş","Pozitif kesirlerde paydalar eşitlenebilir veya çapraz çarpım yapılabilir. Parça-bütün problemlerinde geriye kalan kısmı 1’den çıkar.","Bir işin 2/5'i sabah, 1/4'ü öğleden sonra yapılırsa geriye ne kalır?",["Ortak payda 20: 2/5=8/20 ve 1/4=5/20.","Tamamlanan 13/20.","Kalan 1-13/20=7/20."],"7/20","Farklı zamanlarda işin 'kalanının' bir bölümü yapılıyorsa başlangıç bütünü ile aynı kabul etme.")
 ],
 recap:["Sadeleştirirken pay ve payda aynı sıfır olmayan sayıya bölünür.","Toplama ve çıkarmada ortak payda gerekir.","Kesir bölmede yalnız bölen ters çevrilir."],
 practicePlan:"10 sadeleştirme, 10 toplama/çıkarma, 10 çarpma/bölme, 10 problem çöz; sonra karışık 20 soruluk tarama yap."
},
"tyt-mat-10":{
 outcomes:["Bilinmeyeni tanımlamak","İki tarafa eşdeğer işlemler uygulamak","Parantezli ve kesirli denklemleri çözmek","Çözümü yerine koyarak doğrulamak"],
 sections:[
 part("Denklemin dengesi","Eşitliğin iki tarafı terazinin iki kefesi gibidir. Her iki tarafa aynı miktarı eklemek/çıkarmak veya sıfır olmayan aynı sayıyla çarpmak/bölmek dengeyi korur.","5x+7=32 denkleminde x kaçtır?",["Her iki taraftan 7 çıkar: 5x=25.","Her iki tarafı 5'e böl: x=5."],"5","Terim 'karşıya geçerken işaret değiştiriyor' kestirmesini ezberleyip nedenini unutma."),
 part("Parantezleri dağıtma","a(b+c)=ab+ac ve a(b-c)=ab-ac. Negatif katsayı parantezin içindeki her terimin işaretini etkiler.","3(2x-1)-4=2x+9 denklemini çöz.",["Parantezi aç: 6x-3-4=2x+9.","6x-7=2x+9 → 4x=16.","x=4."],"4","Parantez katsayısını yalnız ilk terimle çarpmak sık yapılan hatadır."),
 part("Kesirli denklemler","Paydaları yok etmek için denklemin iki tarafını paydaların ortak katıyla çarpabilirsin. Başta paydaların sıfır olmaması şartını kontrol et.","x/3+x/6=5 ise x kaçtır?",["Ortak payda 6.","2x/6+x/6=5 → 3x/6=5.","x/2=5, x=10."],"10","Bir eşitlikte payda sadeleştirmeyi tek tarafa uygulama."),
 part("Çözümü kontrol et","Bulduğun x'i özgün eşitliğe koy; her iki taraf aynı sayıya eşitse çözüm doğrudur. Hiç çözümü olmayan veya sonsuz çözümü olan denklemler de bulunur.","2(x+3)=2x+6 denkleminin kaç çözümü vardır?",["Sol taraf açılır: 2x+6=2x+6.","Bütün gerçek sayılar eşitliği sağlar."],"Sonsuz çözüm","x'li terimler birbirini götürdüğünde kalan sabit eşitliğine bakılmalıdır.")
 ],
 recap:["Eşitliğin her iki tarafına aynı işlem yapılır.","Parantez dağıtımı bütün terimleri etkiler.","Bulduğun x'i yerine koy."],
 practicePlan:"5 terazi mantığı, 10 tek adım, 10 parantezli, 10 kesirli denklem; en az iki farklı günde karışık tekrar."
},
"tyt-mat-11":{
 outcomes:["Oranı birimli düşünmek","Doğru ve ters orantıyı ayırt etmek","Orantıdan bilinmeyen bulmak","Oran problemlerini tabloyla çözmek"],
 sections:[
 part("Oran ve birimler","a:b oranı a/b kesridir. Miktarların birimleri aynıysa sadeleşebilir; farklıysa birimleri korumak gerekir. Oran tüm parçaların dağılımını ifade eder.","Kız/erkek oranı 2/3 olan 25 kişilik grupta kız sayısı?",["Toplam 5 pay vardır.","Bir pay 25÷5=5 kişidir.","Kızlar 2×5=10."],"10","2/3 oranını toplamın 2/3'ü gibi almak yanlış; toplam pay 2+3=5."),
 part("Doğru orantı","Birim başına fiyat sabitse alınan ürün sayısı arttıkça fiyat aynı oranda artar. y=kx biçiminde modellenir.","4 kg elma 120 TL ise 7 kg elma kaç TL?",["Birim fiyat 120÷4=30 TL.","7×30=210 TL."],"210 TL","Sabit fiyatlı ürünlerde birim fiyatı bulmadan rastgele çapraz çarpma yapma."),
 part("Ters orantı","İş veya sabit yol gibi büyüklüklerde biri artınca diğeri aynı oranda azalır: x×y=k. Daha çok işçi aynı işi daha kısa sürede bitirir.","6 işçi bir işi 10 günde yapıyorsa eş verimle 15 işçi kaç günde yapar?",["İşçi×gün sabittir.","6×10=15×gün.","Gün=4."],"4 gün","İşçi sayısıyla gün sayısını doğru orantılı sanma.")
 ],
 recap:["Oran parçaların karşılıklı ilişkisidir.","Doğru orantı x/y sabit, ters orantı xy sabittir."],
 practicePlan:"15 oran, 15 doğru orantı ve 15 ters orantı sorusu; tablo kurarak çöz."
},
"tyt-mat-12":{
 outcomes:["Metni denklem hâline getirmek","Bir bilinmeyeni uygun seçmek","Ardışık sayı sorularını çözmek","Sonucun sorulan büyüklük olup olmadığını kontrol etmek"],
 sections:[
 part("Problemin dilini denkleme çevir","‘Bir sayının üç katı’ 3x, ‘5 fazlası’ +5, ‘yarısı’ x/2 anlamına gelir. Önce bilinmeyeni, sonra bilinen ilişkileri yazarak işlemi basitleştir.","Bir sayının 4 katının 3 eksiği 29 ise sayı kaçtır?",["x sayısı için 4x-3=29 kur.","4x=32, x=8."],"8","Soruda ‘sayının’ mı yoksa ‘sayının üç katının’ mı ifadesi geçtiğini dikkatle ayır."),
 part("Ardışık sayılar","Ardışık tam sayılar x,x+1,x+2; ardışık çift sayılar 2n,2n+2,2n+4 biçimindedir.","Ardışık üç çift sayının toplamı 66 ise en büyüğü kaçtır?",["Sayılar x, x+2, x+4 olsun.","3x+6=66 → x=20.","En büyük x+4=24."],"24","‘Ortadaki sayı’yı bulup ‘en büyük’ istendiğini atlama."),
 part("İki bilinmeyeni teke indir","Toplam, fark, iki kat gibi ilişkiler bir sayıyı diğerinin cinsinden yazmayı sağlar.","İki sayının toplamı 45 ve büyüğü küçüğün 2 katından 3 fazla ise küçük kaçtır?",["Küçük x, büyük 2x+3.","3x+3=45 → 3x=42.","x=14."],"14","Kontrol: büyük 31, toplam 45; ilişkileri iki yönden doğrula."),
 part("Hızlı ama güvenilir çözüm","Soruyu okumayı bitirince ne istendiğini bir kez daha işaretle. Birimleri ve tam sayı koşulunu kontrol et.","Bir sayının 5 eksiğinin 2 katı 30 ise sayı kaçtır?",["2(x-5)=30.","x-5=15, x=20."],"20","‘5 eksiğinin 2 katı’ ifadesi 2x-5 değil 2(x-5)'tir.")
 ],
 recap:["Bilinmeyeni önce tanımla.","Her cümledeki nicel ilişkiyi denklemleştir.","Cevabı soruya geri koyarak kontrol et."],
 practicePlan:"En az 30 özgün problem, 10 ardışık sayılar ve 15 eşitlik kurma sorusu; süre tutmayı doğruluktan sonra başlat."
},
"tyt-mat-15":{
 outcomes:["Yüzdeyi kesir ve ondalık olarak göstermek","Zam ve indirimi hesaplamak","Ardışık değişimleri doğru uygulamak","İlk fiyatı bulmak"],
 sections:[
 part("Yüzdenin anlamı","%p, p/100 ile aynı değerdir. %25=0,25=1/4; %12,5=1/8. Bir bütünün oranını bulmak için yüzde ile çarp.","480'in %25'i kaçtır?",["%25=1/4.","480÷4=120."],"120","%25 oranını 25 ile doğrudan çarpmak yanlıştır."),
 part("Zam ve indirim çarpanları","%20 zam 1,20 ile, %20 indirim 0,80 ile çarpma anlamına gelir. İndirim tutarı ve indirim sonrası fiyat ayrı şeylerdir.","350 TL'lik ürüne %20 indirim yapılırsa fiyat kaçtır?",["350×0,20=70 TL indirim.","350-70=280 TL."],"280 TL","Sorunun indirim miktarını mı yoksa yeni fiyatı mı istediğini ayır."),
 part("Ardışık yüzde değişimleri","%20 indirim üstüne %10 indirim toplam %30 değil, 0,8×0,9=0,72; yani %28 indirime denk gelir.","1000 TL önce %20 ucuzlayıp ardından %25 zamlanırsa son fiyat kaçtır?",["1000×0,8=800.","800×1,25=1000."],"1000 TL","İki oranın toplamının sıfır olmasına bakarak fiyatın değişmediğine karar verme; çarpanları kullan."),
 part("Bütünü bulmak","Son fiyat ve oran verildiyse çarpanla bölerek ilk fiyatı bul. Fiyat %10 düşüp 270 TL olduysa eski fiyat 270/0,9'dur.","%10 indirim sonrası 270 TL olan ürünün ilk fiyatı kaçtır?",["Eski fiyat x ise 0,9x=270.","x=300."],"300 TL","270'in %10'unu eklemek ilk fiyata geri döndürmez.")
 ],
 recap:["Yüzde değişimlerinde çarpan yöntemi güvenilirdir.","Ardışık yüzdeler toplama yoluyla hesaplanmaz."],
 practicePlan:"10 temel yüzde, 10 indirim, 10 ardışık değişim, 10 ters yüzde sorusu çöz."
},
"tyt-turkce-3":{
 outcomes:["Konu ile ana düşünce arasındaki farkı bilmek","Paragrafın tamamını kapsayan yargıyı bulmak","Çeldiricileri gerekçeyle elemek"],
 sections:[
 part("Konu ile ana fikir farklıdır","Konu genellikle isim söz öbeği olur: ‘okuma alışkanlığı’. Ana düşünce ise yargıdır: ‘Düzenli okuma düşünce dünyasını zenginleştirir.’ Ana fikir sorusu yazarın neyi savunduğunu sorar.","Bir paragraf şehirde yeşil alanların insan psikolojisi için önemini anlatıyor. Ana düşünce nasıl kurulmalıdır?",["‘Parklar’ yalnız konudur.","‘Kentlerde yeşil alanlar ruh sağlığını olumlu etkiler’ bütün metni destekleyen yargıdır."],"Kentlerde yeşil alanlar ruh sağlığını olumlu etkiler.","Konuyu ana fikir yerine işaretlemek en yaygın yanlıştır."),
 part("Giriş, gelişme, sonuç ipuçları","Giriş konuyu tanıtır; gelişme neden ve örneklerle açıklar; sonuç ana yargıyı belirginleştirebilir. Yalnız son cümleye bakmak doğru değildir: metnin bütünü belirleyicidir.","Yazar önce şehrin gürültüsünü, sonra sakin alanların önemini anlatıyor. Ana fikrin kapsamı nasıl seçilir?",["Her iki bölümü ortaklaştır: gürültü sorun, sakin alanlar çözüm.","Metnin tamamını karşılayan yargıyı seç."],"Sessiz alanlar kent yaşamının olumsuzluklarını azaltabilir.","Tek bir örneğin ayrıntısını genel ana düşünce sanma."),
 part("Seçenek eleme tekniği","Mutlak ifadeleri (‘yalnızca’, ‘her zaman’, ‘kesinlikle’) metin desteklemiyorsa ele. Metnin genel yargısından daha dar veya daha geniş seçenekler tuzak olabilir.","Paragraf ‘bazı öğrenciler sabah daha verimli çalışır’ diyorsa hangisi desteklenemez?",["‘Bütün öğrenciler sabah verimlidir’ yargısı metindeki ‘bazı’ ifadesini aşar.","Kesinlik bildiren genelleme reddedilir."],"Bütün öğrenciler sabah verimlidir.","Kendi deneyimini metindeki kanıt yerine kullanma.")
 ],
 recap:["Ana fikir bir yargıdır.","Örnek ana düşüncenin yerine geçmez.","Seçeneği metindeki ifadeyle karşılaştır."],
 practicePlan:"Her gün 15 paragraf; yanlışta metinden kanıt cümlesini işaretle."
},
"tyt-turkce-2":{
 outcomes:["Paragrafın konusunu belirlemek","Başlığa uygun ifadeyi seçmek","Konu ve başlık farkını kavramak"],
 sections:[
 part("Konu nasıl bulunur?","Paragraf boyunca neyin anlatıldığını bir iki kelimeyle açıkla. Konu 'ne anlatılıyor?' sorusunun yanıtıdır. Metindeki tekrarlayan kavramlar ipucu verir.","Bir metin teknoloji kullanımının çocukların uyku düzenini değiştirmesini anlatıyor. Konusu nedir?",["Teknoloji tek başına çok geniştir.","Çocukların uykusu da ilişkiyi tam vermez.","Teknoloji kullanımının çocukların uyku düzenine etkisi konudur."],"Teknoloji kullanımının çocukların uyku düzenine etkisi.","Yan ayrıntıyı değil bütün paragrafı kapsayan başlığı seç."),
 part("Başlık ve ana düşünceden farkı","Başlık kısa, dikkat çekici bir adlandırmadır. Konu tarafsızca belirtilir, ana düşünce bir yargıdır. Üçü aynı olguyla ilgilense de sorunun kökü önemlidir.","‘Düzenli yürüyüş kalp sağlığını olumlu etkiler.’ yargısının konusu nedir?",["Yargıdaki özne ve ilişkiyi ayır.","Konu: yürüyüşün kalp sağlığına etkileri."],"Yürüyüşün kalp sağlığına etkileri.","Sorulan konu iken ‘Yürüyüş sağlığı geliştirir’ biçimindeki yargıyı işaretleme.")
 ],
 recap:["Konu adlandırır, ana düşünce yorum/yargı bildirir.","Yan örnekleri konunun yerine koyma."],
 practicePlan:"10 paragrafta sadece konu bul, ardından 10 paragrafta konu-ana fikir ayrımı yap."
},
"tyt-geo-1":{
 outcomes:["İç ve dış açı ilişkisini anlamak","İkizkenar üçgen açılarını hesaplamak","Açıların toplamı üzerinden bilinmeyen bulmak"],
 sections:[
 part("Üçgende iç açılar","Öklid düzleminde üçgenin üç iç açısının toplamı 180°'dir. Bir açıyı bulmak için diğer ikisini çıkarırsın.","Bir üçgenin açıları 42° ve 68° ise üçüncüsü kaçtır?",["42+68=110.","180-110=70."],"70°","Üç açıyı 360°'ye tamamlama; 360° dörtgen iç açı toplamıdır."),
 part("Dış açı özelliği","Bir köşenin dış açısı kendisine komşu olmayan iki iç açının toplamına eşittir; komşu iç açıyla toplamı 180°'dir.","Uzak iç açılar 35° ve 50° ise dış açı kaçtır?",["35+50=85.","Aynı zamanda komşu iç açı 95° olur."],"85°","Dış açıyla kendi köşesindeki iç açıyı toplama; onlar bütünlerdir."),
 part("İkizkenar ve eşkenar","İkizkenar üçgende eşit kenarların karşısındaki açılar eşittir. Eşkenar üçgende üç açı da 60°'dir.","İkizkenar üçgende tepe açısı 40° ise taban açılarından biri kaçtır?",["Taban açıları eşit olsun: x+x+40=180.","2x=140, x=70."],"70°","İkizkenarda hangi kenarların eşit olduğu belirtilmişse karşılarındaki açıları eşitle.")
 ],
 recap:["Üçgende iç açılar 180°, dış açı uzak iç açıların toplamıdır.","İkizkenarda taban açıları eşittir."],
 practicePlan:"15 iç açı, 15 dış açı, 10 özel üçgen; şekil çizerek çöz."
},
"ayt-mat-1":{
 outcomes:["Fonksiyonu tanımlamak","Tanım ve görüntü kümelerini ayırt etmek","Bileşke ve ters fonksiyon temelini anlamak","Grafik üzerinden fonksiyon değerlendirmek"],
 sections:[
 part("Fonksiyon olmak ne demek?","A kümesindeki her eleman B kümesindeki yalnız bir elemana eşleniyorsa A'dan B'ye fonksiyon vardır. Farklı girdiler aynı çıktıyı alabilir; fakat bir girdi iki farklı çıktı üretemez.","A={1,2}, B={3,4}; 1→3, 2→3 bağıntısı fonksiyon mudur?",["A'nın her elemanı tanımlı.","Her girdinin tam bir çıktısı var."],"Evet.","Birden çok girdinin aynı çıktıya gitmesi fonksiyonu bozmaz."),
 part("Fonksiyonda değer bulma","f(x) ifadesinde x'i gördüğün her yere verilen sayıyı parantez içinde yaz. Negatif girdileri özellikle parantezle işle.","f(x)=x²-3x+2 ise f(-2) kaçtır?",["(-2)²=4.","-3(-2)=+6.","4+6+2=12."],"12","f(-2) yazılırken (-2)² ile -2² farklıdır."),
 part("Bileşke fonksiyon","(f∘g)(x)=f(g(x)); önce iç fonksiyon g çalışır. Fonksiyonlar genellikle yer değiştirmez.","f(x)=2x+3, g(x)=x²-1 ise (f∘g)(3) kaçtır?",["Önce g(3)=9-1=8.","Sonra f(8)=2×8+3=19."],"19","Önce f sonra g uygulamak farklı sonuç verebilir."),
 part("Ters fonksiyon","Bire bir ve örten eşlemede ters fonksiyon vardır. y=f(x) yazıp x'i y cinsinden çözerek f⁻¹(x) elde edersin.","f(x)=3x-6 fonksiyonunun tersi nedir?",["y=3x-6.","x=(y+6)/3.","Tersini f⁻¹(x)=(x+6)/3 yaz."],"(x+6)/3","f⁻¹(x), 1/f(x) anlamına gelmez.")
 ],
 recap:["Her girdi için yalnız bir çıktı olmalı.","Bileşkede önce iç fonksiyon çalışır.","Ters fonksiyon, fonksiyonu geri alır; karşılığına göre tanımlıdır."],
 practicePlan:"15 değer bulma, 10 bileşke, 10 ters fonksiyon ve 10 grafik yorumu sorusu."
},
"ayt-edebiyat-7":{
 outcomes:["Tanzimat Birinci Dönem'in tarihsel zeminini açıklamak","Başlıca sanatçı ve eserleri eşleştirmek","Dönemin edebî anlayışını diğer dönemlerden ayırmak"],
 sections:[
 part("Tanzimat'ın edebiyata etkisi","1839 Tanzimat Fermanı sonrasında gazeteler, çeviri faaliyetleri ve Batı'dan alınan türlerle edebiyatın işlevi değişti. 1860'da Tercüman-ı Ahvâl'in yayımlanması Tanzimat edebiyatı için yaygın başlangıç kabul edilir.","Tanzimat Birinci Dönem'de neden gazete önem kazanır?",["Güncel düşüncelerin geniş kitlelere ulaşmasını sağlar.","Toplumsal meselelerin edebiyat ve kamuoyuyla tartışılmasına katkıda bulunur."],"Kamuoyu ve toplumsal düşünceyi taşıması.","Tanzimat Fermanı'nın 1839, Tercüman-ı Ahvâl'in 1860 olduğunu karıştırma."),
 part("Sanat toplum içindir","Birinci dönem yazarları vatan, hürriyet, adalet gibi toplumsal konuları ele aldı. Dilin sadeleşmesi istense de uygulamada Osmanlıca anlatım bütünüyle terk edilmedi.","Vatan kavramını ön plana çıkaran Tanzimat sanatçılarından biri kimdir?",["Namık Kemal'in Vatan yahut Silistre eseri bu temayı öne çıkarır."],"Namık Kemal.","Tanzimat I. ve II. dönemin dil ve sanat anlayışlarını aynı kabul etme."),
 part("Şinasi, Namık Kemal, Ziya Paşa","Şinasi: Şair Evlenmesi ve gazetecilik. Namık Kemal: İntibah, Cezmi, Vatan yahut Silistre. Ziya Paşa: Harabat, Terkibibent. Sanatçı ve eserleriyle dönemi birlikte kodla.","‘Şair Evlenmesi’ eserinin yazarı kimdir?",["Şair Evlenmesi, Şinasi'nin tiyatro eseridir."],"Şinasi.","Şair Evlenmesi ile Namık Kemal'in Vatan yahut Silistre eserini karıştırma.")
 ],
 recap:["1839 Ferman, 1860 gazete/dönem başlangıcı.","Toplum için sanat ve hak-hürriyet temaları öne çıkar.","Şinasi, Namık Kemal ve Ziya Paşa'yı eserleriyle eşleştir."],
 practicePlan:"10 dönem özelliği, 15 eser-yazar eşleştirme, 10 karşılaştırmalı Tanzimat I–II sorusu çöz."
},
"tyt-cografya-2":{
 outcomes:["Ölçek hesabı yapmak","Büyük ve küçük ölçekli haritaları karşılaştırmak","Gerçek uzaklığı hesaplamak"],
 sections:[
 part("Harita ve ölçek","Harita yeryüzünün kuşbakışı, düzleme aktarılmış ve belli oranla küçültülmüş gösterimidir. Ölçek harita mesafesi/gerçek mesafedir. Payda büyüdükçe aynı sayfada daha geniş alan gösterilir ve ayrıntı azalır.","1/200.000 ölçekli haritada 1 cm gerçekte kaç kilometredir?",["200.000 cm=2.000 m=2 km.","1 cm harita=2 km gerçektir."],"2 km","cm'den km'ye geçerken 100.000'e böl, 1.000'e değil."),
 part("Uzaklık hesapları","Gerçek uzaklık=harita uzaklığı×ölçek paydası. Sonuç öncelikle cm çıkar, ardından birime çevrilir.","1/500.000 ölçekli haritada 6 cm olan yol gerçekte kaç km?",["6×500.000=3.000.000 cm.","3.000.000/100.000=30 km."],"30 km","Harita uzaklığı ve gerçek uzaklık ölçümündeki birimleri eşitle."),
 part("Ölçek karşılaştırması","1/50.000 ölçek, 1/500.000'e göre büyüktür; payda küçüktür. Büyük ölçekli haritalar daha ayrıntılıdır ama daha az alan gösterir.","Aynı boy sayfada 1/50.000 ve 1/250.000 ölçeklerden hangisi daha ayrıntılıdır?",["Paydası küçük olan daha büyük ölçektir.","Ayrıntısı daha fazladır."],"1/50.000","Sayısal paydası daha büyük diye 1/250.000'i ‘büyük ölçek’ sanma.")
 ],
 recap:["1 km=100.000 cm.","Ölçek paydası küçükse ayrıntı fazladır.","Uzaklık hesabında birimleri karıştırma."],
 practicePlan:"10 ölçek dönüşümü, 10 harita uzaklığı, 10 büyük/küçük ölçek yorumu çöz."
},
"tyt-fizik-2":{
 outcomes:["Yol ve yer değiştirmeyi ayırmak","Ortalama sürat ve hızı hesaplamak","Birim dönüştürmek"],
 sections:[
 part("Yol ve yer değiştirme","Alınan yol izlenen güzergâhın toplam uzunluğudur. Yer değiştirme başlangıç ile bitiş arasındaki yönlü farktır. Gidip geri dönülürse yol pozitif, yer değiştirme sıfır olabilir.","Evden 100 m doğuya, sonra 100 m batıya yürüyen kişinin yolu ve yer değiştirmesi?",["Toplam yol 100+100=200 m.","Başlangıç noktasına döndüğü için yer değiştirme 0 m."],"Yol 200 m, yer değiştirme 0 m.","Sürat ve hız ifadelerini tüm sorularda eş anlamlı kullanma."),
 part("Ortalama sürat","Ortalama sürat=toplam yol/toplam zaman; ortalama hız=yer değiştirme/toplam zaman. Dinlenme zamanları toplam süreye dahil olabilir.","240 m'yi 60 saniyede giden aracın ortalama sürati?",["240÷60=4."],"4 m/s","Zamanı saniye, yolu kilometre yazıp dönüşüm yapmadan bölme."),
 part("Km/sa ile m/s dönüşümü","km/sa değerini m/s'ye çevirmek için 3,6'ya böl; ters yönde 3,6 ile çarp.","72 km/sa kaç m/s?",["72÷3,6=20."],"20 m/s","3,6 sabiti yol ve zamanın birlikte dönüşümünden gelir.")
 ],
 recap:["Ortalama sürat yol/zaman, ortalama hız yer değiştirme/zamandır.","72 km/sa=20 m/s."],
 practicePlan:"10 temel hareket, 10 hız birimi, 10 gidiş-dönüş sorusu."
},
"tyt-kimya-1":{
 outcomes:["Atom parçacıklarını tanımak","Atom ve kütle numarasını hesaplamak","Nötr atom ve iyonu ayırt etmek"],
 sections:[
 part("Proton, nötron ve elektron","Proton çekirdekte pozitif, nötron çekirdekte yüksüz, elektron çekirdek çevresindeki orbital bölgelerinde negatif yüklüdür. Atom numarası Z=proton sayısı, kütle numarası A=proton+nötron.","Z=11 ve A=23 olan atomun nötron sayısı?",["Nötron=A-Z.","23-11=12."],"12","Atom numarası ile kütle numarasını karıştırma."),
 part("İyon oluşumu","Nötr atomda proton=elektron. Pozitif iyon elektron vermiştir, negatif iyon elektron almıştır. Proton sayısı iyonlaşmayla değişmez.","Z=12 olan +2 yüklü iyonun elektron sayısı?",["Nötr atomda elektron 12.","+2 yüklü hâle gelirken 2 elektron kaybeder."],"10","+2 yükü 2 elektron almış gibi yorumlama."),
 part("İzotop atomlar","Proton sayısı aynı, nötron sayısı farklı atomlar aynı elementin izotoplarıdır. Kütle numaraları farklı olabilir.","Z=6, A=12 ile Z=6, A=14 atomları nasıl ilişkilidir?",["Proton sayıları aynı (6).","Nötron sayıları 6 ve 8; farklıdır."],"İzotopturlar.","İzotoplar farklı element değil aynı elementin farklı kütleli atomlarıdır.")
 ],
 recap:["Z=proton, A=proton+nötron.","İyonlaşmada proton sayısı değişmez."],
 practicePlan:"10 proton-elektron-nötron tablosu, 10 iyon, 10 izotop sorusu çöz."
},
"tyt-biyoloji-2":{
 outcomes:["Prokaryot/ökaryot hücreyi ayırt etmek","Organellerin görevlerini eşleştirmek","Hücre zarının seçici geçirgenliğini kavramak"],
 sections:[
 part("Hücre tipleri","Prokaryotlarda zarla çevrili çekirdek yoktur. Ökaryotlarda çekirdek ve zarlı organeller bulunur. Tüm canlı hücrelerde ribozom bulunur; virüsler hücre değildir.","Bakteride zarlı çekirdek bulunur mu?",["Bakteri prokaryottur.","Zarla çevrili çekirdeği bulunmaz."],"Hayır.","Prokaryotları ‘çekirdeği hiç genetik maddesi yok’ diye tanımlama."),
 part("Enerji ve protein üretimi","Mitokondri ökaryot hücrelerde aerobik solunumda görev alır. Ribozom protein sentezler; kloroplast fotosentez yapan ökaryot canlı hücrelerinde bulunur.","Protein sentezi yapan yapı hangisidir?",["Ribozom protein sentezler.","Mitokondri enerji dönüşümünde görev alır."],"Ribozom.","Ribozom yalnızca hayvan hücrelerinde bulunmaz."),
 part("Seçici geçirgen hücre zarı","Fosfolipit çift tabaka ve zar proteinleri maddelerin giriş-çıkışını düzenler. Pasif taşıma doğrudan ATP gerektirmez; aktif taşıma enerji kullanır.","Su moleküllerinin seçici geçirgen zardan geçişine ne denir?",["Suyun geçişi osmoz olarak adlandırılır."],"Osmoz.","Osmozda hareket edenin çözünmüş madde değil su olduğunu unutma.")
 ],
 recap:["Prokaryotlarda zarla çevrili çekirdek yoktur.","Ribozom protein sentezi yapar.","Osmoz suyun hareketidir."],
 practicePlan:"10 hücre tipi, 15 organel ve 10 taşıma sorusu çöz."
}
};
export const detailed=(topicId:string)=>DEEP_LESSONS[topicId];
export const DETAILED_LESSON_COUNT=Object.keys(DEEP_LESSONS).length;
