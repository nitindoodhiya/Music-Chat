var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://127.0.0.1:27017/euphonydb';
var path=require('path');
var multer = require('multer');
var URL = require('url');
var mongoose=require('mongoose');
var path = require('path');
var mongodb=require('mongodb');
var Grid = require('gridfs-stream');
var fs = require('fs');
const {ObjectId} = require('mongodb');
mongoose.connect('mongodb://127.0.0.1/euphonydb');

var conn = mongoose.connection;
Grid.mongo=mongoose.mongo;
var loggedin= false;
let gfs;
var USERID;
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',{item:['title','b','c']});
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

router.get('/logout',(req,res)=>{
  loggedin=false;
  res.redirect('/login');
});
var mysonglist;
router.get('/:id/listsongs',function(req,res) {
  var id = req.params.id;
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err; 
  
    var dbo = db.db('euphonydb');
    dbo.collection("Songs").find({UserId : id}).toArray((err,result)=>{
      console.log(result);
      res.render('listsongs',{item:result,userid:USERID});
    });
    db.close();
  });
});

// router.post('/:id/listsongs', function(req, res, next) {
//   MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
//     if (err) 
//           throw err;
//     else {
      
//         var dbo = db.db("euphonydb");        
//         var file = req.body.audiofile;
//         var item = {
//           SongName: req.body.SongName,
//             Artist: req.body.Artist,
//             url:  './upload/'+Date.now()+file
//           };
      
//         if(path.extname(file)==='.mp3'){
            
//             dbo.collection("Songs").insertOne(item,function(err,res){
//               if (err) throw err;
          
//    //           console.log("1 document inserted");
//             });
//       }
//       else{
//         console.log('not a mp3'); 
//         location.reload();
//         alert('not an mp3')  
//       }

//     }
//     db.close();
//   });
// });


router.get('/:id/updatesong',function(req,res){
  res.render('updatesong');
});


router.post('/:id/updatesong',function(req,res){
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err; 
  
    var dbo = db.db('euphonydb');
    dbo.collection("Users").findOne({UserName:'Nitin'},function(err,result){
      if(err) throw  err;
      var SongName = req.body.SongName;
      var NewName = req.body.NewName;
      var arr =result.UserSongs;
      for(var i=0 ; i<arr.length ; i++){
        if(result.UserSongs[i].Sname===SongName)
           result.UserSongs[i].Sname=NewName;
      }
    });
    db.close();
  });
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err; 
  
    var dbo = db.db('euphonydb');
    dbo.collection("Users").findOne({UserName:'Nitin'},function(err,result){
      if(err) throw  err;
      mysonglist =result.UserSongs;
     // console.log(mysonglist);
      db.close();
      res.render('listsongs',{item:mysonglist,userid:USERID});
    });
  });
});

router.get('/:id/showalbums',(req,res)=>{
  if(loggedin===false)
    res.redirect('/login');
  var user_id=req.params.id
  var MongoClient=mongodb.MongoClient;
    var MongoURI='mongodb://127.0.0.1:27017/euphonydb';  
    MongoClient.connect(MongoURI,{ useNewUrlParser: true },function(err,db){
      if(err){
        console.log('Unable to connect to the server',err);
      }else{
        console.log("Connection established");
        var dbo = db.db("euphonydb");
        var collection=dbo.collection('Albums');
        collection.find({userid:user_id}).toArray(function(err,result){
            if(err){
              res.send(err);
            }else {
  //            console.log(result);
              res.render('showalbums',{albumlist:result,usersid:user_id,userid:USERID});
            
            }
            db.close();
        });
      }
    });
  
});
function getUsernamefromid(sid){
  //console.log('id is:'+sid);
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    var dbo = db.db('euphonydb');
    dbo.collection('users').find({User : "nitindoodhiya1@gmail.com"},(err,result)=>{

      if(err)
        throw err;
      else{
        //console.log('result is:' + result);
        return result;
      }
    });
  });
}
router.post('/:id/createalbum',(req,res)=>{
  if(loggedin===false)
    res.redirect('/login');
  var albumname =req.body.AlbumName;
  var id = req.params.id;
  console.log(id);
  var User = null;
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    var dbo = db.db('euphonydb');
    dbo.collection('users').findOne({_id : ObjectId(id)},(err,result)=>{
      if(err)
        throw err;
      else if(result==null){
        console.log('result is:');
        return null;
      }
      else{   
        console.log('in get username '+ result.User); 
        User = result.User;
      } 
      console.log('User name is '+User);
      var newA={albumname:albumname,userid:id,user:User};
      dbo.collection('Albums').insertOne(newA,(err,res)=>{
        if(err)
          throw err;
        else
          console.log('insertion successful');
      });
      db.close();
    });
  res.redirect('back');
  });
});

