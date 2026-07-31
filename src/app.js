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
  currentPage: 'home',
  breathing: { interval: null, phaseTimer: null, remaining: 60, inhale: true },
  scenarioIndex: 0,
  flashcardIndex: 0,
  flashcardFlipped: false,
  chatbot: { started: false, messages: [] }
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
  assessmentHistory: $('#assessmentHistory'),
  refreshAssessmentButton: $('#refreshAssessmentButton'),
  chatbotFloatingButton: $('#chatbotFloatingButton'),
  chatbotMessages: $('#chatbotMessages'),
  chatbotForm: $('#chatbotForm'),
  chatbotInput: $('#chatbotInput'),
  chatbotSendButton: $('#chatbotSendButton'),
  chatbotQuickReplies: $('#chatbotQuickReplies'),
  chatbotClearButton: $('#chatbotClearButton'),
  chatbotUrgentButton: $('#chatbotUrgentButton'),
  chatbotStatus: $('#chatbotStatus'),
  genericAssessmentDialog: $('#genericAssessmentDialog'),
  genericAssessmentCloseButton: $('#genericAssessmentCloseButton'),
  genericAssessmentKicker: $('#genericAssessmentKicker'),
  genericAssessmentTitle: $('#genericAssessmentTitle'),
  genericAssessmentBadge: $('#genericAssessmentBadge'),
  genericAssessmentDescription: $('#genericAssessmentDescription'),
  genericAssessmentInstruction: $('#genericAssessmentInstruction'),
  genericAssessmentScale: $('#genericAssessmentScale'),
  genericAssessmentQuestionView: $('#genericAssessmentQuestionView'),
  genericAssessmentResultView: $('#genericAssessmentResultView'),
  genericAssessmentProgressText: $('#genericAssessmentProgressText'),
  genericAssessmentAnsweredText: $('#genericAssessmentAnsweredText'),
  genericAssessmentProgressFill: $('#genericAssessmentProgressFill'),
  genericAssessmentQuestionNumber: $('#genericAssessmentQuestionNumber'),
  genericAssessmentQuestionText: $('#genericAssessmentQuestionText'),
  genericAssessmentAnswerList: $('#genericAssessmentAnswerList'),
  genericAssessmentPreviousButton: $('#genericAssessmentPreviousButton'),
  genericAssessmentNextButton: $('#genericAssessmentNextButton'),
  genericAssessmentResultLevel: $('#genericAssessmentResultLevel'),
  genericAssessmentResultScore: $('#genericAssessmentResultScore'),
  genericAssessmentResultMax: $('#genericAssessmentResultMax'),
  genericAssessmentResultAdvice: $('#genericAssessmentResultAdvice'),
  genericAssessmentSaveMessage: $('#genericAssessmentSaveMessage'),
  genericAssessmentBookingButton: $('#genericAssessmentBookingButton'),
  genericAssessmentBreathingButton: $('#genericAssessmentBreathingButton'),
  genericAssessmentRetakeButton: $('#genericAssessmentRetakeButton'),
  stressAssessmentDialog: $('#stressAssessmentDialog'),
  spstCloseButton: $('#spstCloseButton'),
  spstQuestionView: $('#spstQuestionView'),
  spstResultView: $('#spstResultView'),
  spstProgressText: $('#spstProgressText'),
  spstAnsweredText: $('#spstAnsweredText'),
  spstProgressFill: $('#spstProgressFill'),
  spstQuestionNumber: $('#spstQuestionNumber'),
  spstQuestionText: $('#spstQuestionText'),
  spstAnswerList: $('#spstAnswerList'),
  spstPreviousButton: $('#spstPreviousButton'),
  spstNextButton: $('#spstNextButton'),
  spstResultLevel: $('#spstResultLevel'),
  spstResultScore: $('#spstResultScore'),
  spstResultAdvice: $('#spstResultAdvice'),
  spstSaveMessage: $('#spstSaveMessage'),
  spstBookingButton: $('#spstBookingButton'),
  spstBreathingButton: $('#spstBreathingButton'),
  spstRetakeButton: $('#spstRetakeButton'),
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
    title: 'แบบวัดความเครียด SPST-20',
    description: 'ประเมินระดับความเครียดจากเหตุการณ์ต่าง ๆ ในช่วง 6 เดือนที่ผ่านมา',
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

const genericAssessmentState = {
  key: null,
  currentIndex: 0,
  answers: []
};


