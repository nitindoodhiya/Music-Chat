var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://127.0.0.1:27017/euphonydb';
var path=require('path');
var multer = require('multer');
  