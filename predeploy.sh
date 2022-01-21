#!/bin/bash

echo "Minifying HTML..."
cd pages
#minify html
for file in ./*; do
    npx html-minifier --collapse-whitespace --remove-comments --remove-redundant-attributes --remove-script-type-attributes $file -o a
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
for file in ./*.json; do
    npm run json -- "./public/db/$file"
done
cd ../lang
for file in ./*.json; do
    npm run json -- "./public/lang/$file"
done
echo "done"

#echo "Minifying CSS"
#cd ../css
#minify css
#for file in ./*.css; do
#    npx postcss $file > a
#    mv a $file
#done
#echo "done"

mv ../../LICENSE ../
