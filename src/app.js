import { createClient } from '@supabase/supabase-js';

'use strict';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  document.body.innerHTML = `
    <main style="max-width:760px;margin:64px auto;padding:28px;font-family:system-ui;line-height:1.7">
      <h1>ยังไม่ได้ตั้งค่า Supabase</h1>
      <p>สร้างไฟล์ <code>.env.local</code> ในโฟลเดอร์หลัก แล้วใส่ <code>VITE_SUPABASE_URL</code> และ <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> จาก Supabase</p>
      <pre style="padding:18px;background:#f4f4ef;border-radius:14px;overflow:auto">VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY</pre>
    </main>`;
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

const state = {
  token: '',
  user: null,
  counselors: [],
  selectedCounselorId: null,
  selectedSlot: null,
  activeAssessment: null,
  breathing: { interval: null, phaseTimer: null, remaining: 60, inhale: true },
  scenarioIndex: 0,
  flashcardIndex: 0,
  flashcardFlipped: false
};

const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

const elements = {
  menuButton: $('#menuButton'),
  mainNav: $('#mainNav'),
  loginButton: $('#loginButton'),
  registerButton: $('#registerButton'),
  profileButton: $('#profileButton'),
  profileMenu: $('#profileMenu'),
  profileName: $('#profileName'),
  profileAvatar: $('#profileAvatar'),
  profileRole: $('#profileRole'),
  logoutButton: $('#logoutButton'),
  loginDialog: $('#loginDialog'),
  registerDialog: $('#registerDialog'),
  guideDialog: $('#guideDialog'),
  urgentDialog: $('#urgentDialog'),
  scenarioDialog: $('#scenarioDialog'),
  flashcardDialog: $('#flashcardDialog'),
  loginForm: $('#loginForm'),
  registerForm: $('#registerForm'),
  loginMessage: $('#loginMessage'),
  registerMessage: $('#registerMessage'),
  moodForm: $('#moodForm'),
  stressRange: $('#stressRange'),
  stressValue: $('#stressValue'),
  energyRange: $('#energyRange'),
  energyValue: $('#energyValue'),
  moodMessage: $('#moodMessage'),
  moodHistory: $('#moodHistory'),
  refreshMoodButton: $('#refreshMoodButton'),
  assessmentMenu: $('#assessmentMenu'),
  assessmentIntro: $('#assessmentIntro'),
  assessmentForm: $('#assessmentForm'),
  assessmentResult: $('#assessmentResult'),
  assessmentHistory: $('#assessmentHistory'),
  refreshAssessmentButton: $('#refreshAssessmentButton'),
  counselorList: $('#counselorList'),
  bookingForm: $('#bookingForm'),
  bookingTopic: $('#bookingTopic'),
  bookingMode: $('#bookingMode'),
  bookingDate: $('#bookingDate'),
  bookingNote: $('#bookingNote'),
  bookingConsent: $('#bookingConsent'),
  slotGrid: $('#slotGrid'),
  bookingMessage: $('#bookingMessage'),
  appointmentList: $('#appointmentList'),
  refreshAppointmentsButton: $('#refreshAppointmentsButton'),
  breathingCircle: $('#breathingCircle'),
  breathingTimer: $('#breathingTimer'),
  breathingDuration: $('#breathingDuration'),
  startBreathingButton: $('#startBreathingButton'),
  stopBreathingButton: $('#stopBreathingButton'),
  journalForm: $('#journalForm'),
  journalMessage: $('#journalMessage'),
  journalList: $('#journalList'),
  staffPanel: $('#staffPanel'),
  staffPanelTitle: $('#staffPanelTitle'),
  adminStats: $('#adminStats'),
  staffAppointments: $('#staffAppointments'),
  refreshStaffButton: $('#refreshStaffButton'),
  guideContent: $('#guideContent'),
  openScenarioButton: $('#openScenarioButton'),
  scenarioContent: $('#scenarioContent'),
  openFlashcardButton: $('#openFlashcardButton'),
  flashcard: $('#flashcard'),
  flashcardQuestion: $('#flashcardQuestion'),
  flashcardAnswer: $('#flashcardAnswer'),
  flashcardCount: $('#flashcardCount'),
  previousFlashcard: $('#previousFlashcard'),
  nextFlashcard: $('#nextFlashcard'),
  toastContainer: $('#toastContainer')
};

const assessments = {
  stress: {
    icon: '☁️',
    title: 'เช็กความเครียด',
    description: 'สำรวจความตึงเครียดและผลกระทบต่อชีวิตในช่วง 7 วันที่ผ่านมา',
    questions: [
      'รู้สึกกังวลหรือตึงเครียดจนผ่อนคลายได้ยาก',
      'รู้สึกว่ามีงานหรือเรื่องที่ต้องรับมือมากเกินไป',
      'มีอาการทางกาย เช่น ปวดศีรษะ ใจเต้นเร็ว หรือเกร็งกล้ามเนื้อจากความเครียด',
      'ความเครียดรบกวนการเรียน การฝึก หรือการใช้ชีวิตประจำวัน',
      'รู้สึกควบคุมความคิดกังวลได้ยาก'
    ],
    result(score) {
      if (score <= 4) return { level: 'ความเครียดค่อนข้างน้อย', advice: 'รักษาการพักผ่อนและกิจกรรมที่ช่วยให้ผ่อนคลายอย่างสม่ำเสมอ' };
      if (score <= 9) return { level: 'มีสัญญาณความเครียดระดับปานกลาง', advice: 'ลองพักเป็นช่วงสั้น ๆ ฝึกหายใจ และพูดคุยกับคนที่ไว้ใจ หากรบกวนชีวิตต่อเนื่องควรนัดรับคำปรึกษา' };
      return { level: 'มีสัญญาณความเครียดค่อนข้างมาก', advice: 'คุณไม่จำเป็นต้องรับมือคนเดียว แนะนำให้จองพูดคุยกับผู้ให้คำปรึกษา และขอความช่วยเหลือทันทีหากรู้สึกไม่ปลอดภัย' };
    }
  },
  burnout: {
    icon: '🪫',
    title: 'เช็กภาวะหมดไฟ',
    description: 'สำรวจความเหนื่อยล้าจากการเรียน การขึ้นฝึก และความคาดหวังต่อตนเอง',
    questions: [
      'รู้สึกเหนื่อยล้าทางใจแม้จะได้พักแล้ว',
      'รู้สึกไม่อยากเริ่มงานหรือกิจกรรมที่เคยทำได้',
      'รู้สึกห่างเหินหรือหมดความรู้สึกกับการเรียนและการฝึก',
      'รู้สึกว่าตนเองทำได้ไม่ดีพอแม้พยายามแล้ว',
      'รู้สึกว่าไม่มีเวลาหรือพลังเหลือให้ชีวิตส่วนตัว'
    ],
    result(score) {
      if (score <= 5) return { level: 'ยังไม่พบสัญญาณเด่นของภาวะหมดไฟ', advice: 'คงขอบเขตการพักและขอความช่วยเหลือก่อนที่ความเหนื่อยจะสะสม' };
      if (score <= 10) return { level: 'เริ่มมีสัญญาณเหนื่อยล้าสะสม', advice: 'ลองลดภาระที่ไม่จำเป็น จัดเวลาพัก และพูดคุยกับอาจารย์หรือผู้ให้คำปรึกษา' };
      return { level: 'มีสัญญาณภาวะหมดไฟค่อนข้างชัด', advice: 'ควรได้รับการสนับสนุนอย่างจริงจัง ลองนัดพูดคุยและทบทวนภาระร่วมกับผู้เกี่ยวข้อง' };
    }
  },
  sleep: {
    icon: '🌙',
    title: 'เช็กคุณภาพการนอน',
    description: 'สำรวจการนอนและผลต่อพลังงานในช่วง 7 วันที่ผ่านมา',
    questions: [
      'ใช้เวลานานกว่าจะหลับหรือหลับไม่ต่อเนื่อง',
      'ตื่นแล้วรู้สึกไม่สดชื่น',
      'ง่วงมากระหว่างเรียนหรือขึ้นฝึก',
      'ใช้ความคิดเรื่องเรียนหรือฝึกจนหยุดคิดก่อนนอนได้ยาก',
      'เวลานอนไม่สม่ำเสมอจนกระทบการใช้ชีวิต'
    ],
    result(score) {
      if (score <= 4) return { level: 'รูปแบบการนอนโดยรวมค่อนข้างดี', advice: 'รักษาเวลานอนและลดหน้าจอก่อนนอนอย่างสม่ำเสมอ' };
      if (score <= 9) return { level: 'การนอนเริ่มไม่สม่ำเสมอ', advice: 'ลองกำหนดเวลาตื่นให้ใกล้เคียงกันทุกวัน และใช้กิจกรรมพักใจก่อนนอน' };
      return { level: 'การนอนอาจกระทบชีวิตประจำวัน', advice: 'ควรพูดคุยกับผู้เชี่ยวชาญ โดยเฉพาะเมื่ออาการต่อเนื่องหรือกระทบความปลอดภัยในการเรียนและฝึก' };
    }
  }
};

