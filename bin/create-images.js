#!/usr/bin/env node

const path = require('path');
const sharp = require('sharp');

const srcBg = sharp(path.join(__dirname, '..', 'src', 'bg.jpg'));
const srcMe = sharp(path.join(__dirname, '..', 'src', 'me.jpg'));
const imagePath = path.join(__dirname, '..', 'public', 'img');

const bgOptions = { quality: 30, chromaSubsampling: '4:2:0' };
const extractIcon = { left: 850, top: 0, width: 1500, height: 1500 };

srcMe.clone().resize(300, 400).jpeg({ quality: 70 }).toFile(path.join(imagePath, 'daniel-opitz.jpg'));
srcMe.clone().extract(extractIcon).resize(200, 200).jpeg({ quality: 50 }).toFile(path.join(imagePath, 'daniel-opitz-icon.jpg'));

srcBg.clone().resize(1920).jpeg(bgOptions).toFile(path.join(imagePath, 'bg-1920.jpg'));
srcBg.clone().resize(1200).jpeg(bgOptions).toFile(path.join(imagePath, 'bg-1200.jpg'));
srcBg.clone().resize(992).jpeg(bgOptions).toFile(path.join(imagePath, 'bg-992.jpg'));

srcBg.metadata().then(function (m) {
    const extractOptions = {
        left: m.width * 0.1,
        top: m.height * 0.1,
        width: m.width * 0.8,
        height: m.height * 0.8
    };

    srcBg.clone().extract(extractOptions).resize(768).jpeg(bgOptions).toFile(path.join(imagePath, 'bg-768.jpg'));
    srcBg.clone().extract(extractOptions).resize(576).jpeg(bgOptions).toFile(path.join(imagePath, 'bg-576.jpg'));
});
