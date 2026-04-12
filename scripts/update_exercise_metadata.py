import json
import re
from pathlib import Path

EXERCISES_PATH = Path('src/assets/data/exercises.json')

EQUIPMENT_OVERRIDES = {
    'Magic Circle Press': 'Magic Circle',
    'Pilates Ring Squeeze': 'Magic Circle',
    'Ball Roll': 'Stability Ball',
    'Resistance Band Arm Series': 'Resistance Band',
    'Foam Roller Series': 'Foam Roller',
    'Arc Barrel Series': 'Arc Barrel',
    'Spine Corrector Series': 'Spine Corrector',
}

PRIMARY_MUSCLES_OVERRIDES = {
    'The Hundred': ['Abdominals', 'Hip flexors', 'Shoulders'],
    'Roll Up': ['Abdominals', 'Spinal erectors', 'Hamstrings'],
    'Roll Over': ['Abdominals', 'Hamstrings', 'Low back'],
    'Rolling Like a Ball': ['Abdominals', 'Spinal extensors', 'Hip flexors'],
    'Spine Stretch Forward': ['Hamstrings', 'Spinal extensors', 'Abdominals'],
    'Corkscrew': ['Abdominals', 'Hip flexors', 'Adductors'],
    'Saw': ['Obliques', 'Hamstrings', 'Spinal rotators'],
    'Swan': ['Spinal extensors', 'Glutes', 'Shoulders'],
    'Swan Prep': ['Spinal extensors', 'Glutes', 'Shoulders'],
    'Swan Dive': ['Spinal extensors', 'Hamstrings', 'Shoulders'],
    'Swimming': ['Spinal extensors', 'Glutes', 'Shoulders'],
    'Shoulder Bridge': ['Glutes', 'Hamstrings', 'Spinal erectors'],
    'Leg Pull Front': ['Shoulders', 'Abdominals', 'Glutes'],
    'Leg Pull Back': ['Glutes', 'Hamstrings', 'Shoulders'],
    'Side Kick': ['Hip abductors', 'Hamstrings', 'Obliques'],
    'Side Kick Series': ['Hip abductors', 'Glutes', 'Obliques'],
    'Seal': ['Abdominals', 'Hip flexors', 'Spine stabilizers'],
    'Crab': ['Abdominals', 'Hip flexors', 'Shoulders'],
    'Rocking': ['Abdominals', 'Hip flexors', 'Spinal stabilizers'],
    'Control Balance': ['Shoulders', 'Glutes', 'Spinal extensors'],
    'Scissors': ['Abdominals', 'Hip flexors', 'Hamstrings'],
    'Bicycle': ['Abdominals', 'Hip flexors', 'Quadriceps'],
    'One Leg Circle': ['Hip flexors', 'Adductors', 'Abdominals'],
    'Single Leg Stretch': ['Abdominals', 'Hip flexors', 'Quadriceps'],
    'Double Leg Stretch': ['Abdominals', 'Hip flexors', 'Shoulders'],
    'Open Leg Rocker': ['Abdominals', 'Hamstrings', 'Hip flexors'],
    'One Leg Kick': ['Hamstrings', 'Glutes', 'Shoulders'],
    'Double Leg Kick': ['Hamstrings', 'Glutes', 'Shoulders'],
    'Knee Stretch': ['Glutes', 'Hamstrings', 'Core stabilizers'],
    'Side Kick Kneeling': ['Hip abductors', 'Glutes', 'Core stabilizers'],
    'Pelvic Curl': ['Glutes', 'Hamstrings', 'Spinal erectors'],
    'Breaststroke': ['Upper back', 'Glutes', 'Hamstrings'],
    'Push Up': ['Chest', 'Shoulders', 'Triceps'],
    'Single Straight Leg Stretch': ['Abdominals', 'Hamstrings', 'Hip flexors'],
    'Double Straight Leg Stretch': ['Abdominals', 'Hip flexors', 'Shoulders'],
    'Criss Cross': ['Obliques', 'Abdominals', 'Hip flexors'],
    'Plank': ['Core', 'Shoulders', 'Back'],
    'Rowing Series': ['Upper back', 'Shoulders', 'Biceps'],
    'Short Box Series': ['Abdominals', 'Spinal rotators', 'Hip flexors'],
    'Running': ['Calves', 'Hamstrings', 'Hip flexors'],
    'Semi-Circle': ['Spinal extensors', 'Hip flexors', 'Shoulders'],
    'Backstroke': ['Shoulders', 'Upper back', 'Core'],
    'Pulling Straps': ['Upper back', 'Shoulders', 'Glutes'],
    'Down Stretch': ['Shoulders', 'Spinal extensors', 'Hamstrings'],
    'Up Stretch': ['Shoulders', 'Hamstrings', 'Spinal extensors'],
    'Snake': ['Obliques', 'Hip abductors', 'Shoulders'],
    'Front Splits': ['Hip flexors', 'Quadriceps', 'Adductors'],
    'Side Splits': ['Adductors', 'Glutes', 'Core stabilizers'],
    'Overhead': ['Abdominals', 'Shoulders', 'Spinal extensors'],
    'Balance Point': ['Hip flexors', 'Abdominals', 'Shoulders'],
    'Push Through': ['Shoulders', 'Triceps', 'Upper back'],
    'Roll Down Bar': ['Abdominals', 'Spinal extensors', 'Latissimus'],
    'Arm Springs': ['Shoulders', 'Upper back', 'Triceps'],
    'Leg Springs': ['Hamstrings', 'Glutes', 'Hip flexors'],
    'Tower': ['Core', 'Hip flexors', 'Shoulders'],
    'Cat Stretch on Cadillac': ['Spinal flexors', 'Spinal extensors', 'Core'],
    'Hanging': ['Shoulders', 'Spine', 'Core stabilizers'],
    'Mermaid': ['Obliques', 'Shoulders', 'Latissimus'],
    'Push Up on Chair': ['Chest', 'Shoulders', 'Triceps'],
    'Teaser on Chair': ['Abdominals', 'Hip flexors', 'Shoulders'],
    'Going Up Front': ['Quadriceps', 'Glutes', 'Core'],
    'Going Up Side': ['Hip abductors', 'Glutes', 'Obliques'],
    'Pumping': ['Quadriceps', 'Glutes', 'Core'],
    'Achilles Stretch': ['Calves', 'Achilles tendon', 'Ankles'],
}