const scaleLabels = ['ไม่เลย', 'บางวัน', 'บ่อย', 'เกือบทุกวัน'];

const guides = {
  grounding: {
    icon: '🌿',
    title: '5–4–3–2–1 Grounding',
    intro: 'ค่อย ๆ มองรอบตัวและตอบในใจ โดยไม่ต้องรีบ',
    steps: ['5 สิ่งที่มองเห็น', '4 สิ่งที่สัมผัสได้', '3 เสียงที่ได้ยิน', '2 กลิ่นที่สังเกตได้', '1 สิ่งที่อยากขอบคุณตัวเอง']
  },
  shoulder: {
    icon: '🧘',
    title: 'คลายไหล่และกราม',
    intro: 'นั่งหรือยืนในท่าที่มั่นคง ทำช้า ๆ และหยุดทันทีหากเจ็บ',
    steps: ['ยกไหล่ขึ้นค้าง 3 วินาที แล้วปล่อย', 'หมุนไหล่ไปด้านหลังช้า ๆ 5 รอบ', 'คลายกราม ให้ฟันบนและล่างไม่กัดกัน', 'หายใจออกยาวกว่าหายใจเข้า 5 รอบ']
  },
  sleep: {
    icon: '🌙',
    title: 'พักใจก่อนนอน',
    intro: 'วางโทรศัพท์ หรี่แสง และปล่อยให้ร่างกายค่อย ๆ ผ่อนคลาย',
    steps: ['รับรู้จุดสัมผัสของร่างกายกับที่นอน', 'ผ่อนหน้าผาก รอบดวงตา และกราม', 'ผ่อนไหล่ แขน มือ หน้าท้อง และขา', 'บอกตัวเองว่า วันนี้ทำเท่าที่ทำได้แล้ว']
  },
  preclinical: {
    icon: '🩺',
    title: 'เช็กใจก่อนขึ้นฝึก',
    intro: 'ตอบในใจก่อนเริ่มวัน เพื่อรู้ว่าตนเองต้องการการสนับสนุนด้านใด',
    steps: ['เมื่อคืนฉันนอนเพียงพอหรือไม่', 'ระดับความกังวลตอนนี้อยู่ที่เท่าไรจาก 0–10', 'เรื่องใดที่ฉันกังวลมากที่สุด', 'วันนี้ฉันจะขอความช่วยเหลือจากใครได้', 'ประโยคที่อยากบอกตัวเองก่อนเริ่มฝึก']
  }
};

const scenarios = [
  {
    situation: 'ผู้ป่วยพูดว่า “ไม่มีใครเข้าใจฉันเลย ฉันไม่อยากคุยกับใคร” นักศึกษาควรตอบอย่างไร',
    options: [
      'อย่าคิดมากเลยค่ะ ทุกคนก็มีปัญหาเหมือนกัน',
      'ตอนนี้คุณรู้สึกโดดเดี่ยวมาก ฉันอยู่ตรงนี้และพร้อมฟังเมื่อคุณพร้อม',
      'ทำไมถึงไม่อยากคุยกับใครคะ',
      'เดี๋ยวก็ดีขึ้นค่ะ'
    ],
    correct: 1,
    explanation: 'คำตอบนี้สะท้อนความรู้สึกและเสนอการอยู่เป็นเพื่อนโดยไม่กดดันผู้ป่วย ส่วนคำตอบอื่นอาจลดทอนความรู้สึกหรือเร่งให้ผู้ป่วยอธิบาย'
  },
  {
    situation: 'ผู้ป่วยบอกว่าได้ยินเสียงตำหนิตนเอง นักศึกษาควรเริ่มต้นอย่างไร',
    options: [
      'เสียงนั้นไม่มีจริง คุณต้องหยุดคิด',
      'ฉันไม่ได้ยินเสียงนั้น แต่เข้าใจว่ามันทำให้คุณไม่สบายใจ ตอนนี้เสียงกำลังบอกให้คุณทำอะไรหรือไม่',
      'ลองไม่สนใจเสียงดูนะคะ',
      'คุณคิดไปเองหรือเปล่า'
    ],
    correct: 1,
    explanation: 'ควรยอมรับประสบการณ์และความรู้สึกโดยไม่ยืนยันว่าเสียงนั้นเป็นจริง พร้อมประเมินความเสี่ยงว่ามีคำสั่งให้ทำอันตรายหรือไม่'
  },
  {
    situation: 'เพื่อนนักศึกษาร้องไห้หลังถูกตำหนิระหว่างขึ้นฝึก คุณควรพูดอย่างไร',
    options: [
      'ต้องเข้มแข็งกว่านี้นะ เป็นพยาบาลแล้ว',
      'เราเห็นว่าเธอเสียใจมาก อยากให้เรานั่งอยู่ด้วยหรืออยากเล่าอะไรไหม',
      'อย่าร้อง เดี๋ยวคนอื่นเห็น',
      'ช่างมันเถอะ อาจารย์ก็ดุทุกคน'
    ],
    correct: 1,
    explanation: 'การสังเกตและสะท้อนความรู้สึก พร้อมให้ตัวเลือกแก่ผู้รับฟัง ช่วยรักษาศักดิ์ศรีและลดการตัดสิน'
  }
];

const flashcards = [
  { q: 'หลักสำคัญของการสื่อสารเชิงบำบัดคืออะไร', a: 'รับฟังอย่างตั้งใจ สะท้อนความรู้สึก ใช้คำถามปลายเปิด ไม่ตัดสิน และเคารพความเงียบของผู้ป่วย' },
  { q: 'เมื่อผู้ป่วยมีความคิดทำร้ายตนเอง พยาบาลควรทำอย่างไรเป็นอันดับแรก', a: 'ประเมินความเร่งด่วนและความปลอดภัย ไม่ปล่อยให้อยู่ลำพัง เก็บสิ่งเสี่ยง และแจ้งทีมรักษาตามแนวทางของหน่วยงานทันที' },
  { q: 'MSE ย่อมาจากอะไร', a: 'Mental Status Examination หรือการตรวจสภาพจิต ครอบคลุมลักษณะทั่วไป พฤติกรรม การพูด อารมณ์ ความคิด การรับรู้ การรู้คิด การตัดสินใจ และการหยั่งรู้' },
  { q: 'คำถามปลายเปิดมีประโยชน์อย่างไร', a: 'เปิดโอกาสให้ผู้ป่วยเล่าในมุมของตนเอง ทำให้เข้าใจประสบการณ์ ความรู้สึก และความต้องการได้มากกว่าคำถามที่ตอบเพียงใช่หรือไม่' },
  { q: 'เมื่อพบข้อมูลที่ระบุตัวผู้ป่วยได้ในบันทึกสะท้อนคิด ควรทำอย่างไร', a: 'ตัดชื่อ เลขประจำตัว วันที่เฉพาะ และรายละเอียดที่ทำให้ระบุตัวบุคคลได้ โดยรักษาความลับตามจริยธรรมและระเบียบของสถานฝึก' }
];

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function setMessage(element, message = '', isError = false) {
  element.textContent = message;
  element.classList.toggle('error', isError);
}

function toast(message, isError = false) {
  const item = document.createElement('div');
  item.className = `toast${isError ? ' error' : ''}`;
  item.textContent = message;
  elements.toastContainer.appendChild(item);
  window.setTimeout(() => item.remove(), 3800);
}

function openDialog(dialog) {
  if (!dialog.open) dialog.showModal();
  document.body.classList.add('modal-open');
}

function closeDialog(dialog) {
  if (dialog.open) dialog.close();
  if (!$$('dialog[open]').length) document.body.classList.remove('modal-open');
}

