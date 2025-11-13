// Lista de palavras proibidas em português
const profanityList = [
  "merda", "bosta", "porra", "caralho", "puta", "putaria", "foda", "foder",
  "cu", "buceta", "penis", "piroca", "pênis", "tesão", "tesao", "cacete",
  "cuzao", "cuzão", "fdp", "pqp", "inferno", "diabo", "satanas", "satanás",
  "droga", "maconha", "cocaina", "cocaína", "crack", "heroina", "heroína",
];

export function containsProfanity(text: string): boolean {
  const normalizedText = text.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove acentos
  
  return profanityList.some(word => {
    const normalizedWord = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const regex = new RegExp(`\\b${normalizedWord}\\b`, "i");
    return regex.test(normalizedText);
  });
}

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || username.trim().length < 3) {
    return { valid: false, error: "O nome deve ter pelo menos 3 caracteres" };
  }
  
  if (username.length > 20) {
    return { valid: false, error: "O nome deve ter no máximo 20 caracteres" };
  }
  
  if (!/^[a-zA-Z0-9\s]+$/.test(username)) {
    return { valid: false, error: "Use apenas letras, números e espaços" };
  }
  
  if (containsProfanity(username)) {
    return { valid: false, error: "Este nome não é permitido" };
  }
  
  return { valid: true };
}
