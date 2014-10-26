#!/bin/bash

node app.js & (cd front && MONGO_URL=mongodb://localhost/nitpicker meteor)