async function fetchProfile(authUser = null) {
  let user = authUser;
  if (!user) {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw makeAppError('กรุณาเข้าสู่ระบบ', 401);
    user = data.user;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, student_id, name, email, role, created_at')
    .eq('id', user.id)
    .single();

  if (error) throw fromSupabaseError(error, 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
  return {
    id: profile.id,
    studentId: profile.student_id,
    student_id: profile.student_id,
    name: profile.name,
    email: profile.email || user.email || '',
    role: profile.role,
    createdAt: profile.created_at
  };
}

function makeAppError(message, status = 400, data = {}) {
  const error = new Error(message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
  error.status = status;
  error.data = data;
  return error;
}

function fromSupabaseError(error, fallback = 'เกิดข้อผิดพลาด กรุณาลองใหม่') {
  const raw = String(error?.message || '');
  let message = raw || fallback;

  if (error?.code === '23505') message = 'ข้อมูลนี้ถูกใช้แล้ว หรือช่วงเวลานี้มีผู้จองแล้ว';
  if (error?.code === '42501' || raw.toLowerCase().includes('row-level security')) message = 'คุณไม่มีสิทธิ์ทำรายการนี้';
  if (raw.toLowerCase().includes('invalid login credentials')) message = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
  if (raw.toLowerCase().includes('email not confirmed')) message = 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ';
  if (raw.toLowerCase().includes('user already registered')) message = 'อีเมลนี้ถูกสมัครไว้แล้ว';
  if (raw.includes('duplicate key') && raw.includes('student_id')) message = 'รหัสนักศึกษานี้ถูกใช้แล้ว';

  return makeAppError(message, 400, { code: error?.code });
}

function parseRequestBody(options) {
  if (!options?.body) return {};
  if (typeof options.body === 'string') {
    try { return JSON.parse(options.body); } catch { return {}; }
  }
  return options.body;
}

function flattenAppointment(row) {
  const counselor = Array.isArray(row.counselor) ? row.counselor[0] : row.counselor;
  const student = Array.isArray(row.student) ? row.student[0] : row.student;
  return {
    ...row,
    counselor_name: counselor?.display_name || 'ผู้ให้คำปรึกษา',
    counselor_title: counselor?.title || '',
    student_name: student?.name || 'นักศึกษา',
    student_email: student?.email || '',
    student_id: student?.student_id || ''
  };
}

const APPOINTMENT_SELECT = `
  id, user_id, counselor_id, appointment_date, appointment_time,
  duration_minutes, mode, topic, note, risk_level, status, created_at, updated_at,
  counselor:counselors!appointments_counselor_id_fkey(display_name, title, user_id),
  student:profiles!appointments_user_id_fkey(name, email, student_id)
`;

async function api(path, options = {}) {
  const method = String(options.method || 'GET').toUpperCase();
  const body = parseRequestBody(options);
  const requestUrl = new URL(path, window.location.origin);
  const pathname = requestUrl.pathname;

  try {
    if (method === 'POST' && pathname === '/api/auth/register') {
      const studentId = String(body.studentId || '').trim();
      const name = String(body.name || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      if (!studentId || !name || !email || password.length < 8 || !body.consent) {
        throw makeAppError('กรอกข้อมูลให้ครบ รหัสผ่านอย่างน้อย 8 ตัว และยอมรับเงื่อนไขความเป็นส่วนตัว');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            student_id: studentId,
            name,
            consent_privacy: true
          }
        }
      });
      if (error) throw fromSupabaseError(error, 'สมัครสมาชิกไม่สำเร็จ');
      if (data.session && data.user) {
        return {
          message: 'สมัครสมาชิกสำเร็จและเข้าสู่ระบบแล้ว',
          token: data.session.access_token,
          user: await fetchProfile(data.user)
        };
      }
      return { message: 'สมัครสมาชิกสำเร็จ กรุณาเปิดอีเมลเพื่อยืนยันบัญชีก่อนเข้าสู่ระบบ' };
    }

    if (method === 'POST' && pathname === '/api/auth/login') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: String(body.email || '').trim().toLowerCase(),
        password: String(body.password || '')
      });
      if (error) throw fromSupabaseError(error, 'เข้าสู่ระบบไม่สำเร็จ');
      const user = await fetchProfile(data.user);
      return { token: data.session?.access_token || '', user };
    }

    if (method === 'GET' && pathname === '/api/auth/me') {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) throw makeAppError('กรุณาเข้าสู่ระบบ', 401);
      return { user: await fetchProfile(data.user) };
    }

    if (method === 'POST' && pathname === '/api/auth/logout') {
      const { error } = await supabase.auth.signOut();
      if (error) throw fromSupabaseError(error, 'ออกจากระบบไม่สำเร็จ');
      return { message: 'ออกจากระบบแล้ว' };
    }

    if (method === 'GET' && pathname === '/api/counselors') {
      const { data, error } = await supabase
        .from('counselors')
        .select('id, display_name, title, specialties, bio, meeting_modes')
        .eq('active', true)
        .order('created_at', { ascending: true });
      if (error) throw fromSupabaseError(error, 'โหลดรายชื่อผู้ให้คำปรึกษาไม่สำเร็จ');
      return {
        counselors: (data || []).map(row => ({
          id: row.id,
          name: row.display_name,
          title: row.title,
          specialties: Array.isArray(row.specialties) ? row.specialties : [],
          bio: row.bio,
          modes: Array.isArray(row.meeting_modes) ? row.meeting_modes : []
        }))
      };
    }

    if (method === 'GET' && pathname === '/api/availability') {
      const counselorId = requestUrl.searchParams.get('counselorId');
      const date = requestUrl.searchParams.get('date');
      const { data, error } = await supabase.rpc('get_available_slots', {
        p_counselor_id: counselorId,
        p_date: date
      });
      if (error) throw fromSupabaseError(error, 'ตรวจสอบเวลาว่างไม่สำเร็จ');
      let slots = (data || []).map(row => ({
        time: String(row.slot_time || '').slice(0, 5),
        duration: Number(row.duration)
      }));
      if (date === todayString()) {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        slots = slots.filter(slot => slot.time > currentTime);
      }
      return { slots };
    }

    if (method === 'POST' && pathname === '/api/appointments') {
      const { data, error } = await supabase.rpc('book_appointment', {
        p_counselor_id: body.counselorId,
        p_date: body.date,
        p_time: body.time,
        p_mode: body.mode,
        p_topic: body.topic,
        p_note: body.note || '',
        p_risk_level: body.riskLevel || 'normal'
      });
      if (error) {
        const urgent = String(error.message || '').includes('ความช่วยเหลือเร่งด่วน');
        const appError = fromSupabaseError(error, 'จองนัดหมายไม่สำเร็จ');
        appError.data = { ...appError.data, urgent };
        throw appError;
      }
      return { message: 'จองเวลาพูดคุยสำเร็จ', appointmentId: data };
    }

    if (method === 'GET' && pathname === '/api/appointments/my') {
      const { data, error } = await supabase
        .from('appointments')
        .select(APPOINTMENT_SELECT)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });
      if (error) throw fromSupabaseError(error, 'โหลดนัดหมายไม่สำเร็จ');
      return { appointments: (data || []).map(flattenAppointment) };
    }

    const cancelMatch = pathname.match(/^\/api\/appointments\/([0-9a-f-]+)\/cancel$/i);
    if (method === 'PATCH' && cancelMatch) {
      const { error } = await supabase.rpc('cancel_appointment', { p_appointment_id: cancelMatch[1] });
      if (error) throw fromSupabaseError(error, 'ยกเลิกนัดหมายไม่สำเร็จ');
      return { message: 'ยกเลิกนัดหมายแล้ว' };
    }

    const rescheduleMatch = pathname.match(/^\/api\/appointments\/([0-9a-f-]+)\/reschedule$/i);
    if (method === 'PATCH' && rescheduleMatch) {
      const { error } = await supabase.rpc('reschedule_appointment', {
        p_appointment_id: rescheduleMatch[1],
        p_date: body.date,
        p_time: body.time
      });
      if (error) throw fromSupabaseError(error, 'เลื่อนนัดหมายไม่สำเร็จ');
      return { message: 'เลื่อนนัดหมายสำเร็จ' };
    }

    const statusMatch = pathname.match(/^\/api\/appointments\/([0-9a-f-]+)\/status$/i);
    if (method === 'PATCH' && statusMatch) {
      const { error } = await supabase.rpc('update_appointment_status', {
        p_appointment_id: statusMatch[1],
        p_status: body.status
      });
      if (error) throw fromSupabaseError(error, 'อัปเดตสถานะไม่สำเร็จ');
      return { message: 'อัปเดตสถานะแล้ว' };
    }

    if (method === 'POST' && pathname === '/api/moods') {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw makeAppError('กรุณาเข้าสู่ระบบ', 401);
      const { error } = await supabase.from('mood_entries').insert({
        user_id: authData.user.id,
        mood: String(body.mood || '').slice(0, 30),
        stress: Number(body.stress),
        energy: Number(body.energy),
        note: String(body.note || '').slice(0, 500)
      });
      if (error) throw fromSupabaseError(error, 'บันทึกอารมณ์ไม่สำเร็จ');
      return { message: 'บันทึกอารมณ์แล้ว' };
    }

    if (method === 'GET' && pathname === '/api/moods') {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('id, mood, stress, energy, note, created_at')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw fromSupabaseError(error, 'โหลดบันทึกอารมณ์ไม่สำเร็จ');
      return { entries: data || [] };
    }

    if (method === 'POST' && pathname === '/api/assessments') {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw makeAppError('กรุณาเข้าสู่ระบบ', 401);
      const { error } = await supabase.from('assessment_results').insert({
        user_id: authData.user.id,
        assessment_type: body.type,
        score: Number(body.score),
        max_score: Number(body.maxScore),
        level: body.level,
        answers: body.answers || []
      });
      if (error) throw fromSupabaseError(error, 'บันทึกผลประเมินไม่สำเร็จ');
      return { message: 'บันทึกผลประเมินแล้ว' };
    }

    if (method === 'GET' && pathname === '/api/assessments') {
      const { data, error } = await supabase
        .from('assessment_results')
        .select('id, assessment_type, score, max_score, level, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw fromSupabaseError(error, 'โหลดผลประเมินไม่สำเร็จ');
      return { results: data || [] };
    }

    if (method === 'POST' && pathname === '/api/journal') {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw makeAppError('กรุณาเข้าสู่ระบบ', 401);
      const { error } = await supabase.from('journal_entries').insert({
        user_id: authData.user.id,
        title: String(body.title || '').slice(0, 120),
        content: String(body.content || '').slice(0, 5000),
        mood: String(body.mood || '').slice(0, 30)
      });
      if (error) throw fromSupabaseError(error, 'บันทึกสมุดโอบใจไม่สำเร็จ');
      return { message: 'บันทึกสมุดโอบใจแล้ว' };
    }

    if (method === 'GET' && pathname === '/api/journal') {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('id, title, content, mood, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw fromSupabaseError(error, 'โหลดสมุดโอบใจไม่สำเร็จ');
      return { entries: data || [] };
    }

    const journalMatch = pathname.match(/^\/api\/journal\/([0-9a-f-]+)$/i);
    if (method === 'DELETE' && journalMatch) {
      const { error } = await supabase.from('journal_entries').delete().eq('id', journalMatch[1]);
      if (error) throw fromSupabaseError(error, 'ลบบันทึกไม่สำเร็จ');
      return { message: 'ลบบันทึกแล้ว' };
    }

    if (method === 'GET' && pathname === '/api/admin/stats') {
      const { data, error } = await supabase.rpc('admin_stats');
      if (error) throw fromSupabaseError(error, 'โหลดสถิติไม่สำเร็จ');
      return { stats: data || {} };
    }

    throw makeAppError('ไม่พบคำสั่งที่ร้องขอ', 404);
  } catch (error) {
    if (error?.status === 401 && state.user) clearAuth(false);
    if (error instanceof Error) throw error;
    throw makeAppError('เกิดข้อผิดพลาด กรุณาลองใหม่');
  }
}

