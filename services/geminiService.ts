import { GoogleGenAI, Type, FunctionDeclaration, Tool, GenerateContentResponse } from "@google/genai";
import { TriageResult } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Mock Database (Simulating Supabase) ---
const LOCATIONS = [
  { 
    name: "UPA Vila Xavier", 
    address: "R. Mal. Deodoro da Fonseca, 900", 
    contact: "(16) 3305-1500",
    tags: ["saude", "grave", "urgencia", "24h", "fratura", "infarto", "falta de ar"] 
  },
  { 
    name: "UPA Valle Verde", 
    address: "Av. Bercholina Alves Carvalho Conceição", 
    contact: "(16) 3336-3500",
    tags: ["saude", "grave", "urgencia", "24h"] 
  },
  { 
    name: "UPA Central", 
    address: "Via Expressa", 
    contact: "(16) 3334-6900",
    tags: ["saude", "grave", "urgencia", "24h"] 
  },
  { 
    name: "UBS (Unidade Básica de Saúde)", 
    address: "Consultar unidade mais próxima do usuário", 
    contact: "0800-771-7723",
    tags: ["saude", "leve", "vacina", "receita", "curativo", "febre"] 
  },
  { 
    name: "Casa de Acolhida", 
    address: "Av. Sete de Setembro, 678 - Carmo", 
    contact: "(16) 3336-7510",
    tags: ["acolhimento", "pernoite", "itinerante", "24h", "masculino", "feminino"] 
  },
  { 
    name: "Associação São Pio", 
    address: "Av. Santa Catarina, 137 - Jd. Aclimação", 
    contact: "(16) 3331-5999",
    tags: ["acolhimento", "pernoite", "animais", "pet", "feminino", "masculino"] 
  },
  { 
    name: "Sacrário de Amor", 
    address: "Av. Feijó, 69 - Centro", 
    contact: "(16) 3322-4242",
    tags: ["acolhimento", "pernoite", "masculino"] 
  },
  { 
    name: "Centro Pop", 
    address: "Av. Bandeirantes, 1000 - Centro", 
    contact: "(16) 3336-2633",
    tags: ["social", "documentos", "higiene", "diurno", "cafe"] 
  },
  { 
    name: "Organização Bento XVI", 
    address: "Rua Expedicionários do Brasil, 2525", 
    contact: "(16) 3332-6171",
    tags: ["social", "alimentacao", "banho", "diurno"] 
  },
  { 
    name: "CAPS AD", 
    address: "Av. Maria Antônia Camargo de Oliveira, 2921", 
    contact: "(16) 3331-4860",
    tags: ["saude", "mental", "drogas", "alcool", "dependencia"] 
  }
];

// Mock execution of the tool
function executeConsultarRede(args: any) {
  const { demanda, perfil_usuario, gravidade } = args;
  const searchTerms = [demanda, perfil_usuario, gravidade].filter(Boolean).join(" ").toLowerCase();
  
  // Simple scoring algorithm to find best match
  const scored = LOCATIONS.map(loc => {
    let score = 0;
    const locString = (loc.name + " " + loc.tags.join(" ")).toLowerCase();
    
    // Gravidade Logic
    if (gravidade === "grave" && loc.tags.includes("grave")) score += 10;
    if (gravidade === "leve" && loc.tags.includes("leve")) score += 10;
    
    // Specific Demands
    if (searchTerms.includes("animal") || searchTerms.includes("pet")) {
      if (loc.tags.includes("animais")) score += 20; // High priority for pets
    }
    if (searchTerms.includes("document")) {
      if (loc.tags.includes("documentos")) score += 10;
    }
    if (searchTerms.includes("dormir") || searchTerms.includes("pernoite")) {
      if (loc.tags.includes("pernoite")) score += 5;
    }
    if (searchTerms.includes("mulher") || searchTerms.includes("feminina")) {
      if (loc.tags.includes("feminino")) score += 5;
    }
    
    // General keyword match
    if (locString.includes(demanda?.toLowerCase())) score += 2;
    
    return { ...loc, score };
  });

  // Sort by score and take top 3
  const results = scored.sort((a, b) => b.score - a.score).slice(0, 3);
  return results;
}

