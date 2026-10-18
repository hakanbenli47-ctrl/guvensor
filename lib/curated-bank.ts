import type {Question} from "./study";
type Pair=[string,[string,string,string,string,string],0|1|2|3|4,string];
const BANK:Record<string,Pair[]>={
"tyt-mat-0":[
 ["(-8)+15-(-3) işleminin sonucu kaçtır?",["4","10","16","20","-10"],1,"-8+15=7, negatif 3'ü çıkarmak 3 eklemektir: 7+3=10."],
 ["3×(2-7)+4² işleminin sonucu kaçtır?",["-31","-1","1","16","31"],2,"2-7=-5, 3×(-5)=-15 ve 4²=16. Toplam 1."],
 ["a bir negatif tam sayı olduğuna göre hangisi her zaman pozitiftir?",["-a","a³","a-1","a×2","a"],0,"a<0 olduğundan -a>0'dır."],
 ["Ardışık dört tam sayının toplamı 14 ise en büyükleri kaçtır?",["2","3","4","5","6"],3,"x+(x+1)+(x+2)+(x+3)=14 ⇒ 4x+6=14 ⇒ x=2; en büyük 5."],
 ["(-2)³ + (-3)² işleminin sonucu nedir?",["-17","-1","1","17","25"],2,"(-2)³=-8 ve (-3)²=9, toplam 1."],
 ["İki tek tam sayının çarpımı hakkında hangisi kesinlikle doğrudur?",["Pozitiftir","Çifttir","Tektir","Sıfırdır","Negatiftir"],2,"(2a+1)(2b+1)=2(2ab+a+b)+1 daima tektir."],
 ["İşlem önceliğine göre 36÷6×3-2² kaçtır?",["-2","2","8","14","32"],3,"Çarpma-bölme soldan sağa: 36÷6×3=18; 2²=4; 18-4=14."],
 ["Sayı doğrusunda -5 ile +4 arasındaki tam sayıların toplamı kaçtır? (Uçlar hariç)",["-4","-3","-1","0","1"],0,"Sayılar -4,-3,-2,-1,0,1,2,3; simetrik çiftler sıfır, -4 kalır."]
],
"tyt-mat-4":[
 ["5/6 - 1/4 sonucu hangisidir?",["1/2","7/12","2/3","3/4","11/12"],1,"Ortak payda 12: 10/12-3/12=7/12."],
 ["(2/3)×(9/10) işleminin sonucu nedir?",["1/5","2/5","3/5","5/6","4/9"],2,"Pay ve paydaları çarp: 18/30=3/5."],
 ["(3/4)÷(9/8) işleminin sonucu nedir?",["1/3","2/3","3/4","3/2","4/3"],1,"(3/4)×(8/9)=24/36=2/3."],
 ["2/5'i 18 olan sayının tamamı kaçtır?",["36","40","45","50","54"],2,"(2/5)x=18 ⇒ x=18×5/2=45."],
 ["Bir kitabın önce 1/3'ü sonra kalanının 1/4'ü okunuyor. Geriye kitabın kaçta kaçı kalır?",["1/2","5/12","7/12","2/3","3/4"],0,"İlk kalan 2/3, sonra bunun 3/4'ü kalır; (2/3)×(3/4)=1/2."],
 ["3/7 ile 4/9 kesirlerinden hangisi daha büyüktür?",["3/7","4/9","Eşitler","Her ikisi de 1'den büyük","Belirlenemez"],1,"Çapraz çarp: 3×9=27, 4×7=28; 4/9 daha büyüktür."],
 ["1/(2+1/2) kesrinin değeri kaçtır?",["1/5","2/5","1/2","5/2","3/4"],1,"Payda 5/2'dir, tersi 2/5 olur."]
],
"tyt-mat-10":[
 ["7x-9=26 denkleminde x kaçtır?",["3","4","5","6","7"],2,"7x=35, x=5."],
 ["3(2x-4)=2x+12 ise x kaçtır?",["4","5","6","7","8"],2,"6x-12=2x+12, 4x=24, x=6."],
 ["x/2+x/3=15 ise x kaçtır?",["12","15","18","21","24"],2,"Ortak payda 6: 5x/6=15 ⇒ x=18."],
 ["2(x-3)-3(x+1)=-11 ise x kaçtır?",["0","1","2","3","4"],2,"2x-6-3x-3=-11, -x-9=-11 ⇒ x=2."],
 ["5x+2=5(x+1) denkleminin çözüm kümesi nedir?",["{0}","{1}","{-3}","Boş küme","Tüm gerçek sayılar"],3,"5x+2=5x+5 ⇒ 2=5 çelişkisi, çözüm yoktur."],
 ["4(2x-1)=8x-4 denkleminin çözüm kümesi nedir?",["{1}","{0}","Boş küme","Tüm gerçek sayılar","{-1}"],3,"Her iki taraf özdeştir; tüm gerçek sayılar çözümdür."],
 ["Bir denklemi çözerken her iki tarafı sıfır ile çarpmak neden uygun değildir?",["Her zaman işareti değiştirir","Yanlışlıkla eşitliği tüm x'ler için doğru yapabilir","Yalnız tam sayıları korur","İşlemi hızlandırır","Kökleri ikiye katlar"],1,"Sıfırla çarpma 0=0 üretir, özgün denklemle eşdeğer olmayan sonuç verir."]
],
"tyt-mat-12":[
 ["Bir sayının üç katının beş fazlası, sayının iki katının 17 fazlasına eşit. Sayı kaçtır?",["10","11","12","13","14"],2,"3x+5=2x+17, x=12."],
 ["Ardışık beş tek sayının ortancası 19 ise en küçük kaçtır?",["11","13","15","17","19"],2,"Sayılar 15,17,19,21,23; en küçük 15."],
 ["Ayşe'nin parası Mehmet'in parasının iki katıdır. Toplam 90 TL varsa Mehmet'in kaç TL'si vardır?",["20","25","30","35","45"],2,"Mehmet x, Ayşe 2x; 3x=90 ⇒ x=30."],
 ["Bir sayı 4 ile çarpılıp 8 çıkarıldığında 44 oluyor. Sayı kaçtır?",["9","11","12","13","14"],3,"4x-8=44 ⇒ 4x=52 ⇒ x=13."],
 ["Toplamları 61 olan iki sayıdan büyük olanı küçüğünün iki katından 1 fazladır. Büyük sayı kaçtır?",["20","21","39","40","41"],4,"Küçük x, büyük 2x+1: 3x+1=61 ⇒ x=20; büyük 41."],
 ["Ardışık üç doğal sayının toplamı 90 ise en büyüğü kaçtır?",["29","30","31","32","33"],2,"x+x+1+x+2=90 ⇒ 3x=87, sayılar 29,30,31."],
 ["İki sayının farkı 8, toplamı 44 ise büyük sayı kaçtır?",["18","22","24","26","28"],3,"x+y=44, x-y=8 ⇒ 2x=52 ⇒ x=26."]
],
"tyt-mat-15":[
 ["600 TL'lik ürüne %15 indirim yapılıyor. Satış fiyatı kaç TL?",["490","500","510","515","525"],2,"600×0,85=510."],
 ["Fiyatı 400 TL olan ürüne %25 zam yapılırsa fiyat kaç TL olur?",["425","450","475","500","525"],3,"400×1,25=500."],
 ["200 TL'lik ürüne önce %20 zam, sonra %20 indirim yapılırsa son fiyat kaç TL?",["180","192","196","200","208"],1,"200×1,2×0,8=192; oranlar birbirini sıfırlamaz."],
 ["%40'ı 64 olan sayı kaçtır?",["120","140","160","180","200"],2,"0,4x=64 ⇒ x=160."],
 ["%10 indirimle 270 TL'ye satılan ürünün etiketi kaç TL'dir?",["280","290","300","310","320"],2,"İlk fiyat x; 0,90x=270 ⇒ x=300."],
 ["Bir sınıfın %60'ı kız, geri kalan 12 kişi erkekse sınıf mevcudu kaçtır?",["20","24","25","30","32"],3,"Erkekler %40, 0,4x=12 ⇒ x=30."],
 ["İki yıl üst üste %10 artan bir değer toplam yüzde kaç artar?",["%10","%20","%21","%22","%25"],2,"1,1×1,1=1,21 ⇒ %21 artış."]
],
"tyt-turkce-3":[
 ["‘Bilgi, yalnızca ezberlenerek anlamlı hâle gelmez. Öğrenen kişi kavramları birbiriyle ilişkilendirdiğinde bilgiyi kullanabilir ve yeni durumlara uygulayabilir.’ Ana düşünce nedir?",["Ezber öğrenmenin tek yoludur","Öğrenme bilgiyi ilişkilendirerek kullanma becerisi gerektirir","Bilgi yalnızca okulda edinilir","Öğrenmek zaman kaybıdır","Kavram sayısı öğrenmenin ölçüsüdür"],1,"Metin ezberin ötesinde kavramlar arası ilişki ve uygulamayı vurgular."],
 ["‘Şehirlerin büyümesi kaçınılmaz olabilir ancak yeşil alanların korunması kent sakinlerinin yaşam kalitesi için önemlidir.’ Ana düşünce nedir?",["Kentlerde büyüme durmalıdır","Yeşil alanlar kent yaşamında korunmalıdır","Her kent aynı hızda büyür","Yalnız kırsal alan yaşanabilirdir","Binalar yeşil alanlardan daha değerlidir"],1,"Metin kent büyüse de yeşil alanların korunmasını savunur."],
 ["‘Bir işi sürdürebilmek için yalnızca istek değil, gerçekçi bir düzen de gerekir. Kısa ama düzenli çalışmalar çoğu kez bir defalık uzun çalışmadan daha kalıcı sonuç verir.’ Ana düşünce nedir?",["İstek her şeye yeter","Süre ne kadar uzun olursa o kadar iyidir","Süreklilik ve plan öğrenmede önemlidir","Öğrenme yalnızca yeteneğe bağlıdır","Arada bir çalışmak daha verimlidir"],2,"Planlı ve sürekli çalışmanın etkisi anlatılır."],
 ["‘Hatalarımızı görmek ilk bakışta moral bozabilir. Oysa hangi adımda yanıldığımızı bulmak aynı yanlışı tekrarlamamızı önler.’ Ana düşünce nedir?",["Hata yapan öğrenemez","Hatalar saklanmalıdır","Öğrenme denemeden olmaz","Hataları analiz etmek gelişimi destekler","Başarı yalnız şansa bağlıdır"],3,"Metin hatayı analiz etmeyi öğrenme fırsatı olarak değerlendirir."],
 ["‘Bir romanın kalıcı olmasını sağlayan tek unsur olayların ilgi çekiciliği değildir. Karakterlerin insana ait çelişkileri yansıtabilmesi de okuyucuyla bağ kurmasını sağlar.’ Ana düşünce?",["Romanlarda olay hiç olmamalıdır","Karakterlerin insani derinliği romanın etkisini artırır","Her roman aynı uzunluktadır","Yalnız tarihî romanlar okunur","Okur karakterleri hiç önemsemez"],1,"Olayın yanı sıra karakter derinliğine vurgu vardır."],
 ["‘Teknoloji ders çalışmayı kolaylaştırabilir; ancak bir uygulamanın bildirimleri öğrenme sırasında dikkati bölüyorsa verimi azaltabilir.’ Ana düşünce nedir?",["Teknoloji daima zararlıdır","Dijital araçlar ancak amaca uygun kullanıldığında yararlıdır","Bildirimler öğrenmeyi hızlandırır","Derslerde teknoloji tamamen yasaklanmalıdır","Teknoloji yalnız oyun içindir"],1,"İki yönlü değerlendirmede amaca uygun kullanımın önemi savunulur."]
],
"ayt-mat-1":[
 ["f(x)=3x-2 ise f(-1)+f(2) kaçtır?",["-3","-2","-1","0","1"],2,"f(-1)=-5, f(2)=4; toplam -1."],
 ["f(x)=x²+2x ve g(x)=x-1 ise (f∘g)(3) kaçtır?",["4","6","8","10","12"],2,"g(3)=2; f(2)=4+4=8."],
 ["f(x)=2x+7 doğrusal fonksiyonunun tersi nedir?",["(x+7)/2","(x-7)/2","2x-7","1/(2x+7)","x/2+7"],1,"y=2x+7 ⇒ x=(y-7)/2."],
 ["f(x)=x² fonksiyonu R→R tanımlandığında neden bire bir değildir?",["Tanım kümesi boş","f(1)=f(-1)","f(0) tanımsız","Her değer iki görüntü alır","Sürekli değildir"],1,"1 ile -1 farklı girdilerdir ama aynı görüntü 1 elde edilir."],
 ["f(x)=5x-10 için f(a)=0 ise a kaçtır?",["0","1","2","3","5"],2,"5a-10=0 ⇒ a=2."],
 ["f(x)=x+4 ve g(x)=2x ise (g∘f)(1) kaçtır?",["6","8","10","12","14"],2,"f(1)=5, g(5)=10."],
 ["f(x)=2x-3 ise f(f(2)) kaçtır?",["-3","-1","1","3","5"],1,"f(2)=1, f(1)=-1."]
],
"ayt-edebiyat-7":[
 ["‘Şair Evlenmesi’ adlı eserin yazarı kimdir?",["Namık Kemal","Şinasi","Ziya Paşa","Recaizade Mahmut Ekrem","Ahmet Mithat"],1,"İlk yerli tiyatro örneklerinden Şair Evlenmesi Şinasi'nindir."],
 ["‘Vatan yahut Silistre’ hangi Tanzimat sanatçısına aittir?",["Abdülhak Hamit Tarhan","Şinasi","Namık Kemal","Ziya Paşa","Tevfik Fikret"],2,"Eser Namık Kemal'indir ve vatan temasını işler."],
 ["Aşağıdaki kavramlardan hangisi Tanzimat I. Dönem edebiyatında özellikle öne çıkar?",["Sanat için sanat","Toplumdan kopuş","Hürriyet ve adalet","Bireysel düşler","Sürrealizm"],2,"İlk dönemde vatan, hürriyet, adalet gibi toplumsal temalar belirgindir."],
 ["‘İntibah’ romanını kim yazmıştır?",["Namık Kemal","Halit Ziya","Peyami Safa","Yakup Kadri","Ömer Seyfettin"],0,"İntibah Namık Kemal'in romanıdır."],
 ["Şinasi'nin Tanzimat edebiyatındaki faaliyetlerinden biri nedir?",["Garip şiirini kurmak","Gazete yayıncılığında öncü olmak","İkinci Yeni'yi başlatmak","Servetifünun'u yönetmek","Divan teşkilatını kurmak"],1,"Tercüman-ı Ahvâl gazetesinin yayınlanmasında öncü isimlerdendir."],
 ["Aşağıdakilerden hangisi Tanzimat I. Dönem sanatçılarından biridir?",["Ahmet Haşim","Ömer Seyfettin","Ziya Paşa","Tevfik Fikret","Orhan Veli"],2,"Ziya Paşa ilk dönem isimlerindendir."],
 ["Tanzimat edebiyatının başlangıcı için yaygın olarak hangi tarih esas alınır?",["1839","1856","1860","1876","1908"],2,"Tercüman-ı Ahvâl'in yayımlandığı 1860 edebiyat döneminin başlangıcı kabul edilir."]
]
};
export function curatedQuestions(topicId:string):Question[]{
 const raw=BANK[topicId]||[];
 return raw.map(([prompt,choices,answer,solution],i)=>({id:topicId+"-curated-"+i,topicId,prompt,choices,answer,solution,difficulty:i<2?"Kolay":i<5?"Orta":"Zor",kind:"kavrama"}));
}
export const CURATED_QUESTION_COUNT=Object.values(BANK).reduce((sum,values)=>sum+values.length,0);
export const TOPICS_WITH_CURATED_BANK=Object.keys(BANK).length;
