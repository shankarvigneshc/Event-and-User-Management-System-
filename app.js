//jshint esversion:6
//require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const assert = require("assert");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");

const passportLocalMongoose = require("passport-local-mongoose");
//const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const { url } = require("inspector");
//const schedule=require('./public/examples/js/app.js');
//console.log("Got schedule here!");
//console.log(schedule);
const app = express();

app.use(express.static("public"));

//app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true,useUnifiedTopology: true });

mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
  username: String,
  password: String,
  isadmin: String
  
});
const eventSchema = new mongoose.Schema ({
 
  title: String,
  desc: String,
  url: String,
  start: String,
  end: String
 
});
const calSchema = new mongoose.Schema ({
  cal_id: Number,
  cal_name: String,
  color: String
  
});
calSchema.plugin(findOrCreate);
eventSchema.plugin(findOrCreate);
//eventSchema.plugin(passportLocalMongoose);
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const Event = new mongoose.model("Event", eventSchema);
const User = new mongoose.model("User", userSchema);
const Cal=new mongoose.model("Calendar",calSchema);

passport.use(User.createStrategy());
//passport.use(Event.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});


passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
// passport.serializeUser(function(event, done) {
//   done(null, event.id);
// });


// passport.deserializeUser(function(id, done) {
//   Event.findById(id, function(err, event) {
//     done(err, event);
//   });
// });
// const obj =new Event({
//   calendarId: form.calendarId,
//   title: form.title,
//   location: form.location,
//   start: form.start,
//   end: form.end,
//   isAllDay: form.isAllDay,
//   state: form.state,
//   isPrivate: form.isPrivate

// }); 
// obj.save();
// var windowVar;
// var myStorage= window.localStorage;
// var  obj=myStorage.getItem("vOneLocalStorage");


// const sch=new Event({
//   calendarId: Calendar.calendarId,
//   title: Calendar.title,
//   location: Calendar.location,
//   start: Calendar.start,
//   end: Calendar.end,
//   isAllDay: Calendar.isAllDay,
//   state: Calendar.state,
//   isPrivate: Calendar.isPrivate
// });




// sch.save(function(err, doc) {
//        if (err) return console.error(err);
//        console.log("Document inserted succussfully!");
//      });

     



app.get("/", function(req, res){
  res.render("home");
  
});



app.get("/login1", function(req, res){
  res.render("login1");
});

app.get("/login2", function(req, res){
  res.render("login2");
});


app.get("/dlt", function(req, res){
  res.render("dlt");
});

app.get("/registerUser", function(req, res){
  res.render("registerUser");
});

// app.get("/registerEvent", function(req, res){
//   res.render("registerEvent");
// });

app.get("/registerCalendar", function(req, res){
  res.render("registerCalendar");
});



app.get("/admin", function(req, res){
  res.render("admin");
});

app.get("/userpage", function(req, res){
  res.render("dashboard2");
});



app.get("/dashboard1", function(req, res){
  User.find({"dashboard1": {$ne: null}}, function(err, foundUsers){
    if (err){
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("dashboard1");
      }
    }
  });
});
app.get("/dashboard2", function(req, res){
  User.find({"dashboard2": {$ne: null}}, function(err, foundUsers){
    if (err){
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("dashboard2");
      }
    }
  });
});



app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.post("/registerUser", function(req, res){

  User.register({username: req.body.username,isadmin: req.body.isadmin},req.body.password , function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/registerUser");
    } else {
      passport.authenticate("local")(req, res, function(){
        console.log("User created successfully");
        res.redirect("/dashboard2");
      });
    }
  });

});
app.post("/dlt", function(req, res){
     console.log("Deletion process started");
     console.log(event_id);
  // Event.remove(event_id: req.body.event_id , function(err, event){
  //   if (err) {
  //     console.log(err);
  //     res.redirect("/dlt");
  //   } else {
  //     console.log("Event deleted successfully");
  //     res.redirect("/dashboard2");
  //  }
  //   }
  // );
  //    Event.remove({id:req.body.event_id});
  //    console.log("Event deleted successfully");
});
// app.post("/dlt", function(req, res){
//   Event.findOneAndRemove({_id: req.body.event_id}, (err, response) => {
    
//     Event.remove(_id, (err, res) => {
//        if(err)
//        {
//          console.log(err);
//          res.redirect("/dlt")
//        }
//        else
//        {
//          console.log("Event deleted successfully");
//          res.redirect("/dashboard2");
//        }
//     })
// })


// });

app.post("/registerEvent", function(req, res){

  Event.collection.insertOne(req.body, function(err,r) {
    assert.equal(null, err);
   
});
  console.log("Event created successfully!");
  Event.find(function(err,events){
   if(err)
   {
     console.log(err);
   }
   else{
    const fs = require('fs')
    const jsonString = JSON.stringify(events,null,2)
    fs.writeFile("./public/events.json", jsonString, err => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully wrote file')
        }
    })
   }
  });
  res.redirect("/dashboard2");
  

});
app.post("/updateEvent", function(req, res){
 
  Event.findOneAndUpdate({_id:req.body.eidd},{"title": req.body.title,"desc": req.body.desc,"url": req.body.url,"start":req.body.start,"end":req.body.end}, function(err, result){

    if(err){
        res.send(err)
    }
    else{
      Event.find(function(err,events){
        if(err)
        {
          console.log(err);
        }
        else{
         const fs = require('fs')
         const jsonString = JSON.stringify(events,null,2)
         fs.writeFile("./public/events.json", jsonString, err => {
             if (err) {
                 console.log('Error writing file', err)
             } else {
                 console.log('Successfully wrote file')
             }
         })
        }
       });
      res.redirect("/dashboard2");
    
    
    }

});

  
});
app.post("/deleteEvent", function(req, res){
 
      Event.find({ _id: req.body.eid }).remove().exec();
      Event.find(function(err,events){
        if(err)
        {
          console.log(err);
        }
        else{
         const fs = require('fs')
         const jsonString = JSON.stringify(events,null,2)
         fs.writeFile("./public/events.json", jsonString, err => {
             if (err) {
                 console.log('Error writing file', err)
             } else {
                 console.log('Successfully wrote file')
             }
         })
        }
       });
      res.redirect("/dashboard2");
  

});
app.post("/registerCalendar", function(req, res){

   Cal.collection.insertOne(req.body, function(err,r) {
    assert.equal(null, err);
   
});
  console.log("Calendar created successfully!");
  res.redirect("/dashboard2");

});

app.post("/login1", function(req, res, next){
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login1'); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      if(user.isadmin=="true")
      return res.redirect("/dashboard2");
      else
      return res.redirect("/dashboard1");
    });
  })(req, res, next);
  

});








app.listen(3300, function() {
  console.log("Server started on port 3300.");
});

