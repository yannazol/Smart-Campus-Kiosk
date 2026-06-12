// ─────────────────────────────────────────────────────────────
//  ICCT Cainta Campus — Map Data
//
//  This file contains:
//  1. LOCATIONS  — all nodes (rooms, hallways, kiosk)
//  2. EDGES      — walkable connections between nodes
//  3. FLOOR_BLOCKS — visual room rectangles for SVG drawing
//
//  A* pathfinding → handled by Django backend API
//  When backend is ready, replace fetchNavigation() with
//  a real fetch() call to /api/navigate/
//
//  Coordinate system: grid units (22 wide × 22 tall)
//  Campus layout:
//    [Building 4][Building 2]  ← top    (y: 0–10)
//    [Building 3][Building 1]  ← bottom (y: 11–21)
// ─────────────────────────────────────────────────────────────

export const KIOSK_NODE_ID = 200
export const SCALE = { W: 640, H: 480, PAD: 24, xM: 22, yM: 22 }

// ── Scale helpers (grid units → SVG pixels) ──────────────────
export const sx = x => SCALE.PAD + (x / SCALE.xM) * (SCALE.W - SCALE.PAD * 2)
export const sy = y => SCALE.PAD + (y / SCALE.yM) * (SCALE.H - SCALE.PAD * 2)

