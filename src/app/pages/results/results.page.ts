import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { SafetyService } from '../../services/safety.service';
import { GuidanceResult, ConditionResult } from '../../models';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss']
})
export class ResultsPage implements OnInit {
  guidance: GuidanceResult | null = null;

  constructor(private safetyService: SafetyService, private router: Router) {}

  ngOnInit() {
    this.refreshGuidance();
  }

  ionViewWillEnter() {
    // Ionic may keep this page alive in the router outlet; refresh every time it becomes active.
    this.refreshGuidance();
  }

  private refreshGuidance() {
    this.guidance = this.safetyService.getGuidance();
  }

  get hasResults() {
    return !!this.guidance?.conditionResults.length;
  }

  conditionHints: Record<string, string> = {
    pregnancy: 'Pregnancy guidance varies by trimester. Select your trimester to get the most relevant modifications.',
    postpartum: 'Postpartum work should start gently and rebuild pelvic floor and core support with low-load, slow movement.',
    balance_issues: 'Choose grounded movement and avoid unsupported balance challenges until strength improves.',
    joint_replacement: 'Use low-impact, controlled exercises and avoid high joint loads around replaced hips, knees, or shoulders.',
    recent_surgery: 'Move slowly with medical clearance, avoid aggressive progression, and protect healing tissues after surgery.',
    foot_ankle_issues: 'Reduce foot loading, keep the feet supported, and avoid forced plantarflexion or unstable ankle positions.',
    chronic_fatigue: 'Keep sessions short, use frequent rest, and avoid pushing through excessive fatigue.',
    respiratory: 'Keep breathing calm and choose open chest, low-impact movement when respiratory symptoms are present.',
    swollen_glands: 'Swollen glands often signal infection or inflammation. Avoid pressure to the neck and head, and move gently until the cause is assessed.',
    vision_impairment: 'Use tactile support, a clutter-free practice area, and exercises that do not depend on visual targeting.',
    hearing_impairment: 'Provide visual and tactile cues so the client can follow the session safely without relying on sound.',
    epilepsy_seizure: 'Avoid seizure triggers, keep movement slow and supported, and have an emergency plan readily accessible.',
    severe_allergy: 'Verify allergens first, avoid scented products, and keep epinephrine available for any severe reaction.',
    chronic_pain_syndrome: 'Respect pain signals and use gentle, low-load movement with frequent rest to prevent flares.',
    skin_condition: 'Protect sensitive or irritated skin with padding and avoid exercises that increase friction or pressure.',
    transplant_immunosuppression: 'Choose low-impact movement and keep the environment clean while immunity is suppressed.',
    recent_hospitalization: 'Rebuild movement gradually after bed rest and avoid aggressive progression during early recovery.',
    pacemaker_implant: 'Avoid pressure and deep compression over the device site and use gentle upper-body work.',
    substance_use_recovery: 'Use grounding, predictable movement and avoid complex routines that require rapid decision-making.',
    osteoporosis: 'Support fragile bones with low-impact, controlled movement and avoid spinal flexion or heavy load without clearance.',
    pelvic_floor_dysfunction: 'Keep pelvic pressure low and avoid strong breath-holding or heavy abdominal loading.',
    diastasis_recti: 'Support the midline with gentle core reconnection and avoid intense crunches or twisting.',
    low_back_pain: 'Maintain neutral spine alignment and avoid repeated flexion, extension, or twisting through the lumbar spine.',
    scoliosis: 'Favor symmetrical, supported movement and avoid aggressive twisting or uneven loading on the spine.',
    arthritis: 'Move within pain-free range, choose low-impact exercises, and avoid forced joint positions or heavy loading.',
    knee_issues: 'Support the knee with alignment and avoid deep loaded flexion, twisting, or weight-bearing that causes pain.',
    hip_issues: 'Use controlled hip motion and avoid extreme rotation, end-range opening, or unsupported single-leg load.',
    shoulder_instability: 'Keep shoulder movement stable and avoid unsupported weight-bearing, deep overhead reach, or quick loading.',
    neck_shoulder: 'Support neck alignment and avoid unsupported head lifts, deep extension, or heavy shoulder compression.',
    bursitis: 'Protect inflamed bursae with padding, gentle range of motion, and avoid sustained compression or friction.',
    hypertension: 'Keep exertion moderate, avoid breath-holding, and favor steady, controlled movement over intense effort.',
    diabetes: 'Monitor effort and hydration, keep feet protected, and avoid sudden high-intensity work that may disrupt glucose control.',
    vertigo_dizziness: 'Move slowly and support the head, avoiding rapid turns, inversions, or unstable balance challenges.',
    other: 'Start conservatively with gentle, supported movement and avoid unfamiliar high-risk positions until you know how your body responds.',
    respiratory_pulmonary: 'Favor easy, steady breathing and avoid chest compression, breath-holding, and rapid exertion.',
    cardiovascular_disease: 'Keep intensity moderate, monitor heart response, and avoid breath-holding or sudden high-intensity effort.',
    arrhythmia_cardiac_device: 'Avoid sudden exertion and deep chest compression, and keep movement calm around any implanted device.',
    metabolic_endocrine: 'Move with careful pacing, avoid rapid intensity spikes, and watch for temperature sensitivity or energy swings.',
    autoimmune_inflammatory: 'Plan around flare cycles and avoid high-load or prolonged joint compression during active inflammation.',
    immune_infectious: 'Avoid pushing through active illness; favor gentle, low-impact movement and rest if symptoms worsen.',
    oncology_treatment: 'Adapt to fatigue and treatment side effects, avoiding aggressive load, deep compression, and unsupported effort.',
    gastrointestinal_pelvic: 'Keep core work gentle, avoid strong intra-abdominal pressure, and prioritize pelvic comfort and support.',
    neurological_disorder: 'Use additional support, slow progressions, and clear cues to compensate for coordination and sensation changes.',
    mental_cognitive: 'Keep the routine simple and predictable, avoid complex transitions, and allow extra time for processing and focus.',
    weight_concerns: 'Use joint-friendly, low-impact Pilates and avoid fast, unstable transitions or excessive load on the spine and hips.'
  };

