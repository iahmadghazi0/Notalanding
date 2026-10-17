import { WebGLRenderer, Scene, PerspectiveCamera, Mesh, PlaneGeometry, ShaderMaterial, TextureLoader, LinearFilter, Group, Vector2, MathUtils } from 'three'

/* Signature hero moment: the three sample sheets as real paper in 3D depth.
   They rise in one by one, drift gently, tilt with the pointer and catch a sheen.
   Returns null when WebGL is missing. The flat CSS sheets stay as the fallback. */
export interface Hero3D { dispose(): void }

const VERT = `varying vec2 vUv; uniform float uBend,uTime,uSeed; void main(){vUv=uv;vec3 p=position;
p.z+=(sin(p.x*2.4+uTime*.8+uSeed)*.022+sin(p.y*3.0-uTime*.6+uSeed)*.016)*uBend;
gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`
const FRAG = `precision highp float;varying vec2 vUv;uniform sampler2D uTex;uniform float uA,uTime,uSeed,uDim,uAsp;
float rr(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
void main(){vec2 p=(vUv-.5)*vec2(uAsp,1.);float d=rr(p,vec2(uAsp*.5,.5),.022);
float m=1.-smoothstep(-.004,.004,d);
vec4 c=texture2D(uTex,vUv);
float sh=smoothstep(.10,0.,abs(vUv.x*1.1+vUv.y*.6-fract(uTime*.05+uSeed)*2.6+.7));
vec3 col=c.rgb*(1.-uDim)+sh*.10;
gl_FragColor=vec4(col*m*uA,m*uA);}`
const SHVERT = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`
const SHFRAG = `precision highp float;varying vec2 vUv;uniform float uA;void main(){vec2 p=vUv-.5;float a=exp(-dot(p*vec2(4.6,6.0),p*vec2(4.6,6.0)))*.34*uA;gl_FragColor=vec4(.04,.12,.08,1.)*a;}`

export function createHero3D(canvas: HTMLCanvasElement, opts: { reduced: boolean; onReady?: () => void; onFail?: () => void }): Hero3D | null {
  let renderer: WebGLRenderer
  try { renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power', premultipliedAlpha: true }) } catch { return null }
  const small = matchMedia('(max-width: 900px)').matches
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 2))
  renderer.setClearColor(0x000000, 0)
  const scene = new Scene()
  const cam = new PerspectiveCamera(28, 1, 0.1, 50); cam.position.z = 6
  const SW = 0.707, SH = 1 // sheet plane height 1, width .707
  const loader = new TextureLoader()
  const specs = [
    { src: 'photos/blueprint-3.webp', x: 0.50, y: 0.02, z: -0.5, r: -0.16, ry: -0.2, s: 0.80, seed: 2, dim: 0.06, delay: 0.55 },
    { src: 'photos/blueprint-2.webp', x: -0.48, y: -0.04, z: -0.25, r: 0.12, ry: 0.22, s: 0.86, seed: 1, dim: 0.03, delay: 0.4 },
    { src: 'photos/blueprint-1.webp', x: 0.04, y: -0.02, z: 0.2, r: -0.02, ry: 0, s: 1.0, seed: 0, dim: 0, delay: 0.25 },
  ]
  let loaded = 0
  const group = new Group(); scene.add(group)
  const sheets = specs.map(sp => {
    const tex = loader.load(sp.src, () => { if (++loaded === specs.length) { need = true; start() } })
    tex.minFilter = LinearFilter; tex.anisotropy = 4
    const U = { uTex: { value: tex }, uA: { value: 0 }, uTime: { value: 0 }, uSeed: { value: sp.seed }, uBend: { value: opts.reduced ? 0 : 1 }, uDim: { value: sp.dim }, uAsp: { value: SW } }
    const mesh = new Mesh(new PlaneGeometry(SW, SH, 24, 32), new ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: U, transparent: true, depthWrite: false }))
    const shU = { uA: { value: 0 } }
    const shadow = new Mesh(new PlaneGeometry(SW * 1.5, SH * 0.5), new ShaderMaterial({ vertexShader: SHVERT, fragmentShader: SHFRAG, uniforms: shU, transparent: true, depthWrite: false }))
    const holder = new Group(); holder.add(shadow); holder.add(mesh); group.add(holder)
    return { sp, mesh, U, shadow, shU, holder }
  })
  const fit = () => {
    const r = canvas.getBoundingClientRect(); const w = Math.max(1, r.width), h = Math.max(1, r.height)
    renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix()
    const vh = 2 * Math.tan((cam.fov * Math.PI) / 360) * cam.position.z, vw = vh * cam.aspect
    // front sheet takes ~88% of height, but must also fit the width with its fan
    const base = Math.min(vh * (vw < vh * 1.2 ? 0.80 : 0.96), (vw * 0.84) / (SW + 0.55 + 0.3))
    group.scale.setScalar(base); need = true
  }
  const ro = new ResizeObserver(fit); ro.observe(canvas)
  const hero = canvas.parentElement!.parentElement as HTMLElement
  const tgt = new Vector2(), cur = new Vector2()
  const onMove = (e: PointerEvent) => { const r = hero.getBoundingClientRect(); tgt.set(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2) }
  if (!opts.reduced) hero.addEventListener('pointermove', onMove, { passive: true })
  let need = true, visible = true, raf = 0, lastT = 0, slow = 0, frames = 0, ready = false, dead = false
  const t0 = performance.now(), io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) start() }); io.observe(canvas)
  const ease = (t: number) => 1 - Math.pow(1 - MathUtils.clamp(t, 0, 1), 3)
  function fail() { if (dead) return; dead = true; dispose(); opts.onFail?.() }
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); fail() })
  function frame() {
    raf = 0; if (!visible || dead || loaded < specs.length) return
    const now = performance.now()
    if (small && now - lastT < 33) { raf = requestAnimationFrame(frame); return }
    if (lastT) { const dt = now - lastT; frames++; if (frames > 10 && dt > 90) slow++; else if (dt < 45 && slow > 0) slow--; if (slow > 30) { fail(); return } }
    lastT = now
    const t = (now - t0) / 1000
    cur.lerp(tgt, 0.06)
    group.rotation.y = cur.x * 0.16; group.rotation.x = cur.y * 0.08
    sheets.forEach((s, i) => {
      const p = opts.reduced ? 1 : ease((t - 0.1 - s.sp.delay) / 1.1)
      const bob = opts.reduced ? 0 : Math.sin(t * 0.7 + i * 1.7) * 0.012
      s.holder.position.set(s.sp.x * (0.6 + 0.4 * p), s.sp.y + 0.03 + bob - (1 - p) * 0.35, s.sp.z + cur.x * (i - 1) * 0.02)
      s.holder.rotation.set(0, s.sp.ry, s.sp.r * p)
      s.holder.scale.setScalar(s.sp.s)
      s.shadow.position.set(0.03, -0.50, -0.02)
      s.U.uA.value = p; s.U.uTime.value = t; s.shU.uA.value = p
    })
    try { renderer.render(scene, cam) } catch { fail(); return }
    if (!ready) { ready = true; opts.onReady?.() }
    if (!opts.reduced || t < 0.5) raf = requestAnimationFrame(frame)
  }
  function start() { if (!raf && visible) raf = requestAnimationFrame(frame) }
  fit(); start()
  function dispose() { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); hero.removeEventListener('pointermove', onMove); renderer.dispose() }
  return { dispose }
}
