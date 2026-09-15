import { Jimp } from 'jimp';

async function processImage() {
  try {
    const imgPath = 'C:/Users/rkaml/.gemini/antigravity/brain/596e9784-375a-4b0d-a0cc-ccd760784fbd/boardmeet_logo_dice_1789468202251.jpg';
    const img = await Jimp.read(imgPath);
    
    // The logo box is roughly bounded by 15% margin
    // 1024 * 0.15 = 153.6
    img.crop({ x: 160, y: 160, w: 704, h: 704 });
    
    await img.write('C:/Users/rkaml/.gemini/antigravity/brain/596e9784-375a-4b0d-a0cc-ccd760784fbd/boardmeet_logo_dice_transparent.png');
    console.log("Cropped to PNG!");
  } catch (err) {
    console.error(err);
  }
}

processImage();
