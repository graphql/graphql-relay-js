'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const babel = require('@babel/core');

const {
  writeGeneratedFile,
  readdirRecursive,
  showDirStats,
} = require('./utils');

if (require.main === module) {
  fs.rmSync('./npmDist', { recursive: true, force: true });
  fs.mkdirSync('./npmDist');

  const packageJSON = buildPackageJSON();

  const srcFiles = readdirRecursive('./src', { ignoreDir: /^__.*__$/ });
  for (const filepath of srcFiles) {
    const srcPath = path.join('./src', filepath);
    const destPath = path.join('./npmDist', filepath);

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    if (filepath.endsWith('.js')) {
      const flowBody = '// @flow strict\n' + fs.readFileSync(srcPath, 'utf-8');
      writeGeneratedFile(destPath + '.flow', flowBody);

      const cjs = babelBuild(srcPath, { envName: 'cjs' });
      writeGeneratedFile(destPath, cjs);
    } else if (filepath.endsWith('.d.ts')) {
      fs.copyFileSync(srcPath, destPath);
    }
  }

  fs.copyFileSync('./LICENSE', './npmDist/LICENSE');
  fs.copyFileSync('./README.md', './npmDist/README.md');

  // Should be done as the last step so only valid packages can be published
  writeGeneratedFile('./npmDist/package.json', JSON.stringify(packageJSON));

  showDirStats('./npmDist');
}

function babelBuild(srcPath, options) {
  const { code } = babel.transformFileSync(srcPath, {
    babelrc: false,
    configFile: './.babelrc-npm.json',
    ...options,
  });
  return code + '\n';
}

function buildPackageJSON() {
  const packageJSON = JSON.parse(
    fs.readFileSync(require.resolve('../package.json'), 'utf-8'),
  );

  delete packageJSON.private;
  delete packageJSON.scripts;
  delete packageJSON.devDependencies;

  // TODO: move to integration tests
  const publishTag = packageJSON.publishConfig?.tag;
  assert(publishTag != null, 'Should have packageJSON.publishConfig defined!');

  const { version } = packageJSON;
  const versionMatch = /^\d+\.\d+\.\d+-?(?<preReleaseTag>.*)?$/.exec(version);
  if (!versionMatch) {
    throw new Error('Version does not match semver spec: ' + version);
  }

  const { preReleaseTag } = versionMatch.groups;

  if (preReleaseTag != null) {
    const splittedTag = preReleaseTag.split('.');
    // Note: `experimental-*` take precedence over `alpha`, `beta` or `rc`.
    const versionTag = splittedTag[2] ?? splittedTag[0];
    assert(
      ['alpha', 'beta', 'rc'].includes(versionTag) ||
        versionTag.startsWith('experimental-'),
      `"${versionTag}" tag is not supported.`,
    );
    assert.equal(
      versionTag,
      publishTag,
      'Publish tag and version tag should match!',
    );
  }

  return packageJSON;
}
