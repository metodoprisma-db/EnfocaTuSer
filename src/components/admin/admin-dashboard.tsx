"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BellRing,
  CalendarClock,
  CheckCircle2,
  Gift,
  LogOut,
  PauseCircle,
  Plus,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { ASSETS } from "@/lib/constants";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

interface DashboardStats {
  total_users: number;
  active_last_7_days: number;
  gift_unlocked_count: number;
  completed_path_count: number;
  total_pauses: number;
}

interface AdminUser {
  id: string;
  display_name: string | null;
  email: string;
  billing_email: string | null;
  role: "user" | "admin";
  completed_steps: number;
  current_step: number;
  presence_days_count: number;
  current_rhythm_count: number;
  plan_type: string;
  subscription_status: string;
  access_until: string;
  last_active_date: string | null;
}

interface AdminAnnouncement {
  id: string;
  title: string;
  message: string;
  cta_label: string | null;
  cta_url: string | null;
  variant: "warm" | "butterfly" | "deep";
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string | null;
}

const emptyStats: DashboardStats = {
  total_users: 0,
  active_last_7_days: 0,
  gift_unlocked_count: 0,
  completed_path_count: 0,
  total_pauses: 0,
};

function localDatetimeValue(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(emptyStats);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [variant, setVariant] = useState<AdminAnnouncement["variant"]>("warm");
  const [isActive, setIsActive] = useState(true);
  const [startsAt, setStartsAt] = useState(localDatetimeValue);
  const [endsAt, setEndsAt] = useState("");

  const loadDashboard = useCallback(async (userSearch = "") => {
    const client = getBrowserSupabaseClient();
    if (!client) return;
    setLoading(true);
    setMessage("");

    const [statsResult, usersResult, announcementsResult] = await Promise.all([
      client.rpc("admin_get_dashboard_stats"),
      client.rpc("admin_list_users", { p_search: userSearch }),
      client
        .from("app_announcements")
        .select("id,title,message,cta_label,cta_url,variant,is_active,starts_at,ends_at,created_at")
        .order("created_at", { ascending: false }),
    ]);

    const error = statsResult.error ?? usersResult.error ?? announcementsResult.error;
    if (error) {
      setMessage("No pudimos cargar el panel. Verifica la sesión administrativa.");
      setLoading(false);
      return;
    }

    setStats((statsResult.data?.[0] as DashboardStats | undefined) ?? emptyStats);
    setUsers((usersResult.data as AdminUser[] | null) ?? []);
    setAnnouncements((announcementsResult.data as AdminAnnouncement[] | null) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) void loadDashboard();
    });
    return () => {
      active = false;
    };
  }, [loadDashboard]);

  const createAnnouncement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const client = getBrowserSupabaseClient();
    if (!client) return;
    setMessage("");
    const { error } = await client.from("app_announcements").insert({
      title: title.trim(),
      message: announcementMessage.trim(),
      cta_label: ctaLabel.trim() || null,
      cta_url: ctaUrl.trim() || null,
      variant,
      is_active: isActive,
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    setTitle("");
    setAnnouncementMessage("");
    setCtaLabel("");
    setCtaUrl("");
    setEndsAt("");
    setMessage("Anuncio guardado.");
    await loadDashboard(search);
  };

  const toggleAnnouncement = async (announcement: AdminAnnouncement) => {
    const client = getBrowserSupabaseClient();
    if (!client) return;
    const { error } = await client
      .from("app_announcements")
      .update({ is_active: !announcement.is_active })
      .eq("id", announcement.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    await loadDashboard(search);
  };

  const updateAccess = async (
    userId: string,
    values: { plan?: string; days?: number; role?: string },
  ) => {
    const client = getBrowserSupabaseClient();
    if (!client) return;
    setMessage("");
    const { error } = await client.rpc("admin_update_user_access", {
      p_target_user_id: userId,
      p_plan_type: values.plan ?? null,
      p_add_days: values.days ?? null,
      p_new_role: values.role ?? null,
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Acceso actualizado.");
    await loadDashboard(search);
  };

  const signOut = async () => {
    const client = getBrowserSupabaseClient();
    await client?.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  };

  const metricCards = [
    { label: "Usuarias", value: stats.total_users, icon: UsersRound },
    { label: "Activas, 7 días", value: stats.active_last_7_days, icon: CalendarClock },
    { label: "Regalo desbloqueado", value: stats.gift_unlocked_count, icon: Gift },
    { label: "Camino completo", value: stats.completed_path_count, icon: CheckCircle2 },
    { label: "Pausas realizadas", value: stats.total_pauses, icon: PauseCircle },
  ];

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <Image src={ASSETS.logo} width={420} height={130} alt="Enfoca Tu Ser" priority />
        <div>
          <span className="admin-secure"><ShieldCheck size={16} /> Panel aislado</span>
          <button className="button button-quiet" type="button" onClick={signOut}><LogOut size={17} /> Cerrar sesión</button>
        </div>
      </header>

      <div className="admin-content">
        <div className="admin-title-row">
          <div>
            <span className="eyebrow">Administración</span>
            <h1>Vista general</h1>
          </div>
          <p>Datos operativos y accesos. El contenido privado del diario nunca forma parte de este panel.</p>
        </div>

        {message ? <p className="admin-message" role="status">{message}</p> : null}

        <section className="admin-metrics" aria-label="Métricas globales">
          {metricCards.map(({ label, value, icon: Icon }) => (
            <article key={label}>
              <Icon size={20} />
              <strong>{value}</strong>
              <span>{label}</span>
            </article>
          ))}
        </section>

        <section className="admin-section" aria-labelledby="announcements-title">
          <div className="admin-section-heading">
            <div>
              <span className="eyebrow"><BellRing size={15} /> Banner de novedades</span>
              <h2 id="announcements-title">Mensajes globales</h2>
            </div>
          </div>
          <div className="admin-two-column">
            <form className="admin-form" onSubmit={createAnnouncement}>
              <div className="field">
                <label htmlFor="announcement-title">Título</label>
                <input id="announcement-title" value={title} onChange={(event) => setTitle(event.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="announcement-message">Mensaje</label>
                <textarea id="announcement-message" value={announcementMessage} onChange={(event) => setAnnouncementMessage(event.target.value)} required />
              </div>
              <div className="admin-form-grid">
                <div className="field">
                  <label htmlFor="cta-label">Texto del enlace</label>
                  <input id="cta-label" value={ctaLabel} onChange={(event) => setCtaLabel(event.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="cta-url">URL del enlace</label>
                  <input id="cta-url" type="url" value={ctaUrl} onChange={(event) => setCtaUrl(event.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="announcement-variant">Estilo</label>
                  <select id="announcement-variant" value={variant} onChange={(event) => setVariant(event.target.value as AdminAnnouncement["variant"])}>
                    <option value="warm">Cálido</option>
                    <option value="butterfly">Mariposa</option>
                    <option value="deep">Profundo</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="starts-at">Comienza</label>
                  <input id="starts-at" type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="ends-at">Finaliza (opcional)</label>
                  <input id="ends-at" type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
                </div>
              </div>
              <label className="check-row">
                <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
                <span>Publicar como activo</span>
              </label>
              <button className="button button-primary" type="submit"><Plus size={17} /> Crear anuncio</button>
            </form>

            <div className="announcement-admin-list">
              {announcements.length === 0 ? <p className="empty-admin">Todavía no hay anuncios.</p> : announcements.map((announcement) => (
                <article key={announcement.id}>
                  <div>
                    <span className={`status-dot${announcement.is_active ? " active" : ""}`} />
                    <strong>{announcement.title}</strong>
                    <p>{announcement.message}</p>
                    <small>{announcement.variant} · {announcement.starts_at ? new Date(announcement.starts_at).toLocaleString("es") : "Sin fecha inicial"}</small>
                  </div>
                  <button className="button button-secondary" type="button" onClick={() => toggleAnnouncement(announcement)}>
                    {announcement.is_active ? "Desactivar" : "Activar"}
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="admin-section" aria-labelledby="users-title">
          <div className="admin-section-heading">
            <div>
              <span className="eyebrow"><UsersRound size={15} /> Accesos y pases</span>
              <h2 id="users-title">Usuarias</h2>
            </div>
            <form className="admin-search" onSubmit={(event) => { event.preventDefault(); void loadDashboard(search); }}>
              <label className="sr-only" htmlFor="user-search">Buscar por nombre o correo</label>
              <input id="user-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre o correo" />
              <button className="button button-secondary" type="submit"><Search size={17} /> Buscar</button>
            </form>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuaria</th>
                  <th>Camino</th>
                  <th>Presencia</th>
                  <th>Pase</th>
                  <th>Vigencia</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Usuaria">
                      <strong>{item.display_name || "Sin nombre"}</strong>
                      <span>{item.email}</span>
                      {item.billing_email ? <small>Compra: {item.billing_email}</small> : null}
                      {item.role === "admin" ? <em>admin</em> : null}
                    </td>
                    <td data-label="Camino"><strong>{item.completed_steps}/15</strong><span>Paso actual {item.current_step}</span></td>
                    <td data-label="Presencia"><strong>{item.presence_days_count}</strong><span>Ritmo {item.current_rhythm_count}</span></td>
                    <td data-label="Pase"><strong>{item.plan_type}</strong><span>{item.subscription_status}</span></td>
                    <td data-label="Vigencia"><time dateTime={item.access_until}>{item.plan_type === "lifetime" ? "Vitalicio" : new Date(item.access_until).toLocaleDateString("es")}</time></td>
                    <td data-label="Acciones">
                      <div className="admin-actions">
                        {[7, 30, 60, 90].map((days) => (
                          <button key={days} type="button" onClick={() => updateAccess(item.id, { plan: "promo_pass", days })}>+{days} días</button>
                        ))}
                        <button type="button" onClick={() => updateAccess(item.id, { plan: "lifetime" })}>Vitalicio</button>
                        {item.role !== "admin" ? <button type="button" onClick={() => updateAccess(item.id, { role: "admin" })}>Hacer admin</button> : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loading ? <p className="admin-loading">Actualizando datos...</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
