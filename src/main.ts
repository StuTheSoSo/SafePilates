import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(IonicModule.forRoot({
      scrollAssist: false,
      scrollPadding: false
    })),
    importProvidersFrom(TranslateModule.forRoot({ defaultLanguage: 'en' })),
    ...provideTranslateHttpLoader(),
    provideAnimations(),
    provideHttpClient(),
    provideRouter(routes)
  ]
}).catch(err => console.error(err));