// ─────────────────────────────────────────────────────────────
//  LOCATIONS (nodes) — from teammate's INITIAL_DB
// ─────────────────────────────────────────────────────────────
export const LOCATIONS = [
  // ── Building 1 — Ground Floor ──────────────────────────────
  { id:15, name:'Window 1',               floor:1, building:1, x:15,   y:11,   type:'Registrar', desc:'Registrar Office - Window 1' },
  { id:16, name:'Window 2',               floor:1, building:1, x:13.8, y:11,   type:'Registrar', desc:'Registrar Office - Window 2' },
  { id:17, name:'Window 3',               floor:1, building:1, x:12.5, y:11,   type:'Registrar', desc:'Registrar Office - Window 3' },
  { id:18, name:'Window 4',               floor:1, building:1, x:11.5, y:11.4, type:'Registrar', desc:'Registrar Office - Window 4' },
  { id:19, name:'Window 5',               floor:1, building:1, x:11.5, y:12.5, type:'Registrar', desc:'Registrar Office - Window 5' },
  { id:20, name:'Window 6',               floor:1, building:1, x:11.5, y:13.6, type:'Registrar', desc:'Registrar Office - Window 6' },
  { id:21, name:'Window 7',               floor:1, building:1, x:11.5, y:14.7, type:'Registrar', desc:'Registrar Office - Window 7' },
  { id:22, name:'Window 8',               floor:1, building:1, x:11.5, y:15.9, type:'Registrar', desc:'Registrar Office - Window 8' },
  { id:23, name:'Window 9',               floor:1, building:1, x:11.5, y:17.1, type:'Registrar', desc:'Registrar Office - Window 9' },
  { id:24, name:'Window 12',              floor:1, building:1, x:11.5, y:18.3, type:'Registrar', desc:'Registrar Office - Window 12' },
  { id:25, name:'Window 14',              floor:1, building:1, x:11.5, y:19.4, type:'Registrar', desc:'Registrar Office - Window 14' },
  { id:26, name:'Window 15',              floor:1, building:1, x:11.5, y:20.6, type:'Registrar', desc:'Registrar Office - Window 15' },
  { id:27, name:"Registrar's Office",     floor:1, building:1, x:15.5, y:13,   type:'Registrar', desc:'Registrar Office' },
  { id:28, name:'Student Affairs Office', floor:1, building:1, x:15.5, y:18,   type:'office',    desc:'Student affairs office.' },
  { id:29, name:'CDJP Office',            floor:1, building:1, x:15.5, y:20,   type:'office',    desc:'CDJP office.' },
  { id:30, name:'Exit',                   floor:1, building:1, x:16.5, y:21,   type:'exit',      desc:'Exit.' },
  { id:31, name:'Guidance Office',        floor:1, building:1, x:17.5, y:20,   type:'office',    desc:'Guidance office.' },
  { id:32, name:'NSTP Office',            floor:1, building:1, x:17.5, y:17,   type:'office',    desc:'NSTP office.' },
  { id:33, name:'Accounting Office',      floor:1, building:1, x:17.5, y:13,   type:'Accounting',desc:'Accounting Office' },
  { id:34, name:'Window 1',               floor:1, building:1, x:17.7, y:11,   type:'Accounting',desc:'Accounting Office - Window 1' },
  { id:35, name:'Window 2',               floor:1, building:1, x:18.3, y:11,   type:'Accounting',desc:'Accounting Office - Window 2' },
  { id:36, name:'Window 3',               floor:1, building:1, x:18.9, y:11,   type:'Accounting',desc:'Accounting Office - Window 3' },
  { id:37, name:'Window 4',               floor:1, building:1, x:19.5, y:11,   type:'Accounting',desc:'Accounting Office - Window 4' },
  { id:38, name:'Window 5',               floor:1, building:1, x:20.1, y:11,   type:'Accounting',desc:'Accounting Office - Window 5' },
  { id:39, name:'Window 6',               floor:1, building:1, x:20.5, y:12.1, type:'Accounting',desc:'Accounting Office - Window 6' },
  { id:40, name:'Window 7',               floor:1, building:1, x:20.5, y:13.2, type:'Accounting',desc:'Accounting Office - Window 7' },
  { id:41, name:'Window 8',               floor:1, building:1, x:20.5, y:14.3, type:'Accounting',desc:'Accounting Office - Window 8' },
  { id:42, name:'Window 9',               floor:1, building:1, x:20.5, y:15.4, type:'Accounting',desc:'Accounting Office - Window 9' },

  // ── Building 2 — Ground Floor ──────────────────────────────
  { id:10, name:'HRM Tools & Equipment',  floor:1, building:2, x:11.5, y:4,    type:'laboratory',desc:'HRM Tools and Equipment.' },
  { id:11, name:'B2.11',                  floor:1, building:2, x:17,   y:8,    type:'laboratory',desc:'Computer Hardware Servicing, Electronics/Electrical Room.' },
  { id:12, name:'B2.12',                  floor:1, building:2, x:15,   y:8,    type:'lecture',   desc:'Academic Lecture Room, AVR Extension Room-2.' },
  { id:13, name:'Supply Section',         floor:1, building:2, x:20.5, y:4,    type:'office',    desc:'Office supplies and resources.' },
  { id:14, name:'Library',               floor:1, building:2, x:20.5, y:1.5,  type:'library',   desc:'Reference books, reading area & Wi-Fi.' },

  // ── Building 3 — Ground Floor ──────────────────────────────
  { id:1,  name:'Entrance',              floor:1, building:3, x:5.5,  y:21,   type:'entrance',  desc:'Security gate, visitor logbook & entrance.' },
  { id:2,  name:'Admission Office',      floor:1, building:3, x:6.5,  y:19.8, type:'office',    desc:'Admission office.' },
  { id:3,  name:'Clinic',                floor:1, building:3, x:4.5,  y:18.5, type:'clinic',    desc:'School nurse, first aid.' },
  { id:4,  name:'Testing Room',          floor:1, building:3, x:6.5,  y:17.5, type:'office',    desc:'Testing room.' },
  { id:5,  name:'Social Lounge',         floor:1, building:3, x:6.5,  y:13.5, type:'lounge',    desc:'Lounge area for visitors.' },
  { id:6,  name:'Drug Testing Center',   floor:1, building:3, x:4.5,  y:12,   type:'clinic',    desc:'Drug testing services.' },

  // ── Building 4 — Ground Floor ──────────────────────────────
  { id:8,  name:'B4.13',                 floor:1, building:4, x:10.5, y:6.5,  type:'laboratory',desc:'Engineering Laboratory.' },
  { id:9,  name:'B4.14',                 floor:1, building:4, x:10.5, y:4,    type:'laboratory',desc:'Criminology/Forensic Laboratory.' },

  // ── Kiosk ───────────────────────────────────────────────────
  { id:200, name:'Kiosk (You Are Here)', floor:1, x:5.8, y:9.2, type:'entrance', desc:'Smart Campus Navigation Kiosk — beside the elevator.' },

  // ── Building 2 — 2nd Floor ─────────────────────────────────
  { id:50, name:'B2.21', floor:2, building:2, x:15.5, y:6.5, type:'laboratory', desc:'Computer Laboratory 21.' },
  { id:51, name:'B2.22', floor:2, building:2, x:15.5, y:3.8, type:'laboratory', desc:'Computer Laboratory 22.' },
  { id:52, name:'B2.23', floor:2, building:2, x:15.5, y:2,   type:'laboratory', desc:'Computer Laboratory 23.' },
  { id:53, name:'B2.24', floor:2, building:2, x:17.5, y:6.5, type:'laboratory', desc:'Computer Laboratory 24.' },
  { id:54, name:'B2.25', floor:2, building:2, x:17.5, y:3.8, type:'laboratory', desc:'Computer Laboratory 25.' },
  { id:55, name:'B2.26', floor:2, building:2, x:17.5, y:2,   type:'laboratory', desc:'Computer Laboratory 26.' },
  { id:56, name:'MIS Room', floor:2, building:2, x:16.5, y:1.5, type:'office',  desc:'Management Information Systems Room.' },

  // ── Building 4 — 2nd Floor ─────────────────────────────────
  { id:43, name:'B4.21', floor:2, building:4, x:4.5, y:6,   type:'laboratory',   desc:'Cisco Networking Simulation Laboratory.' },
  { id:44, name:'B4.22', floor:2, building:4, x:4.5, y:2,   type:'laboratory',   desc:'Foreign Language / Speech Laboratory.' },
  { id:45, name:'B4.23', floor:2, building:4, x:6.5, y:6.5, type:'laboratory',   desc:'Digital & Robotics Modeling Laboratory.' },
  { id:46, name:'B4.24', floor:2, building:4, x:6.5, y:3.8, type:'laboratory',   desc:'E-Learning Hub.' },
  { id:47, name:'B4.25', floor:2, building:4, x:6.5, y:1.3, type:'office',       desc:'Senior High School Department.' },

  // ── Restrooms — 2nd Floor ───────────────────────────────────
  { id:'B-CR',  name:"Boys' CR",    floor:2, x:11,  y:9.5, type:'restroom', desc:"Boys' restroom." },
  { id:'B2-F',  name:"Ladies' CR",  floor:2, building:2, x:20, y:9.8, type:'restroom', desc:"Ladies' restroom." },
  { id:'B4-F',  name:"Ladies' CR",  floor:2, building:4, x:1.5, y:9.8, type:'restroom', desc:"Ladies' restroom." },

  // ── Hallway nodes — Ground Floor ────────────────────────────
  { id:101, name:'Building 3 Hallway',          floor:1, x:5.5,  y:19.8, type:'hallway', desc:'Corridor near admission office.' },
  { id:102, name:'Building 3 Hallway',          floor:1, x:5.5,  y:18.5, type:'hallway', desc:'Corridor in front of clinic.' },
  { id:103, name:'Building 3 Hallway',          floor:1, x:5.5,  y:17.5, type:'hallway', desc:'Corridor in front of testing room.' },
  { id:104, name:'Building 3 Hallway',          floor:1, x:5.5,  y:16,   type:'hallway', desc:'Corridor.' },
  { id:105, name:'Building 3 Hallway',          floor:1, x:5.5,  y:13.5, type:'hallway', desc:'Corridor in front of social lounge.' },
  { id:106, name:'Building 3 Hallway',          floor:1, x:5.5,  y:12,   type:'hallway', desc:'Corridor in front of drug testing center.' },
  { id:107, name:'Building 4 Hallway',          floor:1, x:5.5,  y:10.5, type:'hallway', desc:'Hallway at Elevator/Building 4.' },
  { id:108, name:'Building 4 Hallway',          floor:1, x:8,    y:10.5, type:'hallway', desc:'Hallway at Right Stairs.' },
  { id:109, name:'Building 4 - Right Stairs',   floor:1, x:8,    y:9,    type:'hallway', desc:'Building 4 Right Stairs.' },
  { id:110, name:'Center Hallway',              floor:1, x:11,   y:10.5, type:'hallway', desc:'Center hallway connecting buildings.' },
  { id:111, name:'Building 2 & 4 Mid-Hallway',  floor:1, x:11,   y:6.5,  type:'hallway', desc:'Corridor in front of B4.13.' },
  { id:112, name:'Building 2 & 4 Mid-Hallway',  floor:1, x:11,   y:4,    type:'hallway', desc:'Corridor in front of B4.14.' },
  { id:113, name:"Registrar Windows' Hallway",  floor:1, x:15,   y:10.5, type:'hallway', desc:'In front of Window 1.' },
  { id:114, name:"Registrar Windows' Hallway",  floor:1, x:13.8, y:10.5, type:'hallway', desc:'In front of Window 2.' },
  { id:115, name:"Registrar Windows' Hallway",  floor:1, x:12.5, y:10.5, type:'hallway', desc:'In front of Window 3.' },
  { id:116, name:'Building 1 & 2 Hallway',      floor:1, x:16.5, y:10.5, type:'hallway', desc:'Corridor at Building 1 & 2.' },
  { id:117, name:'Building 1 & 2 Side Hallway', floor:1, x:21,   y:10.5, type:'hallway', desc:'Side Hallway at Building 1 & 2.' },
  { id:118, name:'Building 2 - Side Hallway',   floor:1, x:21,   y:4,    type:'hallway', desc:'In front of Supply Section.' },
  { id:119, name:'Building 2 - Side Hallway',   floor:1, x:21,   y:1.5,  type:'hallway', desc:'In front of Library.' },
  { id:120, name:"Registrar Windows' Hallway",  floor:1, x:11,   y:11.4, type:'hallway', desc:'In front of Window 4.' },
  { id:121, name:"Registrar Windows' Hallway",  floor:1, x:11,   y:12.5, type:'hallway', desc:'In front of Window 5.' },
  { id:122, name:"Registrar Windows' Hallway",  floor:1, x:11,   y:13.6, type:'hallway', desc:'In front of Window 6.' },
  { id:123, name:"Registrar Windows' Hallway",  floor:1, x:11,   y:14.7, type:'hallway', desc:'In front of Window 7.' },
  { id:124, name:"Registrar Windows' Hallway",  floor:1, x:11,   y:15.9, type:'hallway', desc:'In front of Window 8.' },
  { id:125, name:"Registrar Windows' Hallway",  floor:1, x:11,   y:17.1, type:'hallway', desc:'In front of Window 9.' },
  { id:126, name:"Registrar Windows' Hallway",  floor:1, x:11,   y:18.3, type:'hallway', desc:'In front of Window 12.' },
  { id:127, name:"Registrar Windows' Hallway",  floor:1, x:11,   y:19.4, type:'hallway', desc:'In front of Window 14.' },
  { id:128, name:"Registrar Windows' Hallway",  floor:1, x:11,   y:20.6, type:'hallway', desc:'In front of Window 15.' },
  { id:129, name:'Building 1 Hallway',          floor:1, x:16.5, y:13,   type:'hallway', desc:'In front of Registrar & Accounting Office.' },
  { id:130, name:'Building 1 Hallway',          floor:1, x:16.5, y:18,   type:'hallway', desc:'In front of Student Affairs Office.' },
  { id:131, name:'Building 1 Hallway',          floor:1, x:16.5, y:20,   type:'hallway', desc:'In front of CDJP & Guidance Office.' },
  { id:132, name:'Building 1 Hallway',          floor:1, x:16.5, y:17,   type:'hallway', desc:'In front of NSTP Office.' },
  { id:133, name:'Building 4 Hallway',          floor:1, x:3.5,  y:10.5, type:'hallway', desc:'Building 4 Hallway.' },
  { id:134, name:'Building 4 - Left Stairs',    floor:1, x:3.5,  y:9.5,  type:'hallway', desc:'Building 4 - Left Stairs.' },
  { id:135, name:'Building 2 Hallway',          floor:1, x:14,   y:10.5, type:'hallway', desc:'Building 2 Hallway.' },
  { id:136, name:'Building 2 - Left Stairs',    floor:1, x:14,   y:9.5,  type:'hallway', desc:'Building 2 - Left Stairs.' },
  { id:137, name:"Accounting Windows' Hallway", floor:1, x:17.7, y:10.5, type:'hallway', desc:'Accounting - Window 1.' },
  { id:138, name:"Accounting Windows' Hallway", floor:1, x:18.3, y:10.5, type:'hallway', desc:'Accounting - Window 2.' },
  { id:139, name:"Accounting Windows' Hallway", floor:1, x:18.9, y:10.5, type:'hallway', desc:'Accounting - Window 3.' },
  { id:140, name:"Accounting Windows' Hallway", floor:1, x:19.5, y:10.5, type:'hallway', desc:'Accounting - Window 4.' },
  { id:141, name:"Accounting Windows' Hallway", floor:1, x:20.1, y:10.5, type:'hallway', desc:'Accounting - Window 5.' },
  { id:142, name:'Building 1 - Side Hallway',   floor:1, x:21,   y:12.1, type:'hallway', desc:'In front of Window 6.' },
  { id:143, name:'Building 1 - Side Hallway',   floor:1, x:21,   y:13.2, type:'hallway', desc:'In front of Window 7.' },
  { id:144, name:'Building 1 - Side Hallway',   floor:1, x:21,   y:14.3, type:'hallway', desc:'In front of Window 8.' },
  { id:145, name:'Building 1 - Side Hallway',   floor:1, x:21,   y:15.4, type:'hallway', desc:'In front of Window 9.' },
  { id:146, name:'Building 2 Hallway',          floor:1, x:18,   y:10.5, type:'hallway', desc:'Building 2 Hallway.' },
  { id:147, name:'Building 2 - Right Stairs',   floor:1, x:18,   y:9.5,  type:'hallway', desc:'Building 2 Right Stairs.' },

  // ── Hallway nodes — 2nd Floor ────────────────────────────────
  { id:201, name:'Building 4 Right Stairs',     floor:2, x:8,   y:8.5, type:'hallway', desc:'Building 4 Right Stairs.' },
  { id:202, name:'Building 4 - Center Hallway', floor:2, x:5.5, y:8.5, type:'hallway', desc:'Building 4 - Center Hallway.' },
  { id:203, name:'Building 4 Hallway',          floor:2, x:5.5, y:6,   type:'hallway', desc:'CISCO Room.' },
  { id:204, name:'Building 4 Hallway',          floor:2, x:5.5, y:2,   type:'hallway', desc:'Speech Laboratory.' },
  { id:205, name:'Building 4 Hallway',          floor:2, x:5.5, y:6.5, type:'hallway', desc:'DRM Laboratory.' },
  { id:206, name:'Building 4 Hallway',          floor:2, x:5.5, y:3.8, type:'hallway', desc:'E-Learning Hub.' },
  { id:207, name:'Building 4 Hallway',          floor:2, x:5.5, y:1.3, type:'hallway', desc:'SHS Department.' },
  { id:208, name:'Building 4 Hallway',          floor:2, x:3.9, y:8.5, type:'hallway', desc:'Building 4 Hallway.' },
  { id:209, name:'Building 4 - Restroom',       floor:2, x:3.9, y:9.8, type:'hallway', desc:'Building 4 Restroom.' },
  { id:210, name:'Building 4 - Left Stairs',    floor:2, x:3.5, y:8.5, type:'hallway', desc:'Building 4 - Left Stairs.' },
]