const spstQuestions = [
  'กลัวทำงานผิดพลาด',
  'ไปไม่ถึงเป้าหมายที่วางไว้',
  'ครอบครัวมีความขัดแย้งกันในเรื่องเงินหรือเรื่องงานในบ้าน',
  'เป็นกังวลกับเรื่องสารพิษหรือมลภาวะในอากาศ น้ำ เสียง และดิน',
  'รู้สึกว่าต้องแข่งขันหรือเปรียบเทียบ',
  'เงินไม่พอใช้จ่าย',
  'กล้ามเนื้อตึงหรือปวด',
  'ปวดหัวจากความตึงเครียด',
  'ปวดหลัง',
  'ความอยากอาหารเปลี่ยนแปลง',
  'ปวดศีรษะข้างเดียว',
  'รู้สึกวิตกกังวล',
  'รู้สึกคับข้องใจ',
  'รู้สึกโกรธหรือหงุดหงิด',
  'รู้สึกเศร้า',
  'ความจำไม่ดี',
  'รู้สึกสับสน',
  'ตั้งสมาธิลำบาก',
  'รู้สึกเหนื่อยง่าย',
  'เป็นหวัดบ่อย ๆ'
];

const spstAnswerOptions = [
  { value: 0, title: 'ไม่เกิดขึ้น', description: 'เหตุการณ์นี้ไม่เกิดขึ้นกับฉัน' },
  { value: 1, title: 'ไม่รู้สึกเครียด', description: 'เหตุการณ์เกิดขึ้น แต่ไม่ทำให้เครียด' },
  { value: 2, title: 'เครียดเล็กน้อย', description: 'รู้สึกเครียดเพียงเล็กน้อย' },
  { value: 3, title: 'เครียดปานกลาง', description: 'รู้สึกเครียดในระดับปานกลาง' },
  { value: 4, title: 'เครียดมาก', description: 'รู้สึกเครียดมาก' },
  { value: 5, title: 'เครียดมากที่สุด', description: 'รู้สึกเครียดมากที่สุด' }
];

const spstState = {
  currentIndex: 0,
  answers: Array(spstQuestions.length).fill(null)
};

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

const APP_PAGE_GROUPS = {
  home: ['home', 'homeQuickActions'],
  checkin: ['checkin'],
  assessments: ['assessments'],
  chatbot: ['chatbot'],
  booking: ['booking'],
  appointments: ['appointments'],
  breathing: ['breathing'],
  journal: ['journal'],
  nursing: ['nursing'],
  staffPanel: ['staffPanel']
};