  get selectedConditionLabels() {
    return this.guidance?.conditionResults?.map(result => result.conditionLabel) ?? [];
  }

  get selectedConditionHints() {
    const conditionIds = this.guidance?.conditionResults?.map(result => result.conditionId) ?? [];
    return Array.from(new Set(conditionIds.map(id => this.conditionHints[id]).filter(Boolean)));
  }

  private readonly conditionActionGuidance: Record<string, string[]> = {
    pregnancy: [
      'Keep movement gentle, low-impact, and well-supported. Avoid prolonged supine after the first trimester and unsupported balance work.',
      'Focus on steady breathing, pelvic support, and avoiding heavy abdominal compression, deep twists, or inversions.'
    ],
    osteoporosis: [
      'Choose stable, supported exercises with gentle weight-bearing and balance practice, avoiding spinal flexion, rotation, and impact.',
      'Keep your spine neutral and protect your bones from compression or sudden loading.'
    ],
    low_back_pain: [
      'Start with gentle core and pelvic stabilization, maintaining a neutral spine and moving in pain-free ranges.',
      'Avoid repeated flexion, extension or lifting through the low back until stability improves.'
    ],
    hypertension: [
      'Use slow, controlled movement with even breathing and avoid breath-holding, inversions, and sudden high-intensity effort.',
      'Keep heart rate moderate and prioritize gentle, supported mobility over heavy loading.'
    ],
    knee_issues: [
      'Favor pain-free ranges, soft landings, and supported knee positions while avoiding deep loaded knee flexion.',
      'Use gradual progression, keep the knee aligned, and avoid twisting under load.'
    ],
    hip_issues: [
      'Use controlled, stable hip movement and avoid extreme rotation, deep joint loading, and unsupported single-leg work.',
      'Choose smaller ranges and support the hips with props or a bench when needed.'
    ],
    neck_shoulder: [
      'Keep the neck long, shoulders supported, and avoid unsupported head or shoulder loading.',
      'Focus on posture, scapular stability, and gentle range rather than aggressive overhead or neck-intensive work.'
    ],
    respiratory: [
      'Use gentle, low-impact movement with smooth inhalation and exhalation.',
      'Avoid breath-holding, rapid exertion, and tight chest compression.'
    ],
    swollen_glands: [
      'Move gently and avoid deep neck extension, strong jaw movement, or direct pressure on swollen nodes.',
      'Choose quiet, supportive Pilates that does not aggravate tenderness in the neck, armpit, or groin.'
    ],
    recent_surgery: [
      'Get medical clearance and reintroduce movement gradually, avoiding high load, impact, and sudden change.',
      'Focus on gentle, supported mobility and avoid positions that stress the surgical area.'
    ],
    arthritis: [
      'Respect pain-free range, choose low-impact movement, and avoid forced end-range positions or heavy loading.',
      'Move with support and protect inflamed joints with gentle, controlled exercises.'
    ],
    scoliosis: [
      'Use balanced, supported movement and avoid aggressive twisting or uneven loading through the spine.',
      'Prioritize spinal support, symmetry, and gentle posture work rather than deep rotational motions.'
    ],
    pelvic_floor_dysfunction: [
      'Keep pressure low and support the pelvic floor with gentle core and breathing practice.',
      'Avoid heavy lifting, breath-holding, and high-impact or uncontrolled abdominal loading.'
    ],
    diastasis_recti: [
      'Focus on gentle core reconnection and avoid loaded abdominal flexion, twisting, or sudden compression.',
      'Use modified core work that supports the midline without increasing intra-abdominal pressure.'
    ],
    shoulder_instability: [
      'Keep shoulder work controlled and avoid unsupported weight-bearing, deep overhead load, and abrupt motions.',
      'Prioritize stability and gentle range before any heavier or more complex shoulder positions.'
    ],
    bursitis: [
      'Avoid positions that compress or irritate the inflamed bursa and use gentle, supported joint movement.',
      'Keep load light and minimize repetitive friction around the affected joint.'
    ],
    vertigo_dizziness: [
      'Start with stable, grounded positions and avoid rapid head turns, inversions, or unsupported balance work.',
      'Move slowly and keep the head neutral to reduce dizziness risk.'
    ],
    diabetes: [
      'Monitor intensity and hydration, choose safe foot support, and avoid high-impact or prolonged high-intensity effort.',
      'Keep movement steady and listen to your body to prevent blood sugar swings and injury.'
    ],
    postpartum: [
      'Progress gently with core reconnection and pelvic floor support, avoiding heavy abdominal compression too soon.',
      'Prioritize healing, support, and controlled movement over aggressive exercise.'
    ],
    balance_issues: [
      'Choose stable, grounded movement with support and avoid wobbly balance challenges or sudden changes.',
      'Build strength and stability before progressing to less stable positions.'
    ],
    joint_replacement: [
      'Keep load low, move with control, and avoid high-impact or deep joint stress around the replaced joint.',
      'Use gentle progressions and support the joint with appropriate alignment and assistance.'
    ],
    foot_ankle_issues: [
      'Use supportive foot positions and avoid high-impact loading, sudden direction changes, and unstable surfaces.',
      'Prioritize gentle strength and mobility with good foot alignment.'
    ],
    chronic_fatigue: [
      'Use short, gentle sessions with plenty of rest and avoid pushing through excessive fatigue.',
      'Pace movement carefully and recover fully before increasing load or duration.'
    ],
    vision_impairment: [
      'Use stable, anchored movement and minimize reliance on visual targeting or rapid direction changes.',
      'Keep the space clear, provide extra tactile or verbal cues, and choose exercises with solid surface contact rather than visual alignment cues.'
    ],
    hearing_impairment: [
      'Use visual demonstration, clear gestures, and written or tactile cues instead of fast verbal pacing.',
      'Keep the routine predictable, avoid audio-only transitions, and favor steady, easy-to-follow sequences.'
    ],
    epilepsy_seizure: [
      'Avoid rapid head movement, flashing lights, and high-intensity sequences that may trigger a seizure.',
      'Keep the environment calm, movement slow and supported, and ensure an emergency plan and access to help are available.'
    ],
    severe_allergy: [
      'Confirm allergens before the session and avoid scented products, latex, or food near the practice space.',
      'Keep epinephrine accessible, use hypoallergenic props, and ensure equipment is cleaned between clients.'
    ],
    chronic_pain_syndrome: [
      'Respect pain signals, use gentle pacing, and avoid prolonged, high-load, or repetitive exercise that may trigger a flare.',
      'Choose shorter sets with frequent rest, lighter resistance, and equipment modifications to reduce joint or soft tissue strain.'
    ],
    skin_condition: [
      'Protect sensitive skin with additional padding and avoid direct pressure on inflamed or open areas.',
      'Maintain clean equipment, use soft surfaces, and choose exercises that limit friction and compression on affected skin.'
    ],
    transplant_immunosuppression: [
      'Use very gentle, low-impact exercise and keep the environment clean to reduce infection risk.',
      'Avoid crowded spaces and shared high-touch equipment without proper cleaning, and limit aggressive load while immunity is suppressed.'
    ],
    recent_hospitalization: [
      'Reintroduce movement slowly with supportive positions and avoid high-effort sessions after bed rest.',
      'Watch for dizziness or fatigue, avoid rapid position changes, and prioritise short, gentle mobility work first.'
    ],
    pacemaker_implant: [
      'Avoid direct pressure or aggressive compression over the device site and keep upper-body movement controlled.',
      'Choose low-impact exercises, avoid breath-holding, and monitor heart rate response during effort.'
    ],
    substance_use_recovery: [
      'Use grounding, simple movement with calm cues and avoid complex balance exercises that require rapid decision-making.',
      'Focus on stability, clear cues, and gentle pacing rather than advanced or emotionally intense movement.'
    ],
    respiratory_pulmonary: [
      'Use gentle, breath-focused movement and avoid deep chest compression, breath-holding, and sudden increases in intensity.',
      'Choose open, supported positions that allow easy inhalation and exhalation without constricting the rib cage.'
    ],
    cardiovascular_disease: [
      'Keep the effort moderate, avoid high-intensity bursts, and do not hold your breath during exertion.',
      'Favor slow, controlled movement and monitor for excessive heart rate or breathlessness.'
    ],
    arrhythmia_cardiac_device: [
      'Keep movements calm and controlled, avoiding sudden rapid effort or deep compression near the device site.',
      'Stay in comfortable ranges, avoid breath-holding, and listen for any signs of irregular heart rhythm.'
    ],
    metabolic_endocrine: [
      'Pace exercise carefully and avoid rapid intensity changes if blood sugar, energy, or temperature regulation is unstable.',
      'Choose moderate, steady movement and be prepared to stop or rest if you feel dizzy, overheated, or weak.'
    ],
    autoimmune_inflammatory: [
      'Use lower load, shorter sessions, and avoid prolonged joint compression during flare-ups or active inflammation.',
      'Prioritize gentle circulation, mobility, and rest rather than pushing to high effort during active symptoms.'
    ],
    immune_infectious: [
      'Avoid exertion during fever, cough, or systemic symptoms and favor rest until the acute illness resolves.',
      'When returning to movement, start gently with low-impact, well-supported exercises and avoid high-intensity effort.'
    ],
    oncology_treatment: [
      'Adapt to energy and treatment side effects, avoiding aggressive compression, heavy resistance, and unsupported effort.',
      'Choose gentle, controlled Pilates and stop if you feel dizzy, nauseated, or excessively fatigued.'
    ],
    gastrointestinal_pelvic: [
      'Keep core and pelvic work gentle, avoid strong intra-abdominal pressure, and stop if pelvic or abdominal discomfort appears.',
      'Favor supported, low-impact movement and avoid intense twisting, crunching, or straining through the pelvis.'
    ],
    neurological_disorder: [
      'Use extra support, slow progressions, and simple movement patterns to reduce fall and coordination risk.',
      'Avoid rapid transitions, unstable balance challenges, and anything that feels unsafe for sensation changes.'
    ],
    mental_cognitive: [
      'Keep cues clear, pace predictable, and sessions focused on safety and comfort rather than complexity.',
      'Avoid long, complicated sequences and allow extra time for understanding each movement.'
    ],
    weight_concerns: [
      'Choose joint-friendly, low-impact Pilates with good support and avoid high-impact or unstable transitions.',
      'Focus on steady alignment, gradual progression, and minimizing excessive load through the spine and hips.'
    ],
    other: [
      'Start conservatively with supported, low-load movement and avoid unfamiliar high-risk exercises.',
      'Consult a qualified clinician for condition-specific guidance.'
    ]
  };