// ─────────────────────────────────────────────────────────────
//  EDGES — walkable connections between nodes
// ─────────────────────────────────────────────────────────────
export const EDGES = [
  // Building 1 - Ground Floor
  [107,113],[107,114],[107,115],[113,15],[114,16],[115,17],
  [116,129],[116,130],[116,131],[116,132],[117,142],[117,143],[117,144],[117,145],
  [129,27],[129,30],[130,28],[131,29],[131,31],[132,32],[129,33],
  [116,137],[116,138],[116,139],[116,140],[116,141],
  [137,34],[138,35],[139,36],[140,37],[141,38],[142,39],[143,40],[144,41],[145,42],

  // Building 2 - Ground Floor
  [107,116],[107,117],[112,10],[113,12],[114,116],[116,117],[116,11],
  [117,118],[118,13],[117,119],[119,14],
  [110,120],[110,121],[110,122],[110,123],[110,124],[110,125],[110,126],[110,127],[110,128],
  [110,135],[110,146],
  [120,18],[121,19],[122,20],[123,21],[124,22],[125,23],[126,24],[127,25],[128,26],
  [135,136],[146,147],

  // Building 3 - Ground Floor
  [1,101],[1,102],[1,103],[101,102],[101,103],[101,2],[102,3],[103,4],
  [103,105],[103,104],[103,107],[104,106],[105,5],[103,106],[106,6],
  [102,103],[105,106],[106,107],[107,108],[108,109],[107,200],[200,107],

  // Building 4 - Ground Floor
  [107,133],[109,201],[107,110],[110,111],[110,112],[111,112],[111,8],[112,9],[133,134],

  // Building 4 - Second Floor
  [109,201],[134,210],[201,202],[202,203],[202,204],[202,205],[202,206],[202,207],
  [202,208],[203,43],[204,44],[205,45],[206,46],[207,47],[208,209],[209,'B4-F'],
]

