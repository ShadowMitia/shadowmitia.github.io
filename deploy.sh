yarn build --base ./
cp index.html dist/
touch dist/.nojekyll
git subtree push --prefix dist origin published
