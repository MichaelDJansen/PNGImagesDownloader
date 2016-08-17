"use strict";
//Imports
var htmlparser = require("htmlparser2");
var https = require('https');
var fs = require('fs');
var request = require('request');

//class to store directory and download images
module.exports = class PNGImagesDownloader
{
	//Class Constructor
    constructor(dir)
    {
        this.dir = dir;
        this.url = 'https://www.iconfinder.com/iconsets/social-media-2070';
    }

	//Output object details
    toString()
    {
        console.log(this.dir);
        console.log(this.url);
    }
	
	//Function to download images to directory
    downloadPNGs()
    {
		
        var directory = this.dir;
		
		//Get HTML from URL provided
        https.get(this.url, function(response)
        {
            parseResponse(response);
        })

        var parseResponse = function(response)
        {
			//Concatenate site HTML
            var data = "";
            response.on('data', function(chunk)
            {
                data += chunk;
            });
            var count = 0;
            var imgPaths = [];
            response.on('end', function(chunk)
            {
				//Initialize HTMLParser
                var parsedData = new htmlparser.Parser(
                {
                    onattribute: function(name, value)
                    {
						//Check src tags to check if the source image is a .png file
                        if (name === "src" && value.substr(value.length - 3) === "png")
                        {
                            imgPaths.push(value);
                            count++;
                        }
                    },
                    onend: function()
                    {
                        console.log('Downloading...');
                    }
                },
                {
                    decodeEntities: true
                });
                parsedData.write(data);
                parsedData.end();

                var file;
                var fileName;
                var download;

				//Create function to download image
				download = function(uri, filename, callback)
                {
                    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
                };
				
				//Loop to download all images in url to local directory
                for (var i = 0; i < imgPaths.length ; i++)
                {
					//Split to get the last part of the image path(fileName)
                    fileName = imgPaths[i].split('/');
                    file = fs.createWriteStream(directory + "/" + fileName[fileName.length - 1]);
					
                    download(imgPaths[i], directory + "/" + fileName[fileName.length - 1], function(){});
                }
				//Display amount of images as well as the directory downloaded to
				console.log( count + ' png images saved to : ' + directory);
            });
        }
    }
}