  get actionGuidance() {
    const selected = this.guidance?.conditionResults?.flatMap(result => {
      if (result.conditionId === 'pregnancy') {
        return this.getPregnancyActionGuidance(result);
      }
      return this.conditionActionGuidance[result.conditionId] ?? [];
    }) ?? [];
    const unique = Array.from(new Set(selected));
    return unique.length ? unique.slice(0, 4) : [
      'If you have a concern, start with gentle, well-supported movement and avoid pain-provoking positions.',
      'Keep breathing steady, stay within pain-free range, and prioritize control over depth or intensity.'
    ];
  }

  private getPregnancyActionGuidance(condition: ConditionResult): string[] {
    const trimester = (condition.pregnancyTrimester || 'Unknown').toLowerCase();
    const firstTrimester = [
      'Keep exercise gentle and avoid prolonged supine positions after the first trimester.',
      'Avoid deep abdominal flexion, intense core crunches, and unstable balance work.'
    ];
    const secondTrimester = [
      'Use stable, supported movement as your center of gravity shifts, and avoid deep spinal flexion or backbends.',
      'Avoid inversions, deep twisting, and any exercise that feels uncomfortable around the belly.'
    ];
    const thirdTrimester = [
      'Focus on gentle mobility and pelvic support, and avoid prolonged supine, deep twisting, or unsupported balance positions.',
      'Choose exercises that feel steady, comfortable, and avoid intense abdominal compression.'
    ];
    if (trimester === '1st') return firstTrimester;
    if (trimester === '2nd') return secondTrimester;
    if (trimester === '3rd') return thirdTrimester;
    return [
      'Keep exercise gentle, supported, and avoid positions that increase abdominal pressure or instability.',
      'Steer clear of inversions, deep twist, and heavy abdominal loading until cleared by your care team.'
    ];
  }