// ─────────────────────────────────────────────────────────────
//  FLOOR BLOCKS — visual room rectangles for SVG drawing
// ─────────────────────────────────────────────────────────────
export const FLOOR_BLOCKS = {
  1: [
    // Building outlines
    { x:11.5, y:11, w:10, h:10, label:'Building 1', type:'building' },
    { x:11.5, y:0,  w:10, h:10, label:'Building 2', type:'building' },
    { x:0.5,  y:11, w:10, h:10, label:'Building 3', type:'building' },
    { x:0.5,  y:0,  w:10, h:10, label:'Building 4', type:'building' },
    // Hallways
    { x:0.5,  y:10, w:21, h:1,  label:'Hallway', type:'hallway' },
    { x:10.5, y:0,  w:1,  h:10, label:'Hallway', type:'hallway' },
    { x:10.5, y:11, w:1,  h:10, label:'Hallway', type:'hallway' },
    // Building 1 rooms
    { x:11.5, y:11,   w:4,   h:3,   label:"Registrar's Office",    type:'office' },
    { x:11.5, y:14,   w:1.5, h:7,   label:"Registrar's Office",    type:'office' },
    { x:17.5, y:18.5, w:4,   h:2.5, label:'Guidance Office',       type:'office' },
    { x:17.5, y:16,   w:4,   h:2.5, label:'NSTP Office',           type:'office' },
    { x:17.5, y:11,   w:3,   h:5,   label:'Accounting Office',     type:'office' },
    { x:13,   y:19,   w:2.5, h:2,   label:'CDJP Office',           type:'office' },
    { x:13,   y:17,   w:2.5, h:2,   label:'Student Affairs Office',type:'office' },
    { x:13,   y:15.5, w:1.5, h:1.5, label:'Male Restroom',         type:'facility' },
    { x:13,   y:14,   w:2.5, h:1.5, label:'Female Restroom',       type:'facility' },
    { x:15.5, y:14,   w:0.8, h:0.7, label:'Stairs',                type:'stairs' },
    // Building 2 rooms
    { x:11.5, y:0,   w:9,   h:3,   label:'Library',              type:'lab' },
    { x:16,   y:3,   w:4.5, h:2.5, label:'Supply Section',       type:'office' },
    { x:11.5, y:3,   w:4.5, h:2.5, label:'HRM Tools & Equipment',type:'lab' },
    { x:16,   y:5.5, w:4.5, h:2.5, label:'Laboratory',           type:'lab' },
    { x:12.5, y:5.5, w:3.5, h:2.5, label:'Multi-Purpose',        type:'facility' },
    { x:11.5, y:5.5, w:1,   h:2.5, label:'Electrical Room',      type:'lab' },
    { x:11.5, y:8,   w:2,   h:1.5, label:'',                     type:'facility' },
    { x:18.5, y:8,   w:2,   h:1.5, label:'',                     type:'facility' },
    { x:12,   y:8.5, w:2,   h:1,   label:'Stairs',               type:'stairs' },
    { x:18,   y:8.5, w:2,   h:1,   label:'Stairs',               type:'stairs' },
    // Building 3 rooms
    { x:0.5, y:17.5, w:4,   h:3.5, label:'Clinic',          type:'lab' },
    { x:0.5, y:11,   w:4,   h:3.3, label:'Drug Testing Room',type:'lab' },
    { x:6.5, y:18.5, w:4,   h:2.5, label:'Admission Office', type:'office' },
    { x:6.5, y:16.5, w:4,   h:2,   label:'Testing Room',     type:'office' },
    { x:6.5, y:11,   w:4,   h:4.5, label:'Social Lounge',    type:'facility' },
    { x:7.5, y:15.5, w:3,   h:1,   label:'Stairs',           type:'stairs' },
    { x:2.8, y:16,   w:1.7, h:1.5, label:'♿ Restroom',      type:'facility' },
    { x:0.5, y:16,   w:2.3, h:1.5, label:'Restroom',         type:'facility' },
    { x:0.5, y:14.3, w:1.3, h:1.7, label:'Restroom',         type:'facility' },
    // Building 4 rooms
    { x:0.5, y:8,   w:2,   h:1.5, label:'',          type:'facility' },
    { x:8.5, y:8,   w:2,   h:1.5, label:'',          type:'facility' },
    { x:0.5, y:0,   w:5,   h:8,   label:'',          type:'building' },
    { x:5.5, y:0,   w:5,   h:2.6, label:'',          type:'building' },
    { x:5.5, y:2.6, w:5,   h:2.7, label:'Laboratory',type:'lab' },
    { x:5.5, y:5.3, w:5,   h:2.7, label:'Laboratory',type:'lab' },
    { x:5,   y:9,   w:1,   h:1,   label:'Elevator',  type:'elevator' },
    { x:1.5, y:8.5, w:2,   h:1,   label:'Stairs',    type:'stairs' },
    { x:8,   y:8.5, w:2,   h:1,   label:'Stairs',    type:'stairs' },
  ],

  2: [
    // Building outlines
    { x:11.5, y:11, w:10, h:10, label:'Building 1', type:'building' },
    { x:11.5, y:0,  w:10, h:10, label:'Building 2', type:'building' },
    { x:0.5,  y:11, w:10, h:10, label:'Building 3', type:'building' },
    { x:0.5,  y:0,  w:10, h:10, label:'Building 4', type:'building' },
    { x:4.4,  y:9.5, w:2.3, h:0.5, label:'', type:'hallway' },
    { x:10.5, y:9.5, w:1,   h:0.5, label:'', type:'hallway' },
    // Restrooms
    { x:10,   y:8,  w:2,   h:1.5, label:'Restroom', type:'facility' },
    { x:20,   y:8,  w:1,   h:2,   label:'Restroom', type:'facility' },
    // Building 2 rooms
    { x:11.5, y:0,   w:4,   h:2.6, label:'Computer Laboratory', type:'lab' },
    { x:11.5, y:2.6, w:4,   h:2.7, label:'Computer Laboratory', type:'lab' },
    { x:11.5, y:5.3, w:4,   h:2.7, label:'Computer Laboratory', type:'lab' },
    { x:17.5, y:0,   w:4,   h:2.6, label:'Computer Laboratory', type:'lab' },
    { x:17.5, y:2.6, w:4,   h:2.7, label:'Computer Laboratory', type:'lab' },
    { x:17.5, y:5.3, w:4,   h:2.7, label:'Computer Laboratory', type:'lab' },
    { x:15.5, y:0,   w:2,   h:1.5, label:'MIS Room',            type:'office' },
    { x:12,   y:8,   w:2,   h:1.5, label:'Stairs',              type:'stairs' },
    { x:18,   y:8,   w:2,   h:1.5, label:'Stairs',              type:'stairs' },
    // Building 4 rooms
    { x:0.5, y:8,   w:1,   h:2,   label:'Restroom',                    type:'facility' },
    { x:5,   y:9,   w:1,   h:1,   label:'Elevator',                    type:'elevator' },
    { x:0.5, y:4,   w:4,   h:4,   label:'CISCO Room',                  type:'lab' },
    { x:0.5, y:0,   w:4,   h:4,   label:'Speech Laboratory',           type:'lab' },
    { x:6.5, y:5.2, w:4,   h:2.8, label:'DRM Laboratory',              type:'lab' },
    { x:6.5, y:2.5, w:4,   h:2.7, label:'E-Learning Hub',              type:'lab' },
    { x:6.5, y:0,   w:4,   h:2.5, label:'Senior High School Dept',     type:'office' },
    { x:1.5, y:8,   w:2,   h:1.5, label:'Stairs',                      type:'stairs' },
    { x:8,   y:8,   w:2,   h:1.5, label:'Stairs',                      type:'stairs' },
  ],

  3: [
    { x:11.5, y:11, w:10, h:10, label:'Building 1', type:'building' },
    { x:11.5, y:0,  w:10, h:10, label:'Building 2', type:'building' },
    { x:0.5,  y:11, w:10, h:10, label:'Building 3', type:'building' },
    { x:0.5,  y:0,  w:10, h:10, label:'Building 4', type:'building' },
    { x:0.5,  y:10, w:21, h:1,  label:'Hallway',   type:'hallway' },
    { x:10.5, y:0,  w:1,  h:10, label:'Hallway',   type:'hallway' },
    { x:10.5, y:11, w:1,  h:10, label:'Hallway',   type:'hallway' },
    { x:4.5,  y:8,  w:2,  h:2,  label:'Elevator',  type:'elevator' },
    { x:8,    y:8,  w:2.5,h:2,  label:'Stairs',    type:'stairs' },
    { x:0.5,  y:8,  w:2.5,h:2,  label:'Stairs',    type:'stairs' },
    { x:11.5, y:8,  w:2.5,h:2,  label:'Stairs',    type:'stairs' },
    { x:18,   y:8,  w:2.5,h:2,  label:'Stairs',    type:'stairs' },
    // placeholder — rooms to be added when data is available
  ],

  4: [
    { x:11.5, y:11, w:10, h:10, label:'Building 1', type:'building' },
    { x:11.5, y:0,  w:10, h:10, label:'Building 2', type:'building' },
    { x:0.5,  y:11, w:10, h:10, label:'Building 3', type:'building' },
    { x:0.5,  y:0,  w:10, h:10, label:'Building 4', type:'building' },
    { x:0.5,  y:10, w:21, h:1,  label:'Hallway',   type:'hallway' },
    { x:10.5, y:0,  w:1,  h:10, label:'Hallway',   type:'hallway' },
    { x:10.5, y:11, w:1,  h:10, label:'Hallway',   type:'hallway' },
    { x:4.5,  y:8,  w:2,  h:2,  label:'Elevator',  type:'elevator' },
    { x:8,    y:8,  w:2.5,h:2,  label:'Stairs',    type:'stairs' },
    { x:0.5,  y:8,  w:2.5,h:2,  label:'Stairs',    type:'stairs' },
    { x:11.5, y:8,  w:2.5,h:2,  label:'Stairs',    type:'stairs' },
    { x:18,   y:8,  w:2.5,h:2,  label:'Stairs',    type:'stairs' },
  ],
}

