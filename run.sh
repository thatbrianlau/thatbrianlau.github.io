#!/bin/bash

if test "$1" = "build"; then
  bundle exec jekyll build --destination=dist
else
  bundle exec jekyll serve --watch --host=127.0.0.1 --port=8080
fi
