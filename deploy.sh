yarn build --base ./
touch dist/.nojekyll
find dist -name "*.jpg" -type f -delete
find dist -name "*.png" -type f -delete
git subtree push --prefix dist origin published
