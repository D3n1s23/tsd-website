// DotGlobe — animated 3D dot globe / world map rendered into an SVG element
class DotGlobe {
  constructor(svg, opts = {}) {
    this.svg = svg;
    this.opts = Object.assign({
      dots: 1500,        // target number of visible dots
      radius: 220,       // sphere radius in viewBox units
      cx: 400, cy: 400,  // center in viewBox coords
      rotationSpeed: 0.00175,
      tiltX: -8 * Math.PI / 180, // small forward tilt for visual interest
      worldMap: false,   // if true: filter dots through continent mask
      color: '#c5a46d',  // fallback static fill if colorCycle is off
      colorCycle: true,  // cycle through brand colors like the logo
      colorMode: 'sync', // 'sync' (all dots same color) or 'spatial' (phase by position)
      cycleDuration: 24, // seconds per full color cycle
      pulseAmount: 0.15, // ± opacity oscillation
      pulseSpeed: 0.8,   // pulse frequency factor (rad/s)
      morph: false,      // organic deformation that periodically returns to sphere
      morphPeak: 0.06,   // max ± radius deformation when morphCycle is at 1
      morphSpeed: 0.3,   // morph cycle frequency (rad/s); period ≈ 2π/morphSpeed
    }, opts);
    this.angle = 0;
    // Hover state
    this.mouseTiltY = 0;     // target additional Y-axis tilt (rad)
    this.mouseTiltX = 0;     // target additional X-axis tilt (rad)
    this.curMouseTiltY = 0;  // smoothed current
    this.curMouseTiltX = 0;
    this.cursorX = null;     // viewBox coords or null
    this.cursorY = null;
    this.cursorRadius = 100; // viewBox units
    this.dots = this._generateDots();
    // Per-dot phases: pulse phase (random) + color phase (by longitude)
    for (let i = 0; i < this.dots.length; i++) {
      const p = this.dots[i];
      p.phase = Math.random() * Math.PI * 2;
      p.colorPhase = (Math.atan2(p.z, p.x) / (2 * Math.PI) + 1) % 1;
    }
    this.startTime = performance.now();
    this._createElements();
    this._tick = this._tick.bind(this);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.render();
    } else {
      requestAnimationFrame(this._tick);
    }
  }

  _generateDots() {
    const target = this.opts.dots;
    const dots = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    // For world map: generate a denser raw set and keep ALL land hits
    // (do not break early — must traverse full sphere from pole to pole)
    const raw = this.opts.worldMap ? target * 5 : target;
    for (let i = 0; i < raw; i++) {
      const y = 1 - (i / (raw - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      if (this.opts.worldMap) {
        if (DotGlobe._isLand(x, y, z)) dots.push({ x, y, z });
      } else {
        dots.push({ x, y, z });
      }
    }
    return dots;
  }

  // Hand-curated continent blobs as [lat, lng, radius_in_degrees]
  // Rough but recognisable as a world map.
  static _isLand(x, y, z) {
    const lat = Math.asin(y) * 180 / Math.PI;
    const lng = Math.atan2(z, x) * 180 / Math.PI;
    // Pre-compute cos(lat) for great-circle compression
    const cosLat = Math.cos(lat * Math.PI / 180);
    const blobs = DotGlobe.CONTINENTS;
    for (let i = 0; i < blobs.length; i++) {
      const blat = blobs[i][0], blng = blobs[i][1], brad = blobs[i][2];
      const dlat = lat - blat;
      let dlng = lng - blng;
      if (dlng > 180) dlng -= 360;
      else if (dlng < -180) dlng += 360;
      const adj = dlng * cosLat;
      if ((dlat * dlat + adj * adj) < (brad * brad)) return true;
    }
    return false;
  }

  // Hover API ---------------------------------------------------------------
  setMouseTilt(nx, ny, max = 0.15) {
    // nx, ny normalized cursor offset from center (-1..1). max in radians.
    this.mouseTiltY = nx * max;
    this.mouseTiltX = -ny * max;
  }
  clearMouseTilt() { this.mouseTiltY = 0; this.mouseTiltX = 0; }
  setCursor(vx, vy, radius = 100) {
    this.cursorX = vx; this.cursorY = vy; this.cursorRadius = radius;
  }
  clearCursor() { this.cursorX = null; this.cursorY = null; }
  // -------------------------------------------------------------------------

  render() {
    const { cx, cy, radius, tiltX, pulseAmount, pulseSpeed,
            morph, morphPeak, morphSpeed,
            colorMode, cycleDuration } = this.opts;
    // Smooth lerp toward mouse-tilt targets (factor 0.1 ≈ 110 ms response)
    this.curMouseTiltY += (this.mouseTiltY - this.curMouseTiltY) * 0.1;
    this.curMouseTiltX += (this.mouseTiltX - this.curMouseTiltX) * 0.1;
    const totalAngleY = this.angle + this.curMouseTiltY;
    const totalTiltX = tiltX + this.curMouseTiltX;
    const cosA = Math.cos(totalAngleY);
    const sinA = Math.sin(totalAngleY);
    const cosT = Math.cos(totalTiltX);
    const sinT = Math.sin(totalTiltX);
    const elapsed = (performance.now() - this.startTime) / 1000;

    // Organic morph cycle: smooth 0..1, returns to 0 → sphere
    const morphCycle = morph ? (1 - Math.cos(elapsed * morphSpeed)) / 2 : 0;
    const morphAmt = morphCycle * morphPeak;

    // Spatial color flow base
    const baseColorT = colorMode === 'spatial' ? (elapsed / cycleDuration) % 1 : 0;

    for (let i = 0; i < this.dots.length; i++) {
      const p = this.dots[i];
      // Optional organic deformation (in untransformed frame, so it rotates
      // with the globe). Three low-freq sines per spatial axis, summed and
      // gated by morphCycle so the shape periodically settles back to sphere.
      let factor = 1;
      if (morph) {
        const a = Math.sin(elapsed * 0.3 + p.x * 2.0);
        const b = Math.sin(elapsed * 0.5 + p.y * 2.5 + 1.7);
        const c = Math.sin(elapsed * 0.4 + p.z * 2.2 + 3.1);
        factor = 1 + ((a + b + c) / 3) * morphAmt;
      }
      // Rotate around Y axis (longitude)
      const x1 =  p.x * cosA + p.z * sinA;
      const z1 = -p.x * sinA + p.z * cosA;
      const y1 = p.y;
      // Tilt around X axis (forward/back)
      const y2 = y1 * cosT - z1 * sinT;
      const z2 = y1 * sinT + z1 * cosT;
      // Orthographic projection (with morph factor)
      const sx = cx + x1 * radius * factor;
      const sy = cy + y2 * radius * factor;
      // Depth-based shading: t=1 is front, t=0 is back
      const t = (z2 + 1) / 2;
      // Subtle staggered pulse on opacity
      const pulse = 1 + pulseAmount * Math.sin(elapsed * pulseSpeed + p.phase);
      // Optional cursor magnifier
      let scaleBoost = 1, opBoost = 0;
      if (this.cursorX !== null) {
        const dx = sx - this.cursorX;
        const dy = sy - this.cursorY;
        const dist2 = dx * dx + dy * dy;
        const r2 = this.cursorRadius * this.cursorRadius;
        if (dist2 < r2) {
          const prox = 1 - Math.sqrt(dist2) / this.cursorRadius;
          const eased = prox * prox; // soft falloff
          scaleBoost = 1 + eased * 1.8;
          opBoost = eased * 0.5;
        }
      }
      const r = (0.4 + t * 0.8) * scaleBoost;
      const opacity = Math.min(1, (0.08 + t * 0.85) * pulse + opBoost);
      const el = this.elements[i];
      el.setAttribute('cx', sx.toFixed(2));
      el.setAttribute('cy', sy.toFixed(2));
      el.setAttribute('r', r.toFixed(2));
      el.setAttribute('opacity', opacity.toFixed(3));
      if (colorMode === 'spatial') {
        el.setAttribute('fill', DotGlobe._colorAt((baseColorT + p.colorPhase) % 1));
      }
    }
  }

  // Smooth interpolation through 4 brand colors (gold → mint → ice → purple → gold)
  static _colorAt(t) {
    const colors = [
      [229, 202, 156], // gold
      [102, 244, 196], // mint
      [198, 229, 236], // ice blue
      [161, 120, 188], // purple
    ];
    const seg = (t * 4) % 4;
    const i = Math.floor(seg);
    const f = seg - i;
    const e = f * f * (3 - 2 * f); // smoothstep
    const c1 = colors[i];
    const c2 = colors[(i + 1) % 4];
    const r = Math.round(c1[0] + (c2[0] - c1[0]) * e);
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * e);
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * e);
    return `rgb(${r},${g},${b})`;
  }

  _createElements() {
    const NS = 'http://www.w3.org/2000/svg';
    this.group = document.createElementNS(NS, 'g');
    this.svg.appendChild(this.group);
    if (this.opts.colorMode === 'spatial') {
      // Per-dot fill set in render(); leave group fill open
    } else if (this.opts.colorCycle) {
      // SVG SMIL animate cycles fill on the parent group; circles inherit
      const anim = document.createElementNS(NS, 'animate');
      anim.setAttribute('attributeName', 'fill');
      anim.setAttribute('values', '#E5CA9C;#66F4C4;#C6E5EC;#A178BC;#E5CA9C');
      anim.setAttribute('dur', `${this.opts.cycleDuration}s`);
      anim.setAttribute('repeatCount', 'indefinite');
      anim.setAttribute('calcMode', 'spline');
      anim.setAttribute('keyTimes', '0;0.25;0.5;0.75;1');
      anim.setAttribute('keySplines', '0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1');
      this.group.appendChild(anim);
      this.group.setAttribute('fill', '#E5CA9C');
    } else {
      this.group.setAttribute('fill', this.opts.color);
    }
    this.elements = this.dots.map(() => {
      const c = document.createElementNS(NS, 'circle');
      this.group.appendChild(c);
      return c;
    });
  }

  _tick() {
    if (!this.paused) {
      this.angle += this.opts.rotationSpeed;
      this.render();
    }
    requestAnimationFrame(this._tick);
  }
}

