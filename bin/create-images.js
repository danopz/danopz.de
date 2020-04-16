#!/usr/bin/env node

const path = require('path');
const sharp = require('sharp');

const bgImg = sharp(path.join(__dirname, '..', 'src', 'bg.jpg')).jpeg({ quality: 30, chromaSubsampling: '4:2:0' });
const profileImg = sharp(path.join(__dirname, '..', 'src', 'me.jpg'));
const imgOutPath = path.join(__dirname, '..', 'public', 'img');

const extractIcon = { left: 850, top: 0, width: 1500, height: 1500 };

profileImg.clone().resize(300, 400).jpeg({ quality: 70 }).toFile(path.join(imgOutPath, 'daniel-opitz.jpg'));
profileImg.clone().extract(extractIcon).resize(200, 200).jpeg({ quality: 50 }).toFile(path.join(imgOutPath, 'daniel-opitz-icon.jpg'));

bgImg.clone().resize(1920).toFile(path.join(imgOutPath, 'bg-1920.jpg'));
bgImg.clone().resize(1200).toFile(path.join(imgOutPath, 'bg-1200.jpg'));
bgImg.clone().resize(992).toFile(path.join(imgOutPath, 'bg-992.jpg'));

bgImg.metadata().then((m) => {
    const extractOptions = {
        left: m.width * 0.1,
        top: m.height * 0.1,
        width: m.width * 0.8,
        height: m.height * 0.8
    };

    bgImg.clone().extract(extractOptions).resize(768).toFile(path.join(imgOutPath, 'bg-768.jpg'));
    bgImg.clone().extract(extractOptions).resize(576).toFile(path.join(imgOutPath, 'bg-576.jpg'));
});
