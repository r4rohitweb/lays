/* A small, dependency-free WebGL pouch with optional original reverse imagery. */
'use strict';
window.CrunchPouch = class {
  constructor(canvas, source, backSource) {
    this.canvas = canvas;
    const gl = this.gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
    if (!gl) return;
    const vertex = `attribute vec3 aPosition; attribute vec3 aNormal; attribute vec2 aUV; uniform vec3 uRotation; uniform float uAspect; uniform float uScale; varying vec2 vUV; varying vec3 vNormal;
      mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);} mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);} mat3 rz(float a){float c=cos(a),s=sin(a);return mat3(c,s,0.,-s,c,0.,0.,0.,1.);}
      void main(){mat3 r=rz(uRotation.z)*ry(uRotation.y)*rx(uRotation.x); vec3 p=r*aPosition; float perspective=3.8/(3.8-p.z); gl_Position=vec4(p.x*uScale*perspective/uAspect,p.y*uScale*perspective,-p.z*.15,1.);vUV=aUV;vNormal=r*aNormal;}`;
    const fragment = `precision mediump float; uniform sampler2D uFront; uniform sampler2D uBack; uniform float uBackFace; varying vec2 vUV; varying vec3 vNormal;
      void main(){vec4 mask=texture2D(uFront,vUV);if(mask.a<.15)discard;vec4 t=uBackFace>.5?texture2D(uBack,vec2(1.-vUV.x,vUV.y)):mask;vec3 n=normalize(vNormal);float light=.68+.32*max(0.,dot(n,normalize(vec3(-.5,.8,1.2))));float spec=pow(max(0.,dot(reflect(-normalize(vec3(-.6,1.,1.)),n),vec3(0.,0.,1.))),24.)*.18;gl_FragColor=vec4(t.rgb*light+spec,mask.a);}`;
    const shader = (type, source) => { const shader = gl.createShader(type); gl.shaderSource(shader, source); gl.compileShader(shader); if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader)); return shader; };
    try {
      const program = this.program = gl.createProgram();
      gl.attachShader(program, shader(gl.VERTEX_SHADER, vertex)); gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragment)); gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Pouch shader link failed');
      gl.useProgram(program);
      this.uniforms = Object.fromEntries(['uRotation','uAspect','uScale','uFront','uBack','uBackFace'].map(name => [name, gl.getUniformLocation(program, name)]));
      this.attributes = Object.fromEntries(['aPosition','aNormal','aUV'].map(name => [name, gl.getAttribLocation(program, name)]));
      this.faces = [this.buildFace(1), this.buildFace(-1)];
      gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      this.frontTexture = this.texture(0); this.backTexture = this.texture(1);
      gl.uniform1i(this.uniforms.uFront, 0); gl.uniform1i(this.uniforms.uBack, 1);
      this.ready = false;
      const image = new Image();
      image.onload = () => {
        this.readOutline(image);
        this.faces.forEach(face => { gl.deleteBuffer(face.buffer); gl.deleteBuffer(face.index); });
        this.faces = [this.buildFace(1), this.buildFace(-1)];
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.frontTexture); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image); this.ready = true; canvas.parentElement.classList.add('webgl-ready');
        if (backSource) this.loadBack(backSource, image);
      };
      image.src = source;
      this.makeBack();
      canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); this.ready = false; canvas.parentElement.classList.remove('webgl-ready'); });
    } catch (error) { console.warn('Using CSS pouch fallback:', error.message); this.ready = false; }
  }
  loadBack(source, front) {
    const image = new Image();
    image.onload = () => {
      // Fit each photo row to the front silhouette, mirrored for back-face UVs.
      const scan = document.createElement('canvas'); scan.width = image.width; scan.height = image.height;
      const scanContext = scan.getContext('2d'); scanContext.drawImage(image, 0, 0);
      const pixels = scanContext.getImageData(0, 0, image.width, image.height).data;
      const backBounds = Array.from({ length: image.height }, (_, y) => {
        let left = 0, right = image.width - 1;
        while (left < right && pixels[(y * image.width + left) * 4 + 3] < 100) left++;
        while (right > left && pixels[(y * image.width + right) * 4 + 3] < 100) right--;
        return [left, right];
      });
      const texture = document.createElement('canvas'); texture.width = front.width; texture.height = front.height;
      const ctx = texture.getContext('2d');
      for (let y = this.firstRow; y <= this.lastRow; y++) {
        const bounds = this.outline[y]; if (!bounds) continue;
        const row = Math.min(image.height - 1, Math.round((y - this.firstRow) / Math.max(1, this.lastRow - this.firstRow) * (image.height - 1)));
        const [left, right] = backBounds[row];
        ctx.drawImage(image, left, row, Math.max(1, right - left + 1), 1, (1 - bounds[1]) * texture.width, y, (bounds[1] - bounds[0]) * texture.width, 1);
      }
      const gl = this.gl;
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.backTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture);
      this.canvas.parentElement.classList.add('original-back-ready');
    };
    image.onerror = () => console.warn('Original pouch reverse image could not be loaded.');
    image.src = source;
  }
  texture(unit) {
    const gl = this.gl; const texture = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, texture); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([235,172,40,255])); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE); return texture;
  }
  readOutline(image) {
    // Use the texture's silhouette to make the two sides meet at a closed seam.
    const canvas = document.createElement('canvas'); canvas.width=image.width; canvas.height=image.height;
    const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);const {data}=ctx.getImageData(0,0,image.width,image.height);
    const rows=[];
    for(let y=0;y<image.height;y++){
      let left=-1,right=-1;
      for(let x=0;x<image.width;x++)if(data[(y*image.width+x)*4+3]>160){if(left<0)left=x;right=x;}
      rows.push(left>=0?[left/image.width,right/image.width]:null);
    }
    this.outline=rows;this.firstRow=rows.findIndex(Boolean);this.lastRow=rows.length-1;
    while(!rows[this.lastRow]&&this.lastRow>this.firstRow)this.lastRow--;
  }
  buildFace(side) {
    const gl = this.gl, data = [], indices = [], nx = 36, ny = 44;
    const surface = (u,v) => {
      let uvX=u,uvY=v;
      if(this.outline){const row=Math.round(this.firstRow+(1-v)*(this.lastRow-this.firstRow));const bounds=this.outline[Math.max(0,Math.min(this.outline.length-1,row))]||[.03,.97];uvX=bounds[0]+u*(bounds[1]-bounds[0]);uvY=1-row/this.outline.length;}
      const x = (uvX-.5)*1.23, y = (v-.5)*1.8;
      const curve = Math.pow(Math.max(0, Math.sin(Math.PI*u)*Math.sin(Math.PI*v)),.6);
      const folds = Math.sin(u*72+v*7)*Math.pow(Math.abs(v-.5)*2,5)*.015 + Math.sin(v*32+u*16)*Math.pow(Math.abs(u-.5)*2,6)*.016;
      return [x,y,side*(.15*curve+folds*curve),uvX,uvY];
    };
    for (let j=0;j<=ny;j++) for (let i=0;i<=nx;i++) {
      const u=i/nx,v=j/ny,p=surface(u,v),px=surface(u+.001,v),py=surface(u,v+.001);
      const ax=px.map((a,k)=>a-p[k]),ay=py.map((a,k)=>a-p[k]);
      let n=[ax[1]*ay[2]-ax[2]*ay[1],ax[2]*ay[0]-ax[0]*ay[2],ax[0]*ay[1]-ax[1]*ay[0]];
      const length=Math.hypot(...n)||1;n=n.map(a=>a/length*side);data.push(...p.slice(0,3),...n,p[3],p[4]);
    }
    for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+nx+1;if(side===1)indices.push(a,a+1,b,b,a+1,b+1);else indices.push(a,b,a+1,b,b+1,a+1);}
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
    const index=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,index);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
    return {buffer,index,count:indices.length};
  }
  makeBack() {
    const c=document.createElement('canvas');c.width=512;c.height=768;const ctx=c.getContext('2d');
    const gradient=ctx.createLinearGradient(0,0,512,0);gradient.addColorStop(0,'#75000b');gradient.addColorStop(.28,'#e62323');gradient.addColorStop(.6,'#fb4733');gradient.addColorStop(1,'#92000d');ctx.fillStyle=gradient;ctx.fillRect(0,0,512,768);
    ctx.strokeStyle='#fff4';for(let i=0;i<12;i++){ctx.beginPath();ctx.moveTo(0,12+i*3);ctx.lineTo(512,12+i*3);ctx.stroke();ctx.beginPath();ctx.moveTo(0,720+i*3);ctx.lineTo(512,720+i*3);ctx.stroke();}
    ctx.fillStyle='#e02c34';ctx.beginPath();ctx.ellipse(256,130,105,48,-.1,0,Math.PI*2);ctx.fill();ctx.fillStyle='white';ctx.font='bold italic 65px Georgia';ctx.textAlign='center';ctx.fillText('Lay’s',256,151);
    ctx.fillStyle='#fff9dc';ctx.fillRect(85,235,342,345);ctx.fillStyle='#2a2415';ctx.font='bold 39px Arial';ctx.fillText('THE GOOD',256,290);ctx.fillText('STUFF.',256,337);ctx.fillRect(110,357,292,3);ctx.font='14px monospace';ctx.fillText('CRUNCH LAB / CONCEPT ART',256,393);
    for(let i=0;i<6;i++){ctx.fillStyle=i%2?'#29211555':'#29211599';ctx.fillRect(110,425+i*20,240-(i%3)*35,4);}ctx.font='11px monospace';ctx.fillText('NOT A NUTRITION LABEL',256,562);ctx.fillStyle='#292115';ctx.font='bold 15px monospace';ctx.fillText('REAL POTATOES. REAL JOY.',256,650);
    const gl=this.gl;gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,this.backTexture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);
  }
  draw(rotation,scale=1) {
    if(!this.ready)return;
    const gl=this.gl,canvas=this.canvas,dpr=Math.min(devicePixelRatio||1,1.5),width=Math.round(canvas.clientWidth*dpr),height=Math.round(canvas.clientHeight*dpr);
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);gl.uniform3fv(this.uniforms.uRotation,rotation);gl.uniform1f(this.uniforms.uAspect,width/height);gl.uniform1f(this.uniforms.uScale,scale*.85);
    this.faces.forEach((face,i)=>{gl.bindBuffer(gl.ARRAY_BUFFER,face.buffer);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,face.index);[['aPosition',3,0],['aNormal',3,12],['aUV',2,24]].forEach(([name,size,offset])=>{gl.enableVertexAttribArray(this.attributes[name]);gl.vertexAttribPointer(this.attributes[name],size,gl.FLOAT,false,32,offset);});gl.uniform1f(this.uniforms.uBackFace,i);gl.drawElements(gl.TRIANGLES,face.count,gl.UNSIGNED_SHORT,0);});
  }
};
