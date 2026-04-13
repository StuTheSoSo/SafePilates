# Pilates Safety Condition Expansion

This file captures additional medical condition categories for instructor-facing Pilates safety guidance, plus ready-to-use prompts for adding them to the existing `src/assets/data/safety-conditions.json` list.

## New condition entries

1. `cardiovascular_disease`
   - label: `Cardiovascular Disease`
   - description: `Avoid heavy load, rapid transitions, and breath-holding; favor low-intensity, steady movement and monitor heart response.`

2. `arrhythmia_cardiac_device`
   - label: `Arrhythmia / Cardiac Device`
   - description: `Modify intensity and torso positions; avoid sudden high exertion and positions that alter chest compression or stress the device site.`

3. `respiratory_pulmonary`
   - label: `Respiratory / Pulmonary Condition`
   - description: `Favor gentle breath-led work; avoid breath-holding, rapid exertion, and positions that compress the chest or restrict airflow.`

4. `neurological_disorder`
   - label: `Neurological Disorder`
   - description: `Adjust for balance, coordination, and sensation changes; prioritize support, slower progressions, and clear cues.`

5. `metabolic_endocrine`
   - label: `Metabolic / Endocrine Condition`
   - description: `Manage intensity, pacing, and temperature sensitivity; avoid sudden exertion if energy, blood sugar, or hormonal balance is unstable.`

6. `autoimmune_inflammatory`
   - label: `Autoimmune / Inflammatory Condition`
   - description: `Plan around flare cycles; avoid high-load or prolonged joint compression during active inflammation and use gentler pacing.`

7. `oncology_treatment`
   - label: `Active Cancer / Cancer Treatment`
   - description: `Use symptom-guided movement; avoid high load, aggressive compression, and unsupported effort during active treatment or recovery.`

8. `gastrointestinal_pelvic`
   - label: `Gastrointestinal / Pelvic Floor Condition`
   - description: `Modify core compression and flexion; avoid strong intra-abdominal pressure and pelvic strain that may exacerbate symptoms.`

9. `mental_cognitive`
   - label: `Mental Health / Cognitive Condition`
   - description: `Use simple cues, extra support, and gentle pacing to help with concentration, stress response, and safe movement execution.`

10. `immune_infectious`
    - label: `Immune / Infectious Condition`
    - description: `Choose low-impact, adaptable movement; avoid pushing through fatigue, fever, or systemic illness and adjust for recovery capacity.`

## Prompt for adding these to the existing list

**Prompt:**

> Update `src/assets/data/safety-conditions.json` by adding the following new condition objects to the existing array. Preserve the current JSON structure, ordering, and style.
> 
> Add these condition entries:
> 
> - `cardiovascular_disease`: Cardiovascular Disease
> - `arrhythmia_cardiac_device`: Arrhythmia / Cardiac Device
> - `respiratory_pulmonary`: Respiratory / Pulmonary Condition
> - `neurological_disorder`: Neurological Disorder
> - `metabolic_endocrine`: Metabolic / Endocrine Condition
> - `autoimmune_inflammatory`: Autoimmune / Inflammatory Condition
> - `oncology_treatment`: Active Cancer / Cancer Treatment
> - `gastrointestinal_pelvic`: Gastrointestinal / Pelvic Floor Condition
> - `mental_cognitive`: Mental Health / Cognitive Condition
> - `immune_infectious`: Immune / Infectious Condition
> 
> Use the same label and description style as the existing entries, keep descriptions concise, and ensure the list remains parsable JSON.

## Optional follow-up prompt

**Prompt:**

> After adding the new categories, review the full `safety-conditions.json` list and suggest any further high-level medical or systemic categories that are still missing from a Pilates instructor screening perspective.
