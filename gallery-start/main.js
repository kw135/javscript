const displayedImage = document.querySelector('.displayed-img');
const thumbBar = document.querySelector('.thumb-bar');

const btn = document.querySelector('button');
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
function dark() {
    const btncls = btn.getAttribute('class')
    if (btncls==='dark') {
        btn.setAttribute('class','light');
        btn.textContent = 'lighten';
        overlay.style.backgroundColor = "rgb(0 0 0 / 50%)";
    } else if (btncls==='light') {
        btn.setAttribute('class','dark');
        btn.textContent = 'darken';
        overlay.style.backgroundColor = "rgb(0 0 0 / 0%)";
    }
}

btn.addEventListener('click', dark)