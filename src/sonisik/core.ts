export type Vec2 = { x: number; z: number };
export type Enemy = Vec2 & { stun: number; phase: number };
export type Orb = Vec2 & { taken: boolean };
export type GameMode = 'menu' | 'playing' | 'won' | 'lost';

export type LevelDef = {
  name: string;
  subtitle: string;
  radius: number;
  required: number;
  beacon: Vec2;
  orbs: Vec2[];
  enemies: Vec2[];
  sky: [number, number, number];
  floor: [number, number, number, number];
  accent: [number, number, number, number];
};

export type MutableGame = {
  level: number;
  px: number;
  pz: number;
  health: number;
  energy: number;
  orbs: Orb[];
  enemies: Enemy[];
  pulseFx: number;
  pulseCooldown: number;
  lastHit: number;
  ended: boolean;
};

export type InputState = { up: boolean; down: boolean; left: boolean; right: boolean };

export const STORAGE_KEY = 'son_isik_progress_v1';

export const LEVELS: LevelDef[] = [
  {
    name: 'Kıyı Adası', subtitle: 'İlk kıvılcımlar hâlâ burada.', radius: 6.4, required: 4,
    beacon: { x: 0, z: -4.6 },
    orbs: [{ x: -3.7, z: 2.6 }, { x: 3.5, z: 2.2 }, { x: -2.6, z: -2.0 }, { x: 2.8, z: -2.8 }],
    enemies: [{ x: -4.7, z: -0.5 }, { x: 4.5, z: 0.4 }],
    sky: [0.025, 0.055, 0.11], floor: [0.07, 0.24, 0.28, 1], accent: [0.32, 0.95, 0.82, 1],
  },
  {
    name: 'Kırık Bahçe', subtitle: 'Gölgeler ışığı kokluyor.', radius: 7.0, required: 5,
    beacon: { x: 4.8, z: -4.0 },
    orbs: [{ x: -4.5, z: 3.8 }, { x: 0.2, z: 4.7 }, { x: 4.4, z: 2.5 }, { x: -3.2, z: -2.9 }, { x: 1.4, z: -3.6 }],
    enemies: [{ x: -5.0, z: 0.0 }, { x: 4.0, z: 0.3 }, { x: 0.8, z: -4.8 }],
    sky: [0.055, 0.035, 0.12], floor: [0.18, 0.13, 0.31, 1], accent: [0.67, 0.49, 1.0, 1],
  },
  {
    name: 'Sessiz Tapınak', subtitle: 'Eski fener tekrar yanmalı.', radius: 7.5, required: 6,
    beacon: { x: -4.8, z: -4.5 },
    orbs: [{ x: -4.8, z: 4.4 }, { x: 0.0, z: 4.8 }, { x: 4.8, z: 4.0 }, { x: -4.2, z: 0.0 }, { x: 4.0, z: -1.1 }, { x: 0.3, z: -4.3 }],
    enemies: [{ x: -1.8, z: 2.1 }, { x: 2.7, z: 1.2 }, { x: -2.6, z: -2.4 }, { x: 3.5, z: -3.0 }],
    sky: [0.025, 0.07, 0.08], floor: [0.10, 0.28, 0.20, 1], accent: [0.95, 0.81, 0.36, 1],
  },
  {
    name: 'Fırtına Tahtı', subtitle: 'Işık artık seni takip ediyor.', radius: 8.0, required: 7,
    beacon: { x: 0.0, z: -6.1 },
    orbs: [{ x: -5.6, z: 4.8 }, { x: -1.8, z: 5.5 }, { x: 3.7, z: 5.0 }, { x: 5.7, z: 0.8 }, { x: -5.6, z: -0.7 }, { x: -3.6, z: -4.6 }, { x: 3.7, z: -4.2 }],
    enemies: [{ x: -4.0, z: 2.2 }, { x: 0.0, z: 3.2 }, { x: 4.2, z: 2.1 }, { x: -2.5, z: -3.1 }, { x: 3.0, z: -2.9 }],
    sky: [0.04, 0.055, 0.13], floor: [0.12, 0.20, 0.36, 1], accent: [0.36, 0.72, 1.0, 1],
  },
  {
    name: 'Son Işık', subtitle: 'Gece burada bitiyor.', radius: 8.5, required: 8,
    beacon: { x: 0.0, z: 0.0 },
    orbs: [{ x: -5.8, z: 5.2 }, { x: -1.8, z: 6.0 }, { x: 3.2, z: 5.7 }, { x: 6.0, z: 2.0 }, { x: -6.2, z: 0.5 }, { x: -4.7, z: -4.5 }, { x: 0.8, z: -5.9 }, { x: 5.7, z: -3.5 }],
    enemies: [{ x: -4.1, z: 2.8 }, { x: 0.0, z: 4.1 }, { x: 4.0, z: 2.8 }, { x: -4.7, z: -1.8 }, { x: 4.7, z: -1.7 }, { x: 0.0, z: -4.2 }],
    sky: [0.02, 0.025, 0.07], floor: [0.20, 0.12, 0.28, 1], accent: [1.0, 0.52, 0.28, 1],
  },
];

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
export const distance = (ax: number, az: number, bx: number, bz: number) => Math.hypot(ax - bx, az - bz);

