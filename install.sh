#!/bin/bash
git submodule init
git submodule update
yarn install

mkdir -p certs
mkdir -p scale/data
mkdir -p scale/certs
