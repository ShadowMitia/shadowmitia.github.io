yarn build --base ./
touch dist/.nojekyll
git subtree push --prefix dist origin published
