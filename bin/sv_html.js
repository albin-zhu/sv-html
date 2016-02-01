#!/usr/bin/env node

var i = require("../index")
var url = process.argv[2];
var dir = process.argv[3];
i.sync(url, dir);