export function makeGame(levelIndex: number): MutableGame {
  const level = LEVELS[levelIndex];
  return {
    level: levelIndex,
    px: 0,
    pz: Math.min(level.radius - 2.2, 4.4),
    health: 100,
    energy: 100,
    orbs: level.orbs.map((o) => ({ ...o, taken: false })),
    enemies: level.enemies.map((e, i) => ({ ...e, stun: 0, phase: i * 0.9 })),
    pulseFx: 0,
    pulseCooldown: 0,
    lastHit: -10,
    ended: false,
  };
}

export function collectedLights(game: MutableGame) {
  return game.orbs.reduce((sum, orb) => sum + (orb.taken ? 1 : 0), 0);
}

export function triggerPulse(game: MutableGame) {
  if (game.energy < 35 || game.pulseCooldown > 0 || game.ended) return false;
  game.energy -= 35;
  game.pulseCooldown = 1.05;
  game.pulseFx = 0.42;
  game.enemies.forEach((enemy) => {
    const d = distance(game.px, game.pz, enemy.x, enemy.z);
    if (d < 3.7) {
      enemy.stun = 1.8;
      const inv = 1 / Math.max(0.2, d);
      enemy.x += (enemy.x - game.px) * inv * 1.5;
      enemy.z += (enemy.z - game.pz) * inv * 1.5;
    }
  });
  return true;
}

export type UpdateResult = { health: number; energy: number; lights: number; won: boolean; lost: boolean };

export function updateGame(game: MutableGame, input: InputState, dt: number, now: number): UpdateResult {
  const level = LEVELS[game.level];
  let dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  let dz = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  const mag = Math.hypot(dx, dz);
  if (mag > 0) {
    dx /= mag; dz /= mag;
    game.px += dx * 4.9 * dt;
    game.pz += dz * 4.9 * dt;
    const radial = Math.hypot(game.px, game.pz);
    const maxR = level.radius - 0.75;
    if (radial > maxR) {
      game.px = (game.px / radial) * maxR;
      game.pz = (game.pz / radial) * maxR;
    }
  }

  game.energy = Math.min(100, game.energy + 12 * dt);
  game.pulseCooldown = Math.max(0, game.pulseCooldown - dt);
  game.pulseFx = Math.max(0, game.pulseFx - dt);

  game.orbs.forEach((orb) => {
    if (!orb.taken && distance(game.px, game.pz, orb.x, orb.z) < 0.9) {
      orb.taken = true;
      game.energy = Math.min(100, game.energy + 20);
    }
  });

  game.enemies.forEach((enemy, i) => {
    const d = distance(game.px, game.pz, enemy.x, enemy.z);
    if (enemy.stun > 0) {
      enemy.stun = Math.max(0, enemy.stun - dt);
      enemy.phase += dt * 4;
    } else {
      const speed = 1.45 + game.level * 0.16 + Math.sin(enemy.phase + now) * 0.08;
      const inv = 1 / Math.max(0.001, d);
      enemy.x += (game.px - enemy.x) * inv * speed * dt;
      enemy.z += (game.pz - enemy.z) * inv * speed * dt;
      enemy.phase += dt;
    }
    const radial = Math.hypot(enemy.x, enemy.z);
    const maxR = level.radius - 0.6;
    if (radial > maxR) {
      enemy.x = (enemy.x / radial) * maxR;
      enemy.z = (enemy.z / radial) * maxR;
    }
    if (d < 0.82 && now - game.lastHit > 0.85) {
      game.lastHit = now;
      game.health = Math.max(0, game.health - (20 + Math.min(10, game.level * 2)));
      const inv = 1 / Math.max(0.1, d);
      enemy.x -= (game.px - enemy.x) * inv * 1.8;
      enemy.z -= (game.pz - enemy.z) * inv * 1.8;
    }
    if (i % 2 === 0) enemy.phase += dt * 0.15;
  });

  const lights = collectedLights(game);
  const won = lights >= level.required && distance(game.px, game.pz, level.beacon.x, level.beacon.z) < 1.25;
  const lost = game.health <= 0;
  return { health: game.health, energy: game.energy, lights, won, lost };
}
