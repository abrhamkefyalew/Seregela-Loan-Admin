// Import the Next.js configuration type to provide strong typing support
import type { NextConfig } from "next";

// Define the Next.js configuration
const nextConfig: NextConfig = {

  // --------------------------------------------
  // ESLint Configuration:
  // Prevents the build from failing due to ESLint errors.
  // This is useful for CI/CD or Docker builds where warnings shouldn't block builds.
  // Use with caution — errors will be ignored silently.
  // --------------------------------------------
  eslint: {
    ignoreDuringBuilds: true, // Ignores lint errors during `next build`
  },



  
  // Remove "N"  = >  Disable Next.js DevTools (REMOVEs the "N" icon entirely) from the left bottom of the screen
  //                  THE below codes each try to Disable Next.js DevTools (i.e. Try to REMOVE the "N" icon entirely) 
  //
  // --------------------------------------------
  // Dev Indicators Configuration:
  // Hides the "N" loading icon (bottom-left) shown during development.
  // The icon indicates build activity but is optional UX.
  // This setting only affects `npm run dev`, not production.
  // --------------------------------------------
  // devIndicators: {
  //   buildActivity: false, // Hides the spinning "N" icon in dev mode
  // },
  //  
  //
  /////////////////////////// Disable DevTools UI Overlay (REMOVEs the 'N' icon) from the left bottom of the screen - - - - - - STEP 1 - - - - - - - - - [ - WORKING - ] - [ - USED - ] -   ///////////////////////////////////////////////
  devIndicators: false, 
  /////////////////////////// Disable DevTools UI Overlay (REMOVEs the 'N' icon) from the left bottom of the screen - - - - - - end STEP 1 - - - - - - - - - [ - WORKING - ] - [ - USED - ] -   ///////////////////////////////////////////////
  //
  //
  // devtools: {
  //   enabled: false, // Disable Next.js DevTools (removes the "N" icon entirely)
  // },
  //
  //
  //
  //
  //
  // NOT working // have syntax Errors
  // experimental: {
  //   nextDevTools: {
  //     enabled: false, // DISABLE the "N" DevTools overlay
  //   },
  // },
























  // --------------------------------------------
  // Webpack Customization:
  // Enables polling for file changes, useful inside Docker or VMs
  // where file watching with inotify may not work reliably.
  // Also adds a delay (aggregateTimeout) to avoid too many rebuilds.
  // --------------------------------------------
  webpack: (config: any) => {






    /////////////////////////// Disable DevTools UI Overlay (REMOVEs the 'N' icon) from the left bottom of the screen - - - - - - STEP 2 - - - - - - - - - [ - WORKING - ] - [ - USED - ] -   ///////////////////////////////////////////////
    //
    //
    // 2.1.
    //
    // Disables the "N" DevTools UI overlay of the ERROR shower [this Removes the DevTool icon that shows up only when ERROR happens]
    // Disable the "N" DevTools UI overlay (error overlay)
    if (!config.plugins) {
      config.plugins = [];
    }

    // Add a custom plugin to suppress React Dev Overlay in Next.js
    config.plugins.push(
      new (require('webpack').DefinePlugin)({
        'process.env.REACT_DEV_OVERLAY': JSON.stringify('false'), // Suppress React's error overlay
      })
    );
    //
    // // CHECK if it WORKED - refresh your browser

    // 2.2. INSTALL Webpack  -   -   -   - (if it does NOT work)
    //
    //            // first check if Webpack is Already installed
    //
    //                     -> INSTALL Webpack
    //                               //
    //                               = > npm install webpack --save-dev
    //
    //




    // 2.3. CHECK if Webpack is installed  -   -   -   - (if it does NOT work)
    //  
    //                2.3.1. 
    //                        - command
    //                                  = > npm ls webpack
    //                                                // execute on project root folder
    //                                                        IF it is Installed
    //                                                            //
    //                                                            YOU will get the following
    // //                                                                //
    //                                                                   PS D:\_important\_Projects\Webs\JS\NextJS\TypeScript-Abrhams\1\seregela-dashboard> npm ls webpack
    //                                                                   seregela-dashboard@0.1.0 D:\_important\_Projects\Webs\JS\NextJS\TypeScript-Abrhams\1\seregela-dashboard
    //                                                                   └─┬ webpack@5.100.0
    //                                                                     └─┬ terser-webpack-plugin@5.3.14
    //                                                                       └── webpack@5.100.0 deduped
    //
    //                                                                   PS D:\_important\_Projects\Webs\JS\NextJS\TypeScript-Abrhams\1\seregela-dashboard> 
    // //
    //                2.3.2.
    //                        - package.json
    //                                    = > "webpack": "^5.100.0"
    //                                                      // you will see this line added in 'package.json' if after WEBPACK is installed successfully
    //                                
    //                        
    // 
    // // CHECK if it WORKED - refresh your browser





    // 2.4. -> RESTART your server  -   -   -   - (if it does NOT work)
    //                     
    //                                     i.e.
    //                                        A. IF you do NOT have DOCKER
    //                                               = > npm run dev   - or -   npx run dev
    //                                               = > npx next dev  - or -   npx next dev -p $PORT      - or -     npx next dev -p <$port-number>
    //
    //                                                          - or -      
    //
    //                                        B. IF you have DOCKER
    //                                              restart with Docker with the appropriate command  
    //                                               //
    //                                               = > docker compose up --build
    //                                                    //
    //                                                    // or if it does NOT work  = = = restart, remove and recreate, build with NO CACHE, based on your need
    //        
    //
    //


    // 2.5.  > in your code do NOT throw Error
    //              //
    //              do NOT = throw new Error('Fetch failed');
    //
    //       > in your code do NOT use console.error
    //              // 
    //              only use 
    //                     - console.warn()      
    //                     - console.log()
    //
    //
    /////////////////////////// end Disable DevTools UI Overlay (REMOVEs the 'N' icon) from the left bottom of the screen - - - - - - STEP 2 - - - - - - - - - [ - WORKING - ] - [ - USED - ] -   ///////////////////////////////////////////////







    config.watchOptions = {
      poll: 1000, // Check for file changes every 1000ms (1 second)
      aggregateTimeout: 300, // ⏱ Wait 300ms after the last change before rebuilding
    };
    return config;
  },
};









// Export the configuration so Next.js can use it
export default nextConfig;
