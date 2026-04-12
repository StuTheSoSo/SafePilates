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

  private readonly conditionSafetySections: Record<string, { what: string; dangers: string; avoid: string }> = {
    osteoporosis: {
      what: 'A condition where bones weaken and fracture risk rises, especially in the spine, hips, and wrists.',
      dangers: 'Spinal flexion, heavy axial loading, twisting, and high-impact stress can increase fracture risk in weakened bone.',
      avoid: 'Avoid loaded spinal flexion, end-range rotation, high-impact jumping, and deep twisting movements.'
    },
    pregnancy: {
      what: 'A natural state with changing anatomy, circulation, and balance. Trimester-specific modifications help protect mother and fetus.',
      dangers: 'Prolonged supine, breath-holding, heavy abdominal flexion, and unstable positions can add unnecessary stress during pregnancy.',
      avoid: 'Avoid prolonged supine after the first trimester, intense crunches, deep twisting, inversions, and unstable balance challenges.'
    },
    low_back_pain: {
      what: 'Chronic low back pain often involves disc irritation, muscular imbalance, or spinal joint sensitivity.',
      dangers: 'Repeated flexion/extension, high load through the lumbar spine, and painful postures can worsen symptoms.',
      avoid: 'Avoid heavy lifting, rapid twisting, repeated spinal flexion or extension, unsupported backbends, and pain-provoking movements.'
    },
    hypertension: {
      what: 'High blood pressure or cardiovascular concerns mean the circulatory system is under extra strain.',
      dangers: 'Sharp inversions, breath-holding, sudden intense effort, and high-resistance moves can spike blood pressure undesirably.',
      avoid: 'Avoid inversions, Valsalva-style breath hold, heavy overhead loading, and sudden high-intensity bursts.'
    },
    knee_issues: {
      what: 'Knee pain, arthritis, or replacement can make the joint sensitive to load, depth, and position.',
      dangers: 'Deep loaded bending, twisting under load, kneeling on hard surfaces, and impact can irritate the knee joint.',
      avoid: 'Avoid deep squats, weighted lunges, unsupported kneeling, high-impact stepping, and deep loaded knee flexion.'
    },
    hip_issues: {
      what: 'Hip pain, arthritis, or replacement means the joint may tolerate ranges and load differently than a healthy hip.',
      dangers: 'Excessive rotation, wide abduction, and unstable weight-bearing can increase discomfort or stress a vulnerable hip.',
      avoid: 'Avoid forced hip opening, loaded rotation, single-leg hip loading, and aggressive end-range hip positions.'
    },
    neck_shoulder: {
      what: 'Neck and shoulder issues often reflect tension, impingement, instability, or postural strain.',
      dangers: 'Unsupported head lifts, heavy shoulder loading, and extreme reach can aggravate cervical or shoulder structures.',
      avoid: 'Avoid unsupported crunches, rollovers with the head unsupported, heavy shoulder presses, and deep overhead reaches.'
    },
    recent_surgery: {
      what: 'Recent surgery means tissues are healing and must be reintroduced to movement gradually with medical clearance.',
      dangers: 'Early loading, sudden twisting, compression, and high-impact movement can delay healing or cause pain.',
      avoid: 'Avoid abrupt balance work, heavy resistance, deep joint stress, and unsupported movement near the surgical site.'
    },
    arthritis: {
      what: 'Arthritis causes joint inflammation, stiffness, and sensitivity to stress in weight-bearing and moving joints.',
      dangers: 'Extreme range, heavy compression, and rapid repetition can increase joint irritation and discomfort.',
      avoid: 'Avoid heavy weighted joint loading, forced end-range motion, high-impact jumping, and repetitive pounding.'
    },
    scoliosis: {
      what: 'Scoliosis is a spinal asymmetry that changes how the spine and ribs move under load.',
      dangers: 'Aggressive twisting, uneven loading, and unsupported asymmetrical positions can increase discomfort and strain.',
      avoid: 'Avoid forced rotation, unsupported side-bending, heavy unilateral spinal loading, and excess one-sided work.'
    },
    pelvic_floor_dysfunction: {
      what: 'Pelvic floor dysfunction affects the muscles supporting the pelvic organs and the deep core system.',
      dangers: 'Strong Valsalva, uncontrolled pressure, and high-impact load can overload the pelvic floor and worsen symptoms.',
      avoid: 'Avoid intense crunching, breath-holding, heavy lifting without support, and high-impact jumping.'
    },
    diastasis_recti: {
      what: 'Diastasis recti is a separation of the abdominal midline where connective tissue needs gentle reconnection.',
      dangers: 'Loaded abdominal flexion, twisting, and sudden core compression can stress the linea alba and slow recovery.',
      avoid: 'Avoid full sit-ups, intense crunches, loaded twisting, unsupported plank without pelvic support, and sudden core compression.'
    },
    shoulder_instability: {
      what: 'Shoulder instability or impingement means the joint is prone to slipping, pinching, or painful movement.',
      dangers: 'Unsupported weight-bearing, deep overhead load, and sudden movement can aggravate instability or impingement.',
      avoid: 'Avoid full plank push-ups, heavy overhead pressing, unsupported arm balances, and abrupt shoulder loading.'
    },
    bursitis: {
      what: 'Bursitis and tendinopathy are inflammatory conditions of joint cushioning sacs and tendons.',
      dangers: 'Repetitive friction, compression, and end-range joint positions can worsen inflammation around the affected area.',
      avoid: 'Avoid positions that compress the affected joint, repetitive high-load movement, and sharp end-range stress.'
    },
    vertigo_dizziness: {
      what: 'Vertigo and dizziness involve unstable vestibular and balance systems, making head movement a risk factor.',
      dangers: 'Rapid head turns, inversions, and unsupported balance work can trigger dizziness and increase fall risk.',
      avoid: 'Avoid inversions, fast head rotations, unstable balance challenges, and sudden position changes.'
    },
    diabetes: {
      what: 'Diabetes affects blood sugar regulation, circulation, and recovery, so activity should be paced and monitored.',
      dangers: 'Prolonged high intensity, dehydration, and poor foot protection can raise risk of blood sugar swings and injury.',
      avoid: 'Avoid unsupervised high-intensity intervals, extreme heat, barefoot high-impact work, and exercises that risk foot trauma.'
    },
    postpartum: {
      what: 'Postpartum recovery involves rebuilding core, pelvic floor, and overall strength after childbirth.',
      dangers: 'Too much load too soon, excessive abdominal compression, and unsupported pelvic pressure can delay recovery.',
      avoid: 'Avoid intense abdominal crunching, heavy pelvic floor loading, high-impact jumping, and excessive twisting.'
    },
    balance_issues: {
      what: 'Balance or fall risk means the body needs stable, grounded support rather than unpredictable movement.',
      dangers: 'Unsupported single-leg work, unstable surfaces, and sudden shifts can increase fall and injury risk.',
      avoid: 'Avoid wobbly balance challenges, unsupported one-legged positions, and fast directional changes.'
    },
    joint_replacement: {
      what: 'Joint replacement means a prosthetic joint is present and needs cautious load management and controlled motion.',
      dangers: 'High impact, deep joint flexion, twisting under load, and sudden direction changes can stress the replaced joint.',
      avoid: 'Avoid deep loaded knee/hip flexion, high-impact landings, twisting under load, and aggressive joint compression.'
    },
    foot_ankle_issues: {
      what: 'Foot and ankle issues include pain, instability, arthritis, or surgery that affect how the foot bears weight.',
      dangers: 'Excessive force, unstable surfaces, and extreme plantarflexion or inversion can aggravate foot and ankle structures.',
      avoid: 'Avoid high-impact jumping, unsupported single-leg hopping, extreme plantarflexion, and unstable surface work.'
    },
    chronic_fatigue: {
      what: 'Chronic fatigue means low energy tolerance and the need for careful pacing, rest, and recovery.',
      dangers: 'Pushing beyond tolerance, prolonged hard effort, and inadequate rest can trigger worsening fatigue.',
      avoid: 'Avoid long high-intensity sessions, repeated maximal effort, and little rest between movements.'
    },
    other: {
      what: 'A condition not listed here; individualized guidance from a clinician is the safest next step.',
      dangers: 'Unknown individual risk may exist, so progress cautiously and avoid unfamiliar high-risk movements.',
      avoid: 'Avoid high-load, unstable, or unfamiliar exercises until you know how your body responds.'
    }
  };

  getConditionSection(section: 'what' | 'dangers' | 'avoid', conditionId: string) {
    return this.conditionSafetySections[conditionId]?.[section] ?? 'A safer version of this content is not available for this condition yet.';
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