function requireLogin() {
  if (state.user) return true;
  openDialog(elements.loginDialog);
  setMessage(elements.loginMessage, 'กรุณาเข้าสู่ระบบก่อนใช้งานส่วนนี้');
  return false;
}

function roleLabel(role) {
  return role === 'admin' ? 'ผู้ดูแลระบบ' : role === 'counselor' ? 'ผู้ให้คำปรึกษา' : 'นักศึกษา';
}

function updateAuthUi() {
  const loggedIn = Boolean(state.user);
  elements.loginButton.classList.toggle('hidden', loggedIn);
  elements.registerButton.classList.toggle('hidden', loggedIn);
  elements.profileButton.classList.toggle('hidden', !loggedIn);

  if (loggedIn) {
    elements.profileName.textContent = state.user.name;
    elements.profileAvatar.textContent = state.user.name.trim().charAt(0) || 'อ';
    elements.profileRole.textContent = roleLabel(state.user.role);
    const staff = ['counselor', 'admin'].includes(state.user.role);
    elements.staffPanel.classList.toggle('hidden', !staff);
    elements.staffPanelTitle.textContent = state.user.role === 'admin' ? 'แดชบอร์ดผู้ดูแลระบบ' : 'แดชบอร์ดผู้ให้คำปรึกษา';
  } else {
    elements.profileMenu.classList.add('hidden');
    elements.staffPanel.classList.add('hidden');
  }
}

function saveAuth(token, user) {
  state.token = token || '';
  state.user = user;
  updateAuthUi();
  refreshPrivateData();
}

function clearAuth(showToast = true) {
  state.token = '';
  state.user = null;
  updateAuthUi();
  renderLoggedOutStates();
  if (showToast) toast('ออกจากระบบแล้ว');
}

async function loadCurrentUser() {
  const { data: sessionData } = await supabase.auth.getSession();
  state.token = sessionData.session?.access_token || '';
  if (!sessionData.session) {
    updateAuthUi();
    renderLoggedOutStates();
    return;
  }
  try {
    const data = await api('/api/auth/me');
    state.user = data.user;
    updateAuthUi();
    await refreshPrivateData();
  } catch {
    clearAuth(false);
  }
}

function renderLoggedOutStates() {
  elements.moodHistory.innerHTML = '<span>☁</span><p>เข้าสู่ระบบเพื่อดูบันทึกอารมณ์ย้อนหลัง</p>';
  elements.assessmentHistory.textContent = 'เข้าสู่ระบบเพื่อดูประวัติผลประเมิน';
  elements.appointmentList.innerHTML = '<div class="empty-state card">เข้าสู่ระบบเพื่อดูนัดหมาย</div>';
  elements.journalList.innerHTML = '<div class="empty-state card">เข้าสู่ระบบเพื่อดูบันทึกส่วนตัว</div>';
  elements.staffAppointments.innerHTML = '';
  elements.adminStats.classList.add('hidden');
}

async function refreshPrivateData() {
  if (!state.user) return;
  if (state.user.role === 'student') {
    await Promise.allSettled([loadMoodHistory(), loadAssessmentHistory(), loadAppointments(), loadJournal()]);
  } else {
    await loadStaffDashboard();
  }
}

function moodEmoji(mood) {
  return ({ 'สดใส': '☀️', 'สบายใจ': '🌤️', 'เฉย ๆ': '☁️', 'เครียด': '🌧️', 'เศร้า': '🌙' })[mood] || '☁️';
}

function formatDateTime(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function formatDateOnly(value) {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function monthDayParts(value) {
  const date = new Date(`${value}T12:00:00`);
  const day = new Intl.DateTimeFormat('th-TH', { day: '2-digit' }).format(date);
  const month = new Intl.DateTimeFormat('th-TH', { month: 'short' }).format(date);
  return { day, month };
}

function statusLabel(status) {
  return ({ pending: 'รอยืนยัน', confirmed: 'ยืนยันแล้ว', completed: 'เสร็จสิ้น', cancelled: 'ยกเลิกแล้ว', no_show: 'ไม่ได้เข้ารับบริการ' })[status] || status;
}

async function handleLogin(event) {
  event.preventDefault();
  setMessage(elements.loginMessage, 'กำลังเข้าสู่ระบบ...');
  const formData = new FormData(elements.loginForm);
  try {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: formData.get('email'), password: formData.get('password') })
    });
    saveAuth(data.token, data.user);
    elements.loginForm.reset();
    setMessage(elements.loginMessage);
    closeDialog(elements.loginDialog);
    toast(`ยินดีต้อนรับ ${data.user.name}`);
  } catch (error) {
    setMessage(elements.loginMessage, error.message, true);
  }
}

