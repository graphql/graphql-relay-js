## Publishing

This package uses a custom publish flow.

```sh
npm install
npm version patch # or minor or major
git push && git push --tags
npm run build
cd npmDist
npm publish --tag=next
```

Then test it by installing `graphql-relay@next` from npm...

All good? Publish:

```sh
npm dist-tags add graphql-relay@VERSION_NUMBER latest
```
