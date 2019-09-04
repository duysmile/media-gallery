const hbjs = require('handbrake-js');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { videoRepository } = require('../repositories');

class ConvertVideoWorker {
    process(job, done) {
        const { path, title, videoId } = job.data;
        const convertVideoStream = hbjs.spawn({
            input: path,
            output: `uploads/${title}_${videoId}_480p.mp4`,
            // preset: 'Very Fast 720p30',
            preset: 'Very Fast 480p30',
        });
        convertVideoStream.on('error', err => {
            // invalid user input, no video found etc
            convertVideoStream.removeAllListeners();
            return done(err);
        }).on('progress', progress => {
            console.log(
                'Percent complete: %s, ETA: %s',
                progress.percentComplete,
                progress.eta
            );
        }).on('end', () => {
            const fullPath = `uploads/${title}_${videoId}_480p.mp4`;
            fs.stat(fullPath, (err, stats) => {
                if (err) {
                    return done(err);
                }
                const screenShot = `uploads/${title}_${videoId}_480p.jpeg`;
                const screenShotVideo = new ffmpeg(fullPath);
                const screeShotVideoStream = screenShotVideo.screenshots({
                    count: 1,
                    filename: `${title}_${videoId}_480p.jpeg`,
                    folder: 'uploads',
                    timemarks: ['30'], // number of seconds
                    size: '320x240'
                })

                screeShotVideoStream.on('error', (err) => {
                    screeShotVideoStream.removeAllListeners();
                    return done(err);
                }).on('end', () => {
                    videoRepository.create({
                        videoId,
                        title,
                        screenShot,
                        type: {
                            size: stats.size,
                            url: fullPath,
                            quality: '480p',
                        }
                    }).then(() => {
                        console.log('stored DB successfully');
                        done();
                    }).catch(err => {
                        done(err);
                    });
                });
            });
        });
    }

    create(queue, { videoId, title, path }) {
        const jobConvertVideo = queue.create('convert-video', { path, title, videoId }).save();
        jobConvertVideo
            .attempts(3) // number of retries
            .backoff({
                delay: 60 * 1000,
                type: 'fixed' // also has type exponential
            })
            .removeOnComplete(true)
            .on('complete', () => {
                console.log(`Conversion of file ${path} completed!`);
            })
            .on('failed attempt', (err, doneAttempt) => {
                console.error(`Convert video ${path} failed with error ${err.message}`);
            })
            .on('failed', (err) => {
                console.error(`Convert video ${path} failed with error ${err.message}`);
            });
    }
}

module.exports = new ConvertVideoWorker();