// Tool Definition
const toolDefinition: Tool = {
  functionDeclarations: [{
    name: "consultar_rede_atendimento",
    description: "Busca locais de atendimento para pessoas em situação de rua em Araraquara com base na demanda, horário e perfil do usuário.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        demanda: {
          type: Type.STRING,
          description: "A necessidade atual (ex: pernoite, alimentação, urgência médica, emissão de documentos)."
        },
        perfil_usuario: {
          type: Type.STRING,
          description: "Perfil da pessoa (ex: homem, mulher com filhos, pessoa com animal de estimação)."
        },
        horario_atual: {
          type: Type.STRING,
          description: "Horário atual no formato HH:mm."
        },
        gravidade: {
          type: Type.STRING,
          enum: ["leve", "moderada", "grave"],
          description: "Nível de urgência da situação de saúde."
        }
      },
      required: ["demanda"]
    }
  }]
};

const SYSTEM_INSTRUCTION = `
Você é o "Navegador de Impacto Araraquara", um assistente de triagem especializado no atendimento à população em situação de rua.

FLUXO DE ATENDIMENTO:
1. Analise o relato do usuário para identificar: Gravidade (Saúde), Demanda Principal e Perfil.
   - GRAVE: Risco de morte, fraturas, dor no peito, falta de ar -> Encaminhar para UPA.
   - LEVE: Febre baixa, curativos, receitas -> Encaminhar para UBS.
   - SOCIAL/PERNOITE: Casa de Acolhida, São Pio (aceita animais), Sacrário, Centro Pop (Docs).
2. Use a ferramenta 'consultar_rede_atendimento' passando os parâmetros identificados.
3. Com o resultado da ferramenta, gere a resposta final em JSON.

IMPORTANTE: 
- Se o usuário mencionar animais/pets, priorize locais que aceitam animais (Associação São Pio).
- Se for saúde grave, priorize UPAs.
`;

const FINAL_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    destination: { type: Type.STRING },
    justification: { type: Type.STRING },
    address_contact: { type: Type.STRING },
    procedures: { type: Type.ARRAY, items: { type: Type.STRING } },
    severity_level: { type: Type.STRING, enum: ["low", "medium", "high"] }
  },
  required: ["destination", "justification", "address_contact", "procedures", "severity_level"],
};

export const analyzeCase = async (report: string): Promise<TriageResult> => {
  try {
    const modelId = "gemini-2.5-flash"; // Stable model for tools

    // Step 1: Send user input and available tools
    const chat = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [toolDefinition],
      }
    });

    let response = await chat.sendMessage({
      message: `Relato do caso: "${report}". Horário atual: ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`
    });

    // Step 2: Handle Function Call loop
    const functionCalls = response.candidates?.[0]?.content?.parts?.filter(p => p.functionCall);
    
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0].functionCall;
      
      if (call && call.name === "consultar_rede_atendimento") {
        console.log("Executando ferramenta:", call.args);
        // Execute mock DB
        const toolResult = executeConsultarRede(call.args);
        
        // Send result back to model
        response = await chat.sendMessage({
          message: [
            {
              functionResponse: {
                name: "consultar_rede_atendimento",
                response: { result: toolResult }
              }
            }
          ]
        });
      }
    }

    // Step 3: Parse final response
    // Sometimes the model returns markdown JSON. We need to be careful.
    // Ideally we would enforce schema on the LAST call, but chat.sendMessage doesn't support changing config mid-chat easily in all SDK versions.
    // However, we can just ask it to be JSON in the system prompt or try to parse the text.
    // Let's force a structured output for the final result if possible, or parse strictly.
    
    let text = response.text || "";
    
    // Clean markdown code blocks if present
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
        return JSON.parse(text) as TriageResult;
    } catch (e) {
        // Fallback: If model didn't output pure JSON, try one more repair step
        const repairResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Converta o seguinte texto em JSON estrito (sem markdown) seguindo este schema: ${JSON.stringify(FINAL_RESPONSE_SCHEMA)}.\nTexto: ${text}`,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(repairResponse.text!) as TriageResult;
    }

  } catch (error) {
    console.error("Erro na triagem:", error);
    throw error;
  }
};