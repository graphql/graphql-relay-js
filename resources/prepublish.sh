# Because of a long-running npm issue (https://github.com/npm/npm/issues/3059)
# prepublish runs after `npm install` and `npm pack`.
# In order to only run prepublish before `npm publish`, we have to check argv.
if node -e "process.exit(($npm_config_argv).original.length > 0 && ($npm_config_argv).original[0].indexOf('pu') === 0)"; then
  exit 0;
fi

npm test && npm run build
