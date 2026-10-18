"use client";
import {useEffect,useState,type FormEvent,type ReactNode} from "react";
import type {User} from "@supabase/supabase-js";
import {cloudConfigured,supabase} from "../lib/cloud";

type Mode="login"|"signup"|"reset";

function AuthScreen({onSignedIn}:{onSignedIn:(user:User)=>void}){
 const [mode,setMode]=useState<Mode>("login");
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [showPassword,setShowPassword]=useState(false);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const [error,setError]=useState("");
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!supabase||busy)return;
  setBusy(true);setError("");setMessage("");
  try{
   const eMail=email.trim().toLocaleLowerCase("tr-TR");
   if(mode==="reset"){
    const {error}=await supabase.auth.resetPasswordForEmail(eMail,{redirectTo:window.location.origin});
    if(error)throw error;
    setMessage("Şifre yenileme bağlantısı gönderildiyse e-posta kutunda görünecek.");
   }else if(mode==="signup"){
    if(password.length<8)throw new Error("Güvenliğin için en az 8 karakterlik şifre belirle.");
    const {data,error}=await supabase.auth.signUp({email:eMail,password,options:{emailRedirectTo:window.location.origin}});
    if(error)throw error;
    if(data.session?.user){onSignedIn(data.session.user);return;}
    setMessage("Hesabını doğrulamak için e-posta kutuna gönderilen bağlantıyı aç. Sonrasında giriş yapabilirsin.");
   }else{
    const {data,error}=await supabase.auth.signInWithPassword({email:eMail,password});
    if(error)throw error;
    if(data.user)onSignedIn(data.user);
   }
  }catch(err){setError(err instanceof Error?err.message:"İşlem başarısız oldu. Tekrar dene.");}
  finally{setBusy(false);}
 }
 return <main className="auth-page">
  <div className="auth-shell">
   <div className="auth-panel">
    <div className="auth-brand"><span className="auth-brand-icon">Y+</span><span><strong>YKS Akademi</strong><small>2027 · Kişisel Eğitim Koçu</small></span></div>
    <div className="auth-eyebrow">AKDENİZ ÜNİVERSİTESİ · PSİKOLOJİ</div>
    <h1>{mode==="login"?"Kaldığın yerden devam et.":mode==="signup"?"Yeni çalışma hesabın.":"Şifreni yenile."}</h1>
    <p>{mode==="login"?"E-posta ve şifrenle giriş yap. Bu cihazdaki oturumun açık kalır; başka cihazda da aynı ilerlemen açılır.":mode==="signup"?"Çalışma sonuçların, denemelerin ve günlük programın kişisel hesabına kaydedilir.":"E-posta adresine şifre yenileme bağlantısı göndereceğiz."}</p>
    {!cloudConfigured?<div className="auth-alert error">Bulut giriş sistemi henüz yapılandırılmadı. Supabase proje URL'si ve yayınlanabilir anahtarının Vercel ortam değişkenlerine eklenmesi gerekiyor.</div>:null}
    <form onSubmit={submit} className="auth-form">
      <label htmlFor="login-email">E-posta adresi</label>
      <input id="login-email" type="email" value={email} autoComplete="email" placeholder="ornek@eposta.com" onChange={e=>setEmail(e.target.value)} required maxLength={254} disabled={!cloudConfigured||busy}/>
      {mode!=="reset"&&<><label htmlFor="login-password">Şifre</label><div className="password-row"><input id="login-password" type={showPassword?"text":"password"} value={password} autoComplete={mode==="signup"?"new-password":"current-password"} placeholder="En az 8 karakter" onChange={e=>setPassword(e.target.value)} required minLength={mode==="signup"?8:1} disabled={!cloudConfigured||busy}/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?"Şifreyi gizle":"Şifreyi göster"}>{showPassword?"Gizle":"Göster"}</button></div></>}
      {error&&<div className="auth-alert error" role="alert">{error}</div>}
      {message&&<div className="auth-alert success" role="status">{message}</div>}
      <button type="submit" className="auth-submit" disabled={!cloudConfigured||busy}>{busy?"İşlem yapılıyor…":mode==="login"?"Giriş yap":mode==="signup"?"Hesap oluştur":"Şifre bağlantısı gönder"}</button>
    </form>
    <div className="auth-links">
      {mode==="login"?<><button onClick={()=>{setMode("signup");setError("");setMessage("");}}>Hesabın yok mu? Kayıt ol</button><button onClick={()=>{setMode("reset");setError("");setMessage("");}}>Şifremi unuttum</button></>:<button onClick={()=>{setMode("login");setError("");setMessage("");}}>Giriş sayfasına dön</button>}
    </div>
    <div className="auth-footnote">Oturum, tarayıcının güvenli oturum belirteci yenileme mekanizmasıyla korunur. Çıkış yapmadığın ve oturumun geçerli kaldığı sürece her seferinde şifre yazman gerekmez.</div>
   </div>
   <aside className="auth-aside"><span className="auth-aside-pill">2027 YKS HEDEFİN</span><h2>Psikoloji için<br/>her gün bir adım.</h2><p>196 konu · TYT ve AYT · çözümlü test · gelişim takibi</p><div className="auth-features"><div><b>01</b><span>Konu anlatımını öğren</span></div><div><b>02</b><span>Testini çöz, yanlışlarını gör</span></div><div><b>03</b><span>Her cihazdan aynı programla devam et</span></div></div></aside>
  </div>
 </main>;
}

export default function AccountGate({children}:{children:(user:User)=>ReactNode}){
 const [user,setUser]=useState<User|null>(null);
 const [loading,setLoading]=useState(true);
 useEffect(()=>{
  if(!supabase){setLoading(false);return;}
  const client=supabase;
  let alive=true;
  client.auth.getSession().then(({data,error})=>{
    if(!alive)return;
    if(!error)setUser(data.session?.user??null);
    setLoading(false);
  }).catch(()=>{if(alive)setLoading(false)});
  const {data:{subscription}}=client.auth.onAuthStateChange((_event,session)=>{
   if(!alive)return;
   setUser(previous=>previous?.id===session?.user.id?previous:session?.user??null);
   setLoading(false);
  });
  return()=>{alive=false;subscription.unsubscribe();};
 },[]);
 if(loading)return <main className="auth-page"><div className="auth-loading">Oturum kontrol ediliyor…</div></main>;
 return user?<>{children(user)}</>:<AuthScreen onSignedIn={setUser}/>;
}
