"""
Patch script: adds missing whatToAvoid, alternativeExercise, instructorNote,
teachingCues, modificationsAndAlternatives, referenceDetails, and
instructionsAndDetails fields to every exercise in exercises.json.
Run from repo root: python3 scripts/patch_exercises.py
"""
import json, os, sys

EXERCISES_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'data', 'exercises.json')

PATCHES = {
    # ── MAT ──────────────────────────────────────────────────────────────────
    "the_hundred": {
        "whatToAvoid": "Avoid poking the chin forward, allowing the lower back to arch off the mat, or holding the breath during the arm pumps.",
        "alternativeExercise": "Seated Breathing",
        "instructorNote": "Watch for rib-popping on the inhale and premature shoulder tension. Keep beginners head-down and progress to head-float only once the pelvis is truly stable.",
        "teachingCues": ["Lower back heavy and long.", "Pump from the shoulders, not the wrists.", "Breathe into the back of your ribs."]
    },
    "roll_up": {
        "whatToAvoid": "Avoid yanking the neck, using momentum to swing through the lower back, or letting the feet lift off the mat.",
        "alternativeExercise": "Rolling Like a Ball",
        "instructorNote": "Cue articulation vertebra by vertebra rather than a hinge. For tight hamstrings, bend the knees slightly and track whether the spine is truly segmenting.",
        "teachingCues": ["Peel one vertebra at a time.", "Heavy lower back as you lower down.", "Scoop the belly up and in throughout."]
    },
    "roll_over": {
        "whatToAvoid": "Avoid rolling onto the neck, allowing the legs to drop heavily, or performing without adequate core control first.",
        "alternativeExercise": "Shoulder Bridge",
        "instructorNote": "This is contraindicated for osteoporosis, cervical issues, and pregnancy. Always establish pelvic curl competence first. Ensure the client supports their lower back with hands before opening the legs.",
        "teachingCues": ["Press the arms into the mat for control.", "Keep the legs long and together.", "Roll from the lower back, not the neck."]
    },
    "rolling_like_a_ball": {
        "whatToAvoid": "Avoid rolling onto the neck, using momentum instead of core control, or losing the ball shape through the lower back.",
        "alternativeExercise": "Spine Stretch Forward",
        "instructorNote": "Use this as a spinal massage and proprioceptive reset. Beginners often unroll the shape mid-roll — cue them to hug the knees tight. Contraindicate for osteoporosis and recent spinal surgery.",
        "teachingCues": ["Hold the shape like a ball — tight and round.", "Roll with control, not speed.", "Land on your sit bones, not your tailbone."]
    },
    "spine_stretch_forward": {
        "whatToAvoid": "Avoid collapsing through the thoracic spine, slumping the lower back into flexion, or reaching so far that the pelvis tips forward.",
        "alternativeExercise": "Seated Side Bend",
        "instructorNote": "The goal is spinal length, not hamstring stretch. Cue clients to grow taller before reaching. Sit on a folded blanket if the pelvis tips backward.",
        "teachingCues": ["Sit tall before you reach.", "Pull the navel away from the legs.", "Reach through the fingertips without collapsing the chest."]
    },
    "roll_down": {
        "whatToAvoid": "Avoid collapsing all at once, hyperextending the knees, or letting the chin drop so far it strains the neck.",
        "alternativeExercise": "Spine Mobilisation",
        "instructorNote": "This is a great assessment tool — watch where the curve stops and the hinge begins. For tight hamstrings, allow a slight knee bend. For osteoporosis, modify to a seated spinal roll.",
        "teachingCues": ["Nod your chin first, then peel down.", "Feel each vertebra release.", "Hang heavy and breathe at the bottom."]
    },
    "teaser": {
        "whatToAvoid": "Avoid gripping the hip flexors, losing the C-curve at the bottom, or allowing the lower back to hinge rather than articulate.",
        "alternativeExercise": "Single Leg Stretch",
        "instructorNote": "Build from Half Teaser before full Teaser. The exit is as important as the entry — cue the articulation down. Watch for hip flexor dominance and lack of posterior pelvic tilt support.",
        "teachingCues": ["V-shape from head to toes.", "Scoop the belly as you lower.", "Keep the shoulders away from the ears."]
    },
    "saw": {
        "whatToAvoid": "Avoid collapsing the spine in rotation, letting the opposite hip rise, or reaching so aggressively that control is lost.",
        "alternativeExercise": "Spine Twist",
        "instructorNote": "The arm is a reach, not a bounce. Cue grounding through both sit bones equally. For scoliosis, teach the rotation toward the curve with extra care around the apex.",
        "teachingCues": ["Both sit bones stay heavy.", "Rotate from the waist, not the shoulder.", "Reach your pinky past your little toe."]
    },
    "corkscrew": {
        "whatToAvoid": "Avoid rolling onto the neck, losing circle control through the lower back, or working past comfortable hip range.",
        "alternativeExercise": "One Leg Circle",
        "instructorNote": "Build the circle from the hip socket, not the momentum of the legs. For tight hip flexors, reduce the arc. Contraindicate for osteoporosis, pregnancy, and cervical issues.",
        "teachingCues": ["Circle from the hips, not the lower back.", "Keep the pelvis as still as possible.", "Press the arms into the mat for control."]
    },
    "jackknife": {
        "whatToAvoid": "Avoid rolling too far onto the neck, using leg momentum, or letting the hips drop suddenly on the way down.",
        "alternativeExercise": "Shoulder Bridge",
        "instructorNote": "Contraindicated for osteoporosis, cervical disorders, and anyone who cannot yet control a Shoulder Bridge. The arrival in the overhead position should be silent — no crashing.",
        "teachingCues": ["Drive the heels to the ceiling.", "Keep the neck long, not compressed.", "Lower with control, one vertebra at a time."]
    },
    "neck_pull": {
        "whatToAvoid": "Avoid pulling on the back of the skull, jerking through the mid-back, or letting the elbows swing inward to cheat the movement.",
        "alternativeExercise": "Roll Up",
        "instructorNote": "The hands are behind the head for feedback, not assistance. Encourage the elbows to stay wide and the neck long. Progress from Roll Up before introducing Neck Pull.",
        "teachingCues": ["Elbows wide and back.", "Let the abdominals do the lifting.", "Lengthen the crown of the head away from the tailbone."]
    },
    "spine_twist": {
        "whatToAvoid": "Avoid collapsing the spine as you rotate, allowing the pelvis to rock, or rounding forward as the arms reach back.",
        "alternativeExercise": "Saw",
        "instructorNote": "Cue two distinct breath-pulses on the exhale to deepen the rotation. Watch for clients who hinge at the hip rather than rotate at the thoracic spine.",
        "teachingCues": ["Grow taller before you twist.", "Both hips stay forward.", "Pulse the breath to wring out the spine."]
    },
    "side_bend": {
        "whatToAvoid": "Avoid sinking into the supporting shoulder, letting the hips drop below shoulder height, or collapsing through the waist.",
        "alternativeExercise": "Seated Side Bend",
        "instructorNote": "The hip lift is the key — cue the client to reach up before reaching sideways. For wrist sensitivity, offer forearm side plank as regression.",
        "teachingCues": ["Press the floor away with your supporting hand.", "Reach the top arm over your ear.", "Stack the hips and don't let the bottom dip."]
    },
    "boomerang": {
        "whatToAvoid": "Avoid rolling onto the neck, using momentum to flip the legs, or losing the stretch at the top.",
        "alternativeExercise": "Teaser",
        "instructorNote": "This is an advanced flowing sequence — ensure the client has proficient Roll Over and Teaser before combining. The arm circle at the end is a shoulder mobility test.",
        "teachingCues": ["The roll is controlled, not a throw.", "Cross the legs with precision.", "Circle the arms like you mean it."]
    },
    "swan": {
        "whatToAvoid": "Avoid pushing through the lower back only, jamming the neck into extension, or using the glutes to push instead of the thoracic extensors.",
        "alternativeExercise": "Swan Prep",
        "instructorNote": "The movement is thoracic-led. Cue length first, then lift. For low back pain, keep to Swan Prep. For wrist sensitivity, use fists or forearms.",
        "teachingCues": ["Lead with the crown of the head.", "Anchor the pubis lightly into the mat.", "Open the chest wide before lifting higher."]
    },
    "swan_prep": {
        "whatToAvoid": "Avoid compressing the lower back by pushing only with the arms, letting the shoulders shrug up to the ears, or losing the pelvic connection.",
        "alternativeExercise": "Cat Stretch on Cadillac",
        "instructorNote": "A crucial building block before Swan. Focus on thoracic extension and keep the elbows soft. Watch for cervical hyperextension in clients with neck issues.",
        "teachingCues": ["Lengthen through the crown before lifting.", "Draw the shoulders down and back.", "Breathe into the front of the chest."]
    },
    "swan_dive": {
        "whatToAvoid": "Avoid dive-bombing by dropping the chest suddenly, losing the rocker rhythm, or arching only from the lumbar spine.",
        "alternativeExercise": "Swan",
        "instructorNote": "Build from a confident static Swan first. The rocking is driven by the abdominals controlling the eccentric descent, not gravity. Contraindicate for low back pain and osteoporosis.",
        "teachingCues": ["Use the abdominals to catch the fall.", "Arc through the whole spine, not just the lower back.", "Keep the rhythm even."]
    },
    "swimming": {
        "whatToAvoid": "Avoid lifting the chest too high and compressing the lower back, holding the breath, or splashing the limbs instead of lengthening them.",
        "alternativeExercise": "Single Leg Kick",
        "instructorNote": "The head is a continuation of the spine — cue the gaze forward and slightly down. Progressives can add the breath in sets of 5. For tight hip flexors, a small range is fine.",
        "teachingCues": ["Reach longer with every stroke.", "Keep the lower back from arching further.", "Breathe in 5, out 5."]
    },
    "shoulder_bridge": {
        "whatToAvoid": "Avoid hiking one hip higher than the other, over-extending the lumbar spine, or letting the feet splay outward.",
        "alternativeExercise": "Pelvic Curl",
        "instructorNote": "Build from Pelvic Curl first. The pelvis should be level and the glutes active without gripping. For knee issues, ensure the knees don't drift inward.",
        "teachingCues": ["Stack the spine like a bridge, not a hinge.", "Drive through the heels, not the toes.", "Level hips at the top."]
    },
    "leg_pull_front": {
        "whatToAvoid": "Avoid sagging the hips, over-arching the lower back, or losing the plank line when lifting a leg.",
        "alternativeExercise": "Plank",
        "instructorNote": "Establish a clean Plank before adding the leg lift. Watch for hip drop and lower back collapse when the leg floats. Wrist pain: offer forearm plank.",
        "teachingCues": ["Hips level with shoulders — one long line.", "Kick from the hip, not the back.", "Keep the weight spread across the whole hand."]
    },
    "leg_pull_back": {
        "whatToAvoid": "Avoid dumping into the wrists, sagging the hips in the reverse plank, or using the momentum of the kick.",
        "alternativeExercise": "Shoulder Bridge",
        "instructorNote": "The reverse plank demands wrist extension tolerance. For sensitive wrists, use fingertips forward or forearm variation. Cue the hips up before the kick.",
        "teachingCues": ["Lift the hips high before you kick.", "Keep the neck long, not jutting.", "Reach through the kicking heel."]
    },
    "side_kick": {
        "whatToAvoid": "Avoid rocking the pelvis backward on the front kick or collapsing the waist into the mat.",
        "alternativeExercise": "Side Kick Series",
        "instructorNote": "Stability of the underneath side is the real challenge. Cue the obliques on the supporting side to keep the waist lifted. Watch for internal hip rotation on the kick.",
        "teachingCues": ["Keep the spine stack like a wall behind you.", "Kick from the hip socket, not the lower back.", "Waist long and lifted throughout."]
    },
    "side_kick_series": {
        "whatToAvoid": "Avoid allowing the pelvis to shift with each new movement direction or collapsing the supporting side.",
        "alternativeExercise": "Side Kick",
        "instructorNote": "Each series variation tests a different hip plane. Teach each separately before flowing. Cue the client to breathe continuously and watch for fatigue-driven pelvic rolling.",
        "teachingCues": ["Pelvis stays still between every kick.", "Reach long from hip to heel.", "Breathe through each direction."]
    },
    "seal": {
        "whatToAvoid": "Avoid rolling onto the neck, clapping so hard the knees knock together, or collapsing the C-curve during the roll.",
        "alternativeExercise": "Rolling Like a Ball",
        "instructorNote": "The inner-thigh adductor squeeze adds another layer to the rolling massage. Contraindicate for osteoporosis and recent spinal surgery.",
        "teachingCues": ["Clap the feet, not the floor.", "Keep the ball shape the whole way.", "Roll with the exhale."]
    },
    "crab": {
        "whatToAvoid": "Avoid rolling onto the neck, crossing the feet asymmetrically, or losing the rounded shape at the top.",
        "alternativeExercise": "Rolling Like a Ball",
        "instructorNote": "An advanced rolling exercise — confirm the client's spinal mobility and tolerance before progressing from Seal. The foot switch at the top is the technical challenge.",
        "teachingCues": ["Stay round and tight throughout.", "Switch the cross at the top with control.", "Never land on the neck."]
    },
    "rocking": {
        "whatToAvoid": "Avoid arching only from the lower back, gripping the ankles with the knees too wide, or rocking with momentum instead of control.",
        "alternativeExercise": "Swan Prep",
        "instructorNote": "Both thighs must clear the mat simultaneously for a clean rocking pattern. Contraindicate for knee pain, disc issues, and osteoporosis. Build from Swan first.",
        "teachingCues": ["Lift both thighs together.", "Rock from the sternum, not the hips.", "Keep the knee width even."]
    },
    "control_balance": {
        "whatToAvoid": "Avoid rolling onto the neck, using momentum to scissor the legs, or releasing the pike position without control.",
        "alternativeExercise": "Shoulder Bridge",
        "instructorNote": "One of the most advanced mat exercises. Ensure Roll Over and Jackknife are clean before introducing. Contraindicate broadly — osteoporosis, cervical issues, pregnancy, hypertension.",
        "teachingCues": ["Find your vertical line first.", "Scissor from the hip, not the back.", "Lower with absolute control."]
    },
    "scissors": {
        "whatToAvoid": "Avoid over-pulling the top leg toward the face, allowing the lower back to round away from the mat, or swinging legs without stability.",
        "alternativeExercise": "Single Leg Stretch",
        "instructorNote": "The pelvis must stay neutral and still. Cue the client to feel the back of the skull heavy on the mat and not over-flex the neck. Contraindicate for disc herniation and sciatica.",
        "teachingCues": ["Pelvis heavy and stable.", "Reach through both heels.", "Change with precision, not speed."]
    },
    "bicycle": {
        "whatToAvoid": "Avoid pedalling from the knees only, losing pelvic stability, or collapsing the lower back into the mat.",
        "alternativeExercise": "Single Leg Stretch",
        "instructorNote": "The hip extension phase of the bicycle challenges hip flexor length. Cue the transition slowly before building speed. Contraindicate for disc herniation and sciatica.",
        "teachingCues": ["Full circle from hip to knee to ankle.", "Keep the lower back grounded.", "Move with intention, not momentum."]
    },
    "one_leg_circle": {
        "whatToAvoid": "Avoid letting the circle tip the pelvis or allowing the working leg to drop so low the lower back lifts.",
        "alternativeExercise": "Knee Stretch",
        "instructorNote": "The circle is small until stability is established. Cue the opposite inner thigh to stay active. Watch for external hip rotation loss at the bottom of the circle.",
        "teachingCues": ["Both hip bones stay equal.", "Cross the midline without rolling.", "Anchor through the standing leg."]
    },
    "single_leg_stretch": {
        "whatToAvoid": "Avoid pulling the knee into the chest with the arms, losing the lower back connection, or letting the extended leg drop to the mat.",
        "alternativeExercise": "Pelvic Curl",
        "instructorNote": "A foundational abdominal exercise. Hands on shin guide, not pull. Cue the rib-to-hip connection on every leg switch. Keep head down for beginners.",
        "teachingCues": ["Press the shin into the hands, hands into the shin.", "Keep the lower back imprinted.", "Switch legs with a breath."]
    },
    "double_leg_stretch": {
        "whatToAvoid": "Avoid arching the back as the arms and legs reach out, dropping the head down, or losing the abdominal connection on the open phase.",
        "alternativeExercise": "Single Leg Stretch",
        "instructorNote": "The open phase is the challenge — cue the lower back to stay connected throughout. For beginners, modify by keeping the knees bent throughout the reach.",
        "teachingCues": ["Scoop deeper as you reach out.", "Circle the arms like you're hugging a tree.", "Breathe in on the reach, out as you pull in."]
    },
    "open_leg_rocker": {
        "whatToAvoid": "Avoid rolling onto the neck, losing the hold on the ankles, or collapsing the C-curve at the top or bottom.",
        "alternativeExercise": "Rolling Like a Ball",
        "instructorNote": "Hamstring flexibility gates this exercise significantly. Offer bent-knee hands-behind-thigh variation first. Contraindicate for osteoporosis and recent spinal surgery.",
        "teachingCues": ["Hold the shape through the roll.", "V wide enough to balance without strain.", "Land back on the sit bones."]
    },
    "hip_circles": {
        "whatToAvoid": "Avoid tipping the pelvis off the sit bones on the large circles, using shoulder momentum, or collapsing the waist.",
        "alternativeExercise": "Teaser",
        "instructorNote": "The circle should come from the hip socket, not the whole trunk. Build from a stable Teaser V-sit. Watch for rib flare at the back of the circle.",
        "teachingCues": ["Keep the spine long and still.", "Drive the circle from the hip socket.", "Shoulders wide and even."]
    },
    "hip_twist": {
        "whatToAvoid": "Avoid letting the torso rotate with the legs or allowing the lower back to compress on the downswing.",
        "alternativeExercise": "Hip Circles",
        "instructorNote": "More demanding than Hip Circles — the legs move in opposition to a stable upper body. Ensure the client has clean Hip Circles first.",
        "teachingCues": ["Upper body completely still.", "Move the legs like a pendulum.", "Find the opposition."]
    },
    "one_leg_kick": {
        "whatToAvoid": "Avoid pressing into the lower back on the kick, rocking the pelvis side to side, or sinking into the elbows.",
        "alternativeExercise": "Swan Prep",
        "instructorNote": "Elbows should be directly under the shoulders and the chest open. Watch for lumbar compression — if the client's back arches too much, lower the prop height.",
        "teachingCues": ["Chest open, spine long.", "Kick from the knee, not the hip.", "Exhale on both kicks."]
    },
    "double_leg_kick": {
        "whatToAvoid": "Avoid rolling the head to the same side every set, lifting the chest with the arms rather than the back extensors, or kicking asymmetrically.",
        "alternativeExercise": "Single Leg Kick",
        "instructorNote": "The extension phase should feel like a reward after the hamstring work. Alternate the head turn equally. Watch for shoulder compression when the hands are behind the back.",
        "teachingCues": ["Heels toward the glutes on the kick.", "Reach the spine long in the extension.", "Alternate the head turn evenly."]
    },
    "knee_stretch": {
        "whatToAvoid": "Avoid rocking back on the knees, holding the breath during the push, or collapsing the lower back into extension.",
        "alternativeExercise": "Pelvic Curl",
        "instructorNote": "This is both a hip flexor stretch and a core challenge. The neutral spine version tests stability; the rounded version is a spine mobilizer. Distinguish clearly for the client.",
        "teachingCues": ["Hips over knees.", "Find a neutral or round spine deliberately.", "Push the floor away on each rep."]
    },
    "side_kick_kneeling": {
        "whatToAvoid": "Avoid sinking into the supporting hip, allowing the pelvis to tilt with the kick, or losing the lateral waist line.",
        "alternativeExercise": "Side Kick",
        "instructorNote": "Wrist sensitivity is common here — offer a fist or forearm support. The kneeling position increases demand on the supporting lateral chain. Progress from Side Kick.",
        "teachingCues": ["Lift the waist off the mat.", "Kick from the hip, not the lower back.", "Supporting hand long and strong."]
    },
    "pelvic_curl": {
        "whatToAvoid": "Avoid shooting through the hips in one block, compensating by gripping the glutes excessively, or allowing the knees to drift apart.",
        "alternativeExercise": "Spine Mobilisation",
        "instructorNote": "A foundational exercise for assessing spinal articulation. Watch for the client who rises as a block from T12 — this indicates thoracic rigidity. Cue sequentially.",
        "teachingCues": ["Peel up one bone at a time.", "Knees track over the toes.", "Find the space between each vertebra."]
    },
    "breaststroke": {
        "whatToAvoid": "Avoid crunching the neck on the lift, losing the spinal length before the arms circle, or pulling only with the shoulders.",
        "alternativeExercise": "Swan Prep",
        "instructorNote": "An advanced back extension. Ensure adequate thoracic extension from Swan Prep first. The breath timing — inhale up, exhale circle down — is key to rhythm.",
        "teachingCues": ["Lead with the sternum, not the chin.", "Circle the arms wide before pressing down.", "Exhale as the arms sweep back."]
    },
    "push_up": {
        "whatToAvoid": "Avoid sagging at the hips, flaring the elbows wide, or collapsing the neck forward on the way down.",
        "alternativeExercise": "Plank",
        "instructorNote": "In Pilates, the push-up begins with a roll-down standing and ends with a return. Elbows stay close to the body. For wrist issues, offer a chair push-up or knuckle push-up.",
        "teachingCues": ["One long line from head to heel.", "Elbows graze the sides.", "Lower with the inhale, push with the exhale."]
    },
    "single_straight_leg_stretch": {
        "whatToAvoid": "Avoid pulling the leg toward the face with the hands, allowing the lower back to round away from the mat, or losing the abdominal connection.",
        "alternativeExercise": "Single Leg Stretch",
        "instructorNote": "The straight-leg version demands more hamstring flexibility. Cue the extended leg long and low to challenge the lower abdominals. Keep head down for any cervical sensitivity.",
        "teachingCues": ["Reach both legs away from centre.", "Switch with precision and a breath.", "Keep the navel drawn in."]
    },
    "double_straight_leg_stretch": {
        "whatToAvoid": "Avoid lowering the legs past the point where the lower back lifts from the mat, holding the breath, or over-pulling on the back of the skull.",
        "alternativeExercise": "Double Leg Stretch",
        "instructorNote": "The most demanding of the abdominal series for the lower abdominals. Keep the descent angle safe — even 60 degrees is fine for beginners. Contraindicate for low back pain and disc conditions.",
        "teachingCues": ["Lower only as far as the back stays down.", "Press the hands lightly into the head.", "Exhale to lift, inhale to lower."]
    },
    "criss_cross": {
        "whatToAvoid": "Avoid pulling the neck forward with the hands, rotating only the elbow rather than the thorax, or dropping the extended leg too low.",
        "alternativeExercise": "Spine Twist",
        "instructorNote": "True rotation comes from the thoracic spine, not the elbow swing. Cue the client to think 'shoulder to opposite knee'. Watch for chin jutting and breath-holding.",
        "teachingCues": ["Shoulder to opposite knee, not elbow.", "Keep both hips grounded.", "Breathe with every twist."]
    },
    "plank": {
        "whatToAvoid": "Avoid letting the hips sag, hiking the hips too high, or allowing the head to hang between the shoulders.",
        "alternativeExercise": "Pelvic Curl",
        "instructorNote": "A prerequisite for any loaded push-up or leg pull variation. Ensure the shoulders are stacked over the wrists and the core is active before adding movement. For wrist issues, use forearm plank.",
        "teachingCues": ["One long diagonal from head to heel.", "Spread the floor with your hands.", "Breathe without letting the hips move."]
    },

    # ── WARM-UP / COOL DOWN ──────────────────────────────────────────────────
    "shoulder_rolls": {
        "whatToAvoid": "Avoid crunching the neck on the up-phase, using excessive speed, or holding the breath.",
        "alternativeExercise": "Arm Springs",
        "instructorNote": "Use as an entry-point assessment for scapular mobility. Slow, bilateral rolls reveal asymmetry. Cue the breath on the down-phase to encourage parasympathetic response.",
        "teachingCues": ["Roll up and back, not just back.", "Let the shoulder blades glide on the ribs.", "Exhale as the shoulders melt down."]
    },
    "spine_mobilization": {
        "whatToAvoid": "Avoid hinging from one section of the spine, forcing the movement, or holding the breath.",
        "alternativeExercise": "Pelvic Curl",
        "instructorNote": "Use as an opening warm-up and a closing cool-down. Segmental mobility reveals restrictions — note where movement stops and educate the client on finding that area.",
        "teachingCues": ["Find each spinal level in sequence.", "Let gravity do the work at the bottom.", "Breathe into the tightest part."]
    },
    "seated_side_bend": {
        "whatToAvoid": "Avoid rotating the torso as you bend, collapsing the reaching side's ribs, or sitting asymmetrically.",
        "alternativeExercise": "Mermaid",
        "instructorNote": "Excellent for assessing lateral thoracic mobility. Watch for one side having significantly more range — address this with extra reps on the tight side. Sit on a block if the pelvis tips.",
        "teachingCues": ["Both sit bones stay grounded.", "Lengthen the side you're bending away from.", "Breathe into the opening ribs."]
    },

    # ── REFORMER ─────────────────────────────────────────────────────────────
    "footwork": {
        "whatToAvoid": "Avoid pressing through the heels unevenly, allowing the knees to cave inward, or letting the carriage bang at the top.",
        "alternativeExercise": "Pelvic Curl",
        "instructorNote": "Footwork is the foundation of Reformer work and an assessment of lower limb alignment. Check that the client's feet are parallel or externally rotated consistently. Adjust spring weight to match ability.",
        "teachingCues": ["Knees track over the second toe.", "Press the carriage out with even power through both legs.", "Keep the lower back long on the carriage."],
        "apparatusSettings": "Spring weight: 3–4 medium springs for beginners, reduce to 2 for hypermobility. Headrest: up for most clients; flat for osteoporosis. Footbar: high for parallel, second position for turn-out."
    },
    "elephant": {
        "whatToAvoid": "Avoid dropping into the lower back, pushing the carriage too far out, or allowing the heels to sink below the footbar.",
        "alternativeExercise": "Footwork",
        "instructorNote": "A standing spinal stretch and hamstring mobilizer. The movement originates from the hips folding, not the back rounding. Cue the sit bones reaching back and up.",
        "teachingCues": ["Fold from the hip crease, not the waist.", "Heels pressing into the footbar.", "Carriage moves from the abdominals, not the legs."],
        "apparatusSettings": "1–2 light springs. Footbar: highest position. Feet parallel on the footbar edge."
    },
    "short_spine_massage": {
        "whatToAvoid": "Avoid rolling onto the neck, allowing the lower back to thud down, or letting the legs fall wide during the overhead phase.",
        "alternativeExercise": "Shoulder Bridge",
        "instructorNote": "One of the most therapeutic Reformer exercises for spinal articulation and traction. The inversion is contraindicated for osteoporosis, pregnancy, and hypertension. Cue the peel-down to be slow and sequential.",
        "teachingCues": ["Peel the spine up and over, not all at once.", "Inner thighs light on the straps.", "Articulate down one vertebra at a time."],
        "apparatusSettings": "1 light spring. Straps on feet. Headrest down. Footbar down."
    },
    "knee_stretch_series": {
        "whatToAvoid": "Avoid rocking the hips during the push, arching the lower back, or collapsing the shoulders.",
        "alternativeExercise": "Knee Stretch",
        "instructorNote": "Three variations: round back, flat back, and down stretch alignment. Teach each separately. The round back version is particularly useful for low back mobility.",
        "teachingCues": ["Hips stay over knees.", "Carriage moves from the core, not the knees.", "Keep shoulders stacked over wrists."],
        "apparatusSettings": "2–3 medium springs. Footbar: highest position. Kneel with shins on carriage."
    },
    "long_box_series": {
        "whatToAvoid": "Avoid over-arching the lower back on the pulling phase, letting the box slide, or using arm momentum instead of back muscles.",
        "alternativeExercise": "Breaststroke",
        "instructorNote": "Includes pulling straps and T-shape variations. Build thoracic extensor strength gradually. Contraindicate for active rotator cuff injury at high resistance.",
        "teachingCues": ["Lead with the sternum, not the chin.", "Draw the shoulder blades toward the waist.", "Breathe out as you lift and open."],
        "apparatusSettings": "1–2 light springs. Long box positioned on carriage. Straps draped over footbar."
    },
    "coordination": {
        "whatToAvoid": "Avoid losing the lower back connection when the legs extend, holding the breath during the sequence, or rushing through the steps.",
        "alternativeExercise": "Single Leg Stretch",
        "instructorNote": "A sequenced arm and leg coordination exercise. Teach the arm-only version first, then add legs. Watch for the lower back popping off the carriage on leg extension.",
        "teachingCues": ["Press the lower back into the carriage.", "Open and close the legs with the exhale.", "Sequence: reach, open, close, return."],
        "apparatusSettings": "1–2 medium springs. Headrest up. Straps in hands, legs in tabletop."
    },
    "tendon_stretch": {
        "whatToAvoid": "Avoid sinking into the wrists, letting the hips sink below the footbar level, or bouncing the movement.",
        "alternativeExercise": "Elephant",
        "instructorNote": "An advanced balance and wrist-loading exercise. Contraindicate for any wrist pathology. Ensure the client can hold a clean Elephant before progressing.",
        "teachingCues": ["Press the floor away with the whole hand.", "Keep the hips level.", "Move from the abdominals."],
        "apparatusSettings": "1 light spring. Hands on footbar, feet on headrest end of carriage."
    },
    "long_spine_massage": {
        "whatToAvoid": "Avoid rolling onto the neck, allowing the hips to drop or tip asymmetrically, or using leg momentum in the overhead position.",
        "alternativeExercise": "Short Spine Massage",
        "instructorNote": "A deeper spinal decompression than Short Spine. The legs stay together throughout. Contraindicated broadly — introduce only after Short Spine is confident.",
        "teachingCues": ["Lengthen through the heels.", "Peel down slowly and sequentially.", "Keep the inner thighs active."],
        "apparatusSettings": "1 light spring. Straps on feet. Headrest flat. Footbar down."
    },
    "stomach_massage_round_back": {
        "whatToAvoid": "Avoid collapsing the spine into passive flexion, gripping the footbar, or pushing through only one leg.",
        "alternativeExercise": "Knee Stretch Series",
        "instructorNote": "The round back sits at the front of the carriage with the spine curved. Cue the abdominals to support the curve actively — this is not slumping.",
        "teachingCues": ["C-curve is active, not passive.", "Push through both feet equally.", "Keep the hands light on the footbar."],
        "apparatusSettings": "2–3 springs. Seat at front edge of carriage. Footbar at highest setting."
    },
    "stomach_massage_flat_back": {
        "whatToAvoid": "Avoid over-arching the lower back in flat back, twisting the torso on the arms-up variation, or losing the sit bone grounding.",
        "alternativeExercise": "Stomach Massage Round Back",
        "instructorNote": "Progress from round back. In the flat back, the spine is in a proud extension — watch for lordosis that collapses. The arms-up variation adds shoulder mobility challenge.",
        "teachingCues": ["Proud chest, long spine.", "Sit bones grounded throughout.", "Arms frame the ears without arching."],
        "apparatusSettings": "2–3 springs. Seat at front edge of carriage. Footbar at highest setting."
    },
    "rowing_series": {
        "whatToAvoid": "Avoid hunching the spine on the forward reach, collapsing the chest during the lift, or using arm momentum rather than back strength.",
        "alternativeExercise": "Band Arm Series",
        "instructorNote": "Six variations. Teach From the Sternum first before adding the complex arm sequences. The series builds shoulder articulation, thoracic extension, and balance.",
        "teachingCues": ["Press down before lifting out.", "Reach from the shoulder blades, not the elbows.", "Return to centre with full control."],
        "apparatusSettings": "1 light spring. Straps in hands. Seated facing back of Reformer."
    },
    "short_box_series": {
        "whatToAvoid": "Avoid hanging in the hip flexors on the forward lean, twisting only at the shoulder for rotation, or gripping the box edges with the feet.",
        "alternativeExercise": "Teaser",
        "instructorNote": "Five variations including round, flat, side-to-side, twist, and tree. Teach the round back first. The strap provides foot anchor — check tension before each set.",
        "teachingCues": ["Grow tall before you lean.", "Rotate from the waist, not just the shoulders.", "Keep the strap taut through the movement."],
        "apparatusSettings": "No springs or 1 light spring. Short box on carriage. Strap securing feet."
    },
    "running_reformer": {
        "whatToAvoid": "Avoid fully locking the knee at the top, letting the hips shift side to side, or rolling too far through the arch.",
        "alternativeExercise": "Footwork",
        "instructorNote": "A dynamic single-leg heel press that mimics gait. Excellent for lower limb proprioception and Achilles loading. Start slowly to assess Achilles and plantar tolerance.",
        "teachingCues": ["Press through the heel, not the toes.", "Hips stay level and still.", "Feel the whole foot articulate."],
        "apparatusSettings": "2–3 springs. Ball of foot on footbar. Alternate pressing in a running rhythm."
    },
    "semi_circle": {
        "whatToAvoid": "Avoid collapsing the pelvis at the bottom of the arc, moving asymmetrically, or placing too much weight on the neck.",
        "alternativeExercise": "Short Spine Massage",
        "instructorNote": "The pelvis traces a complete arc — a unique spinal mobilizer under load. Build from Short Spine. Contraindicated for osteoporosis and unstable lumbar conditions.",
        "teachingCues": ["Draw the arc slowly with the pelvis.", "Keep the knees hip-width throughout.", "Even weight through both legs."],
        "apparatusSettings": "2 medium springs. Heels on footbar. Pelvis aligned with the edge of the carriage."
    },
    "backstroke": {
        "whatToAvoid": "Avoid snapping the elbows at the top, losing the lumbar connection during the reach, or using arm momentum.",
        "alternativeExercise": "Band Arm Series",
        "instructorNote": "A supine arm-and-leg coordination exercise with a swimming backstroke arm pattern. Teach the arm pattern first before adding legs. Contraindicate for shoulder pathology at high tension.",
        "teachingCues": ["Press the lower back into the carriage.", "Circle the arms wide and long.", "Reach the legs long before returning."],
        "apparatusSettings": "1–2 light springs. Straps in hands. Legs long on carriage."
    },
    "pulling_straps": {
        "whatToAvoid": "Avoid cranking the neck into extension, leading with the elbows rather than the shoulder blades, or letting the legs float up.",
        "alternativeExercise": "Long Box Series",
        "instructorNote": "A prone back extension with arm resistance. Contraindicate for active rotator cuff issues at high tension. Progress gradually as thoracic extensor strength builds.",
        "teachingCues": ["Draw the shoulder blades toward the waist.", "Lead with the sternum.", "Legs long and heavy on the box."],
        "apparatusSettings": "1 light spring. Long box on carriage. Straps in T-position overhead."
    },
    "down_stretch": {
        "whatToAvoid": "Avoid collapsing into the lower back on the open phase, locking the elbows, or letting the hips sink.",
        "alternativeExercise": "Knee Stretch Series",
        "instructorNote": "A beautifully challenging spinal extension and shoulder stability exercise. The arc between hip extension and thoracic lift is the goal. Contraindicate for low back pain.",
        "teachingCues": ["Press the hips forward and up.", "Open the chest as the carriage reaches out.", "Keep the elbows soft."],
        "apparatusSettings": "2–3 springs. Hands on footbar, toes tucked on headrest end. Begin in an arched plank position."
    },
    "up_stretch": {
        "whatToAvoid": "Avoid rounding the spine on the push-out phase, sinking into the shoulders, or letting the hips rise above shoulder height.",
        "alternativeExercise": "Elephant",
        "instructorNote": "A flowing sequence between a pike and an arch. Build from Elephant before introducing the up-stretch arc. The transition requires shoulder stability and spinal control.",
        "teachingCues": ["Pike deeply before arching.", "Keep the shoulders strong and broad.", "Move through the hips, not the lower back."],
        "apparatusSettings": "2 springs. Hands on footbar, feet on carriage (front end). Begin in a pike."
    },
    "snake": {
        "whatToAvoid": "Avoid collapsing the lateral line, rotating the pelvis, or losing shoulder stability on the open phase.",
        "alternativeExercise": "Side Bend",
        "instructorNote": "One of the most advanced Reformer exercises. Requires deep lateral stability and thoracic rotation. Progress from a confident Side Plank. Contraindicate broadly.",
        "teachingCues": ["Reach through the top foot.", "Keep the hips level.", "Rotate the spine, not just the arm."],
        "apparatusSettings": "2 medium springs. One hand on footbar, feet stacked on carriage. Side-facing."
    },
    "front_splits": {
        "whatToAvoid": "Avoid losing the hip square alignment, collapsing the front knee inward, or using the back leg to push rather than the front hip flexor.",
        "alternativeExercise": "Leg Springs",
        "instructorNote": "A standing lunge stretch and hip flexor mobilizer. The movement is small — it is a hip flexor release, not a carriage workout. Check the client's footbar height for comfortable hip alignment.",
        "teachingCues": ["Square the hips before pushing.", "Move from the hip crease, not the knee.", "Keep the spine long throughout."],
        "apparatusSettings": "1–2 light springs. Back foot on footbar, front foot on shoulder rest. Standing lunge position."
    },
    "side_splits": {
        "whatToAvoid": "Avoid uneven weight distribution, holding the breath, or opening the legs so wide control is lost.",
        "alternativeExercise": "Side Kick Series",
        "instructorNote": "A standing adductor stretch and lateral hip challenge. For beginners, keep the range small and use the footbar for balance. Contraindicate for hip issues where wide abduction is restricted.",
        "teachingCues": ["Hips level as the legs open.", "Resist the close as much as the open.", "Spine long throughout."],
        "apparatusSettings": "1 light spring. One foot on platform, one foot on carriage. Standing sideways."
    },
    "overhead_reformer": {
        "whatToAvoid": "Avoid rolling onto the neck, losing control of the carriage during the inversion, or letting the legs drop unevenly.",
        "alternativeExercise": "Short Spine Massage",
        "instructorNote": "An advanced overhead inversion. Contraindicate for osteoporosis, hypertension, pregnancy, and cervical issues. The carriage control during the inversion is the key demand.",
        "teachingCues": ["Lower back presses into the carriage.", "Legs together and long overhead.", "Control the carriage through the whole arc."],
        "apparatusSettings": "2 medium springs. Straps on feet, supine. Headrest flat."
    },
    "balance_point": {
        "whatToAvoid": "Avoid gripping the footbar as a crutch, holding the breath during the balance, or allowing the spine to collapse.",
        "alternativeExercise": "Teaser",
        "instructorNote": "The moving carriage makes balance uniquely challenging. Build from a static V-sit balance on the mat first. The key is using the hip flexors actively rather than passively hanging in the hip.",
        "teachingCues": ["Press the sit bones into the carriage.", "Find the V from hip to toe.", "Breathe without letting the torso rock."],
        "apparatusSettings": "1 light spring. Seated in V-sit near carriage edge. Straps optional."
    },

    # ── CADILLAC ─────────────────────────────────────────────────────────────
    "push_through": {
        "whatToAvoid": "Avoid cranking the bar through a range the spine can't articulate into, letting the arms do all the work, or dropping the bar suddenly.",
        "alternativeExercise": "Roll Down",
        "instructorNote": "The spring-loaded bar provides feedback on each vertebra. This is one of the most refined spinal articulation tools in Pilates. Adjust spring tension carefully for each client.",
        "teachingCues": ["Feel each vertebra press into the bar.", "Breathe into the restriction.", "Control the bar through the whole arc."],
        "apparatusSettings": "Bottom-loaded spring (moderate). Push-through bar above head height. Supine or seated depending on variation."
    },
    "roll_down_bar": {
        "whatToAvoid": "Avoid gripping the bar too hard, letting the spine hinge rather than articulate, or rushing the roll down.",
        "alternativeExercise": "Roll Down",
        "instructorNote": "The bar provides traction and proprioceptive feedback during the roll. Especially useful for teaching the thoracic region to release. Lighter spring = more support on the way down.",
        "teachingCues": ["Let the bar guide the spine forward.", "Peel one vertebra at a time.", "Shoulders stay wide on the bar."],
        "apparatusSettings": "Top-loaded light spring. Bar at arm height when standing. Standing or seated depending on variation."
    },
    "arm_springs": {
        "whatToAvoid": "Avoid shrugging the shoulders on the press, hyperextending the elbows at the end range, or rotating the trunk as the arms move.",
        "alternativeExercise": "Band Arm Series",
        "instructorNote": "Multiple positions available: supine, seated, kneeling, standing. Start supine to establish scapular connection before progressing to upright. Excellent for rotator cuff activation.",
        "teachingCues": ["Keep the shoulder blades moving on the ribs.", "Elbows soft — never locked.", "Breathe with each arm cycle."],
        "apparatusSettings": "Light to medium arm springs. Height varies by variation. Carabiners at shoulder height for most patterns."
    },
    "leg_springs": {
        "whatToAvoid": "Avoid letting the legs drift apart without core control, over-extending the knee at the end of each rep, or losing the lower back connection.",
        "alternativeExercise": "Footwork",
        "instructorNote": "Supine leg spring work targets hip flexors, abductors, and extensors in isolation. Especially useful for post-surgical rehab. Multiple patterns available — teach each separately.",
        "teachingCues": ["Press from the hip, not the knee.", "Inner thighs active on every pattern.", "Lower back stays long and connected."],
        "apparatusSettings": "Light leg springs. Straps on feet. Supine on Cadillac table. Footbar removed."
    },
    "tower_cadillac": {
        "whatToAvoid": "Avoid pressing the bar past a comfortable overhead range, arching the lower back off the table, or losing the pelvis on the lowering phase.",
        "alternativeExercise": "Shoulder Bridge",
        "instructorNote": "The Tower is a sophisticated core and hip flexor exercise. The spring offers assistance on the way up and resistance on the way down. Adjust the bar height for the client's hip and shoulder mobility.",
        "teachingCues": ["Press the lower back into the table.", "Control the bar through the whole arc.", "Exhale on the press, inhale on the return."],
        "apparatusSettings": "Top-loaded springs (medium). Tower bar above feet when supine. Adjust height to client's range."
    },
    "cat_stretch_cadillac": {
        "whatToAvoid": "Avoid forcing the bar through a range the spine won't support, sinking into the wrists on the extension phase, or losing the four-point support.",
        "alternativeExercise": "Spine Mobilisation",
        "instructorNote": "An excellent kneeling spinal mobilizer. The bar guides the spine into flexion and extension with spring support. Particularly useful for warming up stiff thoracic spines.",
        "teachingCues": ["Move one vertebra at a time.", "Let the bar lead the arc.", "Breathe into each direction."],
        "apparatusSettings": "Push-through bar with bottom spring (light). Kneeling under the Cadillac facing the push-through bar."
    },
    "hanging_cadillac": {
        "whatToAvoid": "Avoid hanging passively without core engagement, allowing the pelvis to tuck excessively, or swinging.",
        "alternativeExercise": "Shoulder Rolls",
        "instructorNote": "A traction and shoulder girdle decompression exercise. Contraindicate for acute shoulder instability. The minimal weight-bearing version uses the legs to take load off the spine.",
        "teachingCues": ["Find length through the whole spine.", "Shoulders wide and relaxed.", "Breathe into the rib cage."],
        "apparatusSettings": "Horizontal bars or trapeze at appropriate height. Grip width shoulder-width or slightly wider. No spring tension."
    },

    # ── CHAIR ─────────────────────────────────────────────────────────────────
    "mermaid": {
        "whatToAvoid": "Avoid collapsing the reaching side, rotating the torso as you bend, or letting the supporting arm lock at the elbow.",
        "alternativeExercise": "Seated Side Bend",
        "instructorNote": "Excellent lateral thoracic stretch. Whether on mat, chair, or box, the foundational cue is the same: grow before bending. Especially valuable for scoliosis work.",
        "teachingCues": ["Reach the top arm up before sweeping over.", "Both sit bones stay grounded.", "Breathe into the opening ribs."],
        "apparatusSettings": "Chair: seat height comfortable for the client to sit sideways. One hand on pedal or box. No spring resistance unless adding the push variation."
    },
    "push_up_chair": {
        "whatToAvoid": "Avoid collapsing the wrists, losing the plank line during the push, or pressing the pedal unevenly.",
        "alternativeExercise": "Plank",
        "instructorNote": "The Wunda Chair demands more isolated limb control than mat push-ups. Spring tension determines difficulty. Contraindicate for wrist pathology.",
        "teachingCues": ["Keep the whole body in one line.", "Elbows graze the sides.", "Control the pedal on the way up."],
        "apparatusSettings": "2 springs (bottom mount). Hands on chair top, feet on floor or elevated. Inclined plank position."
    },
    "teaser_chair": {
        "whatToAvoid": "Avoid collapsing the spine, gripping the chair edges, or losing the V-shape on the descent.",
        "alternativeExercise": "Teaser",
        "instructorNote": "Sitting on the chair with feet on the pedal adds a new dimension — the spring both assists and challenges. Teach mat Teaser first.",
        "teachingCues": ["V from hip to heel.", "Scoop the abdominals as you lower.", "Keep the shoulders down and back."],
        "apparatusSettings": "1–2 light springs. Seated on chair top, feet on pedal. Spine long."
    },
    "going_up_front": {
        "whatToAvoid": "Avoid locking the standing knee, using momentum to press the pedal, or losing hip level at the top.",
        "alternativeExercise": "Footwork",
        "instructorNote": "A standing unilateral balance and hip control exercise. The non-pedal leg is the working leg. Monitor knee tracking of the standing leg carefully.",
        "teachingCues": ["Press down through the standing heel.", "Hips stay level.", "Controlled descent — don't let the pedal fly."],
        "apparatusSettings": "2 springs. One foot on pedal, one foot on chair top. Hands on the chair sides for support initially."
    },
    "going_up_side": {
        "whatToAvoid": "Avoid hip hiking on the press, losing the lateral plumb line, or using the arm for support beyond balance.",
        "alternativeExercise": "Side Kick Kneeling",
        "instructorNote": "Tests lateral hip control and single-leg balance in a side-facing stance. A significant balance and strength challenge. Progress from Going Up Front.",
        "teachingCues": ["Stack the hips — don't let the top one rise.", "Press the pedal with the hip, not the knee.", "Gaze forward and breathe steadily."],
        "apparatusSettings": "2 springs. One foot on pedal (inner side), one foot on chair top. Side-facing position."
    },
    "pumping_chair": {
        "whatToAvoid": "Avoid arching the lower back on the press, letting the pedal bang at the bottom, or twisting during the alternating arm variation.",
        "alternativeExercise": "Leg Springs",
        "instructorNote": "A seated leg press that builds hip flexor and lower limb strength. Simple but powerful for rehab. Teach symmetric pressing before alternating.",
        "teachingCues": ["Press with even power through both feet.", "Keep the spine tall.", "Controlled return — don't let the pedal rush up."],
        "apparatusSettings": "2 springs. Seated on chair top, both feet on pedal. Spine in neutral."
    },
    "achilles_stretch_chair": {
        "whatToAvoid": "Avoid forcing the heel below the footbar level past comfortable range, locking the knee, or leaning forward excessively.",
        "alternativeExercise": "Foam Roller Series",
        "instructorNote": "A gentle eccentric Achilles and calf lengthening exercise. Excellent for plantar fasciitis and Achilles tendinopathy. Progress the depth of stretch gradually over sessions.",
        "teachingCues": ["Lower the heel slowly and with control.", "Soft knee — not locked.", "Breathe into the back of the calf."],
        "apparatusSettings": "1–2 springs. Standing with ball of foot on chair pedal. Heel lowered below platform level."
    },

    # ── PROPS ─────────────────────────────────────────────────────────────────
    "magic_circle_press": {
        "whatToAvoid": "Avoid cranking the ring excessively, hunching the shoulders on the press, or holding the breath.",
        "alternativeExercise": "Pilates Ring Squeeze",
        "instructorNote": "The ring provides proprioceptive feedback for adductor, inner arm, and outer hip activation. Choose the appropriate press point (inner thigh, hands, outer ankles) for the goal.",
        "teachingCues": ["Squeeze to 70% — not maximum.", "Keep the shoulders relaxed.", "Find the internal activation, not the external grip."],
        "apparatusSettings": "Standard 13-inch Magic Circle. Pads facing inward for thigh work, outward for outer hip or arm work. No additional spring resistance."
    },
    "pilates_ring_squeeze": {
        "whatToAvoid": "Avoid over-gripping to the point of breath-holding, pressing asymmetrically, or using only the large muscles without sensing the deep stabilisers.",
        "alternativeExercise": "Band Arm Series",
        "instructorNote": "Versatile for inner thigh, outer hip, or arm activation. Particularly useful for pelvic floor connection — cue the client to link the pelvic floor with the squeeze.",
        "teachingCues": ["Squeeze gently and breathe.", "Feel the deep inner connection.", "Keep the rest of the body soft."],
        "apparatusSettings": "Standard Pilates ring. Multiple placement options — thighs, ankles, hands. No additional resistance needed."
    },
    "ball_roll": {
        "whatToAvoid": "Avoid losing the ball shape mid-roll, rolling onto the neck, or using a ball that is too firm for the spine.",
        "alternativeExercise": "Rolling Like a Ball",
        "instructorNote": "Using a soft ball under the sacrum adds massage and support. Teaches clients how a good rounded position feels. Useful for clients afraid of rolling on a hard mat.",
        "teachingCues": ["Keep the ball centred under the sacrum.", "Hold the shape tight.", "Roll with the exhale."],
        "apparatusSettings": "Soft 25–30cm Pilates ball. Placed under the sacrum or used between the knees depending on the variation."
    },
    "band_arm_series": {
        "whatToAvoid": "Avoid shrugging the shoulders during the press, hyperextending the elbows, or pulling the band asymmetrically.",
        "alternativeExercise": "Arm Springs",
        "instructorNote": "A versatile resistance band series that replicates Cadillac arm spring patterns without the apparatus. Excellent travel or home practice option. Adjust band tension with grip width.",
        "teachingCues": ["Keep the scapulae drawing down the back.", "Elbows soft throughout.", "Control the return as much as the press."],
        "apparatusSettings": "Resistance band: light to medium. Anchor at door, wall bar, or hold under feet depending on variation. Standing, seated, or supine."
    },
    "foam_roller_series": {
        "whatToAvoid": "Avoid rolling directly over a joint, moving too quickly over a tender area, or dropping body weight onto the roller without muscle activation.",
        "alternativeExercise": "Spine Mobilisation",
        "instructorNote": "Myofascial release and spinal stability challenge. Lying along the roller requires significant balance. Teach supine placement first before adding arm or leg movements.",
        "teachingCues": ["Support your weight with the arms and legs.", "Roll slowly — pause over tight spots.", "Breathe into the area you're releasing."],
        "apparatusSettings": "90cm full foam roller (firm). Placed along the spine or under the target area. No additional resistance."
    },
    "arc_barrel_series": {
        "whatToAvoid": "Avoid hyperextending the lumbar spine over the arc, gripping the arc edges to lever up, or working beyond comfortable spinal range.",
        "alternativeExercise": "Swan Prep",
        "instructorNote": "The arc barrel supports the spine in extension and side-lying positions. It is particularly valuable for osteoporosis (supported extension) and scoliosis (lateral work). Multiple exercises are possible — teach each variation separately.",
        "teachingCues": ["Let the arc support the natural curve.", "Reach long before lifting.", "Breathe into the curve."],
        "apparatusSettings": "Arc barrel positioned with the curve supporting the target spinal region. For extension: drape supine over the dome. For side-lying: barrel under the waist."
    },
    "spine_corrector_series": {
        "whatToAvoid": "Avoid forcing the spine into range it won't reach, using arm momentum for rolling exercises, or placing the barrel incorrectly for the exercise.",
        "alternativeExercise": "Rolling Like a Ball",
        "instructorNote": "The spine corrector bridges mat and apparatus work. The curved bowl supports rolling and extension. Used for the full mat repertoire and specialised corrective work. Clean barrel hygiene is essential.",
        "teachingCues": ["Let the curve guide the spine.", "Find the support — then move.", "Control every direction of the movement."],
        "apparatusSettings": "Spine corrector positioned with the curved hollow facing up. Sit in the bowl or drape over the hump depending on the exercise goal."
    },
}

