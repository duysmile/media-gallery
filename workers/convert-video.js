const hbjs = require('handbrake-js');
const fs = require('fs');
const { videoRepository } = require('../repositories');

class ConvertVideoWorker {
    process(job, done) {
        const { path, title, videoId } = job.data;
        hbjs.spawn({
            input: path,
            output: `uploads/${title}_${videoId}_480p.mp4`,
            // preset: 'Very Fast 720p30',
            preset: 'Very Fast 480p30',
        })
            .on('error', err => {
                // invalid user input, no video found etc
                console.error(err);
            })
            .on('progress', progress => {
                console.log(
                    'Percent complete: %s, ETA: %s',
                    progress.percentComplete,
                    progress.eta
                )
            })
            .on('end', () => {
                console.log('conversion success');
                done();
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
                console.log(`Convert video ${path} completed.`);
                // TODO: fs stat
                const fullPath = `uploads/${title}_${videoId}_480p.mp4`;
                fs.stat(fullPath, (err, stats) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    videoRepository.create({
                        videoId,
                        title,
                        type: {
                            size: stats.size,
                            url: fullPath,
                            quality: '480p',
                        }
                    }).then(() => {
                        console.log('stored DB successfully');
                    })
                });
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