async function handleRegister(event) {
  event.preventDefault();
  setMessage(elements.registerMessage, 'กำลังสร้างบัญชี...');
  const formData = new FormData(elements.registerForm);
  try {
    const data = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        studentId: formData.get('studentId'),
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        consent: formData.get('consent') === 'on'
      })
    });
    elements.registerForm.reset();
    setMessage(elements.registerMessage);
    closeDialog(elements.registerDialog);
    if (data.user) {
      saveAuth(data.token, data.user);
      toast(`ยินดีต้อนรับ ${data.user.name}`);
    } else {
      openDialog(elements.loginDialog);
      setMessage(elements.loginMessage, data.message);
    }
  } catch (error) {
    setMessage(elements.registerMessage, error.message, true);
  }
}

async function handleLogout() {
  try {
    await api('/api/auth/logout', { method: 'POST' });
  } catch {
    // Clear local session even if server is unavailable.
  }
  clearAuth(true);
}

async function handleMoodSubmit(event) {
  event.preventDefault();
  if (!requireLogin()) return;
  if (state.user.role !== 'student') return toast('ฟังก์ชันเช็กอินใช้สำหรับบัญชีนักศึกษา', true);
  const formData = new FormData(elements.moodForm);
  setMessage(elements.moodMessage, 'กำลังบันทึก...');
  try {
    const data = await api('/api/moods', {
      method: 'POST',
      body: JSON.stringify({
        mood: formData.get('mood'),
        stress: Number(formData.get('stress')),
        energy: Number(formData.get('energy')),
        note: formData.get('note')
      })
    });
    elements.moodForm.reset();
    elements.stressRange.value = '5';
    elements.energyRange.value = '5';
    elements.stressValue.textContent = '5';
    elements.energyValue.textContent = '5';
    setMessage(elements.moodMessage, data.message);
    await loadMoodHistory();
  } catch (error) {
    setMessage(elements.moodMessage, error.message, true);
  }
}

async function loadMoodHistory() {
  if (!state.user || state.user.role !== 'student') return;
  try {
    const data = await api('/api/moods');
    if (!data.entries.length) {
      elements.moodHistory.innerHTML = '<span>☁</span><p>ยังไม่มีบันทึก ลองเช็กใจวันนี้เป็นครั้งแรก</p>';
      return;
    }
    elements.moodHistory.innerHTML = `<div class="mood-history-list">${data.entries.slice(0, 10).map(item => `
      <div class="mood-history-item">
        <span class="emoji">${moodEmoji(item.mood)}</span>
        <div>
          <strong>${escapeHtml(item.mood)}</strong>
          <small>${escapeHtml(formatDateTime(item.created_at))}${item.note ? ` · ${escapeHtml(item.note)}` : ''}</small>
        </div>
        <div class="score-pills"><span>เครียด ${item.stress}</span><span>พลัง ${item.energy}</span></div>
      </div>`).join('')}</div>`;
  } catch (error) {
    elements.moodHistory.innerHTML = `<div class="empty-state"><p>${escapeHtml(error.message)}</p></div>`;
  }
}

function renderAssessmentMenu() {
  elements.assessmentMenu.innerHTML = Object.entries(assessments).map(([key, item]) => `
    <button class="assessment-menu-button" type="button" data-assessment="${key}">
      <span>${item.icon}</span>
      <span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.description)}</small></span>
    </button>`).join('');
}

function openAssessment(key) {
  const assessment = assessments[key];
  if (!assessment) return;
  state.activeAssessment = key;
  $$('.assessment-menu-button').forEach(button => button.classList.toggle('active', button.dataset.assessment === key));
  elements.assessmentIntro.classList.add('hidden');
  elements.assessmentResult.classList.add('hidden');
  elements.assessmentForm.classList.remove('hidden');
  elements.assessmentForm.innerHTML = `
    <div class="card-heading-row">
      <div><p class="eyebrow">${assessment.icon} ${escapeHtml(assessment.title)}</p><h3>${escapeHtml(assessment.description)}</h3></div>
    </div>
    ${assessment.questions.map((question, index) => `
      <fieldset class="assessment-question">
        <legend>${index + 1}. ${escapeHtml(question)}</legend>
        <div class="scale-options">
          ${scaleLabels.map((label, score) => `<label><input type="radio" name="q${index}" value="${score}" required /><span>${score}<br>${escapeHtml(label)}</span></label>`).join('')}
        </div>
      </fieldset>`).join('')}
    <button class="button primary full" type="submit">ดูผลประเมิน</button>
    <p class="tiny-note">ผลนี้เป็นการคัดกรองเบื้องต้น ไม่ใช่การวินิจฉัย และคำถามเป็นตัวอย่างสำหรับโครงงาน</p>`;
}

async function handleAssessmentSubmit(event) {
  event.preventDefault();
  const assessment = assessments[state.activeAssessment];
  if (!assessment) return;
  const formData = new FormData(elements.assessmentForm);
  const answers = assessment.questions.map((_, index) => Number(formData.get(`q${index}`)));
  if (answers.some(Number.isNaN)) return;
  const score = answers.reduce((sum, value) => sum + value, 0);
  const maxScore = assessment.questions.length * 3;
  const result = assessment.result(score);

  elements.assessmentForm.classList.add('hidden');
  elements.assessmentResult.classList.remove('hidden');
  elements.assessmentResult.innerHTML = `
    <p class="eyebrow">ผลประเมินเบื้องต้น</p>
    <h3>${escapeHtml(result.level)}</h3>
    <p>คะแนน ${score}/${maxScore}</p>
    <p>${escapeHtml(result.advice)}</p>
    <div class="hero-actions">
      <button class="button secondary" type="button" id="retakeAssessmentButton">ทำอีกครั้ง</button>
      ${score >= Math.ceil(maxScore * 0.65) ? '<a class="button primary" href="#booking">จองพูดคุย</a>' : ''}
    </div>`;
  $('#retakeAssessmentButton').addEventListener('click', () => openAssessment(state.activeAssessment));

  if (state.user && state.user.role === 'student') {
    try {
      await api('/api/assessments', {
        method: 'POST',
        body: JSON.stringify({ type: assessment.title, score, maxScore, level: result.level, answers })
      });
      toast('บันทึกผลประเมินแล้ว');
      await loadAssessmentHistory();
    } catch (error) {
      toast(error.message, true);
    }
  } else {
    toast('เข้าสู่ระบบเพื่อบันทึกผลประเมินย้อนหลัง');
  }
}

async function loadAssessmentHistory() {
  if (!state.user || state.user.role !== 'student') return;
  try {
    const data = await api('/api/assessments');
    if (!data.results.length) {
      elements.assessmentHistory.textContent = 'ยังไม่มีผลประเมินที่บันทึกไว้';
      return;
    }
    elements.assessmentHistory.innerHTML = `<div class="assessment-history-list">${data.results.map(item => `
      <div class="assessment-history-item">
        <span>♡</span>
        <div><strong>${escapeHtml(item.assessment_type)}</strong><small>${escapeHtml(item.level)} · ${escapeHtml(formatDateTime(item.created_at))}</small></div>
        <strong>${item.score}/${item.max_score}</strong>
      </div>`).join('')}</div>`;
  } catch (error) {
    elements.assessmentHistory.textContent = error.message;
  }
}

async function loadCounselors() {
  try {
    const data = await api('/api/counselors');
    state.counselors = data.counselors;
    elements.counselorList.innerHTML = data.counselors.map(counselor => `
      <label class="counselor-option" data-counselor-card="${counselor.id}">
        <input type="radio" name="counselor" value="${counselor.id}" />
        <div class="counselor-head">
          <span class="counselor-avatar">${escapeHtml(counselor.name.charAt(0))}</span>
          <div><h3>${escapeHtml(counselor.name)}</h3><small>${escapeHtml(counselor.title)}</small></div>
        </div>
        <p>${escapeHtml(counselor.bio)}</p>
        <div class="specialty-tags">${counselor.specialties.slice(0, 3).map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
      </label>`).join('');
  } catch (error) {
    elements.counselorList.innerHTML = `<div class="loading-box">${escapeHtml(error.message)}</div>`;
  }
}