// Continent approximation as overlapping circular blobs
DotGlobe.CONTINENTS = [
  // North America
  [62, -100, 18], [50, -100, 22], [40, -95, 14], [33, -110, 8],
  [38, -78, 8],   [60, -130, 12], [70, -90, 14],  [25, -100, 9],
  [60, -150, 14], [70, -150, 10], [18, -75, 5],
  // Greenland
  [73, -40, 12], [80, -35, 8],
  // South America
  [-10, -60, 16], [-25, -60, 14], [-40, -65, 9],  [5, -65, 8],
  [-50, -70, 5],  [-15, -45, 7],
  // Europe
  [50, 10, 13],  [60, 30, 14], [40, 20, 9], [55, -5, 6],
  [40, 0, 6],    [60, 60, 14], [65, 18, 8], [45, 35, 7],
  // Africa
  [10, 20, 16], [-5, 20, 14], [-20, 25, 14], [-30, 25, 9],
  [25, 0, 8],   [10, -5, 6],  [-15, 45, 4],  [5, 35, 8],
  [30, 30, 6],
  // Asia
  [55, 90, 22], [40, 80, 16], [30, 100, 14], [25, 130, 11],
  [10, 105, 8], [60, 110, 16],[70, 130, 12], [40, 50, 10],
  [50, 130, 10],[55, 150, 12],[35, 130, 5],  [20, 80, 9],
  [30, 70, 8],  [38, 110, 8],
  // Australia + Oceania
  [-25, 135, 11], [-30, 145, 7], [-7, 145, 4],
  // Antarctica (4 blobs to cover all longitudes)
  [-85,   0, 28], [-85,  90, 28], [-85, 180, 28], [-85, -90, 28],
  [-78,  60, 12], [-78, -60, 12], [-78, 120, 12], [-78, -150, 12],
];
