"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type Stats = {
  total_users: number;
  total_queries: number;
  total_votes: number;
  active_today: number;
  high_risk_queries: number;
  medium_risk_queries: number;
  low_risk_queries: number;
};

type AdminUser = {
  id: string;
  email: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
};

type AdminQuery = {
  id: string;
  user_id: string;
  product_category: string | null;
  platform: string | null;
  title: string | null;
  identifier_masked: string | null;
  risk_score: number | null;
  risk_level: string | null;
  created_at: string | null;
};

type AdminVote = {
  id: string;
  user_id: string;
  query_id: string;
  vote_type: string | null;
  created_at: string | null;
};

type AdminFeedback = {
  id: string;
  user_id: string | null;
  query_id: string | null;
  rating: number | null;
  helpfulness: string | null;
  comment: string | null;
  created_at: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [queries, setQueries] = useState<AdminQuery[]>([]);
  const [votes, setVotes] = useState<AdminVote[]>([]);
  const [feedbacks, setFeedbacks] = useState<AdminFeedback[]>([]);

  const riskRate = useMemo(() => {
    if (!stats || stats.total_queries === 0) return 0;

    return Math.round((stats.high_risk_queries / stats.total_queries) * 100);
  }, [stats]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await checkAdmin();
      }

      setChecking(false);
    });

    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        await checkAdmin();
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin`,
      },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setStats(null);
    setUsers([]);
    setQueries([]);
    setVotes([]);
    setFeedbacks([]);
  }

  async function checkAdmin() {
    setErrorText("");

    const { data, error } = await supabase.rpc("is_admin");

    if (error) {
      console.error(error);
      setIsAdmin(false);
      setErrorText("Admin kontrolü yapılamadı.");
      return;
    }

    setIsAdmin(Boolean(data));

    if (data) {
      await loadAdminData();
    }
  }

  async function loadAdminData() {
    setLoading(true);
    setErrorText("");

    try {
      const [
        statsResponse,
        usersResponse,
        queriesResponse,
        votesResponse,
        feedbacksResponse,
      ] = await Promise.all([
        supabase.rpc("admin_dashboard_stats"),
        supabase.rpc("admin_recent_users"),
        supabase.rpc("admin_recent_queries"),
        supabase.rpc("admin_recent_votes"),
        supabase
          .from("feedbacks")
          .select("id, user_id, query_id, rating, helpfulness, comment, created_at")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (statsResponse.error) throw statsResponse.error;
      if (usersResponse.error) throw usersResponse.error;
      if (queriesResponse.error) throw queriesResponse.error;
      if (votesResponse.error) throw votesResponse.error;
      if (feedbacksResponse.error) throw feedbacksResponse.error;

      setStats((statsResponse.data?.[0] as Stats) ?? null);
      setUsers((usersResponse.data as AdminUser[]) ?? []);
      setQueries((queriesResponse.data as AdminQuery[]) ?? []);
      setVotes((votesResponse.data as AdminVote[]) ?? []);
      setFeedbacks((feedbacksResponse.data as AdminFeedback[]) ?? []);
    } catch (error) {
      console.error(error);
      setErrorText("Admin verileri alınamadı. SQL fonksiyonlarını ve yetki ayarlarını kontrol edin.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06100d] px-4 text-white">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 text-center">
          <div className="text-3xl">🛡️</div>
          <p className="mt-3 text-sm font-bold text-white/70">
            Admin paneli kontrol ediliyor...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06100d] px-4 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-160px] top-[-120px] h-[420px] w-[420px] rounded-full bg-lime-300/20 blur-3xl" />
          <div className="absolute bottom-[-180px] right-[-160px] h-[520px] w-[520px] rounded-full bg-emerald-300/14 blur-3xl" />
        </div>

        <section className="relative w-full max-w-[460px] rounded-[2.4rem] border border-white/10 bg-white/[0.08] p-7 text-center shadow-[0_40px_140px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-lime-300 text-3xl text-[#06100d]">
            🛡️
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-[-0.06em]">
            GüvenSor Admin
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/68">
            Kullanıcıları, sorguları, oyları ve risk hareketlerini görmek için admin hesabınızla giriş yapın.
          </p>

          <button
            onClick={signInWithGoogle}
            className="mt-7 w-full rounded-2xl bg-lime-300 px-5 py-4 text-sm font-black text-[#06100d] transition hover:bg-white"
          >
            Google ile admin girişi yap
          </button>
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06100d] px-4 text-white">
        <section className="w-full max-w-[520px] rounded-[2rem] border border-red-300/20 bg-red-400/10 p-6 text-center">
          <div className="text-4xl">⛔</div>

          <h1 className="mt-4 text-3xl font-black tracking-[-0.04em]">
            Yetkisiz giriş
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/70">
            Bu hesap admin listesinde görünmüyor. Admin paneline sadece izin verilen hesaplar erişebilir.
          </p>

          <p className="mt-4 rounded-2xl bg-black/20 px-4 py-3 text-sm text-white/80">
            Giriş yapan hesap: {user.email}
          </p>

          {errorText && (
            <p className="mt-4 rounded-2xl bg-red-400/15 px-4 py-3 text-sm text-red-100">
              {errorText}
            </p>
          )}

          <button
            onClick={signOut}
            className="mt-5 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#06100d] transition hover:bg-lime-300"
          >
            Çıkış yap
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#06100d] px-4 py-4 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="flex flex-col gap-4 rounded-[1.8rem] border border-white/10 bg-white/[0.06] px-5 py-4 shadow-[0_20px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-lime-200/70">
              GüvenSor Yönetim
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-[-0.06em]">
              Admin Paneli
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Giriş yapan admin: {user.email}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={loadAdminData}
              disabled={loading}
              className="rounded-full bg-lime-300 px-5 py-3 text-sm font-black text-[#06100d] transition hover:bg-white disabled:opacity-60"
            >
              {loading ? "Yenileniyor..." : "Verileri yenile"}
            </button>

            <button
              onClick={signOut}
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-black text-white/80 transition hover:bg-white hover:text-[#06100d]"
            >
              Çıkış yap
            </button>
          </div>
        </nav>

        {errorText && (
          <div className="mt-5 rounded-2xl border border-red-300/20 bg-red-400/10 px-5 py-4 text-sm font-bold text-red-100">
            {errorText}
          </div>
        )}

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.075] p-5">
            <p className="text-sm text-white/60">Toplam kullanıcı</p>
            <p className="mt-2 text-4xl font-black tracking-[-0.05em]">
              {stats?.total_users ?? 0}
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.075] p-5">
            <p className="text-sm text-white/60">Toplam sorgu</p>
            <p className="mt-2 text-4xl font-black tracking-[-0.05em]">
              {stats?.total_queries ?? 0}
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.075] p-5">
            <p className="text-sm text-white/60">Toplam oy</p>
            <p className="mt-2 text-4xl font-black tracking-[-0.05em]">
              {stats?.total_votes ?? 0}
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.075] p-5">
            <p className="text-sm text-white/60">Bugün aktif kişi</p>
            <p className="mt-2 text-4xl font-black tracking-[-0.05em]">
              {stats?.active_today ?? 0}
            </p>
          </div>
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-4">
          <div className="rounded-[1.8rem] border border-red-300/15 bg-red-400/10 p-5">
            <p className="text-sm text-red-100/70">Yüksek risk</p>
            <p className="mt-2 text-3xl font-black text-red-100">
              {stats?.high_risk_queries ?? 0}
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-yellow-300/15 bg-yellow-400/10 p-5">
            <p className="text-sm text-yellow-100/70">Orta risk</p>
            <p className="mt-2 text-3xl font-black text-yellow-100">
              {stats?.medium_risk_queries ?? 0}
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-lime-300/15 bg-lime-300/10 p-5">
            <p className="text-sm text-lime-100/70">Düşük risk</p>
            <p className="mt-2 text-3xl font-black text-lime-100">
              {stats?.low_risk_queries ?? 0}
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.075] p-5">
            <p className="text-sm text-white/60">Riskli sorgu oranı</p>
            <p className="mt-2 text-3xl font-black">
              %{riskRate}
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">Son giriş yapan kullanıcılar</h2>
              <span className="text-xs text-white/45">{users.length} kayıt</span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.16em] text-white/45">
                  <tr>
                    <th className="py-3">E-posta</th>
                    <th className="py-3">Kayıt tarihi</th>
                    <th className="py-3">Son giriş</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-white/78">
                  {users.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 pr-4 font-bold text-white">
                        {item.email || "—"}
                      </td>
                      <td className="py-3 pr-4">{formatDate(item.created_at)}</td>
                      <td className="py-3 pr-4">{formatDate(item.last_sign_in_at)}</td>
                    </tr>
                  ))}

                  {users.length === 0 && (
                    <tr>
                      <td className="py-6 text-white/50" colSpan={3}>
                        Henüz kullanıcı görünmüyor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">Son oylar</h2>
              <span className="text-xs text-white/45">{votes.length} kayıt</span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.16em] text-white/45">
                  <tr>
                    <th className="py-3">Oy</th>
                    <th className="py-3">Kullanıcı</th>
                    <th className="py-3">Tarih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-white/78">
                  {votes.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 pr-4 font-black text-white">
                        {item.vote_type || "—"}
                      </td>
                      <td className="py-3 pr-4">
                        {item.user_id.slice(0, 8)}...
                      </td>
                      <td className="py-3 pr-4">{formatDate(item.created_at)}</td>
                    </tr>
                  ))}

                  {votes.length === 0 && (
                    <tr>
                      <td className="py-6 text-white/50" colSpan={3}>
                        Henüz oy görünmüyor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Son sorgular</h2>
              <p className="mt-1 text-sm text-white/50">
                Kullanıcıların yazdırdığı sorgu kayıtları ve risk sonuçları.
              </p>
            </div>

            <span className="text-xs text-white/45">{queries.length} kayıt</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-white/45">
                <tr>
                  <th className="py-3">Risk</th>
                  <th className="py-3">Skor</th>
                  <th className="py-3">Kategori</th>
                  <th className="py-3">Platform</th>
                  <th className="py-3">Başlık</th>
                  <th className="py-3">Sorgu</th>
                  <th className="py-3">Tarih</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10 text-white/78">
                {queries.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          item.risk_level === "Yüksek Risk"
                            ? "bg-red-400/15 text-red-100"
                            : item.risk_level === "Orta Risk"
                            ? "bg-yellow-400/15 text-yellow-100"
                            : "bg-lime-300/15 text-lime-100"
                        }`}
                      >
                        {item.risk_level || "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-black text-white">
                      {item.risk_score ?? "—"}
                    </td>
                    <td className="py-3 pr-4">{item.product_category || "—"}</td>
                    <td className="py-3 pr-4">{item.platform || "—"}</td>
                    <td className="max-w-[260px] truncate py-3 pr-4">
                      {item.title || "—"}
                    </td>
                    <td className="py-3 pr-4">{item.identifier_masked || "—"}</td>
                    <td className="py-3 pr-4">{formatDate(item.created_at)}</td>
                  </tr>
                ))}

                {queries.length === 0 && (
                  <tr>
                    <td className="py-6 text-white/50" colSpan={7}>
                      Henüz sorgu görünmüyor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Kullanıcı geri dönüşleri</h2>
              <p className="mt-1 text-sm text-white/50">
                Kullanıcıların sorgu tamamlandıktan sonra verdiği puan ve yorumlar.
              </p>
            </div>

            <span className="text-xs text-white/45">{feedbacks.length} kayıt</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-white/45">
                <tr>
                  <th className="py-3">Puan</th>
                  <th className="py-3">Geri dönüş</th>
                  <th className="py-3">Yorum</th>
                  <th className="py-3">Kullanıcı</th>
                  <th className="py-3">Sorgu ID</th>
                  <th className="py-3">Tarih</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10 text-white/78">
                {feedbacks.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 pr-4 font-black text-lime-200">
                      {item.rating ? `${item.rating}/5` : "—"}
                    </td>

                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          item.helpfulness === "yardimci_oldu"
                            ? "bg-lime-300/15 text-lime-100"
                            : item.helpfulness === "kismen"
                            ? "bg-yellow-400/15 text-yellow-100"
                            : item.helpfulness === "yetersiz"
                            ? "bg-red-400/15 text-red-100"
                            : "bg-white/10 text-white/70"
                        }`}
                      >
                        {item.helpfulness === "yardimci_oldu"
                          ? "Yardımcı oldu"
                          : item.helpfulness === "kismen"
                          ? "Kısmen"
                          : item.helpfulness === "yetersiz"
                          ? "Yeterli değildi"
                          : "—"}
                      </span>
                    </td>

                    <td className="max-w-[320px] py-3 pr-4">
                      <span className="line-clamp-2">
                        {item.comment || "Yorum yazılmadı"}
                      </span>
                    </td>

                    <td className="py-3 pr-4">
                      {item.user_id ? `${item.user_id.slice(0, 8)}...` : "—"}
                    </td>

                    <td className="py-3 pr-4">
                      {item.query_id ? `${item.query_id.slice(0, 8)}...` : "—"}
                    </td>

                    <td className="py-3 pr-4">{formatDate(item.created_at)}</td>
                  </tr>
                ))}

                {feedbacks.length === 0 && (
                  <tr>
                    <td className="py-6 text-white/50" colSpan={6}>
                      Henüz kullanıcı geri dönüşü yok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}