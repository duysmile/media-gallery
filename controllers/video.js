const Busboy = require('busboy');
const fs = require('fs');
const uuidV1 = require('uuid/v1');

const { ResponseSuccess } = require('../helpers/response.helper');
const { queue } = require('../workers');
const convertVideoWorker = require('../workers/convert-video');
const { videoRepository } = require('../repositories');

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

    // async renderQueue(req, res, next) {
    //     try {
    //         queue.active((err, ids) => {
    //             const jobs = ids.map(id => id);
    //             return res.render('ejs/index', { jobs });
    //         })
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    async showAllVideos(req, res, next) {
        try {
            const videos = await videoRepository.getAll({
                sort: '-createdAt',
                fields: 'videoId title screenShot type'
            });

            return ResponseSuccess('GET_VIDEOS_SUCCESS', videos, res);
        } catch (error) {
            next(error);
        }
    }

    async loadVideo(req, res, next) {
        try {
            const { videoId } = req.params;
            const dataVideo = await videoRepository.getOne({
                where: {
                    videoId
                },
                fields: 'type.url'
            });
            const path = dataVideo.type[0].url;
            const stat = fs.statSync(path);
            const fileSize = stat.size;
            const range = req.headers.range;
            if (range) {
                const parts = range.replace(/bytes=/, '').split('-');
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

                const chunkSize = (end - start) + 1;
                const file = fs.createReadStream(path, { start, end });
                const headers = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunkSize,
                    'Content-Type': 'video/mp4'
                };

                res.writeHead(206, headers);
                file.pipe(res);
            } else {
                const headers = {
                    'Content-Type': 'video/mp4',
                    'Content-Length': fileSize
                };

                res.write(200, headers);
                fs.createReadStream(path).pipe(res);
            }
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new VideoController();