conn.once('open',() => {
  gfs=Grid(conn.db);
  console.log('- Connection successful -');
});

router.get('/:id/thelist',function(req,res){
  if(loggedin===false)
    res.redirect('/login');
  var MongoClient=mongodb.MongoClient;
  
  var MongoURI='mongodb://127.0.0.1:27017/euphonydb';

  MongoClient.connect(MongoURI,{ useNewUrlParser: true },function(err,db){
    if(err){
      console.log('Unable to connect to the server',err);
    }else{
      console.log("Connection established");
      var dbo = db.db("euphonydb");
      var collection=dbo.collection('users');
      
      collection.find({}).toArray(function(err,result){
          if(err){
            res.send(err);
          }else if(result.length){
            res.render('studentlist',{
                "studentlist":result
            });
          }else{
            res.send('No documents found');
          }
          db.close();
      });
    }
  });
});
router.get('/login',function(req,res){
  res.render('login',{title:'Login'});
});
router.get('/:id',function(req,res){
  if(loggedin===false)
    res.redirect('/login');
  
  res.render('home',{userid:USERID});
});

router.post('/Euphonylogin',function(req,res){
  var MongoClient=mongodb.MongoClient;
  var url='mongodb://127.0.0.1:27017/euphonydb';
  MongoClient.connect(url,{ useNewUrlParser: true },function(err,db){
    if(err)
    {
      console.log("unable to connect to the server",err);
    }else{
      console.log('Connected to the server');
      var dbo=db.db("euphonydb");
      var collection=dbo.collection('users');
      collection.findOne({User:req.body.email,Pass:req.body.pass},function(err,result){
        if(err){
          console.log("eroor is there",err);
        }
        else if(result==null){
          res.redirect("login");
        }
        else
        {
          console.log(result._id);
          var p=result._id;
          
          loggedin=true;
          USERID=p;
          res.redirect(p);
        }
        db.close();
      });
    }
  })
});

router.get('/signup',function(req,res){
  res.render('signup',{title:'SignUp'});
});

router.post('/SignUp',function(req,res){
  var url='mongodb://127.0.0.1:27017/euphonydb';
  var MongoClient=mongodb.MongoClient;
  MongoClient.connect(url,{ useNewUrlParser:true},function(err,db){
    if(err)
    {
      console.log("Unable to connect to the server ",err);
    }else{
      console.log('Connected to the server');
      var dbo=db.db('euphonydb');
      var collection=dbo.collection('users');
      var user1={User:req.body.email,Pass:req.body.pass};
      collection.insert([user1],function(err,result){
        if(err){
       //   console.log(err);
        }
        else{
          res.redirect("login");
        }
        db.close();
      });
    }
  })
});

router.get('/:id/showalbums/:albid',(req,res)=>{
  if(loggedin===false)
    res.redirect('/login');
  
  var url='mongodb://127.0.0.1:27017/euphonydb';
  var MongoClient=mongodb.MongoClient;
  MongoClient.connect(url,{ useNewUrlParser:true},function(err,db){
  
    if(err)
      throw err;
    else{
      var albid = req.params.albid;
      var id = req.params.id;
      var mysonglist;
      var dbo=db.db('euphonydb');
      var collection=dbo.collection('Songs');
      collection.find({UserId:id,AlbumId:albid}).toArray((err,result)=>{
         if(err)
          throw err;
        else{
          mysonglist = result;
      //    console.log(mysonglist);
          res.render('listsongs',{item:mysonglist,userid:id,albumid:albid});
        } 
      });
    }
    db.close();
  });
});
router.get('/:id/showalbums/:albid/addsong',(req,res)=>{
  if(loggedin===false)
    res.redirect('/login');
  else{
  var url='mongodb://127.0.0.1:27017/euphonydb';
  var MongoClient=mongodb.MongoClient;
  MongoClient.connect(url,{ useNewUrlParser:true},function(err,db){
    var id= req.params.id;
    var albid = req.params.albid;
    var dbo=db.db('euphonydb');
    var collection = dbo.collection('Songs');
    collection.find({}).toArray((err,result)=>{
      //console.log(result);
      var mysonglist  = result;
      res.render('SelectSong',{item:mysonglist,userid:id,albId:albid});
    });
  db.close();
  });
  }
});

