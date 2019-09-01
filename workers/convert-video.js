const hbjs = require('handbrake-js');

module.exports = (job, done) => {
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
};
