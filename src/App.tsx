import React, { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  X,
  Globe2,
  Flame,
  Compass,
  Flag,
  BookOpen,
  Trophy,
  RotateCcw,
  ChevronRight,
  Volume2,
  VolumeX,
  Sparkles,
  Clock3,
  Target,
  Share2,
  Search,
  MapPin,
  Menu,
  Heart,
  Copy,
  CheckCircle2,
} from "lucide-react";
import rawCountries from "./data/countries.json";
import {
  type Country,
  type Question,
  REGIONS,
  poolFor,
  makeQuestions,
  localDay,
} from "./engine";
import {
  readJSON,
  saveJSON,
  removeSaved,
  readSession,
  saveSession,
  clearSession,
  newId,
  commitProgress,
  sanitizeProgress,
  sanitizeSession,
  finishSession,
  encodeChallenge,
  decodeChallenge,
  normalizeSearch,
  type Challenge,
  type Session,
} from "./storage";
import { downloadResult } from "./share";

const countries: Country[] = rawCountries;
function readProgress() {
  return sanitizeProgress(readJSON("flagpop-v1"), countries);
}
const flagPath = (code: string) => `/flags/${code.toLowerCase()}.svg`;
const regionCards = [
  {
    id: "AS",
    short: "ASIA",
    icon: "⛩",
    desc: "Từ những điều thân quen",
    flags: ["JP", "KR", "VN"],
    color: "mint",
  },
  {
    id: "EU",
    short: "EUROPE",
    icon: "♜",
    desc: "Một chuyến đi đầy sắc màu",
    flags: ["FR", "IT", "GB"],
    color: "lavender",
  },
  {
    id: "AF",
    short: "AFRICA",
    icon: "☀",
    desc: "Khám phá những bất ngờ",
    flags: ["ZA", "EG", "KE"],
    color: "peach",
  },
  {
    id: "NA",
    short: "NORTH AMERICA",
    icon: "✦",
    desc: "Hơn cả những lá cờ quen",
    flags: ["US", "CA", "MX"],
    color: "blue",
  },
  {
    id: "SA",
    short: "SOUTH AMERICA",
    icon: "♧",
    desc: "Rực rỡ một vùng đất mới",
    flags: ["BR", "AR", "PE"],
    color: "yellow",
  },
  {
    id: "OC",
    short: "OCEANIA",
    icon: "≈",
    desc: "Ra khơi, tìm điều thú vị",
    flags: ["AU", "NZ", "FJ"],
    color: "pink",
  },
];