BREATHING_OVERRIDES = {
    'The Hundred': 'Inhale for five pumps, exhale for five pumps; keep the ribs long and shoulders relaxed.',
    'Roll Up': 'Exhale to peel the spine up, inhale at the top, then exhale to articulate down.',
    'Roll Over': 'Exhale to lift the legs overhead, inhale at the top, then exhale to lower with control.',
    'Rolling Like a Ball': 'Exhale to rock back, inhale to return to balance with a rounded spine.',
    'Swan': 'Inhale to prepare, exhale to lift and lengthen through the upper spine.',
    'Swan Dive': 'Inhale as you prepare, exhale to lift and glide with a long spine.',
    'Swimming': 'Inhale to reach, exhale to lower and recover.',
    'Push Up': 'Inhale to lower the body, exhale to press back up.',
    'Plank': 'Breathe evenly and avoid holding the breath during the hold.',
}

COMMON_MISTAKES_OVERRIDES = {
    'The Hundred': [
        'Allowing the lower back to arch away from the mat.',
        'Tensing the shoulders or lifting them toward the ears.',
    ],
    'Roll Up': [
        'Using momentum instead of articulating the spine.',
        'Pulling on the neck as you rise.',
    ],
    'Roll Over': [
        'Dropping the legs too quickly and losing core control.',
        'Collapsing the lower back during the roll.',
    ],
    'Swan': [
        'Lifting from the lower back instead of lengthening through the spine.',
        'Pushing the ribs forward and losing core stability.',
    ],
    'Push Up': [
        'Letting the hips sag or hike up too high.',
        'Holding the breath during the movement.',
    ],
}

