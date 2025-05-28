import { InjectionToken, NgModule, APP_INITIALIZER } from '@angular/core';
import {
    IPublicClientApplication, PublicClientApplication, LogLevel
} from '@azure/msal-browser';
import {
    MsalGuard, MsalInterceptor, MsalBroadcastService,
    MsalInterceptorConfiguration, MsalModule, MsalService,
    MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG,
    MsalGuardConfiguration
} from '@azure/msal-angular';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ConfigService } from './app.config.service';

const AUTH_CONFIG_URL_TOKEN = new InjectionToken<string>('AUTH_CONFIG_URL');

/**
 * Ensures the configuration is loaded before MSAL initializes.
 */
export function initializerFactory(configService: ConfigService, configUrl: string): () => Promise<void> {
    return () => configService.init(configUrl).then(() => {
        console.log("✅ Configuration Loaded Successfully.");
    }).catch(error => {
        console.error("Error loading configuration:", error);
        return Promise.reject(error);
    });
}

/**
 * Logger for MSAL
 */
export function loggerCallback(logLevel: LogLevel, message: string): void {
    console.log(`[MSAL] ${message}`);
}

/**
 * Creates the MSAL PublicClientApplication instance.
 */
export function MSALInstanceFactory(configService: ConfigService): IPublicClientApplication {
    const msalConfig = configService.getSettings('msal');
    console.log("DEBUG: msalConfig from configuration:", msalConfig);
    
    if (!msalConfig) {
        throw new Error("MSAL configuration is missing entirely. Check your configuration file and decryption.");
    }
    if (!msalConfig.auth || !msalConfig.cache) {
        console.error("DEBUG: Received MSAL configuration:", msalConfig);
        throw new Error("MSAL Configuration is missing required fields (auth or cache).");
    }
    return new PublicClientApplication({
        auth: msalConfig.auth,
        cache: msalConfig.cache,
        system: {
            loggerOptions: {
                loggerCallback,
                logLevel: LogLevel.Info,
                piiLoggingEnabled: false
            }
        }
    });
}


/**
 * MSAL Interceptor Configuration.
 */
export function MSALInterceptorConfigFactory(configService: ConfigService): MsalInterceptorConfiguration {
    const interceptorConfig = configService.getSettings('interceptor');

    if (!interceptorConfig?.protectedResourceMap || !interceptorConfig?.interactionType) {
        throw new Error("MSAL Interceptor Configuration is missing required fields.");
    }

    return {
        interactionType: interceptorConfig.interactionType,
        protectedResourceMap: new Map<string, Array<string>>(interceptorConfig.protectedResourceMap)
    };
}

/**
 * MSAL Guard Configuration.
 */
export function MSALGuardConfigFactory(configService: ConfigService): MsalGuardConfiguration {
    const guardConfig = configService.getSettings('guard');

    if (!guardConfig?.interactionType || !guardConfig?.authRequest) {
        throw new Error("MSAL Guard Configuration is missing required fields.");
    }

    return {
        interactionType: guardConfig.interactionType,
        authRequest: guardConfig.authRequest,
        loginFailedRoute: guardConfig.loginFailedRoute
    };
}

@NgModule({
    imports: [MsalModule],
    providers: []
})
export class MsalConfigDynamicModule {
    static forRoot(configFile: string) {
        return {
            ngModule: MsalConfigDynamicModule,
            providers: [
                ConfigService,
                { provide: AUTH_CONFIG_URL_TOKEN, useValue: configFile },
                {
                    provide: APP_INITIALIZER,
                    useFactory: initializerFactory,
                    deps: [ConfigService, AUTH_CONFIG_URL_TOKEN],
                    multi: true
                },
                {
                    provide: MSAL_INSTANCE,
                    useFactory: MSALInstanceFactory,
                    deps: [ConfigService]
                },
                {
                    provide: MSAL_GUARD_CONFIG,
                    useFactory: MSALGuardConfigFactory,
                    deps: [ConfigService]
                },
                {
                    provide: MSAL_INTERCEPTOR_CONFIG,
                    useFactory: MSALInterceptorConfigFactory,
                    deps: [ConfigService]
                },
                MsalService,
                MsalGuard,
                MsalBroadcastService,
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: MsalInterceptor,
                    multi: true
                }
            ]
        };
    }
}
