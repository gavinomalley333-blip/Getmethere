import { useState, useEffect, useCallback, useRef } from “react”;

const TOKEN = “pk.eyJ1IjoiZ2F2aW5vbWFsbGV5MyIsImEiOiJjbW81dXR1ZGgxczVsMnBvbjdmZzVndmtxIn0.iPwtkyx8tdlAVW1Jna3NSg”;
const DC = [-77.0369, 38.9072];

const C = {
bg: “#f5f5f7”, white: “#ffffff”, sheet: “#ffffff”,
border: “#e0e0e5”, borderMid: “#c8c8d0”,
accent: “#007aff”, accentLight: “#007aff18”,
green: “#34c759”, greenLight: “#34c75918”,
orange: “#ff9500”, orangeLight: “#ff950018”,
red: “#ff3b30”, purple: “#af52de”, yellow: “#ffcc00”,
text: “#1c1c1e”, textMid: “#636366”, textDim: “#aeaeb2”,
cardShadow: “0 2px 16px rgba(0,0,0,0.08)”,
sheetShadow: “0 -4px 24px rgba(0,0,0,0.10)”,
};

const ICONS = { metro:“⬡”, bike_e:“⚡”, bike:“◎”, bus:“▣”, rideshare:“◈”, walk:“↑”, drive:“◇” };
const MODE_COLORS = { metro:C.purple, bike_e:C.green, bike:C.accent, bus:C.orange, rideshare:C.red, walk:C.textMid, drive:C.textMid };
const MODE_LABELS = { metro:“Metro”, bike_e:“E-Bike”, bike:“Bike”, bus:“Bus”, rideshare:“Rideshare”, walk:“Walk”, drive:“Drive” };
const fmt = m => m < 60 ? `${m}m` : `${Math.floor(m/60)}h ${m%60}m`;

// ── Local DC places ───────────────────────────────────────────────────────────
const PLACES = [
{id:“wp”,text:“Woodley Park Metro”,place_name:“Woodley Park Metro, Washington DC”,center:[-77.0569,38.9241]},
{id:“ch”,text:“Columbia Heights Metro”,place_name:“Columbia Heights Metro, Washington DC”,center:[-77.0328,38.9284]},
{id:“du”,text:“Dupont Circle”,place_name:“Dupont Circle, Washington DC”,center:[-77.0434,38.9096]},
{id:“us”,text:“U Street Metro”,place_name:“U Street/Cardozo Metro, Washington DC”,center:[-77.0282,38.9168]},
{id:“sh”,text:“Shaw-Howard Metro”,place_name:“Shaw-Howard Metro, Washington DC”,center:[-77.0222,38.9126]},
{id:“gp”,text:“Gallery Place”,place_name:“Gallery Place-Chinatown, Washington DC”,center:[-77.0219,38.8982]},
{id:“mc”,text:“Metro Center”,place_name:“Metro Center Station, Washington DC”,center:[-77.0282,38.8983]},
{id:“un”,text:“Union Station”,place_name:“Union Station, Washington DC”,center:[-77.0041,38.8972]},
{id:“am”,text:“Adams Morgan”,place_name:“Adams Morgan, Washington DC”,center:[-77.0418,38.9219]},
{id:“ca”,text:“Capitol Hill”,place_name:“Capitol Hill, Washington DC”,center:[-77.0069,38.8897]},
{id:“ge”,text:“Georgetown”,place_name:“Georgetown, Washington DC”,center:[-77.0633,38.9076]},
{id:“ny”,text:“Navy Yard”,place_name:“Navy Yard, Washington DC”,center:[-77.0046,38.8763]},
{id:“pe”,text:“Petworth”,place_name:“Petworth, Washington DC”,center:[-77.0197,38.9384]},
{id:“fo”,text:“Foggy Bottom Metro”,place_name:“Foggy Bottom Metro, Washington DC”,center:[-77.0500,38.9003]},
{id:“cl”,text:“Cleveland Park”,place_name:“Cleveland Park, Washington DC”,center:[-77.0586,38.9341]},
{id:“nl”,text:“National Mall”,place_name:“National Mall, Washington DC”,center:[-77.0502,38.8893]},
{id:“an”,text:“Anacostia Metro”,place_name:“Anacostia Metro, Washington DC”,center:[-76.9948,38.8637]},
{id:“fn”,text:“Farragut North Metro”,place_name:“Farragut North Metro, Washington DC”,center:[-77.0396,38.9012]},
{id:“tn”,text:“Tenleytown Metro”,place_name:“Tenleytown Metro, Washington DC”,center:[-77.0794,38.9476]},
{id:“fr”,text:“Friendship Heights”,place_name:“Friendship Heights, Washington DC”,center:[-77.0855,38.9601]},
];

