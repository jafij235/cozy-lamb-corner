// Lista de palavras proibidas em português
const profanityList = [
  "merda", "bosta", "porra", "caralho", "puta", "putaria", "foda", "foder", "foda-se", "fodase",
  "cu", "buceta", "penis", "piroca", "pênis", "tesão", "tesao", "cacete", "vagina",
  "cuzao", "cuzão", "fdp", "pqp", "inferno", "diabo", "satanas", "satanás",
  "droga", "maconha", "cocaina", "cocaína", "crack", "heroina", "heroína",
  "aborto", "idiota", "cagar", "bunda", "sexo", "pinto", "pau",
  "saco", "bolas", "rola", "baleia"
];

// Mapa de substituições de números por letras
const numberSubstitutions: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '8': 'b',
  '@': 'a',
  '$': 's'
};

// Substitui números e símbolos por letras
function normalizeText(text: string): string {
  let normalized = text.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove acentos
  
  // Substitui números e símbolos por letras correspondentes
  Object.entries(numberSubstitutions).forEach(([num, letter]) => {
    normalized = normalized.replace(new RegExp(num, 'g'), letter);
  });
  
  // Remove todos os caracteres não alfanuméricos para detectar palavras disfarçadas (ex: p.u-t_a)
  normalized = normalized.replace(/[^a-z0-9]/g, '');
  
  return normalized;
}

export function containsProfanity(text: string): boolean {
  const normalizedText = normalizeText(text);
  
  return profanityList.some(word => {
    const normalizedWord = normalizeText(word);
    
    // Verifica se a palavra aparece no texto (com ou sem limites de palavra)
    const regex = new RegExp(normalizedWord, "i");
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
