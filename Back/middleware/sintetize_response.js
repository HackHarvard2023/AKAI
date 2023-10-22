import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.OPENAI_API_KEY;
export default async function sintetize_response(messages, metadata,personalidad,perfil) {
  if (!API_KEY) {
    console.log({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return {status: 500, data: {error: {message: "OpenAI API key not configured, please follow instructions in README.md"}}};
  }
  // Validate the input
  if (!messages) {
    return {status: 400, data: {error: {message: "Invalid input, please check the input format."}}};
  }
  try {
  const prompt = generatePrompt(messages,personalidad,metadata,perfil);
  console.log({prompt});
  const completion = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      "model": "gpt-3.5-turbo",
      "messages": prompt
    },
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      }
    }
  );
  console.log({response: completion.data.choices[0].message});
  if (!completion.data.choices[0].message) {
    return {status: 500, data: {error: {message: "No response generated."}}};
  }
  return completion.data.choices[0].message.content;
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      console.log(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      console.log({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generatePrompt(messages,personalidad,metadata,perfil) {
  const prompt = []
  prompt.push(
  {
  "role": "system",
  "content": 
  `
  ${personalidad === "amigable" ? process.env.MAYA_PERSONALIDAD_AMIGABLE : process.env.MAYA_PERSONALIDAD_PROFESIONAL}
  En este momento eres un modelo de MVP, así que no tienes que procesar la información de los usuarios en realidad, inventala.

  Este es el perfil de tu usuario:
  ${perfil}
  
  Vas a recibir una series de mensajes e informacion para responder algo correctamente. 

  La información que te llega es la siguiente:
  ${metadata}

  Da tu respuesta firmemente con datos y hechos. Habla como si hubieras obtenido estos datos de sus estados de cuenta o de la base de datos. Utiliza numeros.
  Habla como si hubieras obtenido estos datos de sus estados de cuenta o de la base de datos. Utiliza numeros.
  Habla como si hubieras obtenido estos datos de sus estados de cuenta o de la base de datos. Utiliza numeros.
  Si te faltan datos, invéntalos.
  `
  });
  messages.forEach((message) => {
      prompt.push({
          "role": message.role,
          "content": message.content
      });
      }
  );
  return prompt;
}