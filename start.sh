#!/bin/bash

node app.js & (cd front && MONGO_URL=mongodb://localhost/my_database meteor)