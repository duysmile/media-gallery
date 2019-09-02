const hbjs = require('handbrake-js');

class ConvertVideoWorker {
    process(job, done) {
        hbjs.spawn({
            input: job.data.path,
            output: `uploads/${Date.now()}.mp4`,
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

    create(queue, { path }) {
        const jobConvertVideo = queue.create('convert-video', { path }).save();
        jobConvertVideo
            .attempt(3) // number of retries
            .backoff({
                delay: 60 * 1000,
                type: 'fixed' // also has type exponential
            })
            .removeOnComplete(true)
            .on('complete', () => {
                console.log(`Convert video ${path} completed.`);
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
