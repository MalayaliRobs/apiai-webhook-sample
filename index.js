'use strict';

const express = require('express');
const bodyParser = require('body-parser');

var pg = require('pg');
pg.defaults.ssl = true;
var connString = 'postgres://jiadkawgponomn:803cec759efcbd383bbd2ecd4d02de800ba073a90079b23f5b247a878afe85c1@ec2-54-221-212-48.compute-1.amazonaws.com:5432/dei1e9mld85lk9';

const restService = express();
restService.use(bodyParser.json());

var result1 = [];

restService.post('/hook', function (req, res) {

    console.log('hook request');

    try {
        var speech = 'empty speech';

        if (req.body) {
            var requestBody = req.body;

            if (requestBody.result) {
                speech = '';

                if (requestBody.result.action=='search_name')
                {
                	var name=requestBody.result.parameters['given-name'];

                	pg.connect(connString, function(err, client, done) {
					if(err) response.send("Could not connect to DB: " + err);
					client.query("SELECT * FROM ajcestudents WHERE student_name ilike'name%'", function(err, result) {
						done();
						if(err) return response.send(err);
						console.log(result.rows[0].student_name);
					    result1.push(result.rows[0].student_name);
        				console.log(result1[0]);
					    
						
						});
					});
					 

                	if (requestBody.result.fulfillment) 
                	{
                    speech +=result1[0];
                    speech += ' ';
               		}

                	if (requestBody.result.action) 
                	{
                    speech += 'action: ' + requestBody.result.action;
                	}

                }

                
            }
        }

        console.log('result: ', speech);

        return res.json({
            "speech": speech,
            "displayText": speech,
            "source": 'apiai-webhook-sample',
			"data":{
				"slack": {
	    				"text": "Would you like to play a game?",
	    				"attachments": [
			       		 {
			            "text": "Choose a game to play",
			            "fallback": "You are unable to choose a game",
			            "callback_id": "wopr_game",
			            "color": "#3AA3E3",
			            "attachment_type": "default",
			            "actions": [
			                {
			                    "name": "chess",
			                    "text": "Chess",
			                    "type": "button",
			                    "value": "chess"
			                },
			                {
			                    "name": "maze",
			                    "text": "Falken's Maze",
			                    "type": "button",
			                    "value": "maze"
			                },
			                {
			                    "name": "war",
			                    "text": "Thermonuclear War",
			                    "style": "danger",
			                    "type": "button",
			                    "value": "war",
			                    "confirm": {
			                        "title": "Are you sure?",
			                        "text": "Wouldn't you prefer a good game of chess?",
			                        "ok_text": "Yes",
			                        "dismiss_text": "No"
			                      }
			            	    }
			           		 ]
			       		 }
	    		         ]
						}
				 }
			
        });

    } catch (err) {
        console.error("Can't process request", err);

        return res.status(400).json({
            status: {
                code: 400,
                errorType: err.message
            }
        });
    }
});

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});
