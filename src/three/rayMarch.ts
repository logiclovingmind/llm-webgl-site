// Continuous raymarched world for "Logic Loving Mind".
// The camera flies along +Z as the user scrolls; the scene SDFs morph
// from the Chamber of Pattern (crystal field + pillars) through the
// Space of Warmth (organic blobs) to the Palace of Convergence (a
// crystal monument with two orbiting rings), then out into the stars.
// All palette weights are driven by uProgress (0..1) so the whole thing
// reads as ONE environment that transforms — not separate sections.

export const rayMarchVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const rayMarchFragment = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform float uProgress;
uniform vec3 uCamPos;
uniform vec3 uCamRight;
uniform vec3 uCamUp;
uniform vec3 uCamForward;
uniform float uFovTan;
uniform float uAspect;
uniform vec2 uMouse;

const float MAX_DIST = 60.0;
const float SURF = 0.004;
const int   MAX_STEPS = 56;

// ---------------- hash / noise ----------------
float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x),
        mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
        mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 2; i++) {
    v += a * noise(p);
    p = p * 2.03 + 1.7;
    a *= 0.5;
  }
  return v;
}

// ---------------- SDF primitives ----------------
float sdOcta(vec3 p, float s) {
  p = abs(p);
  return (p.x + p.y + p.z - s) * 0.57735;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

vec2 rot2(vec2 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c) * p;
}

// ---------------- scene pieces ----------------
// Floating crystal field (Chamber of Pattern)
float crystal(vec3 p) {
  float env = smoothstep(18.0, 30.0, p.z) * (1.0 - smoothstep(66.0, 76.0, p.z));
  float cell = 3.4;
  vec2 idc = floor(p.xz / cell);
  vec2 fp = p.xz - idc * cell;
  vec2 h = hash2(idc);
  float xo = (h.x - 0.5) * 2.7;
  float yo = (h.y - 0.5) * 4.2;
  float s = 0.30 + h.x * 0.30 + 0.05 * sin(uTime * 0.8 + idc.x * 3.1 + idc.y * 1.7);
  vec3 cp = vec3(fp.x - xo, p.y - yo, fp.y);
  float d = sdOcta(cp, s);
  return d + (1.0 - env) * 40.0;
}

// Cathedral pillars lining the path (Chamber of Pattern)
float pillar(vec3 p) {
  float env = smoothstep(12.0, 24.0, p.z) * (1.0 - smoothstep(58.0, 68.0, p.z));
  float sp = 4.0;
  float zc = floor(p.z / sp);
  float zf = p.z - zc * sp;
  vec2 h = hash2(vec2(zc, 7.13));
  float side = h.x > 0.5 ? 1.0 : -1.0;
  float xa = side * (3.1 + h.y * 1.7);
  float hgt = 7.0 + h.y * 9.0;
  vec3 cp = vec3(p.x - xa, p.y - hgt * 0.5, zf);
  float d = sdBox(cp, vec3(0.20 + h.y * 0.22, hgt * 0.5, 0.20));
  return d + (1.0 - env) * 40.0;
}

// Organic blobs (Space of Warmth)
float blobOne(vec3 p, vec3 c, float r) {
  vec3 q = p - c;
  if (length(q) > r + 2.6) return 1e9;
  float f = fbm(q * 0.5 + vec3(0.0, uTime * 0.06, 0.0));
  return length(q) - r - f * 1.1;
}

float blob(vec3 p) {
  float env = smoothstep(74.0, 84.0, p.z) * (1.0 - smoothstep(116.0, 126.0, p.z));
  float d = 1e9;
  d = min(d, blobOne(p, vec3(0.0, 0.5, 84.0), 3.5));
  d = min(d, blobOne(p, vec3(-3.9, 1.3, 92.0), 2.4));
  d = min(d, blobOne(p, vec3(3.6, 1.7, 98.0), 2.2));
  d = min(d, blobOne(p, vec3(-1.6, 2.3, 108.0), 2.0));
  return d + (1.0 - env) * 40.0;
}

