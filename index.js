'use strict';

const express = require('express');
const bodyParser = require('body-parser');
var pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://jiadkawgponomn:803cec759efcbd383bbd2ecd4d02de800ba073a90079b23f5b247a878afe85c1@ec2-54-221-212-48.compute-1.amazonaws.com:5432/dei1e9mld85lk9';
const client = new pg.Client(connectionString);
client.connect();

const restService = express();
restService.use(bodyParser.json());

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
                	client.query('SELECT * FROM ajcestudents', function(err, result) 
                 {
				    if (err) {
				        return console.error('error running query', err);
				      }

                	if (requestBody.result.fulfillment) 
                	{
                    speech +=name;
                    speech += ' ';
               		}

                	if (requestBody.result.action) 
                	{
                    speech += 'action: ' + requestBody.result.action;
                	}
                	done();
                  });
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