SETUP_OVERRIDES = {
    'The Hundred': 'Lie supine with knees bent in tabletop, shoulders relaxed, and arms long by your sides.',
    'Roll Up': 'Lie supine with legs straight and arms reaching overhead.',
    'Roll Over': 'Lie supine with legs straight and arms alongside the body.',
    'Rolling Like a Ball': 'Sit with knees bent, hands on the shins, and shoulders relaxed.',
    'Spine Stretch Forward': 'Sit tall with legs extended and feet flexed.',
    'Saw': 'Sit with legs wide, arms extended, and spine tall.',
    'Swan': 'Lie prone with hands under shoulders and legs extended.',
    'Swan Dive': 'Lie prone with hands under shoulders and forehead on the mat.',
    'Swimming': 'Lie prone with arms extended overhead and legs straight.',
    'Shoulder Bridge': 'Lie supine with knees bent and feet hip-distance apart.',
    'Leg Pull Front': 'Begin in a plank with hands under shoulders and feet hip-width apart.',
    'Leg Pull Back': 'Sit with hands behind you and feet on the floor, fingers facing forward.',
    'Side Kick': 'Lie on your side with the top hand supporting your head and legs stacked.',
    'Side Kick Series': 'Lie on your side with the bottom arm extended and the top hand supporting your head.',
    'Seal': 'Sit with knees bent, feet together, and hands holding your ankles.',
    'Crab': 'Sit tall with knees bent and hands behind you supporting your weight.',
    'Rocking': 'Sit with knees bent, feet together, and hands holding your ankles.',
    'Control Balance': 'Lie prone and prepare to lift into an inverted balance.',
    'Scissors': 'Lie supine with one leg extended toward the ceiling and the other lowered toward the mat.',
    'Bicycle': 'Lie supine with hands behind the head and legs lifted to tabletop.',
    'One Leg Circle': 'Lie supine with one leg extended toward the ceiling and the opposite knee bent.',
    'Single Leg Stretch': 'Lie supine with one knee pulled to the chest and the other leg extended.',
    'Double Leg Stretch': 'Lie supine with both knees bent into the chest and arms by the shins.',
    'Open Leg Rocker': 'Sit tall with legs extended wide and hands holding the ankles.',
    'One Leg Kick': 'Lie prone with hands clasped behind the back and one knee bent.',
    'Double Leg Kick': 'Lie prone with hands clasped behind the back and knees bent.',
    'Knee Stretch': 'Kneel on the mat with hands on the appropriate support and a neutral spine.',
    'Side Kick Kneeling': 'Kneel with one leg extended to the side and hands on the floor for support.',
    'Pelvic Curl': 'Lie supine with knees bent and feet flat on the mat.',
    'Breaststroke': 'Lie prone with hands behind the back and legs extended.',
    'Push Up': 'Begin in plank with wrists under shoulders and core engaged.',
    'Single Straight Leg Stretch': 'Lie supine with one leg extended and the other knee pulled in.',
    'Double Straight Leg Stretch': 'Lie supine with both legs extended toward the ceiling.',
    'Criss Cross': 'Lie supine with knees bent and hands behind the head.',
    'Plank': 'Start in a full plank with a long line from head to heels.',
    'Rowing Series': 'Sit on the Reformer carriage with knees bent and straps in hand.',
    'Short Box Series': 'Sit on the short box with feet against the footbar and spine tall.',
    'Running': 'Kneel on the Reformer carriage with feet on the footbar and hands on the shoulder blocks.',
    'Semi-Circle': 'Lie supine on the long box with your head supported and legs extended overhead.',
    'Backstroke': 'Lie supine on the long box with straps in hand and legs extended overhead.',
    'Pulling Straps': 'Lie prone on the long box with straps in hand and chest lifted slightly.',
    'Down Stretch': 'Kneel on the carriage with hands on the footbar and hips over the knees.',
    'Up Stretch': 'Kneel on the carriage with hands on the footbar and spine long.',
    'Snake': 'Lie prone on the Reformer with arms on the footbar and legs extended.',
    'Front Splits': 'Stand with one foot on the platform and one foot on the carriage.',
    'Side Splits': 'Stand sideways on the Reformer with one foot on the platform and one on the carriage.',
    'Overhead': 'Lie supine on the Reformer with legs extended overhead and straps in hand.',
    'Balance Point': 'Sit on the carriage in a V position with straps in hand.',
    'Push Through': 'Lie supine on the Cadillac with hands on the roll-down bar and feet on the carriage.',
    'Roll Down Bar': 'Sit facing the roll-down bar with feet anchored or on the mat.',
    'Arm Springs': 'Sit or stand at the Cadillac with arm springs attached and spine tall.',
    'Leg Springs': 'Lie supine on the Cadillac with legs in the leg springs and spine long.',
    'Tower': 'Lie supine on the Cadillac with feet in the tower springs and spine supported.',
    'Cat Stretch on Cadillac': 'Kneel facing the Cadillac with hands on the push-through bar.',
    'Hanging': 'Stand under the Cadillac bar and grasp it with both hands for light traction.',
    'Mermaid': 'Sit sideways on the Chair with one hand on the pedal and the other on the handle.',
    'Push Up on Chair': 'Place hands on the Chair handles and feet on the floor in a plank stance.',
    'Teaser on Chair': 'Sit on the Chair with legs bent and hands on the sides of the pedal.',
    'Going Up Front': 'Stand beside the Chair with one foot on the pedal and one on the floor.',
    'Going Up Side': 'Stand sideways to the Chair with one foot on the pedal.',
    'Pumping': 'Sit or stand on the Chair with the pedal under the feet and hands on the handles.',
    'Achilles Stretch': 'Stand facing the Chair with the balls of your feet on the pedal and heels on the floor.',
    'Magic Circle Press': 'Sit or lie with the circle between the hands or legs depending on the exercise.',
    'Pilates Ring Squeeze': 'Sit or lie with the ring placed between the hands or legs as directed.',
    'Ball Roll': 'Sit on the stability ball with feet grounded and spine neutral.',
    'Resistance Band Arm Series': 'Stand or sit with the band looped around the hands and arms extended.',
    'Foam Roller Series': 'Lie or sit on the foam roller with it positioned under the spine or hips.',
    'Arc Barrel Series': 'Position the arc barrel under the thoracic spine or pelvis as directed.',
    'Spine Corrector Series': 'Lie back over the spine corrector with feet grounded and spine long.',
}

