function initializeVideoControls() {
    const playAfterThisHeight = 200;
    const video = document.querySelector('video');
    const videoControl = document.querySelector('.video-control');

    if (video && videoControl) {
        const handleScroll = () => {
            if (document.documentElement.scrollTop > playAfterThisHeight) {
                video.play();
            } else {
                video.pause();
            }
        };

        document.addEventListener('scroll', handleScroll);

        video.muted = true;
        video.volume = 0.4;

        videoControl.addEventListener('click', () => {
            video.muted = !video.muted;
            videoControl.classList.toggle('mute');
            videoControl.classList.toggle('unmute');
        });
    }
}

document.addEventListener('DOMContentLoaded', initializeVideoControls);