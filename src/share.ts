export async function downloadResult(
  title: string,
  correct: number,
  total: number,
  answers: boolean[],
) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.fillStyle = "#f7f8f4";
  ctx.fillRect(0, 0, 1080, 1350);
  ctx.fillStyle = "#e6edd8";
  ctx.beginPath();
  ctx.arc(950, 140, 310, 0, Math.PI * 2);
  ctx.fill();
  ctx.textAlign = "left";
  ctx.fillStyle = "#23352e";
  ctx.font = '800 64px "Be Vietnam Pro", sans-serif';
  ctx.fillText("flagpop.", 85, 150);
  ctx.font = '500 25px "Be Vietnam Pro", sans-serif';
  ctx.fillStyle = "#6e8064";
  ctx.fillText("NHÌN CỜ. ĐOÁN NƯỚC. THÁCH BẠN.", 85, 207);
  ctx.textAlign = "center";
  ctx.fillStyle = "#23352e";
  ctx.font = '600 35px "Be Vietnam Pro", sans-serif';
  ctx.fillText(title.slice(0, 45), 540, 390, 900);
  ctx.fillStyle = "#3458dc";
  ctx.font = '800 190px "Be Vietnam Pro", sans-serif';
  ctx.fillText(`${correct}/${total}`, 540, 625);
  ctx.fillStyle = "#738268";
  ctx.font = '500 30px "Be Vietnam Pro", sans-serif';
  ctx.fillText("QUỐC KỲ ĐOÁN ĐÚNG", 540, 700);
  const columns = Math.min(10, total),
    size = 52,
    gap = 14;
  answers.forEach((win, i) => {
    const row = Math.floor(i / columns),
      col = i % columns;
    ctx.fillStyle = win ? "#8cae6e" : "#e2d7cb";
    ctx.beginPath();
    ctx.roundRect(
      540 - (columns * (size + gap) - gap) / 2 + col * (size + gap),
      780 + row * (size + gap),
      size,
      size,
      9,
    );
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "600 30px sans-serif";
    ctx.fillText(
      win ? "✓" : "–",
      540 - (columns * (size + gap) - gap) / 2 + col * (size + gap) + size / 2,
      816 + row * (size + gap),
    );
  });
  ctx.fillStyle = "#23352e";
  ctx.font = '600 34px "Be Vietnam Pro", sans-serif';
  ctx.fillText("Bạn nhận ra được bao nhiêu?", 540, 1110);
  ctx.fillStyle = "#89937e";
  ctx.font = '400 24px "Be Vietnam Pro", sans-serif';
  ctx.fillText("Mỗi ngày một chút. Cả thế giới gần hơn.", 540, 1170);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Export failed"))),
      "image/png",
    ),
  );
  const url = URL.createObjectURL(blob),
    link = document.createElement("a");
  link.href = url;
  link.download = "flagpop-ket-qua.png";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
