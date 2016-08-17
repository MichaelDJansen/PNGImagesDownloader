"use strict";
var htmlparser = require("htmlparser2");
var https = require('https');
var fs = require('fs');
var request = require('request');

module.exports = class PNGImagesDownloader
{
    constructor(dir)
    {
        this.dir = dir;
        this.url = 'https://www.iconfinder.com/iconsets/social-media-2070';
    }

    toString()
    {
        console.log(this.dir);
        console.log(this.url);
    }
	
    downloadPNGs()
    {
        var directory = this.dir;
        https.get(this.url, function(response)
        {
            parseResponse(response);
        })

        var parseResponse = function(response)
        {
            var data = "";
            response.on('data', function(chunk)
            {
                data += chunk;
            });
            var count = 0;
            var imgPaths = [];
            response.on('end', function(chunk)
            {
                var parsedData = new htmlparser.Parser(
                {
                    onattribute: function(name, value)
                    {
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

				download = function(uri, filename, callback)
                {
                    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
                };
				
                for (var i = 0; i < imgPaths.length ; i++)
                {
                    fileName = imgPaths[i].split('/');
                    file = fs.createWriteStream(directory + "/" + fileName[fileName.length - 1]);

                    download(imgPaths[i], directory + "/" + fileName[fileName.length - 1], function(){});
                }
				
				console.log( count + ' png images saved to : ' + directory);
            });
        }
    }
}