  private readonly conditionSafetySections: Record<string, { what: string; dangers: string; avoid: string }> = {
    osteoporosis: {
      what: 'A condition where bones weaken and fracture risk rises, especially in the spine, hips, and wrists.',
      dangers: 'Weak bones are vulnerable to compression fractures, especially from spinal flexion, twisting, and impact. Sudden or heavy axial load can cause fracture even without a fall.',
      avoid: 'Avoid Roll Up, Roll Over, Teaser, Jackknife, deep spinal flexion, end-range rotation, and high-impact jumping.'
    },
    pregnancy: {
      what: 'A natural state with changing anatomy, circulation, and balance. Trimester-specific modifications help protect mother and fetus.',
      dangers: 'Pregnancy increases pelvic pressure, shifts balance, and changes heart rate response. Prolonged supine, breath-holding, deep twist, and unstable positions can add risk.',
      avoid: 'Avoid Roll Up, The Hundred, Teaser, Jackknife, Roll Over, inversions, prolonged supine after the first trimester, and unstable balance challenges.'
    },
    vision_impairment: {
      what: 'Vision impairment or blindness affects how the client judges distance, sees obstacles, and senses the environment.',
      dangers: 'Reduced visual feedback increases fall risk and can make transitions harder to time safely. Unclear surroundings and rapid directional changes can lead to missteps, collisions, or loss of balance.',
      avoid: 'Avoid unsupported balance challenges, rapid changes of direction, dim lighting, and exercises that rely on precise visual alignment or fast visual cues. Keep the environment clutter-free and use tactile support when possible.'
    },
    hearing_impairment: {
      what: 'Hearing impairment or deafness means the client may not receive verbal cues, timing prompts, or audio feedback reliably.',
      dangers: 'Missing spoken instructions can lead to unsafe transitions, mistimed breathing, or delayed responses. Routines that depend on audio timing or spoken corrections may increase confusion and risk.',
      avoid: 'Avoid exercises that rely on fast verbal pacing, audio-only cueing, or sudden transitions without visual or tactile guidance. Favor predictable, visually demonstrated sequences.'
    },
    epilepsy_seizure: {
      what: 'Epilepsy is a neurological condition marked by recurrent seizures, which may be triggered by specific stimuli, exertion, or fatigue.',
      dangers: 'A seizure during exercise can cause falls, head injury, airway compromise, or uncontrolled movement. Bright lights, rapid head motion, overheating, and intense exertion may increase trigger risk.',
      avoid: 'Avoid flashing lights, rapid head rotations, high-impact jumping, intense sequencing, unstable balance poses, and hot or crowded environments that can raise stress or body temperature.'
    },
    severe_allergy: {
      what: 'Severe allergies and anaphylaxis risk mean exposure to allergens can trigger life-threatening reactions such as airway swelling and shock.',
      dangers: 'Contact with latex, scented products, food allergens, or irritants can cause rapid respiratory distress, hives, hypotension, and anaphylaxis. Shared equipment or cleaning products can be hidden sources of exposure.',
      avoid: 'Avoid latex props, scented cleaners, food in the practice area, and any known allergen exposure without an emergency plan and access to epinephrine. Use hypoallergenic, disposable, or cleaned props as needed.'
    },
    chronic_pain_syndrome: {
      what: 'Chronic pain syndromes like fibromyalgia involve widespread sensitivity and fluctuating tolerance to movement, load, and stress.',
      dangers: 'Overexertion, prolonged static holds, and repeated high-load movement can trigger pain flares, fatigue, and reduced recovery ability. Poor pacing or heavy apparatus resistance may worsen symptoms.',
      avoid: 'Avoid long high-intensity sets, sustained maximal effort, repeated heavy resistance, back-to-back demanding exercises, and prolonged static positions that create pain or stiffness.'
    },
    skin_condition: {
      what: 'Skin conditions such as wounds, eczema, or psoriasis can cause sensitivity, irritation, and infection risk when under pressure or friction.',
      dangers: 'Direct pressure, sweat, friction, and contact with dirty equipment may worsen inflammation, pain, or open skin damage. Repeated rubbing or compression can exacerbate outbreaks or slow healing.',
      avoid: 'Avoid prone or seated positions that press on affected skin, direct equipment pressure on open or inflamed areas, bare contact with rough surfaces, and exercises that cause repeated rubbing.'
    },
    transplant_immunosuppression: {
      what: 'Transplant recipients on immunosuppression have reduced immune defenses and often lower energy while healing.',
      dangers: 'Infection risk is higher, and excessive load or abrupt movement can stress healing tissues or compromise transplant function. Crowded or unsanitary equipment increases exposure risk.',
      avoid: 'Avoid crowded, unsanitary spaces, shared high-touch equipment without cleaning, high-impact exercise, sudden heavy lifting, and aggressive unsupported movements.'
    },
    recent_hospitalization: {
      what: 'Recent hospitalization or prolonged bed rest results in deconditioning, weakness, and altered cardiovascular and orthostatic response.',
      dangers: 'Sudden high-effort movement, rapid standing transitions, or long sessions can cause dizziness, fatigue, orthostatic hypotension, and injury as the body recovers.',
      avoid: 'Avoid unsupported balance work, high-load lifting, rapid position changes, long demanding sequences, and vigorous apparatus resistance immediately after discharge.'
    },
    pacemaker_implant: {
      what: 'A pacemaker or implanted cardiac device regulates heart rhythm and relies on stable positioning and gentle load management.',
      dangers: 'Direct pressure on the device site, deep chest compression, and sudden strenuous effort can irritate the implant area or affect device function. Valsalva-style breath-holding should also be avoided.',
      avoid: 'Avoid heavy upper-body load, deep chest compression, forceful arm reach behind the chest, positions that press or tug on the implant site, and breath-holding under strain.'
    },
    substance_use_recovery: {
      what: 'Substance use disorder or recovery can affect coordination, judgment, energy, and emotional resilience.',
      dangers: 'Impaired focus, uneven coordination, and fluctuating energy raise the risk of falls, strain, or injury during complex or fast movement. Substance withdrawal or medication effects may also alter balance and perception.',
      avoid: 'Avoid advanced balance challenges, high-speed sequences, partner-assisted tricks, complex apparatus transitions, and anything that requires rapid decision-making without full attention.'
    },
    low_back_pain: {
      what: 'Chronic low back pain often involves disc irritation, muscular imbalance, or spinal joint sensitivity.',
      dangers: 'Repeated flexion, extension, and loading through a painful lumbar spine can aggravate tissue irritation and nerve symptoms.',
      avoid: 'Avoid Roll Up, Spine Stretch Forward, Swan Dive, Teaser, heavy lifting, rapid twisting, and repeated spinal flexion/extension.'
    },
    hypertension: {
      what: 'High blood pressure or cardiovascular concerns mean the circulatory system is under extra strain.',
      dangers: 'Sudden high-intensity effort, breath-holding, and inverted positions can spike blood pressure and place stress on the heart.',
      avoid: 'Avoid Jackknife, Roll Over, The Hundred with breath-holding, heavy overhead loading, and sudden high-intensity bursts.'
    },
    knee_issues: {
      what: 'Knee pain, arthritis, or replacement can make the joint sensitive to load, depth, and position.',
      dangers: 'Deep loaded knee flexion and twisting under load can stress cartilage, ligaments, or prosthetic components.',
      avoid: 'Avoid deep squats, weighted lunges, unsupported kneeling, Shoulder Bridge if painful, high-impact stepping, and deep loaded knee flexion.'
    },
    hip_issues: {
      what: 'Hip pain, arthritis, or replacement means the joint may tolerate ranges and load differently than a healthy hip.',
      dangers: 'Excessive rotation, end-range opening, and unsupported weight-bearing can irritate the hip joint or implant.',
      avoid: 'Avoid wide stance lunges, clamshells with forceful hip rotation, impact jumping, step-ups with twist, and sharp pivoting.'
    },
    neck_shoulder: {
      what: 'Neck and shoulder issues often reflect tension, impingement, instability, or postural strain.',
      dangers: 'Unsupported head lifts, heavy shoulder loading, and end-range shoulder positions can worsen impingement or instability.',
      avoid: 'Avoid Plank with poor head alignment, Swan, overhead reaching with heavy resistance, and unsupported neck extension.'
    },
    respiratory: {
      what: 'Respiratory concerns like asthma, bronchospasm, or breathlessness require careful attention to breathing and chest comfort.',
      dangers: 'Breath-holding, rapid exertion, and chest-compressive positions can trigger wheezing, shortness of breath, or tightness.',
      avoid: 'Avoid Jackknife, Roll Over, rapid transitions, breath-holding, and deep, compressive upper-body work without clearance.'
    },
    respiratory_pulmonary: {
      what: 'Respiratory and pulmonary conditions can limit airflow and gas exchange, requiring careful control of breathing and exercise intensity.',
      dangers: 'Rapid exertion, chest compression, and breath-holding can worsen shortness of breath, bronchospasm, or lung discomfort.',
      avoid: 'Avoid rapid transitions, breath-holding, deep chest compression, high-intensity sequences, and prone positions that restrict the rib cage.'
    },
    cardiovascular_disease: {
      what: 'Cardiovascular disease includes conditions like coronary artery disease, heart failure, and weakened heart muscle.',
      dangers: 'Heavy load, rapid intensity spikes, and breath-holding can overstrain the heart and raise blood pressure or ischemic risk.',
      avoid: 'Avoid high-intensity intervals, heavy resistance, deep chest compression, sudden direction changes, and unsupported upper-body effort.'
    },
    arrhythmia_cardiac_device: {
      what: 'Arrhythmias and implanted cardiac devices require stable cardiovascular pacing and gentle movement around the chest area.',
      dangers: 'Sudden exertion, deep chest pressure, and Valsalva-like breath-holding may trigger irregular rhythms or irritate the implant site.',
      avoid: 'Avoid rapid intensity changes, breath-holding, deep upper-body compression, and exercise that places force on the device location.'
    },
    metabolic_endocrine: {
      what: 'Metabolic and endocrine conditions can affect blood sugar, hormone balance, weight, and temperature regulation.',
      dangers: 'Sudden intensity changes, dehydration, or overheating can destabilize glucose levels, energy, and hormonal response.',
      avoid: 'Avoid prolonged high-intensity work, rapid transitions, hot environments, and aggressive load when metabolism or energy is unstable.'
    },
    autoimmune_inflammatory: {
      what: 'Autoimmune and inflammatory conditions often cause joint and tissue sensitivity, with flare cycles and variable tolerance.',
      dangers: 'High load, prolonged compression, and repetitive joint stress can worsen inflammation, pain, and recovery time.',
      avoid: 'Avoid sustained heavy resistance, repeated high-impact movement, deep joint compression, and long static holds during active inflammation.'
    },
    immune_infectious: {
      what: 'Immune and infectious conditions can include systemic illness and reduced recovery capacity during active infection.',
      dangers: 'Pushing through fever, fatigue, or systemic symptoms can worsen illness, delay recovery, and increase risk of complications.',
      avoid: 'Avoid intense exertion during active illness, crowded shared equipment spaces, prolonged high-load workouts, and exercising while febrile or symptomatic.'
    },
    oncology_treatment: {
      what: 'Active cancer treatment affects energy, blood counts, and tissue tolerance, so exercise must be carefully adapted.',
      dangers: 'Aggressive loading, deep compression, and prolonged effort can increase fatigue, bruising, infection risk, and treatment-related side effects.',
      avoid: 'Avoid heavy resistance, deep spinal or chest compression, breath-holding, unstable balance, and long high-intensity sequences during active treatment or recovery.'
    },
    gastrointestinal_pelvic: {
      what: 'Gastrointestinal and pelvic floor conditions can be sensitive to core compression, twisting, and intra-abdominal pressure.',
      dangers: 'Strong abdominal load, intense twist, and pelvic strain can aggravate pain, reflux, leakage, or pelvic floor dysfunction.',
      avoid: 'Avoid intense crunches, deep twisting, heavy loaded core work, strong breath-holding, and rapid pelvic floor pressure changes.'
    },
    neurological_disorder: {
      what: 'Neurological disorders may affect balance, coordination, sensation, and motor control.',
      dangers: 'Unstable positions, rapid transitions, and complex movement patterns can increase fall risk, injury, and dizziness.',
      avoid: 'Avoid unsupported balance challenges, fast direction changes, complex apparatus sequences, and rapidly changing foot/hand positions.'
    },
    mental_cognitive: {
      what: 'Mental health and cognitive conditions can affect attention, decision-making, stress response, and motor control.',
      dangers: 'Overly complex sequences, fast transitions, and unclear cues can increase anxiety, loss of focus, and risk of movement errors.',
      avoid: 'Avoid long complicated routines, rapid pace changes, indirect cueing, and sequences that rely on quick memory or multitasking.'
    },
    weight_concerns: {
      what: 'Overweight or obesity can increase joint load, change movement mechanics, and alter balance and mobility.',
      dangers: 'High-impact or unstable movement can stress joints, increase fatigue, and raise the risk of knee, hip, or back discomfort.',
      avoid: 'Avoid high-impact jumping, fast unstable transitions, unsupported single-leg work, and excessive spinal or hip compression under load.'
    },
    swollen_glands: {
      what: 'Swollen glands are enlarged lymph nodes typically caused by infection, inflammation, or immune response in the neck, armpit, or groin.',
      dangers: 'Swollen nodes can be tender and may indicate an active infection or inflammation. Aggressive movement, pressure, or strain near the affected area can increase discomfort.',
      avoid: 'Avoid deep neck flexion/extension, strong jaw or shoulder compression, prolonged prone neck loading, and rapid head turns around the tender nodes.'
    },
    recent_surgery: {
      what: 'Recent surgery means tissues are healing and must be reintroduced to movement gradually with medical clearance.',
      dangers: 'High load, abrupt movement, and unsupported motion near the surgical area can delay healing, reopen incisions, or cause pain.',
      avoid: 'Avoid Plank, Roll Up, deep hip rotation, loaded lunges, and movements that pull on surgical sites until cleared by a provider.'
    },
    arthritis: {
      what: 'Arthritis causes joint inflammation, stiffness, and sensitivity to stress in weight-bearing and moving joints.',
      dangers: 'Forced end-range motion, high-impact loading, and repetitive joint stress can increase inflammation and pain.',
      avoid: 'Avoid deep knee bends, heavy shoulder presses, loaded impact jumping, long holds in painful joints, and end-range spinal flexion.'
    },
    scoliosis: {
      what: 'Scoliosis is a spinal asymmetry that changes how the spine and ribs move under load.',
      dangers: 'Aggressive twisting, uneven loading, and unsupported asymmetrical positions can increase pain and spinal stress.',
      avoid: 'Avoid single-sided loaded bends, seated twist machines, forced asymmetrical rotation, and unsupported side bending on the spine.'
    },
    pelvic_floor_dysfunction: {
      what: 'Pelvic floor dysfunction affects the muscles supporting the pelvic organs and the deep core system.',
      dangers: 'High intra-abdominal pressure, breath-holding, and uncontrolled loading can worsen pelvic symptoms and leakage.',
      avoid: 'Avoid The Hundred, full sit-ups, heavy weighted lifts, high-impact jumps, and anything that causes pelvic pressure or leaking.'
    },
    diastasis_recti: {
      what: 'Diastasis recti is a separation of the abdominal midline where connective tissue needs gentle reconnection.',
      dangers: 'Loaded abdominal flexion, twisting, and sudden compression can stress the linea alba and slow healing.',
      avoid: 'Avoid full sit-ups, intense crunches, Teaser, loaded twisting, unsupported plank without pelvic support, and sudden core compression.'
    },
    shoulder_instability: {
      what: 'Shoulder instability or impingement means the joint is prone to slipping, pinching, or painful movement.',
      dangers: 'Unsupported weight-bearing, deep overhead load, and abrupt movement can aggravate instability or impingement.',
      avoid: 'Avoid full Plank, Swan, heavy overhead pressing, unsupported arm balances, and abrupt shoulder loading.'
    },
    bursitis: {
      what: 'Bursitis and tendinopathy are inflammatory conditions of joint cushioning sacs and tendons.',
      dangers: 'Repeated friction, compression, or sustained pressure can worsen inflammation around the affected bursa.',
      avoid: 'Avoid sustained kneeling, deep shoulder compression, repetitive arm elevation, and high-impact joint loading.'
    },
    vertigo_dizziness: {
      what: 'Vertigo and dizziness involve unstable vestibular and balance systems, making head movement a risk factor.',
      dangers: 'Rapid head turns, inversions, and unsupported balance work can trigger dizziness and increase fall risk.',
      avoid: 'Avoid inversions, fast head rotations, rolling down quickly, unstable balance challenges, and sudden position changes.'
    },
    diabetes: {
      what: 'Diabetes affects blood sugar regulation, circulation, and recovery, so activity should be paced and monitored.',
      dangers: 'Prolonged high intensity, dehydration, and poor foot protection can increase the risk of glucose swings, neuropathy, and injury.',
      avoid: 'Avoid unsupervised high-intensity intervals, barefoot high-impact work, prolonged standing without support, and exercises that risk foot trauma.'
    },
    postpartum: {
      what: 'Postpartum recovery involves rebuilding core, pelvic floor, and overall strength after childbirth.',
      dangers: 'Too much load too soon, excessive abdominal pressure, and unsupported pelvic motion can delay recovery and exacerbate weakness.',
      avoid: 'Avoid Roll Up, full sit-ups, intense abdominal crunching, high-impact jumping, and excessive twisting too soon after delivery.'
    },
    balance_issues: {
      what: 'Balance or fall risk means the body needs stable, grounded support rather than unpredictable movement.',
      dangers: 'Unstable surfaces, unsupported single-leg work, and sudden directional changes can increase fall risk and injury.',
      avoid: 'Avoid unsupported one-legged positions, dynamic balance challenges, unstable surfaces, and sudden direction changes.'
    },
    joint_replacement: {
      what: 'Joint replacement means a prosthetic joint is present and needs cautious load management and controlled motion.',
      dangers: 'Deep flexion, high impact, twisting under load, and sudden stress can irritate the replaced joint or surrounding tissues.',
      avoid: 'Avoid deep loaded knee/hip flexion, high-impact landings, twisting under load, step-ups with heavy load, and aggressive joint compression.'
    },
    foot_ankle_issues: {
      what: 'Foot and ankle issues include pain, instability, arthritis, or surgery that affect how the foot bears weight.',
      dangers: 'Unstable surfaces, high-impact loading, and extreme ankle positions can aggravate pain and instability.',
      avoid: 'Avoid high-impact jumping, unsupported single-leg hopping, forced plantarflexion, unstable surface work, and barefoot landings.'
    },
    chronic_fatigue: {
      what: 'Chronic fatigue means low energy tolerance and the need for careful pacing, rest, and recovery.',
      dangers: 'Excessive effort, long intense sessions, and poor recovery can worsen fatigue and delay progress.',
      avoid: 'Avoid long high-intensity sessions, repeated maximal effort, sustained overload, and insufficient rest between movements.'
    },
    other: {
      what: 'A condition not listed here; individualized guidance from a clinician is the safest next step.',
      dangers: 'Unknown individual risk may exist, so progress cautiously and avoid unfamiliar high-risk movements.',
      avoid: 'Avoid high-load, unstable, or unfamiliar exercises until you know how your body responds.'
    }
  };