INSTRUCTION_OVERRIDES = {
    'The Hundred': [
        'Lie supine with knees bent in tabletop and lift your head and shoulders.',
        'Pump your arms in small, strong movements while keeping the ribs drawn in.',
        'Inhale for five pumps and exhale for five pumps.',
    ],
    'Roll Up': [
        'Lie supine with legs straight and arms overhead.',
        'Exhale to peel the spine up one vertebra at a time.',
        'Inhale at the top, then exhale to articulate back down slowly.',
    ],
    'Roll Over': [
        'Lie supine with legs extended and arms alongside the body.',
        'Exhale to lift the legs overhead and roll onto the shoulders.',
        'Inhale at the top, then exhale to lower the legs with control.',
    ],
    'Rolling Like a Ball': [
        'Sit with knees bent, hold your shins, and round the spine.',
        'Exhale to roll back onto the shoulders, then inhale to rock forward.',
        'Keep the movement smooth and avoid letting the feet touch the floor.',
    ],
    'Spine Stretch Forward': [
        'Sit tall with legs extended and arms reaching forward.',
        'Exhale to round the spine and reach toward the toes.',
        'Inhale to return to a long, tall sitting position.',
    ],
    'Swan': [
        'Lie prone with hands under the shoulders.',
        'Inhale to prepare, then exhale to lift the chest and lengthen the spine.',
        'Keep the pelvis grounded and lower back soft on the inhale.',
    ],
    'Shoulder Bridge': [
        'Lie supine with knees bent and feet hip-width apart.',
        'Exhale to roll the pelvis up into bridge position.',
        'Inhale at the top, then exhale to articulate back down slowly.',
    ],
    'Push Up': [
        'Begin in plank with wrists under shoulders.',
        'Inhale to lower the body, keeping elbows close to the ribcage.',
        'Exhale to press back up while maintaining a strong core line.',
    ],
}