function showAppPage(pageId = 'home', options = {}) {
  const { scroll = true } = options;
  const normalizedPage = APP_PAGE_GROUPS[pageId] ? pageId : 'home';
  const visibleIds = new Set(APP_PAGE_GROUPS[normalizedPage]);

  $$('#mainContent > section').forEach(section => {
    if (section.classList.contains('help-strip')) return;
    section.classList.toggle('app-page-hidden', !visibleIds.has(section.id));
  });

  state.currentPage = normalizedPage;
  elements.chatbotFloatingButton.classList.toggle('hidden', normalizedPage === 'chatbot');

  $$('.main-nav a[href^="#"]').forEach(link => {
    const linkPage = link.getAttribute('href').slice(1);
    link.classList.toggle('active', linkPage === normalizedPage);
  });

  elements.mainNav.classList.remove('open');
  elements.menuButton.setAttribute('aria-expanded', 'false');

  if (normalizedPage === 'assessments' && state.user?.role === 'student') {
    loadAssessmentHistory();
  }

  if (normalizedPage === 'appointments' && state.user?.role === 'student') {
    loadAppointments();
  }

  if (normalizedPage === 'journal' && state.user?.role === 'student') {
    loadJournal();
  }

  if (scroll) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
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

function getSpstTotalScore() {
  return spstState.answers.reduce((sum, answer) => sum + (answer ?? 0), 0);
}

function getSpstResult(score) {
  if (score <= 23) {
    return {
      level: 'ความเครียดระดับน้อย',
      advice:
        'คุณมีความเครียดอยู่ในระดับน้อยและสามารถปรับตัวกับสถานการณ์ต่าง ๆ ได้ค่อนข้างเหมาะสม ควรรักษาการพักผ่อนและทำกิจกรรมที่ช่วยเติมพลังใจอย่างสม่ำเสมอ'
    };
  }

  if (score <= 41) {
    return {
      level: 'ความเครียดระดับปานกลาง',
      advice:
        'คุณมีความเครียดระดับปานกลาง ลองผ่อนคลายด้วยการออกกำลังกาย ฟังเพลง อ่านหนังสือ ทำงานอดิเรก หรือพูดคุยกับคนที่ไว้ใจ'
    };
  }

  if (score <= 61) {
    return {
      level: 'ความเครียดระดับสูง',
      advice:
        'ความเครียดอาจเริ่มส่งผลต่อร่างกาย อารมณ์ และการใช้ชีวิต ควรพักผ่อน ฝึกหายใจ พูดคุยกับคนที่ไว้ใจ และนัดรับคำปรึกษาหากจัดการด้วยตนเองได้ยาก'
    };
  }

  return {
    level: 'ความเครียดระดับรุนแรง',
    advice:
      'คุณอาจกำลังเผชิญความเครียดระดับสูงและต่อเนื่อง ควรได้รับความช่วยเหลือจากผู้ให้คำปรึกษาหรือผู้เชี่ยวชาญด้านสุขภาพจิตโดยเร็ว หากรู้สึกไม่ปลอดภัยควรติดต่อบุคคลใกล้ชิดหรือบริการฉุกเฉินทันที'
  };
}

function renderSpstQuestion() {
  const index = spstState.currentIndex;
  const selectedAnswer = spstState.answers[index];
  const answeredCount = spstState.answers.filter(answer => answer !== null).length;

  elements.spstProgressText.textContent = `ข้อที่ ${index + 1} จาก ${spstQuestions.length}`;
  elements.spstAnsweredText.textContent = `ตอบแล้ว ${answeredCount} ข้อ`;
  elements.spstProgressFill.style.width = `${((index + 1) / spstQuestions.length) * 100}%`;
  elements.spstQuestionNumber.textContent = `ข้อ ${index + 1}`;
  elements.spstQuestionText.textContent = spstQuestions[index];

  elements.spstAnswerList.innerHTML = spstAnswerOptions
    .map(option => `
      <button
        class="spst-answer-option${selectedAnswer === option.value ? ' selected' : ''}"
        type="button"
        data-spst-answer="${option.value}"
        aria-pressed="${selectedAnswer === option.value}"
      >
        <span class="spst-answer-score">${option.value}</span>
        <span class="spst-answer-copy">
          <strong>${escapeHtml(option.title)}</strong>
          <small>${escapeHtml(option.description)}</small>
        </span>
      </button>
    `)
    .join('');

  elements.spstPreviousButton.disabled = index === 0;
  elements.spstNextButton.textContent =
    index === spstQuestions.length - 1 ? 'ดูผลประเมิน' : 'ถัดไป';
}

function resetSpstAssessment() {
  spstState.currentIndex = 0;
  spstState.answers = Array(spstQuestions.length).fill(null);
  elements.spstSaveMessage.textContent = '';
  elements.spstResultView.classList.add('hidden');
  elements.spstQuestionView.classList.remove('hidden');
  renderSpstQuestion();
}

function openSpstAssessment() {
  resetSpstAssessment();
  openDialog(elements.stressAssessmentDialog);
}

function closeSpstAssessment() {
  closeDialog(elements.stressAssessmentDialog);
}

async function finishSpstAssessment() {
  const score = getSpstTotalScore();
  const result = getSpstResult(score);

  elements.spstQuestionView.classList.add('hidden');
  elements.spstResultView.classList.remove('hidden');
  elements.spstResultScore.textContent = score;
  elements.spstResultLevel.textContent = result.level;
  elements.spstResultAdvice.textContent = result.advice;
  elements.spstSaveMessage.textContent = '';

  if (state.user?.role === 'student') {
    try {
      await api('/api/assessments', {
        method: 'POST',
        body: JSON.stringify({
          type: 'แบบวัดความเครียด SPST-20',
          score,
          maxScore: 100,
          level: result.level,
          answers: spstState.answers
        })
      });
      elements.spstSaveMessage.textContent = 'บันทึกผลประเมินไว้ในบัญชีของคุณแล้ว';
      await loadAssessmentHistory();
    } catch (error) {
      elements.spstSaveMessage.textContent = error.message;
    }
  } else {
    elements.spstSaveMessage.textContent =
      'คุณสามารถดูผลได้ทันที และเข้าสู่ระบบเมื่อต้องการบันทึกประวัติย้อนหลัง';
  }
}

function goFromSpstTo(pageId) {
  closeSpstAssessment();
  window.setTimeout(() => showAppPage(pageId), 80);
}

function renderAssessmentMenu() {
  elements.assessmentMenu.innerHTML = Object.entries(assessments).map(([key, item]) => `
    <button class="assessment-menu-button" type="button" data-assessment="${key}">
      <span class="assessment-card-icon">${item.icon}</span>
      <span class="assessment-card-copy">
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.description)}</small>
        <em>เริ่มทำแบบประเมิน →</em>
      </span>
    </button>`).join('');
}

function getGenericAssessment() {
  return assessments[genericAssessmentState.key] || null;
}

function resetGenericAssessment() {
  const assessment = getGenericAssessment();
  if (!assessment) return;

  genericAssessmentState.currentIndex = 0;
  genericAssessmentState.answers = Array(assessment.questions.length).fill(null);

  elements.genericAssessmentResultView.classList.add('hidden');
  elements.genericAssessmentQuestionView.classList.remove('hidden');
  elements.genericAssessmentSaveMessage.textContent = '';

  renderGenericAssessmentQuestion();
}

function renderGenericAssessmentQuestion() {
  const assessment = getGenericAssessment();
  if (!assessment) return;

  const index = genericAssessmentState.currentIndex;
  const selectedAnswer = genericAssessmentState.answers[index];
  const answeredCount = genericAssessmentState.answers.filter(answer => answer !== null).length;

  elements.genericAssessmentProgressText.textContent =
    `ข้อที่ ${index + 1} จาก ${assessment.questions.length}`;
  elements.genericAssessmentAnsweredText.textContent =
    `ตอบแล้ว ${answeredCount} ข้อ`;
  elements.genericAssessmentProgressFill.style.width =
    `${((index + 1) / assessment.questions.length) * 100}%`;
  elements.genericAssessmentQuestionNumber.textContent = `ข้อ ${index + 1}`;
  elements.genericAssessmentQuestionText.textContent = assessment.questions[index];

  elements.genericAssessmentAnswerList.innerHTML = scaleLabels
    .map((label, score) => `
      <button
        class="spst-answer-option${selectedAnswer === score ? ' selected' : ''}"
        type="button"
        data-generic-answer="${score}"
        aria-pressed="${selectedAnswer === score}"
      >
        <span class="spst-answer-score">${score}</span>
        <span class="spst-answer-copy">
          <strong>${escapeHtml(label)}</strong>
          <small>${score === 0 ? 'ไม่ตรงกับฉันเลย' : score === 3 ? 'เกิดขึ้นเกือบทุกวัน' : 'เลือกคำตอบนี้'}</small>
        </span>
      </button>
    `)
    .join('');

  elements.genericAssessmentPreviousButton.disabled = index === 0;
  elements.genericAssessmentNextButton.textContent =
    index === assessment.questions.length - 1 ? 'ดูผลประเมิน' : 'ถัดไป';
}

function openAssessment(key) {
  if (key === 'stress') {
    openSpstAssessment();
    return;
  }

  const assessment = assessments[key];
  if (!assessment) return;

  genericAssessmentState.key = key;
  state.activeAssessment = key;

  elements.genericAssessmentKicker.textContent = `${assessment.icon} แบบประเมินสุขภาพใจ`;
  elements.genericAssessmentTitle.textContent = assessment.title;
  elements.genericAssessmentBadge.textContent =
    key === 'burnout' ? 'BURNOUT CHECK' : 'SLEEP CHECK';
  elements.genericAssessmentDescription.textContent = assessment.description;
  elements.genericAssessmentInstruction.textContent =
    'ตอบจากความรู้สึกและประสบการณ์ของคุณในช่วง 7 วันที่ผ่านมา';
  elements.genericAssessmentScale.innerHTML = scaleLabels
    .map((label, score) => `<li><span>${score}</span> ${escapeHtml(label)}</li>`)
    .join('');

  resetGenericAssessment();
  openDialog(elements.genericAssessmentDialog);
}

function closeGenericAssessment() {
  closeDialog(elements.genericAssessmentDialog);
}

async function finishGenericAssessment() {
  const assessment = getGenericAssessment();
  if (!assessment) return;

  const score = genericAssessmentState.answers.reduce(
    (sum, value) => sum + (value ?? 0),
    0
  );
  const maxScore = assessment.questions.length * 3;
  const result = assessment.result(score);

  elements.genericAssessmentQuestionView.classList.add('hidden');
  elements.genericAssessmentResultView.classList.remove('hidden');
  elements.genericAssessmentResultScore.textContent = score;
  elements.genericAssessmentResultMax.textContent = `/${maxScore}`;
  elements.genericAssessmentResultLevel.textContent = result.level;
  elements.genericAssessmentResultAdvice.textContent = result.advice;
  elements.genericAssessmentSaveMessage.textContent = '';

  if (state.user?.role === 'student') {
    try {
      await api('/api/assessments', {
        method: 'POST',
        body: JSON.stringify({
          type: assessment.title,
          score,
          maxScore,
          level: result.level,
          answers: genericAssessmentState.answers
        })
      });
      elements.genericAssessmentSaveMessage.textContent =
        'บันทึกผลประเมินไว้ในบัญชีของคุณแล้ว';
      await loadAssessmentHistory();
    } catch (error) {
      elements.genericAssessmentSaveMessage.textContent = error.message;
    }
  } else {
    elements.genericAssessmentSaveMessage.textContent =
      'คุณสามารถดูผลได้ทันที และเข้าสู่ระบบเมื่อต้องการบันทึกประวัติย้อนหลัง';
  }
}

function goFromGenericAssessmentTo(pageId) {
  closeGenericAssessment();
  window.setTimeout(() => showAppPage(pageId), 80);
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


const CHATBOT_EMERGENCY_PATTERNS = [
  /อยากตาย/i,
  /ไม่อยากอยู่/i,
  /ฆ่าตัวตาย/i,
  /ทำร้ายตัวเอง/i,
  /ทำร้ายตนเอง/i,
  /จบชีวิต/i,
  /มีแผน.*ตาย/i,
  /ไม่ปลอดภัย/i,
  /เสียง.*สั่ง.*ทำร้าย/i,
  /ทำร้ายคนอื่น/i,
  /ฆ่าคน/i
];

const CHATBOT_RESPONSES = {
  stress: {
    text: 'ฟังดูเหมือนช่วงนี้คุณกำลังรับมือหลายอย่างพร้อมกันเลยนะ ความเครียดนั้นกระทบการนอน การเรียน หรือร่างกายของคุณมากที่สุดด้านไหน',
    actions: [
      { label: 'ทำ SPST-20', action: 'assessment', target: 'stress' },
      { label: 'ฝึกหายใจ 3 นาที', action: 'page', target: 'breathing' },
      { label: 'จองเวลาพูดคุย', action: 'page', target: 'booking' }
    ]
  },
  exam: {
    text: 'ความกังวลก่อนสอบเกิดขึ้นได้ โดยเฉพาะเมื่อเราคาดหวังกับตัวเองสูง ลองบอกโอบใจได้ไหมว่า กลัวเรื่องความจำไม่ทัน ทำข้อสอบไม่ได้ หรือกลัวผลคะแนนมากที่สุด',
    actions: [
      { label: 'พักใจก่อนอ่านต่อ', action: 'page', target: 'breathing' },
      { label: 'เช็กความเครียด', action: 'assessment', target: 'stress' }
    ]
  },
  clinical: {
    text: 'การขึ้นฝึกอาจทำให้ทั้งเหนื่อย กังวล และกลัวทำผิดได้ คุณไม่ได้แปลว่าไม่เก่งเพียงเพราะวันนี้ยากนะ ตอนนี้อยากให้ช่วยจัดการความกังวล หรืออยากเล่าเหตุการณ์ก่อน',
    actions: [
      { label: 'เช็กใจก่อนขึ้นฝึก', action: 'guide', target: 'preclinical' },
      { label: 'เขียน Reflective Journal', action: 'page', target: 'journal' },
      { label: 'จองผู้ให้คำปรึกษา', action: 'page', target: 'booking' }
    ]
  },
  burnout: {
    text: 'ความรู้สึกหมดไฟมักไม่ได้เกิดจากความขี้เกียจ แต่อาจเป็นสัญญาณว่าร่างกายและใจใช้พลังมานานเกินไป ช่วงนี้คุณรู้สึกเหนื่อย เบื่อชา หรือไม่อยากเริ่มงานมากที่สุดแบบไหน',
    actions: [
      { label: 'ทำแบบเช็กหมดไฟ', action: 'assessment', target: 'burnout' },
      { label: 'ไปห้องพักใจ', action: 'page', target: 'breathing' },
      { label: 'จองเวลาพูดคุย', action: 'page', target: 'booking' }
    ]
  },
  sleep: {
    text: 'การนอนไม่พอทำให้ความเครียดและความรู้สึกหนักขึ้นได้ ลองสังเกตว่าปัญหาหลักคือหลับยาก ตื่นบ่อย หรือคิดวนก่อนนอน',
    actions: [
      { label: 'เช็กคุณภาพการนอน', action: 'assessment', target: 'sleep' },
      { label: 'กิจกรรมพักใจก่อนนอน', action: 'guide', target: 'sleep' }
    ]
  },
  breathe: {
    text: 'ได้เลย ลองวางเท้าทั้งสองข้างให้มั่นคง ผ่อนไหล่ แล้วหายใจเข้าอย่างสบาย 4 วินาที จากนั้นค่อย ๆ หายใจออก 4 วินาที กดปุ่มด้านล่างเพื่อเริ่มตัวจับเวลาได้เลย',
    actions: [
      { label: 'เปิดห้องฝึกหายใจ', action: 'page', target: 'breathing' }
    ]
  },
  assessment: {
    text: 'โอบใจช่วยเลือกได้ค่ะ หากอยากสำรวจความเครียดให้เริ่มจาก SPST-20 ถ้าเหนื่อยล้าจากการเรียนหรือฝึกให้เลือกภาวะหมดไฟ และถ้ากังวลเรื่องการพักผ่อนให้เลือกคุณภาพการนอน',
    actions: [
      { label: 'ดูแบบประเมินทั้งหมด', action: 'page', target: 'assessments' },
      { label: 'เริ่ม SPST-20', action: 'assessment', target: 'stress' }
    ]
  },
  booking: {
    text: 'การอยากคุยกับผู้ให้คำปรึกษาเป็นการดูแลตัวเองที่ดีนะ คุณสามารถเลือกรูปแบบ วัน และเวลาที่สบายใจได้จากหน้าจองพูดคุย',
    actions: [
      { label: 'ไปหน้าจองพูดคุย', action: 'page', target: 'booking' }
    ]
  },
  journal: {
    text: 'การเขียนช่วยนำความคิดที่วนอยู่ในใจออกมาเป็นคำได้ คุณไม่ต้องเขียนให้สวย แค่เริ่มจาก “วันนี้เกิดอะไรขึ้น” และ “ตอนนี้ฉันรู้สึกอย่างไร”',
    actions: [
      { label: 'เปิดสมุดโอบใจ', action: 'page', target: 'journal' }
    ]
  },
  listen: {
    text: 'โอบใจอยู่ตรงนี้และพร้อมฟัง คุณไม่ต้องรีบเรียบเรียงให้ดี เล่าได้เลยว่า วันนี้เกิดอะไรขึ้นหรือช่วงนี้เรื่องไหนหนักที่สุด',
    actions: []
  },
  nursing: {
    text: 'เรามีโหมดฝึกสำหรับนักศึกษาพยาบาล เช่น สถานการณ์สื่อสารเชิงบำบัดและบัตรทบทวนจิตเวช คุณอยากลองสถานการณ์จำลองไหม',
    actions: [
      { label: 'ฝึกสถานการณ์', action: 'scenario', target: 'scenario' },
      { label: 'ไปหน้าเครื่องมือนักศึกษา', action: 'page', target: 'nursing' }
    ]
  },
  hello: {
    text: 'สวัสดีค่ะ โอบใจอยู่ตรงนี้นะ วันนี้อยากเล่าเรื่องอะไร หรืออยากให้ช่วยเลือกกิจกรรมดูแลใจแบบไหน',
    actions: [
      { label: 'อยากมีคนรับฟัง', action: 'prompt', target: 'อยากมีคนรับฟัง' },
      { label: 'ช่วยเลือกแบบประเมิน', action: 'prompt', target: 'ฉันควรทำแบบประเมินอะไร' }
    ]
  },
  fallback: {
    text: 'ขอบคุณที่เล่าให้ฟังนะ โอบใจอาจยังเข้าใจไม่ครบ แต่พร้อมฟังต่อ คุณอยากเล่าเพิ่มว่าเรื่องนี้ทำให้รู้สึกอย่างไร หรืออยากให้ช่วยพาไปพักใจ ทำแบบประเมิน หรือจองพูดคุย',
    actions: [
      { label: 'พักใจ', action: 'page', target: 'breathing' },
      { label: 'แบบประเมิน', action: 'page', target: 'assessments' },
      { label: 'จองพูดคุย', action: 'page', target: 'booking' }
    ]
  }
};

function chatbotHasEmergencyRisk(text) {
  return CHATBOT_EMERGENCY_PATTERNS.some(pattern => pattern.test(text));
}

function getChatbotIntent(text) {
  const normalized = text.toLowerCase().trim();

  if (/สวัสดี|หวัดดี|hello|hi/.test(normalized)) return 'hello';
  if (/อยากฟัง|รับฟัง|ระบาย|เล่าให้ฟัง|คนคุย/.test(normalized)) return 'listen';
  if (/ฆ่าตัวตาย|อยากตาย|ไม่อยากอยู่|ทำร้ายตัวเอง|ไม่ปลอดภัย/.test(normalized)) return 'emergency';
  if (/สอบ|osce|คะแนน|อ่านหนังสือ/.test(normalized)) return 'exam';
  if (/ขึ้นฝึก|หอผู้ป่วย|เวร|อาจารย์นิเทศ|ผู้ป่วย/.test(normalized)) return 'clinical';
  if (/หมดไฟ|ไม่อยากทำอะไร|เหนื่อยล้า|เบื่อชา/.test(normalized)) return 'burnout';
  if (/นอน|หลับ|ตื่นบ่อย|ง่วง/.test(normalized)) return 'sleep';
  if (/หายใจ|ผ่อนคลาย|พักใจ|grounding/.test(normalized)) return 'breathe';
  if (/แบบประเมิน|ประเมิน|เช็กความเครียด/.test(normalized)) return 'assessment';
  if (/จอง|ผู้ให้คำปรึกษา|นักจิตวิทยา|อยากคุยกับคน/.test(normalized)) return 'booking';
  if (/เขียน|สมุด|บันทึก|journal/.test(normalized)) return 'journal';
  if (/ฝึกสนทนา|สื่อสารเชิงบำบัด|นักศึกษาพยาบาล|สถานการณ์/.test(normalized)) return 'nursing';
  if (/เครียด|กังวล|กลัว|กดดัน|คิดมาก|ใจเต้น/.test(normalized)) return 'stress';
  return 'fallback';
}

function chatbotWelcomeMessage() {
  return {
    role: 'bot',
    text: 'สวัสดีค่ะ เราคือ “โอบใจ” ผู้ช่วยรับฟังเบื้องต้น วันนี้คุณอยากเล่าเรื่องอะไร หรือเลือกหัวข้อเริ่มต้นได้เลยนะ',
    actions: [
      { label: 'เครียดจากการเรียน', action: 'prompt', target: 'ช่วงนี้เครียดจากการเรียน' },
      { label: 'เหนื่อยจากการขึ้นฝึก', action: 'prompt', target: 'เหนื่อยจากการขึ้นฝึก' },
      { label: 'อยากมีคนรับฟัง', action: 'prompt', target: 'อยากมีคนรับฟัง' }
    ]
  };
}

function resetChatbot() {
  state.chatbot.messages = [chatbotWelcomeMessage()];
  state.chatbot.started = true;
  renderChatbotMessages();
  elements.chatbotInput.value = '';
  elements.chatbotStatus.textContent = 'พร้อมรับฟัง';
}

function addChatbotMessage(role, text, actions = []) {
  state.chatbot.messages.push({ role, text, actions });
  renderChatbotMessages();
}

function renderChatbotMessages() {
  elements.chatbotMessages.innerHTML = state.chatbot.messages.map((message, index) => `
    <article class="chatbot-message ${message.role === 'user' ? 'user' : 'bot'}">
      ${message.role === 'bot' ? '<div class="chatbot-mini-avatar" aria-hidden="true">ใจ</div>' : ''}
      <div class="chatbot-bubble">
        <p>${escapeHtml(message.text)}</p>
        ${message.actions?.length ? `
          <div class="chatbot-message-actions">
            ${message.actions.map(action => `
              <button
                type="button"
                data-chat-action="${escapeHtml(action.action)}"
                data-chat-target="${escapeHtml(action.target)}"
                data-chat-message-index="${index}"
              >${escapeHtml(action.label)}</button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </article>
  `).join('');

  window.requestAnimationFrame(() => {
    elements.chatbotMessages.scrollTop = elements.chatbotMessages.scrollHeight;
  });
}

function chatbotEmergencyResponse() {
  return {
    text: 'สิ่งที่คุณกำลังเผชิญอาจต้องได้รับความช่วยเหลือทันที กรุณาอย่าอยู่ลำพัง ย้ายไปอยู่ใกล้คนที่ไว้ใจหรือพื้นที่ปลอดภัย และติดต่อความช่วยเหลือตอนนี้ โอบใจไม่สามารถดูแลเหตุฉุกเฉินแทนผู้เชี่ยวชาญได้',
    actions: [
      { label: 'โทรสายด่วน 1323', action: 'phone', target: '1323' },
      { label: 'โทรฉุกเฉิน 1669', action: 'phone', target: '1669' },
      { label: 'ดูช่องทางช่วยเหลือ', action: 'urgent', target: 'urgent' }
    ]
  };
}

function handleChatbotInput(rawText) {
  const text = String(rawText || '').trim();
  if (!text) return;

  addChatbotMessage('user', text);
  elements.chatbotInput.value = '';
  elements.chatbotStatus.textContent = 'กำลังตอบ...';

  window.setTimeout(() => {
    if (chatbotHasEmergencyRisk(text)) {
      const response = chatbotEmergencyResponse();
      addChatbotMessage('bot', response.text, response.actions);
      elements.chatbotStatus.textContent = 'แนะนำความช่วยเหลือเร่งด่วน';
      return;
    }

    const intent = getChatbotIntent(text);
    const response = CHATBOT_RESPONSES[intent] || CHATBOT_RESPONSES.fallback;
    addChatbotMessage('bot', response.text, response.actions);
    elements.chatbotStatus.textContent = 'พร้อมรับฟัง';
  }, 450);
}

function openChatbotPage() {
  if (!state.chatbot.started) resetChatbot();
  showAppPage('chatbot');
  window.setTimeout(() => elements.chatbotInput.focus(), 180);
}

function handleChatbotAction(button) {
  const action = button.dataset.chatAction;
  const target = button.dataset.chatTarget;

  if (action === 'page') {
    showAppPage(target);
    return;
  }

  if (action === 'assessment') {
    showAppPage('assessments', { scroll: false });
    openAssessment(target);
    return;
  }

  if (action === 'guide') {
    showAppPage('breathing', { scroll: false });
    openGuide(target);
    return;
  }

  if (action === 'scenario') {
    state.scenarioIndex = 0;
    renderScenario();
    openDialog(elements.scenarioDialog);
    return;
  }

  if (action === 'prompt') {
    handleChatbotInput(target);
    return;
  }

  if (action === 'phone') {
    window.location.href = `tel:${target}`;
    return;
  }

  if (action === 'urgent') {
    openDialog(elements.urgentDialog);
  }
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

    const pageLink = event.target.closest('a[href^="#"]');
    if (pageLink) {
      const pageId = pageLink.getAttribute('href').slice(1);
      if (APP_PAGE_GROUPS[pageId]) {
        event.preventDefault();
        if (elements.stressAssessmentDialog.open) closeSpstAssessment();
        if (elements.genericAssessmentDialog.open) closeGenericAssessment();
        showAppPage(pageId);
      }
    }

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
    if (!button) return;
    openAssessment(button.dataset.assessment);
  });

  elements.spstCloseButton.addEventListener('click', closeSpstAssessment);

  elements.spstAnswerList.addEventListener('click', event => {
    const button = event.target.closest('[data-spst-answer]');
    if (!button) return;

    spstState.answers[spstState.currentIndex] = Number(button.dataset.spstAnswer);
    renderSpstQuestion();
  });

  elements.spstPreviousButton.addEventListener('click', () => {
    if (spstState.currentIndex === 0) return;
    spstState.currentIndex -= 1;
    renderSpstQuestion();
  });

  elements.spstNextButton.addEventListener('click', () => {
    if (spstState.answers[spstState.currentIndex] === null) {
      toast('กรุณาเลือกคำตอบก่อนกดถัดไป', true);
      return;
    }

    if (spstState.currentIndex < spstQuestions.length - 1) {
      spstState.currentIndex += 1;
      renderSpstQuestion();
      return;
    }

    finishSpstAssessment();
  });

  elements.spstRetakeButton.addEventListener('click', resetSpstAssessment);
  elements.spstBookingButton.addEventListener('click', () => goFromSpstTo('booking'));
  elements.spstBreathingButton.addEventListener('click', () => goFromSpstTo('breathing'));

  elements.genericAssessmentCloseButton.addEventListener('click', closeGenericAssessment);
  elements.genericAssessmentAnswerList.addEventListener('click', event => {
    const button = event.target.closest('[data-generic-answer]');
    if (!button) return;

    genericAssessmentState.answers[genericAssessmentState.currentIndex] =
      Number(button.dataset.genericAnswer);
    renderGenericAssessmentQuestion();
  });

  elements.genericAssessmentPreviousButton.addEventListener('click', () => {
    if (genericAssessmentState.currentIndex === 0) return;
    genericAssessmentState.currentIndex -= 1;
    renderGenericAssessmentQuestion();
  });

  elements.genericAssessmentNextButton.addEventListener('click', () => {
    if (genericAssessmentState.answers[genericAssessmentState.currentIndex] === null) {
      toast('กรุณาเลือกคำตอบก่อนกดถัดไป', true);
      return;
    }

    const assessment = getGenericAssessment();
    if (!assessment) return;

    if (genericAssessmentState.currentIndex < assessment.questions.length - 1) {
      genericAssessmentState.currentIndex += 1;
      renderGenericAssessmentQuestion();
      return;
    }

    finishGenericAssessment();
  });

  elements.genericAssessmentRetakeButton.addEventListener('click', resetGenericAssessment);
  elements.genericAssessmentBookingButton.addEventListener(
    'click',
    () => goFromGenericAssessmentTo('booking')
  );
  elements.genericAssessmentBreathingButton.addEventListener(
    'click',
    () => goFromGenericAssessmentTo('breathing')
  );

  elements.refreshAssessmentButton.addEventListener('click', () => state.user ? loadAssessmentHistory() : requireLogin());

  elements.chatbotFloatingButton.addEventListener('click', openChatbotPage);
  elements.chatbotClearButton.addEventListener('click', resetChatbot);
  elements.chatbotUrgentButton.addEventListener('click', () => openDialog(elements.urgentDialog));
  elements.chatbotForm.addEventListener('submit', event => {
    event.preventDefault();
    handleChatbotInput(elements.chatbotInput.value);
  });
  elements.chatbotInput.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      elements.chatbotForm.requestSubmit();
    }
  });
  document.addEventListener('click', event => {
    const promptButton = event.target.closest('[data-chat-prompt]');
    if (promptButton) {
      if (state.currentPage !== 'chatbot') openChatbotPage();
      handleChatbotInput(promptButton.dataset.chatPrompt);
      return;
    }

    const actionButton = event.target.closest('[data-chat-action]');
    if (actionButton) handleChatbotAction(actionButton);
  });

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
  resetChatbot();
  showAppPage('home', { scroll: false });
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
