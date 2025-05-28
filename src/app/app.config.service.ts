import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { map } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    private settings: any;
    private http: HttpClient;

    constructor(private readonly httpHandler: HttpBackend) {
        this.http = new HttpClient(httpHandler);
    }

    init(endpoint: string): Promise<boolean> {
        console.log(`🔍 Attempting to load config from: ${endpoint}`);

        if (!endpoint) {
            console.error("Configuration URL is null or undefined!");
            return Promise.reject("Configuration file URL is missing.");
        }

        return new Promise<boolean>((resolve, reject) => {
            this.http.get(endpoint).pipe(map(result => result))
                .subscribe(value => {
                    if (!value) {
                        console.error("Config file returned empty or invalid response.");
                        reject("Invalid config file.");
                        return;
                    }
                    this.settings = this.decryptConfig(value);
                    console.log("✅ Configuration Loaded:", this.settings);
                    resolve(true);
                },
                (error) => {
                    console.error("Error loading configuration:", error);
                    reject(error);
                });
        });
    }

    getSettings(key?: string | Array<string>): any {
        if (!this.settings) {
            console.warn("⚠ Configuration not loaded yet.");
            return null;
        }

        if (!key || (Array.isArray(key) && !key[0])) {
            return this.settings;
        }

        if (!Array.isArray(key)) {
            key = key.split('.');
        }

        return key.reduce((acc: any, current: string) => acc && acc[current], this.settings);
    }

    private decryptConfig(encryptedConfig: any): any {
        if (!encryptedConfig || !encryptedConfig.data) {
            console.error("Encrypted configuration data is missing.");
            return {};
        }
    
        const passphrase = "e2729bbff7f9fcf47189688d4020cefd"; // 🔐 Replace with secure retrieval
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedConfig.data, passphrase);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            const config = JSON.parse(decrypted);
            console.log("🔍 Decrypted configuration:", config); // Add this line for debugging
            return config;
        } catch (error) {
            console.error("Error decrypting configuration:", error);
            return {};
        }
    }
    
}
