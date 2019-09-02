const Busboy = require('busboy');
const fs = require('fs');

const { videoRepository } = require('../repositories');
const { ResponseSuccess } = require('../helpers/response.helper');
const { queue } = require('../workers');
const convertVideoWorker = require('../workers/convert-video');

class VideoController {
    async uploadVideo(req, res, next) {
        try {
            const busboy = new Busboy({
                headers: req.headers,
                limits: {
                    fileSize: 600 * 1024 * 1024 // 600MB
                }
            });

            let pathFile = '';
            busboy.on('file', async (fieldName, file, fileName, encoding, mimetype) => {
                try {
                    const validFileName = `upload_${Date.now()}`;
                    pathFile = `uploads/${validFileName}.mp4`;
                    const writeStream = fs.createWriteStream(pathFile);

                    file.on('limit', () => {
                        console.log('OVER_LIMIT_FILE_SIZE');
                        file.pause();
                        busboy.removeAllListeners();
                        fs.unlink(pathFile, function () {
                            return res.status(400).send('UPLOAD_FAILED');
                        });
                    });

                    file.pipe(writeStream).on('finish', () => {
                        convertVideoWorker.create(queue, {
                            path: pathFile
                        });
                        
                        return ResponseSuccess('UPLOAD_SUCCESS', null, res);
                    });
                } catch (error) {
                    busboy.removeAllListeners();
                    next(error);
                }

            });

            busboy.on('error', (err) => {
                busboy.removeAllListeners();
                return next(err);
            });

            req.pipe(busboy);
        } catch (error) {
            next(error);
        }
    }

    async renderQueue(req, res, next) {
        try {
            queue.active((err, ids) => {
                const jobs = ids.map(id => id);
                return res.render('ejs/index', { jobs });
            })
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new VideoController();
