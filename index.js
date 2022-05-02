const express = require('express');
const app = express();
const ejs = require('ejs');
const admin = require('firebase-admin');
const Math = require('mathjs');



var serviceAccount = require("./private_key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),/*
  credential:admin.credential.applicationDefault(),*/
  databaseURL: "https://nepravidelne-slovesa-default-rtdb.europe-west1.firebasedatabase.app"
});
const db = admin.database();



app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', function(req, res){/*
    var verbs;
    db.ref('/verbs/').on('value', function(data){
        verbs = data.val();
        res.render('home', {title: 'Home', verb: '', verbs: verbs})
    })*/
    db.ref('/verbs_official/').get().then((data) => {
        if (data.exists()){
            verbs = data.val();
            res.render('home', {title: 'Home', verb: '', verbs: verbs})
        } else {
            console.log('Data dont exist')
        }
    }).catch((error) => {
        console.log('EROOOOOOOOOOOOOOOOOOOOOOR: '+error)
    })
})
app.get('/home', function(req, res){
    db.ref('/verbs_official/').get().then((data) => {
        if (data.exists()){
            verbs = data.val();
            res.render('home', {title: 'Home', verb: '', verbs: verbs})
        } else {
            console.log('Data dont exist')
        }
    }).catch((error) => {
        console.log(error)
    })
})
app.get('/results', (req, res) => {
    res.render('results', {title: 'Results'})
})
app.post('/add_new_verb', function(req, res){
    
    var body = req.body;
    var inf = body.inf;
    var pra = body.pra;
    var prat = body.prat;
    var perf = body.perf;
    var gebr = body.gebr;
    var uber = body.uber;
    
    var verb = {
        Infinitiv: inf.toLowerCase(),
        Präsens: pra.toLowerCase(),
        Präteritum: prat.toLowerCase(), 
        Perfekt: perf.toLowerCase(), 
        Gebrauch: gebr.toUpperCase(),
        Übersetzung: uber.toLowerCase()
    }
    
    var correct = true;
    /*
    var verbsss;
    
    db.ref('verbs').on('value', function(data){
        verbsss = data.val();
    })*/

    if (inf != '' && pra != '' && prat != '' && perf!='' && gebr!='' && uber!=''){    
        var verbs1;
        db.ref('/verbs_official/'+inf.toString()).set(
            verb
        ).then(       
            db.ref('/verbs_official/').get().then((data) => {
                if (data.exists()){
                    verbs1 = data.val();
                    res.render('home', {title: 'Home', verb: '', verbs: verbs1})
                } else {
                    console.log('Data dont exist')
                }
            }).catch((error) => {
                console.log(error)
            })
        )
    } else {
        var verbss;
        db.ref('/verbs_official/').get().then((data) => {
            if (data.exists()){
                verbss = data.val();
                res.render('home', {title: 'Home', verb: verb, verbs: verbss})
            } else {
                console.log('Data dont exist')
            }
        }).catch((error) => {
            console.log(error)
        })
    }
})

var chosen_all = [];

app.post('/create_new_test', (req, res) => {
    var body = req.body;
    var num_of_qs = Number(body.num_of_q);
    var verbs_for_test;
    db.ref('/verbs_official/').get().then((data) => {
        if (data.exists()){
            verbs_json = data.val();
            verbs_list = [];
            for (var one_verb in  verbs_json){
                verbs_list.push(verbs_json[one_verb])
            }
            var chosen_one;
            var random_one_num;
            var local_keys;
            var local_keys_random;
            chosen_all = [];
            //going through each question
            for (let i = 0; i<num_of_qs; i++) {
                random_one_num = Math.floor(Math.random()*verbs_list.length);
                chosen_one = verbs_list[random_one_num];
                verbs_list.splice(random_one_num, 1);
                chosen_all.push(chosen_one);
            }
            res.render('test', {title: 'Test', for_test: chosen_all})
        } else {
            console.log('Data dont exist')
        }
    }).catch((error) => {
        console.log(error)
    })
    /*
    db.ref('/verbs/').get().then((data) => {
        if (data.exists()){
            verbs_json = data.val();
            verbs_list = [];
            for (var one_verb in  verbs_json){
                verbs_list.push(verbs_json[one_verb])
            }
            var chosen_one_whole;
            var chosen_one;
            var random_one_num;
            var local_keys;
            var local_keys_random;
            var one_known;
            chosen_all = [];
            //going through each question
            for (let i = 0; i<num_of_qs; i++) {
                random_one_num = Math.floor(Math.random()*verbs_list.length);
                chosen_one = verbs_list[random_one_num];
                verbs_list.splice(random_one_num, 1);
                //Choosing one form which will be known
                local_keys = Object.keys(chosen_one);
                local_keys_random = Math.floor(Math.random()*local_keys.length);
                while (local_keys[local_keys_random] == 'Gebrauch' /*|| local_keys[local_keys_random] == 'Infinitiv'*//*){
                    local_keys_random += Math.floor(Math.random()*2);
                }
                one_known = local_keys[local_keys_random];
                chosen_one_whole = {
                    chosen_one: chosen_one,
                    one_known: one_known
                }
                chosen_all.push(chosen_one_whole);
            }
            res.render('test', {title: 'Test', for_test: chosen_all})
        } else {
            console.log('Data dont exist')
        }
    }).catch((error) => {
        console.log(error)
    })*/
})

app.post('/check_test', (req, res) => {
    var body = req.body;
    var answers_keys = Array.from(Object.keys(body));
    var all_ev;
    var corr_ev = 0;
    var ev_list = {};
    for (key of answers_keys){
        var answer_keys = Object.keys(body[key]);
        all_ev = body[key].length*5;
    }
    for (let i = 0; i<all_ev/5; i++){
        ev_list['q'+(i+1).toString()] = {};  
    }
    for (key of answers_keys){
        var current_q = body[key];
        for (let i = 0; i<current_q.length; i++){
            ev_list['q'+(i+1).toString()][key] = current_q[i]
        }
    }
    var ev_list_keys = Array.from(Object.keys(ev_list));
    for (let i = 0; i<chosen_all.length; i++){
        var original = chosen_all[i];
        var to_correct = ev_list[ev_list_keys[i]];
        var to_correct_keys = Array.from(Object.keys(to_correct));
        for (key of to_correct_keys){
            if (original[key].toLowerCase() == to_correct[key].toLowerCase()){
                corr_ev+=1;
            }
        }
    }
    res.render('results', {title: 'Results', correct: corr_ev, total: all_ev}) 
})

//404 page
app.use((req, res) =>{
    res.status(404).render('error', {title: 'Error'})
})

const port = process.env.PORT || 8000;

app.listen(port, ()=>{
    console.log('Listening on port 8000...');
})