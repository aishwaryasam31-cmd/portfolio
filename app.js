import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,signOut} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,collection,doc,getDoc,getDocs,setDoc,addDoc,deleteDoc,query,orderBy} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {firebaseConfig,OWNER_EMAIL} from "./firebase-config.js";

const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
const $=s=>document.querySelector(s);
const esc=t=>String(t??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const safe=u=>/^https?:\/\//i.test(u||"")?esc(u):"";

// What each section stores. [field, label, "t"=textarea | "i"=one image | "m"=many images]
const KINDS={
 internships:[["role","Role"],["org","Institute / company"],["loc","Location"],["dates","Dates (e.g. May 2025 – Jul 2025)"],["tools","Tools used"],["link","Credential link (optional)"],["desc","What you did","t"]],
 projects:[["title","Project title"],["desc","Description","t"],["tools","Tools (comma separated)"],["github","GitHub link (optional)"],["live","Live demo link (optional)"],["imgs","Project images (you can select several)","m"]],
 certificates:[["title","Certificate name"],["org","Issued by"],["date","Date (optional)"],["link","Verify link (optional)"],["img","Certificate image","i"]],
 achievements:[["title","Title (e.g. First Prize)"],["org","Event / organisation"],["desc","Details","t"],["img","Photo of certificate / medal (proof)","i"]]};
const PROFILE=[["photo","Your photo","i"],["linkedin","LinkedIn URL"],["github","GitHub URL"],["email","Email"],["resume","Resume link (Google Drive etc.)"]];
const START={
 internships:[{role:"AI Web Development Intern",org:"I-BACUS-TECH",loc:"",dates:"1 month, completed 28/07/2026",tools:"",link:"",desc:"Certificate ID: IBT/0726/OFF505"},{role:"UI/UX Design Intern",org:"Srishti Campus (Chrysalis Innovative Educational Services Pvt. Ltd.)",loc:"Trivandrum",dates:"May 2025 – Jul 2025",tools:"",link:"",desc:"Worked on UI/UX design for web and mobile apps; created wireframes and prototypes."},{role:"IBM Internship",org:"IBM",loc:"",dates:"",tools:"",link:"",desc:""}],
 projects:[{title:"Smart Dustbin & Municipal Waste Management",desc:"A smart waste segregation system with real-time monitoring and a municipal dashboard.",tools:"Flutter, IoT, AI"},{title:"Healthcare Appointment System (MedCare)",desc:"A web application to streamline hospital appointments and patient management.",tools:"React, Node.js, MongoDB"},{title:"AI-Based Flood Prediction and Monitoring System",desc:"A machine learning model to predict flood-prone areas using weather data.",tools:"Python, ML, APIs"},{title:"Smart Task Manager App",desc:"An Android app to add tasks and sort them by priority.",tools:"Android Studio, XML"}],
 certificates:[{title:"Agile Methodology",org:"Infosys Springboard"},{title:"IBM Internship",org:"IBM"},{title:"Naan Mudhalvan Course",org:"Tamil Nadu Government"},{title:"Wipro Python AIML Training",org:"Wipro"},{title:"Spring 5 Basic with Spring Boot",org:"Infosys Springboard"},{title:"Spring Data JPA With Boot",org:"Infosys Springboard"},{title:"Spring REST",org:"Infosys Springboard"},{title:"AI Web Development Internship",org:"I-BACUS-TECH",date:"28/07/2026"}],
 achievements:[{title:"First Prize",org:"Smart Dustbin Business Idea Presentation (Inter-Department)"},{title:"Third Prize",org:"SmartEngine Hackathon",desc:"Digital Health Management System"},{title:"Debate Competition Winner",org:"Kanyakumari District",desc:"“Waste management is a public responsibility”"},{title:"Participation",org:"SmartEngine Hackathon"},{title:"Various Symposiums",org:"National level events",desc:"Participated in national level events and mini project presentations."}]};

let D={},P={},owner=false;
const YEARS=[["y1","Year 1 CGPA"],["y2","Year 2 CGPA"],["y3","Year 3 CGPA"],["y4","Year 4 CGPA"],["overall","Overall / current CGPA (shown in the box below)"]];
const cg=()=>P.cgpa||{overall:"8.52"};
const tags=t=>String(t||"").split(",").filter(x=>x.trim()).map(x=>`<span>${esc(x.trim())}</span>`).join("");
const link=(u,l)=>safe(u)?`<a class="btn sm o" href="${safe(u)}" target="_blank" rel="noopener">${l}</a>`:"";
const del=(k,id)=>`<button class="btn sm d own" data-del="${k}:${id}">Delete</button>`;
const slider=(l,alt)=>l.length<2?img(l[0],alt):`<div class="car">${l.map((s,i)=>`<img class="im zoom${i?"":" on"}" src="${s}" alt="${esc(alt)} ${i+1}">`).join("")}<button class="car-btn pv" data-d="-1" aria-label="Previous image">‹</button><button class="car-btn nx" data-d="1" aria-label="Next image">›</button><span class="ct">1 / ${l.length}</span></div>`;
const img=(s,alt)=>s?`<img class="im zoom" src="${s}" alt="${esc(alt)}">`:"";
const T={
 internships:i=>`<div class="card"><div class="in"><h3>${esc(i.role)}</h3><b>${esc(i.org)}${i.loc?", "+esc(i.loc):""}</b>${i.dates?`<span class="mu">Days: ${esc(i.dates)}</span>`:""}${i.tools?`<span class="mu">Tools used: ${esc(i.tools)}</span>`:""}${i.desc?`<span class="mu">${esc(i.desc)}</span>`:""}<div class="row">${link(i.link,"View Credential")}${del("internships",i.id)}</div></div></div>`,
 projects:p=>`<div class="card">${slider(p.imgs?.length?p.imgs:(p.img?[p.img]:[]),p.title)}<div class="in"><h3>${esc(p.title)}</h3><span class="mu">${esc(p.desc)}</span><div class="tags">${tags(p.tools)}</div><div class="row">${link(p.github,"GitHub")}${link(p.live,"Live demo")}<button class="btn sm o own" data-more="${p.id}">+ Add images</button>${del("projects",p.id)}</div></div></div>`,
 certificates:c=>`<div class="card">${img(c.img,c.title)}<div class="in"><h3>${esc(c.title)}</h3><span class="mu">${esc(c.org)}${c.date?" · "+esc(c.date):""}</span><div class="row">${link(c.link,"Verify")}${del("certificates",c.id)}</div></div></div>`,
 achievements:a=>`<div class="card">${img(a.img,"Proof: "+a.title)}<div class="in"><h3>🏆 ${esc(a.title)}</h3><b>${esc(a.org)}</b>${a.desc?`<span class="mu">${esc(a.desc)}</span>`:""}${del("achievements",a.id)}</div></div>`};

function render(){
 for(const k in KINDS)$("#l-"+k).innerHTML=D[k]?.length?D[k].map(T[k]).join(""):'<div class="empty">Nothing here yet.</div>';
 $("#photo").innerHTML=P.photo?`<img src="${P.photo}" alt="Aishwarya S">`:"[ Your photo ]";
 const r=$("#resume");r.hidden=!safe(P.resume);r.href=safe(P.resume)||"#";
 const L=[["linkedin","LinkedIn"],["github","GitHub"]].map(([k,n])=>link(P[k],n)).join("");
 $("#social").innerHTML=L;
 $("#contactlinks").innerHTML=(P.email?`<a class="btn" href="mailto:${esc(P.email)}">${esc(P.email)}</a>`:"")+L||'<span class="mu">Contact links will appear here.</span>';
 $("#cgpa-line").innerHTML=YEARS.slice(0,4).filter(([k])=>cg()[k]).map(([k],i)=>`Year ${i+1}: <b>${esc(cg()[k])}</b>`).join(" · ");
 $("#stats").innerHTML=[[cg().overall||[cg().y4,cg().y3,cg().y2,cg().y1].find(x=>x)||"–","CGPA"],[D.projects?.length||0,"Projects"],[D.internships?.length||0,"Internships"],[D.certificates?.length||0,"Certificates"]].map(([v,l])=>`<div class="stat"><b>${v}</b><span class="mu">${l}</span></div>`).join("");
}
async function load(){
 try{
  for(const k in KINDS){const s=await getDocs(query(collection(db,k),orderBy("t","desc")));D[k]=s.docs.map(d=>({id:d.id,...d.data()}))}
  const p=await getDoc(doc(db,"site","profile"));P=p.exists()?p.data():{};
 }catch(e){console.error(e);for(const k in KINDS)D[k]=D[k]||[]}
 render();
}
// Resize images so they fit in Firestore (free plan, no Storage needed).
const shrink=(f,m=900)=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,m/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=im.width*s;c.height=im.height*s;c.getContext("2d").drawImage(im,0,0,c.width,c.height);ok(c.toDataURL("image/jpeg",.75))};im.onerror=no;im.src=r.result};r.onerror=no;r.readAsDataURL(f)});
function form(title,fields,init,onSave){
 const D_=$("#dlg");
 D_.innerHTML=`<h3 style="margin:0">${title}</h3>${fields.map(([k,l,t])=>`<label>${l}</label>${t=="t"?`<textarea name="${k}" rows="3">${esc(init[k]||"")}</textarea>`:t=="i"?`<input type="file" name="${k}" accept="image/*">`:t=="m"?`<input type="file" name="${k}" accept="image/*" multiple>`:`<input name="${k}" value="${esc(init[k]||"")}">`}`).join("")}<div class="row"><button class="btn" id="ok">Save</button><button class="btn o" id="no">Cancel</button></div>`;
 D_.showModal();$("#no").onclick=()=>D_.close();
 $("#ok").onclick=async()=>{const b=$("#ok");b.disabled=true;b.textContent="Saving…";const o={};
  try{for(const[k,,t]of fields){const el=D_.querySelector(`[name=${k}]`);if(t=="i"){if(el.files[0])o[k]=await shrink(el.files[0],k=="photo"?600:900)}else if(t=="m"){const L=[];for(const f of el.files)L.push(await shrink(f,700));if(L.join("").length>900000)throw new Error("Images are too big together. Please select fewer images (about 6 or less).");if(L.length)o[k]=L}else o[k]=el.value.trim()}
  await onSave(o);D_.close();await load()}catch(e){alert("Could not save: "+(e.message||e));b.disabled=false;b.textContent="Save"}}}
