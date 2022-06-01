#!/bin/bash
shopt -s globstar

contains () { 
    local array="$1[@]"
    local seeking=$2
    local in=1
    for element in "${!array}"; do
        if [[ $element == "$seeking" ]]; then
            in=0
            break
        fi
    done
    return $in
}
function join_by { local d=$1; shift; echo -n "[\"$1"; shift; printf "%s" "${@/#/$d}\"]"; }

cd pages
pages=(/ *)

cd ../public
public=(**)
publicFolders=(**/)
publicFolders=(${publicFolders[@]/%?/})

for f in "${public[@]}"; do
    contains publicFolders $f || pages+=($f)
done

join_by '","' "${pages[@]}"
