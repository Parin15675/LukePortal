import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { IPublicClientApplication, PublicClientApplication, InteractionType } from '@azure/msal-browser';
import {
    MsalGuard, MsalBroadcastService, MsalService,
    MSAL_GUARD_CONFIG, MSAL_INSTANCE, MsalGuardConfiguration, MsalRedirectComponent
} from '@azure/msal-angular';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NavigationComponent } from './core/navigation/navigation.component';
import { FooterComponent } from './core/footer/footer.component';
import { MaterialModule } from './shared/material.module';
import { MsalConfigDynamicModule } from './msal-config-dynamic.module';
import { PowerBIEmbedModule } from 'powerbi-client-angular';
import { BreadcrumbComponent } from './dashboard/components/breadcrumb/breadcrumb.component';
import { ConfigService } from './app.config.service';

/**
 * Loads the configuration (from the encrypted file) before Angular bootstraps.
 */
export function initializeApp(configService: ConfigService) {
    return () => configService.init('assets/env/configuration.enc.json');
}

/**
 * Default MSAL Guard configuration.
 */
export function MSALGuardConfigFactory(): MsalGuardConfiguration {
    return {
        interactionType: InteractionType.Redirect,
        authRequest: {
            scopes: []
        }
    };
}

@NgModule({
    declarations: [
        AppComponent,
        NavigationComponent,
        FooterComponent,
        BreadcrumbComponent
    ],
    bootstrap: [AppComponent, MsalRedirectComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        MaterialModule,
        MatToolbarModule,
        MatIconModule,
        FormsModule,
        NgbModule,
        PowerBIEmbedModule,
        ReactiveFormsModule,
        // Use the dynamic MSAL module which also depends on our configuration.
        MsalConfigDynamicModule.forRoot('assets/env/configuration.enc.json')
    ],
    providers: [
        ConfigService,
        {
            provide: APP_INITIALIZER,
            useFactory: initializeApp,
            deps: [ConfigService],
            multi: true
        },
        {
            provide: MSAL_GUARD_CONFIG,
            useFactory: MSALGuardConfigFactory
        },
        MsalService,
        MsalGuard,
        MsalBroadcastService,
        provideHttpClient(withInterceptorsFromDi())
    ]
})
export class AppModule { }
