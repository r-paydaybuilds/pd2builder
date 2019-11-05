#!/bin/bash

echo "Minifying HTML..."
cd pages
#minify html
for file in ./*; do
    npx html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype $file -o a
    mv a $file
done
mv ./* ../public/ #move all pages
echo "done"

echo "Minifying JS..."
cd ../public/js
#minify js
for file in ./*.js; do
    npx terser -m module=true -c ecma=8,module=true -- $file > a
    mv a $file
done
echo "done"
echo "Minifying JSON"
cd ../db
curDir = pwd
for file in ./*.json; do
    npm run json -- "$curDir/$file"
done
cd ../lang
curDir = pwd
for file in ./*.json; do
    npm run json -- "$curDir/$file"
done
echo "done"

echo "Minifying CSS"
cd ../css
#minify css
for file in ./*.css; do
    npx postcss $file > a
    mv a $file
done
echo "done"