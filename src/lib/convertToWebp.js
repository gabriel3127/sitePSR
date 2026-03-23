// src/lib/convertToWebp.js
// Converte qualquer imagem para WebP no navegador antes do upload
// Uso: const webpFile = await convertToWebp(file, 0.85)

export async function convertToWebp(file, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight

      const ctx = canvas.getContext("2d")
      ctx.drawImage(img, 0, 0)

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          if (!blob) { reject(new Error("Falha ao converter imagem")); return }
          // cria um File com extensão .webp mantendo o nome original
          const newName = file.name.replace(/\.[^.]+$/, "") + ".webp"
          resolve(new File([blob], newName, { type: "image/webp" }))
        },
        "image/webp",
        quality
      )
    }

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Falha ao carregar imagem")) }
    img.src = url
  })
}