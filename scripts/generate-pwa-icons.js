const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' }, // Required by Chrome
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }, // Required by Chrome
];

async function generateIcons() {
  const sourceImage = 'public/sunsun.png'; // Using sunsun.png as source
  const outputDir = 'public/icons';

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`🎨 Generating PWA icons from ${sourceImage}...`);

  // Check if source image exists
  if (!fs.existsSync(sourceImage)) {
    console.error(`❌ Source image ${sourceImage} not found!`);
    console.log('Available images in public/:');
    const publicFiles = fs.readdirSync('public/').filter(f => f.match(/\.(png|jpg|jpeg)$/i));
    publicFiles.forEach(file => console.log(`  - ${file}`));
    return;
  }

  try {
    // Get source image info
    const imageInfo = await sharp(sourceImage).metadata();
    console.log(`📷 Source image: ${imageInfo.width}x${imageInfo.height} pixels`);

    // Generate each icon size
    for (const icon of iconSizes) {
      const outputPath = path.join(outputDir, icon.name);
      
      await sharp(sourceImage)
        .resize(icon.size, icon.size, {
          fit: 'cover',
          position: 'center'
        })
        .png({ quality: 90 })
        .toFile(outputPath);
      
      console.log(`✅ Generated ${icon.name} (${icon.size}x${icon.size})`);
    }

    // Also create apple-touch-icon.png (standard 180x180)
    const appleTouchPath = path.join(outputDir, 'apple-touch-icon.png');
    await sharp(sourceImage)
      .resize(180, 180, {
        fit: 'cover', 
        position: 'center'
      })
      .png({ quality: 90 })
      .toFile(appleTouchPath);
    
    console.log(`✅ Generated apple-touch-icon.png (180x180)`);

    // Generate favicon.ico (32x32) in the root public directory  
    const faviconPath = 'public/favicon-generated.ico';
    await sharp(sourceImage)
      .resize(32, 32, {
        fit: 'cover',
        position: 'center'
      })
      .png()
      .toFile(faviconPath);
    
    console.log(`✅ Generated favicon-generated.ico (32x32)`);

    console.log(`\n🎉 Successfully generated ${iconSizes.length + 2} PWA icons!`);
    console.log(`📁 Icons saved to: ${outputDir}/`);
    console.log('\n📝 Next steps:');
    console.log('1. Update your site.webmanifest with the new icons');
    console.log('2. Test your PWA installation in Chrome DevTools');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
  }
}

// Allow running from command line with different source image
if (require.main === module) {
  const sourceArg = process.argv[2];
  if (sourceArg) {
    // Update the source image if provided as argument
    const script = fs.readFileSync(__filename, 'utf8');
    const updatedScript = script.replace(
      /const sourceImage = '[^']+'/,
      `const sourceImage = '${sourceArg}'`
    );
    eval(updatedScript);
  } else {
    generateIcons();
  }
}

module.exports = { generateIcons };