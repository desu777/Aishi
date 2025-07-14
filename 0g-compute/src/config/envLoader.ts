import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

/**
 * Centralized environment variable loader with configurable paths
 * Supports external secure locations via ENV_FILE_PATH environment variable
 */
export class EnvLoader {
  private static isLoaded = false;
  private static loadedPath: string | null = null;

  /**
   * Load environment variables from external path or fallback to local .env
   * Priority:
   * 1. ENV_FILE_PATH environment variable (for production/secure locations)
   * 2. Local .env file (development fallback)
   */
  public static loadEnv(): void {
    if (this.isLoaded) {
      return;
    }

    const externalEnvPath = process.env.ENV_FILE_PATH;
    let envPath: string;
    let pathSource: string;

    if (externalEnvPath) {
      // Try external path first (production/secure location)
      envPath = path.resolve(externalEnvPath);
      pathSource = 'external';
    } else {
      // Fallback to local .env file
      envPath = path.resolve(process.cwd(), '.env');
      pathSource = 'local';
    }

    try {
      if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
        this.loadedPath = envPath;
        this.isLoaded = true;
        
        // Log only in test environment
        if (process.env.TEST_ENV === 'true') {
          console.log(`✅ Environment loaded from ${pathSource} path: ${envPath}`);
        }
      } else {
        // If external path doesn't exist, try local fallback
        if (pathSource === 'external') {
          const localPath = path.resolve(process.cwd(), '.env');
          if (fs.existsSync(localPath)) {
            dotenv.config({ path: localPath });
            this.loadedPath = localPath;
            this.isLoaded = true;
            
            if (process.env.TEST_ENV === 'true') {
              console.log(`⚠️  External env path not found, using local fallback: ${localPath}`);
            }
          } else {
            console.warn(`❌ No environment file found at ${envPath} or local fallback`);
          }
        } else {
          console.warn(`❌ Environment file not found at ${envPath}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error loading environment file from ${envPath}:`, error);
      
      // Try local fallback if external path failed
      if (pathSource === 'external') {
        try {
          const localPath = path.resolve(process.cwd(), '.env');
          if (fs.existsSync(localPath)) {
            dotenv.config({ path: localPath });
            this.loadedPath = localPath;
            this.isLoaded = true;
            
            if (process.env.TEST_ENV === 'true') {
              console.log(`✅ Fallback to local env: ${localPath}`);
            }
          }
        } catch (fallbackError) {
          console.error('❌ Fallback to local .env also failed:', fallbackError);
        }
      }
    }
  }

  /**
   * Get the path of the loaded environment file
   */
  public static getLoadedPath(): string | null {
    return this.loadedPath;
  }

  /**
   * Check if environment has been loaded
   */
  public static isEnvironmentLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Force reload environment (useful for testing)
   */
  public static forceReload(): void {
    this.isLoaded = false;
    this.loadedPath = null;
    this.loadEnv();
  }
}

// Auto-load environment when module is imported
EnvLoader.loadEnv();