// Convergence monument: crystal core + two orbiting rings
const float MON_Z = 128.0;

vec2 mon(vec3 p) {
  vec3 q = p - vec3(0.0, 1.0, MON_Z);
  float env = 1.0 - smoothstep(6.0, 24.0, abs(p.z - MON_Z));
  float d = 1e9;
  float m = 0.0;

  float dCore = sdOcta(q, 1.55 + 0.15 * sin(uTime * 0.6));
  if (dCore < d) { d = dCore; m = 4.0; }

  vec3 q1 = q;
  q1.xz = rot2(q1.xz, uTime * 0.45);
  float dRing1 = sdTorus(q1, vec2(3.0, 0.10));
  if (dRing1 < d) { d = dRing1; m = 5.0; }

  vec3 q2 = q;
  q2.yz = rot2(q2.yz, uTime * 0.33 + 1.57);
  float dRing2 = sdTorus(q2, vec2(3.6, 0.10));
  if (dRing2 < d) { d = dRing2; m = 5.0; }

  return vec2(d + (1.0 - env) * 30.0, m);
}

vec2 map(vec3 p) {
  float d = 1e9;
  float m = 0.0;
  float dc = crystal(p);
  if (dc < d) { d = dc; m = 1.0; }
  float dp = pillar(p);
  if (dp < d) { d = dp; m = 2.0; }
  float db = blob(p);
  if (db < d) { d = db; m = 3.0; }
  vec2 mo = mon(p);
  if (mo.x < d) { d = mo.x; m = mo.y; }
  return vec2(d, m);
}

vec3 calcNormal(vec3 p) {
  const float e = 0.0011;
  vec2 k = vec2(1.0, -1.0);
  return normalize(
    k.xyy * map(p + k.xyy * e).x +
    k.yyx * map(p + k.yyx * e).x +
    k.yxy * map(p + k.yxy * e).x +
    k.xxx * map(p + k.xxx * e).x);
}

// ---------------- zone palette (blended by progress) ----------------
vec3 fogColor() {
  float p = uProgress;
  float wl = 1.0 - smoothstep(0.40, 0.60, p);
  float wv = smoothstep(0.34, 0.52, p) * (1.0 - smoothstep(0.76, 0.92, p));
  float wm = smoothstep(0.70, 0.90, p);
  vec3 base = vec3(0.012, 0.014, 0.030);
  vec3 lf = vec3(0.000, 0.050, 0.100);
  vec3 vf = vec3(0.100, 0.020, 0.070);
  vec3 mf = vec3(0.060, 0.020, 0.110);
  return base + lf * wl + vf * wv + mf * wm;
}

vec3 shade(vec3 p, vec3 n, vec3 rd, float m) {
  float prog = uProgress;
  float wl = 1.0 - smoothstep(0.40, 0.60, prog);
  float wv = smoothstep(0.34, 0.52, prog) * (1.0 - smoothstep(0.76, 0.92, prog));
  float wm = smoothstep(0.70, 0.90, prog);

  vec3 LOGIC = vec3(0.05, 0.83, 1.0);
  vec3 LOGICG = vec3(0.50, 0.95, 1.0);
  vec3 LOVE = vec3(1.0, 0.22, 0.42);
  vec3 LOVEG = vec3(1.0, 0.45, 0.65);
  vec3 MIND = vec3(0.65, 0.42, 1.0);
  vec3 MINDG = vec3(0.85, 0.60, 1.0);
  vec3 GOLD = vec3(1.0, 0.67, 0.0);

  vec3 base;
  vec3 glow;
  float g;
  if (m < 0.5) {
    base = vec3(0.02);
    glow = vec3(0.0);
    g = 0.0;
  } else if (m < 1.5) {
    float mixk = smoothstep(0.50, 0.85, prog);
    base = mix(LOGIC, MIND, mixk);
    glow = mix(LOGICG, MINDG, mixk);
    g = 0.85 * wl + 0.5 * wm;
  } else if (m < 2.5) {
    float mixk = smoothstep(0.50, 0.85, prog);
    base = mix(LOGIC * 0.6, MIND * 0.75, mixk);
    glow = LOGICG;
    g = 0.9 * wl + 0.2 * wm;
  } else if (m < 3.5) {
    base = mix(LOVE, GOLD, 0.25);
    glow = LOVEG;
    g = 1.0 * wv;
  } else if (m < 4.5) {
    base = MIND * 0.55 + GOLD * 0.45;
    glow = MINDG + GOLD * 0.5;
    g = 1.6 * (0.35 + 0.65 * wm);
  } else {
    base = mix(LOGIC, LOVE, 0.5);
    glow = mix(LOGICG, LOVEG, 0.5);
    g = 1.3 * wm;
  }

  vec3 L = normalize(vec3(0.35, 0.8, 0.45));
  float dif = clamp(dot(n, L), 0.0, 1.0);
  float rim = pow(1.0 - abs(dot(n, rd)), 2.5);
  float pulse = 0.4 + 0.25 * sin(uTime * 2.0 + p.x * 0.3 + p.y * 0.3);

  vec3 col = base * (0.15 + dif * 0.9);
  col += glow * (g * 0.6 + rim * 1.3);
  col += glow * g * pulse * 0.35;
  return col;
}

