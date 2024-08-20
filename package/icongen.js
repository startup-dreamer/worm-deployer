import icongen from 'icon-gen';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import terminalImage from 'terminal-image';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, '..', 'icons');

async function generateIcons(inputFileName) {
  const inputPath = path.join(__dirname, inputFileName);
  const outputIconName = path.basename(inputFileName, path.extname(inputFileName)).toLowerCase();

  try {
    // Check if the input file exists
    await fs.access(inputPath);
    
    console.log('Input path:', inputPath);
    console.log('Output path:', outputPath);

    // Ensure the output directory exists
    await fs.mkdir(outputPath, { recursive: true });

    const options = {
      report: true,
      ico: {
        name: `${outputIconName}.ico`,
        sizes: [16, 24, 32, 48, 64, 128, 256]
      },
      icns: {
        name: `${outputIconName}.icns`,
        sizes: [16, 32, 64, 128, 256, 512, 1024]
      },
      favicon: {
        name: outputIconName,
        pngSizes: [32, 57, 72, 96, 120, 128, 144, 152, 195, 228],
        icoSizes: [16, 24, 32, 48, 64]
      }
    };

    const results = await icongen(inputPath, outputPath, options);
    console.log('Icon generation results:', results);

    // Return the path to the generated .ico file
    return path.join(outputPath, `${outputIconName}.ico`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`Error: ${inputFileName} file not found. Make sure it exists in the package directory.`);
    } else {
      console.error('Error generating icons:', err);
    }
    return null;
  }
}

export default generateIcons;

async function logPngInTerminal(pngPath) {
  try {
    const terminalWidth = process.stdout.columns || 80;
    const terminalHeight = process.stdout.rows || 24;
    const maxWidth = Math.min(terminalWidth, 40); // Limit to 40 columns max
    const maxHeight = Math.min(terminalHeight, 20); // Limit to 20 rows max

    console.log(await terminalImage.file(pngPath, {
      width: maxWidth,
      height: maxHeight,
      preserveAspectRatio: true,
      fit: 'cover'
    }));
  } catch (error) {
    console.error('Error displaying PNG in terminal:', error);
  }
}

async function main() {
  // const iconPath = await generateIcons('Hardhat.svg');
  // if (iconPath) {
    // Assuming the PNG file is in the same directory as the ICO file
    // const pngPath = iconPath.replace('.ico', '-32x32.png');
    await logPngInTerminal("/home/krieger/worm-launcher/icons/hardhat228.png");
  // }
}

main();