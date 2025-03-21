const translitMap: { [key: string]: string } = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
  'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  ' ': '-', '_': '-', ',': '', '.': '', '!': '', '?': '', '"': '', "'": '',
  '(': '', ')': '', '[': '', ']': '', '{': '', '}': '', '\\': '', '/': '',
  '|': '', '`': '', '~': '', '@': '', '#': '', '$': '', '%': '', '^': '',
  '&': '', '*': '', '+': '', '=': '', '<': '', '>': '', ';': '', ':': ''
};

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map(char => translitMap[char] || char)
    .join('')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function saveImage(file: File, slug: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const ext = path.extname(file.name).toLowerCase();
  const fileName = `${slug}${ext}`;
  const publicPath = path.join(process.cwd(), 'public', 'images');
  
  // Создаем директорию, если она не существует
  await fs.mkdir(publicPath, { recursive: true });
  
  const filePath = path.join(publicPath, fileName);
  await fs.writeFile(filePath, buffer);
  
  return `/images/${fileName}`;
}

export async function deleteImage(imageUrl: string) {
  if (!imageUrl) return;
  
  const fileName = path.basename(imageUrl);
  const filePath = path.join(process.cwd(), 'public', 'images', fileName);
  
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
} 