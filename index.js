'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const pg = require('pg');
pg.defaults.ssl = true;
var config = {
  user: 'jiadkawgponomn', //env var: PGUSER 
  database: 'dei1e9mld85lk9', //env var: PGDATABASE 
  password: '803cec759efcbd383bbd2ecd4d02de800ba073a90079b23f5b247a878afe85c1', //env var: PGPASSWORD 
  host: 'ec2-54-221-212-48.compute-1.amazonaws.com', // Server hosting the postgres database 
  port: 5432, //env var: PGPORT 
  max: 10, // max number of clients in the pool 
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed 
};
//var connString = 'postgres://jiadkawgponomn:803cec759efcbd383bbd2ecd4d02de800ba073a90079b23f5b247a878afe85c1@ec2-54-221-212-48.compute-1.amazonaws.com:5432/dei1e9mld85lk9';
var pool = new pg.Pool(config);

const restService = express();
restService.use(bodyParser.json());

restService.post('/hook', function (req, res) {

    console.log('hook request');

    try {
        var speech = 'empty speech';
        var name1='';
        var name2='';
        var count;
        if (req.body) {
            var requestBody = req.body;

            if (requestBody.result) {
                speech = ' ';

                if (requestBody.result.action=='search_name')
                {
                	var i=0;
                	var len=requestBody.result.parameters.givenname.length;
                	var name="";
                	while(i<len)
                	{
                		 name+=requestBody.result.parameters.givenname[i];
                		 name+=' ';
                		 i++;
                	}
                	console.log(name);
                	console.log('Searching:',name);
				 	var search=`SELECT * FROM ajcestudents where student_name ilike '${name}%'`;
					//var countrows=`SELECT COUNT(*) FROM ajcestudents where student_name ilike '${name}%'`;
                	// new pool code
					 pool.connect(function(err, client, done) {
					  if(err) {
					    return console.error('error fetching client from pool', err);
					  }
					  client.query(search, function(err, result) {
					    //call `done()` to release the client back to the pool 
					    done();
					    

					     if (requestBody.result.fulfillment) 
		                	{
		                		if(result.rows.length>1)
		                		{
		                			console.log(result.rows[0].student_name);
					    			console.log(result.rows.length);
					     			name1=result.rows[0].student_name;
		                			speech="Hey we found multiple results for "+name;
		                			speech+=".\nWere you searching for :";
		                			for(count = 0; count < result.rows.length; count++)
		                			{
		                				speech+="\n"+"\t"+"* "+result.rows[count].student_name;
		                			}
		                		}
		                		else if(result.rows.length==1)
		                		{
		                		console.log(result.rows[0].student_name);
					    		console.log(result.rows.length);
					     		name1=result.rows[0].student_name;
			                    speech +=name1;
			                    speech += ' ';
			                    speech +='\n admin no :'+result.rows[0].admission_no;
			                    speech += '\n course : '+result.rows[0].course;
			                    speech += '\n branch  : '+result.rows[0].branch ;
			                    speech += '\n batch   : '+result.rows[0].batch  ;
			                    }
			                    else
			                    {
			                    	speech="Sorry we coudn't find that person in AJCE.";
			                    }
			                    name1='';
		               		}

		                	if (requestBody.result.action) 
		                	{
		                    speech += ' ';

		                    console.log('result: ', speech);
		                	}


					     return res.json({
					            "speech": speech,
					            "displayText": speech,
					            "source": 'apiai-webhook-sample',
								"data":{
									"slack": {
						    				"text": speech,
											}
									 }
								
					        });
					    //output: 1 
					  });
					});
					

                	
                } 

                
            }
        }

        

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