// ── Floor labels ─────────────────────────────────────────────
export const FLOOR_LABELS = {
  1: 'Ground Floor',
  2: 'Second Floor',
  3: 'Third Floor',
  4: 'Fourth Floor',
  5: 'Fifth Floor',
  6: 'Sixth Floor',
  7: 'Seventh Floor',
}

// ── Type metadata (colors + icons) ───────────────────────────
export const TYPE_META = {
  entrance:  { color:'#34d399', icon:'🚪', fill:'#0c3028' },
  office:    { color:'#60a5fa', icon:'🏢', fill:'#112240' },
  Registrar: { color:'#60a5fa', icon:'🏢', fill:'#112240' },
  Accounting:{ color:'#60a5fa', icon:'🏢', fill:'#112240' },
  library:   { color:'#c084fc', icon:'📚', fill:'#1a0f2e' },
  laboratory:{ color:'#fbbf24', icon:'💻', fill:'#1a1500' },
  lab:       { color:'#fbbf24', icon:'🔬', fill:'#1a1500' },
  lecture:   { color:'#22d3ee', icon:'🎓', fill:'#0a1f2e' },
  lounge:    { color:'#fb923c', icon:'🛋️', fill:'#1a0f00' },
  clinic:    { color:'#f87171', icon:'🏥', fill:'#1a0505' },
  restroom:  { color:'#2dd4bf', icon:'🚻', fill:'#051a18' },
  hallway:   { color:'#1e3a5f', icon:'',   fill:'#070f1e' },
  stairs:    { color:'#334155', icon:'🪜', fill:'#0a1020' },
  elevator:  { color:'#0ea5e9', icon:'🛗', fill:'#0a2030' },
  building:  { color:'#1e3a5f', icon:'🏗️', fill:'#0d1b2e' },
  facility:  { color:'#475569', icon:'',   fill:'#111827' },
  exit:      { color:'#f87171', icon:'🚪', fill:'#1a0505' },
}

