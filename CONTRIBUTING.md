## Publishing

This package uses a custom publish flow.

**IMPORTANT**: Do not push directly to `main` - every change must go through a PR
otherwise changelog generation will fail.

```sh
npm install
npm version patch # or minor or major
git push --follow-tags
npm run build
cd npmDist
npm publish --tag=next
```

Then test it by installing `graphql-relay@next` from npm...

All good? Publish:

```sh
npm dist-tags add graphql-relay@VERSION_NUMBER latest
```

Finally generate the CHANGELOG:

```sh
node resources/gen-changelog.js
```