function selectCounselor(id) {
  const counselor = state.counselors.find(item => String(item.id) === String(id));
  if (!counselor) return;
  state.selectedCounselorId = counselor.id;
  state.selectedSlot = null;
  $$('[data-counselor-card]').forEach(card => card.classList.toggle('selected', String(card.dataset.counselorCard) === String(counselor.id)));
  elements.bookingMode.disabled = false;
  elements.bookingMode.innerHTML = '<option value="">เลือกรูปแบบ</option>' + counselor.modes.map(mode => `<option>${escapeHtml(mode)}</option>`).join('');
  loadSlots();
}

async function loadSlots() {
  state.selectedSlot = null;
  if (!state.selectedCounselorId || !elements.bookingDate.value) {
    elements.slotGrid.innerHTML = '<p class="slot-placeholder">เลือกผู้ให้คำปรึกษาและวันที่ก่อน</p>';
    return;
  }
  elements.slotGrid.innerHTML = '<p class="slot-placeholder">กำลังตรวจสอบเวลาว่าง...</p>';
  try {
    const data = await api(`/api/availability?counselorId=${state.selectedCounselorId}&date=${encodeURIComponent(elements.bookingDate.value)}`);
    if (!data.slots.length) {
      elements.slotGrid.innerHTML = '<p class="slot-placeholder">วันนี้ไม่มีช่วงเวลาว่าง กรุณาเลือกวันอื่น</p>';
      return;
    }
    elements.slotGrid.innerHTML = data.slots.map(slot => `<button class="slot-button" type="button" data-slot="${slot.time}" data-duration="${slot.duration}">${slot.time}</button>`).join('');
  } catch (error) {
    elements.slotGrid.innerHTML = `<p class="slot-placeholder">${escapeHtml(error.message)}</p>`;
  }
}

async function handleBookingSubmit(event) {
  event.preventDefault();
  if (!requireLogin()) return;
  if (state.user.role !== 'student') return toast('การจองนัดใช้สำหรับบัญชีนักศึกษา', true);
  const safety = new FormData(elements.bookingForm).get('safety');
  if (safety === 'immediate') {
    openDialog(elements.urgentDialog);
    return;
  }
  if (!state.selectedCounselorId || !state.selectedSlot) {
    return setMessage(elements.bookingMessage, 'กรุณาเลือกผู้ให้คำปรึกษาและช่วงเวลา', true);
  }
  setMessage(elements.bookingMessage, 'กำลังบันทึกนัดหมาย...');
  try {
    const data = await api('/api/appointments', {
      method: 'POST',
      body: JSON.stringify({
        counselorId: state.selectedCounselorId,
        date: elements.bookingDate.value,
        time: state.selectedSlot,
        mode: elements.bookingMode.value,
        topic: elements.bookingTopic.value,
        note: elements.bookingNote.value,
        riskLevel: safety
      })
    });
    elements.bookingForm.reset();
    state.selectedCounselorId = null;
    state.selectedSlot = null;
    $$('[data-counselor-card]').forEach(card => card.classList.remove('selected'));
    elements.bookingMode.disabled = true;
    elements.bookingMode.innerHTML = '<option value="">เลือกผู้ให้คำปรึกษาก่อน</option>';
    elements.slotGrid.innerHTML = '<p class="slot-placeholder">เลือกผู้ให้คำปรึกษาและวันที่ก่อน</p>';
    setMessage(elements.bookingMessage, data.message);
    toast('จองเวลาพูดคุยสำเร็จ');
    await loadAppointments();
    document.querySelector('#appointments').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    if (error.data?.urgent) openDialog(elements.urgentDialog);
    setMessage(elements.bookingMessage, error.message, true);
    await loadSlots();
  }
}

async function loadAppointments() {
  if (!state.user) return;
  try {
    const data = await api('/api/appointments/my');
    if (state.user.role !== 'student') return renderStaffAppointments(data.appointments);
    if (!data.appointments.length) {
      elements.appointmentList.innerHTML = '<div class="empty-state card"><span>♡</span><p>ยังไม่มีนัดหมาย</p><a class="button primary" href="#booking">จองเวลาพูดคุย</a></div>';
      return;
    }
    elements.appointmentList.innerHTML = data.appointments.map(item => {
      const parts = monthDayParts(item.appointment_date);
      const active = ['pending', 'confirmed'].includes(item.status);
      return `
        <article class="appointment-card card">
          <div class="appointment-date"><strong>${parts.day}</strong><span>${escapeHtml(parts.month)} · ${escapeHtml(item.appointment_time)} น.</span></div>
          <div class="appointment-info">
            <span class="status-badge ${escapeHtml(item.status)}">${escapeHtml(statusLabel(item.status))}</span>
            <h3>${escapeHtml(item.topic)}</h3>
            <p>${escapeHtml(item.counselor_name)} · ${escapeHtml(item.mode)} · ${item.duration_minutes} นาที</p>
            ${item.note ? `<p>ข้อความ: ${escapeHtml(item.note)}</p>` : ''}
          </div>
          <div class="appointment-actions">
            ${active ? `<button class="button secondary small" type="button" data-reschedule="${item.id}" data-counselor-id="${item.counselor_id}">เลื่อนนัด</button>
            <button class="button ghost small" type="button" data-cancel-appointment="${item.id}">ยกเลิก</button>` : ''}
          </div>
        </article>`;
    }).join('');
  } catch (error) {
    elements.appointmentList.innerHTML = `<div class="empty-state card">${escapeHtml(error.message)}</div>`;
  }
}

async function cancelAppointment(id) {
  if (!window.confirm('ยืนยันยกเลิกนัดหมายนี้หรือไม่')) return;
  try {
    const data = await api(`/api/appointments/${id}/cancel`, { method: 'PATCH' });
    toast(data.message);
    await loadAppointments();
    if (['counselor', 'admin'].includes(state.user?.role)) await loadStaffDashboard();
  } catch (error) {
    toast(error.message, true);
  }
}

async function openRescheduleDialog(id, counselorId) {
  const min = todayString();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 60);
  const max = dateInputString(maxDate);
  elements.guideContent.innerHTML = `
    <div class="guide-icon">📅</div>
    <h2>เลื่อนนัดหมาย</h2>
    <p>เลือกวันที่ใหม่แล้วเลือกช่วงเวลาที่ว่าง</p>
    <form id="rescheduleForm">
      <label><span>วันที่ใหม่</span><input id="rescheduleDate" type="date" min="${min}" max="${max}" required /></label>
      <div class="slot-grid" id="rescheduleSlots"><p class="slot-placeholder">เลือกวันที่ก่อน</p></div>
      <button class="button primary full" type="submit">ยืนยันการเลื่อนนัด</button>
      <p class="form-message" id="rescheduleMessage"></p>
    </form>`;
  openDialog(elements.guideDialog);
  const dateInput = $('#rescheduleDate');
  const slotsBox = $('#rescheduleSlots');
  const form = $('#rescheduleForm');
  let selectedTime = null;

  dateInput.addEventListener('change', async () => {
    selectedTime = null;
    slotsBox.innerHTML = '<p class="slot-placeholder">กำลังโหลด...</p>';
    try {
      const data = await api(`/api/availability?counselorId=${counselorId}&date=${encodeURIComponent(dateInput.value)}`);
      slotsBox.innerHTML = data.slots.length
        ? data.slots.map(slot => `<button class="slot-button" type="button" data-reschedule-slot="${slot.time}">${slot.time}</button>`).join('')
        : '<p class="slot-placeholder">ไม่มีเวลาว่างในวันนี้</p>';
    } catch (error) {
      slotsBox.innerHTML = `<p class="slot-placeholder">${escapeHtml(error.message)}</p>`;
    }
  });

  slotsBox.addEventListener('click', event => {
    const button = event.target.closest('[data-reschedule-slot]');
    if (!button) return;
    selectedTime = button.dataset.rescheduleSlot;
    $$('[data-reschedule-slot]').forEach(item => item.classList.toggle('selected', item === button));
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const message = $('#rescheduleMessage');
    if (!selectedTime) return setMessage(message, 'กรุณาเลือกเวลา', true);
    try {
      const data = await api(`/api/appointments/${id}/reschedule`, {
        method: 'PATCH',
        body: JSON.stringify({ date: dateInput.value, time: selectedTime })
      });
      closeDialog(elements.guideDialog);
      toast(data.message);
      await loadAppointments();
    } catch (error) {
      setMessage(message, error.message, true);
    }
  });
}

