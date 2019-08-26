const Busboy = require('busboy');
const fileType = require('file-type');
const fs = require('fs');
const { pipeline } = require('stream');

const { videoRepository } = require('../repositories');
const { ResponseSuccess } = require('../helpers/response.helper');

class VideoController {
    async uploadVideo(req, res, next) {
        try {
            const busboy = new Busboy({
                headers: req.headers,
                limits: {
                    fileSize: '10000000000' // 10GB
                }
            });

            busboy.on('file', async (fieldName, file, fileName, encoding, mimetype) => {
                try {
                    const streamFileType = await fileType.stream(file);
                    const validFileName = `${fileName}-${Date.now()}`;
                    const writeStream = fs.createWriteStream(`uploads/${validFileName}.${streamFileType.fileType.ext}`);
                    streamFileType.pipe(writeStream).on('error', error => {
                        console.error(error);
                        busboy.removeAllListeners();
                        next(error);
                    });    
                } catch (error) {
                    console.error(error);
                    busboy.removeAllListeners();
                    next(error);
                }
                
            });

            busboy.on('error', (err) => {
                console.error(err);
                busboy.removeAllListeners();
                return next(err);
            });

            busboy.on('finish', () => {
                console.log('Uploaded file');
                return ResponseSuccess('UPLOAD_SUCCESS', null, res);
            })

            req.pipe(busboy);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new VideoController();