def patch():
    with open(EXERCISES_PATH, encoding='utf-8') as f:
        exercises = json.load(f)

    patched = 0
    for ex in exercises:
        p = PATCHES.get(ex['id'])
        if p:
            changed = False
            for field, value in p.items():
                if not ex.get(field):
                    ex[field] = value
                    changed = True
            if changed:
                patched += 1

        # Generate new fields if missing
        if not ex.get('modificationsAndAlternatives'):
            mods = list(ex.get('modifications', []))
            alt = ex.get('alternativeExercise')
            if alt:
                alt_text = f"Safer alternative: {alt}"
                if alt_text not in mods:
                    mods.append(alt_text)
            ex['modificationsAndAlternatives'] = mods

        if not ex.get('referenceDetails'):
            details = []
            safety = ex.get('safetyNote')
            contraindications = ex.get('contraindicationsNote')
            what_to_avoid = ex.get('whatToAvoid')
            if safety:
                details.append(f"Safety note: {safety}")
            if contraindications:
                details.append(f"Contraindications: {contraindications}")
            if what_to_avoid:
                details.append(f"What to avoid: {what_to_avoid}")
            if not details:
                details.append("Refer to client-specific guidance and health history before prescribing this exercise.")
            ex['referenceDetails'] = ' '.join(details)

        if not ex.get('instructionsAndDetails'):
            parts = []
            setup = ex.get('setup')
            breathing = ex.get('breathing')
            instructions = ex.get('instructions', [])
            common_mistakes = ex.get('commonMistakes', [])
            progressions = ex.get('progressions', [])

            if setup:
                parts.append(f"Setup: {setup}")
            if breathing:
                parts.append(f"Breathing: {breathing}")

            if instructions:
                instr_lines = []
                for idx, item in enumerate(instructions, start=1):
                    if isinstance(item, list):
                        instr_lines.append(' '.join(item))
                    else:
                        instr_lines.append(f"{idx}. {item}")
                parts.append(f"Instructions: {' '.join(instr_lines)}")

            if common_mistakes:
                parts.append(f"Common mistakes: {'; '.join(common_mistakes)}")
            if progressions:
                parts.append(f"Progressions: {'; '.join(progressions)}")

            ex['instructionsAndDetails'] = ' '.join(parts)

    with open(EXERCISES_PATH, 'w', encoding='utf-8') as f:
        json.dump(exercises, f, indent=2, ensure_ascii=False)
        f.write('\n')

    print(f'Patched {patched} exercises.')

    # Validation
    missing = []
    required = ['whatToAvoid', 'alternativeExercise', 'instructorNote', 'teachingCues',
                'modificationsAndAlternatives', 'referenceDetails', 'instructionsAndDetails']
    for ex in exercises:
        for field in required:
            if not ex.get(field):
                missing.append(f'{ex["id"]}: {field}')
    if missing:
        print('Still missing:')
        for m in missing:
            print(' ', m)
    else:
        print('All exercises fully patched.')

if __name__ == '__main__':
    patch()