const add=k=>form("Add "+k.slice(0,-1),KINDS[k],{},o=>addDoc(collection(db,k),{...o,t:Date.now()}));

document.addEventListener("click",async e=>{
 const a=e.target.closest("[data-add]");if(a)add(a.dataset.add);
 const m=e.target.closest("[data-more]");if(m){const id=m.dataset.more,p=D.projects.find(x=>x.id==id),cur=p.imgs?.length?p.imgs:(p.img?[p.img]:[]);
  form("Add more images",[["imgs","Select one or more images","m"]],{},async o=>{if(!o.imgs)throw new Error("Please select at least one image.");const all=[...cur,...o.imgs];if(all.join("").length>900000)throw new Error("Too many / too large images for one project. Please add fewer.");await setDoc(doc(db,"projects",id),{imgs:all},{merge:true})});return}
 const cb=e.target.closest(".car-btn");if(cb){const car=cb.closest(".car"),im=[...car.querySelectorAll("img.im")];let i=im.findIndex(x=>x.classList.contains("on"));im[i].classList.remove("on");i=(i+(+cb.dataset.d)+im.length)%im.length;im[i].classList.add("on");car.querySelector(".ct").textContent=(i+1)+" / "+im.length;return}
 const d=e.target.closest("[data-del]");if(d&&confirm("Delete this item?")){const[k,id]=d.dataset.del.split(":");await deleteDoc(doc(db,k,id));load()}
 const z=e.target.closest("img.zoom");if(z){$("#dlg").innerHTML=`<img class="big" src="${z.src}" alt="">`;$("#dlg").showModal()}
 if(e.target==$("#dlg"))$("#dlg").close();
 if(e.target.closest("#menu"))$("#nav").classList.toggle("open");
 if(e.target.closest("#nav a"))$("#nav").classList.remove("open");
});
$("#cgpa-edit").onclick=()=>form("Edit CGPA",YEARS,cg(),o=>setDoc(doc(db,"site","profile"),{...P,cgpa:o}));
$("#prof").onclick=()=>form("Edit profile & links",PROFILE,P,o=>setDoc(doc(db,"site","profile"),{...P,...o}));
$("#seed").onclick=async()=>{if(!confirm("Add the starter content to your database?"))return;let n=0;for(const k in START)for(const x of START[k])await addDoc(collection(db,k),{...x,t:Date.now()-(n++)});load()};
$("#adm").onclick=()=>{
 if(owner)return signOut(auth);
 form("Admin login",[["email","Email"],["pw","Password"]],{},async o=>{await signInWithEmailAndPassword(auth,o.email,o.pw)});
 $("#dlg").querySelector("[name=pw]").type="password";
};
onAuthStateChanged(auth,u=>{owner=!!u&&u.email===OWNER_EMAIL;document.body.classList.toggle("admin",owner);$("#adm").textContent=owner?"Logout":"Admin"});
load();