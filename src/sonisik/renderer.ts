import { LEVELS, MutableGame, collectedLights } from './core';

const CUBE_POSITIONS = new Float32Array([
  -0.5,-0.5, 0.5,  0.5,-0.5, 0.5,  0.5, 0.5, 0.5,
  -0.5,-0.5, 0.5,  0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
   0.5,-0.5,-0.5, -0.5,-0.5,-0.5, -0.5, 0.5,-0.5,
   0.5,-0.5,-0.5, -0.5, 0.5,-0.5,  0.5, 0.5,-0.5,
  -0.5,-0.5,-0.5, -0.5,-0.5, 0.5, -0.5, 0.5, 0.5,
  -0.5,-0.5,-0.5, -0.5, 0.5, 0.5, -0.5, 0.5,-0.5,
   0.5,-0.5, 0.5,  0.5,-0.5,-0.5,  0.5, 0.5,-0.5,
   0.5,-0.5, 0.5,  0.5, 0.5,-0.5,  0.5, 0.5, 0.5,
  -0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  0.5, 0.5,-0.5,
  -0.5, 0.5, 0.5,  0.5, 0.5,-0.5, -0.5, 0.5,-0.5,
  -0.5,-0.5,-0.5,  0.5,-0.5,-0.5,  0.5,-0.5, 0.5,
  -0.5,-0.5,-0.5,  0.5,-0.5, 0.5, -0.5,-0.5, 0.5,
]);

const CUBE_NORMALS = new Float32Array([
  ...Array(6).fill([0,0,1]).flat(), ...Array(6).fill([0,0,-1]).flat(),
  ...Array(6).fill([-1,0,0]).flat(), ...Array(6).fill([1,0,0]).flat(),
  ...Array(6).fill([0,1,0]).flat(), ...Array(6).fill([0,-1,0]).flat(),
]);

type Mat4 = number[];
type Color = [number, number, number, number];

const id = (): Mat4 => [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
function mul(a: Mat4, b: Mat4): Mat4 {
  const out = new Array(16).fill(0);
  for (let c = 0; c < 4; c += 1) for (let r = 0; r < 4; r += 1) {
    out[c*4+r] = a[r]*b[c*4] + a[4+r]*b[c*4+1] + a[8+r]*b[c*4+2] + a[12+r]*b[c*4+3];
  }
  return out;
}
function trans(x: number, y: number, z: number): Mat4 { const m = id(); m[12]=x; m[13]=y; m[14]=z; return m; }
function scale(x: number, y: number, z: number): Mat4 { const m=id(); m[0]=x; m[5]=y; m[10]=z; return m; }
function rotY(a: number): Mat4 { const c=Math.cos(a), s=Math.sin(a); return [c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]; }
function perspective(fovy: number, aspect: number, near: number, far: number): Mat4 {
  const f=1/Math.tan(fovy/2), nf=1/(near-far);
  return [f/aspect,0,0,0, 0,f,0,0, 0,0,(far+near)*nf,-1, 0,0,2*far*near*nf,0];
}
function norm(v: number[]) { const l=Math.hypot(v[0],v[1],v[2])||1; return [v[0]/l,v[1]/l,v[2]/l]; }
function cross(a:number[],b:number[]) { return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]; }
function dot(a:number[],b:number[]) { return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }
function lookAt(eye:number[], center:number[], up:number[]): Mat4 {
  const z=norm([eye[0]-center[0],eye[1]-center[1],eye[2]-center[2]]), x=norm(cross(up,z)), y=cross(z,x);
  return [x[0],y[0],z[0],0, x[1],y[1],z[1],0, x[2],y[2],z[2],0, -dot(x,eye),-dot(y,eye),-dot(z,eye),1];
}

function shader(gl:any,type:number,source:string) {
  const s=gl.createShader(type); gl.shaderSource(s,source); gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)||'Shader error');
  return s;
}

export type Renderer = {
  program:any; pos:any; normal:any; aPosition:number; aNormal:number; uMVP:any; uColor:any;
};

export function createRenderer(gl:any): Renderer {
  const vs=shader(gl,gl.VERTEX_SHADER,`
    precision mediump float;
    attribute vec3 aPosition; attribute vec3 aNormal; uniform mat4 uMVP; varying float vLight;
    void main(){ vec3 l=normalize(vec3(.35,1.,.45)); vLight=.48+max(dot(normalize(aNormal),l),0.)*.52; gl_Position=uMVP*vec4(aPosition,1.); }
  `);
  const fs=shader(gl,gl.FRAGMENT_SHADER,`
    precision mediump float; uniform vec4 uColor; varying float vLight;
    void main(){ gl_FragColor=vec4(uColor.rgb*vLight,uColor.a); }
  `);
  const program=gl.createProgram(); gl.attachShader(program,vs); gl.attachShader(program,fs); gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program)||'Link error');
  gl.useProgram(program);
  const pos=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,pos); gl.bufferData(gl.ARRAY_BUFFER,CUBE_POSITIONS,gl.STATIC_DRAW);
  const aPosition=gl.getAttribLocation(program,'aPosition'); gl.enableVertexAttribArray(aPosition); gl.vertexAttribPointer(aPosition,3,gl.FLOAT,false,0,0);
  const normal=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,normal); gl.bufferData(gl.ARRAY_BUFFER,CUBE_NORMALS,gl.STATIC_DRAW);
  const aNormal=gl.getAttribLocation(program,'aNormal'); gl.enableVertexAttribArray(aNormal); gl.vertexAttribPointer(aNormal,3,gl.FLOAT,false,0,0);
  gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);
  return {program,pos,normal,aPosition,aNormal,uMVP:gl.getUniformLocation(program,'uMVP'),uColor:gl.getUniformLocation(program,'uColor')};
}