COMMON_MISTAKES_OVERRIDES = {
    'The Hundred': [
        'Allowing the lower back to arch away from the mat.',
        'Tensing the shoulders or lifting them toward the ears.',
    ],
    'Roll Up': [
        'Using momentum instead of articulating the spine.',
        'Pulling on the neck as you rise.',
    ],
    'Roll Over': [
        'Dropping the legs too quickly and losing core control.',
        'Collapsing the lower back during the roll.',
    ],
    'Swan': [
        'Lifting from the lower back instead of lengthening through the upper spine.',
        'Pushing the ribs forward and losing core stability.',
    ],
    'Push Up': [
        'Letting the hips sag or hike too high.',
        'Holding the breath during the movement.',
    ],
}

COMMON_MISTAKES_DEFAULT = [
    'Holding the breath instead of breathing continuously.',
    'Letting the ribs flare or the shoulders creep up toward the ears.',
    'Moving too quickly instead of using controlled Pilates precision.',
]


def normalize(text):
    return re.sub(r'[^a-z0-9]+', '_', text.lower()).strip('_')


def equipment(name, category):
    if name in EQUIPMENT_OVERRIDES:
        return EQUIPMENT_OVERRIDES[name]
    if category in ['Mat', 'Warm-up / Cool down']:
        return 'Mat'
    if category == 'Reformer':
        return 'Reformer'
    if category == 'Cadillac':
        return 'Cadillac'
    if category == 'Chair':
        return 'Wunda Chair'
    if category == 'Props':
        return 'Prop'
    return category


def reps(level):
    if not level:
        return '6–8 repetitions'
    value = level.lower()
    if 'beginner' in value:
        return '8–10 repetitions'
    if 'intermediate' in value:
        return '6–8 repetitions'
    if 'advanced' in value:
        return '4–6 repetitions'
    return '6–8 repetitions'


def breathing(name):
    if name in BREATHING_OVERRIDES:
        return BREATHING_OVERRIDES[name]
    lower = name.lower()
    if any(term in lower for term in ['push', 'press', 'plank', 'push up', 'push_through']):
        return 'Inhale to prepare, exhale to press or lift with control.'
    if any(term in lower for term in ['swan', 'bridge', 'back', 'stretch']):
        return 'Inhale to prepare, exhale to lift and lengthen the spine.'
    if any(term in lower for term in ['roll', 'rock', 'circle', 'scissors', 'bicycle']):
        return 'Exhale to initiate the movement, inhale to return with control.'
    return 'Exhale to initiate, inhale to release and reset.'


def setup(name, category):
    if name in SETUP_OVERRIDES:
        return SETUP_OVERRIDES[name]
    lower = name.lower()
    if category == 'Mat':
        if any(term in lower for term in ['standing', 'plank', 'push up', 'side bend', 'teaser', 'seal', 'crab']):
            return 'Begin on the mat in the appropriate standing, seated, or prone position with a neutral spine.'
        if any(term in lower for term in ['swan', 'swimming', 'breaststroke', 'push up', 'bridge']):
            return 'Begin prone or supine on the mat with the spine long and shoulders relaxed.'
        return 'Begin on the mat in the appropriate supine or seated position with the spine neutral.'
    if category == 'Reformer':
        return 'Begin on the Reformer carriage with springs set for controlled movement and proper alignment.'
    if category == 'Cadillac':
        return 'Begin on the Cadillac with springs and bars adjusted to a comfortable starting position.'
    if category == 'Chair':
        return 'Begin on the Chair with the pedal set to the right resistance and hands on the handles if needed.'
    if category == 'Props':
        return 'Begin with the prop positioned safely and the body aligned over or around it as directed.'
    return 'Begin in the standard starting position with good Pilates alignment and neutral breathing.'