  getConditionSection(section: 'what' | 'dangers' | 'avoid', condition: ConditionResult) {
    if (condition.conditionId === 'pregnancy') {
      const trimester = (condition.pregnancyTrimester || 'Unknown').toLowerCase();
      const pregnancySections: Record<string, Record<'what' | 'dangers' | 'avoid', string>> = {
        '1st': {
          what: 'Early pregnancy brings rapid hormonal and postural changes. Focus on gentle movement, pelvic stability, and avoiding prolonged supine after the first trimester.',
          dangers: 'High abdominal pressure, intense twisting, and unsupported balance work can increase discomfort and create unnecessary strain.',
          avoid: 'Avoid prolonged supine after the first trimester, deep abdominal crunches, heavy twisting, inversions, and unstable balance challenges.'
        },
        '2nd': {
          what: 'Mid-pregnancy involves a growing belly and shifting center of gravity, so stability and controlled movement are essential.',
          dangers: 'Overstretching, deep backbends, and sudden balance challenges can stress the lower back and pelvic floor as the body changes.',
          avoid: 'Avoid deep spinal flexion, unsupported backbends, inversions, intense core crunches, and any unstable balance poses.'
        },
        '3rd': {
          what: 'Late pregnancy increases pelvic pressure and balance changes. Gentle, supported movement is the safest approach.',
          dangers: 'Excessive abdominal loading, end-range hip opening, and unstable or inverted positions can aggravate pelvic pressure and discomfort.',
          avoid: 'Avoid intense abdominal flexion, prolonged supine, inversions, deep spinal twist, and unstable single-leg balance work.'
        },
        unknown: {
          what: 'Pregnancy requires progressing carefully with support, avoiding positions that increase abdominal pressure or instability.',
          dangers: 'Unsupported balance work, deep abdominal load, and inverted positions can place unnecessary strain during pregnancy.',
          avoid: 'Avoid deep crunches, prolonged supine holds, inversions, and unstable balance challenges.'
        }
      };
      const normalized = pregnancySections[trimester] ? trimester : 'unknown';
      return pregnancySections[normalized][section];
    }

    return this.conditionSafetySections[condition.conditionId]?.[section] ?? 'A safer version of this content is not available for this condition yet.';
  }

  getAvoidedExercises(condition: ConditionResult): string {
    return condition.contraindications?.map(item => this.formatExerciseLabel(item.exerciseId)).join(', ') || 'No specific exercises identified.';
  }

  formatExerciseLabel(exerciseId: string): string {
    return exerciseId
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  viewAgain() {
    this.router.navigate(['/']);
  }
}
