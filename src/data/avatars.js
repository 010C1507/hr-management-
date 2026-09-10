// รูปโปรไฟล์สำเร็จรูป (ไฟล์อยู่ใน public/avatars)
export const builtInAvatars = [
  { id: 'man-1', url: '/avatars/man-1.svg', label: 'ผู้ชาย 1' },
  { id: 'man-2', url: '/avatars/man-2.svg', label: 'ผู้ชาย 2' },
  { id: 'woman-1', url: '/avatars/woman-1.svg', label: 'ผู้หญิง 1' },
  { id: 'woman-2', url: '/avatars/woman-2.svg', label: 'ผู้หญิง 2' },
  { id: 'boy-1', url: '/avatars/boy-1.svg', label: 'เด็กชาย' },
  { id: 'girl-1', url: '/avatars/girl-1.svg', label: 'เด็กหญิง' },
  { id: 'baby-1', url: '/avatars/baby-1.svg', label: 'ทารก' },
  { id: 'elder-man-1', url: '/avatars/elder-man-1.svg', label: 'ผู้สูงอายุชาย 1' },
  { id: 'elder-man-2', url: '/avatars/elder-man-2.svg', label: 'ผู้สูงอายุชาย 2' },
  { id: 'elder-man-3', url: '/avatars/elder-man-3.svg', label: 'ผู้สูงอายุชาย 3' },
  { id: 'elder-woman-1', url: '/avatars/elder-woman-1.svg', label: 'ผู้สูงอายุหญิง 1' },
  { id: 'elder-woman-2', url: '/avatars/elder-woman-2.svg', label: 'ผู้สูงอายุหญิง 2' },
  { id: 'elder-woman-3', url: '/avatars/elder-woman-3.svg', label: 'ผู้สูงอายุหญิง 3' },
  { id: 'neutral-1', url: '/avatars/neutral-1.svg', label: 'ทั่วไป' },
]

// ย่อรูปที่ผู้ใช้อัปโหลดให้เป็นสี่เหลี่ยมจัตุรัส 256px เพื่อเก็บเป็น data URL ขนาดเล็ก
export function fileToSquareDataUrl(file, size = 256) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('ไฟล์ที่เลือกไม่ใช่รูปภาพ'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('อ่านไฟล์ไม่สำเร็จ'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('เปิดรูปภาพไม่สำเร็จ'))
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        const scale = Math.max(size / img.width, size / img.height)
        const w = img.width * scale
        const h = img.height * scale
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