def instructions(name, category):
    if name in INSTRUCTION_OVERRIDES:
        return INSTRUCTION_OVERRIDES[name]
    lower = name.lower()
    if category == 'Reformer':
        return [
            'Position yourself on the Reformer with good alignment and the carriage tension set appropriately.',
            'Move deliberately while keeping the torso stable and the breath steady.',
            'Return with control and avoid using momentum to complete the movement.',
        ]
    if category in ['Cadillac', 'Chair', 'Props']:
        return [
            'Set up the apparatus and position the body with correct alignment.',
            'Execute the movement slowly and precisely, using the equipment for support or resistance.',
            'Finish the exercise with a controlled return and steady breath.',
        ]
    if any(term in lower for term in ['roll', 'rock', 'circle']):
        return [
            'Begin with a stable core and long spine.',
            'Move through the pattern with control, maintaining pelvic stability.',
            'Return to the start slowly and keep the breath even.',
        ]
    if any(term in lower for term in ['stretch', 'swan', 'bridge']):
        return [
            'Begin in the proper alignment with a neutral or slightly curved spine.',
            'Initiate the movement from the center of the body and maintain length.',
            'Release back to the starting position with control and a fluid breath.',
        ]
    return [
        'Start with a stable and aligned Pilates position.',
        'Move with precision, keeping the core engaged throughout.',
        'Return with the same quality of movement and breathe continuously.',
    ]


def mistakes(name, category):
    if name in COMMON_MISTAKES_OVERRIDES:
        return COMMON_MISTAKES_OVERRIDES[name]
    lower = name.lower()
    mistakes = list(COMMON_MISTAKES_DEFAULT)
    if any(term in lower for term in ['swan', 'bridge', 'back']):
        mistakes.append('Overarching the lower back instead of maintaining length.')
    if any(term in lower for term in ['side', 'balance', 'split']):
        mistakes.append('Losing hip stability or allowing the pelvis to tilt.')
    if any(term in lower for term in ['roll', 'circle', 'scissors', 'bicycle']):
        mistakes.append('Using momentum rather than controlled articulation.')
    if any(term in lower for term in ['plank', 'push up', 'push']):
        mistakes.append('Allowing the hips to sag or lift too high.')
    return mistakes


def primary_muscles(name, category):
    if name in PRIMARY_MUSCLES_OVERRIDES:
        return PRIMARY_MUSCLES_OVERRIDES[name]
    if category == 'Mat':
        return ['Abdominals', 'Spinal stabilizers', 'Hip flexors']
    if category == 'Reformer':
        return ['Core stabilizers', 'Upper back', 'Leg muscles']
    if category == 'Cadillac':
        return ['Core', 'Shoulders', 'Spine muscles']
    if category == 'Chair':
        return ['Core', 'Legs', 'Arms']
    if category == 'Props':
        return ['Core', 'Stabilizers', 'Flexibility']
    return ['Core', 'Stabilizers']


def main():
    with EXERCISES_PATH.open('r', encoding='utf-8') as f:
        exercises = json.load(f)

    for exercise in exercises:
        name = exercise['name']
        category = exercise.get('category', 'Mat')
        exercise.setdefault('equipment', equipment(name, category))
        exercise.setdefault('reps', reps(exercise.get('level')))
        exercise.setdefault('breathing', breathing(name))
        exercise.setdefault('setup', setup(name, category))
        exercise.setdefault('instructions', instructions(name, category))
        exercise.setdefault('commonMistakes', mistakes(name, category))
        exercise.setdefault('primaryMuscles', primary_muscles(name, category))

    with EXERCISES_PATH.open('w', encoding='utf-8') as f:
        json.dump(exercises, f, indent=2, ensure_ascii=False)

    print(f'Updated {len(exercises)} exercises with extended metadata.')


if __name__ == '__main__':
    main()
