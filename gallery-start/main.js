const displayedImage = document.querySelector('.displayed-img');
const thumbBar = document.querySelector('.thumb-bar');
const myh1 = document.querySelector('#myh1')
const btn = document.querySelector('#btn');
const btn1 = document.querySelector('#btn1');
const overlay = document.querySelector('.overlay');

/* Declaring the array of image filenames */
const myImg = ['images/pic1.jpg','images/pic2.jpg','images/pic3.jpg','images/pic4.jpg','images/pic5.jpg']
/* Declaring the alternative text for each image file */
const myAlt = ['eye','grey picture','purple flowers','hieroglify','butterfly on a leaf']
/* Looping through images */
for (let i = 0;i<myImg.length;i++) {
    const newImage = document.createElement('img');
    newImage.setAttribute('src', myImg[i]);
    newImage.setAttribute('alt', myAlt[i]);
    thumbBar.appendChild(newImage);
    newImage.addEventListener('click', e => {
        displayedImage.src = e.target.src;
        displayedImage.alt = e.target.alt;
    });
}

/* Wiring up the Darken/Lighten button */
function toggleDarkOverlay() {
    const btnClass = btn.getAttribute('class')
    if (btnClass==='dark') {
        btn.setAttribute('class','light');
        btn.textContent = 'lighten';
        overlay.style.backgroundColor = "rgb(0 0 0 / 50%)";
    } else if (btnClass==='light') {
        btn.setAttribute('class','dark');
        btn.textContent = 'darken';
        overlay.style.backgroundColor = "rgb(0 0 0 / 0%)";
    }
}

btn.addEventListener('click', toggleDarkOverlay)

function toggleDarkMode() {
    const btnClass = btn1.getAttribute('class')
    if (btnClass==='dmode') {
        btn1.setAttribute('class','lmode');
        myh1.setAttribute('class','lmode');
        btn1.textContent = 'light mode';
        document.body.style.backgroundColor = "#333";
    } else if (btnClass==='lmode') {
        btn1.setAttribute('class','dmode');
        myh1.setAttribute('class','dmode');
        btn1.textContent = 'dark mode';
        document.body.style.backgroundColor = "#fff";
    }
}
btn1.addEventListener('click', toggleDarkMode)