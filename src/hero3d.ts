import {
  WebGLRenderer, Scene, PerspectiveCamera, Mesh, PlaneGeometry, ShaderMaterial,
  TextureLoader, SRGBColorSpace, Vector2, Vector3, LinearFilter,
} from 'three'

/**
 * Hero showpiece: a light-weight WebGL scene.
 *  1. A paper-and-ink flow field (one fragment shader, transparent, so the page grid shows through).
 *  2. The real NOTA mark as a bendable sheet in real 3D depth: it tilts with the pointer,
 *     ripples like paper, and a brush-edged wipe reveals it on load.
 * Returns a handle, or null when WebGL is unavailable (the CSS mark stays as the fallback).
 */
export interface Hero3D { reveal(): void; dispose(): void }
export interface Hero3DOpts { reduced: boolean; onReady?: () => void; onFail?: () => void }

const BG_VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`
const BG_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime, uReveal, uAspect; uniform vec2 uMouse; uniform vec3 uInk, uMint;
float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
float fbm(vec2 p){ float a=.5, s=0.; for(int i=0;i<4;i++){ s+=a*n(p); p=p*2.02+vec2(3.1,1.7); a*=.5; } return s; }
void main(){
  vec2 uv=vUv; vec2 p=(uv-.5)*vec2(uAspect,1.0);
  float t=uTime*.045;
  vec2 q=vec2(fbm(p*1.6+t), fbm(p*1.6-t+4.0));
  float f=fbm(p*1.3+q*1.9+vec2(0.,t*2.));
  // contour lines of the field: thin ink strokes
  float lines=smoothstep(.0,.035,abs(fract(f*7.0)-.5)-.455)*0.0 + (1.0-smoothstep(.0,.05,abs(fract(f*9.0)-.5)));
  // soft green cloud, strongest on the right and near the pointer
  vec2 m=(uMouse-.5)*vec2(uAspect,1.0);
  float near=exp(-pow(length(p-m),2.0)*2.6);
  float side=smoothstep(-.35,.55,p.x);
  float cloud=smoothstep(.25,.85,f)*(.35+.65*side)+near*.55;
  float a=(cloud*.30+lines*.16*(.4+side))*uReveal;
  vec3 col=mix(uMint,vec3(.05,.42,.27),lines);
  gl_FragColor=vec4(col*a,a);
}`
const MARK_VERT = /* glsl */ `
varying vec2 vUv; uniform float uTime, uBend; uniform vec2 uTilt;
void main(){ vUv=uv; vec3 p=position;
  float w=sin(p.x*2.2+uTime*.9)*.05+sin(p.y*3.1-uTime*.7)*.035;
  p.z+=w*uBend+ (p.x*uTilt.x*.35)+(p.y*uTilt.y*.35);
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0); }`
const MARK_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv; uniform sampler2D uTex; uniform float uTime, uReveal, uOpacity;
float h(vec2 p){ return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
void main(){
  vec4 c=texture2D(uTex,vUv);
  // brush-edged wipe from left to right
  float edge=vUv.x*.85+ (n(vec2(vUv.y*14.0,3.0))-.5)*.22 + (n(vUv*40.0)-.5)*.06;
  float wipe=smoothstep(uReveal*1.3-.18, uReveal*1.3-.02, edge)*-1.0+1.0;
  // light sheen sweeping across the strokes
  float sheen=smoothstep(.12,.0,abs(vUv.x*1.2+vUv.y*.5-fract(uTime*.07)*2.4+.6));
  vec3 col=c.rgb+sheen*.35;
  gl_FragColor=vec4(col, c.a*wipe*uOpacity*(1.0));
  gl_FragColor.rgb*=gl_FragColor.a;
}`

export function createHero3D(canvas: HTMLCanvasElement, opts: Hero3DOpts): Hero3D | null {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power', premultipliedAlpha: true })
  } catch { return null }
  const small = matchMedia('(max-width: 900px)').matches
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1 : 1.5))
  renderer.setClearColor(0x000000, 0)
  const scene = new Scene()
  const cam = new PerspectiveCamera(30, 1, 0.1, 50); cam.position.z = 6

  const U = {
    uTime: { value: 0 }, uReveal: { value: opts.reduced ? 1 : 0 }, uAspect: { value: 1 },
    uMouse: { value: new Vector2(.7, .45) }, uInk: { value: new Vector3(.07, .07, .065) }, uMint: { value: new Vector3(.18, .80, .52) },
  }
  const bg = new Mesh(new PlaneGeometry(1, 1), new ShaderMaterial({ vertexShader: BG_VERT, fragmentShader: BG_FRAG, uniforms: U, transparent: true, depthWrite: false }))
  bg.position.z = -4; bg.visible = !small; scene.add(bg)

  const tex = new TextureLoader().load('./nota-logo.png', () => { tex.colorSpace = SRGBColorSpace; need = true; start() })
  tex.minFilter = LinearFilter
  const MU = { uTex: { value: tex }, uTime: U.uTime, uReveal: U.uReveal, uOpacity: { value: small ? 0.3 : 0.9 }, uBend: { value: opts.reduced ? 0 : 1 }, uTilt: { value: new Vector2() } }
  const mark = new Mesh(new PlaneGeometry(3.4, 3.4 * 317 / 560, 40, 24), new ShaderMaterial({ vertexShader: MARK_VERT, fragmentShader: MARK_FRAG, uniforms: MU, transparent: true, depthWrite: false }))
  scene.add(mark)

  function layout() {
    const r = canvas.getBoundingClientRect()
    const w = Math.max(1, r.width), h = Math.max(1, r.height)
    renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix()
    U.uAspect.value = w / h
    const dist = cam.position.z - bg.position.z
    const vh = 2 * Math.tan((cam.fov * Math.PI) / 360) * dist
    bg.scale.set(vh * cam.aspect, vh, 1)
    const narrow = w < 900
    const s = narrow ? Math.min(1.5, w / 3.2) : Math.min(1.25, (w * 0.55) / 3.4 / (h / 2.6) )
    mark.scale.setScalar(narrow ? 0.5 * (w / 390) : s)
    const vh0 = 2 * Math.tan((cam.fov * Math.PI) / 360) * cam.position.z
    mark.position.set(narrow ? 0 : vh0 * cam.aspect * 0.2, narrow ? -vh0 * 0.44 : 0.05, 0)
    need = true
  }
  const ro = new ResizeObserver(layout); ro.observe(canvas)

  const mouse = new Vector2(.7, .45), target = new Vector2(.7, .45)
  const hero = canvas.parentElement as HTMLElement
  const onMove = (e: PointerEvent) => { const r = hero.getBoundingClientRect(); target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height) }
  if (!opts.reduced) hero.addEventListener('pointermove', onMove, { passive: true })

  let need = true, visible = true, raf = 0, lastT = 0, slow = 0, frames = 0, readyFired = false, dead = false, t0 = performance.now(), revealTo = opts.reduced ? 1 : 0, started = false
  const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) start() }); io.observe(canvas)
  function fail() { if (dead) return; dead = true; try { dispose() } catch {} ; opts.onFail?.() }
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); fail() })
  function frame() {
    raf = 0
    if (!visible || dead) return
    const now = performance.now()
    if (small && now - lastT < 33) { raf = requestAnimationFrame(frame); return }
    if (lastT) { const dt = now - lastT; frames++; if (frames > 8 && dt > (small ? 70 : 90)) slow++; else if (dt < 40 && slow > 0) slow-- ; if (slow > 25) { fail(); return } }
    lastT = now
    U.uTime.value = (now - t0) / 1000
    mouse.lerp(target, 0.06); U.uMouse.value.copy(mouse)
    if (!small && !opts.reduced) {
      MU.uTilt.value.set((mouse.x - .5) * 1.4, (mouse.y - .5) * 1.0)
      mark.rotation.y = (mouse.x - .5) * -0.42; mark.rotation.x = (mouse.y - .5) * 0.28
    } else if (!opts.reduced) { mark.rotation.y = Math.sin(U.uTime.value * .4) * .12 }
    U.uReveal.value += (revealTo - U.uReveal.value) * 0.035
    try { renderer.render(scene, cam) } catch { fail(); return }
    if (!readyFired) { readyFired = true; opts.onReady?.() }
    if (!opts.reduced) raf = requestAnimationFrame(frame)
    else if (Math.abs(revealTo - U.uReveal.value) > .002) raf = requestAnimationFrame(frame)
  }
  function start() { if (!raf && visible) raf = requestAnimationFrame(frame) }
  layout(); started = true; start()
  function dispose() { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); hero.removeEventListener('pointermove', onMove); renderer.dispose() }
  return { reveal() { revealTo = 1; start() }, dispose }
}
