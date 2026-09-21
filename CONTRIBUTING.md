## Pull requests

**IMPORTANT**: Do not push directly to `main` - every change must go through a PR
otherwise changelog generation will fail.

Every PR must carry exactly one `PR: *` label before it is merged. Changelog
generation reads these labels and throws if a merged PR is missing one:

- `PR: breaking change 💥`
- `PR: feature 🚀`
- `PR: bug fix 🐞`
- `PR: docs 📝`
- `PR: polish 💅`
- `PR: internal 🏠`
- `PR: dependency 📦`

## Publishing

Releases are cut by the `Release` workflow. Merging to `main` is the only gate:
the workflow checks whether the version in `package.json` is already on npm and
publishes it if it is not. Ordinary merges are therefore a no-op, and a release
is just a merged version bump.

Publishing uses [trusted publishing][], so no npm token is involved. The workflow
builds the package, publishes it with provenance, creates the `vX.Y.Z` tag, and
opens a GitHub release.

To cut a release, open a PR that bumps the version and merge it:

```sh
git checkout -b release-VERSION_NUMBER
npm install
npm version VERSION_NUMBER --no-git-tag-version
git commit --all --message VERSION_NUMBER
```

Label the PR `PR: internal 🏠` and merge once CI is green. That is the whole
release - do not tag or run `npm publish` by hand.

A version containing a `-` is treated as a prerelease and published under the
`next` dist-tag instead of `latest`, so a release can be rehearsed with a version
like `0.11.1-rc.0`.

Release notes are generated from the `PR: *` labels by
`resources/gen-changelog.js` and attached to the GitHub release - there is no
`CHANGELOG.md` file. A merged PR missing its label fails the release before
anything reaches npm, so add the label and re-run.

If a publish fails partway through, re-run the workflow. It re-checks npm before
doing anything, so re-runs are safe.

[trusted publishing]: https://docs.npmjs.com/trusted-publishers
