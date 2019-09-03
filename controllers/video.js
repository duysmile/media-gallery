const Busboy = require('busboy');
const fs = require('fs');
const uuidV1 = require('uuid/v1');

const { ResponseSuccess } = require('../helpers/response.helper');
const { queue } = require('../workers');
const convertVideoWorker = require('../workers/convert-video');

class VideoController {
    async uploadVideo(req, res, next) {
        try {
            const busboy = new Busboy({
                headers: req.headers,
                limits: {
                    files: 1,
                    fileSize: 600 * 1024 * 1024 // 600MB
                }
            });

            let hasFile = false;
            busboy.on('file', async (_fieldName, file, fileName, _encoding, _mimetype) => {
                try {
                    hasFile = true;
                    const title = fileName.split('.');
                    const videoId = uuidV1();
                    const validFileName = `${title[0]}_${Date.now()}`;
                    const pathFile = `uploads/${validFileName}.mp4`;
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
                            videoId,
                            title: title[0],
                            path: pathFile,
                        });
                        
                        return ResponseSuccess('UPLOAD_SUCCESS', videoId, res);
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

            busboy.on('finish', () => {
                if (!hasFile) {
                    return next(new Error('FILE_NOT_FOUND'));
                }
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

    async showAllVideos(req, res, next) {

    }
}

module.exports = new VideoController();