export default function App() {
  const [progress, setProgress] = useState(readProgress);
  const [restored] = useState(() => {
    const candidate = sanitizeSession(
      readSession(),
      countries,
    );
    return candidate &&
      !readProgress().history.some((h) => h.id === candidate.id)
      ? candidate
      : null;
  });
  const [view, setView] = useState<"home" | "game" | "result" | "passport">(
    restored ? "game" : "home",
  );
  const [incoming, setIncoming] = useState(() =>
    decodeChallenge(window.location.hash),
  );
  const [invalidLink, setInvalidLink] = useState(
    () =>
      window.location.hash.startsWith("#challenge=") &&
      !decodeChallenge(window.location.hash),
  );
  const [spec, setSpec] = useState<Challenge | null>(restored?.spec || null);
  const [sessionId, setSessionId] = useState(restored?.id || "");
  const [sessionDay, setSessionDay] = useState(restored?.day || "");
  const [manualShare, setManualShare] = useState("");
  const [detail, setDetail] = useState<Country | null>(null);
  const [savingImage, setSavingImage] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [networkOnline, setNetworkOnline] = useState(navigator.onLine);
  const [pwaReady, setPwaReady] = useState(false);
  const [settings] = useState(() => {
    const value = readJSON("flagpop-settings");
    return value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  });
  const [region, setRegion] = useState(
    typeof settings.region === "string" && Object.hasOwn(REGIONS, settings.region)
      ? settings.region
      : "ALL",
  );
  const [difficulty, setDifficulty] = useState(
    settings.difficulty === "easy" ? "easy" : "all",
  );
  const [count, setCount] = useState(
    [10, 20, 30].includes(Number(settings.count)) ? Number(settings.count) : 10,
  );
  const [mode, setMode] = useState(restored?.mode || "classic");
  const [questions, setQuestions] = useState<Question[]>(
    restored?.questions || [],
  );
  const [answers, setAnswers] = useState<string[]>(restored?.answers || []);
  const [selected, setSelected] = useState<string | null>(
    restored?.selected || null,
  );
  const [sound, setSound] = useState(settings.sound === true);
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState<
    "help" | "exit" | "sources" | "share" | "detail" | null
  >(null);
  const [query, setQuery] = useState("");
  const [collectionRegion, setCollectionRegion] = useState("ALL");
  const [menu, setMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loadedFlag, setLoadedFlag] = useState("");
  const [sessionTitle, setSessionTitle] = useState(restored?.title || "");
  const [sessionRegion, setSessionRegion] = useState(restored?.region || "ALL");
  const [elapsed, setElapsed] = useState(0);
  const started = useRef(restored?.started || 0);
  const advanceLock = useRef(false);
  const sessionWarning = useRef(false);
  const locked = useRef(Boolean(restored?.selected));
  const completed = useRef(false);
  const nextButton = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const today = new Date(now).toISOString().slice(0, 10);
  const untilTomorrow = 86400 - (Math.floor(now / 1000) % 86400);
  const dailyCountdown = `${Math.floor(untilTomorrow / 3600)}h ${Math.floor((untilTomorrow % 3600) / 60)}m`;
  const filteredCountries = poolFor(countries, collectionRegion, "all").filter(
    (c) =>
      normalizeSearch(`${c.name} ${c.nameEn}`).includes(normalizeSearch(query)),
  );
  const active = questions[answers.length];
  const snapshot = (): Session => ({
    id: sessionId,
    questions,
    answers,
    selected,
    mode,
    region: sessionRegion,
    title: sessionTitle,
    started: started.current,
    day: sessionDay,
    spec,
  });
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    const network = () => setNetworkOnline(navigator.onLine);
    const cacheReady = () => setPwaReady(true);
    const hashChanged = () => {
      setIncoming(decodeChallenge(window.location.hash));
      setInvalidLink(
        window.location.hash.startsWith("#challenge=") &&
          !decodeChallenge(window.location.hash),
      );
    };
    window.addEventListener("online", network);
    window.addEventListener("offline", network);
    window.addEventListener("hashchange", hashChanged);
    window.addEventListener("flagpop-offline-ready", cacheReady);
    return () => {
      clearInterval(timer);
      window.removeEventListener("online", network);
      window.removeEventListener("offline", network);
      window.removeEventListener("hashchange", hashChanged);
      window.removeEventListener("flagpop-offline-ready", cacheReady);
    };
  }, []);
  useEffect(() => {
    saveJSON("flagpop-settings", { region, difficulty, count, sound });
  }, [region, difficulty, count, sound]);
  useEffect(() => {
    if (view === "game" && questions.length) {
      if (
        !saveSession(snapshot()) &&
        !sessionWarning.current
      ) {
        sessionWarning.current = true;
        setToast(
          "Không thể lưu trên trình duyệt này. Đừng tải lại trang khi đang chơi.",
        );
      }
    } else if (view !== "game") clearSession();
  }, [
    view,
    questions,
    answers,
    selected,
    mode,
    sessionId,
    sessionRegion,
    sessionTitle,
    sessionDay,
    spec,
  ]);
  useEffect(() => {
    if (view === "game" && !selected) {
      advanceLock.current = false;
      document
        .querySelector<HTMLButtonElement>(".answer")
        ?.focus({ preventScroll: true });
    }
  }, [view, answers.length, selected]);
  useEffect(() => {
    if (view !== "game" || selected || modal) return;
    const shortcut = (event: KeyboardEvent) => {
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.repeat ||
        /INPUT|TEXTAREA|SELECT/.test((event.target as HTMLElement)?.tagName)
      )
        return;
      const i = ["1", "2", "3", "4"].indexOf(event.key);
      if (i >= 0 && active) {
        event.preventDefault();
        choose(active.options[i].code);
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [view, selected, active, modal, imageError, sound, loadedFlag]);
  const pool = poolFor(countries, region, difficulty);

  const correctCount = answers.filter(
    (a, i) => a === questions[i]?.country.code,
  ).length;
  const score = correctCount * 100;
  const effectiveStreak =
    progress.lastDay === localDay() ||
    (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return progress.lastDay === localDay(d);
    })()
      ? progress.streak
      : 0;

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [view]);
  useEffect(() => {
    if (modal) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [modal]);
  useEffect(() => {
    if (selected) nextButton.current?.focus();
  }, [selected]);
  function beep(correct: boolean) {
    if (!sound) return;
    try {
      const ctx = (audioRef.current ||= new AudioContext());
      void ctx.resume();
      const o = ctx.createOscillator(),
        g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = correct ? 740 : 220;
      g.gain.setValueAtTime(0.055, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.2);
    } catch {
      /* Sound is optional. */
    }
  }
  function start(nextMode = "classic", pickedRegion = region) {
    const startDay = new Date().toISOString().slice(0, 10);
    let candidates = poolFor(countries, pickedRegion, difficulty);
    let title = REGIONS[pickedRegion];
    let amount = count;
    let seed: string = crypto.randomUUID();
    if (nextMode === "daily") {
      candidates = countries;
      title = "Thử thách hôm nay";
      amount = 10;
      seed = `flagpop-v1-${startDay}`;
    }
    if (nextMode === "review") {
      candidates = countries.filter((c) => progress.mistakes.includes(c.code));
      title = "Ôn cờ từng nhầm";
      amount = Math.min(20, candidates.length);
    }
    if (!candidates.length) {
      setToast("Chưa có cờ cần ôn. Hãy khám phá một lượt trước nhé!");
      return;
    }
    const distractors = candidates.length >= 4 ? candidates : countries;
    const newQuestions = makeQuestions(candidates, amount, seed, distractors);
    setQuestions(newQuestions);
    setSessionId(newId());
    setSessionDay(startDay);
    setSpec(
      nextMode === "review"
        ? null
        : {
            v: 1,
            seed,
            region: nextMode === "daily" ? "ALL" : pickedRegion,
            difficulty: nextMode === "daily" ? "all" : difficulty,
            count: newQuestions.length,
            score: 0,
          },
    );
    setSessionTitle(title);
    setSessionRegion(pickedRegion);
    setMode(nextMode);
    setAnswers([]);
    setSelected(null);
    setImageError(false);
    setElapsed(0);
    locked.current = false;
    completed.current = false;
    advanceLock.current = false;
    started.current = Date.now();
    setView("game");
    setMenu(false);
  }
  function choose(code: string) {
    if (
      locked.current ||
      !active ||
      imageError ||
      loadedFlag !== active.country.code
    )
      return;
    locked.current = true;
    setSelected(code);
    beep(code === active.country.code);
  }
  function advance() {
    if (!selected || !active || completed.current || advanceLock.current)
      return;
    advanceLock.current = true;
    const updated = [...answers, selected];
    if (updated.length === questions.length) {
      completed.current = true;
      const latest = readProgress();
      const next = finishSession(
        latest.played > progress.played ? latest : progress,
        snapshot(),
        updated,
      );
      setProgress(next);
      if (!saveJSON("flagpop-v1", next))
        setToast(
          "Không thể lưu tiến độ. Kết quả vẫn hiển thị trong phiên này.",
        );
      clearSession();
      setElapsed(
        Math.max(1, Math.round((Date.now() - started.current) / 1000)),
      );
      setAnswers(updated);
      setView("result");
    } else {
      setAnswers(updated);
      setSelected(null);
      setImageError(false);
      locked.current = false;
    }
  }
  async function copyText(text: string, notice: string) {
    try {
      await navigator.clipboard.writeText(text);
      setToast(notice);
    } catch {
      setManualShare(text);
      setModal("share");
    }
  }
  async function share() {
    const text = `🌍 FLAGPOP · ${sessionTitle}\n${answers.map((a, i) => (a === questions[i].country.code ? "🟩" : "⬜")).join("")}\n${correctCount}/${questions.length} đúng · ${score} điểm\nBạn nhận ra được bao nhiêu lá cờ?`;
    await copyText(text, "Đã sao chép kết quả. Dán vào nhóm chat của bạn nhé!");
  }
  async function shareChallenge() {
    if (!spec) return;
    const url = new URL(window.location.href);
    url.hash = "challenge=" + encodeChallenge({ ...spec, score });
    await copyText(
      url.toString(),
      location.hostname === "localhost" || location.hostname === "127.0.0.1"
        ? "Đã sao chép link local. Cần đưa web lên hosting để bạn bè mở từ thiết bị khác."
        : "Đã sao chép link. Bạn bè sẽ chơi đúng bộ câu hỏi của bạn!",
    );
  }
  function acceptChallenge() {
    if (!incoming) return;
    const candidates = poolFor(countries, incoming.region, incoming.difficulty);
    if (!candidates.length || incoming.count > candidates.length) {
      setInvalidLink(true);
      setIncoming(null);
      return;
    }
    setQuestions(
      makeQuestions(
        candidates,
        incoming.count,
        incoming.seed,
        candidates.length >= 4 ? candidates : countries,
      ),
    );
    setSpec(incoming);
    setSessionId(newId());
    setSessionDay(today);
    setSessionTitle(`Thách bạn · ${REGIONS[incoming.region]}`);
    setSessionRegion(incoming.region);
    setMode("challenge");
    setAnswers([]);
    setSelected(null);
    setImageError(false);
    setElapsed(0);
    locked.current = false;
    completed.current = false;
    advanceLock.current = false;
    started.current = Date.now();
    setView("game");
  }
  async function saveImage() {
    setSavingImage(true);
    try {
      await downloadResult(
        sessionTitle,
        correctCount,
        questions.length,
        answers.map((a, i) => a === questions[i].country.code),
      );
      setToast("Đã tạo ảnh kết quả. Kiểm tra thư mục tải xuống.");
    } catch {
      setToast("Chưa tạo được ảnh. Bạn vẫn có thể sao chép kết quả dạng chữ.");
    } finally {
      setSavingImage(false);
    }
  }
  function dismissChallenge() {
    history.replaceState(null, "", location.pathname + location.search);
    setIncoming(null);
    setInvalidLink(false);
  }
  const showHome = () => {
    if (view === "game") setModal("exit");
    else setView("home");
    setMenu(false);
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Đến nội dung chính
      </a>
      <header className="header">
        <div className="header-inner">
          <button
            className="brand"
            onClick={showHome}
            aria-label="FLAGPOP trang chủ"
          >
            <span className="brand-icon">
              <Flag size={22} strokeWidth={2.5} />
            </span>
            flagpop<span className="brand-dot">.</span>
          </button>
          <nav
            className={menu ? "nav open" : "nav"}
            aria-label="Điều hướng chính"
          >
            <button
              className={view === "home" ? "active" : ""}
              onClick={showHome}
            >
              <Compass size={17} />
              Khám phá
            </button>
            <button
              className={view === "passport" ? "active" : ""}
              onClick={() => {
                if (view === "game") setModal("exit");
                else setView("passport");
                setMenu(false);
              }}
            >
              <BookOpen size={17} />
              Hộ chiếu của tôi
            </button>
            <button onClick={() => setModal("help")}>
              Cách chơi <ArrowUpRight size={14} />
            </button>
          </nav>
          <div className="header-actions">
            <span
              className="streak"
              title="Số ngày chơi liên tiếp trên thiết bị này"
            >
              <Flame size={17} />
              <b>{effectiveStreak}</b>
              <span>ngày liên tiếp</span>
            </span>
            <button
              className="avatar"
              onClick={() => view !== "game" && setView("passport")}
              aria-label="Hộ chiếu cá nhân"
            >
              B
            </button>
            <button
              className="mobile-menu icon-button"
              aria-label="Mở menu"
              onClick={() => setMenu(!menu)}
            >
              <Menu />
            </button>
          </div>
        </div>
      </header>

      {view === "home" && (
        <main id="main-content" className="main">
          {incoming && (
            <section className="challenge-banner">
              <div>
                <span className="tiny-label">LỜI MỜI KHÁM PHÁ</span>
                <h2>
                  Bạn của bạn đạt {incoming.score / 100}/{incoming.count}. Đến
                  lượt bạn!
                </h2>
                <p>
                  {REGIONS[incoming.region]} · Cùng bộ câu hỏi, cùng thứ tự đáp
                  án. Thành tích do người gửi chia sẻ, không phải điểm xác thực.
                </p>
              </div>
              <button className="primary" onClick={acceptChallenge}>
                Nhận thử thách <ArrowRight size={17} />
              </button>
              <button
                className="icon-button"
                onClick={dismissChallenge}
                aria-label="Bỏ lời mời"
              >
                <X size={18} />
              </button>
            </section>
          )}
          {invalidLink && (
            <section className="challenge-banner">
              <p>
                Link thử thách không hợp lệ hoặc thuộc phiên bản chưa được hỗ
                trợ.
              </p>
              <button className="secondary" onClick={dismissChallenge}>
                Về khám phá
              </button>
            </section>
          )}
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="live-dot" /> NHỎ MỘT LÁ CỜ. LỚN MỘT THẾ GIỚI.
              </div>
              <h1>
                Cả thế giới.
                <br />
                Bạn biết <span>bao nhiêu?</span>
                <svg viewBox="0 0 320 18" aria-hidden="true">
                  <path d="M4 12Q150 -4 315 9" />
                </svg>
              </h1>
              <p>
                Một lá cờ, bốn lựa chọn. Đi một vòng thế giới,
                <br className="desktop-break" /> thử tài trí nhớ và khám phá
                điều mới mỗi ngày.
              </p>
              <div className="hero-buttons">
                <button
                  className="primary"
                  onClick={() => start("classic", "ALL")}
                >
                  Khám phá ngay <ArrowRight size={19} />
                </button>
                <button
                  className="text-button"
                  onClick={() => setModal("help")}
                >
                  <span className="play-circle">▷</span> Chơi thế nào?
                </button>
              </div>
              <div className="hero-notes">
                <span>
                  <CheckCircle2 size={14} /> Miễn phí, không cần tài khoản
                </span>
                <span>
                  <Clock3 size={14} /> Chỉ vài phút mỗi lượt
                </span>
              </div>
            </div>
            <div
              className="hero-art"
              aria-label="Minh họa những lá cờ trên khắp thế giới"
            >
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <span className="art-spark spark-one">✳</span>
              <span className="art-spark spark-two">✧</span>
              <span className="art-dot" />
              <div className="globe">
                <svg viewBox="0 0 300 300" aria-hidden="true">
                  <defs>
                    <clipPath id="circle">
                      <circle cx="150" cy="150" r="142" />
                    </clipPath>
                  </defs>
                  <circle cx="150" cy="150" r="142" fill="#dce9c6" />
                  <g clipPath="url(#circle)" fill="#9cbb80">
                    <path d="M19 75 49 50 89 47 105 62 91 78 108 94 91 114 98 140 80 152 69 127 45 126 35 99ZM83 155 108 146 131 164 125 190 108 207 103 236 87 252 83 220 66 196 69 177ZM143 66 162 44 196 47 211 37 250 62 274 87 258 108 230 111 225 135 202 121 183 131 176 111 152 108 145 90ZM148 126 175 117 200 138 197 169 180 198 162 190 150 167 138 150ZM224 198 247 186 269 207 266 230 240 236 220 218ZM213 143 223 149 235 174 228 181 215 168Z" />
                  </g>
                  <g fill="none" stroke="#769365" opacity=".3" strokeWidth="1">
                    <circle cx="150" cy="150" r="142" />
                    <ellipse cx="150" cy="150" rx="70" ry="142" />
                    <ellipse cx="150" cy="150" rx="120" ry="142" />
                    <path d="M8 150h284M28 78q120 40 244 0M28 222q120-40 244 0M150 8v284" />
                  </g>
                </svg>
              </div>
              <div className="floating-flag flag-jp">
                <img src={flagPath("JP")} alt="Nhật Bản" />
                <span>こんにちは!</span>
              </div>
              <div className="floating-flag flag-br">
                <img src={flagPath("BR")} alt="Brazil" />
              </div>
              <div className="floating-flag flag-vn">
                <img src={flagPath("VN")} alt="Việt Nam" />
                <span>Xin chào!</span>
              </div>
              <div className="floating-flag flag-it">
                <img src={flagPath("IT")} alt="Ý" />
              </div>
              <div className="world-label">
                <span>🌎</span>
                <div>
                  <strong>195 quốc gia</strong>
                  <small>Vô vàn điều để khám phá</small>
                </div>
                <Sparkles size={19} />
              </div>
              <span className="art-caption">
                YOUR NEXT ADVENTURE STARTS HERE
              </span>
            </div>
          </section>

          <section className="play-layout" aria-label="Chọn cách chơi">
            <div className="setup-card" id="play">
              <div className="section-heading">
                <div>
                  <span className="tiny-label">SẴN SÀNG CẤT CÁNH?</span>
                  <h2>
                    Chuyến đi của bạn <span>↗</span>
                  </h2>
                </div>
                <span className="pill">
                  <Globe2 size={13} /> Tự do khám phá
                </span>
              </div>
              <div className="setup-fields">
                <label>
                  Khu vực
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  >
                    {Object.entries(REGIONS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Độ khó
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="all">Tất cả quốc kỳ</option>
                    <option value="easy">Khởi động · cờ quen thuộc</option>
                  </select>
                </label>
                <fieldset>
                  <legend>Số câu hỏi</legend>
                  <div className="segmented">
                    {[10, 20, 30].map((n) => (
                      <button
                        key={n}
                        aria-pressed={count === n}
                        className={count === n ? "chosen" : ""}
                        onClick={() => setCount(n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
              <div className="setup-bottom">
                <span>
                  <span className="green-dot" /> {pool.length} quốc gia · Không
                  giới hạn thời gian
                </span>
                <button
                  className="primary small"
                  disabled={pool.length === 0}
                  onClick={() => start()}
                >
                  Bắt đầu chơi <ArrowRight size={17} />
                </button>
              </div>
              {pool.length < count && (
                <p className="pool-note">
                  Bộ này có {pool.length} quốc gia — lượt chơi gồm {pool.length}{" "}
                  câu, không lặp cờ.
                </p>
              )}
            </div>
            <button className="daily-card" onClick={() => start("daily")}>
              <div className="daily-top">
                <span>
                  <Sparkles size={14} /> THỬ THÁCH MỖI NGÀY
                </span>
                <ArrowUpRight size={22} />
              </div>
              <h2>
                Cùng một đề.
                <br />
                Ai tinh mắt hơn?
              </h2>
              <p>10 lá cờ. Một chuyến đi bất ngờ.</p>
              <small className="daily-countdown">
                Đề mới sau {dailyCountdown}
              </small>
              <div className="daily-bottom">
                <span>
                  {progress.daily === today
                    ? "Đã hoàn thành · Chơi lại"
                    : "Thử sức hôm nay"}{" "}
                  <ArrowRight size={16} />
                </span>
                <div className="daily-flags">
                  {["FR", "CA", "KR"].map((c) => (
                    <img key={c} src={flagPath(c)} alt="" />
                  ))}
                </div>
              </div>
            </button>
          </section>

          <section className="regions-section">
            <div className="section-heading">
              <div>
                <span className="tiny-label">ĐI XA HƠN MỘT CHÚT</span>
                <h2>Bạn muốn đến đâu?</h2>
              </div>
              <span className="muted desktop-only">
                Chọn một châu lục, bắt đầu hành trình.
              </span>
            </div>
            <div className="region-grid">
              {regionCards.map((r) => (
                <button
                  key={r.id}
                  className={`region-card ${r.color}`}
                  onClick={() => {
                    setRegion(r.id);
                    start("classic", r.id);
                  }}
                >
                  <div className="region-top">
                    <span className="region-illustration" aria-hidden="true">
                      {r.icon}
                    </span>
                    <span className="region-count">
                      {countries.filter((c) => c.continent === r.id).length}{" "}
                      quốc gia
                    </span>
                  </div>
                  <span className="region-kicker">{r.short}</span>
                  <h3>{REGIONS[r.id]}</h3>
                  <p>{r.desc}</p>
                  <div className="region-bottom">
                    <div className="mini-flags">
                      {r.flags.map((c) => (
                        <img key={c} src={flagPath(c)} alt="" />
                      ))}
                    </div>
                    <span className="round-arrow">
                      <ArrowUpRight size={18} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="bottom-grid">
            <button
              className="sea-card"
              onClick={() => {
                setRegion("SEA");
                start("classic", "SEA");
              }}
            >
              <span className="sea-art">✺</span>
              <div>
                <span className="tiny-label">GẦN NHÀ, CHƯA CHẮC ĐÃ QUEN</span>
                <h3>Một vòng Đông Nam Á</h3>
                <p>11 quốc gia láng giềng. Bạn tự tin được bao nhiêu?</p>
              </div>
              <ArrowUpRight />
            </button>
            <button className="review-card" onClick={() => start("review")}>
              <span className="review-icon">
                <RotateCcw size={22} />
              </span>
              <div>
                <h3>Sai một lần, nhớ lâu hơn.</h3>
                <p>
                  {progress.mistakes.length
                    ? `${progress.mistakes.length} lá cờ đang chờ bạn ôn lại.`
                    : "Lưu những lá cờ bạn nhầm để ôn lại sau."}
                </p>
              </div>
              <ChevronRight size={20} />
            </button>
          </section>
          <section className="progress-strip">
            <div className="passport-icon">
              <BookOpen size={24} />
            </div>
            <div>
              <strong>Mỗi lá cờ là một dấu chân.</strong>
              <p>
                Bạn đã nhận ra <b>{progress.known.length}/195</b> quốc kỳ. Còn
                cả thế giới đang chờ!
              </p>
            </div>
            <div className="mini-progress">
              <span
                style={{ width: `${(progress.known.length / 195) * 100}%` }}
              />
            </div>
            <button className="text-button" onClick={() => setView("passport")}>
              Mở hộ chiếu <ArrowRight size={16} />
            </button>
          </section>
        </main>
      )}

      {view === "game" && active && (
        <main id="main-content" className="game-main">
          <div className="game-toolbar">
            <button className="text-button" onClick={() => setModal("exit")}>
              <X size={19} /> Thoát lượt
            </button>
            <span>{sessionTitle}</span>
            <button
              className="icon-button"
              onClick={() => setSound(!sound)}
              aria-label={sound ? "Tắt âm thanh" : "Bật âm thanh"}
            >
              {sound ? <Volume2 /> : <VolumeX />}
            </button>
          </div>
          <div className="game-meta">
            <span>
              Câu <b>{answers.length + 1}</b> / {questions.length}
            </span>
            <span>
              <Flame size={16} /> {correctCount * 100} điểm
            </span>
          </div>
          <div className="game-progress">
            <span
              style={{ width: `${(answers.length / questions.length) * 100}%` }}
            />
          </div>
          <div className="game-title">
            <span className="tiny-label">NHÌN KỸ MỘT CHÚT NHÉ</span>
            <h1>Đây là quốc kỳ nước nào?</h1>
            <p>Chọn một đáp án. Không cần vội, cứ tự tin!</p>
          </div>
          <div className="question-flag">
            {!imageError && loadedFlag !== active.country.code && (
              <span className="flag-loading" role="status">
                Đang tải quốc kỳ…
              </span>
            )}
            {imageError ? (
              <div>
                <p>Chưa tải được lá cờ.</p>
                <button
                  className="text-button"
                  onClick={() => setImageError(false)}
                >
                  Thử tải lại
                </button>
              </div>
            ) : (
              <img
                key={active.country.code}
                src={flagPath(active.country.code)}
                alt="Quốc kỳ cần đoán"
                onLoad={() => setLoadedFlag(active.country.code)}
                onError={() => setImageError(true)}
              />
            )}
          </div>
          <div className="answers">
            {active.options.map((c, i) => (
              <button
                key={c.code}
                disabled={
                  selected !== null ||
                  imageError ||
                  loadedFlag !== active.country.code
                }
                className={`answer ${selected ? (c.code === active.country.code ? "correct" : c.code === selected ? "wrong" : "faded") : ""}`}
                onClick={() => choose(c.code)}
              >
                <span className="answer-letter">{"ABCD"[i]}</span>
                <span>{c.name}</span>
                {selected && c.code === active.country.code ? (
                  <Check size={21} />
                ) : selected === c.code ? (
                  <X size={21} />
                ) : null}
              </button>
            ))}
          </div>
          <div className="feedback-area" aria-live="polite">
            {selected ? (
              <div
                className={`feedback ${selected === active.country.code ? "positive" : "negative"}`}
              >
                <div>
                  <strong>
                    {selected === active.country.code
                      ? "Chính xác! Thêm một dấu chân mới."
                      : `Đáp án là ${active.country.name}. Nhớ cho lần sau nhé!`}
                  </strong>
                  <p>
                    <MapPin size={14} />
                    {REGIONS[active.country.continent]}
                    {active.country.capital
                      ? ` · Thủ đô: ${active.country.capital}`
                      : ""}
                  </p>
                </div>
                <button
                  ref={nextButton}
                  className="primary small"
                  onClick={advance}
                >
                  {answers.length === questions.length - 1
                    ? "Xem kết quả"
                    : "Câu tiếp theo"}
                  <ArrowRight size={17} />
                </button>
              </div>
            ) : (
              <p className="game-hint">
                <Heart size={14} /> Mỗi lần thử là một lần nhớ thêm. · Phím 1–4
                để chọn
              </p>
            )}
          </div>
        </main>
      )}

      {view === "result" && (
        <main id="main-content" className="result-main">
          <span className="result-trophy">
            <Trophy size={40} />
          </span>
          <span className="tiny-label">HÀNH TRÌNH ĐÃ HOÀN THÀNH</span>
          <h1>
            {correctCount === questions.length
              ? "Một chuyến đi hoàn hảo!"
              : correctCount >= questions.length / 2
                ? "Bạn biết thế giới khá rõ đấy!"
                : "Thế giới còn nhiều bất ngờ!"}
          </h1>
          <p className="muted">
            {sessionTitle} · Mỗi lượt chơi, thêm một điều mới.
          </p>
          <div className="result-stats">
            <div>
              <strong>
                {correctCount}
                <small>/{questions.length}</small>
              </strong>
              <span>Câu trả lời đúng</span>
            </div>
            <div>
              <strong>{score}</strong>
              <span>Điểm khám phá</span>
            </div>
            <div>
              <strong>
                {Math.floor(elapsed / 60)}:
                {String(elapsed % 60).padStart(2, "0")}
              </strong>
              <span>Thời gian khám phá</span>
            </div>
          </div>
          <div className="result-dots">
            {answers.map((a, i) => (
              <span
                key={i}
                className={a === questions[i].country.code ? "win" : "lose"}
                aria-label={`Câu ${i + 1}: ${a === questions[i].country.code ? "đúng" : "sai"}`}
              >
                {a === questions[i].country.code ? (
                  <Check size={16} />
                ) : (
                  <X size={16} />
                )}
              </span>
            ))}
          </div>
          <div className="result-actions">
            <button className="primary" onClick={share}>
              <Share2 size={18} /> Chia sẻ kết quả
            </button>
            <button
              className="secondary"
              onClick={() =>
                mode === "challenge" && spec
                  ? (setIncoming(spec), setView("home"))
                  : start(mode, sessionRegion)
              }
            >
              <RotateCcw size={17} /> Chơi lượt nữa
            </button>
          </div>
          <div className="result-secondary-actions">
            {spec && (
              <button className="secondary" onClick={shareChallenge}>
                <Copy size={16} /> Sao chép link thách bạn
              </button>
            )}
            <button
              className="secondary"
              onClick={saveImage}
              disabled={savingImage}
            >
              {savingImage ? "Đang tạo ảnh…" : "↓ Tải ảnh kết quả"}
            </button>
            {progress.mistakes.length > 0 && (
              <button className="text-button" onClick={() => start("review")}>
                Ôn {progress.mistakes.length} cờ từng nhầm{" "}
                <ArrowRight size={15} />
              </button>
            )}
          </div>
          {mode === "challenge" && spec && (
            <p className="comparison">
              {score > spec.score
                ? "Bạn đã vượt điểm được chia sẻ!"
                : score === spec.score
                  ? "Hai bạn cùng điểm. Thật ngang tài!"
                  : `Còn ${(spec.score - score) / 100} câu nữa để bằng điểm bạn gửi.`}
            </p>
          )}
          <button
            className="text-button result-home"
            onClick={() => setView("home")}
          >
            Về trang khám phá <ArrowRight size={16} />
          </button>
          <div className="result-review">
            <div className="section-heading">
              <h2>Nhìn lại chuyến đi</h2>
              <span className="muted">{questions.length} lá cờ</span>
            </div>
            {questions.map((q, i) => (
              <div className="review-row" key={q.country.code}>
                <img src={flagPath(q.country.code)} alt={q.country.name} />
                <div>
                  <strong>{q.country.name}</strong>
                  <small>
                    {REGIONS[q.country.continent]} · {q.country.nameEn}
                  </small>
                </div>
                {answers[i] === q.country.code ? (
                  <Check className="text-green" size={19} />
                ) : (
                  <span className="mistake-tag">Cần ôn lại</span>
                )}
              </div>
            ))}
          </div>
        </main>
      )}

      {view === "passport" && (
        <main id="main-content" className="main passport-main">
          <div className="passport-heading">
            <div>
              <span className="eyebrow">
                <BookOpen size={15} /> HỘ CHIẾU CỦA TÔI
              </span>
              <h1>
                Thế giới bạn đã khám phá<span>.</span>
              </h1>
              <p>Không cần đi thật xa để biết thêm thật nhiều.</p>
            </div>
            <span className="passport-stamp">
              FLAGPOP
              <br />
              <Globe2 size={35} />
              <br />
              WORLD EXPLORER
            </span>
          </div>
          <div className="passport-stats">
            <div>
              <Flag />
              <strong>
                {progress.known.length}
                <small>/195</small>
              </strong>
              <span>Cờ từng đoán đúng</span>
            </div>
            <div>
              <Target />
              <strong>
                {progress.answered
                  ? Math.round((progress.correct / progress.answered) * 100)
                  : 0}
                %
              </strong>
              <span>Độ chính xác</span>
            </div>
            <div>
              <Compass />
              <strong>{progress.played}</strong>
              <span>Chuyến đi hoàn thành</span>
            </div>
            <div>
              <Flame />
              <strong>{effectiveStreak}</strong>
              <span>Ngày liên tiếp</span>
            </div>
          </div>
          <div className="collection-toolbar">
            <h2>Bộ sưu tập quốc kỳ</h2>
            <div>
              <label className="search-box">
                <Search size={17} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm quốc gia…"
                  aria-label="Tìm quốc gia"
                />
              </label>
              <select
                aria-label="Lọc bộ sưu tập theo khu vực"
                value={collectionRegion}
                onChange={(e) => setCollectionRegion(e.target.value)}
              >
                {Object.entries(REGIONS).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="collection-grid">
            {filteredCountries.map((c) => (
              <button
                onClick={() => {
                  setDetail(c);
                  setModal("detail");
                }}
                key={c.code}
                className={`collection-card ${progress.known.includes(c.code) ? "discovered" : ""}`}
              >
                <img loading="lazy" src={flagPath(c.code)} alt={c.name} />
                <strong>{c.name}</strong>
                <small>
                  {progress.mistakes.includes(c.code)
                    ? "↻ Cần ôn lại"
                    : progress.known.includes(c.code)
                      ? "✓ Đã nhận ra"
                      : "Chờ bạn khám phá"}
                </small>
              </button>
            ))}
          </div>
          {filteredCountries.length === 0 && (
            <div className="empty-state">
              <Search size={28} />
              <h3>Chưa tìm thấy quốc gia</h3>
              <p>Thử tên khác hoặc đổi khu vực.</p>
              <button
                className="secondary"
                onClick={() => {
                  setQuery("");
                  setCollectionRegion("ALL");
                }}
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
          {progress.history.length > 0 && (
            <section className="history-section">
              <h2>Những chuyến đi gần đây</h2>
              {progress.history.slice(0, 5).map((h) => (
                <div className="history-row" key={h.id}>
                  <Compass size={18} />
                  <div>
                    <strong>{h.title}</strong>
                    <small>{new Date(h.at).toLocaleDateString("vi-VN")}</small>
                  </div>
                  <b>
                    {h.correct}/{h.total}
                  </b>
                </div>
              ))}
            </section>
          )}
          <p className="storage-note">
            Tiến độ lưu trên trình duyệt này. “Đã nhận ra” nghĩa là từng trả lời
            đúng, chưa phải đánh giá thành thạo. Không thấy kết quả tìm kiếm?
            Thử tên tiếng Việt hoặc tiếng Anh khác.
          </p>
        </main>
      )}

      <footer>
        <div className="footer-inner">
          <span className="footer-brand">
            <Flag size={16} /> flagpop.
          </span>
          <span>Mỗi ngày một chút. Cả thế giới gần hơn.</span>
          <button onClick={() => setModal("sources")}>
            Nguồn dữ liệu <ArrowUpRight size={13} />
          </button>
          <span className="footer-local">
            {!networkOnline
              ? "Đang ngoại tuyến"
              : pwaReady
                ? "Sẵn sàng chơi ngoại tuyến"
                : "Made for curious minds"}
            <span>✳</span>
          </span>
        </div>
      </footer>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
      <dialog
        ref={dialogRef}
        onCancel={() => setModal(null)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setModal(null);
        }}
      >
        <button
          className="dialog-close icon-button"
          onClick={() => setModal(null)}
          aria-label="Đóng"
        >
          <X />
        </button>
        {modal === "help" && (
          <>
            <span className="modal-icon">
              <Flag />
            </span>
            <h2>Một lá cờ. Bốn lựa chọn.</h2>
            <p>
              Chọn khu vực bạn muốn khám phá, nhìn quốc kỳ và chọn tên quốc gia
              đúng.
            </p>
            <ol>
              <li>
                Mỗi câu đúng được <b>100 điểm</b>. Không trừ điểm khi sai.
              </li>
              <li>
                Không giới hạn thời gian. Chọn xong để xem đáp án và thủ đô.
              </li>
              <li>
                Hoàn thành lượt để lưu tiến độ và ôn lại những cờ từng nhầm.
              </li>
            </ol>
            <p className="modal-note">
              Thử thách ngày có 10 câu giống nhau cho mọi người, đổi đề lúc
              07:00 giờ Việt Nam. Bản local cho phép chơi lại và không có bảng
              xếp hạng.
            </p>
            <button className="primary" onClick={() => setModal(null)}>
              Hiểu rồi, khám phá thôi <ArrowRight size={17} />
            </button>
          </>
        )}
        {modal === "exit" && (
          <>
            <h2>Tạm dừng chuyến đi?</h2>
            <p>
              Nếu thoát lượt, câu trả lời hiện tại sẽ được bỏ qua. Chọn “Chơi
              tiếp” để hoàn thành. Tải lại trang khi đang chơi sẽ tự khôi phục
              lượt.
            </p>
            <div className="dialog-actions">
              <button
                className="secondary"
                onClick={() => {
                  setModal(null);
                  setView("home");
                }}
              >
                Thoát lượt
              </button>
              <button className="primary" onClick={() => setModal(null)}>
                Chơi tiếp
              </button>
            </div>
          </>
        )}
        {modal === "share" && (
          <>
            <h2>Sao chép để chia sẻ</h2>
            <p>
              Trình duyệt chưa cho phép sao chép tự động. Chọn nội dung bên dưới
              và sao chép.
            </p>
            <textarea
              className="share-text"
              readOnly
              value={manualShare}
              onFocus={(e) => e.target.select()}
              aria-label="Nội dung chia sẻ"
            />
          </>
        )}
        {modal === "detail" && detail && (
          <>
            <img
              className="detail-flag"
              src={flagPath(detail.code)}
              alt={detail.name}
            />
            <h2>{detail.name}</h2>
            <p>
              {detail.nameEn} · {REGIONS[detail.continent]}
            </p>
            <p>
              Thủ đô trong bộ dữ liệu:{" "}
              <b>{detail.capital || "Chưa cập nhật"}</b>
            </p>
            <p className="modal-note">
              {progress.mistakes.includes(detail.code)
                ? "Lá cờ này nằm trong danh sách cần ôn của bạn."
                : progress.known.includes(detail.code)
                  ? "Bạn đã từng nhận ra lá cờ này. Tiếp tục luyện tập để nhớ lâu hơn nhé!"
                  : "Một điểm đến mới đang chờ bạn khám phá."}
            </p>
            <button
              className="primary"
              onClick={() => {
                setModal(null);
                setRegion(detail.continent);
                start("classic", detail.continent);
              }}
            >
              Khám phá {REGIONS[detail.continent]} <ArrowRight size={16} />
            </button>
          </>
        )}
        {modal === "sources" && (
          <>
            <h2>Cờ thật. Nguồn rõ ràng.</h2>
            <p>
              Bộ cơ bản gồm 193 thành viên Liên Hợp Quốc và hai quan sát viên:
              Vatican và Palestine. Khu vực theo dữ liệu Countries List.
            </p>
            <a
              href="https://flagpedia.net/download"
              target="_blank"
              rel="noreferrer"
            >
              Flagpedia / FlagCDN — cờ SVG, public domain{" "}
              <ArrowUpRight size={15} />
            </a>
            <a
              href="https://github.com/annexare/Countries"
              target="_blank"
              rel="noreferrer"
            >
              Countries List — tên nước, thủ đô, châu lục; MIT{" "}
              <ArrowUpRight size={15} />
            </a>
            <p>
              Tên tiếng Việt được tạo bằng Intl.DisplayNames. Dữ liệu được tải
              về dự án, không gọi dịch vụ ngoài khi chơi.
            </p>
            <p className="modal-note">
              Bản local: tiến độ chỉ lưu trên thiết bị; không có tài khoản hoặc
              bảng điểm online. Tài liệu nguồn và giấy phép nằm trong thư mục
              docs.
            </p>
          </>
        )}
      </dialog>
    </>
  );
}