function getAlbumnamefromAlbumid(Albumid) {
  var url='mongodb://127.0.0.1:27017/euphonydb';
  var MongoClient=mongodb.MongoClient;
  MongoClient.connect(url,{ useNewUrlParser:true},function(err,db){
  
    var dbo=db.db('euphonydb');
    
    db.close();
  });
}


var NewSong=null;

function fun(newsong) {
  var MongoClient=mongodb.MongoClient;
  MongoClient.connect(url,{ useNewUrlParser:true},function(err,db){
    var dbo=db.db('euphonydb');
    dbo.collection('Songs').insertOne(newsong,function(err,res){
      if(err )
        throw  err;
      else{
        console.log('inserted');
      }
    });
  });
}
router.get('/:id/showalbums/:albid/addsong/:oid',(req,res)=>{
  if(loggedin===false)
  res.redirect('/login');

  var url='mongodb://127.0.0.1:27017/euphonydb';
  var MongoClient=mongodb.MongoClient;
  var id= req.params.id;
  var albid = req.params.albid;
  var objid = req.params.oid;
  console.log('User id is '+id);
  console.log('Album id is '+albid);
  console.log('Song id is '+objid);
  var song;
    var albuminfo;
    var songname;
    var artist;
    var albumname;
    var songid;
    var albumid;
    var newsong;
    var userid;
    var encpt;
  var url='mongodb://127.0.0.1:27017/euphonydb';
  var MongoClient=mongodb.MongoClient;
  MongoClient.connect(url,{ useNewUrlParser:true},function(err,db){
    var dbo=db.db('euphonydb');
    
    console.log('mongo connected');
    console.log(objid);
    dbo.collection('Songs').findOne({ _id : ObjectId(objid)},(err,result1)=>{
      if(err) 
        throw err;
      else{
        console.log('no error');
        song = result1;
        songname = song.SongName;
        artist = song.Artist;
        songid = song.SongId;
        encpt = song.encrypt;
        console.log('Songname in else is ' +songname);
      }
      console.log('Songname us '+songname); 
      dbo.collection('Albums').findOne({ _id : ObjectId(albid)},(err,result)=>{
       if(err)
          throw err;
       else{
          console.log('inside albums');  
          albuminfo= result;
          albumname = albuminfo.albumname;
          userid = albuminfo.userid;
          albumid = albid;
          console.log('albumid:'+ albumid);
          
          console.log(result);
            newsong = {
            SongName : songname,
            AlbumName: albumname,
            Artist: artist,
            SongId: songid,
            AlbumId: albumid,
            UserId: userid,
            encrypt: encpt
          }
          console.log('newsong is:');
             NewSong = newsong;
             fun(newsong) ;
             
        }
          console.log('NEWSONG IS '+newsong.SongName); 
          
      }); 
        console.log( 'outside:');
        console.log(newsong);
       
        db.close();
    });
  });
  console.log('hey');
  
    var p ='/' + id + '/showalbums';
 
 res.redirect(p)
});
     
        // dbo.collection('Songs').insertOne(newsong,(err,res)=>{
        //   if(err)
        //     throw err;
        //   else{
        //     console.log('inserted');
        //   }
        // });

router.get('/:id/showallalbums',(req,res)=>{
  if(loggedin===false)
    res.redirect('/login');
  else{
  var user_id=req.params.id
  var MongoClient=mongodb.MongoClient;
    var MongoURI='mongodb://127.0.0.1:27017/euphonydb';  
    MongoClient.connect(MongoURI,{ useNewUrlParser: true },function(err,db){
      if(err){
        console.log('Unable to connect to the server',err);
      }else{
        console.log("Connection established");
        var dbo = db.db("euphonydb");
        dbo.collection('Albums').find({}).toArray(function(err,result){
            if(err){
              res.send(err);
            }else {
  //            console.log(result);
              res.render('showallalbums',{albumlist:result,usersid:user_id,userid:USERID});
            }
            db.close();
        });
      }
    });
  }
});

router.get('/:id/showallalbums/:albid',(req,res)=>{
  if(loggedin===false)
    res.redirect('/login');
  else{
  var url='mongodb://127.0.0.1:27017/euphonydb';
  var MongoClient=mongodb.MongoClient;
  MongoClient.connect(url,{ useNewUrlParser:true},function(err,db){
  
    if(err)
      throw err;
    else{
      var albid = req.params.albid;
      var id = req.params.id;
      var mysonglist;
      var dbo=db.db('euphonydb');
      var collection=dbo.collection('Songs');
      collection.find({AlbumId:albid}).toArray((err,result)=>{
         if(err)
          throw err;
        else{
          mysonglist = result;
      //    console.log(mysonglist);
          res.render('ListOthersAlbumSong',{item:mysonglist,userid:id,albumid:albid});
        } 
      });
    }
    db.close();
  });
}
});

