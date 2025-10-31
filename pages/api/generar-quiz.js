import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { claves, notas, resumen } = req.body || {};
        console.log('🧩 Datos recibidos:', { claves, notas, resumen });

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'No se encontró la API Key de Gemini' });
        }

        const prompt = `
Genera 5 preguntas de opción múltiple sobre el siguiente contenido de apuntes del método Cornell.
Cada pregunta debe tener 4 opciones (A, B, C, D) y especifica cuál es la correcta.
Usa lenguaje claro y educativo.

Palabras clave: ${claves || 'Ninguna'}
Notas principales: ${notas || 'Ninguna'}
Resumen: ${resumen || 'Ninguno'}

Devuelve SOLO un JSON válido como este:
[
  { "pregunta": "¿Qué es X?", "opciones": ["A", "B", "C", "D"], "correcta": "A" }
]
`;

        // Llamada al SDK
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // o usar otra variante si está disponible
            contents: prompt,
            temperature: 0.7,
            maxOutputTokens: 500,
        });

        const content = response.text || '[]';

        let preguntas = [];
        try {
            preguntas = JSON.parse(content);
        } catch {
            const match = content.match(/\[[\s\S]*\]/);
            if (match) preguntas = JSON.parse(match[0]);
        }

        return res.status(200).json({ preguntas });
    } catch (error) {
        console.error('❌ Error generando quiz:', error);
        return res.status(500).json({ error: 'Error generando el quiz' });
    }
}
