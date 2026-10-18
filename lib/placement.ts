import type {Question} from "./study";
import {TOPICS, type CourseId} from "./curriculum";

type Entry={course:CourseId;contains:string;prompt:string;answers:[string,string,string,string,string];correct:0|1|2|3|4;why:string;level:"Kolay"|"Orta"|"Zor"};
const items:Entry[]=[
["tyt-mat","Temel kavramlar","8 - 2 × (3 - 7) işleminin sonucu kaçtır?",["0","16","-16","-8","14"],1,"Parantez içi -4; 2×(-4)=-8; 8-(-8)=16.","Kolay"],
["tyt-mat","Temel kavramlar","a negatif tam sayı ve b pozitif çift sayıysa aşağıdakilerden hangisi kesinlikle pozitiftir?",["a×b","a-b","a²+b","a³","a"],2,"a² sıfırdan büyüktür; b de pozitif olduğundan toplam pozitiftir.","Orta"],
["tyt-mat","Rasyonel","2/3 - 1/4 işleminin sonucu kaçtır?",["1/12","5/12","1/2","7/12","3/7"],1,"Ortak payda 12: 8/12-3/12=5/12.","Kolay"],
["tyt-mat","Üslü","3² × 3³ / 3⁴ işleminin değeri nedir?",["1","3","9","27","81"],1,"Üsler 2+3-4=1, sonuç 3.","Kolay"],
["tyt-mat","Denklem","4(x-2)+3=2x+9 ise x kaçtır?",["4","5","6","7","8"],3,"4x-5=2x+9; 2x=14; x=7.","Orta"],
["tyt-mat","Yüzde","Etiketi 800 TL olan ürüne önce %25, ardından indirimli fiyatına %10 indirim uygulanıyor. Son fiyat kaç TL?",["520","530","540","560","580"],2,"İlk fiyat 800×0,75=600, ikinci indirim 600×0,9=540 TL.","Orta"],
["tyt-mat","Oran","Bir sınıftaki kızların erkeklere oranı 3/5'tir. Toplam 32 öğrenci olduğuna göre kız sayısı kaçtır?",["10","12","14","16","20"],1,"Toplam oran parçası 8; bir parça 32/8=4; kızlar 3×4=12.","Kolay"],
["tyt-mat","Hareket","90 km/sa hızla ilerleyen araç aynı yolu 60 km/sa hızla giden araçtan 1 saat önce tamamlıyor. Yol kaç km?",["120","150","180","210","240"],2,"Yol x: x/60-x/90=1 → x/180=1 → x=180.","Zor"],
["tyt-mat","Sayı problemleri","Bir sayının 3 katının 7 eksiği aynı sayının 2 katının 11 fazlasına eşitse sayı kaçtır?",["14","16","18","20","22"],2,"3x-7=2x+11 → x=18.","Orta"],
["tyt-mat","Mutlak","|x-3|=5 denklemini sağlayan sayıların toplamı kaçtır?",["-6","-2","0","6","8"],3,"x-3=5 → x=8 veya x-3=-5 → x=-2. Toplam 6.","Orta"],
["tyt-mat","Olasılık","Bir torbada 3 kırmızı, 2 mavi ve 5 beyaz bilye var. Rastgele çekilen bilyenin mavi OLMAMA olasılığı nedir?",["1/5","2/5","3/5","4/5","1/2"],3,"10 bilyeden 8'i mavi değildir; 8/10=4/5.","Orta"],
["tyt-mat","Grafik","Pazartesi 12, salı 18, çarşamba 15 kitap satılmıştır. İlk üç günün günlük ortalama satışı kaçtır?",["12","13","14","15","16"],3,"Toplam 45, üç güne bölünce ortalama 15.","Kolay"],
["tyt-turkce","Sözcükte anlam","‘Bu konunun üzerinde günlerdir duruyoruz.’ cümlesindeki ‘durmak’ hangi anlamda kullanılmıştır?",["Beklemek","Yürümeyi kesmek","Önem verip incelemek","İşe ara vermek","Ayakta bulunmak"],2,"‘Üzerinde durmak’ bir konuyu dikkatle ele alıp incelemektir.","Kolay"],
["tyt-turkce","Cümlede anlam","‘Daha iyi anlayabilmek için metni ikinci kez okudu.’ cümlesinde hangi anlam ilişkisi vardır?",["Neden-sonuç","Amaç-sonuç","Koşul-sonuç","Karşılaştırma","Varsayım"],1,"Okuma eyleminin amacı daha iyi anlamaktır; bu yüzden amaç-sonuçtur.","Kolay"],
["tyt-turkce","Paragrafta ana","‘Okuma alışkanlığı yalnızca sözcük dağarcığını genişletmez; insanın farklı hayatları tanımasına da yardımcı olur. Bu nedenle kitaplar, kişiye kendi sınırlarının dışına çıkma olanağı verir.’ Parçanın ana düşüncesi hangisidir?",["Her kitap aynı konuyu işler","Okumak farklı yaşamları anlamayı sağlar","Sözcük ezberlemek yeterlidir","Okuma yalnızca okulda yapılır","Kitaplar sadece eğlence içindir"],1,"Ana düşünce okumayla başka hayatları anlama ve bakış açısını genişletme ilişkisidir.","Orta"],
["tyt-turkce","Paragrafın yapı","‘Ancak bu görüş, yapılan son araştırmalarla çelişmektedir.’ cümlesinin bir paragrafın girişinde kullanılmamasının temel nedeni nedir?",["Çok kısa olması","Önceki bir yargıya göndermede bulunması","Örnek vermesi","Tanım içermesi","Nesnel olması"],1,"‘Ancak bu görüş’ ifadesi daha önce dile getirilmiş bir iddiaya dayanır.","Orta"],
["tyt-turkce","Düşünceyi geliştirme","‘Geçen yıl bu bölgede 120 bin fidan dikildi.’ cümlesi düşünceyi geliştirme yollarından hangisine örnektir?",["Tanık gösterme","Benzetme","Sayısal veriden yararlanma","Tanımlama","Öyküleme"],2,"Fidan sayısının rakamla belirtilmesi sayısal veriden yararlanmadır.","Kolay"],
["tyt-turkce","Ses bilgisi","Aşağıdaki sözcüklerden hangisinde ünlü düşmesi vardır?",["Kitabı","Burnu","Bahçeye","Rengi","Okuyor"],1,"Burun+u biçiminde orta hecenin ünlüsü düşer: burnu.","Orta"],
["tyt-turkce","Yazım","Aşağıdaki cümlelerden hangisinin yazımı doğrudur?",["Bende geleceğim.","Sen de bizimle gel.","Bugün ki hava güzel.","Herkez burada.","Bu işde zor."],1,"Bağlaç olan 'de' ayrı yazılır: Sen de bizimle gel.","Kolay"],
["tyt-turkce","Noktalama","‘Bu soruyu kim çözecek’ cümlesinin sonuna hangi noktalama işareti konur?",["Nokta","Virgül","İki nokta","Soru işareti","Noktalı virgül"],3,"Doğrudan soru cümlesinin sonunda soru işareti kullanılır.","Kolay"],
["tyt-turkce","Fiilimsi","‘Bahçede oynayan çocukları izledik.’ cümlesindeki ‘oynayan’ hangi tür fiilimsidir?",["İsim-fiil","Sıfat-fiil","Zarf-fiil","Çekimli fiil","Edat"],1,"-an sıfat-fiil ekidir ve ‘çocukları’ nitelemektedir.","Orta"],
["tyt-turkce","Cümlenin ögeleri","‘Öğretmen dün öğrencilere kitap dağıttı.’ cümlesinde ‘öğrencilere’ hangi ögedir?",["Özne","Belirtili nesne","Dolaylı tümleç","Zarf tümleci","Yüklem"],2,"‘Kime?’ sorusunun yanıtı yönelme hâlli dolaylı tümleçtir.","Orta"],
["tyt-turkce","Anlatım bozukluğu","‘İki arkadaş karşılıklı birbirleriyle konuştu.’ cümlesindeki anlatım bozukluğunun nedeni nedir?",["Özne eksikliği","Gereksiz sözcük","Zaman uyumsuzluğu","Çatı uyuşmazlığı","Nesne eksikliği"],1,"Karşılıklı ve birbirleriyle aynı anlamı yineler.","Orta"],
["tyt-turkce","Anlatım biçimleri","‘Dar sokakların iki yanında sarı boyalı evler uzanıyor, pencerelerden sarkan çiçekler taş duvarlara değiyordu.’ anlatımında hangi biçim ağır basar?",["Tartışma","Betimleme","Açıklama","Kanıtlama","Özetleme"],1,"Mekânın görsel özellikleri betimlenmiştir.","Orta"],
["ayt-mat","Fonksiyonlar","f(x)=2x-5 ise f(4)+f(-1) kaçtır?",["-4","-3","-2","0","2"],0,"f(4)=3 ve f(-1)=-7, toplam -4.","Kolay"],
["ayt-mat","Fonksiyonlar","f(x)=3x+1 ve g(x)=x² ise (f∘g)(2) kaçtır?",["10","11","12","13","14"],3,"g(2)=4 ve f(4)=3×4+1=13.","Orta"],
["ayt-mat","Polinomlar","P(x)=x³-2x+4 polinomunun x-2 ile bölümünden kalan kaçtır?",["4","6","8","10","12"],2,"Kalan P(2)=8-4+4=8.","Orta"],
["ayt-mat","İkinci dereceden","x²-7x+12=0 denkleminin köklerinin farkının mutlak değeri kaçtır?",["1","2","3","4","5"],0,"Kökler 3 ve 4; farkın mutlak değeri 1.","Orta"],
["ayt-mat","Parabol","y=x²-6x+5 parabolünün minimum değeri kaçtır?",["-5","-4","-3","0","5"],1,"Tepe noktası x=3, f(3)=9-18+5=-4.","Orta"],
["ayt-mat","Logaritma","log₃27 + log₂8 değeri kaçtır?",["4","5","6","7","8"],2,"log₃27=3 ve log₂8=3, toplam 6.","Orta"],
["ayt-mat","Türev","f(x)=x³-4x²+2 ise f'(2) kaçtır?",["-6","-4","-2","0","4"],1,"f'(x)=3x²-8x, x=2 için 12-16=-4.","Zor"],
["ayt-mat","İntegral","0'dan 3'e ∫2x dx kaçtır?",["3","6","9","12","18"],2,"∫2x dx=x²; 3²-0²=9.","Zor"],
["ayt-edebiyat","Geçiş","Kutadgu Bilig'in yazarı kimdir?",["Kaşgarlı Mahmud","Yusuf Has Hacib","Edip Ahmet Yükneki","Ahmet Yesevi","Ali Şir Nevai"],1,"Kutadgu Bilig, Yusuf Has Hacib tarafından yazılmıştır.","Kolay"],
["ayt-edebiyat","Tanzimat 1.","‘İntibah’ romanının yazarı kimdir?",["Şinasi","Namık Kemal","Recaizade Mahmut Ekrem","Abdülhak Hamit","Halit Ziya"],1,"İntibah, Namık Kemal'in romanıdır.","Kolay"],
["ayt-edebiyat","Servetifünun","‘Aşk-ı Memnu’ romanı hangi yazara aittir?",["Ahmet Mithat","Hüseyin Rahmi","Halit Ziya Uşaklıgil","Yakup Kadri","Peyami Safa"],2,"Aşk-ı Memnu, Halit Ziya Uşaklıgil'indir.","Kolay"],
["ayt-edebiyat","Cumhuriyet şiiri","Aşağıdakilerden hangisi Garip akımının şairlerindendir?",["Ahmet Haşim","Orhan Veli Kanık","Tevfik Fikret","Mehmet Akif","Cahit Sıtkı"],1,"Garip hareketinin üç kurucusundan biri Orhan Veli Kanık'tır.","Orta"]
].map(([course,contains,prompt,answers,correct,why,level])=>({course,contains,prompt,answers,correct,why,level})) as Entry[];
const byTopic=(course:CourseId,contains:string)=>TOPICS.find(t=>t.courseId===course&&t.title.toLocaleLowerCase("tr-TR").includes(contains.toLocaleLowerCase("tr-TR")));
export const PLACEMENT:Question[]=items.map((item,i)=>{
 const topic=byTopic(item.course,item.contains);
 if(!topic)throw new Error("Yerleştirme sorusu için konu eşleşmiyor: "+item.course+" / "+item.contains);
 return {id:"placement-"+(i+1),topicId:topic.id,prompt:item.prompt,choices:item.answers,answer:item.correct,solution:item.why,difficulty:item.level,kind:"kavrama"};
});
export const PLACEMENT_TIME_MINUTES=45;
export function calculatePlacement(answers:Record<number,number>){
 let correct=0,incorrect=0,empty=0;
 const area:{[key:string]:{correct:number;total:number}}={};
 PLACEMENT.forEach((q,i)=>{
  const c=byTopic(q.topicId.split("-").slice(0,2).join("-") as CourseId,""); 
  void c;
  const course=q.topicId.startsWith("tyt-mat")?"TYT Matematik":q.topicId.startsWith("tyt-turkce")?"TYT Türkçe":q.topicId.startsWith("ayt-mat")?"AYT Matematik":"AYT Edebiyat";
  area[course]??={correct:0,total:0};area[course].total++;
  if(answers[i]===undefined)empty++;else if(answers[i]===q.answer){correct++;area[course].correct++;}else incorrect++;
 });
 return {correct,incorrect,empty,net:correct-incorrect/4,area};
}