function bind(gl:any,r:Renderer) {
  gl.useProgram(r.program);
  gl.bindBuffer(gl.ARRAY_BUFFER,r.pos); gl.enableVertexAttribArray(r.aPosition); gl.vertexAttribPointer(r.aPosition,3,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,r.normal); gl.enableVertexAttribArray(r.aNormal); gl.vertexAttribPointer(r.aNormal,3,gl.FLOAT,false,0,0);
}

function cube(gl:any,r:Renderer,vp:Mat4,x:number,y:number,z:number,sx:number,sy:number,sz:number,color:Color,angle=0) {
  let model=trans(x,y,z); if(angle) model=mul(model,rotY(angle)); model=mul(model,scale(sx,sy,sz));
  gl.uniformMatrix4fv(r.uMVP,false,new Float32Array(mul(vp,model))); gl.uniform4fv(r.uColor,new Float32Array(color)); gl.drawArrays(gl.TRIANGLES,0,36);
}

export function renderScene(gl:any,r:Renderer,game:MutableGame,time:number) {
  const level=LEVELS[game.level];
  gl.viewport(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight);
  gl.clearColor(level.sky[0],level.sky[1],level.sky[2],1); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT); bind(gl,r);
  const proj=perspective(Math.PI/3.2,gl.drawingBufferWidth/Math.max(1,gl.drawingBufferHeight),.1,60);
  const view=lookAt([game.px*.25,10.6,game.pz+10.8],[game.px*.15,0,game.pz-1.2],[0,1,0]);
  const vp=mul(proj,view);

  cube(gl,r,vp,0,-1.15,0,level.radius*1.64,1.25,level.radius*1.64,[.035,.07,.09,1],.04);
  const step=2.15;
  for(let x=-level.radius;x<=level.radius;x+=step) for(let z=-level.radius;z<=level.radius;z+=step) {
    if(Math.hypot(x,z)<level.radius-.4){
      const wobble=Math.sin(x*1.7+z*1.2)*.06, shade=((Math.round(x/step)+Math.round(z/step))&1)?.92:1.08;
      cube(gl,r,vp,x,-.43+wobble,z,2,.30,2,[level.floor[0]*shade,level.floor[1]*shade,level.floor[2]*shade,1]);
    }
  }

  for(let i=0;i<8;i+=1){
    const a=i/8*Math.PI*2+game.level*.21, rr=level.radius-.65, h=.8+(i%3)*.42;
    cube(gl,r,vp,Math.cos(a)*rr,h/2-.2,Math.sin(a)*rr,.34,h,.34,[.09,.11,.17,1],a);
  }

  game.orbs.forEach((orb,i)=>{
    if(orb.taken)return;
    const bob=.72+Math.sin(time*2.4+i)*.14, spin=time*1.6+i;
    cube(gl,r,vp,orb.x,bob,orb.z,.42,.62,.42,level.accent,spin);
    cube(gl,r,vp,orb.x,.10,orb.z,.24,.16,.24,[.72,.95,1,1],spin);
  });

  const active=collectedLights(game)>=level.required, pulse=1+Math.sin(time*4)*.12;
  cube(gl,r,vp,level.beacon.x,.10,level.beacon.z,1.15,.22,1.15,[.12,.13,.18,1],.35);
  cube(gl,r,vp,level.beacon.x,.85,level.beacon.z,.34,1.55,.34,active?level.accent:[.18,.20,.25,1],time*.18);
  if(active) cube(gl,r,vp,level.beacon.x,1.72,level.beacon.z,.62*pulse,.34*pulse,.62*pulse,[1,.92,.62,1],-time);

  game.enemies.forEach((enemy,i)=>{
    const stunned=enemy.stun>0, y=.18+Math.sin(time*3+i)*.05;
    cube(gl,r,vp,enemy.x,y,enemy.z,.74,.74,.74,stunned?[.22,.42,.62,1]:[.055,.045,.085,1],enemy.phase);
    const eye:Color=stunned?[.45,.85,1,1]:[1,.18,.22,1];
    cube(gl,r,vp,enemy.x-.18,y+.16,enemy.z+.38,.10,.10,.06,eye);
    cube(gl,r,vp,enemy.x+.18,y+.16,enemy.z+.38,.10,.10,.06,eye);
  });

  cube(gl,r,vp,game.px,.22,game.pz,.62,.60,.62,[.90,.92,.95,1]);
  cube(gl,r,vp,game.px,.73,game.pz,.44,.42,.44,[.24,.31,.40,1]);
  cube(gl,r,vp,game.px,1.05,game.pz,.20,.22,.20,level.accent,time*1.8);

  if(game.pulseFx>0){
    const s=1.2+(.42-game.pulseFx)*6, c:Color=[level.accent[0],level.accent[1],level.accent[2],1];
    cube(gl,r,vp,game.px+s,.06,game.pz,.18,.12,.75,c); cube(gl,r,vp,game.px-s,.06,game.pz,.18,.12,.75,c);
    cube(gl,r,vp,game.px,.06,game.pz+s,.75,.12,.18,c); cube(gl,r,vp,game.px,.06,game.pz-s,.75,.12,.18,c);
  }
  gl.flush(); gl.endFrameEXP();
}
