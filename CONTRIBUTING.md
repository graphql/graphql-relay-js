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

Releases are published by the `Release` workflow, which builds the package and
publishes it to npm using [trusted publishing][], so no npm token is involved.
Pushing a `v*` tag is what starts it.

```sh
npm install
npm version patch # or minor or major
git push --follow-tags
```

That tags the release and triggers the workflow, which runs the test suite,
builds the package, publishes it to npm under the `next` dist-tag with
provenance, and creates a GitHub release.

Then test it by installing `graphql-relay@next` from npm...

All good? Promote it to `latest`:

```sh
npm dist-tags add graphql-relay@VERSION_NUMBER latest
```

Finally generate the CHANGELOG:

```sh
node resources/gen-changelog.js
```

The workflow can also be started manually from the Actions tab, which lets you
choose whether to publish under `next` or straight to `latest`. It refuses to
publish a version that is already on npm, so it is safe to re-run.

[trusted publishing]: https://docs.npmjs.com/trusted-publishers