// ── Sample map data (shown as pins on map) ────────────────────────────────────
const METRO_STATIONS = [
{name:“Woodley Park”,coords:[-77.0569,38.9241],line:“Red”,nextN:3,nextS:6},
{name:“Cleveland Park”,coords:[-77.0586,38.9341],line:“Red”,nextN:2,nextS:8},
{name:“Dupont Circle”,coords:[-77.0434,38.9096],line:“Red”,nextN:4,nextS:4},
{name:“Farragut North”,coords:[-77.0396,38.9012],line:“Red”,nextN:7,nextS:2},
{name:“Metro Center”,coords:[-77.0282,38.8983],line:“Red/Blue/Orange”,nextN:5,nextS:5},
{name:“Columbia Heights”,coords:[-77.0328,38.9284],line:“Green/Yellow”,nextN:3,nextS:7},
{name:“U Street”,coords:[-77.0282,38.9168],line:“Green/Yellow”,nextN:6,nextS:3},
{name:“Shaw”,coords:[-77.0222,38.9126],line:“Green/Yellow”,nextN:4,nextS:9},
{name:“Gallery Place”,coords:[-77.0219,38.8982],line:“Red/Green/Yellow”,nextN:2,nextS:6},
{name:“Union Station”,coords:[-77.0041,38.8972],line:“Red”,nextN:8,nextS:4},
{name:“Foggy Bottom”,coords:[-77.0500,38.9003],line:“Blue/Orange/Silver”,nextN:5,nextS:3},
];

const BUS_STOPS = [
{name:“16th & U St NW”,coords:[-77.0365,38.9168],routes:[“S2”,“S4”,“S9”]},
{name:“Connecticut & Calvert NW”,coords:[-77.0486,38.9215],routes:[“L2”,“96”]},
{name:“14th & Irving NW”,coords:[-77.0320,38.9267],routes:[“52”,“53”,“54”]},
{name:“Wisconsin & M NW”,coords:[-77.0623,38.9051],routes:[“31”,“33”,“36”]},
{name:“Pennsylvania & 7th NW”,coords:[-77.0219,38.8942],routes:[“70”,“74”]},
{name:“Massachusetts & Dupont”,coords:[-77.0444,38.9106],routes:[“N2”,“N4”,“N6”]},
];

const BIKE_SAMPLE = [
{name:“17th & Rhode Island Ave NW”,coords:[-77.0384,38.9094],ebikes:4,bikes:3,docks:5},
{name:“Dupont Circle North”,coords:[-77.0434,38.9118],ebikes:2,bikes:5,docks:3},
{name:“14th & Harvard St NW”,coords:[-77.0324,38.9284],ebikes:6,bikes:2,docks:4},
{name:“New Hampshire & T St NW”,coords:[-77.0382,38.9168],ebikes:1,bikes:4,docks:7},
{name:“Lincoln Memorial”,coords:[-77.0502,38.8893],ebikes:3,bikes:6,docks:2},
{name:“Union Station Bikes”,coords:[-77.0041,38.8952],ebikes:5,bikes:3,docks:4},
{name:“Columbia Heights Civic”,coords:[-77.0328,38.9264],ebikes:3,bikes:7,docks:2},
];

// ── API helpers ───────────────────────────────────────────────────────────────
async function geocode(q) {
try {
const r = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${TOKEN}&country=us&proximity=${DC[0]},${DC[1]}&limit=5`);
if (r.ok) { const j = await r.json(); if (j.features?.length) return j.features; }
} catch {}
const lq = q.toLowerCase();
return PLACES.filter(p => p.text.toLowerCase().includes(lq) || p.place_name.toLowerCase().includes(lq)).slice(0,5);
}

async function directions(o, d, profile) {
try {
const r = await fetch(`https://api.mapbox.com/directions/v5/mapbox/${profile}/${o[0]},${o[1]};${d[0]},${d[1]}?access_token=${TOKEN}&overview=full&geometries=geojson`);
if (r.ok) { const j = await r.json(); if (j.routes?.length) { const rt=j.routes[0]; return {min:Math.round(rt.duration/60),mi:(rt.distance*0.000621371).toFixed(1),geo:rt.geometry}; } }
} catch {}
const R=3958.8,rad=Math.PI/180,dLat=(d[1]-o[1])*rad,dLon=(d[0]-o[0])*rad;
const a=Math.sin(dLat/2)**2+Math.cos(o[1]*rad)*Math.cos(d[1]*rad)*Math.sin(dLon/2)**2;
const mi=R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))*1.35;
const spd={driving:14,cycling:9,walking:3}[profile];
return {min:Math.round(mi/spd*60),mi:mi.toFixed(1),geo:{type:“LineString”,coordinates:[o,d]}};
}

