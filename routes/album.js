var mongoose=require('mongoose');
var express = require('express');
var router = express.Router();

var formidable = require('formidable');

mongoose.connect('mongodb://127.0.0.1/euphonydb');
var conn = mongoose.connection;
var mongodb=require('mongodb');

var Grid = require('gridfs-stream');

var fs = require('fs');

Grid.mongo=mongoose.mongo;

conn.once('open',() => {
    gfs=Grid(conn.db);
    console.log('- Connection successful -');
  });

router.get('/',function(req,res){
    
    var MongoClient=mongodb.MongoClient;
    var MongoURI='mongodb://127.0.0.1:27017/euphonydb';  
    MongoClient.connect(MongoURI,{ useNewUrlParser: true },function(err,db){
      if(err){
        console.log('Unable to connect to the server',err);
      }else{
        console.log("Connection established");
        var dbo = db.db("euphonydb");
        var collection=dbo.collection('Albums');
        var id=req.params.item;
        console.log(id);
        collection.find({userid:id}).toArray(function(err,result){
            if(err){
              res.send(err);
            }else if(result.length){
              res.render('albumlist',{
                  "albumlist":result
              });
            }else{
              res.send('No documents found');
            }
            db.close();
        });
      }
    });
  });


  router.get('/:id/upload', function(req, res){
    console.log('two try');
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="file" method="post" enctype="multipart/form-data">');
    res.write('<input type="text" placeholder="Song Name" name="songname"<br>');
    res.write('<input type="text" placeholder=" Artist Name" name="artistname"<br>');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
  });

  router.post('/:id/file',function(req,res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.path;
      var writestream = gfs.createWriteStream ({
        filename: 'tryhh.mp4'
      });
    fs.createReadStream(oldpath).pipe(writestream);
    writestream.on('close', function (file) {     
        console.log(file.filename + 'Written to db');
    });
    
      // var newpath = 'C:/Users/HP/' + files.filetoupload.name;
      // fs.rename(oldpath, newpath, function (err) {
      //   if (err) 
      //   throw err
      //   else{
      //       var writestream = gfs.createWriteStream ({
      //           filename: 'try.mp4'
      //         });
      //       fs.createReadStream(newpath).pipe(writestream);
      //       writestream.on('close', function (file) {     
      //           console.log(file.filename + 'Written to db');
      //       });
      //       fs.unlink(newpath, (err) => {
      //         if (err) {
      //             console.log("failed to delete local image:"+err);
      //         } else {
      //             console.log('successfully deleted local image');                                
      //         }
      //       });
      //       res.redirect('..'); 
      //   }
      // });
      res.redirect('..');
    });
  });  
  
  router.get('/:id',function(req,res){
    var p=req.params.id;
    p = p+ '/upload';
    console.log(p);
    res.redirect(p);
  });
  
  module.exports=router;