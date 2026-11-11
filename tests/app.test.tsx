import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "https://flagpop.test/",
});
for (const key of [
  "window",
  "document",
  "navigator",
  "HTMLElement",
  "HTMLDialogElement",
  "HTMLButtonElement",
  "HTMLInputElement",
  "localStorage",
  "sessionStorage",
  "location",
  "history",
  "Event",
  "KeyboardEvent",
  "MouseEvent",
])
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value: (dom.window as any)[key],
  });
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
dom.window.scrollTo = () => {};
dom.window.HTMLDialogElement.prototype.showModal = function () {
  this.open = true;
};
dom.window.HTMLDialogElement.prototype.close = function () {
  this.open = false;
};
const React = await import("react");
const { render, fireEvent, cleanup, screen } =
  await import("@testing-library/react");
const { default: App } = await import("../src/App.tsx");
const { encodeChallenge } = await import("../src/storage.ts");
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  history.replaceState(null, "", "/");
});
function start() {
  fireEvent.click(screen.getByRole("button", { name: "Bắt đầu chơi" }));
}
function answerFirst() {
  fireEvent.load(screen.getByAltText("Quốc kỳ cần đoán"));
  const button = document.querySelector<HTMLButtonElement>(".answer")!;
  fireEvent.click(button);
}
function next() {
  fireEvent.click(
    screen.getByRole("button", { name: /Câu tiếp theo|Xem kết quả/ }),
  );
}

test("complete 10-question game, prevent second answer and persist exactly one result", () => {
  render(<App />);
  start();
  for (let i = 0; i < 10; i++) {
    assert.equal(document.querySelectorAll(".answer").length, 4);
    answerFirst();
    assert.ok(
      [...document.querySelectorAll<HTMLButtonElement>(".answer")].every(
        (b) => b.disabled,
      ),
    );
    next();
  }
  assert.ok(screen.getByText("Nhìn lại chuyến đi"));
  const p = JSON.parse(localStorage.getItem("flagpop-v1")!);
  assert.equal(p.played, 1);
  assert.equal(p.answered, 10);
  assert.equal(p.history.length, 1);
  assert.equal(sessionStorage.getItem("flagpop-session-v1"), null);
  assert.ok(screen.getByRole("button", { name: "Sao chép link thách bạn" }));
});
test("refresh restores pending answer and next button without replaying it", () => {
  let r = render(<App />);
  start();
  answerFirst();
  next();
  answerFirst();
  const saved = sessionStorage.getItem("flagpop-session-v1");
  assert.ok(saved);
  r.unmount();
  r = render(<App />);
  assert.ok(screen.getByRole("button", { name: "Câu tiếp theo" }));
  assert.equal(
    document.querySelector(".game-meta")?.textContent?.includes("2 / 10"),
    true,
  );
  assert.equal(sessionStorage.getItem("flagpop-session-v1"), saved);
  next();
  assert.equal(
    document.querySelector(".game-meta")?.textContent?.includes("3 / 10"),
    true,
  );
});
test("incoming challenge starts exact regional set and malformed links offer recovery", () => {
  history.replaceState(
    null,
    "",
    "/#challenge=" +
      encodeChallenge({
        v: 1,
        seed: "test-seed",
        region: "SEA",
        difficulty: "all",
        count: 10,
        score: 800,
      }),
  );
  let r = render(<App />);
  assert.ok(screen.getByText("Bạn của bạn đạt 8/10. Đến lượt bạn!"));
  fireEvent.click(screen.getByRole("button", { name: "Nhận thử thách" }));
  const s = JSON.parse(sessionStorage.getItem("flagpop-session-v1")!);
  assert.equal(s.mode, "challenge");
  assert.equal(s.spec.seed, "test-seed");
  assert.equal(s.questions.length, 10);
  r.unmount();
  localStorage.clear();
  history.replaceState(null, "", "/#challenge=malformed");
  r = render(<App />);
  assert.ok(screen.getByText(/Link thử thách không hợp lệ/));
  fireEvent.click(screen.getByRole("button", { name: "Về khám phá" }));
  assert.equal(location.hash, "");
});
test("collection searches Vietnamese d-stroke and opens actual country detail", () => {
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "Hộ chiếu của tôi" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Tìm quốc gia" }), {
    target: { value: "duc" },
  });
  assert.equal(document.querySelectorAll(".collection-card").length, 1);
  fireEvent.click(document.querySelector(".collection-card")!);
  assert.ok(screen.getByRole("heading", { name: "Đức" }));
  fireEvent.click(screen.getByRole("button", { name: "Đóng" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Tìm quốc gia" }), {
    target: { value: "xyznotfound" },
  });
  assert.ok(screen.getByText("Chưa tìm thấy quốc gia"));
  fireEvent.click(screen.getByRole("button", { name: "Xóa bộ lọc" }));
  assert.equal(document.querySelectorAll(".collection-card").length, 195);
});
test("exit cancel keeps question; confirmed exit removes unfinished session", () => {
  render(<App />);
  start();
  answerFirst();
  fireEvent.click(screen.getByRole("button", { name: "Thoát lượt" }));
  fireEvent.click(screen.getByRole("button", { name: "Chơi tiếp" }));
  assert.ok(screen.getByRole("button", { name: "Câu tiếp theo" }));
  fireEvent.click(screen.getByRole("button", { name: "Thoát lượt" }));
  const buttons = screen.getAllByRole("button", { name: "Thoát lượt" });
  fireEvent.click(buttons[buttons.length - 1]);
  assert.ok(screen.getByRole("button", { name: "Bắt đầu chơi" }));
  assert.equal(sessionStorage.getItem("flagpop-session-v1"), null);
});
test("keyboard shortcuts select answers and corrupt saved data does not crash", () => {
  localStorage.setItem("flagpop-v1", "{bad json");
  sessionStorage.setItem("flagpop-session-v1", "{bad json");
  render(<App />);
  start();
  fireEvent.load(screen.getByAltText("Quốc kỳ cần đoán"));
  fireEvent.keyDown(window, { key: "2" });
  assert.ok(screen.getByRole("button", { name: "Câu tiếp theo" }));
});

test("small region pool finishes without duplicates and sharing fallback is usable", async () => {
  render(<App />);
  const selects = screen.getAllByRole("combobox");
  fireEvent.change(selects[0], { target: { value: "OC" } });
  fireEvent.change(selects[1], { target: { value: "easy" } });
  start();
  const s = JSON.parse(localStorage.getItem("flagpop-session-v1")!);
  assert.equal(s.questions.length, 2);
  answerFirst();
  next();
  answerFirst();
  next();
  fireEvent.click(screen.getByRole("button", { name: "Chia sẻ kết quả" }));
  const area = await screen.findByRole("textbox", { name: "Nội dung chia sẻ" });
  assert.match((area as HTMLTextAreaElement).value, /FLAGPOP/);
  assert.match((area as HTMLTextAreaElement).value, /\/2 đúng/);
});

test("a saved session already accounted for is not restored", () => {
  render(<App />);
  start();
  const saved = sessionStorage.getItem("flagpop-session-v1")!;
  for (let i = 0; i < 10; i++) {
    answerFirst();
    next();
  }
  cleanup();
  sessionStorage.setItem("flagpop-session-v1", saved);
  render(<App />);
  assert.ok(screen.getByRole("button", { name: "Bắt đầu chơi" }));
  assert.equal(JSON.parse(localStorage.getItem("flagpop-v1")!).played, 1);
});