function updateBreathingTimer() {
  const minutes = Math.floor(state.breathing.remaining / 60);
  const seconds = state.breathing.remaining % 60;
  elements.breathingTimer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function setBreathingPhase(inhale) {
  state.breathing.inhale = inhale;
  elements.breathingCircle.classList.toggle('expand', inhale);
  elements.breathingCircle.classList.toggle('exhale', !inhale);
  elements.breathingCircle.querySelector('span').textContent = inhale ? 'หายใจเข้า' : 'หายใจออก';
  state.breathing.phaseTimer = window.setTimeout(() => setBreathingPhase(!inhale), 4000);
}

function startBreathing() {
  stopBreathing(false);
  state.breathing.remaining = Number(elements.breathingDuration.value);
  updateBreathingTimer();
  elements.startBreathingButton.classList.add('hidden');
  elements.stopBreathingButton.classList.remove('hidden');
  setBreathingPhase(true);
  state.breathing.interval = window.setInterval(() => {
    state.breathing.remaining -= 1;
    updateBreathingTimer();
    if (state.breathing.remaining <= 0) {
      stopBreathing(false);
      toast('จบการฝึกแล้ว ขอบคุณที่ให้เวลากับตัวเอง');
    }
  }, 1000);
}

function stopBreathing(reset = true) {
  window.clearInterval(state.breathing.interval);
  window.clearTimeout(state.breathing.phaseTimer);
  state.breathing.interval = null;
  state.breathing.phaseTimer = null;
  elements.breathingCircle.classList.remove('expand', 'exhale');
  elements.breathingCircle.querySelector('span').textContent = 'หายใจเข้า';
  elements.startBreathingButton.classList.remove('hidden');
  elements.stopBreathingButton.classList.add('hidden');
  if (reset) {
    state.breathing.remaining = Number(elements.breathingDuration.value);
    updateBreathingTimer();
  }
}

function openGuide(key) {
  const guide = guides[key];
  if (!guide) return;
  elements.guideContent.innerHTML = `
    <div class="guide-icon">${guide.icon}</div>
    <h2>${escapeHtml(guide.title)}</h2>
    <p>${escapeHtml(guide.intro)}</p>
    <div class="guide-steps">${guide.steps.map((step, index) => `<div class="guide-step"><strong>${index + 1}</strong> ${escapeHtml(step)}</div>`).join('')}</div>
    <button class="button primary full" type="button" data-close-dialog="guideDialog">เสร็จแล้ว</button>`;
  openDialog(elements.guideDialog);
}

async function handleJournalSubmit(event) {
  event.preventDefault();
  if (!requireLogin()) return;
  if (state.user.role !== 'student') return toast('สมุดโอบใจใช้สำหรับบัญชีนักศึกษา', true);
  const formData = new FormData(elements.journalForm);
  setMessage(elements.journalMessage, 'กำลังบันทึก...');
  try {
    const data = await api('/api/journal', {
      method: 'POST',
      body: JSON.stringify({ title: formData.get('title'), mood: formData.get('mood'), content: formData.get('content') })
    });
    elements.journalForm.reset();
    setMessage(elements.journalMessage, data.message);
    await loadJournal();
  } catch (error) {
    setMessage(elements.journalMessage, error.message, true);
  }
}

async function loadJournal() {
  if (!state.user || state.user.role !== 'student') return;
  try {
    const data = await api('/api/journal');
    if (!data.entries.length) {
      elements.journalList.innerHTML = '<div class="empty-state card"><span>✎</span><p>ยังไม่มีบันทึก เริ่มเขียนสิ่งที่อยากบอกตัวเองได้เลย</p></div>';
      return;
    }
    elements.journalList.innerHTML = data.entries.map(item => `
      <article class="journal-entry card">
        <div class="journal-entry-head">
          <div><h3>${escapeHtml(item.title)}</h3><small>${item.mood ? `${escapeHtml(item.mood)} · ` : ''}${escapeHtml(formatDateTime(item.created_at))}</small></div>
          <button type="button" data-delete-journal="${item.id}">ลบ</button>
        </div>
        <p>${escapeHtml(item.content)}</p>
      </article>`).join('');
  } catch (error) {
    elements.journalList.innerHTML = `<div class="empty-state card">${escapeHtml(error.message)}</div>`;
  }
}

async function deleteJournal(id) {
  if (!window.confirm('ลบบันทึกนี้หรือไม่')) return;
  try {
    const data = await api(`/api/journal/${id}`, { method: 'DELETE' });
    toast(data.message);
    await loadJournal();
  } catch (error) {
    toast(error.message, true);
  }
}

function renderStaffAppointments(appointments) {
  if (!appointments.length) {
    elements.staffAppointments.innerHTML = '<div class="empty-state card">ไม่มีรายการนัดหมาย</div>';
    return;
  }
  elements.staffAppointments.innerHTML = appointments.map(item => `
    <article class="staff-appointment card">
      <div><strong>${escapeHtml(formatDateOnly(item.appointment_date))}</strong><p>${escapeHtml(item.appointment_time)} น. · ${item.duration_minutes} นาที</p></div>
      <div>
        <span class="status-badge ${escapeHtml(item.status)}">${escapeHtml(statusLabel(item.status))}</span>
        <h3>${escapeHtml(item.student_name)} ${item.student_id ? `(${escapeHtml(item.student_id)})` : ''}</h3>
        <p>${escapeHtml(item.topic)} · ${escapeHtml(item.mode)} · ผู้ให้คำปรึกษา: ${escapeHtml(item.counselor_name)}</p>
        ${item.note ? `<p>ข้อความก่อนนัด: ${escapeHtml(item.note)}</p>` : ''}
      </div>
      <div class="staff-actions">
        ${['pending', 'confirmed'].includes(item.status) ? `
          <button class="button secondary small" type="button" data-staff-status="${item.id}" data-status="completed">เสร็จสิ้น</button>
          <button class="button ghost small" type="button" data-staff-status="${item.id}" data-status="no_show">ไม่มาตามนัด</button>
          <button class="button ghost small" type="button" data-cancel-appointment="${item.id}">ยกเลิก</button>` : ''}
      </div>
    </article>`).join('');
}

async function loadStaffDashboard() {
  if (!state.user || !['counselor', 'admin'].includes(state.user.role)) return;
  try {
    const data = await api('/api/appointments/my');
    renderStaffAppointments(data.appointments);
    if (state.user.role === 'admin') {
      const statsData = await api('/api/admin/stats');
      renderAdminStats(statsData.stats);
    } else {
      elements.adminStats.classList.add('hidden');
    }
  } catch (error) {
    elements.staffAppointments.innerHTML = `<div class="empty-state card">${escapeHtml(error.message)}</div>`;
  }
}

function renderAdminStats(stats) {
  elements.adminStats.classList.remove('hidden');
  elements.adminStats.innerHTML = `
    <div class="stat-card card"><strong>${stats.students}</strong><span>นักศึกษาที่สมัคร</span></div>
    <div class="stat-card card"><strong>${stats.upcoming}</strong><span>นัดที่กำลังจะถึง</span></div>
    <div class="stat-card card"><strong>${stats.completed}</strong><span>นัดที่เสร็จสิ้น</span></div>
    <div class="stat-card card"><strong>${stats.assessments}</strong><span>ผลประเมินที่บันทึก</span></div>`;
}

async function updateAppointmentStatus(id, status) {
  try {
    const data = await api(`/api/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    toast(data.message);
    await loadStaffDashboard();
  } catch (error) {
    toast(error.message, true);
  }
}

function renderScenario() {
  const scenario = scenarios[state.scenarioIndex];
  elements.scenarioContent.innerHTML = `
    <p class="eyebrow">สถานการณ์ ${state.scenarioIndex + 1}/${scenarios.length}</p>
    <div class="scenario-question"><strong>${escapeHtml(scenario.situation)}</strong></div>
    <div id="scenarioOptions">${scenario.options.map((option, index) => `<button class="scenario-option" type="button" data-scenario-option="${index}">${escapeHtml(option)}</button>`).join('')}</div>
    <div class="scenario-feedback hidden" id="scenarioFeedback"></div>
    <div class="flashcard-controls">
      <button class="button ghost" id="previousScenario" type="button" ${state.scenarioIndex === 0 ? 'disabled' : ''}>ก่อนหน้า</button>
      <button class="button primary" id="nextScenario" type="button" ${state.scenarioIndex === scenarios.length - 1 ? 'disabled' : ''}>ถัดไป</button>
    </div>`;
  $('#previousScenario').addEventListener('click', () => { state.scenarioIndex -= 1; renderScenario(); });
  $('#nextScenario').addEventListener('click', () => { state.scenarioIndex += 1; renderScenario(); });
}

function answerScenario(index) {
  const scenario = scenarios[state.scenarioIndex];
  $$('[data-scenario-option]').forEach(button => {
    button.disabled = true;
    const optionIndex = Number(button.dataset.scenarioOption);
    button.classList.toggle('correct', optionIndex === scenario.correct);
    button.classList.toggle('incorrect', optionIndex === index && index !== scenario.correct);
  });
  const feedback = $('#scenarioFeedback');
  feedback.classList.remove('hidden');
  feedback.innerHTML = `<strong>${index === scenario.correct ? 'ตอบได้เหมาะสม' : 'ลองทบทวนอีกครั้ง'}</strong><p>${escapeHtml(scenario.explanation)}</p>`;
}

function renderFlashcard() {
  const item = flashcards[state.flashcardIndex];
  state.flashcardFlipped = false;
  elements.flashcardQuestion.textContent = item.q;
  elements.flashcardAnswer.textContent = item.a;
  elements.flashcardAnswer.classList.add('hidden');
  elements.flashcard.querySelector('small').textContent = 'แตะเพื่อดูคำตอบ';
  elements.flashcardCount.textContent = `${state.flashcardIndex + 1}/${flashcards.length}`;
  elements.previousFlashcard.disabled = state.flashcardIndex === 0;
  elements.nextFlashcard.disabled = state.flashcardIndex === flashcards.length - 1;
}

function flipFlashcard() {
  state.flashcardFlipped = !state.flashcardFlipped;
  elements.flashcardAnswer.classList.toggle('hidden', !state.flashcardFlipped);
  elements.flashcard.querySelector('small').textContent = state.flashcardFlipped ? 'แตะเพื่อซ่อนคำตอบ' : 'แตะเพื่อดูคำตอบ';
}

function todayString() {
  return dateInputString(new Date());
}

function dateInputString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function initializeDates() {
  const today = new Date();
  const max = new Date();
  max.setDate(max.getDate() + 60);
  elements.bookingDate.min = dateInputString(today);
  elements.bookingDate.max = dateInputString(max);
}

function bindEvents() {
  elements.menuButton.addEventListener('click', () => {
    const open = elements.mainNav.classList.toggle('open');
    elements.menuButton.setAttribute('aria-expanded', String(open));
  });

  elements.mainNav.addEventListener('click', event => {
    if (event.target.closest('a')) {
      elements.mainNav.classList.remove('open');
      elements.menuButton.setAttribute('aria-expanded', 'false');
    }
  });

  elements.loginButton.addEventListener('click', () => openDialog(elements.loginDialog));
  elements.registerButton.addEventListener('click', () => openDialog(elements.registerDialog));
  elements.profileButton.addEventListener('click', () => {
    const hidden = elements.profileMenu.classList.toggle('hidden');
    elements.profileButton.setAttribute('aria-expanded', String(!hidden));
  });
  elements.logoutButton.addEventListener('click', handleLogout);
  elements.loginForm.addEventListener('submit', handleLogin);
  elements.registerForm.addEventListener('submit', handleRegister);

  document.addEventListener('click', event => {
    const closeButton = event.target.closest('[data-close-dialog]');
    if (closeButton) closeDialog(document.getElementById(closeButton.dataset.closeDialog));
    if (!event.target.closest('.account-actions')) {
      elements.profileMenu.classList.add('hidden');
      elements.profileButton.setAttribute('aria-expanded', 'false');
    }
  });

  $$('dialog').forEach(dialog => dialog.addEventListener('close', () => {
    if (!$$('dialog[open]').length) document.body.classList.remove('modal-open');
  }));

  elements.stressRange.addEventListener('input', () => { elements.stressValue.textContent = elements.stressRange.value; });
  elements.energyRange.addEventListener('input', () => { elements.energyValue.textContent = elements.energyRange.value; });
  elements.moodForm.addEventListener('submit', handleMoodSubmit);
  elements.refreshMoodButton.addEventListener('click', () => state.user ? loadMoodHistory() : requireLogin());

  elements.assessmentMenu.addEventListener('click', event => {
    const button = event.target.closest('[data-assessment]');
    if (button) openAssessment(button.dataset.assessment);
  });
  elements.assessmentForm.addEventListener('submit', handleAssessmentSubmit);
  elements.refreshAssessmentButton.addEventListener('click', () => state.user ? loadAssessmentHistory() : requireLogin());

  elements.counselorList.addEventListener('change', event => {
    if (event.target.name === 'counselor') selectCounselor(event.target.value);
  });
  elements.bookingDate.addEventListener('change', loadSlots);
  elements.slotGrid.addEventListener('click', event => {
    const button = event.target.closest('[data-slot]');
    if (!button) return;
    state.selectedSlot = button.dataset.slot;
    $$('.slot-button').forEach(item => item.classList.toggle('selected', item === button));
  });
  elements.bookingForm.addEventListener('submit', handleBookingSubmit);

  elements.refreshAppointmentsButton.addEventListener('click', () => state.user ? loadAppointments() : requireLogin());
  elements.appointmentList.addEventListener('click', event => {
    const cancel = event.target.closest('[data-cancel-appointment]');
    if (cancel) cancelAppointment(cancel.dataset.cancelAppointment);
    const reschedule = event.target.closest('[data-reschedule]');
    if (reschedule) openRescheduleDialog(reschedule.dataset.reschedule, reschedule.dataset.counselorId);
  });

  elements.startBreathingButton.addEventListener('click', startBreathing);
  elements.stopBreathingButton.addEventListener('click', () => stopBreathing(true));
  elements.breathingDuration.addEventListener('change', () => {
    if (!state.breathing.interval) {
      state.breathing.remaining = Number(elements.breathingDuration.value);
      updateBreathingTimer();
    }
  });

  $$('.resource-card, [data-guide="preclinical"]').forEach(button => button.addEventListener('click', () => openGuide(button.dataset.guide)));

  elements.journalForm.addEventListener('submit', handleJournalSubmit);
  elements.journalList.addEventListener('click', event => {
    const button = event.target.closest('[data-delete-journal]');
    if (button) deleteJournal(button.dataset.deleteJournal);
  });

  elements.refreshStaffButton.addEventListener('click', loadStaffDashboard);
  elements.staffAppointments.addEventListener('click', event => {
    const status = event.target.closest('[data-staff-status]');
    if (status) updateAppointmentStatus(status.dataset.staffStatus, status.dataset.status);
    const cancel = event.target.closest('[data-cancel-appointment]');
    if (cancel) cancelAppointment(cancel.dataset.cancelAppointment);
  });

  elements.openScenarioButton.addEventListener('click', () => {
    state.scenarioIndex = 0;
    renderScenario();
    openDialog(elements.scenarioDialog);
  });
  elements.scenarioContent.addEventListener('click', event => {
    const option = event.target.closest('[data-scenario-option]');
    if (option) answerScenario(Number(option.dataset.scenarioOption));
  });

  elements.openFlashcardButton.addEventListener('click', () => {
    state.flashcardIndex = 0;
    renderFlashcard();
    openDialog(elements.flashcardDialog);
  });
  elements.flashcard.addEventListener('click', flipFlashcard);
  elements.previousFlashcard.addEventListener('click', () => { state.flashcardIndex -= 1; renderFlashcard(); });
  elements.nextFlashcard.addEventListener('click', () => { state.flashcardIndex += 1; renderFlashcard(); });
}

async function init() {
  bindEvents();
  initializeDates();
  renderAssessmentMenu();
  renderFlashcard();
  await loadCounselors();
  await loadCurrentUser();

  supabase.auth.onAuthStateChange((event, session) => {
    state.token = session?.access_token || '';
    if (event === 'SIGNED_OUT') {
      clearAuth(false);
      return;
    }
    if (['SIGNED_IN', 'USER_UPDATED'].includes(event) && session) {
      window.setTimeout(() => loadCurrentUser(), 0);
    }
  });
}

init().catch(error => {
  console.error(error);
  toast(error.message || 'เปิดระบบไม่สำเร็จ', true);
});
