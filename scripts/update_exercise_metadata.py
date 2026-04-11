import json
from pathlib import Path

exercise_file = Path('src/assets/data/exercises.json')
with exercise_file.open('r', encoding='utf-8') as f:
    data = json.load(f)

update = {
    'roll_over': {
        'level': 'Intermediate',
        'modifications': [
            'Keep the legs bent and move with a smaller range of motion to protect the hamstrings and lower back.',
            'Use the arms to support the motion and roll only as far as the shoulders allow.'
        ],
        'progressions': [
            'Straighten the legs more gradually as hamstring flexibility improves.',
            'Lower the legs more slowly toward vertical while keeping the spine controlled.'
        ]
    },
    'rolling_like_a_ball': {
        'level': 'Beginner',
        'modifications': [
            'Keep the feet on the mat or hold the shins instead of the ankles to reduce strain.',
            'Use a smaller rocking range and focus on maintaining a rounded spine.'
        ],
        'progressions': [
            'Increase balance challenge by rocking with a slightly smaller base of support.',
            'Add a small pause at the top of the rock before rolling back.'
        ]
    },
    'spine_stretch_forward': {
        'level': 'Beginner',
        'modifications': [
            'Sit on a small block or cushion to ease hamstring stretch.',
            'Bend the knees slightly and reach only as far as the spine can stay long.'
        ],
        'progressions': [
            'Extend the legs further and reach the arms farther past the feet.',
            'Hold the longer position with a steady breath and a strong core.'
        ]
    },
    'teaser': {
        'level': 'Intermediate',
        'modifications': [
            'Practice with bent knees and support the thighs with the hands.',
            'Lift only as high as the lower back can stay long and stable.'
        ],
        'progressions': [
            'Straighten the legs and lower the arms overhead with control.',
            'Hold the top position for a longer count while maintaining breath.'
        ]
    },
    'saw': {
        'level': 'Intermediate',
        'modifications': [
            'Reduce the twist range and keep the spine long rather than collapsing.',
            'Shorten the leg separation if the hamstrings feel too tight.'
        ],
        'progressions': [
            'Reach farther past the feet and deepen the rotation with a stable torso.',
            'Increase the reach while keeping the ribs lifted over the hips.'
        ]
    },
    'corkscrew': {
        'level': 'Advanced',
        'modifications': [
            'Keep the legs higher and use smaller circles to protect the lower back.',
            'Keep the shoulders grounded and move slowly with control.'
        ],
        'progressions': [
            'Lengthen the descent of the legs and increase the circle size gradually.',
            'Slow the motion and focus on steady torso stabilization through each rotation.'
        ]
    },
    'jackknife': {
        'level': 'Advanced',
        'modifications': [
            'Use bridge prep and lift the hips only as high as comfortable.',
            'Keep the knees slightly bent and avoid straining the lower back.'
        ],
        'progressions': [
            'Work toward a higher hip lift and a fuller roll onto the shoulders.',
            'Slowly lower back down with control rather than dropping through the spine.'
        ]
    },
    'neck_pull': {
        'level': 'Intermediate',
        'modifications': [
            'Keep the hands behind the head and avoid pulling on the neck.',
            'Maintain a small chin tuck and only lift as far as the abdominals can support.'
        ],
        'progressions': [
            'Lower the legs closer to the mat while keeping the spine articulated.',
            'Extend the arms overhead as core control improves.'
        ]
    },
    'spine_twist': {
        'level': 'Beginner',
        'modifications': [
            'Bend the knees and shorten the leg separation to reduce torque.',
            'Keep the hips stable and rotate only as far as the spine stays tall.'
        ],
        'progressions': [
            'Extend the legs farther and deepen the twist while keeping the ribs lifted.',
            'Look over the leading shoulder to lengthen through the spine and neck.'
        ]
    },
    'side_bend': {
        'level': 'Intermediate',
        'modifications': [
            'Keep the bottom elbow slightly bent and use a smaller side-bend arc.',
            'Avoid collapsing into the lower ribs by keeping the side body long.'
        ],
        'progressions': [
            'Lift higher through the top arm and deepen the side stretch safely.',
            'Extend the legs more fully while maintaining a strong base on the mat.'
        ]
    },
    'boomerang': {
        'level': 'Advanced',
        'modifications': [
            'Practice teaser and roll-up prep first, and keep the rotation smaller.',
            'Move slowly through the transition and keep the legs closer together.'
        ],
        'progressions': [
            'Increase the leg switch speed while maintaining control.',
            'Deepen the roll-through portion with a longer balanced hold.'
        ]
    },
    'swan_dive': {
        'level': 'Intermediate',
        'modifications': [
            'Keep the chest lower and lift only as high as the back can support.',
            'Keep the knees soft and avoid overarching the lower spine.'
        ],
        'progressions': [
            'Lift higher and extend the spine more fully in the glide.',
            'Lengthen the arms forward and maintain a strong shoulder line.'
        ]
    },
    'swimming': {
        'level': 'Intermediate',
        'modifications': [
            'Alternate arm and leg lifts rather than lifting all limbs at once.',
            'Keep the head down if neck mobility is sensitive.'
        ],
        'progressions': [
            'Lift both arms and legs higher while maintaining a long spine.',
            'Increase the speed slightly while keeping the movement smooth and rhythmic.'
        ]
    },
    'shoulder_bridge': {
        'level': 'Beginner',
        'modifications': [
            'Keep the hips lower and use hands for support if needed.',
            'Widen the feet and soften the lift to reduce strain on the spine.'
        ],
        'progressions': [
            'Lift higher into the bridge with stronger hamstring engagement.',
            'Add single-leg bridge work once the basic bridge feels stable.'
        ]
    },
    'leg_pull_front': {
        'level': 'Intermediate',
        'modifications': [
            'Drop the knees to the mat and shorten the plank position.',
            'Keep the hips level and avoid letting the lower back sag.'
        ],
        'progressions': [
            'Work toward a full straight-leg plank with a longer hold.',
            'Lift one leg higher while maintaining shoulder stability and neutral spine.'
        ]
    },
    'leg_pull_back': {
        'level': 'Intermediate',
        'modifications': [
            'Keep the knees bent or start on the elbows to reduce load.',
            'Use smaller leg lifts and keep the core engaged to avoid arching.'
        ],
        'progressions': [
            'Progress to full straight legs with a stable pelvis.',
            'Hold the lifted position longer while maintaining even breathing.'
        ]
    },
    'side_kick_series': {
        'level': 'Intermediate',
        'modifications': [
            'Keep the kicks smaller and support the head with the upper hand.',
            'Slow the tempo to focus on controlled hip alignment.'
        ],
        'progressions': [
            'Increase leg height and lengthen the range of motion.',
            'Add a slight pulse at the top of each kick with a stable torso.'
        ]
    },
    'seal': {
        'level': 'Beginner',
        'modifications': [
            'Keep the feet closer together and use smaller rocks.',
            'Limit the clap depth and avoid bouncing too aggressively.'
        ],
        'progressions': [
            'Rock with a slightly larger base of support and longer hold between rocks.',
            'Increase the circle size while keeping the spine rounded and shoulders relaxed.'
        ]
    },
    'crab': {
        'level': 'Intermediate',
        'modifications': [
            'Make the leg circles smaller and keep the shoulders grounded.',
            'Move slowly and avoid lifting the hip too high.'
        ],
        'progressions': [
            'Perform larger leg circles with more control through the hip joint.',
            'Extend the leg longer while maintaining a stable upper body.'
        ]
    },
    'control_balance': {
        'level': 'Advanced',
        'modifications': [
            'Keep one leg lower and use the hands lightly for balance if needed.',
            'Avoid forcing the inverted position and focus on core stability.'
        ],
        'progressions': [
            'Straighten both legs more fully with a controlled lift.',
            'Hold the position longer while maintaining length through the spine.'
        ]
    },
    'scissors': {
        'level': 'Beginner',
        'modifications': [
            'Keep the head down and bend the lower knee slightly.',
            'Use a smaller leg separation to reduce hamstring strain.'
        ],
        'progressions': [
            'Straighten both legs more and lower the bottom leg closer to the mat.',
            'Increase the rhythmic coordination with a stronger abdominal draw-in.'
        ]
    },
    'bicycle': {
        'level': 'Beginner',
        'modifications': [
            'Keep the lower leg higher and move more slowly for better control.',
            'Soften the neck and avoid lifting the head excessively.'
        ],
        'progressions': [
            'Increase the range of motion and keep the breath steady.',
            'Circle the arms and legs with more coordination and a longer spine.'
        ]
    },
    'one_leg_circle': {
        'level': 'Beginner',
        'modifications': [
            'Bend the supporting knee slightly and use smaller circles.',
            'Focus on stabilizing the hips rather than the size of the leg circle.'
        ],
        'progressions': [
            'Perform larger circles with a longer supporting leg.',
            'Keep the standing hip stable while the moving leg circles.'
        ]
    },
    'single_leg_stretch': {
        'level': 'Beginner',
        'modifications': [
            'Keep the head down and work one leg at a time with smaller range.',
            'Shorten the leg extension to maintain lower back stability.'
        ],
        'progressions': [
            'Extend the legs farther and increase coordination with breath.',
            'Move more smoothly between legs with a stronger core hold.'
        ]
    },
    'double_leg_stretch': {
        'level': 'Intermediate',
        'modifications': [
            'Keep the head down and use a smaller arm and leg circle.',
            'Limit the range of motion if the lower back feels unstable.'
        ],
        'progressions': [
            'Extend the arms overhead and lower the legs deeper with control.',
            'Widen the circle as strength improves while maintaining coordination.'
        ]
    },
    'open_leg_rocker': {
        'level': 'Advanced',
        'modifications': [
            'Use a smaller rocking range and practice teaser prep first.',
            'Keep the legs closer together and maintain a stable spine.'
        ],
        'progressions': [
            'Increase the rocking height and balance with a longer hold at the top.',
            'Lengthen the legs and deepen the spine articulation through the motion.'
        ]
    },
    'hip_circles': {
        'level': 'Intermediate',
        'modifications': [
            'Use smaller leg swings and keep the hips stable.',
            'Support the head with the upper hand if needed.'
        ],
        'progressions': [
            'Increase circle size while keeping the torso still.',
            'Keep the spine long and avoid leaning into the supporting side.'
        ]
    },
    'one_leg_kick': {
        'level': 'Beginner',
        'modifications': [
            'Keep the knees wider and use smaller kick pulses.',
            'Support the head lightly with the top hand to reduce neck strain.'
        ],
        'progressions': [
            'Straighten the moving leg more and increase the kick range.',
            'Speed up the rhythm slightly while maintaining control.'
        ]
    },
    'double_leg_kick': {
        'level': 'Intermediate',
        'modifications': [
            'Keep the head down and use smaller lifts and kicks.',
            'Soften the arch and focus on engaging the upper back.'
        ],
        'progressions': [
            'Lift higher and kick stronger with a longer spinal extension.',
            'Lengthen the arms and keep the shoulder blades wide.'
        ]
    },
    'knee_stretch': {
        'level': 'Beginner',
        'modifications': [
            'Tuck the knees more and keep the hands on the bar for support.',
            'Reduce the depth of the round-back motion to stay comfortable.'
        ],
        'progressions': [
            'Increase the round-back range and deepen the motion.',
            'Add a longer hold at the end of the stretch to build stability.'
        ]
    },
    'pelvic_curl': {
        'level': 'Beginner',
        'modifications': [
            'Lift only partway and keep the motion small and controlled.',
            'Use the arms and feet for support if the lower back feels tight.'
        ],
        'progressions': [
            'Roll through the spine more fully and lift higher into bridge.',
            'Hold the top position longer with a stronger hamstring engagement.'
        ]
    },
    'breaststroke': {
        'level': 'Intermediate',
        'modifications': [
            'Keep the head down and use a smaller leg and arm reach.',
            'Avoid overarching the lower back by keeping the core engaged.'
        ],
        'progressions': [
            'Deepen the arch and lengthen the glide between movements.',
            'Strengthen the leg press and keep the shoulder line stable.'
        ]
    },
    'elephant': {
        'level': 'Beginner',
        'modifications': [
            'Shorten the stride and keep the knees soft to reduce hamstring tension.',
            'Keep the shoulders relaxed and avoid pressing the hips too high.'
        ],
        'progressions': [
            'Lengthen the spine and lower the heels closer to the carriage.',
            'Increase the stretch while maintaining a strong abdominal support.'
        ]
    },
    'push_through': {
        'level': 'Intermediate',
        'modifications': [
            'Use lighter springs and a smaller hinge range on the Cadillac.',
            'Keep the movement slow and controlled through the spine.'
        ],
        'progressions': [
            'Deepen the hinge and extend the shoulder line more fully.',
            'Add a longer hold in the upper position with a steady breath.'
        ]
    },
    'magic_circle_press': {
        'level': 'Beginner',
        'modifications': [
            'Hold the circle lower and squeeze gently with less resistance.',
            'Use a smaller range of motion for the arms to keep the shoulders soft.'
        ],
        'progressions': [
            'Lift the circle higher and lengthen the press with stronger control.',
            'Slow the pulse and hold the squeeze for a longer count.'
        ]
    }
}

count = 0
for e in data:
    if e['id'] in update:
        meta = update[e['id']]
        for k, v in meta.items():
            e[k] = v
        count += 1

with exercise_file.open('w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
    f.write('\n')

print(f'updated {count} exercises')
