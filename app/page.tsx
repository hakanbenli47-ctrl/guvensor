"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import type {User} from "@supabase/supabase-js";
import AccountGate from "../components/AccountGate";
import {supabase,PROGRESS_TABLE} from "../lib/cloud";
import {PLACEMENT,calculatePlacement,PLACEMENT_TIME_MINUTES} from "../lib/placement";
import {detailed,DETAILED_LESSON_COUNT} from "../lib/deep-lessons";
import {COURSES,TOPICS,getTopic,getCourse,topicsByCourse,type CourseId,type Topic} from "../lib/curriculum";
import {EMPTY,END_DATE,START_DATE,completionPercent,currentWeek,dailyPlan,missedBlocks,dateKey,dueTopics,formatDuration,makeExam,makeQuiz,monthPlan,selectedDate,topicStats,weakTopics,type Question,type StudyBlock,type StudyState,type AnswerRecord} from "../lib/study";
type Page="home"|"subjects"|"calendar"|"exams"|"analytics"|"settings";
type Mode="ders"|"tekrar"|"deneme";
type Session={questions:Question[];step:"learn"|"quiz"|"result";index:number;selected:Record<number,number>;mode:Mode;topicId?:string;blockId?:string;examType?:"Mini"|"TYT"|"AYT"|"Seviye";startedAt:number;questionStartedAt:number;pausedAt?:number;lessonSection?:number;};
const STORAGE="yks-koc-2027-progress-v1", SESSION="yks-koc-2027-session-v1";
const prettyDate=(iso:string)=>new Date(iso+"T12:00:00").toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric",weekday:"long"});
const weekDays=["Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi","Pazar"];
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(value,max));
function lessonClock(start:string|undefined,slot:number){
 if(!start||!/^[0-9]{2}:[0-9]{2}$/.test(start))return null;
 const [h,m]=start.split(":").map(Number);
 const mins=(h*60+m+slot*55)%1440;
 const end=(mins+45)%1440;
 const fmt=(value:number)=>String(Math.floor(value/60)).padStart(2,"0")+":"+String(value%60).padStart(2,"0");
 return fmt(mins)+"–"+fmt(end);
}
const safeState=(x:unknown):StudyState=>{
 if(!x||typeof x!=="object")return EMPTY;
 const o=x as Partial<StudyState>;
 return {answers:Array.isArray(o.answers)?o.answers:[],exams:Array.isArray(o.exams)?o.exams:[],minutes:typeof o.minutes==="object"&&o.minutes?o.minutes:{},finished:typeof o.finished==="object"&&o.finished?o.finished:{},activeTopicId:typeof o.activeTopicId==="string"?o.activeTopicId:undefined,placement:o.placement&&typeof o.placement==="object"?o.placement:undefined,startTime:typeof o.startTime==="string"?o.startTime:undefined};
};
function MiniIcon({name}:{name:string}){const paths:Record<string,string>={home:"M3 10.5 12 3l9 7.5V21H3V10.5zm6 10.5v-7h6v7",book:"M3 5c3-2 6-2 9 0v16c-3-2-6-2-9 0V5zm9 0c3-2 6-2 9 0v16c-3-2-6-2-9 0",calendar:"M4 6h16v15H4zM4 10h16M8 3v6M16 3v6",award:"M12 3a7 7 0 1 0 0 14 7 7 0 1 0 0-14ZM8 16l-1 6 5-3 5 3-1-6",chart:"M4 20V12h4v8M10 20V4h4v16M16 20v-9h4v9",settings:"M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.7-2.1 2.1m-8.6 8.6-2.1 2.1M12 8a4 4 0 1 0 0 8 4 4 0 1 0 0-8",arrow:"M5 12h14m-6-6 6 6-6 6",clock:"M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18zm0 4v5l4 2",check:"M4 12l5 5L20 6",play:"M8 5l11 7-11 7z",back:"M19 12H5m6-6-6 6 6 6"};return <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]||paths.book}/></svg>}
export default function Home(){return <AccountGate>{user=><Dashboard key={user.id} user={user}/>}</AccountGate>}
function Dashboard({user}:{user:User}){
 const [page,setPage]=useState<Page>("home");
 const [progress,setProgress]=useState<StudyState>(EMPTY);
 const [hydrated,setHydrated]=useState(false);
 const [today,setToday]=useState(dateKey());
 const [course,setCourse]=useState<CourseId>("tyt-mat");
 const [search,setSearch]=useState("");
 const [session,setSession]=useState<Session|null>(null);
 const [sessionHidden,setSessionHidden]=useState(false);
 const [showAllMakeups,setShowAllMakeups]=useState(false);
 const [now,setNow]=useState(Date.now());
 const [examReport,setExamReport]=useState<{correct:number;incorrect:number;empty:number;net:number;track:string}|null>(null);
 const [notice,setNotice]=useState("");
 const [loadError,setLoadError]=useState("");
 const [syncError,setSyncError]=useState("");
 const [syncStatus,setSyncStatus]=useState<"loading"|"saving"|"saved">("loading");
 const [retrySave,setRetrySave]=useState(0);
 const saveQueue=useRef<Promise<void>>(Promise.resolve());
 useEffect(()=>{
  let alive=true;
  const client=supabase;
  if(!client){setLoadError("Bulut bağlantısı yapılandırılmadı.");return;}
  async function load(){
   try{
    const {data,error}=await client!.from(PROGRESS_TABLE).select("payload,updated_at").eq("user_id",user.id).maybeSingle();
    if(!alive)return;
    if(error)throw error;
    let incoming:StudyState=EMPTY,restored:Session|null=null;
    if(data?.payload && typeof data.payload==="object"){
      const payload=data.payload as {progress?:unknown;session?:unknown};
      incoming=safeState(payload.progress);
      const old=payload.session as Session|null;
      if(old&&Array.isArray(old.questions)&&old.questions.length&&old.step!=="result")restored=old;
    }else{
      try{
        const legacy=localStorage.getItem(STORAGE);
        if(legacy&&window.confirm("Bu cihazdaki eski çalışma kayıtlarını hesabına aktarmak ister misin?")){
          incoming=safeState(JSON.parse(legacy));
          const raw=localStorage.getItem(SESSION);
          if(raw){const previous=JSON.parse(raw) as Session;if(previous?.questions?.length&&previous.step!=="result")restored=previous;}
        }
      }catch{}
    }
    if(!alive)return;
    setProgress(incoming);setSession(restored?{...restored,pausedAt:restored.pausedAt??(data?.updated_at?new Date(data.updated_at).getTime():Date.now())}:null);setSessionHidden(Boolean(restored));setToday(dateKey());setHydrated(true);setLoadError("");setSyncStatus("saved");
   }catch(err){if(alive)setLoadError(err instanceof Error?err.message:"Çalışma verilerin buluttan yüklenemedi.");}
  }
  void load();
  return()=>{alive=false;};
 },[user.id]);
 useEffect(()=>{
  if(!hydrated||!supabase)return;
  const client=supabase,payload={version:1,progress,session:session?.step==="result"?null:session};
  setSyncStatus("saving");
  const timer=setTimeout(()=>{
    saveQueue.current=saveQueue.current.catch(()=>undefined).then(async()=>{
      const {error}=await client.from(PROGRESS_TABLE).upsert({user_id:user.id,payload,updated_at:new Date().toISOString()},{onConflict:"user_id"});
      if(error)throw error;
    });
    void saveQueue.current.then(()=>{setSyncStatus("saved");setSyncError("");}).catch(err=>setSyncError(err instanceof Error?err.message:"Buluta kaydedilemedi."));
  },400);
  return()=>clearTimeout(timer);
 },[progress,session,hydrated,user.id,retrySave]);
 async function logout(){
  if(!supabase)return;
  await saveQueue.current.catch(()=>undefined);
  const {error}=await supabase.from(PROGRESS_TABLE).upsert({user_id:user.id,payload:{version:1,progress,session:session?.step==="result"?null:session},updated_at:new Date().toISOString()},{onConflict:"user_id"});
  if(error){setSyncError("Çıkış öncesi kayıt başarısız: "+error.message);return;}
  await supabase.auth.signOut();
 }
 useEffect(()=>{const timer=setInterval(()=>{setNow(Date.now());setToday(dateKey())},1000);return()=>clearInterval(timer)},[]);
 const day=selectedDate(today);
 const plan=useMemo(()=>dailyPlan(day,progress),[day,progress]);
 const makeups=useMemo(()=>missedBlocks(today,progress),[today,progress]);
 const weak=useMemo(()=>weakTopics(progress),[progress]);
 const due=useMemo(()=>dueTopics(progress),[progress]);
 const current=plan.find(b=>!progress.finished[b.id])||plan[0];
 const answeredCount=progress.answers.length;
 const solvedTopics=new Set(progress.answers.map(a=>a.topicId)).size;
 const studyMinutes=Object.values(progress.minutes).reduce((a,b)=>a+b,0);
 const totalCorrect=progress.answers.filter(a=>a.correct).length;
 const accuracy=answeredCount?Math.round(totalCorrect/answeredCount*100):0;
 const maxDaily=180;
 const dayMinutes=progress.minutes[day]||0;
 const activeTopic=session?.topicId?getTopic(session.topicId):undefined;
 const expanded=activeTopic?detailed(activeTopic.id):undefined;
 const activeQ=session?.step==="quiz"?session.questions[session.index]:undefined;
 const examTimeLimit=session?.examType==="TYT"?165*60:session?.examType==="AYT"?180*60:session?.examType==="Mini"?45*60:45*60;
 const elapsed=session?Math.max(0,Math.floor(((session.pausedAt??now)-session.startedAt)/1000)):0;
 const timeLeft=Math.max(0,examTimeLimit-elapsed);
 const questionTotal=session?.questions.length||0;
 const answered=session?Object.keys(session.selected).length:0;
 function pauseLesson(){setSession(s=>s?{...s,pausedAt:Date.now()}:s);setSessionHidden(true);}
 function resumeLesson(){
  setSession(s=>s?{...s,startedAt:s.startedAt+(s.pausedAt?Date.now()-s.pausedAt:0),questionStartedAt:s.questionStartedAt+(s.pausedAt?Date.now()-s.pausedAt:0),pausedAt:undefined}:s);
  setSessionHidden(false);setPage("home");
 }
 function okayToReplaceSession(){return !session||session.step==="result"||window.confirm("Yarım kalan bir oturumun var. Yeni bir oturum başlatırsan mevcut yarım oturumun kaydı silinecek. Devam edilsin mi?");}
 function startTopic(topic:Topic,block?:StudyBlock,mode:Mode="ders"){
  if(!okayToReplaceSession())return;
  setSessionHidden(false);
  const n=progress.answers.filter(a=>a.topicId===topic.id).length;
  setSession({questions:makeQuiz(topic,mode==="tekrar"?15:12,n),step:"learn",index:0,selected:{},mode,topicId:topic.id,blockId:block?.id,startedAt:Date.now(),questionStartedAt:Date.now()});
  setExamReport(null);setPage("home");
 }
 function startExam(track:"Mini"|"TYT"|"AYT",block?:StudyBlock){
  if(!okayToReplaceSession())return;
  setSessionHidden(false);
  const seed=progress.exams.length+1;
  setSession({questions:makeExam(track,seed),step:"quiz",index:0,selected:{},mode:"deneme",blockId:block?.id,examType:track,startedAt:Date.now(),questionStartedAt:Date.now()});
  setExamReport(null);setPage("home");
 }
 function startPlacement(){if(!okayToReplaceSession())return;setSessionHidden(false);setSession({questions:PLACEMENT,step:"quiz",index:0,selected:{},mode:"deneme",examType:"Seviye",startedAt:Date.now(),questionStartedAt:Date.now()});setExamReport(null);setPage("home");}
 function startBlock(block:StudyBlock){
  if(block.type==="deneme"){startExam("Mini",block);return;}
  const t=getTopic(block.topicId||"");if(t)startTopic(t,block,block.type==="tekrar"?"tekrar":"ders");
 }
 function finish(s:Session){
  const records:AnswerRecord[]=s.questions.map((q,i)=>({questionId:q.id,topicId:q.topicId,correct:s.selected[i]===q.answer,selected:s.selected[i]??-1,seconds:Math.round((Date.now()-s.startedAt)/1000/Math.max(s.questions.length,1)),at:new Date().toISOString(),kind:s.mode}));
  const correct=records.filter(r=>r.correct).length,incorrect=records.filter(r=>r.selected!==-1&&!r.correct).length,empty=records.filter(r=>r.selected===-1).length;
  const report={correct,incorrect,empty,net:Math.round((correct-incorrect*.25)*100)/100,track:s.examType||"Konu testi"};
  setExamReport(report);
  const minutes=clamp(Math.round((Date.now()-s.startedAt)/60000),1,s.examType==="TYT"?165:s.examType==="AYT"?180:45);
  const date=dateKey();
  const assessment=s.examType==="Seviye"?calculatePlacement(s.selected):null;
  setProgress(prev=>({...prev,answers:[...prev.answers,...records],exams:s.examType?[...prev.exams,{id:crypto.randomUUID(),track:s.examType,at:new Date().toISOString(),correct,incorrect,empty,net:report.net,seconds:Math.floor((Date.now()-s.startedAt)/1000)}]:prev.exams,minutes:{...prev.minutes,[date]:(prev.minutes[date]||0)+minutes},finished:s.blockId?{...prev.finished,[s.blockId]:new Date().toISOString()}:prev.finished,activeTopicId:s.topicId,placement:assessment?{completedAt:new Date().toISOString(),correct:assessment.correct,incorrect:assessment.incorrect,empty:assessment.empty,area:assessment.area}:prev.placement}));
  setSession({...s,step:"result"});
 }
 useEffect(()=>{if(session?.step==="quiz"&&session.examType&&timeLeft===0)finish(session);/* time triggered, do not restart timer */},[session?.step,session?.examType,timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps
 function markChoice(index:number){if(!session||session.step!=="quiz")return;setSession(s=>s?{...s,selected:{...s.selected,[s.index]:index}}:s)}
 function nextQuestion(){
  if(!session)return;
  if(session.index+1===session.questions.length){finish(session)}else setSession({...session,index:session.index+1,questionStartedAt:Date.now()});
 }
 function nav(next:Page){setPage(next);setNotice("");}
 function resetData(){
  if(window.confirm("Tüm kişisel ilerleme ve denemeler bu tarayıcıdan silinsin mi? Bu işlem geri alınamaz.")){setProgress(EMPTY);setSession(null);setSessionHidden(false);setExamReport(null);setNotice("Çalışma kayıtların sıfırlandı.")}
 }
 function exportData(){
  const payload=JSON.stringify({version:1,exportedAt:new Date().toISOString(),progress},null,2);
  const blob=new Blob([payload],{type:"application/json"}),url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download="yks-2027-yedek-"+dateKey()+".json";a.click();URL.revokeObjectURL(url);
  setNotice("Yedek JSON dosyan indirildi.");
 }
 async function importData(event:React.ChangeEvent<HTMLInputElement>){
  const f=event.target.files?.[0];if(!f)return;
  try{const obj=JSON.parse(await f.text());if(!obj.progress||!Array.isArray(obj.progress.answers))throw Error("Geçersiz dosya");
   if(!window.confirm("Yedekteki ilerleme mevcut kayıtların yerine geçecek. Devam edilsin mi?"))return;
   setProgress(safeState(obj.progress));setSession(null);setSessionHidden(false);setNotice("Yedek başarıyla yüklendi.");
  }catch{setNotice("Yedek dosyası geçersiz.")}
  event.target.value="";
 }
 const statsByCourse=COURSES.map(c=>{const ids=topicsByCourse(c.id).map(t=>t.id);const answers=progress.answers.filter(a=>ids.includes(a.topicId));return {...c,count:ids.length,attempted:new Set(answers.map(a=>a.topicId)).size,percent:answers.length?Math.round(answers.filter(a=>a.correct).length/answers.length*100):0}});
 const filtered=topicsByCourse(course).filter(t=>t.title.toLocaleLowerCase("tr-TR").includes(search.toLocaleLowerCase("tr-TR")));
 const menus:{id:Page;text:string;icon:string}[]=[{id:"home",text:"Bugün",icon:"home"},{id:"subjects",text:"Konu Kütüphanesi",icon:"book"},{id:"calendar",text:"8 Aylık Takvim",icon:"calendar"},{id:"exams",text:"Deneme Merkezi",icon:"award"},{id:"analytics",text:"Analizlerim",icon:"chart"},{id:"settings",text:"Ayarlar & Yedek",icon:"settings"}];
 return <div className="layout">
  <aside className="sidebar">
   <div className="brand"><div className="brand-mark">Y<span>+</span></div><div><strong>YKS Akademi</strong><small>2027 KİŞİSEL KOÇ</small></div></div>
   <div className="goal-card"><span className="tiny-label">HEDEFİN</span><strong>Akdeniz Üniversitesi</strong><span>Psikoloji · Eşit Ağırlık</span><div className="goal-line"><b>İlk 35.000</b><span>2027 YKS</span></div></div>
   <span className="nav-caption">ÇALIŞMA ALANI</span>
   <nav className="side-nav">{menus.map(m=><button key={m.id} onClick={()=>nav(m.id)} className={page===m.id?"active":""}><MiniIcon name={m.icon}/><span>{m.text}</span>{m.id==="analytics"&&weak.length>0?<em>{weak.length}</em>:null}</button>)}</nav>
   <div className="side-bottom"><div className="mini-avatar">Y</div><div><strong>YKS Yolculuğun</strong><small>{currentWeek(day)}. hafta · Günde 3 saat</small></div></div>
  </aside>
  <main className="main">
   <header className="topbar"><div className="topbar-title"><span className="eyebrow">2027 YKS HAZIRLIK PLATFORMU</span><h1>{session?"Çalışma oturumu":page==="home"?"Bugün seni neler bekliyor?":page==="subjects"?"Konu kütüphanesi":page==="calendar"?"8 aylık çalışma planın":page==="exams"?"Deneme merkezi":page==="analytics"?"Performans analizi":"Ayarlar ve yedekleme"}</h1><p>{session?"Konu anlatımı, çözümlü sorular ve kişisel öğrenme analizi.":page==="home"?"Her gün 3 saat. Her hafta yeni bir adım.":"Hedefin için hazırlanan çalışma sistemin."}</p></div><div className="header-actions"><span className="date-chip"><MiniIcon name="calendar"/>{prettyDate(today)}</span><span className="target-chip">EA · 2027</span><span className="account-chip" title={user.email}>{user.email}</span></div></header>
   {loadError?<div className="panel load-error"><h2>Çalışma kayıtların yüklenemedi</h2><p>{loadError}</p><p>Supabase bağlantısını ve <code>study_progress</code> tablosunun güvenlik kurallarını kontrol et. Veriler kaybolmasın diye çalışma ekranını açmıyoruz.</p><button className="btn primary" onClick={()=>window.location.reload()}>Tekrar dene</button></div>:!hydrated?<div className="panel empty">Çalışma verilerin buluttan yükleniyor…</div>:session&&!sessionHidden? <section className="session-wrap">
    <div className="session-bar"><button className="back-link" onClick={pauseLesson}><MiniIcon name="back"/> Kaydet ve ara ver</button><div className="session-meta"><span><MiniIcon name="clock"/>{session.examType?formatDuration(timeLeft)+" kaldı":formatDuration(elapsed)}</span><b>{session.step==="learn"?"Konu anlatımı":session.step==="result"?"Tamamlandı":(session.index+1)+"/"+questionTotal+" soru"}</b></div></div>
    {session.step==="learn"&&activeTopic?<div className="lesson-layout">
      <article className="panel lesson-panel"><div className="subject-tag">{getCourse(activeTopic.courseId).label}</div><h2>{activeTopic.title}</h2><p className="intro">{activeTopic.summary}</p><h3>Konunun temel kuralları</h3><div className="lesson-principles">{activeTopic.principles.map((line,i)=><div key={i} className="principle"><span>{i+1}</span><p>{line}</p></div>)}</div>
     {expanded?<div className="deep-lesson"><div className="deep-head"><span className="eyebrow">AYRINTILI DERS NOTU</span><h3>Bu derste kazanacakların</h3><ul>{expanded.outcomes.map((x,i)=><li key={i}>{x}</li>)}</ul>{session.lessonSection!==undefined?<div className="lesson-resume-notice">Ders ilerlemen: {Math.min(session.lessonSection,expanded.sections.length)} / {expanded.sections.length} bölüm. {session.lessonSection<expanded.sections.length?<a href={"#ders-bolumu-"+session.lessonSection}>Kaldığın bölüme git</a>:"Anlatımı tamamladın; teste geçebilirsin."}</div>:null}</div>
      {expanded.sections.map((part,i)=><section className="deep-section" id={"ders-bolumu-"+i} key={i}><span className="deep-index">BÖLÜM {i+1} · {(session.lessonSection??0)>i?"TAMAMLANDI":(session.lessonSection??0)===i?"SIRADAKİ":"BEKLİYOR"}</span><h3>{part.title}</h3><p>{part.explanation}</p>{part.formula?<div className="deep-formula">{part.formula}</div>:null}<div className="deep-example"><b>Örnek: {part.example.question}</b><ol>{part.example.steps.map((step,j)=><li key={j}>{step}</li>)}</ol><strong>Cevap: {part.example.answer}</strong></div><div className="deep-mistake"><strong>Sık yapılan hata</strong><p>{part.mistake}</p></div><button className="btn outline chapter-check" onClick={()=>setSession(s=>s?{...s,lessonSection:Math.max(s.lessonSection??0,i+1)}:s)} disabled={(session.lessonSection??0)>i}>{(session.lessonSection??0)>i?"Bölüm tamamlandı":"Bu bölümü okudum"}</button></section>)}
      <div className="deep-recap"><h3>Öğrendiklerini kontrol et</h3><ul>{expanded.recap.map((x,i)=><li key={i}>{x}</li>)}</ul><p><b>Ev çalışması:</b> {expanded.practicePlan}</p></div>
     </div>:<div className="info-banner">Bu konu için ayrıntılı ders modülü henüz geliştirilmedi. Şu an temel özet ve örnek sunuluyor; kapsamlı ders içeriği tamamlanıncaya kadar bunu tek başına yeterli kaynak olarak kullanma.</div>}
     <h3>Adım adım çözümlü örnek</h3><div className="example"><strong>{activeTopic.worked}</strong><div className="example-solution"><span>ÇÖZÜM</span><p>{activeTopic.solution}</p></div></div><h3>Sınavda dikkat edilecekler</h3><p>Önce sorunun ne istediğini belirle. Tanımı ezberlemek yerine verilenleri adım adım kullan. İşlem ve yorum hatası yaparsan hatanın hangi basamakta başladığını not al. Çözümü tekrar kapatıp kendin yap.</p><div className="lesson-actions"><button className="btn ghost" onClick={()=>window.print()}>Yazdır / PDF kaydet</button><button className="btn primary" onClick={()=>setSession(s=>s?{...s,step:"quiz",questionStartedAt:Date.now()}:s)}><MiniIcon name="play"/> Teste geç · {session.questions.length} soru</button></div></article>
      <aside className="panel lesson-side"><div className="eyebrow">ÖĞRENME ROTAN</div><h3>Konu → Test → Analiz</h3><p>Bu konudaki soruları cevapladıktan sonra sonuçların kaydedilecek. Düşük başarı gösterdiğin konular çarşamba tekrarına alınır.</p><div className="tipline"><MiniIcon name="clock"/> 45 dakikalık oturum</div><div className="tipline"><MiniIcon name="check"/> Çözümlü sorular</div><div className="tipline"><MiniIcon name="chart"/> Kalıcı ilerleme analizi</div></aside>
    </div>:session.step==="quiz"&&activeQ?<div className="panel quiz-card"><div className="quiz-top"><div><span className="subject-tag">{getCourse((getTopic(activeQ.topicId)||TOPICS[0]).courseId).label}</span><h2>{session.examType?session.examType+" denemesi":getTopic(activeQ.topicId)?.title}</h2></div><span className="difficulty">{activeQ.difficulty}</span></div><div className="progress-rail"><div style={{width:((session.index+1)/questionTotal)*100+"%"}}/></div><div className="question-number">SORU {session.index+1} / {questionTotal}</div><div className="question-text">{activeQ.prompt}</div><div className="choices">{activeQ.choices.map((opt,i)=>{const selected=session.selected[session.index]===i;const reveal=!session.examType&&session.selected[session.index]!==undefined;return <button key={i} disabled={reveal} className={"choice "+(selected?"chosen ":"")+(reveal&&i===activeQ.answer?"correct ":"")+(reveal&&selected&&i!==activeQ.answer?"wrong":"")} onClick={()=>markChoice(i)}><span>{String.fromCharCode(65+i)}</span><b>{opt}</b>{reveal&&i===activeQ.answer?<MiniIcon name="check"/>:null}</button>})}</div>{session.selected[session.index]!==undefined&&!session.examType?<div className="answer-explain"><strong>{session.selected[session.index]===activeQ.answer?"Doğru cevap":"Doğru cevabı öğren"}</strong><p>{activeQ.solution}</p></div>:null}<div className="quiz-bottom"><span>{answered} / {questionTotal} cevaplandı</span><div className="button-row">{session.examType?<button className="btn ghost" onClick={nextQuestion}>{session.index+1===questionTotal?"Denemeyi bitir":"Boş bırak / İlerle"}</button>:null}<button className="btn primary" disabled={!session.examType&&session.selected[session.index]===undefined} onClick={nextQuestion}>{session.index+1===questionTotal?"Testi tamamla":"Sonraki soru"} <MiniIcon name="arrow"/></button></div></div></div>:session.step==="result"&&examReport?<div className="panel results"><div className="result-symbol"><MiniIcon name="award"/></div><span className="eyebrow">OTURUM TAMAMLANDI</span><h2>{session.examType?"Deneme sonucun kaydedildi":"Konu testin tamamlandı"}</h2><p>Doğru ve yanlışların kişisel öğrenme profiline kaydedildi. Eksik konular tekrar planına aktarılacak.</p><div className="result-grid"><div><strong>{examReport.correct}</strong><span>Doğru</span></div><div><strong>{examReport.incorrect}</strong><span>Yanlış</span></div><div><strong>{examReport.empty}</strong><span>Boş</span></div><div><strong>{examReport.net}</strong><span>Net</span></div></div><div className="result-review"><h3>Yanlış ve boş soruların</h3><p>Bu soruları incelemeden oturumu bitirme. Doğru cevapları ve konularını çalışarak sonraki denemede aynı hatayı azaltabilirsin.</p>
 {session.questions.map((q,i)=>{const choice=session.selected[i];if(choice===q.answer)return null;const t=getTopic(q.topicId);return <div className="review-item" key={i}><div className="review-item-head"><strong>Soru {i+1} · {t?.title||"Konu tarama"}</strong><span className={choice===undefined?"review-empty":"review-wrong"}>{choice===undefined?"Boş":"Yanlış"}</span></div><div className="review-prompt">{q.prompt}</div><p><b>Senin cevabın:</b> {choice===undefined?"Boş bırakıldı":String.fromCharCode(65+choice)+") "+q.choices[choice]}</p><p><b>Doğru cevap:</b> {String.fromCharCode(65+q.answer)}) {q.choices[q.answer]}</p><div className="review-explanation"><strong>Açıklama</strong><p>{q.solution}</p></div>{t?<button className="small-btn" onClick={()=>startTopic(t,undefined,"tekrar")}>Bu konuyu pekiştir <MiniIcon name="arrow"/></button>:null}</div>})}
 {examReport.incorrect+examReport.empty===0?<div className="review-all-correct">Bu oturumda yanlış veya boş soru yok. Konuyu sonraki günlerde kısa tekrarlarla pekiştir.</div>:null}
 </div>
 <div className="result-actions"><button className="btn ghost" onClick={()=>{setSession(null);nav("analytics")}}>Analizimi gör</button><button className="btn primary" onClick={()=>{setSession(null);nav("home")}}>Günlük programa dön <MiniIcon name="arrow"/></button></div></div>:null}
   </section>:<>
    {page==="home"&&<>
     <section className="welcome"><div><span className="eyebrow light">KİŞİSEL ÇALIŞMA PLANI</span><h2>Hedefin belli.<br/>Bugün bir adım daha ilerle.</h2><p>Akdeniz Üniversitesi Psikoloji için TYT ve AYT eşit ağırlık hazırlığın. Öğrendikçe güçlenen bir program.</p><button className="btn white" onClick={()=>{if(current)startBlock(current);else nav("subjects")}}><MiniIcon name="play"/>{current?"Çalışmaya başla":"Konu seç ve başla"} <MiniIcon name="arrow"/></button></div><div className="hero-orbit"><div className="orb"><strong>2027</strong><span>YKS</span></div><span className="orbit-ring first"/><span className="orbit-ring second"/></div></section>
     {!progress.placement?<div className="placement-banner"><div><span className="eyebrow">DERSHANEYE BAŞLANGIÇ · SEVİYE TESPİTİ</span><h2>Önce hangi konuları bildiğini ölçelim.</h2><p>36 özgün soru · {PLACEMENT_TIME_MINUTES} dakika · TYT Matematik ve Türkçe, AYT Matematik ve Edebiyat. Sonuçlarına göre eksiklerini belirleyip tekrar önceliğini ayarlayacağız.</p></div><button className="btn primary" onClick={startPlacement}>Seviye sınavına başla <MiniIcon name="arrow"/></button></div>:<div className="placement-done"><MiniIcon name="check"/><span>Seviye tespiti tamamlandı: {progress.placement.correct}/36 doğru.</span><button onClick={()=>nav("analytics")}>Sonuçları gör <MiniIcon name="arrow"/></button></div>}
     {today<START_DATE?<div className="info-banner">Programın ilk günü 19 Ekim Pazartesi. İstersen ilk dersi şimdiden başlatabilirsin.</div>:null}
     {session&&sessionHidden?<div className="academy-pause-banner"><div><span className="eyebrow">YARIM KALAN OTURUM</span><h2>{session.examType?session.examType+" sınavı":getTopic(session.topicId||"")?.title||"Ders"} · {session.step==="learn"?"Konu anlatımı":session.index+1+". soru"}</h2><p>{session.step==="learn"&&session.lessonSection!==undefined?"Son işaretlediğin alt ders: "+session.lessonSection+". bölüm. ":""}İlerlemen hesabına kaydediliyor; kaldığın yerden devam edebilirsin.</p></div><div className="academy-pause-actions"><button className="btn primary" onClick={resumeLesson}>Kaldığım yerden devam et</button><button className="btn ghost" onClick={()=>{if(window.confirm("Yarım kalan oturumu silmek istediğine emin misin?")){setSession(null);setSessionHidden(false)}}}>Oturumu bırak</button></div></div>:null}
     {makeups.length?<div className="academy-makeup"><div className="section-heading"><div><span className="eyebrow">DERSHANE TELAFİ MERKEZİ</span><h2>Bekleyen {makeups.length} dersin var</h2><p>Dünün veya daha eski günlerin tamamlanmayan dersleri silinmez. Bugünkü program ayrı kalır; uygun olduğunda telafileri tamamlayabilirsin.</p></div></div><div className="academy-makeup-list">{(showAllMakeups?makeups:makeups.slice(0,5)).map(b=><div className="academy-makeup-row" key={b.id}><div><small>{prettyDate(b.id.slice(0,10))} · {b.type==="deneme"?"Deneme":b.type==="tekrar"?"Tekrar":"Ders"}</small><strong>{b.title}</strong></div><button className="small-btn" onClick={()=>startBlock(b)}>Telafi et</button></div>)}</div>{makeups.length>5?<button className="text-link academy-more" onClick={()=>setShowAllMakeups(v=>!v)}>{showAllMakeups?"Listeyi daralt":(makeups.length-5)+" dersi daha göster"} <MiniIcon name="arrow"/></button>:null}</div>:null}
     <section className="metric-grid"><div className="metric"><span>TOPLAM ÇÖZÜLEN</span><strong>{answeredCount}</strong><small>soru</small></div><div className="metric"><span>DOĞRULUK ORANI</span><strong>%{accuracy}</strong><small>tüm testler</small></div><div className="metric"><span>ÇALIŞMA SÜRESİ</span><strong>{Math.floor(studyMinutes/60)}<i>sa</i> {studyMinutes%60}<i>dk</i></strong><small>kaydedilen süre</small></div><div className="metric"><span>ÇALIŞILAN KONU</span><strong>{solvedTopics}</strong><small>/ {TOPICS.length} konu</small></div></section>
     <section className="dashboard-grid"><div className="panel today-panel"><div className="section-heading"><div><span className="eyebrow">GÜNLÜK PROGRAM</span><h2>{prettyDate(day)}</h2></div><span className="time-pill">180 dk · 4 oturum</span></div><div className="daily-progress"><div><b>Bugünkü ilerleme</b><span>{Math.min(dayMinutes,maxDaily)} / 180 dk</span></div><div className="progress-rail"><div style={{width:Math.min(100,dayMinutes/maxDaily*100)+"%"}}/></div></div>{plan.length? <div className="block-list">{plan.map((b,i)=>{const done=!!progress.finished[b.id];const crs=b.courseId==="mock"?undefined:b.courseId==="review"?undefined:getCourse(b.courseId);return <div key={b.id} className={"study-row "+(done?"done":"")}><div className="row-time">{String(i+1).padStart(2,"0")}</div><div className="row-main"><span className="topic-type" style={{color:crs?.color||"#7285a0"}}>{b.type==="tekrar"?"TEKRAR":b.type==="deneme"?"DENEME":crs?.label.toLocaleUpperCase("tr-TR")}</span><h3>{b.title}</h3><span className="muted">{lessonClock(progress.startTime,i)?lessonClock(progress.startTime,i)+" · ":"45 dakika · "}{b.type==="deneme"?"30 soru":b.type==="tekrar"?"15 soru":"12 soru"}</span></div><button disabled={done} className={"row-btn "+(done?"is-done":"")} onClick={()=>startBlock(b)}>{done?<MiniIcon name="check"/>:<MiniIcon name="arrow"/>}</button></div>})}</div>:<div className="empty">Pazar günü dinlenme ve hafif tekrar günü. İstersen kütüphaneden konu seçebilirsin.</div>}</div><div className="side-stack"><div className="panel focus"><span className="eyebrow">BU HAFTAKİ DURUM</span><h2>{currentWeek(day)}. hafta</h2><div className="focus-large">{35-currentWeek(day)}<small> hafta kalan (yaklaşık)</small></div><p>2027 YKS sınav tarihi açıklandığında takvimi resmî tarihe göre ayarla.</p><button className="text-link" onClick={()=>nav("calendar")}>Takvimi incele <MiniIcon name="arrow"/></button></div><div className="panel focus"><span className="eyebrow">AKILLI TEKRAR</span><h2>Eksiklerin takipte</h2>{weak.length?<><p>{weak.length} konuda pekiştirme öneriliyor. En düşük başarıdan başlayalım.</p><button className="btn outline" onClick={()=>startTopic(weak[0],undefined,"tekrar")}>Tekrara başla</button></>:<p>Henüz düşük başarı tespit edilmedi. Testler çözdükçe tekrar listesi oluşacak.</p>}</div></div></section>
     <div className="below-note"><MiniIcon name="book"/> <b>{TOPICS.length} konu</b> katalogda, <b>{DETAILED_LESSON_COUNT} konuda</b> ayrıntılı ders modülü hazır. Kalan konular özet düzeyindedir. Resmî ÖSYM soruları değildir.</div>
    </>}
    {page==="subjects"&&<div className="library-layout"><div className="panel subject-sidebar"><div className="eyebrow">DERSLER</div><div className="track-label">TYT</div>{statsByCourse.filter(c=>c.track==="TYT").map(c=><button key={c.id} className={"course-item "+(course===c.id?"active":"")} onClick={()=>{setCourse(c.id);setSearch("")}}><span className="course-dot" style={{background:c.color}}/><span>{c.label}</span><small>{c.count}</small></button>)}<div className="track-label">AYT</div>{statsByCourse.filter(c=>c.track==="AYT").map(c=><button key={c.id} className={"course-item "+(course===c.id?"active":"")} onClick={()=>{setCourse(c.id);setSearch("")}}><span className="course-dot" style={{background:c.color}}/><span>{c.label}</span><small>{c.count}</small></button>)}</div><div className="panel topics-panel"><div className="section-heading"><div><span className="eyebrow">KONU ANLATIMLARI VE TESTLER</span><h2>{getCourse(course).label}</h2><p>{filtered.length} konu · konu anlatımı, örnek çözüm ve test</p></div></div><label className="search-field"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Bu derste konu ara…"/></label><div className="topic-list">{filtered.map((t,i)=>{const s=topicStats(progress,t.id);return <div className="topic-row" key={t.id}><div className="topic-no">{String(t.index+1).padStart(2,"0")}</div><div className="topic-body"><strong>{t.title}</strong><span>{s.count?s.count+" soru çözüldü · %"+s.accuracy+" doğruluk":"Henüz çalışılmadı"}</span></div><div className={"topic-status "+(s.weak?"low":s.mastery>=72?"ok":"")}>{s.count?(s.weak?"Tekrar":s.mastery>=72?"İyi":"Gelişiyor"):"Yeni"}</div><button className="small-btn" onClick={()=>startTopic(t)}>Çalış <MiniIcon name="arrow"/></button></div>})}</div></div></div>}
    {page==="calendar"&&<div className="panel calendar-page"><div className="section-heading"><div><span className="eyebrow">19 EKİM 2026 – 20 HAZİRAN 2027</span><h2>35 haftalık hazırlık programı</h2><p>Haftada 6 gün, günde 4×45 dakika net çalışma. Çarşamba tekrar, cumartesi deneme.</p></div></div><div className="week-rule">{weekDays.map((d,i)=><div key={d}><b>{d}</b><span>{i===6?"Dinlenme":i===5?"Deneme + analiz":i===2?"Eksik pekiştirme":"Konu + test"}</span></div>)}</div><div className="week-grid">{monthPlan(progress).map(w=><div key={w.week} className={"week-box "+(w.week===currentWeek(day)?"current":"")}><span>HAFTA {String(w.week).padStart(2,"0")}</span><strong>{new Date(w.from+"T12:00:00").toLocaleDateString("tr-TR",{day:"numeric",month:"short"})}</strong><small>{w.week===currentWeek(day)?"Şu anki haftan":"4 günlük oturum / başlangıç günü"}</small></div>)}</div><div className="info-banner">Bu plan 2027 YKS takvimi kesinleşmediği için yaklaşık bitiş tarihiyle hazırlandı. Gerekirse son haftanın tarihi düzenlenmelidir.</div></div>}
    {page==="exams"&&<><div className="placement-banner"><div><span className="eyebrow">SEVİYE TESPİT SINAVI</span><h2>36 soru · {PLACEMENT_TIME_MINUTES} dakika</h2><p>Başlangıç seviyeni ve TYT/AYT derslerindeki öncelikli eksikleri belirleyen özgün sınav.</p></div><button className="btn primary" onClick={startPlacement}>{progress.placement?"Sınavı tekrar çöz":"Seviye sınavını başlat"} <MiniIcon name="arrow"/></button></div><div className="exam-grid">{[{type:"Mini" as const,title:"Haftalık mini deneme",count:30,time:"45 dakika",info:"TYT ve AYT konularından karışık, hızlı tarama."},{type:"TYT" as const,title:"TYT genel deneme",count:120,time:"165 dakika",info:"Türkçe 40, sosyal 20, matematik 40, fen 20 dağılımı."},{type:"AYT" as const,title:"AYT eşit ağırlık",count:80,time:"180 dakika",info:"Matematik 40, edebiyat 24, tarih-1 10, coğrafya-1 6."}].map(e=><div key={e.type} className="panel exam-card"><span className="eyebrow">{e.type==="Mini"?"KISA TARAMA":e.type+" GENEL DENEME"}</span><h2>{e.title}</h2><p>{e.info}</p><div className="exam-stats"><span><b>{e.count}</b> soru</span><span><b>{e.time}</b></span></div><button className="btn primary" onClick={()=>startExam(e.type)}>Denemeyi başlat <MiniIcon name="arrow"/></button></div>)}</div><div className="panel history-panel"><div className="section-heading"><h2>Deneme geçmişin</h2></div>{progress.exams.length?progress.exams.slice().reverse().map(e=><div className="history-row" key={e.id}><span>{e.track} · {new Date(e.at).toLocaleDateString("tr-TR")}</span><strong>{e.net} net</strong><small>{e.correct} D · {e.incorrect} Y · {e.empty} B</small></div>):<p className="muted">Henüz deneme çözmedin. İlk denemenden sonra sonuçlar burada saklanır.</p>}</div><div className="info-banner">Bu denemeler özgün alıştırma sorularından oluşturulmuştur. Resmî ÖSYM denemesi ya da gerçek sınav puanı hesaplayıcısı değildir.</div></>}
    {page==="analytics"&&<>{progress.placement?<div className="placement-summary"><div className="section-heading"><div><span className="eyebrow">İLK SEVİYE BELİRLEME</span><h2>Başlangıç ölçümün: {progress.placement.correct}/36 doğru</h2></div></div><div className="placement-areas">{Object.entries(progress.placement.area).map(([name,score])=><div key={name}><strong>{name}</strong><span>{score.correct}/{score.total} doğru · %{Math.round(score.correct/score.total*100)}</span><div className="progress-rail"><div style={{width:Math.round(score.correct/score.total*100)+"%"}}/></div></div>)}</div></div>:<div className="info-banner">Başlangıç seviyeni ölçmek için önce Deneme Merkezi'ndeki 36 soruluk seviye sınavını çöz.</div>}<div className="metric-grid"><div className="metric"><span>TOPLAM SORU</span><strong>{answeredCount}</strong></div><div className="metric"><span>DOĞRULUK</span><strong>%{accuracy}</strong></div><div className="metric"><span>PEKİŞTİRME</span><strong>{due.length}</strong><small>tekrarlanması gereken konu</small></div><div className="metric"><span>DENEMELER</span><strong>{progress.exams.length}</strong></div></div><div className="analytics-grid"><div className="panel"><div className="section-heading"><h2>Derslere göre başarı</h2></div><div className="bars">{statsByCourse.map(c=><div className="barrow" key={c.id}><div><b>{c.label}</b><span>{c.attempted}/{c.count} konu · %{c.percent}</span></div><div className="bar-track"><div style={{width:c.percent+"%",background:c.color}}/></div></div>)}</div></div><div className="panel"><div className="section-heading"><h2>Öncelikli tekrar listesi</h2></div>{weak.length?weak.slice(0,12).map(t=><div className="weak-item" key={t.id}><div><strong>{t.title}</strong><span>{getCourse(t.courseId).label} · %{topicStats(progress,t.id).accuracy} doğru</span></div><button className="small-btn" onClick={()=>startTopic(t,undefined,"tekrar")}>Pekiştir</button></div>):<p className="muted">Yeterli yanlış verisi olduğunda zorlandığın konuları burada göreceksin. Üç veya daha fazla yanıtla değerlendirme başlar.</p>}</div></div></>}
    {page==="settings"&&<div className="settings-grid"><div className="panel settings-card"><span className="eyebrow">BULUT SENKRONİZASYONU</span><h2>Hesabın her cihazda seninle</h2><p>Oturumun açık kalır ve çalışma kayıtların kişisel hesabına kaydedilir. Başka cihazda aynı e-posta ve şifreyle kaldığın yerden devam edebilirsin. Aynı anda iki cihazda ayrı test çözmek kayıt çakışmasına yol açabilir.</p><div className="info-banner">Hesap: {user.email}<br/>Kayıt durumu: {syncStatus==="saved"?"Bulutla eşitlendi":syncStatus==="saving"?"Kaydediliyor":"Yükleniyor"}</div><div className="settings-actions"><button className="btn primary" onClick={exportData}>İlerleme yedeğini indir</button><label className="btn outline upload-btn">JSON yedeği yükle<input type="file" accept=".json,application/json" onChange={importData}/></label></div>{notice?<div className="info-banner">{notice}</div>:null}</div><div className="panel settings-card"><span className="eyebrow">KİŞİSEL HEDEF</span><h2>Akdeniz Üniversitesi · Psikoloji</h2><dl><dt>Hedef sıralama</dt><dd>EA ilk 35.000</dd><dt>Günlük net çalışma</dt><dd>180 dakika</dd><dt>Derse başlama saati</dt><dd>{progress.startTime||"Henüz seçilmedi"}</dd><dt>Program başlangıcı</dt><dd>19 Ekim 2026</dd><dt>Plan bitişi</dt><dd>20 Haziran 2027 (tahmini)</dd><dt>İçerik</dt><dd>{TOPICS.length} konu · {COURSES.length} ders</dd></dl><label className="settings-clock"><span>Her gün derslere başlamak istediğin saat</span><input type="time" value={progress.startTime||""} onChange={e=>setProgress(p=>({...p,startTime:e.target.value}))}/><small>4 × 45 dakika net ders ve ders aralarında 10'ar dakika mola. Programın başlangıç saatini istediğinde değiştirebilirsin.</small></label><button className="btn danger" onClick={resetData}>Tüm ilerlemeyi sıfırla</button><button className="btn outline signout-btn" onClick={()=>void logout()}>Hesaptan çıkış yap</button></div><div className="panel settings-card"><span className="eyebrow">İÇERİK HAKKINDA</span><h2>Özgün ders arşivi</h2><p>Tüm ders başlıkları, temel anlatımlar, çözümlü örnekler ve konu testleri uygulama içine eklenmiştir. Matematik sorularının bir kısmı sayıları değişen üretilebilir sorulardır. Diğer sorular konu kazanımları ve örnekler üzerinden oluşturulur. Yayımlanmış ÖSYM sorularının birebir kopyaları bulunmaz.</p><p>Bu başlangıç arşivi tam kapsamlı, editör denetiminden geçmiş sınav kitabı yerine geçmez. Konu anlatımlarının derinliği ve soru çeşitliliği derslere göre değişir; öğrenmede ana kaynağa ve resmî müfredata da başvur.</p><a href="https://www.osym.gov.tr" target="_blank" rel="noreferrer" className="text-link">ÖSYM resmî sitesi <MiniIcon name="arrow"/></a></div></div>}
   </>}
   {syncError?<div className="info-banner sync-warning" role="alert">Buluta kaydetme hatası: {syncError} <button className="small-btn" onClick={()=>setRetrySave(x=>x+1)}>Tekrar kaydet</button></div>:null}
   <footer className="footer"><span>YKS Akademi 2027 · {syncStatus==="saving"?"Buluta kaydediliyor…":syncStatus==="saved"?"Bulutta kayıtlı":"Yükleniyor…"}</span><span>ÖSYM ile bağlantılı resmî bir hizmet değildir.</span></footer>
  </main>
  {!session&&<nav className="mobile-nav">{menus.slice(0,5).map(m=><button key={m.id} className={page===m.id?"active":""} onClick={()=>nav(m.id)}><MiniIcon name={m.icon}/><small>{m.text.split(" ")[0]}</small></button>)}</nav>}
 </div>
}