router.get('/:id/showusers',(req,res)=>{
  if(loggedin===false)
  res.redirect('/login');

  var id = req.params.id;
  var url='mongodb://127.0.0.1:27017/euphonydb';
  var MongoClient=mongodb.MongoClient;
  MongoClient.connect(url,{ useNewUrlParser:true},function(err,db){
    
    if(err)
      throw err;
    else{
      var dbo = db.db('euphonydb');
      dbo.collection('users').find({ _id : { $ne : ObjectId(id)}}).toArray((err,result)=>{
        if(err)
          throw err;
        else{

          console.log(result);
          var userslist = result;
          console.log('Userslist is:');
          
          console.log(userslist[0].User);
          
          res.render('showUsers',{Userlist:userslist,usersid:id,userid:USERID}); 
        }
      });
    }
  });
});
router.get('/:id/showusers/:uid',(req,res)=>{
  if(loggedin===false)
  res.redirect('/login');

  var id = req.params.id;
  var uid = req.params.uid;
  var url='mongodb://127.0.0.1:27017/euphonydb';
  var MongoClient=mongodb.MongoClient;
  MongoClient.connect(url,{ useNewUrlParser:true},function(err,db){
    var Songslist;
    var Albumlist;
    var username;
    var Playlist;
    var dbo = db.db('euphonydb');
      
    //Getting SongsList
    dbo.collection('Songs').find({UserId:uid}).toArray(function (err,result) {
      
      if(err)
        throw err;
      else{
        Songslist = result;
        console.log(Songslist);
      }
      dbo.collection('Albums').find({userid:uid}).toArray(function (err,result1) {
        if(err)
          throw err;
        else{
          Albumlist = result1;
          console.log(Albumlist);
        }
        dbo.collection('users').findOne({_id : ObjectId(uid)},function (err,result2) {
          if(err)
            throw err;
          else{
            username = result2.User;
            console.log(username);
            res.render('othersprofile',{AlbumList:Albumlist,SongsList:Songslist,UsersId:id,OthersId:uid,UserName:username,userid:USERID});
          }
        });
      });
    });
  });
});

router.get('/:id/showalbums/:albid/uploadsong', function(req, res){
  console.log('two try');
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<form action="upload/file" method="post" enctype="multipart/form-data">');
  res.write('<input type="text" placeholder="Song Name" name="songname"<br>');
  res.write('<input type="text" placeholder=" Artist Name" name="artistname"<br>');
  res.write('<input type="file" name="filetoupload"><br>');
  res.write('<input type="submit">');
  res.write('</form>');
  return res.end();
});
router.post('/:id/showalbums/:albid/upload/file',function(req,res) {
  var uid= req.param.id;
  var albumid = req.params.albid;
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var oldpath = files.filetoupload.path;
    var writestream = gfs.createWriteStream ({
      filename: fields.songname+'.mp3'
    });
    fs.createReadStream(oldpath).pipe(writestream);
    writestream.on('close', function (file) {     
      console.log(file.filename + 'Written to db');
    });
    res.redirect('..');
  });
});  
router.get('/:id/showalbums/:albid/:songname/:songid',function(req,res){
  patha += '/'+req.params.songname + '.mp3';
  var songid = req.params.songid;
  var songname = req.params.songname;  
  var patha = 'C:/Users/HP/Desktop/netapp/public/';
  patha += songname +'.mp3';
  console.log('try '  + req.params.id+" "+req.params.songname+" "+songid);
  if(songid!='jquery.min.js' )
  {
    var fs_write_stream = fs.createWriteStream(patha);

    var readstream = gfs.createReadStream({
        _id:songid
    });
    readstream.pipe(fs_write_stream);
    fs_write_stream.on('close',function(){
        console.log('File has been written successfully');
    });
    res.render('play',{SongName:songname});
  }
});
router.get('/:id/showalbums/:albid/:songname/:songid/download',function(req,res){
  var songid = req.params.songid;
  var songname = req.params.songname;
  var albid = req.params.albid;
  patha += '/'+songname + '.mp3';
  console.log(patha);
  var fs_write_stream = fs.createWriteStream(patha);

    var readstream = gfs.createReadStream({
        _id:songid
    });
    readstream.pipe(fs_write_stream);
    fs_write_stream.on('close',function(){
        console.log('File has been written successfully');
    });
    
});     
module.exports = router;
