#!/bin/zsh

cp hooks/pre-commit .git/hooks
cp hooks/pre-push .git/hooks

chmod u+x .git/hooks/pre-commit
chmod u+x .git/hooks/pre-push
