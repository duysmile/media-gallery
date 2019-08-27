const Busboy = require('busboy');
// get file extension
// const fileType = require('file-type');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
// const { promisify } = require('bluebird').Promise;
// TODO: show metadata of video
// const ffprobe = promisify(require('fluent-ffmpeg').ffprobe);

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

            let pathFile = '';
            busboy.on('file', async (fieldName, file, fileName, encoding, mimetype) => {
                try {
                    // const streamFileType = await fileType.stream(file);
                    const validFileName = `upload_${Date.now()}`;
                    // pathFile = `uploads/${validFileName}.${streamFileType.fileType.ext}`;
                    pathFile = `uploads/${validFileName}.mp4`;
                    const writeStream = fs.createWriteStream(pathFile);
                    // const metadataVideo = await ffprobe(streamFileType);
                    // console.log(metadataVideo);
                    file.pipe(writeStream);
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
                try {
                    ffmpeg(pathFile)
                        // set video bitrate
                        .videoBitrate('1024k')
                        // set target codec
                        .videoCodec('libx264')
                        // set aspect ratio
                        .aspect('16:9')
                        // set size in percent
                        // .size('50%')
                        .size('?x720')
                        // set fps
                        .fps(24)
                        // set audio bitrate
                        .audioBitrate('128k')
                        // set audio codec
                        .audioCodec('libmp3lame')
                        // set number of audio channels
                        .audioChannels(2)
                        // set output format to force
                        .format('mp4')
                        // setup event handlers
                        .on('end', function () {
                            console.log('file has been converted succesfully');
                            return ResponseSuccess('UPLOAD_SUCCESS', null, res);
                        })
                        .on('error', function (err) {
                            console.log('an error happened: ' + err.message);
                            next(err);
                        })
                        // save to file
                        .save(`uploads/${Date.now()}.mp4`);
                } catch (error) {
                    console.error(error);
                }

            });

            req.pipe(busboy);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new VideoController();
