import fs from 'fs/promises';
import path from 'path';
import  terminalImage from 'terminal-image';
import sharp from 'sharp';

async function displayIcon(iconPath) {
  try {
    // Convert .ico to .png
    const pngBuffer = await sharp(iconPath)
      .png()
      .toBuffer();

    // Display the converted image
    console.log(await terminalImage.buffer(pngBuffer));
  } catch (error) {
    console.error('Error displaying icon:', error);
  }
}

// Usage
displayIcon('/home/krieger/worm-launcher/icons/hardhat32.png');