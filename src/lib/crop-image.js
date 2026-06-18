async function createImage(url) {
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.addEventListener('load', () => resolve(img))
      img.addEventListener('error', (err) => reject(err))
      img.src = url
    })
  }

  try {
    const res = await fetch(url, { cache: 'no-cache' })
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`)
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.addEventListener('load', () => {
        URL.revokeObjectURL(objectUrl)
        resolve(img)
      })
      img.addEventListener('error', (err) => {
        URL.revokeObjectURL(objectUrl)
        reject(err)
      })
      img.src = objectUrl
    })
  } catch (error) {
    console.warn('Fetch image failed, falling back to direct load:', error)
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.addEventListener('load', () => resolve(img))
      img.addEventListener('error', (err) => reject(err))
      img.setAttribute('crossOrigin', 'anonymous')
      img.src = url
    })
  }
}

// Strips EXIF orientation by redrawing the image onto a canvas.
// This ensures the canvas sees correctly-oriented pixels regardless of
// how the browser handles the EXIF tag, preventing the "auto-rotate" bug
// on portrait photos taken with smartphones.
export async function normalizeOrientation(imageSrc) {
  const img = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  // naturalWidth/Height in Chrome 88+, Firefox 80+, Safari 15+ already
  // returns the EXIF-corrected dimensions; drawImage also applies EXIF there.
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  canvas.getContext('2d').drawImage(img, 0, 0)
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) { resolve(imageSrc); return }
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      },
      'image/jpeg',
      0.92,
    )
  })
}

export async function getCroppedImg(imageSrc, pixelCrop, options = {}) {
  const image = await createImage(imageSrc)
  const rotation = options.rotation || 0

  // Step 1: draw the full image rotated onto an intermediate canvas
  const rad = (rotation * Math.PI) / 180
  const cos = Math.abs(Math.cos(rad))
  const sin = Math.abs(Math.sin(rad))
  const rotW = Math.round(image.width * cos + image.height * sin)
  const rotH = Math.round(image.width * sin + image.height * cos)

  const rotCanvas = document.createElement('canvas')
  rotCanvas.width = rotW
  rotCanvas.height = rotH
  const rotCtx = rotCanvas.getContext('2d')
  rotCtx.translate(rotW / 2, rotH / 2)
  rotCtx.rotate(rad)
  rotCtx.drawImage(image, -image.width / 2, -image.height / 2)

  // Step 2: crop the rotated canvas to the desired output size
  const outW = options.outputWidth || Math.round(pixelCrop.width)
  const outH = options.outputHeight || Math.round(pixelCrop.height)

  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(rotCanvas, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, outW, outH)

  return new Promise((resolve) => {
    const toDataUrl = (blob) => {
      if (!blob) return
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    }
    canvas.toBlob(
      (blob) => { blob ? toDataUrl(blob) : canvas.toBlob(toDataUrl, 'image/jpeg', 0.88) },
      'image/webp',
      0.82,
    )
  })
}
