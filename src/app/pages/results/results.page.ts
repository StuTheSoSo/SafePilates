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
    foot_ankle_issues: 'Reduce foot loading, keep the feet supported, and avoid forced plantarflexion or unstable ankle positions.',
    chronic_fatigue: 'Keep sessions short, use frequent rest, and avoid pushing through excessive fatigue.'
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