// ── Search — find location by name ───────────────────────────
export function findLocationByName(query) {
  const q = query.toLowerCase().trim()
  return LOCATIONS.filter(l =>
    l.type !== 'hallway' &&
    l.id !== KIOSK_NODE_ID &&
    (
      l.name.toLowerCase().includes(q) ||
      l.type.toLowerCase().includes(q) ||
      (l.desc || '').toLowerCase().includes(q)
    )
  )
}

// ─────────────────────────────────────────────────────────────
//  BACKEND API PLACEHOLDER
//  Replace with real Django endpoint when ready:
//  GET /api/navigate/?from=200&to={destId}
//  Returns: { path: number[], directions: object[] }
// ─────────────────────────────────────────────────────────────
export async function fetchNavigation(destId) {
  // TODO: uncomment when Django backend is ready
  // const res = await fetch(`/api/navigate/?from=${KIOSK_NODE_ID}&to=${destId}`)
  // return await res.json()

  // Placeholder response
  const dest = LOCATIONS.find(l => l.id === destId)
  if (!dest) return { path: [], directions: [] }

  return {
    path: [KIOSK_NODE_ID, destId],
    directions: [
      { icon:'🚶', text:`Start at Kiosk`, sub:`Ground Floor · Entrance` },
      { icon:'🏁', text:`Arrive at ${dest.name}`, sub:`Floor ${dest.floor} · ${dest.type}` },
    ]
  }
}
