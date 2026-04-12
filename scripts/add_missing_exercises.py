import json

with open('src/assets/data/exercises.json') as f:
    exercises = json.load(f)

# Avoid re-adding if already run
existing_ids = {e['id'] for e in exercises}

new_exercises = [
  # ── MAT ──────────────────────────────────────────────────────────────────
  {
    "id": "single_straight_leg_stretch",
    "name": "Single Straight Leg Stretch",
    "shortDescription": "Alternating straight-leg scissors motion performed supine that builds core stability and hip flexor control.",
    "focus": "Lower abdominal strength and hip flexor engagement.",
    "benefits": "Develops core control while stretching the hamstrings and hip flexors alternately.",
    "category": "Mat",
    "level": "Intermediate",
    "modifications": [
      "Keep the head on the mat and reduce the leg range if the lower back arches.",
      "Slow the alternation to focus on spinal stability before adding speed."
    ],
    "progressions": [
      "Lower both legs closer to the mat while keeping the pelvis stable.",
      "Increase the speed of the alternation while maintaining a steady breath."
    ]
  },
  {
    "id": "double_straight_leg_stretch",
    "name": "Double Straight Leg Stretch",
    "shortDescription": "Supine double-leg lowering and lifting that challenges deep abdominal strength under a long-lever load.",
    "focus": "Lower abdominal and deep core strength.",
    "benefits": "Builds lower abdominal endurance and lumbo-pelvic stability under load.",
    "category": "Mat",
    "level": "Intermediate",
    "modifications": [
      "Keep the hands behind the head for neck support and raise the legs higher.",
      "Bend the knees to reduce the lever arm if the lower back lifts from the mat."
    ],
    "progressions": [
      "Lower the legs progressively closer to the mat while keeping the spine imprinted.",
      "Add a small lower-leg pulse at the bottom of the range before lifting."
    ]
  },
  {
    "id": "criss_cross",
    "name": "Criss Cross",
    "shortDescription": "Supine rotational exercise alternating oblique reach toward opposite knee for waist definition and core control.",
    "focus": "Oblique strength and spinal rotation.",
    "benefits": "Targets the obliques and encourages thoracic rotation while stabilizing the pelvis.",
    "category": "Mat",
    "level": "Intermediate",
    "modifications": [
      "Keep the twisting range small and avoid pulling the neck with the hands.",
      "Move slowly and pause at the top of each rotation to control the motion."
    ],
    "progressions": [
      "Extend the bottom leg lower while maintaining the rotation to increase core demand.",
      "Add a small pulse at the peak of each rotation before switching sides."
    ]
  },
  {
    "id": "plank",
    "name": "Plank",
    "shortDescription": "Static full-body hold in a straight line from head to heels that trains overall core endurance and alignment.",
    "focus": "Core endurance and full-body alignment.",
    "benefits": "Builds isometric core and shoulder stability while reinforcing a neutral spine.",
    "category": "Mat",
    "level": "Beginner",
    "modifications": [
      "Drop to the knees to reduce the load on the core and shoulders.",
      "Raise the hands onto a block or chair to lower intensity."
    ],
    "progressions": [
      "Add a single-arm or single-leg lift while maintaining a stable plank.",
      "Increase the hold duration or transition directly into a Leg Pull Front."
    ]
  },
  # ── REFORMER ─────────────────────────────────────────────────────────────
  {
    "id": "rowing_series",
    "name": "Rowing Series",
    "shortDescription": "A family of six seated arm-spring exercises on the Reformer that develop back strength, posture, and shoulder mobility through pulling and pressing patterns.",
    "focus": "Back strength, shoulder mobility, and upright posture.",
    "benefits": "Strengthens the back extensors and posterior shoulder girdle while opening the chest.",
    "category": "Reformer",
    "level": "Intermediate",
    "modifications": [
      "Use lighter spring resistance and reduce the range of arm motion initially.",
      "Keep the spine tall against a wall or footbar for positional feedback."
    ],
    "progressions": [
      "Add a forward hinge and reach at the end of each pulling pattern.",
      "Increase spring resistance as back strength and shoulder mobility improve."
    ]
  },
  {
    "id": "short_box_series",
    "name": "Short Box Series",
    "shortDescription": "A seated box sequence on the Reformer integrating spinal flexion, extension, rotation, and lateral flexion for complete spinal mobility.",
    "focus": "Spinal mobility in all planes and core control.",
    "benefits": "Trains the spine in flexion, extension, rotation, and lateral flexion while seated on an unstable surface.",
    "category": "Reformer",
    "level": "Intermediate",
    "modifications": [
      "Reduce the range in each direction and keep hands lightly touching the box for support.",
      "Perform the round-back and flat-back variations before adding rotation."
    ],
    "progressions": [
      "Add a full side bend or twist with arm reach to deepen the range.",
      "Perform the tree variation to combine hip flexor stretch with spinal articulation."
    ]
  },
  {
    "id": "running_reformer",
    "name": "Running",
    "shortDescription": "Alternating heel raise and lower on the Reformer that mimics a running stride to mobilize the ankles and cool down the legs.",
    "focus": "Ankle mobility and lower-leg circulation.",
    "benefits": "Mobilizes the ankles, stretches the calves, and gently reintegrates the legs after carriage work.",
    "category": "Reformer",
    "level": "Beginner",
    "modifications": [
      "Slow the alternation and focus on controlled heel lowering to ease calf tightness.",
      "Keep the motion small if the Achilles tendons feel tight."
    ],
    "progressions": [
      "Increase the speed to a light jogging rhythm while maintaining pelvis stability.",
      "Add a small hip hinge to intensify the calf stretch at the end of each stride."
    ]
  },
  {
    "id": "semi_circle",
    "name": "Semi-Circle",
    "shortDescription": "A flowing arc movement on the Reformer that combines hip extension, spinal articulation, and shoulder stability in one continuous loop.",
    "focus": "Hip extension, spinal articulation, and shoulder stability.",
    "benefits": "Promotes smooth lumbo-pelvic mobility and hip flexor release through a dynamic arc.",
    "category": "Reformer",
    "level": "Advanced",
    "modifications": [
      "Reduce the range of the arc and keep the hips higher than the knees throughout.",
      "Move slowly through each phase and avoid dropping the hips below alignment."
    ],
    "progressions": [
      "Slow the pace to challenge control through the hanging position.",
      "Focus on precise spinal articulation bone by bone on the descent."
    ]
  },
  {
    "id": "backstroke",
    "name": "Backstroke",
    "shortDescription": "Supine arm-and-leg coordination exercise on the Reformer that mirrors a swimming backstroke pattern to open the chest and challenge core control.",
    "focus": "Chest opening, shoulder mobility, and full-body coordination.",
    "benefits": "Opens the anterior chain, improves shoulder mobility, and develops coordination of simultaneous limb movement.",
    "category": "Reformer",
    "level": "Intermediate",
    "modifications": [
      "Perform the arms or legs separately before combining the movement.",
      "Keep the head on the headrest to reduce cervical strain."
    ],
    "progressions": [
      "Add a pause at full extension before returning to the starting position.",
      "Slow the return phase to maximise control and spring resistance."
    ]
  },
  {
    "id": "pulling_straps",
    "name": "Pulling Straps",
    "shortDescription": "Prone back extension exercise on the Reformer long box in which the arms pull the straps to lift the chest and strengthen the back.",
    "focus": "Back extension strength and posterior shoulder engagement.",
    "benefits": "Strengthens the thoracic extensors and posterior deltoids while opening the chest.",
    "category": "Reformer",
    "level": "Intermediate",
    "modifications": [
      "Keep the lift small and focus on length rather than height.",
      "Use a lighter spring and avoid compressing the lower back at the top."
    ],
    "progressions": [
      "Increase the lift height and hold briefly at the top.",
      "Combine with a T position (arms wide) for added posterior shoulder work."
    ]
  },
  {
    "id": "down_stretch",
    "name": "Down Stretch",
    "shortDescription": "Kneeling plank-to-pike transition on the Reformer that mobilizes the spine and builds shoulder and core stability.",
    "focus": "Spinal extension and core-to-shoulder stability.",
    "benefits": "Builds shoulder girdle stability and a long, controlled spinal extension under load.",
    "category": "Reformer",
    "level": "Intermediate",
    "modifications": [
      "Keep the knees on a pad and limit the range of carriage travel.",
      "Focus on a long spine rather than maximum range."
    ],
    "progressions": [
      "Increase the carriage travel distance as shoulder stability improves.",
      "Transition directly into Up Stretch for a flowing sequence."
    ]
  },
  {
    "id": "up_stretch",
    "name": "Up Stretch",
    "shortDescription": "Pike-to-plank transition on the Reformer that stretches the posterior chain and challenges balanced shoulder and core control.",
    "focus": "Hamstring length and scapular stability.",
    "benefits": "Stretches the hamstrings and calves while building shoulder stability in a dynamic pike.",
    "category": "Reformer",
    "level": "Intermediate",
    "modifications": [
      "Bend the knees slightly to reduce hamstring load.",
      "Limit the carriage travel to maintain a long spine."
    ],
    "progressions": [
      "Deepen the pike and push the heels back further.",
      "Slow the transition from pike to plank to increase eccentric shoulder control."
    ]
  },
  {
    "id": "snake",
    "name": "Snake",
    "shortDescription": "Rotational side-plank and spine-extension exercise on the Reformer that challenges advanced core stability and full-body coordination.",
    "focus": "Lateral core stability and rotational strength.",
    "benefits": "Develops advanced rotational strength along the entire kinetic chain.",
    "category": "Reformer",
    "level": "Advanced",
    "modifications": [
      "Keep the range small and focus on maintaining a square shoulder position.",
      "Practice the entry and exit positions separately before adding the full movement."
    ],
    "progressions": [
      "Increase the carriage travel and hold the side plank briefly at the end range.",
      "Combine Snake and Twist in a flowing sequence for added challenge."
    ]
  },
  {
    "id": "front_splits",
    "name": "Front Splits",
    "shortDescription": "Standing lunge stretch on the Reformer that deeply opens the hip flexors and challenges balance while reinforcing core engagement.",
    "focus": "Hip flexor length and standing balance.",
    "benefits": "Provides a deep hip flexor and quad stretch while building single-leg balance and stability.",
    "category": "Reformer",
    "level": "Advanced",
    "modifications": [
      "Keep the front foot on the platform and limit the lunge depth.",
      "Hold onto the footbar for balance support initially."
    ],
    "progressions": [
      "Increase the lunge depth and allow the carriage to travel further.",
      "Release the footbar and balance freely in the lunge position."
    ]
  },
  {
    "id": "side_splits",
    "name": "Side Splits",
    "shortDescription": "Standing lateral stretch on the Reformer that opens the inner thighs and challenges hip abductor strength and balance.",
    "focus": "Inner thigh length and hip abductor strength.",
    "benefits": "Stretches the adductors and builds lateral hip stability in a weight-bearing position.",
    "category": "Reformer",
    "level": "Advanced",
    "modifications": [
      "Keep the range of movement small and stand close to the footbar for stability.",
      "Use the footbar as a light support until balance improves."
    ],
    "progressions": [
      "Increase the split range and slow the return to challenge adductor eccentric strength.",
      "Add a small torso rotation or arm reach to increase the balance challenge."
    ]
  },
  {
    "id": "overhead_reformer",
    "name": "Overhead",
    "shortDescription": "Supine inversion exercise on the Reformer that lifts the legs overhead while the core controls the carriage, building deep abdominal and back strength.",
    "focus": "Deep core strength and spinal articulation under inversion.",
    "benefits": "Challenges extreme core control and spinal articulation through a full overhead position.",
    "category": "Reformer",
    "level": "Advanced",
    "modifications": [
      "Keep the legs at 90 degrees and only lift the hips slightly.",
      "Avoid if there is any neck or cervical spine sensitivity."
    ],
    "progressions": [
      "Work toward a fully vertical leg position while controlling the carriage.",
      "Slow the lowering phase to increase eccentric core demand."
    ]
  },
  {
    "id": "balance_point",
    "name": "Balance Point",
    "shortDescription": "Advanced seated balance challenge on the Reformer that stabilizes in a V-sit on the moving carriage while engaged with the straps.",
    "focus": "Balance, core stability, and hip flexor control.",
    "benefits": "Develops exceptional balance and core engagement on an unstable, moving surface.",
    "category": "Reformer",
    "level": "Advanced",
    "modifications": [
      "Keep the feet lightly touching the footbar for stability.",
      "Reduce the arm and leg movements until core balance is established."
    ],
    "progressions": [
      "Remove foot contact and balance freely on the carriage.",
      "Add arm circles or leg variations to increase the destabilization challenge."
    ]
  },
  # ── CADILLAC ─────────────────────────────────────────────────────────────
  {
    "id": "tower_cadillac",
    "name": "Tower",
    "shortDescription": "Supine vertical leg press against a spring bar on the Cadillac that builds core and hip strength through a full overhead extension.",
    "focus": "Core strength and hip flexor coordination.",
    "benefits": "Develops core stability and hip control under resistance through an overhead position.",
    "category": "Cadillac",
    "level": "Intermediate",
    "modifications": [
      "Keep the legs slightly bent and avoid pressing past the bar.",
      "Reduce spring tension to allow a comfortable range of motion."
    ],
    "progressions": [
      "Press the legs to a fully vertical position and slow the return.",
      "Add a spinal roll-down at the end for combined articulation."
    ]
  },
  {
    "id": "cat_stretch_cadillac",
    "name": "Cat Stretch on Cadillac",
    "shortDescription": "Kneeling spinal flexion and extension on the Cadillac using the push-through bar to guide deep spinal mobilization.",
    "focus": "Spinal flexion and extension mobility.",
    "benefits": "Mobilizes the full length of the spine in both flexion and extension with spring-assisted guidance.",
    "category": "Cadillac",
    "level": "Beginner",
    "modifications": [
      "Keep the range small and focus on one spinal segment at a time.",
      "Use a lighter spring to reduce the resistance on the bar."
    ],
    "progressions": [
      "Increase the arc of both flexion and extension.",
      "Slow the transition between cat and cow to deepen segmental control."
    ]
  },
  {
    "id": "hanging_cadillac",
    "name": "Hanging",
    "shortDescription": "Standing traction exercise on the Cadillac using the roll-down bar or trapeze for spinal decompression and shoulder mobility.",
    "focus": "Spinal decompression and shoulder girdle mobility.",
    "benefits": "Decompresses the spine and mobilizes the shoulder girdle through supported hanging.",
    "category": "Cadillac",
    "level": "Beginner",
    "modifications": [
      "Keep the feet touching the floor for partial weight support.",
      "Limit the hang duration and avoid if shoulder instability is present."
    ],
    "progressions": [
      "Lift the feet from the floor and hold a free hang.",
      "Add gentle knee lifts or hip circles to increase the traction effect."
    ]
  },
  # ── CHAIR ────────────────────────────────────────────────────────────────
  {
    "id": "going_up_front",
    "name": "Going Up Front",
    "shortDescription": "Single-leg press on the Wunda Chair facing the chair that builds unilateral leg strength, balance, and core control.",
    "focus": "Single-leg strength and balance.",
    "benefits": "Develops unilateral lower-body strength and balance in a functional standing position.",
    "category": "Chair",
    "level": "Intermediate",
    "modifications": [
      "Hold onto the chair handles for support while learning the movement.",
      "Reduce the pedal depth to limit the range of motion."
    ],
    "progressions": [
      "Release the hands and maintain balance without support.",
      "Add a slow, controlled press and lower to increase eccentric demand."
    ]
  },
  {
    "id": "going_up_side",
    "name": "Going Up Side",
    "shortDescription": "Lateral single-leg press on the Wunda Chair that targets hip abductors, adductors, and lateral core stability.",
    "focus": "Lateral hip stability and single-leg strength.",
    "benefits": "Builds lateral hip strength and challenges frontal-plane balance and core stability.",
    "category": "Chair",
    "level": "Intermediate",
    "modifications": [
      "Hold the chair frame and limit the range of the pedal press.",
      "Keep the supporting foot flat to increase the base of support."
    ],
    "progressions": [
      "Release the hand support to increase the balance challenge.",
      "Slow the return phase to increase lateral hip eccentric work."
    ]
  },
  {
    "id": "pumping_chair",
    "name": "Pumping",
    "shortDescription": "Seated or standing rhythmic pedal press on the Wunda Chair that challenges core endurance and limb coordination through repeated spring resistance.",
    "focus": "Core endurance and limb coordination under spring load.",
    "benefits": "Builds rhythmic coordination and core endurance through repetitive resistance work.",
    "category": "Chair",
    "level": "Beginner",
    "modifications": [
      "Use a light spring and focus on maintaining an upright spine.",
      "Perform seated before progressing to standing variations."
    ],
    "progressions": [
      "Increase the spring resistance as coordination and strength improve.",
      "Combine with arm movements to add an upper-body coordination challenge."
    ]
  },
  {
    "id": "achilles_stretch_chair",
    "name": "Achilles Stretch",
    "shortDescription": "Standing heel drop off the Wunda Chair pedal that stretches the calf complex and Achilles tendon under controlled spring tension.",
    "focus": "Calf and Achilles tendon flexibility.",
    "benefits": "Lengthens the gastrocnemius and soleus while building ankle stability under load.",
    "category": "Chair",
    "level": "Beginner",
    "modifications": [
      "Keep the stretch gentle and avoid forcing the heel below the pedal.",
      "Hold the chair frame for balance support."
    ],
    "progressions": [
      "Deepen the heel drop and hold at the end range for longer.",
      "Perform single-leg to increase the stretch intensity."
    ]
  },
  # ── PROPS ────────────────────────────────────────────────────────────────
  {
    "id": "foam_roller_series",
    "name": "Foam Roller Series",
    "shortDescription": "A sequence of spinal, hip, and shoulder mobility exercises performed on a foam roller to improve balance, body awareness, and fascial release.",
    "focus": "Spinal mobility, balance, and soft tissue release.",
    "benefits": "Improves proprioception, releases myofascial tension, and supports spinal alignment.",
    "category": "Props",
    "level": "Beginner",
    "modifications": [
      "Perform exercises next to a wall for balance support.",
      "Start with supine exercises before progressing to seated or standing variations."
    ],
    "progressions": [
      "Remove wall support and perform exercises in free balance.",
      "Add arm or leg movements to increase the stability challenge."
    ]
  },
  {
    "id": "arc_barrel_series",
    "name": "Arc Barrel Series",
    "shortDescription": "A collection of spinal extension, flexion, and side-bend exercises performed over the arc barrel to increase range of motion and back strength.",
    "focus": "Spinal extension and lateral flexion range of motion.",
    "benefits": "Opens the thoracic spine, strengthens the back extensors, and improves lateral flexibility.",
    "category": "Props",
    "level": "Intermediate",
    "modifications": [
      "Reduce the arc amplitude by placing a folded mat under the barrel.",
      "Support the lower back and limit the extension range."
    ],
    "progressions": [
      "Increase the range of extension and side bend as mobility improves.",
      "Add arm reaches and rotation to deepen the spinal work."
    ]
  },
  {
    "id": "spine_corrector_series",
    "name": "Spine Corrector Series",
    "shortDescription": "A suite of exercises on the spine corrector barrel that combines spinal articulation, hip opening, and shoulder mobilization for postural rebalancing.",
    "focus": "Postural rebalancing and spinal articulation.",
    "benefits": "Corrects postural imbalances, opens the chest, and develops segmental spinal control.",
    "category": "Props",
    "level": "Intermediate",
    "modifications": [
      "Keep the range of motion small and avoid compressing the lower back.",
      "Use a cushion under the tailbone for additional support."
    ],
    "progressions": [
      "Add arm circles or leg variations to the foundational exercises.",
      "Combine extension and rotation for more advanced spinal patterning."
    ]
  }
]

# Only add exercises not already present
to_add = [e for e in new_exercises if e['id'] not in existing_ids]
exercises.extend(to_add)

with open('src/assets/data/exercises.json', 'w') as f:
    json.dump(exercises, f, indent=2)

print(f"Added {len(to_add)} new exercises. Total now: {len(exercises)}")

# Validate
required = ['id', 'name', 'shortDescription', 'focus', 'benefits', 'category', 'level', 'modifications', 'progressions']
errors = []
for e in exercises:
    for field in required:
        if not e.get(field):
            errors.append(f"{e['name']} missing: {field}")
ids = [e['id'] for e in exercises]
dupes = [x for x in set(ids) if ids.count(x) > 1]
if dupes:
    errors.append(f"Duplicate IDs: {dupes}")
if errors:
    print("ERRORS:", errors)
else:
    print("All exercises validated — no missing fields, no duplicate IDs.")
