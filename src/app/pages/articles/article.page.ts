import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

const ARTICLES: Record<string, { title: string; summary: string; sections: Array<[string, string]>; cue: string }> = {
  principles: { title: 'The Pilates principles', summary: 'Use breath, concentration, control, centering, precision, and flow as teaching lenses.', sections: [['Start with intention', 'A clear purpose helps you choose movements that belong together and keeps the class from becoming a list of exercises.'], ['Teach the connection', 'Name the relationship between breath, alignment, and effort so clients can make useful adjustments without losing the rhythm.']], cue: 'Choose one principle to emphasize in the next flow and let it guide your cues.' },
  breathing: { title: 'Breathing in motion', summary: 'Breath can organize timing, effort, and attention throughout a class.', sections: [['Make it specific', 'Pair the breath with an action or sensation instead of repeating a generic reminder.'], ['Leave room for choice', 'Breathing patterns should support the client. Offer a comfortable alternative when a prescribed pattern creates tension.']], cue: 'Add a breath cue to each major phase of the flow.' },
  alignment: { title: 'Alignment that serves movement', summary: 'Alignment is a responsive tool for comfort, efficiency, and awareness.', sections: [['Observe before correcting', 'Look for the client\'s movement strategy and choose the smallest cue that helps them find more space or control.'], ['Connect alignment to purpose', 'Explain what the change supports so the client can feel the difference rather than chase a shape.']], cue: 'Use one sensation-based alignment cue before adding a positional correction.' },
};

@Component({ selector: 'app-article', standalone: true, imports: [CommonModule, IonicModule, RouterModule], templateUrl: './article.page.html', styleUrls: ['./article.page.scss'] })
export class ArticlePage {
  private readonly route = inject(ActivatedRoute);
  readonly article = ARTICLES[this.route.snapshot.paramMap.get('slug') ?? 'principles'] ?? ARTICLES.principles;
  readonly resources = [{ name: 'NHS exercise guidance', url: 'https://www.nhs.uk/live-well/exercise/' }, { name: 'Pilates Foundation', url: 'https://www.pilatesfoundation.com/pilates/' }, { name: 'NIH relaxation techniques', url: 'https://www.nccih.nih.gov/health/relaxation-techniques-what-you-need-to-know' }];
}