import {COURSES,TOPICS,getTopic,topicsByCourse,type CourseId,type Topic} from "./curriculum";

export interface Question {id:string;topicId:string;prompt:string;choices:string[];answer:number;solution:string;difficulty:"Kolay"|"Orta"|"Zor";kind:"hesaplama"|"kavrama";}
export interface AnswerRecord {questionId:string;topicId:string;correct:boolean;selected:number;seconds:number;at:string;kind:"ders"|"deneme"|"tekrar";}
export interface ExamRecord {id:string;track:"TYT"|"AYT"|"Mini"|"Seviye";at:string;correct:number;incorrect:number;empty:number;net:number;seconds:number;}
export interface PlacementRecord {completedAt:string;correct:number;incorrect:number;empty:number;area:Record<string,{correct:number;total:number}>;}
export interface StudyState {answers:AnswerRecord[];exams:ExamRecord[];minutes:Record<string,number>;finished:Record<string,string>;activeTopicId?:string;placement?:PlacementRecord;};
export const EMPTY:StudyState={answers:[],exams:[],minutes:{},finished:{}};
const hash=(text:string)=>{let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);return h>>>0;};
const rand=(seed:number,max:number)=>hash(String(seed))%max;
const shuffle=<T,>(arr:T[],seed:number):T[]=>[...arr].sort((a,b)=>hash(JSON.stringify(a)+"-"+seed)-hash(JSON.stringify(b)+"-"+seed));
function pack(topic:Topic,n:number,prompt:string,correct:string,wrong:string[],solution:string,kind:Question["kind"]="hesaplama"):Question{
 const possible=[correct,...wrong.filter(x=>x!==correct)].filter((x,i,a)=>a.indexOf(x)===i);
 for(let x=1;possible.length<5;x++)possible.push("Seçenek "+x);
 const choices=shuffle(possible.slice(0,5),hash(topic.id+"-"+n));
 return {id:topic.id+"-"+n,topicId:topic.id,prompt,choices,answer:choices.indexOf(correct),solution,difficulty:n%5===4?"Zor":n%3===2?"Orta":"Kolay",kind};
}
const numeric=(t:Topic,n:number,stem:string,value:number,explanation:string,unit="")=>{
 const v=Number(value.toFixed(4)); const dif=Math.max(1,Math.round(Math.abs(v)*.1));
 return pack(t,n,stem,String(v)+unit,[v+dif,v-dif,v+2*dif,v-2*dif].map(x=>String(Number(x.toFixed(4)))+unit),explanation);
};
function mathQuestion(t:Topic,n:number):Question|null{
 const a=2+rand(hash(t.id+"a"+n),12), b=2+rand(hash(t.id+"b"+n),9), c=2+rand(hash(t.id+"c"+n),8);
 const title=t.title.toLocaleLowerCase("tr-TR");
 if(title.includes("temel kavram"))return numeric(t,n,`İşlem önceliğine göre ${a} + ${b} × ${c} kaçtır?`,a+b*c,`Önce çarpma yapılır: ${b}×${c}=${b*c}; ardından ${a} eklenir.`);
 if(title.includes("basamak"))return numeric(t,n,`${a%9+1}${b%10}${c%10} sayısının onlar basamağındaki rakamın basamak değeri kaçtır?`,b%10*10,"Onlar basamağındaki rakam 10 ile çarpılır.");
 if(title.includes("bölme ve bölünebil"))return numeric(t,n,`${a*b+c} sayısının ${a} ile bölümünden kalan kaçtır?`,c%a,`Bölümde kalan ${c} değerinin ${a} ile bölümünden kalanla aynıdır.`);
 if(title.includes("ebob")){const k=1+rand(n+13,4);return numeric(t,n,`${6*k} ve ${9*k} sayılarının EBOB'u kaçtır?`,3*k,`EBOB(6,9)=3; iki sayı ${k} ile çarpıldığında EBOB da aynı katla artar.`);}
 if(title.includes("rasyonel")||title.includes("kesir problem"))return pack(t,n,`Bir bütünün ${a}/${a*b} kadarı kullanılırsa geriye hangi kesir kalır?`,`${b-1}/${b}`,[`1/${b}`,`${b}/${b}`,`${b+1}/${b}`,`${b-2}/${b}`],`${a}/${a*b}=1/${b}. Kalan 1-1/${b}=(${b-1})/${b}.`);
 if(title.includes("eşitsizlik"))return numeric(t,n,`${b}x + ${c} < ${a*b+c} eşitsizliğini sağlayan x değerleri hangi sayıdan küçüktür?`,a,"Her iki taraftan sabit terim çıkarılıp pozitif katsayıya bölünür.");
 if(title.includes("mutlak"))return numeric(t,n,`|-${a}| + |${b}| kaçtır?`,a+b,"Mutlak değer işareti sayıyı sıfıra uzaklığına, yani negatif olmayan büyüklüğe dönüştürür.");
 if(title.includes("üslü")||title.includes("üstel"))return numeric(t,n,`2^${b%3+1} × 2^${c%3+1} kaçtır?`,2**(b%3+c%3+2),"Aynı tabanlı çarpımda üsler toplanır.");
 if(title.includes("köklü"))return numeric(t,n,`√(${a*a}) kaçtır?`,a,"Pozitif sayıların tam karelerinin karekökü pozitif tabandır.");
 if(title.includes("çarpanlara"))return pack(t,n,`x²-${a*a} ifadesinin çarpanlara ayrılmış biçimi hangisidir?`,`(x-${a})(x+${a})`,[`(x+${a})(x+${a})`,`(x-${a})(x-${a})`,`x(x-${a})`,`(x-${a})(x+${b})`],"İki kare farkı özdeşliği: x²-a²=(x-a)(x+a).");
 if(title.includes("denklem")&&!title.includes("ikinci"))return numeric(t,n,`${b}x+${c}=${a*b+c} ise x kaçtır?`,a,`Önce ${c} çıkar, sonra ${b}'ye böl.`);
 if(title.includes("oran"))return numeric(t,n,`${b} kalem ${a*b} TL ise ${c} kalem kaç TL'dir?`,a*c,`Bir kalemin fiyatı ${a} TL; ${c} kalem ${a*c} TL.`);
 if(title.includes("sayı problem"))return numeric(t,n,`Bir sayının ${b} katının ${c} fazlası ${a*b+c} ise sayı kaçtır?`,a,"Bilinmeyeni x seç, verilen eşitliği kur ve çöz.");
 if(title.includes("yaş"))return numeric(t,n,`Ayşe ${a} yaşında, kardeşi ${a+b} yaşında. 7 yıl sonraki yaş farkları kaç olur?`,b,"Yaş farkı zaman geçse de değişmez.");
 if(title.includes("yüzde")||title.includes("kâr")||title.includes("indirim"))return numeric(t,n,`${a*100} TL'nin %${b*5}'i kaç TL'dir?`,a*b*5,"Yüzde hesaplamak için tutarı yüzde/100 ile çarp.");
 if(title.includes("karışım"))return numeric(t,n,`${a*10} litre %${b*5} tuzlu çözeltide kaç litre tuz vardır?`,a*b*0.5,"Çözelti miktarı × yüzde / 100.");
 if(title.includes("hareket"))return numeric(t,n,`Saatte ${a*10} km hızla giden araç ${b} saatte kaç km gider?`,a*b*10,"Yol=hız×zaman.");
 if(title.includes("işçi")||title.includes("havuz"))return numeric(t,n,`Bir işçi günde ${a} ürün, diğeri ${b} ürün üretiyor. Birlikte 3 günde kaç ürün üretirler?`,3*(a+b),"Günlük üretim hızları toplanıp gün sayısıyla çarpılır.");
 if(title.includes("grafik")||title.includes("istatistik"))return numeric(t,n,`${a}, ${b} ve ${c} sayılarının toplamı kaçtır?`,a+b+c,"Değerler toplanır; ortalama istenirse üçe bölünür.");
 if(title.includes("kümeler")||title.includes("temel kümeler"))return numeric(t,n,`A kümesinde ${a} eleman, B kümesinde ${b} eleman ve kesişimlerinde ${c%Math.min(a,b)} eleman varsa birleşimin eleman sayısı?`,a+b-c%Math.min(a,b),"Birleşim=|A|+|B|-|A∩B|.");
 if(title.includes("permütasyon"))return numeric(t,n,`4 farklı kitap kaç farklı biçimde sıralanabilir?`,24,"4!=4×3×2×1=24.");
 if(title.includes("kombinasyon"))return numeric(t,n,`5 kişiden 2 kişilik ekip kaç şekilde seçilir?`,10,"C(5,2)=5×4/2=10.");
 if(title.includes("olasılık"))return pack(t,n,"Adil altı yüzlü zarın çift gelme olasılığı kaçtır?","1/2",["1/3","1/6","2/3","5/6"],"Çift sonuçlar 2,4,6; 3/6=1/2.");
 if(title.includes("fonksiyon"))return numeric(t,n,`f(x)=${a}x+${b} ise f(${c}) kaçtır?`,a*c+b,"x yerine verilen değer yazılıp işlem yapılır.");
 if(title.includes("polinom"))return numeric(t,n,`P(x)=x²+${a}x+${b} ise P(${c}) kaçtır?`,c*c+a*c+b,"x yerine verilen sayıyı koy.");
 if(title.includes("ikinci dereceden"))return pack(t,n,`x²-${a+b}x+${a*b}=0 denkleminin kökleri hangileridir?`,`${a} ve ${b}`,[`${a} ve -${b}`,`-${a} ve ${b}`,`${a+1} ve ${b+1}`,`${a+b} ve 0`],"Çarpanlara ayır: (x-a)(x-b)=0, kökler a ve b.");
 if(title.includes("parabol"))return numeric(t,n,`y=x²-${2*a}x+3 parabolünün tepe noktasının x koordinatı kaçtır?`,a,"x=-b/(2a) formülünü kullan.");
 if(title.includes("logaritma"))return numeric(t,n,`log₂(${2**(b%5+1)}) kaçtır?`,b%5+1,"log₂(2^k)=k.");
 if(title.includes("diziler"))return numeric(t,n,`İlk terimi ${a}, ortak farkı ${b} olan aritmetik dizinin 5. terimi kaçtır?`,a+4*b,"a_n=a_1+(n-1)d.");
 if(title.includes("binom"))return numeric(t,n,`(x+${a})² açılımında x'in katsayısı kaçtır?`,2*a,"(x+a)²=x²+2ax+a².");
 if(title.includes("karmaşık"))return pack(t,n,`(${a}+2i)+(${b}-i) toplamı kaçtır?`,`${a+b}+i`,[`${a+b}-i`,`${a+b}+3i`,`${a-b}+i`,`${a+b+1}+i`],"Gerçel ve sanal kısımlar ayrı ayrı toplanır.");
 if(title.includes("limit"))return numeric(t,n,`lim (x→${b}) [${a}x+${c}] kaçtır?`,a*b+c,"Sürekli polinomda yerine koyma yapılır.");
 if(title.includes("süreklilik"))return pack(t,n,"f(x)=x²+1 fonksiyonu x=2 noktasında sürekli midir?","Evet",["Hayır","Yalnız soldan","Yalnız sağdan","Tanımsız"],"Polinomlar tüm gerçel sayılarda süreklidir.","kavrama");
 if(title.includes("türev"))return numeric(t,n,`f(x)=${a}x²+${b}x ise f'(1) kaçtır?`,2*a+b,"Türev: f'(x)=2ax+b; x=1 yaz.");
 if(title.includes("integral"))return numeric(t,n,`0'dan ${b}'ye ∫2x dx kaçtır?`,b*b,"İlkel fonksiyon x²; üst sınırdan alt sınır çıkarılır.");
 if(title.includes("belirli integral"))return numeric(t,n,`0'dan ${b}'ye ∫2x dx kaçtır?`,b*b,"İlkel fonksiyon x²; üst sınırdan alt sınır çıkarılır.");
 if(title.includes("analitik doğru"))return numeric(t,n,`(0,${a}) ve (2,${a+2*b}) noktalarından geçen doğrunun eğimi kaçtır?`,b,"m=(y2-y1)/(x2-x1).");
 if(title.includes("analitik çember"))return numeric(t,n,`x²+y²=${a*a} çemberinin yarıçapı kaçtır?`,a,"x²+y²=r² denkleminde yarıçap r'dir.");
 if(title.includes("doğruda açı"))return numeric(t,n,`${a*10}° ile bütünler açı kaç derecedir?`,180-a*10,"Bütünler açılar toplamı 180°'dir.","°");
 if(title.includes("üçgende aç"))return numeric(t,n,`Bir üçgenin iki açısı ${a*5}° ve ${b*5}° ise üçüncü açı kaç derecedir?`,180-(a+b)*5,"Üçgenin iç açılar toplamı 180°'dir.","°");
 if(title.includes("üçgende alan"))return numeric(t,n,`Tabanı ${a*2} cm, yüksekliği ${b} cm olan üçgenin alanı kaç cm²?`,a*b,"Alan=taban×yükseklik/2.");
 if(title.includes("dörtgenler"))return numeric(t,n,`Kenarları ${a} ve ${b} olan dikdörtgenin alanı kaçtır?`,a*b,"Dikdörtgen alanı kısa×uzun kenardır.");
 if(title.includes("dairede alan"))return pack(t,n,`Yarıçapı ${a} cm olan dairenin alanı kaç cm²'dir?`,`${a*a}π`,[`${2*a}π`,`${a}π`,`${2*a*a}π`,`${a*a+2}π`],"Alan=πr², r² ile π çarpılır.");
 if(title.includes("çokgen"))return numeric(t,n,`${a+3} kenarlı konveks çokgenin iç açılar toplamı kaç derecedir?`,(a+1)*180,"(n-2)×180° kuralı uygulanır.","°");
 if(title.includes("katı cisim")||title.includes("uzay geometri"))return numeric(t,n,`Ayrıt uzunluğu ${a} olan küpün hacmi kaçtır?`,a**3,"Küp hacmi a³'tür.");
 return null;
}
function conceptQuestion(t:Topic,n:number):Question{
 const peers=topicsByCourse(t.courseId).filter(p=>p.id!==t.id);
 const alternatives=shuffle(peers,n+hash(t.id));
 const answer=t.solution.trim();
 const wrong=alternatives.map(p=>p.solution.trim()).filter(x=>x!==answer&&x.length<130);
 const which=n%3;
 if(which===1){
  const correct=t.principles[0]; const wrongStatements=alternatives.map(p=>p.principles[0]).filter(x=>x!==correct);
  return pack(t,n,`Aşağıdaki ifadelerden hangisi “${t.title}” konusu için temel bir kuraldır?`,correct,wrongStatements.slice(0,4),t.summary+" "+correct,"kavrama");
 }
 if(which===2){
  const correct=t.title; const wrongTitles=alternatives.map(p=>p.title);
  return pack(t,n,`Şu açıklama hangi konuya aittir? “${t.summary}”`,correct,wrongTitles.slice(0,4),t.summary,"kavrama");
 }
 return pack(t,n,t.worked,answer,wrong.slice(0,4),t.solution,"kavrama");
}
export const makeQuestion=(t:Topic,index:number):Question=>{
 const value=(t.courseId.endsWith("mat")||t.courseId==="tyt-geo")?mathQuestion(t,index):null;
 return value??conceptQuestion(t,index);
};
export const makeQuiz=(topic:Topic,count=12,seed=0):Question[]=>Array.from({length:count},(_,i)=>makeQuestion(topic,seed+i));
export function makeExam(track:"TYT"|"AYT"|"Mini",seed:number):Question[]{
 const subjects:CourseId[]= track==="TYT" ? ["tyt-turkce","tyt-mat","tyt-tarih","tyt-cografya","tyt-felsefe","tyt-din","tyt-fizik","tyt-kimya","tyt-biyoloji","tyt-geo"] : track==="AYT"? ["ayt-mat","ayt-edebiyat","ayt-tarih","ayt-cografya"] : ["tyt-mat","tyt-turkce","ayt-mat","ayt-edebiyat","ayt-tarih","ayt-cografya"];
 const distribution:Record<string,number>= track==="TYT" ? {"tyt-turkce":40,"tyt-mat":32,"tyt-geo":8,"tyt-tarih":5,"tyt-cografya":5,"tyt-felsefe":5,"tyt-din":5,"tyt-fizik":7,"tyt-kimya":7,"tyt-biyoloji":6} : track==="AYT" ? {"ayt-mat":40,"ayt-edebiyat":24,"ayt-tarih":10,"ayt-cografya":6} : {"tyt-mat":7,"tyt-turkce":7,"ayt-mat":7,"ayt-edebiyat":5,"ayt-tarih":2,"ayt-cografya":2};
 let result:Question[]=[];
 subjects.forEach((course,k)=>{const ts=topicsByCourse(course);for(let i=0;i<(distribution[course]||0);i++){const topic=ts[(i+seed+k*3)%ts.length];result.push(makeQuestion(topic,seed*101+i+k*1000));}});
 return result.map((q,i)=>({...q,id:track+"-"+seed+"-"+i}));
}
export function topicStats(state:StudyState,topicId:string){
 const records=state.answers.filter(a=>a.topicId===topicId);
 const last=records.slice(-20),correct=last.filter(a=>a.correct).length;
 const accuracy=last.length?Math.round(correct/last.length*100):null;
 const recent=last.at(-1)?.at;
 const days=recent?Math.max(0,Math.floor((Date.now()-new Date(recent).getTime())/86400000)):999;
 const mastery=accuracy===null?0:Math.min(100,Math.round(accuracy*.8+Math.min(last.length,10)*2));
 const baselineMistake=Boolean(state.placement)&&records.some(a=>a.questionId.startsWith("placement-")&&!a.correct);
 const laterPractice=records.filter(a=>!a.questionId.startsWith("placement-"));
 // Seviye testindeki tek yanlış, kesin başarısızlık değil; teyit gerektiren önceliktir.
 const needsValidation=baselineMistake&&laterPractice.length<3;
 return {count:records.length,correct,accuracy,days,mastery,needsValidation,weak:(records.length>=3&&mastery<72)||needsValidation};
}
export function weakTopics(state:StudyState):Topic[]{
 return TOPICS.filter(t=>topicStats(state,t.id).weak).sort((a,b)=>topicStats(state,a.id).mastery-topicStats(state,b.id).mastery);
}
export function dueTopics(state:StudyState):Topic[]{
 return TOPICS.filter(t=>{const s=topicStats(state,t.id);return s.count>0&&(s.weak||([1,3,7,14].some(d=>s.days===d)&&s.mastery<92))}).sort((a,b)=>topicStats(state,a.id).mastery-topicStats(state,b.id).mastery);
}
const START="2026-10-19", END="2027-06-20";
export const START_DATE=START,END_DATE=END;
export function dateKey(value:Date=new Date()){return [value.getFullYear(),String(value.getMonth()+1).padStart(2,"0"),String(value.getDate()).padStart(2,"0")].join("-");}
const dateUTC=(date:string)=>new Date(date+"T12:00:00Z");
export function dayDiff(date:string){return Math.floor((dateUTC(date).getTime()-dateUTC(START).getTime())/86400000);}
export function selectedDate(date:string){return date<START?START:date>END?END:date;}
export interface StudyBlock {id:string;courseId:CourseId|"review"|"mock";title:string;topicId?:string;minutes:number;type:"konu"|"tekrar"|"deneme";}
const WEEK: (CourseId|"review"|"mock")[][]=[
 ["tyt-mat","tyt-mat","tyt-turkce","ayt-edebiyat"],
 ["tyt-mat","ayt-mat","tyt-tarih","tyt-cografya"],
 ["review","tyt-mat","ayt-mat","tyt-turkce"],
 ["tyt-mat","ayt-mat","ayt-tarih","tyt-geo"],
 ["ayt-mat","ayt-edebiyat","ayt-cografya","tyt-mat"],
 ["mock","review","tyt-fizik","tyt-kimya"]
];
const ELECTIVES:CourseId[]=["tyt-fizik","tyt-kimya","tyt-biyoloji","tyt-felsefe","tyt-din"];
function positionFor(courseId:CourseId,dateIndex:number,slot:number):number{
 let position=0;
 for(let day=0;day<dateIndex;day++){
  const wk=Math.floor(day/7), dow=day%7;
  if(dow===6)continue;
  WEEK[dow].forEach((c,j)=>{
   const curr = c==="tyt-fizik"&&j===2?ELECTIVES[wk%ELECTIVES.length]:c==="tyt-kimya"&&j===3?ELECTIVES[(wk+3)%ELECTIVES.length]:c;
   if(curr===courseId)position++;
  });
 }
 return position+slot;
}
export function dailyPlan(date:string,state:StudyState):StudyBlock[]{
 const index=dayDiff(selectedDate(date));if(index<0||index%7===6)return [];
 const week=Math.floor(index/7),weekday=index%7;
 const queue=WEEK[weekday].map((course,i)=>course==="tyt-fizik"&&weekday===5&&i===2?ELECTIVES[week%ELECTIVES.length]:course==="tyt-kimya"&&weekday===5&&i===3?ELECTIVES[(week+3)%ELECTIVES.length]:course);
 const repeats=dueTopics(state),weak=weakTopics(state);
 return queue.map((course,i)=>{
  if(course==="review"){const t=(repeats[i%Math.max(1,repeats.length)]||weak[i%Math.max(1,weak.length)]) ?? TOPICS[(week+i)%TOPICS.length];return {id:date+"-"+i,courseId:"review" as const,title:"Eksik pekiştirme · "+t.title,topicId:t.id,minutes:45,type:"tekrar" as const};}
  if(course==="mock")return {id:date+"-"+i,courseId:"mock" as const,title:"Haftalık 30 soruluk mini deneme",minutes:45,type:"deneme" as const};
  const courseId=course as CourseId;const ts=topicsByCourse(courseId);
  const nth=positionFor(courseId,index,queue.slice(0,i).filter(c=>c===courseId).length);
  const pos=(nth+ (week>16&&week%4===0 ? week:0))%ts.length;
  const t=ts[pos];
  return {id:date+"-"+i,courseId,title:t.title,topicId:t.id,minutes:45,type:"konu" as const};
 });
}
export function monthPlan(state:StudyState){
 const result:{week:number;from:string;topics:number;done:number}[]=[];
 for(let w=0;w<35;w++){
  const day=new Date(dateUTC(START).getTime()+w*7*86400000).toISOString().slice(0,10);
  const blocks=dailyPlan(day,state);if(day>END)break;
  result.push({week:w+1,from:day,topics:blocks.length,done:blocks.filter(b=>b.topicId&&state.finished[b.id]).length});
 }
 return result;
}
export const currentWeek=(date:string)=>Math.min(35,Math.max(1,Math.floor(Math.max(0,dayDiff(date))/7)+1));
export const completionPercent=(state:StudyState)=>Math.round(Object.keys(state.finished).length/(35*6*4)*100);
export function formatDuration(seconds:number){return Math.floor(seconds/60)+":"+String(seconds%60).padStart(2,"0");}
