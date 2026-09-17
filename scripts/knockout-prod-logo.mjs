import sharp from "sharp";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const images = join(root, "public", "images");

async function knockout(input, output, mode) {
  const { data, info } = await sharp(join(images, input))
    .resize(1600, 1600, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (mode === "white-on-black") {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = lum;
    } else {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255 - lum;
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 12 })
    .png({ compressionLevel: 9 })
    .toFile(join(images, output));

  console.log("wrote", output);
}

await knockout("itobe-prod-black.png", "itobe-prod-mark-white.png", "white-on-black");
await knockout("itobe-prod-white.png", "itobe-prod-mark-black.png", "black-on-white");
