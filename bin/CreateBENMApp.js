#!/usr/bin/env node
const util = require( 'util' );
const path = require( 'path' );
const fs = require( 'fs' );
const { execSync } = require( 'child_process' );

// Utility functions
const exec = util.promisify( require( 'child_process' ).exec );
async function runCmd ( command ) {
  try
  {
    const { stdout, stderr } = await exec( command );
    console.log( stdout );
    console.log( stderr );
  } catch ( error )
  {
    console.log( error );
  };
}
// check yarn in installed or not in system
async function hasYarn () {
  try
  {
    await execSync( 'yarnpkg --version', { stdio: 'ignore' } );
    return true;
  } catch ( error )
  {
    return false;
  };
}

// Validate arguments
if ( process.argv.length < 3 )
{
  console.log( 'Please specify the target project directory.' );
  console.log( 'For example:' );
  console.log( '    npx create-benm-app my-app' );
  console.log( '    OR' );
  console.log( '    npm init benm-app my-app' );
  process.exit( 1 );
}

// Define constants
const ownPath = process.cwd();
const folderName = process.argv[2];
const appPath = path.join( ownPath, folderName );
const repo = 'https://github.com/umagol/BENM.git';

// Check if directory already exists
try
{
  fs.mkdirSync( appPath );
} catch ( err )
{
  if ( err.code === 'EEXIST' )
  {
    console.log( 'Directory already exists. Please choose another name for the project.' );
  } else
  {
    console.log( err );
  }
  process.exit( 1 );
}

async function setup () {
  try
  {
    // Clone repo
    console.log( `Downloading files from repo ${ repo }` );
    await runCmd( `git clone --depth 1 ${ repo } ${ folderName }` );
    console.log( 'Cloned successfully.' );
    console.log( '' );

    // Change directory
    process.chdir( appPath );

    // Install dependencies
    const useYarn = await hasYarn();
    console.log( 'Installing dependencies...' );
      try {
        await runCmd( 'npm install' );
      } catch ( error ) {
        console.log( error );
      }
    console.log( 'Dependencies installed successfully.' );
    console.log();

    // Copy envornment variables
    fs.copyFileSync( path.join( appPath, '.env.example' ), path.join( appPath, '.env' ) );
    console.log( 'Environment files copied.' );
    fs.unlinkSync( path.join( appPath, '.env.example' ) );
    // Delete .git folder
    await runCmd( 'npx rimraf ./.git' );

    // Remove extra files
    fs.unlinkSync(path.join(appPath, 'CHANGELOG.md'));
    fs.unlinkSync(path.join(appPath, 'CODE_OF_CONDUCT.md'));
    fs.unlinkSync(path.join(appPath, 'CONTRIBUTING.md'));
    fs.unlinkSync(path.join(appPath, 'LICENSE'));
    fs.unlinkSync( path.join( appPath, 'bin', 'CreateBENMApp.js' ) );
    fs.rmdirSync(path.join(appPath, 'docs'), { recursive: true, force: true });
    fs.rmdirSync(path.join(appPath, '.github'), { recursive: true, force: true });

    // create Package 
    await runCmd( 'npm pkg delete version_short, license, homepage, bin, main, repository, bugs, keywords' );

    if ( !useYarn )
    {
      fs.unlinkSync( path.join( appPath, 'yarn.lock' ) );
    }

    console.log( `your App is successfully created 🚀🚀` );
    console.log();

    console.log( 'We suggest that you start by typing:' );

    console.log( '\x1b[36m%s\x1b[0m', `    cd ${ folderName }` );
    console.log( `            go to your Project  `);
    console.log();

    console.log( '\x1b[36m%s\x1b[0m', '    npm run dev' );
    console.log( `            Starts the test runner. `);
    console.log();

    console.log( '\x1b[36m%s\x1b[0m', '    npm test' );
    console.log( `            Starts the development server `);
    console.log();
    
    console.log( 'Enjoy your production-ready Node.js app, which already supports a large number of ready-made features!' );
    console.log( 'Check README.md for more info.' );
    console.log(' HappY Hacking  🚀🚀');
  } catch ( error )
  {
    console.log( error );
  }
}

setup();
