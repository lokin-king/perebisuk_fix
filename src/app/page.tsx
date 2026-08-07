"use client";

import {
  BookHeart,
  Brain,
  Check,
  Database,
  HeartHandshake,
  History,
  KeyRound,
  LoaderCircle,
  Lock,
  LogOut,
  Moon,
  Plus,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  UserRound,
} from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  AppState,
  MemoryCategory,
  Partner,
  categoryLabels,
  emptyState,
  people,
} from "@/lib/types";

type Tab = "new" | "history" | "memory" | "security";
type ApiResult = {
  ok: boolean;
  error?: string;
  setupRequired?: boolean;
  state?: AppState;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

async function api<T extends ApiResult>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const data = (await response.json().catch(() => ({}))) as T;
  if (!response.ok && !data.error) data.error = "Сервер відповів помилкою.";
  return data;
}

export default function Home() {
  const [state, setState] = useState<AppState>(emptyState);
  const [activeUser, setActiveUser] = useState<Partner | null>(null);
  const [selectedUser, setSelectedUser] = useState<Partner>("sasha");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [tab, setTab] = useState<Tab>("new");
  const [dark, setDark] = useState(false);
  const [hurt, setHurt] = useState("");
  const [angryBecause, setAngryBecause] = useState("");
  const [memoryText, setMemoryText] = useState("");
  const [memoryCategory, setMemoryCategory] = useState<MemoryCategory>("love");
  const [notice, setNotice] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("prebisyuk:theme");
    setDark(savedTheme === "dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("prebisyuk:theme", dark ? "dark" : "light");
  }, [dark]);

  const profileExists = Boolean(state.profiles[selectedUser]);
  const currentEntries = useMemo(
    () => state.entries.filter((entry) => entry.owner === activeUser),
    [activeUser, state.entries],
  );
  const currentMemories = useMemo(
    () => state.memories.filter((memory) => memory.owner === activeUser),
    [activeUser, state.memories],
  );

  async function loadState(user: Partner) {
    setLoading(true);
    const result = await api<ApiResult>(`/api/state?user=${user}`);
    setLoading(false);
    setSetupRequired(Boolean(result.setupRequired));
    if (result.state) setState(result.state);
  }

  useEffect(() => {
    // Loading remote state here is intentional: D1 is the shared source of truth.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadState(activeUser ?? selectedUser);
  }, [activeUser, selectedUser]);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");
    const cleanPassword = password.trim();
    if (cleanPassword.length < 4) {
      setAuthError("Пароль мінімум 4 символи, щоб не було зовсім на чесному слові.");
      return;
    }

    setSaving(true);
    const result = await api<ApiResult>("/api/auth", {
      method: "POST",
      body: JSON.stringify({ user: selectedUser, password: cleanPassword }),
    });
    setSaving(false);

    if (!result.ok) {
      setAuthError(result.error || "Не вийшло увійти.");
      setSetupRequired(Boolean(result.setupRequired) || result.error?.includes("D1") === true);
      return;
    }

    if (result.state) setState(result.state);
    setActiveUser(selectedUser);
    setPassword("");
  }

  function handleLogout() {
    localStorage.removeItem("prebisyuk:session");
    setActiveUser(null);
    setTab("new");
  }

  async function handleCreateEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeUser || !hurt.trim() || !angryBecause.trim()) return;

    setSaving(true);
    const result = await api<ApiResult>("/api/entries", {
      method: "POST",
      body: JSON.stringify({
        owner: activeUser,
        hurt: hurt.trim(),
        angryBecause: angryBecause.trim(),
      }),
    });
    setSaving(false);

    if (!result.ok) {
      setNotice(result.error || "Не вийшло створити запис.");
      return;
    }

    if (result.state) setState(result.state);
    setHurt("");
    setAngryBecause("");
    setTab("history");
    setNotice("AI відповів і запис збережено в спільній базі.");
  }
    async function handleDeleteEntry(id: string) {
    if (!activeUser) return;

    const confirmed = window.confirm("Точно видалити цей запис з історії?");
    if (!confirmed) return;

    setSaving(true);
    const result = await api<ApiResult>("/api/entries", {
      method: "DELETE",
      body: JSON.stringify({
        id,
        owner: activeUser,
      }),
    });
    setSaving(false);

    if (!result.ok) {
      setNotice(result.error || "Не вийшло видалити запис.");
      return;
    }

    if (result.state) setState(result.state);
    setNotice("Запис видалено.");
  }

  async function handleAddMemory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeUser || !memoryText.trim()) return;

    setSaving(true);
    const result = await api<ApiResult>("/api/memories", {
      method: "POST",
      body: JSON.stringify({
        owner: activeUser,
        category: memoryCategory,
        text: memoryText.trim(),
      }),
    });
    setSaving(false);

    if (!result.ok) {
      setNotice(result.error || "Не вийшло додати факт.");
      return;
    }

    if (result.state) setState(result.state);
    setMemoryText("");
    setNotice("Факт додано в спільну пам'ять.");
  }

  if (!activeUser) {
    return (
      <main className="min-h-dvh bg-[#f7f2ef] text-[#251f1d] dark:bg-[#111314] dark:text-[#f5f1ec]">
        <section className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-8">
          <div className="mb-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#9d5548] text-white shadow-sm">
              <HeartHandshake size={24} aria-hidden="true" />
            </div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#7c625c] dark:text-[#b7aaa5]">
              приватно для двох
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-normal">пребісюк</h1>
            <p className="mt-4 text-base leading-7 text-[#6d5b56] dark:text-[#c9c0bc]">
              Коли хтось образився, тут можна видихнути, описати шо сталося, і
              отримати теплу відповідь без наїздів.
            </p>
          </div>

          {setupRequired ? (
            <div className="mb-4 rounded-lg border border-[#e2c37a] bg-[#fff7dd] p-4 text-sm leading-6 text-[#5f4711] dark:border-[#5b4920] dark:bg-[#211c11] dark:text-[#f4dda2]">
              Потрібно підключити Cloudflare D1 database. Без неї телефон і ноут
              не зможуть бачити одні й ті самі записи.
            </div>
          ) : null}

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(["sasha", "marina"] as Partner[]).map((person) => (
                <button
                  key={person}
                  type="button"
                  onClick={() => setSelectedUser(person)}
                  className={`flex h-12 items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition ${
                    selectedUser === person
                      ? "border-[#9d5548] bg-[#9d5548] text-white"
                      : "border-[#dccfc8] bg-white text-[#3a302d] dark:border-[#33383a] dark:bg-[#181b1d] dark:text-[#eee7e1]"
                  }`}
                >
                  <UserRound size={17} aria-hidden="true" />
                  {people[person].name}
                </button>
              ))}
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#5d4e49] dark:text-[#d8cfca]">
                {profileExists ? "Пароль" : "Створи пароль при першому вході"}
              </span>
              <div className="flex h-12 items-center gap-2 rounded-lg border border-[#dccfc8] bg-white px-3 dark:border-[#33383a] dark:bg-[#181b1d]">
                <KeyRound size={18} className="text-[#8f7770]" aria-hidden="true" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  className="min-w-0 flex-1 bg-transparent text-base outline-none"
                  placeholder="мінімум 4 символи"
                />
              </div>
            </label>

            {authError ? <p className="text-sm text-[#b63c31]">{authError}</p> : null}

            <button
              type="submit"
              disabled={saving || loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#251f1d] px-4 font-semibold text-white transition hover:bg-[#3a302d] disabled:opacity-60 dark:bg-[#f5f1ec] dark:text-[#111314]"
            >
              {saving ? <LoaderCircle size={18} className="animate-spin" /> : <Lock size={18} />}
              {profileExists ? "увійти" : "створити і зайти"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  const partner = people[activeUser].partner;

  return (
    <main className="min-h-dvh bg-[#f7f2ef] text-[#251f1d] dark:bg-[#111314] dark:text-[#f5f1ec]">
      <header className="sticky top-0 z-10 border-b border-[#e2d5cf] bg-[#f7f2ef]/92 backdrop-blur dark:border-[#2a3032] dark:bg-[#111314]/92">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7c625c] dark:text-[#b7aaa5]">
              пребісюк
            </p>
            <h1 className="text-lg font-semibold">{people[activeUser].name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <IconButton title="Перемкнути тему" onClick={() => setDark((value) => !value)}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </IconButton>
            <IconButton title="Вийти" onClick={handleLogout}>
              <LogOut size={18} />
            </IconButton>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-5 lg:grid-cols-[240px_1fr]">
        <nav className="grid grid-cols-4 gap-2 lg:block lg:space-y-2">
          <TabButton active={tab === "new"} label="запис" icon={<Plus size={18} />} onClick={() => setTab("new")} />
          <TabButton active={tab === "history"} label="історія" icon={<History size={18} />} onClick={() => setTab("history")} />
          <TabButton active={tab === "memory"} label="пам'ять" icon={<BookHeart size={18} />} onClick={() => setTab("memory")} />
          <TabButton active={tab === "security"} label="захист" icon={<ShieldCheck size={18} />} onClick={() => setTab("security")} />
        </nav>

        <section className="min-w-0">
          {notice ? (
            <button
              type="button"
              onClick={() => setNotice("")}
              className="mb-4 flex w-full items-center gap-2 rounded-lg border border-[#cfd9d2] bg-[#eef6f0] px-4 py-3 text-left text-sm text-[#264536] dark:border-[#304437] dark:bg-[#152019] dark:text-[#cce4d2]"
            >
              <Check size={18} />
              {notice}
            </button>
          ) : null}

          {tab === "new" ? (
            <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
              <form onSubmit={handleCreateEntry} className="space-y-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#7c625c] dark:text-[#b7aaa5]">
                    нова ситуація
                  </p>
                  <h2 className="mt-1 text-3xl font-semibold">шо сталося між тобою і {people[partner].name}</h2>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Чим він/вона тебе образив/образила?</span>
                  <textarea
                    value={hurt}
                    onChange={(event) => setHurt(event.target.value)}
                    rows={6}
                    className="w-full resize-none rounded-lg border border-[#dccfc8] bg-white p-4 text-base leading-7 outline-none focus:border-[#9d5548] dark:border-[#33383a] dark:bg-[#181b1d]"
                    placeholder="наприклад: не відповіла кілька годин, а я вже накрутився..."
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Чому ти злий/зла або сумний/сумна?</span>
                  <textarea
                    value={angryBecause}
                    onChange={(event) => setAngryBecause(event.target.value)}
                    rows={5}
                    className="w-full resize-none rounded-lg border border-[#dccfc8] bg-white p-4 text-base leading-7 outline-none focus:border-[#9d5548] dark:border-[#33383a] dark:bg-[#181b1d]"
                    placeholder="бо мені здалось, шо мене не вибрали, не почули, забули..."
                  />
                </label>

                <button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#9d5548] px-4 font-semibold text-white transition hover:bg-[#87483d] disabled:opacity-60"
                  disabled={saving || !hurt.trim() || !angryBecause.trim()}
                >
                  {saving ? <LoaderCircle size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  заспокоїти мене
                </button>
              </form>

              <aside className="rounded-lg border border-[#dccfc8] bg-white p-4 dark:border-[#33383a] dark:bg-[#181b1d]">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#e9f0eb] text-[#365744] dark:bg-[#1e2b23] dark:text-[#bfe2ca]">
                  <Brain size={20} />
                </div>
                <h3 className="text-lg font-semibold">Як AI буде думати</h3>
                <p className="mt-2 text-sm leading-6 text-[#6d5b56] dark:text-[#c9c0bc]">
                  Відповідь створюється на сервері. Якщо доданий Gemini key, це
                  буде реальний AI. Якщо ключа нема, увімкнеться теплий fallback,
                  щоб застосунок не ламався.
                </p>
              </aside>
            </section>
          ) : null}

          {tab === "history" ? (
            <section>
              <SectionTitle kicker="приватна історія" title="твої записи" />
              <div className="space-y-4">
                {currentEntries.length ? (
                  currentEntries.map((entry) => (
                    <article key={entry.id} className="rounded-lg border border-[#dccfc8] bg-white p-4 dark:border-[#33383a] dark:bg-[#181b1d]">
                      <div className="mb-3 flex items-center justify-between gap-3 text-sm text-[#7c625c] dark:text-[#b7aaa5]">
                        <span>{formatDate(entry.createdAt)}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(entry.id)}
                          disabled={saving}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#dccfc8] text-[#9b574b] transition hover:bg-[#f3ebe6] disabled:opacity-60 dark:border-[#33383a] dark:hover:bg-[#101618]"
                          title="Видалити запис"
                          aria-label="Видалити запис"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                      <h3 className="font-semibold">Образило: {entry.hurt}</h3>
                      <p className="mt-2 text-sm text-[#6d5b56] dark:text-[#c9c0bc]">Причина злості: {entry.angryBecause}</p>
                      <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-[#f3ebe6] p-4 font-sans text-sm leading-7 dark:bg-[#101618]">
                        {entry.aiAnswer}
                      </pre>
                    </article>
                  ))
                ) : (
                  <EmptyState icon={<History size={22} />} title="записів ще нема" text="Коли стане важко, створи перший запис і AI відповість спокійно." />
                )}
              </div>
            </section>
          ) : null}

          {tab === "memory" ? (
            <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
              <form onSubmit={handleAddMemory} className="rounded-lg border border-[#dccfc8] bg-white p-4 dark:border-[#33383a] dark:bg-[#181b1d]">
                <SectionTitle kicker="спільна база" title="додати факт про себе" compact />
                <label className="mt-4 block">
                  <span className="mb-2 block text-sm font-medium">Категорія</span>
                  <select
                    value={memoryCategory}
                    onChange={(event) => setMemoryCategory(event.target.value as MemoryCategory)}
                    className="h-11 w-full rounded-lg border border-[#dccfc8] bg-white px-3 outline-none dark:border-[#33383a] dark:bg-[#111314]"
                  >
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="mt-4 block">
                  <span className="mb-2 block text-sm font-medium">Факт</span>
                  <textarea
                    value={memoryText}
                    onChange={(event) => setMemoryText(event.target.value)}
                    rows={6}
                    className="w-full resize-none rounded-lg border border-[#dccfc8] bg-white p-3 leading-6 outline-none dark:border-[#33383a] dark:bg-[#111314]"
                    placeholder="я дуже люблю коли мене обіймають після сварки..."
                  />
                </label>

                <button
                  type="submit"
                  disabled={saving || !memoryText.trim()}
                  className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#365744] px-4 font-semibold text-white disabled:opacity-60"
                >
                  {saving ? <LoaderCircle size={18} className="animate-spin" /> : <Plus size={18} />}
                  додати
                </button>
              </form>

              <div className="space-y-3">
                {currentMemories.length ? (
                  currentMemories
                    .slice()
                    .reverse()
                    .map((memory) => (
                      <article key={memory.id} className="rounded-lg border border-[#dccfc8] bg-white p-4 dark:border-[#33383a] dark:bg-[#181b1d]">
                        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#7c625c] dark:text-[#b7aaa5]">
                          <span>{categoryLabels[memory.category]}</span>
                          <span>{formatDate(memory.createdAt)}</span>
                        </div>
                        <p className="leading-7">{memory.text}</p>
                      </article>
                    ))
                ) : (
                  <EmptyState icon={<BookHeart size={22} />} title="пам'ять пуста" text="Додай кілька фактів, і відповіді стануть більше про вас." />
                )}
              </div>
            </section>
          ) : null}

          {tab === "security" ? (
            <section className="grid gap-5 lg:grid-cols-2">
              <InfoCard icon={<Database size={20} />} title="спільна база">
                Дані зберігаються в Cloudflare D1. Тому телефон і ноут бачать
                одні й ті самі профілі, записи і пам&apos;ять.
              </InfoCard>
              <InfoCard icon={<ShieldCheck size={20} />} title="безпека MVP">
                Пароль хешується на сервері. Telegram token, chat id і Gemini key
                мають бути тільки в Cloudflare/GitHub secrets, не в інтерфейсі.
              </InfoCard>
            </section>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function IconButton({ title, onClick, children }: { title: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={title}
      title={title}
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#dccfc8] bg-white dark:border-[#33383a] dark:bg-[#181b1d]"
    >
      {children}
    </button>
  );
}

function TabButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-12 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition lg:w-full lg:justify-start ${
        active
          ? "border-[#9d5548] bg-[#9d5548] text-white"
          : "border-[#dccfc8] bg-white text-[#3a302d] dark:border-[#33383a] dark:bg-[#181b1d] dark:text-[#eee7e1]"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function SectionTitle({ kicker, title, compact = false }: { kicker: string; title: string; compact?: boolean }) {
  return (
    <div className={compact ? "" : "mb-5"}>
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#7c625c] dark:text-[#b7aaa5]">
        {kicker}
      </p>
      <h2 className={`mt-1 font-semibold ${compact ? "text-2xl" : "text-3xl"}`}>{title}</h2>
    </div>
  );
}

function EmptyState({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[#cabbb4] p-8 text-center dark:border-[#3d4548]">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-[#9d5548] dark:bg-[#181b1d]">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#6d5b56] dark:text-[#c9c0bc]">{text}</p>
    </div>
  );
}

function InfoCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <article className="rounded-lg border border-[#dccfc8] bg-white p-4 dark:border-[#33383a] dark:bg-[#181b1d]">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#e9f0eb] text-[#365744] dark:bg-[#1e2b23]">
        {icon}
      </div>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-[#6d5b56] dark:text-[#c9c0bc]">{children}</p>
    </article>
  );
}
