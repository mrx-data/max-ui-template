import { body, cssValue, random, reducedMotion } from "./dom";

interface ParticlePoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  tone: number;
}

interface Streak {
  x: number;
  y: number;
  speed: number;
  length: number;
}

interface BlobPoint {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  hue: number;
}

interface TrailPoint {
  x: number;
  y: number;
  life: number;
}

interface CanvasState {
  width: number;
  height: number;
  ratio: number;
  frameId: number;
  time: number;
  points: ParticlePoint[];
  streaks: Streak[];
  blobs: BlobPoint[];
  trails: TrailPoint[];
}

const canvas = document.getElementById("atmosphere") as HTMLCanvasElement | null;
const context = canvas ? canvas.getContext("2d", { alpha: true }) : null;

const state: CanvasState = {
  width: 0,
  height: 0,
  ratio: 1,
  frameId: 0,
  time: 0,
  points: [],
  streaks: [],
  blobs: [],
  trails: []
};

function seedScene(): void {
  state.points = [];
  state.streaks = [];
  state.blobs = [];
  state.trails = [];

  const density = Math.max(32, Math.floor((state.width * state.height) / 36000));
  for (let index = 0; index < density; index += 1) {
    state.points.push({
      x: Math.random() * state.width,
      y: Math.random() * state.height,
      vx: random(-0.22, 0.22),
      vy: random(-0.22, 0.22),
      size: random(1, 2.8),
      tone: Math.random()
    });
  }

  for (let index = 0; index < 18; index += 1) {
    state.streaks.push({
      x: Math.random() * state.width,
      y: Math.random() * state.height,
      speed: random(0.8, 2.8),
      length: random(80, 220)
    });
  }

  for (let index = 0; index < 8; index += 1) {
    state.blobs.push({
      x: Math.random() * state.width,
      y: Math.random() * state.height,
      r: random(70, 190),
      vx: random(-0.32, 0.32),
      vy: random(-0.22, 0.22),
      hue: index
    });
  }
}

function resetCanvas(): void {
  if (!canvas || !context) return;
  state.ratio = Math.min(window.devicePixelRatio || 1, 2);
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  canvas.width = Math.floor(state.width * state.ratio);
  canvas.height = Math.floor(state.height * state.ratio);
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
  context.setTransform(state.ratio, 0, 0, state.ratio, 0, 0);
  seedScene();
}

function lineBetween(
  ctx: CanvasRenderingContext2D,
  a: ParticlePoint,
  b: ParticlePoint,
  color: (opacity: number) => string,
  maxDistance: number
): void {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > maxDistance) return;
  ctx.strokeStyle = color((1 - distance / maxDistance) * 0.16);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function drawParticleField(ctx: CanvasRenderingContext2D, colors: string[]): void {
  state.points.forEach((point, index) => {
    if (!reducedMotion.matches) {
      point.x += point.vx;
      point.y += point.vy;
    }
    if (point.x < -20) point.x = state.width + 20;
    if (point.x > state.width + 20) point.x = -20;
    if (point.y < -20) point.y = state.height + 20;
    if (point.y > state.height + 20) point.y = -20;

    const color = point.tone > 0.68 ? colors[0] : point.tone > 0.36 ? colors[1] : colors[2];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
    ctx.fill();

    for (let next = index + 1; next < Math.min(state.points.length, index + 7); next += 1) {
      lineBetween(ctx, point, state.points[next], (opacity) => `rgba(18, 20, 18, ${opacity})`, 150);
    }
  });
}

type Scene = (ctx: CanvasRenderingContext2D) => void;

