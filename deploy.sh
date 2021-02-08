yarn build --base ./
git subtree push --prefix dist origin published
touch dist/.nojekyll