vec3 background(vec3 rd) {
  vec3 bg = fogColor();
  float tw = 0.5 + 0.5 * sin(uTime * 2.5);
  vec2 ang = vec2(atan(rd.z, rd.x), asin(clamp(rd.y, -1.0, 1.0)));
  vec2 id = floor(ang * vec2(56.0, 34.0));
  float sh = hash(vec3(id, 1.0));
  float star = smoothstep(0.988, 1.0, sh);

  float p = uProgress;
  float wl = 1.0 - smoothstep(0.40, 0.60, p);
  float wv = smoothstep(0.34, 0.52, p) * (1.0 - smoothstep(0.76, 0.92, p));
  float wm = smoothstep(0.70, 0.90, p);
  float bright = 0.35 + 0.55 * wl + 0.40 * wv + 0.60 * wm;

  bg += vec3(0.85, 0.9, 1.0) * star * bright * (0.4 + 0.6 * tw);

  // faint galactic band, strongest in the hero and outro
  float band = exp(-abs(rd.y) * 7.0);
  bg += vec3(0.5, 0.6, 1.0) * band * 0.018 * (0.3 + wl + 0.4 * wm);
  return bg;
}

vec3 finish(vec3 col, float t) {
  // depth fog toward the zone-tinted void
  vec3 fog = fogColor();
  col = mix(col, fog, clamp(1.0 - exp(-t * t * 0.00035), 0.0, 1.0));
  // filmic-ish tone + gamma
  col = 1.0 - exp(-col * 1.1);
  col = pow(col, vec3(0.4545));
  return col;
}

void main() {
  vec2 ndc = vUv * 2.0 - 1.0;
  vec3 ro = uCamPos;
  vec3 rd = normalize(
    uCamForward * uFovTan +
    uCamRight * (ndc.x * uFovTan * uAspect) +
    uCamUp * ndc.y * uFovTan);

  float t = 0.03;
  bool hit = false;
  float m = 0.0;
  vec3 p = ro;

  for (int i = 0; i < MAX_STEPS; i++) {
    p = ro + rd * t;
    vec2 h = map(p);
    if (h.x < SURF) {
      vec3 n = calcNormal(p);
      m = h.y;
      // small AO from the first step
      vec3 col = shade(p, n, rd, m) * clamp(1.0 + h.x * 3.0, 0.6, 1.0);
      gl_FragColor = vec4(finish(col, t), 1.0);
      hit = true;
      break;
    }
    t += h.x * 0.85;
    if (t > MAX_DIST) break;
  }

  if (!hit) {
    vec3 col = background(rd);
    gl_FragColor = vec4(finish(col, t), 1.0);
  }
}
`
