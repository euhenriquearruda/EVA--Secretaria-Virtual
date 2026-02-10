
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

export const criar_tarefa: FunctionDeclaration = {
  name: "criar_tarefa",
  parameters: {
    type: Type.OBJECT,
    description: "Cria uma tarefa pessoal ou compromisso na agenda do usuário.",
    properties: {
      title: { type: Type.STRING, description: "Título do compromisso." },
      priority: { type: Type.STRING, enum: ["low", "medium", "high"] },
      deadline: { type: Type.STRING, description: "Data OBRIGATORIAMENTE no formato DD/MM/AAAA (ex: 31/12/2024)." },
      time: { type: Type.STRING, description: "Horário (ex: 14:00)." },
      location: { type: Type.STRING, description: "Local do compromisso." }
    },
    required: ["title"]
  }
};

export const delegar_tarefa: FunctionDeclaration = {
  name: "delegar_tarefa",
  parameters: {
    type: Type.OBJECT,
    description: "Distribui trabalho para um integrante específico da equipe.",
    properties: {
      title: { type: Type.STRING, description: "Descrição clara do que deve ser feito." },
      employee_name: { type: Type.STRING, description: "Nome do funcionário que receberá a tarefa." },
      priority: { type: Type.STRING, enum: ["low", "medium", "high"] },
      deadline: { type: Type.STRING, description: "Prazo de entrega OBRIGATORIAMENTE no formato DD/MM/AAAA (ex: 25/05/2025)." },
      time: { type: Type.STRING, description: "Horário específico." },
      location: { type: Type.STRING, description: "Localização se aplicável." }
    },
    required: ["title", "employee_name"]
  }
};

export const SYSTEM_INSTRUCTION = `
Você é a EVA, a Unidade de Inteligência de Comando Alpha.
Sua função principal é atuar como uma Secretária Executiva de elite.

DIRETRIZES DE DATAS (CRÍTICO):
- Você DEVE sempre usar o formato brasileiro DD/MM/AAAA (ex: 20/05/2025) para qualquer menção a datas.
- Nunca use hífens (-) para separar datas, use sempre barras (/).
- Se o usuário disser "hoje", "amanhã" ou datas relativas, calcule a data exata com base no contexto atual e forneça em DD/MM/AAAA.

DIRETRIZES DE DELEGAÇÃO:
- Se o usuário mencionar qualquer nome (ex: "Peça ao João", "Diga para a Maria", "Mande o Pedro"), você DEVE usar a ferramenta 'delegar_tarefa'.
- Compare o nome mencionado com a lista de EQUIPE CADASTRADA abaixo. Use o nome exato da lista se houver correspondência próxima.

EQUIPE CADASTRADA: {TEAM_LIST}

ESTILO DE RESPOSTA:
- Seja ultra-eficiente, executiva e direta. Use termos como "Diretriz processada", "Comando transmitido" ou "Agenda atualizada".
- Lembre o usuário que ele pode ajustar qualquer detalhe manualmente na interface se necessário.
`;

export const getEvaResponse = async (userMessage: string, history: any[] = [], employees: any[] = [], tasks: any[] = []) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const teamList = employees.length > 0 
    ? employees.map(e => `${e.name} (${e.role})`).join(', ') 
    : 'Nenhum funcionário cadastrado no momento.';
    
  const systemWithContext = SYSTEM_INSTRUCTION.replace('{TEAM_LIST}', teamList);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: systemWithContext,
        tools: [{ functionDeclarations: [criar_tarefa, delegar_tarefa] }],
        temperature: 0.1
      },
    });

    return response;
  } catch (error: any) {
    throw error;
  }
};