const scenes: Record<string, Scene> = {
  homeScene(ctx) {
    ctx.fillStyle = "rgba(79, 156, 131, 0.025)";
    ctx.fillRect(0, 0, state.width, state.height);
    drawParticleField(ctx, ["rgba(79, 156, 131, 0.18)", "rgba(233, 98, 76, 0.16)", "rgba(18, 20, 18, 0.12)"]);
  },
  modernScene(ctx) {
    const theme = body.dataset.modernTheme || "light";
    const accent = cssValue("--accent", "#4f9c83");
    const accentTwo = cssValue("--accent-2", "#7956ff");
    drawParticleField(ctx, [
      `${accent}33`,
      `${accentTwo}2b`,
      theme === "dark" ? "rgba(238, 245, 240, 0.12)" : "rgba(18, 20, 18, 0.1)"
    ]);
    const gradient = ctx.createLinearGradient(0, 0, state.width, state.height);
    gradient.addColorStop(0, `${accent}14`);
    gradient.addColorStop(1, `${accentTwo}14`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, state.width, state.height);
  },
  cyberScene(ctx) {
    const signal = Number(cssValue("--signal", "42"));
    ctx.strokeStyle = "rgba(66, 235, 255, 0.14)";
    ctx.lineWidth = 1;
    const grid = 44;
    for (let x = (state.time * 0.25) % grid; x < state.width; x += grid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - state.height * 0.16, state.height);
      ctx.stroke();
    }
    for (let y = (state.time * 0.2) % grid; y < state.height; y += grid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(state.width, y);
      ctx.stroke();
    }
    state.streaks.forEach((streak) => {
      if (!reducedMotion.matches) streak.y += streak.speed + signal / 80;
      if (streak.y > state.height + streak.length) {
        streak.y = -streak.length;
        streak.x = Math.random() * state.width;
      }
      const glow = ctx.createLinearGradient(streak.x, streak.y - streak.length, streak.x, streak.y);
      glow.addColorStop(0, "rgba(66, 235, 255, 0)");
      glow.addColorStop(1, "rgba(66, 235, 255, 0.42)");
      ctx.strokeStyle = glow;
      ctx.beginPath();
      ctx.moveTo(streak.x, streak.y - streak.length);
      ctx.lineTo(streak.x, streak.y);
      ctx.stroke();
    });
  },
  trendScene(ctx) {
    const palette = ["rgba(255, 79, 154, 0.24)", "rgba(0, 184, 255, 0.22)", "rgba(110, 255, 106, 0.2)"];
    ctx.fillStyle = "rgba(255, 79, 154, 0.035)";
    ctx.fillRect(0, 0, state.width, state.height);
    state.blobs.forEach((blob) => {
      if (!reducedMotion.matches) {
        blob.x += blob.vx;
        blob.y += blob.vy;
      }
      if (blob.x < -blob.r) blob.x = state.width + blob.r;
      if (blob.x > state.width + blob.r) blob.x = -blob.r;
      if (blob.y < -blob.r) blob.y = state.height + blob.r;
      if (blob.y > state.height + blob.r) blob.y = -blob.r;
      ctx.fillStyle = palette[blob.hue % palette.length];
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.r + Math.sin(state.time / 40 + blob.hue) * 18, 0, Math.PI * 2);
      ctx.fill();
    });
    state.trails.forEach((trail, index) => {
      trail.life -= 1;
      ctx.fillStyle = `rgba(23, 19, 15, ${trail.life / 70})`;
      ctx.beginPath();
      ctx.arc(trail.x, trail.y, Math.max(2, trail.life / 8), 0, Math.PI * 2);
      ctx.fill();
      if (trail.life <= 0) state.trails.splice(index, 1);
    });
  },
  portfolioScene(ctx) {
    ctx.fillStyle = "rgba(116, 20, 28, 0.055)";
    ctx.fillRect(0, 0, state.width, state.height);

    const accent = cssValue("--accent", "#d84b57");
    const accentTwo = cssValue("--accent-2", "#ffb15c");
    drawParticleField(ctx, [`${accent}34`, `${accentTwo}22`, "rgba(255, 244, 230, 0.12)"]);

    const sweep = (state.time * 1.6) % (state.width + 420) - 210;
    const beam = ctx.createLinearGradient(sweep - 180, 0, sweep + 180, state.height);
    beam.addColorStop(0, "rgba(216, 75, 87, 0)");
    beam.addColorStop(0.5, "rgba(216, 75, 87, 0.14)");
    beam.addColorStop(1, "rgba(255, 177, 92, 0)");
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(sweep - 260, 0);
    ctx.lineTo(sweep + 80, 0);
    ctx.lineTo(sweep + 360, state.height);
    ctx.lineTo(sweep + 20, state.height);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 244, 230, 0.05)";
    ctx.lineWidth = 1;
    for (let y = (state.time * 0.18) % 34; y < state.height; y += 34) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(state.width, y + Math.sin(y / 80) * 10);
      ctx.stroke();
    }
  },
  transitionScene() {}
};

function drawFrame(): void {
  if (!context) return;
  context.clearRect(0, 0, state.width, state.height);
  state.time += 1;
  const sceneName = `${body.dataset.scene || "home"}Scene`;
  const scene = scenes[sceneName] || scenes.homeScene;
  scene(context);
  if (!reducedMotion.matches) {
    state.frameId = window.requestAnimationFrame(drawFrame);
  }
}

export function addTrailPoint(x: number, y: number): void {
  if (state.trails.length > 90) state.trails.shift();
  state.trails.push({ x, y, life: 64 });
}

export function initCanvasScenes(): void {
  if (!canvas || !context) return;
  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(state.frameId);
    resetCanvas();
    drawFrame();
  });
  resetCanvas();
  drawFrame();
}