async function fetchBikes() {
try {
const [sr,ir]=await Promise.all([fetch(“https://gbfs.capitalbikeshare.com/gbfs/en/station_status.json”),fetch(“https://gbfs.capitalbikeshare.com/gbfs/en/station_information.json”)]);
if(!sr.ok||!ir.ok) throw 0;
const [sj,ij]=await Promise.all([sr.json(),ir.json()]);
const info={}; ij.data.stations.forEach(s=>{info[s.station_id]=s;});
return {live:true,stations:sj.data.stations.map(s=>({name:info[s.station_id]?.name||“Unknown”,coords:[info[s.station_id]?.lon,info[s.station_id]?.lat],ebikes:s.num_ebikes_available??0,bikes:s.num_bikes_available??0,docks:s.num_docks_available??0}))};
} catch { return {live:false,stations:BIKE_SAMPLE}; }
}

async function calcRoutes(oC,dC,speed,friction,bikeData) {
const sm=[0,0.75,1,1.3][speed];
const st=bikeData?.stations||BIKE_SAMPLE;
const topE=st.filter(s=>s.ebikes>0).sort((a,b)=>b.ebikes-a.ebikes)[0];
const topB=st.filter(s=>s.bikes>0).sort((a,b)=>b.bikes-a.bikes)[0];
const [drv,cyc,wlk]=await Promise.all([directions(oC,dC,“driving”),directions(oC,dC,“cycling”),directions(oC,dC,“walking”)]);
const bD=drv.min,mi=parseFloat(drv.mi),bC=Math.round(cyc.min/sm),bW=wlk.min;
const R=[];

R.push({id:“drive”,label:“Drive”,min:bD,cost:0,tr:0,geo:drv.geo,lineColor:”#636366”,legs:[{mode:“drive”,label:“Drive”,min:bD,detail:`${mi} mi`}],warn:“Parking not included”});
if(topE){const t=Math.max(bC-4,5);R.push({id:“ebike”,label:“E-Bike”,min:t+5,cost:0,tr:0,geo:cyc.geo,lineColor:C.green,hi:`${topE.ebikes} e-bikes nearby`,legs:[{mode:“walk”,label:“Walk to dock”,min:3,detail:topE.name},{mode:“bike_e”,label:“E-bike”,min:t,detail:`~${Math.round(15*sm)} mph`},{mode:“walk”,label:“Dock & walk”,min:2}]});}
const next=2+Math.floor(Math.random()*5),mMin=Math.round(bD*1.35+10);
R.push({id:“metro”,label:“Metro”,min:mMin,cost:2.25,tr:0,geo:null,lineColor:C.purple,legs:[{mode:“walk”,label:“Walk to station”,min:6},{mode:“metro”,label:“Metro”,min:mMin-14,detail:`Next train: ${next} min`},{mode:“walk”,label:“Walk to dest.”,min:8}]});
if(topE&&friction>=2){const t=Math.round(bD*1.05+4);R.push({id:“combo”,label:“Metro + E-Bike”,min:t,cost:2.25,tr:1,geo:cyc.geo,lineColor:C.accent,hi:“Best combo”,legs:[{mode:“walk”,label:“Walk to metro”,min:4},{mode:“metro”,label:“Metro”,min:Math.round(t*.45)},{mode:“bike_e”,label:“E-Bike to dest.”,min:Math.round(t*.38),detail:`${topE.ebikes} e-bikes`}]});}
const bMin=Math.round(bD*1.65+6);
R.push({id:“bus”,label:“Bus”,min:bMin,cost:2,tr:0,geo:null,lineColor:C.orange,legs:[{mode:“walk”,label:“Walk to stop”,min:4,detail:“Next bus: ~7 min”},{mode:“bus”,label:“Bus”,min:bMin-8},{mode:“walk”,label:“Walk to dest.”,min:4}]});
const surge=[1,1,1.2,1.5][Math.floor(Math.random()*4)],rMin=Math.round(bD*1.12);
R.push({id:“ride”,label:“Rideshare”,min:rMin,cost:parseFloat(((3.5+mi*1.85)*surge).toFixed(2)),tr:0,geo:drv.geo,lineColor:C.red,hi:surge===1?“No surge”:null,warn:surge>1.2?`${surge}x surge`:null,legs:[{mode:“walk”,label:“Walk to pickup”,min:2},{mode:“rideshare”,label:“Uber / Lyft”,min:rMin-2,detail:surge>1?`${surge}x surge`:“No surge”}]});
if(topB){const t=Math.max(bC+5,8);R.push({id:“bike”,label:“Bike”,min:t,cost:0,tr:0,geo:cyc.geo,lineColor:C.accent,legs:[{mode:“walk”,label:“Walk to dock”,min:3,detail:topB.name},{mode:“bike”,label:“Ride”,min:t-5},{mode:“walk”,label:“Dock & walk”,min:2}]});}
if(bW<=38)R.push({id:“walk”,label:“Walk”,min:bW,cost:0,tr:0,geo:wlk.geo,lineColor:C.textMid,hi:mi<0.8?“Just a short walk!”:null,legs:[{mode:“walk”,label:“Walk”,min:bW,detail:`${mi} miles`}]});

return R.filter(r=>r.tr<=friction).sort((a,b)=>a.min-b.min);
}

// ── Map component ─────────────────────────────────────────────────────────────
function GMTMap({oC,dC,activeRoute,bikeStations,onMapReady}) {
const el=useRef(null);
const map=useRef(null);
const [ready,setReady]=useState(false);

useEffect(()=>{
let n=0;
const init=()=>{
if(!el.current||map.current) return;
if(!window.mapboxgl){if(++n<60)setTimeout(init,200);return;}
window.mapboxgl.accessToken=TOKEN;
const m=new window.mapboxgl.Map({container:el.current,style:“mapbox://styles/mapbox/light-v11”,center:DC,zoom:13,attributionControl:false});
m.addControl(new window.mapboxgl.AttributionControl({compact:true}));
m.on(“load”,()=>{
map.current=m;
setReady(true);
if(onMapReady) onMapReady(m);
addStaticPins(m,bikeStations);
});
};
init();
},[]);

const addStaticPins=(m,bikes)=>{
// Metro pins
METRO_STATIONS.forEach(st=>{
const el=document.createElement(“div”);
el.style.cssText=`width:32px;height:32px;border-radius:50%;background:${C.purple};border:2.5px solid white;display:flex;align-items:center;justify-content:center;font-size:13px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2);color:white;font-weight:700;`;
el.innerHTML=“M”;
el.title=`${st.name}\n↑ ${st.nextN} min · ↓ ${st.nextS} min`;
new window.mapboxgl.Marker({element:el}).setLngLat(st.coords)
.setPopup(new window.mapboxgl.Popup({offset:20,closeButton:false}).setHTML(
`<div style="font-family:'SF Pro Text',system-ui,sans-serif;padding:4px 2px"><div style="font-weight:700;font-size:13px;color:#1c1c1e">${st.name}</div><div style="color:#636366;font-size:11px;margin-top:2px">${st.line} Line</div><div style="margin-top:6px;display:flex;gap:8px"><span style="background:#f0f0f5;border-radius:6px;padding:3px 8px;font-size:11px;font-weight:600">↑ ${st.nextN} min</span><span style="background:#f0f0f5;border-radius:6px;padding:3px 8px;font-size:11px;font-weight:600">↓ ${st.nextS} min</span></div></div>`
)).addTo(m);
});

```
// Bus pins
BUS_STOPS.forEach(bs=>{
  const el=document.createElement("div");
  el.style.cssText=`width:26px;height:26px;border-radius:8px;background:${C.orange};border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:11px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.15);color:white;font-weight:700;`;
  el.innerHTML="B";
  new window.mapboxgl.Marker({element:el}).setLngLat(bs.coords)
    .setPopup(new window.mapboxgl.Popup({offset:18,closeButton:false}).setHTML(
      `<div style="font-family:'SF Pro Text',system-ui,sans-serif;padding:4px 2px"><div style="font-weight:700;font-size:13px;color:#1c1c1e">${bs.name}</div><div style="color:#636366;font-size:11px;margin-top:3px">Routes: ${bs.routes.join(", ")}</div></div>`
    )).addTo(m);
});

// Bike pins
const bstations=bikes||BIKE_SAMPLE;
bstations.slice(0,20).forEach(st=>{
  if(!st.coords||!st.coords[0]) return;
  const total=st.ebikes+st.bikes;
  const col=st.ebikes>0?C.green:total>0?C.accent:"#aeaeb2";
  const el=document.createElement("div");
  el.style.cssText=`width:30px;height:30px;border-radius:50%;background:${col};border:2.5px solid white;display:flex;align-items:center;justify-content:center;font-size:10px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.18);color:white;font-weight:800;`;
  el.innerHTML=total;
  new window.mapboxgl.Marker({element:el}).setLngLat(st.coords)
    .setPopup(new window.mapboxgl.Popup({offset:20,closeButton:false}).setHTML(
      `<div style="font-family:'SF Pro Text',system-ui,sans-serif;padding:4px 2px"><div style="font-weight:700;font-size:13px;color:#1c1c1e">${st.name}</div><div style="margin-top:6px;display:flex;gap:6px"><span style="background:#34c75918;color:#34c759;border-radius:6px;padding:3px 8px;font-size:11px;font-weight:600">⚡ ${st.ebikes} e-bikes</span><span style="background:#007aff18;color:#007aff;border-radius:6px;padding:3px 8px;font-size:11px;font-weight:600">◎ ${st.bikes} bikes</span></div><div style="color:#aeaeb2;font-size:11px;margin-top:4px">${st.docks} docks free</div></div>`
    )).addTo(m);
});
```

};

useEffect(()=>{
const m=map.current;
if(!m||!ready) return;
[“gmt-route”,“gmt-o”,“gmt-d”].forEach(id=>{if(m.getLayer(id))m.removeLayer(id);if(m.getSource(id))m.removeSource(id);});
if(activeRoute?.geo){
m.addSource(“gmt-route”,{type:“geojson”,data:{type:“Feature”,geometry:activeRoute.geo}});
m.addLayer({id:“gmt-route”,type:“line”,source:“gmt-route”,paint:{“line-color”:activeRoute.lineColor||C.accent,“line-width”:4,“line-opacity”:0.85},layout:{“line-cap”:“round”,“line-join”:“round”}});
}
const dot=(id,coords,col)=>{m.addSource(id,{type:“geojson”,data:{type:“Feature”,geometry:{type:“Point”,coordinates:coords}}});m.addLayer({id,type:“circle”,source:id,paint:{“circle-radius”:9,“circle-color”:col,“circle-stroke-color”:”#fff”,“circle-stroke-width”:2.5}});};
if(oC)dot(“gmt-o”,oC,C.accent);
if(dC)dot(“gmt-d”,dC,”#1c1c1e”);
if(oC&&dC){const p=0.015;m.fitBounds([[Math.min(oC[0],dC[0])-p,Math.min(oC[1],dC[1])-p],[Math.max(oC[0],dC[0])+p,Math.max(oC[1],dC[1])+p]],{padding:60,duration:700});}
},[ready,activeRoute,oC,dC]);

return(
<div ref={el} style={{width:“100%”,height:“100%”}}>
{!ready&&<div style={{position:“absolute”,inset:0,background:”#f5f5f7”,display:“flex”,alignItems:“center”,justifyContent:“center”,color:C.textDim,fontSize:13}}>Loading map…</div>}
</div>
);
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const PinIcon = () => (
<svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 0C3.58 0 0 3.58 0 8c0 5.25 7.11 11.65 7.41 11.91a.83.83 0 001.18 0C8.89 19.65 16 13.25 16 8c0-4.42-3.58-8-8-8z" fill={C.accent}/>
<circle cx="8" cy="8" r="3" fill="white"/>
</svg>
);

const XMarkIcon = () => (
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<line x1="2" y1="2" x2="16" y2="16" stroke="#1c1c1e" strokeWidth="2.8" strokeLinecap="round"/>
<line x1="16" y1="2" x2="2" y2="16" stroke="#1c1c1e" strokeWidth="2.8" strokeLinecap="round"/>
<line x1="2" y1="9" x2="16" y2="9" stroke={C.orange} strokeWidth="1.2" strokeLinecap="round"/>
<line x1="9" y1="2" x2="9" y2="16" stroke={C.orange} strokeWidth="1.2" strokeLinecap="round"/>
</svg>
);

const LocateIcon = () => (
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="12" cy="12" r="4" fill={C.accent}/>
<circle cx="12" cy="12" r="8" stroke={C.accent} strokeWidth="2" fill="none"/>
<line x1="12" y1="2" x2="12" y2="5" stroke={C.accent} strokeWidth="2" strokeLinecap="round"/>
<line x1="12" y1="19" x2="12" y2="22" stroke={C.accent} strokeWidth="2" strokeLinecap="round"/>
<line x1="2" y1="12" x2="5" y2="12" stroke={C.accent} strokeWidth="2" strokeLinecap="round"/>
<line x1="19" y1="12" x2="22" y2="12" stroke={C.accent} strokeWidth="2" strokeLinecap="round"/>
</svg>
);

// ── GeoInput ──────────────────────────────────────────────────────────────────
function GeoInput({type,placeholder,value,onChange,onSelect}){
const [sugg,setSugg]=useState([]);
const [open,setOpen]=useState(false);
const timer=useRef(null);
const change=e=>{
const v=e.target.value;onChange(v);
clearTimeout(timer.current);
if(v.length<2){setSugg([]);setOpen(false);return;}
timer.current=setTimeout(async()=>{const r=await geocode(v);setSugg(r);setOpen(r.length>0);},260);
};
const pick=f=>{onChange(f.place_name||f.text);onSelect(f.center,f.place_name||f.text);setSugg([]);setOpen(false);};
return(
<div style={{position:“relative”}}>
<div style={{display:“flex”,alignItems:“center”,gap:10}}>
<div style={{width:20,display:“flex”,alignItems:“center”,justifyContent:“center”,flexShrink:0}}>
{type===“origin” ? <PinIcon/> : <XMarkIcon/>}
</div>
<input value={value} onChange={change} placeholder={placeholder}
onBlur={()=>setTimeout(()=>setOpen(false),160)}
onFocus={()=>sugg.length>0&&setOpen(true)}
style={{flex:1,border:“none”,outline:“none”,fontSize:15,color:C.text,background:“transparent”,fontFamily:“inherit”,padding:“2px 0”}}/>
</div>
{open&&(
<div style={{position:“absolute”,top:“calc(100% + 8px)”,left:0,right:0,zIndex:999,background:C.white,borderRadius:14,overflow:“hidden”,boxShadow:“0 4px 24px rgba(0,0,0,0.12)”,border:`1px solid ${C.border}`}}>
{sugg.map((f,i)=>(
<div key={f.id||i} onMouseDown={()=>pick(f)}
onMouseEnter={e=>e.currentTarget.style.background=”#f5f5f7”}
onMouseLeave={e=>e.currentTarget.style.background=C.white}
style={{padding:“11px 16px”,cursor:“pointer”,borderBottom:i<sugg.length-1?`1px solid ${C.border}`:“none”,background:C.white}}>
<div style={{fontSize:14,fontWeight:600,color:C.text}}>{f.text||f.place_name?.split(”,”)[0]}</div>
<div style={{fontSize:12,color:C.textDim,marginTop:1}}>{f.place_name}</div>
</div>
))}
</div>
)}
</div>
);
}

// ── Route pill (compact) ──────────────────────────────────────────────────────
function RoutePill({route,active,onClick}){
const icon={drive:“🚗”,ebike:“⚡”,metro:“⬡”,combo:“⬡”,bus:“▣”,ride:“◈”,bike:“◎”,walk:“↑”}[route.id]||”·”;
return(
<div onClick={onClick} style={{display:“flex”,flexDirection:“column”,alignItems:“center”,gap:3,padding:“10px 14px”,borderRadius:12,background:active?C.accent:C.white,border:`1px solid ${active?C.accent:C.border}`,cursor:“pointer”,transition:“all .15s”,minWidth:64,boxShadow:active?`0 2px 12px ${C.accent}44`:C.cardShadow,flexShrink:0}}>
<span style={{fontSize:18}}>{icon}</span>
<span style={{fontSize:11,fontWeight:700,color:active?”#fff”:C.text}}>{fmt(route.min)}</span>
<span style={{fontSize:10,color:active?“rgba(255,255,255,0.8)”:C.textDim}}>{route.cost>0?`$${route.cost.toFixed(2)}`:“Free”}</span>
</div>
);
}

// ── Route detail card ─────────────────────────────────────────────────────────
function RouteDetail({route}){
if(!route) return null;
return(
<div style={{padding:“4px 0 8px”}}>
<div style={{display:“flex”,alignItems:“center”,justifyContent:“space-between”,marginBottom:12}}>
<div>
<div style={{fontSize:17,fontWeight:700,color:C.text}}>{route.label}</div>
<div style={{fontSize:13,color:C.textMid,marginTop:1}}>
{route.cost>0?`$${route.cost.toFixed(2)}`:“Free”} · {fmt(route.min)}
</div>
</div>
<div style={{fontSize:28,fontWeight:800,color:C.accent,fontFamily:“system-ui”}}>{fmt(route.min)}</div>
</div>
{route.warn&&<div style={{background:C.orangeLight,border:`1px solid ${C.orange}44`,borderRadius:10,padding:“8px 12px”,fontSize:13,color:C.orange,marginBottom:12}}>⚠ {route.warn}</div>}
{route.hi&&<div style={{background:C.greenLight,border:`1px solid ${C.green}44`,borderRadius:10,padding:“8px 12px”,fontSize:13,color:C.green,marginBottom:12}}>✓ {route.hi}</div>}
<div style={{display:“flex”,flexDirection:“column”,gap:8}}>
{route.legs.map((l,i)=>(
<div key={i} style={{display:“flex”,alignItems:“center”,gap:12}}>
<div style={{width:32,height:32,borderRadius:10,background:MODE_COLORS[l.mode]+“18”,border:`1px solid ${MODE_COLORS[l.mode]}33`,display:“flex”,alignItems:“center”,justifyContent:“center”,fontSize:14,color:MODE_COLORS[l.mode],flexShrink:0}}>{ICONS[l.mode]}</div>
<div style={{flex:1}}>
<div style={{fontSize:13,fontWeight:600,color:C.text}}>{l.label}</div>
{l.detail&&<div style={{fontSize:11,color:C.textDim,marginTop:1}}>{l.detail}</div>}
</div>
<div style={{fontSize:12,color:C.textMid,fontWeight:600}}>{fmt(l.min)}</div>
</div>
))}
</div>
</div>
);
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App(){
const [oTxt,setOTxt]=useState(””);
const [dTxt,setDTxt]=useState(””);
const [oC,setOC]=useState(null);
const [dC,setDC]=useState(null);
const [speed,setSpeed]=useState(2);
const [friction,setFriction]=useState(2);
const [routes,setRoutes]=useState([]);
const [activeR,setActiveR]=useState(null);
const [bikes,setBikes]=useState(null);
const [bikeLive,setBikeLive]=useState(null);
const [busy,setBusy]=useState(false);
const [phase,setPhase]=useState(“browse”); // browse | search | results
const [showSettings,setShowSettings]=useState(false);

useEffect(()=>{
[“mbgl-css”,“mbgl-js”].forEach(id=>{
if(document.getElementById(id)) return;
if(id===“mbgl-css”){const l=document.createElement(“link”);l.id=id;l.rel=“stylesheet”;l.href=“https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css”;document.head.appendChild(l);}
else{const s=document.createElement(“script”);s.id=id;s.src=“https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js”;document.head.appendChild(s);}
});
fetchBikes().then(d=>{setBikes(d);setBikeLive(d.live);});
},[]);

const search=useCallback(async()=>{
if(!oC||!dC) return;
setBusy(true);setPhase(“results”);
const r=await calcRoutes(oC,dC,speed,friction,bikes);
setRoutes(r);setActiveR(r[0]||null);setBusy(false);
},[oC,dC,speed,friction,bikes]);

const canSearch=!!oC&&!!dC;
const sLabels=[””,“Cautious”,“Moderate”,“Aggressive”];
const sColors=[””,C.green,C.orange,C.red];
const [locating,setLocating]=useState(false);

const locateMe=()=>{
if(!navigator.geolocation) return;
setLocating(true);
navigator.geolocation.getCurrentPosition(async pos=>{
const coords=[pos.coords.longitude,pos.coords.latitude];
try{
const r=await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?access_token=${TOKEN}&types=address,neighborhood,place&limit=1`);
if(r.ok){const j=await r.json();const name=j.features?.[0]?.place_name||“Current Location”;setOTxt(name);setOC(coords);}
else{setOTxt(“Current Location”);setOC(coords);}
}catch{setOTxt(“Current Location”);setOC(coords);}
setLocating(false);setPhase(“search”);
},()=>setLocating(false),{timeout:8000});
};

return(
<div style={{width:“100%”,height:“100vh”,position:“relative”,overflow:“hidden”,fontFamily:”‘SF Pro Text’,-apple-system,BlinkMacSystemFont,‘Segoe UI’,sans-serif”}}>
<style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}input::placeholder{color:#aeaeb2}input{font-family:inherit}.mapboxgl-popup-content{border-radius:12px!important;padding:12px 14px!important;box-shadow:0 4px 20px rgba(0,0,0,0.12)!important;border:1px solid #e0e0e5!important}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

```
  {/* Full-screen map */}
  <div style={{position:"absolute",inset:0}}>
    <GMTMap oC={oC} dC={dC} activeRoute={activeR} bikeStations={bikes?.stations}/>
  </div>

  {/* Top bar */}
  <div style={{position:"absolute",top:0,left:0,right:0,padding:"16px 16px 0",zIndex:10}}>
    <div style={{maxWidth:480,margin:"0 auto"}}>

      {/* Logo */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{background:C.white,borderRadius:12,padding:"8px 14px",boxShadow:C.cardShadow,display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:22,height:22,borderRadius:6,background:C.accent,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#fff",fontSize:12,fontWeight:800}}>g</span>
          </div>
          <span style={{fontSize:15,fontWeight:700,color:C.text,letterSpacing:-0.3}}>getmethere</span>
        </div>
        <div style={{background:C.white,borderRadius:10,padding:"6px 10px",boxShadow:C.cardShadow,fontSize:11,fontWeight:600}}>
          {bikeLive===null&&<span style={{color:C.textDim}}>Loading…</span>}
          {bikeLive===true&&<span style={{color:C.green}}>● Live</span>}
          {bikeLive===false&&<span style={{color:C.orange}}>◐ Sample</span>}
        </div>
      </div>

      {/* Search card */}
      <div style={{background:C.white,borderRadius:18,padding:"14px 16px",boxShadow:"0 4px 24px rgba(0,0,0,0.10)",border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{flex:1}}>
            <GeoInput type="origin" placeholder="Starting point" value={oTxt} onChange={setOTxt} onSelect={(c,n)=>{setOC(c);setOTxt(n);setPhase("search");}}/>
          </div>
          <button onClick={locateMe} title="Use current location"
            style={{flexShrink:0,width:34,height:34,borderRadius:10,border:`1px solid ${C.border}`,background:locating?C.accentLight:C.bg,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .15s"}}>
            {locating
              ? <div style={{width:12,height:12,borderRadius:"50%",border:`2px solid ${C.accent}`,borderTopColor:"transparent",animation:"spin .7s linear infinite"}}/>
              : <LocateIcon/>}
          </button>
        </div>
        <div style={{height:1,background:C.border,margin:"10px 0 10px 30px"}}/>
        <GeoInput type="dest" placeholder="Where to?" value={dTxt} onChange={setDTxt} onSelect={(c,n)=>{setDC(c);setDTxt(n);}}/>

        {canSearch&&(
          <div style={{marginTop:12}}>
            {/* Settings toggle */}
            <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
              {[["Cautious","cautious",1,C.green],["Moderate","moderate",2,C.orange],["Aggressive","aggressive",3,C.red]].map(([l,,v,col])=>(
                <button key={l} onClick={()=>setSpeed(v)} style={{padding:"5px 12px",borderRadius:20,border:`1px solid ${speed===v?col:C.border}`,background:speed===v?col+"18":"transparent",color:speed===v?col:C.textMid,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
              ))}
              <div style={{marginLeft:"auto",display:"flex",gap:6}}>
                {[["Any",1],["1 transfer",2],["All",3]].map(([l,v])=>(
                  <button key={l} onClick={()=>setFriction(v)} style={{padding:"5px 10px",borderRadius:20,border:`1px solid ${friction===v?C.accent:C.border}`,background:friction===v?C.accentLight:"transparent",color:friction===v?C.accent:C.textMid,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
                ))}
              </div>
            </div>
            <button onClick={search} style={{width:"100%",padding:"13px",background:C.accent,color:"#fff",border:"none",borderRadius:13,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit",letterSpacing:-0.2,boxShadow:`0 2px 12px ${C.accent}55`}}>
              {busy?"Finding routes…":"Get me there →"}
            </button>
          </div>
        )}
      </div>
    </div>
  </div>

  {/* Legend */}
  {phase==="browse"&&(
    <div style={{position:"absolute",bottom:24,left:16,zIndex:10}}>
      <div style={{background:C.white,borderRadius:14,padding:"10px 14px",boxShadow:C.cardShadow,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:11,fontWeight:700,color:C.textDim,marginBottom:8,letterSpacing:0.5}}>MAP LEGEND</div>
        {[{col:C.purple,label:"Metro (tap for arrivals)"},{col:C.orange,label:"Bus stop"},{col:C.green,label:"Bikeshare (e-bikes)"},{col:C.accent,label:"Bikeshare (regular)"}].map(({col,label})=>(
          <div key={label} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <div style={{width:12,height:12,borderRadius:"50%",background:col,flexShrink:0}}/>
            <span style={{fontSize:12,color:C.textMid}}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )}

  {/* Results bottom sheet */}
  {phase==="results"&&routes.length>0&&(
    <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:10}}>
      <div style={{maxWidth:480,margin:"0 auto",padding:"0 12px 12px"}}>
        <div style={{background:C.white,borderRadius:22,boxShadow:C.sheetShadow,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          {/* Handle */}
          <div style={{display:"flex",justifyContent:"center",padding:"10px 0 0"}}>
            <div style={{width:36,height:4,borderRadius:2,background:C.borderMid}}/>
          </div>

          {/* Route pills */}
          <div style={{display:"flex",gap:8,overflowX:"auto",padding:"12px 16px",scrollbarWidth:"none"}}>
            {routes.map(r=>(
              <RoutePill key={r.id} route={r} active={activeR?.id===r.id} onClick={()=>setActiveR(r)}/>
            ))}
          </div>

          {/* Divider */}
          <div style={{height:1,background:C.border,margin:"0 16px"}}/>

          {/* Active route detail */}
          <div style={{padding:"14px 16px 20px",maxHeight:260,overflowY:"auto"}}>
            <RouteDetail route={activeR}/>
          </div>
        </div>
      </div>
    </div>
  )}
</div>
```

);
}
